const { app, BrowserWindow } = require ("electron")
// const WinState = require('electron-win-state')

const createWindow = () => {
  // const winState = new WinState({
  //   defaultWidth: 800,
  //   defaultHeight: 600,
  // })
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    // ...WinState.winOptions,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadURL('http://127.0.0.1:5174/#/');
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});