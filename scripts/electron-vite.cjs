const { spawn } = require("node:child_process");
const { join } = require("node:path");

const electronVite = join(
    __dirname,
    "..",
    "node_modules",
    "electron-vite",
    "bin",
    "electron-vite.js"
);
const env = { ...process.env };

// Some Windows development shells set this variable globally. Electron then
// runs as plain Node.js and require("electron").app is unavailable.
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(process.execPath, [electronVite, ...process.argv.slice(2)], {
    cwd: join(__dirname, ".."),
    env,
    stdio: "inherit",
    windowsHide: false,
});

child.on("exit", (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal);
    } else {
        process.exit(code ?? 1);
    }
});
