// desktop/main.js
const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const kill = require("tree-kill");

let pyProc = null;
let viteProc = null;

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

function startVite(onReady) {
    const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
    try {
        viteProc = spawn(npmCmd, ["run", "dev"], {
            cwd: path.join(__dirname, "..", "frontend"),
            env: { ...process.env },
            shell: true,
        });
    } catch (err) {
        console.error("[VITE] failed to start:", err);
        return;
    }

    viteProc.on("error", (err) => console.error("[VITE]", err));

    viteProc.stdout.on("data", (d) => {
        const text = d.toString();
        console.log("[VITE]", text);
        if (onReady && text.includes("Local:")) {
            onReady();
            onReady = null;
        }
    });
    viteProc.stderr.on("data", (d) => console.error("[VITE]", d.toString()));
    viteProc.on("exit", (code) => console.log("Vite exit code:", code));
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
    startVite(() => {
        createWindow();
    });

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
    if (viteProc && viteProc.pid) {
        kill(viteProc.pid);
    }
});
