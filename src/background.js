'use strict'

import { app, protocol, ipcMain, Tray, Menu, BrowserWindow, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
import capture from 'electron-vue-screen-capture/src/main/modules/screenCapture.js'
const isDevelopment = process.env.NODE_ENV !== 'production'


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let win = null;
async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    frame: false,
    width: isDevelopment ? 800 : 480,
    height: 600,
    minWidth: 520,
    minHeight: 580,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      webSecurity: false,
      devTools: true
    }
  })
  // init capture window
  capture.init(win)

  ipcMain.on("min", () => {
    win.minimize();
  });

  ipcMain.on("max", () => {
    if (win.isMaximized())
      win.restore();
    else
      win.maximize();
  });

  ipcMain.on("close", () => {
    win.hide();
    // win.close();
  });

  ipcMain.on("show", () => {
    win.show();
  });

  ipcMain.on("capture", () => {
    capture.start('minimum')
  })

  ipcMain.on('getCaptureData', (e, data) => {
    // console.log(data)
    capture.targetWin.send('getCaptureData',data)
    capture.close('refresh')
    capture.targetWin.show()
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()

  globalShortcut.register('CommandOrControl+Shift+L', () => {
    let focusWin = BrowserWindow.getFocusedWindow()
    focusWin && focusWin.toggleDevTools()
  })

  globalShortcut.register(process.platform === 'darwin' ? 'Alt+Cmd+M' : 'Alt+Shift+M', () => {
    win.show();
  })

  globalShortcut.register(process.platform === 'darwin' ? 'Alt+Cmd+X' : 'Alt+Shift+X', () => {
    win.webContents.send("scan", {
      source: 'tray'
    });
    setTimeout(() => {
      win.show();
    }, 1000);
  })
})

let tray = null
app.whenReady().then(() => {
  tray = new Tray(path.join(__static, './logo.png'));
  tray.on("click", () => {
    win.show();
  });
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Scan',
      click: () => {
        win.webContents.send("scan", {
          source: 'tray'
        });
        setTimeout(() => {
          win.show();
        }, 1000);
      }
    },
    {
      label: 'Main',
      click: () => {
        win.show();
      }
    },
    {
      label: 'Quit', click: () => {
        app.quit();
      }
    }
  ])
  tray.setToolTip('MathFX')
  tray.setContextMenu(contextMenu)
})

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
      win.show()
    }
  })
  // 创建 myWindow, 加载应用的其余部分, etc...
  // app.on('ready', () => {
  // })
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
