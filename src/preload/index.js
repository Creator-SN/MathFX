import { contextBridge, ipcRenderer } from "electron";

const api = {
    platform: process.platform,
    userDataPath: ipcRenderer.sendSync("get-user-data-path"),
    dbGet: (key) => ipcRenderer.sendSync("db-get", key),
    dbSet: (key, value) => {
        const serializableValue = JSON.parse(JSON.stringify(value));
        return ipcRenderer.sendSync("db-set", key, serializableValue);
    },
    minimizeWindow: () => ipcRenderer.send("min"),
    maximizeWindow: () => ipcRenderer.send("max"),
    closeWindow: () => ipcRenderer.send("close"),
    startCapture: () => ipcRenderer.send("capture"),
    onScan: (callback) => {
        const listener = (_, args) => callback(args);
        ipcRenderer.on("scan", listener);
        return () => ipcRenderer.removeListener("scan", listener);
    },
    onCaptureData: (callback) => {
        const listener = (_, data) => callback(data);
        ipcRenderer.on("getCaptureData", listener);
        return () => ipcRenderer.removeListener("getCaptureData", listener);
    },
    onCaptureCancelled: (callback) => {
        const listener = () => callback();
        ipcRenderer.on("captureCancelled", listener);
        return () => ipcRenderer.removeListener("captureCancelled", listener);
    },
    writeText: (text) => ipcRenderer.send("clipboard-write-text", text),
    writeImage: (dataUrl) => ipcRenderer.send("clipboard-write-image", dataUrl),
};

if (process.contextIsolated) {
    contextBridge.exposeInMainWorld("api", api);
} else {
    window.api = api;
}
