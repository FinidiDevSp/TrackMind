"""FastAPI application for managing allowed and banned names.

This API exposes endpoints to read and modify the `allowed_names` and
`banned_names` tables stored in the local SQLite database. It also
provides endpoints for persisting the BAN/UNBAN directory paths in a
JSON file so the frontend can restore the previously selected paths.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import List

import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database" / "logs.db"
CONFIG_PATH = BASE_DIR / "configs" / "ban_paths.json"

app = FastAPI(title="TrackMind Ban API")


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


from typing import Dict

@app.get("/api/allowed")
async def get_allowed() -> Dict[str, List[str]]:
    """Return all allowed names."""
    return {"allowed": fetch_names("allowed_names")}


@app.get("/api/banned")
async def get_banned() -> dict:
    """Return all banned names."""
    return {"banned": fetch_names("banned_names")}


@app.post("/api/ban")
async def ban_name(item: NameItem) -> dict:
    """Move a name from allowed_names to banned_names."""
    move_name("allowed_names", "banned_names", item.name)
    return {"status": "banned", "name": item.name}


@app.post("/api/unban")
async def unban_name(item: NameItem) -> dict:
    """Move a name from banned_names to allowed_names."""
    move_name("banned_names", "allowed_names", item.name)
    return {"status": "unbanned", "name": item.name}


@app.delete("/api/allowed/{name}")
async def delete_allowed(name: str) -> dict:
    """Delete a name from the allowed_names table."""
    delete_name("allowed_names", name)
    return {"status": "deleted", "table": "allowed", "name": name}


@app.delete("/api/banned/{name}")
async def delete_banned(name: str) -> dict:
    """Delete a name from the banned_names table."""
    delete_name("banned_names", name)
    return {"status": "deleted", "table": "banned", "name": name}


@app.post("/api/validate-path")
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


@app.get("/api/paths")
async def get_paths() -> dict:
    """Return the saved BAN and UNBAN paths from the JSON file."""
    return read_paths().model_dump()


@app.post("/api/paths")
async def save_paths(paths: Paths) -> dict:
    """Persist BAN and UNBAN paths to the JSON configuration file."""
    for p in (paths.ban_path, paths.unban_path):
        if p and not is_valid_directory(p):
            raise HTTPException(status_code=400, detail=f"Invalid directory: {p}")
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with CONFIG_PATH.open("w", encoding="utf-8") as fh:
        json.dump(paths.model_dump(), fh, ensure_ascii=False, indent=2)
    return {"status": "saved"}


# The application can be served using: uvicorn backend.api:app --reload
