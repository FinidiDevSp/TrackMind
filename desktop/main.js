// desktop/main.js
const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const kill = require("tree-kill");

let pyProc = null;

function startPython() {
    // Ruta al intérprete de Python del backend (en dev usamos el de la venv)
    const pythonExe =
        process.platform === "win32"
            ? path.join(
                  __dirname,
                  "..",
                  "backend",
                  ".venv",
                  "Scripts",
                  "python.exe"
              )
            : "python";

    // Arrancamos uvicorn
    pyProc = spawn(
        pythonExe,
        ["-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"],
        {
            cwd: path.join(__dirname, "..", "backend"),
            env: { ...process.env },
        }
    );

    pyProc.stdout.on("data", (d) => console.log("[PY]", d.toString()));
    pyProc.stderr.on("data", (d) => console.error("[PY]", d.toString()));
    pyProc.on("exit", (code) => console.log("Python exit code:", code));
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: { nodeIntegration: false, contextIsolation: true },
    });

    // DEV: apuntamos al servidor de Vite
    win.loadURL("http://localhost:5173");

    // Si quieres abrir DevTools:
    // win.webContents.openDevTools()
}

app.whenReady().then(() => {
    startPython();
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
    if (pyProc && pyProc.pid) {
        kill(pyProc.pid);
    }
});
