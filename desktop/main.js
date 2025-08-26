// desktop/main.js
const { app, BrowserWindow, dialog, Menu } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const kill = require("tree-kill");
const http = require("http");
const net = require("net");

let pyProc = null;
let viteProc = null;

const FRONTEND_URL = "http://localhost:5173";
const BACKEND_HOST = "127.0.0.1";
const BACKEND_PORT = 8000;

function fileExists(p) {
    try {
        require("fs").accessSync(p);
        return true;
    } catch {
        return false;
    }
}

function startPython() {
    // Preferimos venv, si existe; si no, caemos a 'python'
    const venvPy = path.join(
        __dirname,
        "..",
        "backend",
        ".venv",
        "Scripts",
        "python.exe"
    );
    const pythonExe =
        process.platform === "win32" && fileExists(venvPy) ? venvPy : "python";

    pyProc = spawn(
        pythonExe,
        [
            "-m",
            "uvicorn",
            "main:app",
            "--host",
            BACKEND_HOST,
            "--port",
            String(BACKEND_PORT),
        ],
        {
            cwd: path.join(__dirname, "..", "backend"),
            env: { ...process.env },
            shell: false,
        }
    );

    pyProc.stdout.on("data", (d) => console.log("[PY]", d.toString().trim()));
    pyProc.stderr.on("data", (d) => console.error("[PY]", d.toString().trim()));
    pyProc.on("exit", (code) => console.log("Python exit code:", code));
}

function startVite() {
    const nodeExe = process.execPath; // el node que usa Electron
    const frontendDir = path.join(__dirname, "..", "frontend");
    const viteBin = path.join(
        frontendDir,
        "node_modules",
        "vite",
        "bin",
        "vite.js"
    );

    if (!fileExists(viteBin)) {
        console.error(
            "[VITE] vite no está instalado. Ejecuta: cd frontend && npm install"
        );
        throw new Error("vite no instalado");
    }

    viteProc = spawn(nodeExe, [viteBin], {
        cwd: frontendDir,
        env: { ...process.env },
        shell: false,
    });

    viteProc.stdout.on("data", (d) =>
        console.log("[VITE]", d.toString().trim())
    );
    viteProc.stderr.on("data", (d) =>
        console.error("[VITE]", d.toString().trim())
    );
    viteProc.on("exit", (code) => console.log("Vite exit code:", code));
}

function waitForHttp(url, { attempts = 40, intervalMs = 250 } = {}) {
    return new Promise((resolve, reject) => {
        let tries = 0;
        const tick = () => {
            tries++;
            const req = http.get(url, (res) => {
                // cualquier 200-399 nos sirve
                if (res.statusCode && res.statusCode < 400) {
                    res.resume();
                    resolve();
                } else {
                    res.resume();
                    tries < attempts
                        ? setTimeout(tick, intervalMs)
                        : reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
            req.on("error", () => {
                tries < attempts
                    ? setTimeout(tick, intervalMs)
                    : reject(new Error("No responde"));
            });
        };
        tick();
    });
}

function waitForTcp(host, port, { attempts = 40, intervalMs = 250 } = {}) {
    return new Promise((resolve, reject) => {
        let tries = 0;
        const tick = () => {
            tries++;
            const socket = new net.Socket();
            socket.setTimeout(1000);
            socket.once("connect", () => {
                socket.destroy();
                resolve();
            });
            socket.once("error", () => {
                socket.destroy();
                tries < attempts
                    ? setTimeout(tick, intervalMs)
                    : reject(new Error("TCP no abre"));
            });
            socket.once("timeout", () => {
                socket.destroy();
                tries < attempts
                    ? setTimeout(tick, intervalMs)
                    : reject(new Error("TCP timeout"));
            });
            socket.connect(port, host);
        };
        tick();
    });
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: { nodeIntegration: false, contextIsolation: true },
    });

    win.loadURL(FRONTEND_URL).catch((err) => {
        console.error("loadURL error:", err);
        dialog.showErrorBox(
            "Error cargando UI",
            `No pude abrir ${FRONTEND_URL}\n${err?.message || err}`
        );
    });

    // win.webContents.openDevTools();
}

app.whenReady().then(async () => {
    Menu.setApplicationMenu(null);
    // 1) Arranca backend + espera puerto
    startPython();
    try {
        await waitForTcp(BACKEND_HOST, BACKEND_PORT, {
            attempts: 60,
            intervalMs: 250,
        });
        console.log("[BOOT] Backend OK");
    } catch (e) {
        console.error("[BOOT] Backend no disponible:", e.message);
        // Seguimos igualmente; la UI puede mostrar error de API, pero al menos abre la ventana
    }

    // 2) Arranca Vite + espera HTTP
    startVite();
    try {
        await waitForHttp(FRONTEND_URL, { attempts: 80, intervalMs: 250 });
        console.log("[BOOT] Frontend OK");
    } catch (e) {
        console.error("[BOOT] Frontend no disponible:", e.message);
        dialog.showErrorBox(
            "Vite no arrancó",
            "No pude conectar con http://localhost:5173.\nRevisa la consola [VITE] para ver el error."
        );
        // Aun así intentamos crear ventana (puede cargar luego si Vite termina de levantar)
    }

    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
    if (pyProc && pyProc.pid) kill(pyProc.pid);
    if (viteProc && viteProc.pid) kill(viteProc.pid);
});
