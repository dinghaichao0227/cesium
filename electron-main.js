// const { app, BrowserWindow } = require ("electron")
// const path = require("node:path");
// // const WinState = require('electron-win-state')

// const createWindow = () => {
//   // const winState = new WinState({
//   //   defaultWidth: 800,
//   //   defaultHeight: 600,
//   // })
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     // ...WinState.winOptions,
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   });

//   // win.loadURL('http://127.0.0.1:5173/#/label'); // 加载本地文件
//   win.loadURL(path.join(__dirname, 'http://127.0.0.1:5173/')); //打包后的文件
//   win.webContents.openDevTools();
// }

// app.whenReady().then(() => {
//   createWindow();

//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//       createWindow();
//     }
//   });
// });





// /** electron/main.ts */

// // import { app, BrowserWindow } from 'electron';
// // import path from 'node:path';

// // const createWindow = () => {
// // 	const win = new BrowserWindow({
// // 		width: 960,
// // 		height: 600,
// // 		webPreferences: {
// // 			nodeIntegration: true, // 设置是否在页面中启用 Node.js 集成模式
// // 			contextIsolation: false, // 设置是否启用上下文隔离模式。
// // 		},
// // 	});

// // 	if (process.env.VITE_DEV_SERVER_URL) {
// // 		win.loadURL(process.env.VITE_DEV_SERVER_URL); // 使用vite开发服务的url路径访问应用
// // 	} else {
// // 		win.loadFile(path.join(__dirname, '../dist/index.html')); // 打包后使用文件路径访问应用
// // 	}
// // };

// // app.whenReady().then(createWindow);


const { app, BrowserWindow, screen, ipcMain } = require ('electron');



var mainWindow;
var subWindow;

function createWindows() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const subScreen = screen.getAllDisplays().find(display => display.bounds.x !== 0 || display.bounds.y !== 0);
  const { width: subScreenWidth, height: subScreenHeight } = subScreen ? subScreen.workAreaSize : { width: 800, height: 600 };

  mainWindow = new BrowserWindow({
    width: screenWidth,
    height: screenHeight,
    x: 0,
    y: 0,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
    },
  });

  subWindow = new BrowserWindow({
    width: subScreenWidth,
    height: subScreenHeight,
    x: subScreen ? subScreen.bounds.x : screenWidth,
    y: subScreen ? subScreen.bounds.y : 0,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  subWindow.loadURL('http://127.0.0.1:5173/#/splitScreen');
  mainWindow.loadURL('http://127.0.0.1:5173/#/map');
  ipcMain.on('sub-data', (event, data) => {
    subWindow.webContents.send('main-data', data);
  });
  // 将窗口句柄传递给渲染进程
  // function getDataFromMainWindow(name, callback) {
  //   ipcMain.once('get-data-success', (_event, error, value) => {
  //     callback(error, value)
  //   });
  //   mainWindow.webContents.send('get-data');
  // }
  // @ts-ignore
  // 主进程相当于一个中间层 做转发
  // ipcMain.on('get-data', event => {
  //   if (mainWindow && mainWindow.webContents) {
  //     getDataFromA(name, (error, value) => {
  //         const contents = event.sender;
  //         if (contents.isDestroyed()) {
  //         return;
  //       }
  //       contents.send('get-success-data', error, value);
  //       });
  //   }
  // });
}

app.on('ready', () => {
  createWindows()
})

// ipcMain.on('data-update', (event, data) => {
//   console.log(`Received data: ${data}`)
//   subWindow.webContents.send('data-update', data)
// })