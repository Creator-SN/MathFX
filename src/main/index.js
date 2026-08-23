import { app, BrowserWindow, clipboard, globalShortcut, ipcMain, Menu, nativeImage, shell, Tray } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import capture from "electron-vue-screen-capture/src/main/modules/screenCapture.js";

const gotSingleInstanceLock = app.requestSingleInstanceLock();
let mainWindow = null;
let tray = null;

function sendScan() {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.send("scan", { source: "tray" });
    mainWindow.show();
}

function registerIpc() {
    ipcMain.on("get-user-data-path", (event) => { event.returnValue = app.getPath("userData"); });
    ipcMain.on("min", () => mainWindow?.minimize());
    ipcMain.on("max", () => {
        if (!mainWindow) return;
        if (mainWindow.isMaximized()) mainWindow.restore();
        else mainWindow.maximize();
    });
    ipcMain.on("close", () => mainWindow?.hide());
    ipcMain.on("show", () => mainWindow?.show());
    ipcMain.on("capture", () => capture.start("minimum"));
    ipcMain.on("clipboard-write-text", (_, text) => clipboard.writeText(text));
    ipcMain.on("clipboard-write-image", (_, dataUrl) => clipboard.writeImage(nativeImage.createFromDataURL(dataUrl)));
    ipcMain.on("getCaptureData", (_, data) => {
        capture.targetWin?.send("getCaptureData", data);
        capture.close("hide");
        setTimeout(() => capture.targetWin?.show(), 300);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        frame: false, width: is.dev ? 800 : 480, height: 600,
        minWidth: 520, minHeight: 580,
        webPreferences: {
            preload: join(__dirname, "../preload/index.js"),
            sandbox: false, nodeIntegration: true, contextIsolation: false,
            webSecurity: false, devTools: true,
        },
    });
    capture.init(mainWindow);
    mainWindow.setMenu(null);
    mainWindow.on("ready-to-show", () => mainWindow.show());
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });
    if (is.dev && process.env.ELECTRON_RENDERER_URL) {
        mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    } else {
        mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
    }
}

function createTray() {
    const icon = app.isPackaged
        ? join(process.resourcesPath, "resources/logo.png")
        : join(process.cwd(), "resources/logo.png");
    tray = new Tray(icon);
    tray.setToolTip("MathFX");
    tray.on("click", () => mainWindow?.show());
    tray.setContextMenu(Menu.buildFromTemplate([
        { label: "Scan", click: sendScan },
        { label: "Main", click: () => mainWindow?.show() },
        { label: "Quit", click: () => app.quit() },
    ]));
}

if (!gotSingleInstanceLock) {
    app.quit();
} else {
    app.whenReady().then(() => {
        electronApp.setAppUserModelId("com.creatorsn.mathfx");
        app.on("browser-window-created", (_, window) => optimizer.watchWindowShortcuts(window));
        registerIpc();
        createWindow();
        createTray();
        globalShortcut.register("CommandOrControl+Shift+L", () => mainWindow?.webContents.toggleDevTools());
        globalShortcut.register(process.platform === "darwin" ? "Alt+Cmd+X" : "Alt+Shift+X", sendScan);
        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    });
    app.on("second-instance", () => {
        mainWindow?.show();
        mainWindow?.focus();
    });
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
