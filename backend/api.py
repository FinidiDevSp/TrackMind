"""FastAPI application for managing allowed and banned names.

This API exposes endpoints to read and modify the `allowed_names` and
`ban_names` tables stored in the local SQLite database. It also
provides endpoints for persisting the BAN/UNBAN directory paths in a
JSON file so the frontend can restore the previously selected paths.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import List, Dict

import json
import shutil
from fastapi import FastAPI, HTTPException, APIRouter
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database" / "logs.db"
CONFIG_PATH = BASE_DIR / "configs" / "ban_paths.json"

app = FastAPI(title="TrackMind API")
ban_router = APIRouter(prefix="/ban", tags=["ban"])
track_router = APIRouter(prefix="/tracklists", tags=["tracklists"])


@app.get("/api/hello")
async def hello() -> dict[str, str]:
    """Simple endpoint used by the frontend to verify connectivity."""
    return {"message": "OK"}

# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_connection() -> sqlite3.Connection:
    """Return a new SQLite3 connection with safe defaults."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = lambda cursor, row: row[0]
    return conn


def fetch_names(table: str) -> List[str]:
    """Fetch all names from the specified table ordered alphabetically."""
    with get_connection() as conn:
        cursor = conn.execute(f"SELECT name FROM {table} ORDER BY name")
        return list(cursor.fetchall())


def move_name(source: str, dest: str, name: str) -> None:
    """Move a name from source table to destination table."""
    with get_connection() as conn:
        conn.execute(f"DELETE FROM {source} WHERE name = ?", (name,))
        conn.execute(f"INSERT OR IGNORE INTO {dest}(name) VALUES (?)", (name,))
        conn.commit()


def delete_name(table: str, name: str) -> None:
    with get_connection() as conn:
        conn.execute(f"DELETE FROM {table} WHERE name = ?", (name,))
        conn.commit()


def insert_name(table: str, name: str) -> None:
    """Insert a name into the specified table if it doesn't already exist."""
    with get_connection() as conn:
        conn.execute(f"INSERT OR IGNORE INTO {table}(name) VALUES (?)", (name,))
        conn.commit()


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class NameItem(BaseModel):
    name: str


class Paths(BaseModel):
    ban_path: str
    unban_path: str


class PathCheck(BaseModel):
    path: str


class StartRequest(BaseModel):
    ban_unban_active: bool = False


def is_valid_directory(path_str: str) -> bool:
    """Return True if the given path exists and is a directory."""
    try:
        path = Path(path_str)
        return path.exists() and path.is_dir()
    except OSError:
        return False


# ---------------------------------------------------------------------------
# API endpoints
# ---------------------------------------------------------------------------


@ban_router.get("/allowed")
async def get_allowed() -> Dict[str, List[str]]:
    """Return all allowed names."""
    return {"allowed": fetch_names("allowed_names")}


@ban_router.get("/banned")
async def get_banned() -> Dict[str, List[str]]:
    """Return all banned names."""
    return {"banned": fetch_names("ban_names")}


@ban_router.post("/ban")
async def ban_name(item: NameItem) -> dict:
    """Move a name from allowed_names to ban_names."""
    move_name("allowed_names", "ban_names", item.name)
    return {"status": "banned", "name": item.name}


@ban_router.post("/unban")
async def unban_name(item: NameItem) -> dict:
    """Move a name from ban_names to allowed_names."""
    move_name("ban_names", "allowed_names", item.name)
    return {"status": "unbanned", "name": item.name}


@ban_router.delete("/allowed/{name}")
async def delete_allowed(name: str) -> dict:
    """Delete a name from the allowed_names table."""
    delete_name("allowed_names", name)
    return {"status": "deleted", "table": "allowed", "name": name}


@ban_router.delete("/banned/{name}")
async def delete_banned(name: str) -> dict:
    """Delete a name from the ban_names table."""
    delete_name("ban_names", name)
    return {"status": "deleted", "table": "banned", "name": name}


@ban_router.post("/validate-path")
async def validate_path(item: PathCheck) -> dict:
    """Validate that the provided path exists and is a directory."""
    return {"valid": is_valid_directory(item.path)}


# ---------------------------------------------------------------------------
# Configuration file endpoints
# ---------------------------------------------------------------------------


def read_paths() -> Paths:
    if CONFIG_PATH.exists():
        with CONFIG_PATH.open("r", encoding="utf-8") as fh:
            try:
                data = json.load(fh) or {}
            except json.JSONDecodeError:
                data = {}
    else:
        data = {}
    return Paths(ban_path=data.get("ban_path", ""), unban_path=data.get("unban_path", ""))


@ban_router.get("/paths")
async def get_paths() -> dict:
    """Return the saved BAN and UNBAN paths from the JSON file."""
    return read_paths().model_dump()


@ban_router.post("/paths")
async def save_paths(paths: Paths) -> dict:
    """Persist BAN and UNBAN paths to the JSON configuration file."""
    for p in (paths.ban_path, paths.unban_path):
        if p and not is_valid_directory(p):
            raise HTTPException(status_code=400, detail=f"Invalid directory: {p}")
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with CONFIG_PATH.open("w", encoding="utf-8") as fh:
        json.dump(paths.model_dump(), fh, ensure_ascii=False, indent=2)
    return {"status": "saved"}


@track_router.post("/start")
async def start_processing(req: StartRequest) -> dict:
    """Process BAN/UNBAN directories when starting 1001tracklists actions."""
    processed: Dict[str, List[str]] = {"ban": [], "unban": []}
    if req.ban_unban_active:
        paths = read_paths()
        path_mappings = [
            (paths.ban_path, "ban_names", "ban"),
            (paths.unban_path, "allowed_names", "unban"),
        ]
        for base, table, key in path_mappings:
            if base:
                base_path = Path(base)
                if base_path.exists() and base_path.is_dir():
                    for child in base_path.iterdir():
                        if child.is_dir():
                            insert_name(table, child.name)
                            shutil.rmtree(child, ignore_errors=True)
                            processed[key].append(child.name)
    return {"status": "ok", "processed": processed}


app.include_router(ban_router, prefix="/api")
app.include_router(track_router, prefix="/api")


# The application can be served using: uvicorn backend.api:app --reload
