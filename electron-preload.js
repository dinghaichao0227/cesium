// 在渲染进程中的 preload.js 文件中
const { ipcRenderer } = require('electron')

let viewer = null

// 监听主进程传递的另一个窗口的句柄
ipcRenderer.on('sub-window', (event, id) => {
  // 在窗口加载完成后初始化 Cesium 场景
  const subWindow = remote.webContents.fromId(id).getOwnerBrowserWindow()
  subWindow.webContents.on('did-finish-load', () => {
    const Cesium = require('cesium/Cesium')
    viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: new Cesium.CesiumTerrainProvider({
        url: "/public/Cesium1.61/Assets/Textures/NaturalEarthII/{z}/{x}/{reverseY}.jpg",
      }),
    })
  })
})

ipcRenderer.on('main-window', (event, id) => {
  // 在窗口加载完成后初始化 Cesium 场景
  const mainWindow = remote.webContents.fromId(id).getOwnerBrowserWindow()
  mainWindow.webContents.on('did-finish-load', () => {
    const Cesium = require('cesium/Cesium')
    viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: new Cesium.CesiumTerrainProvider({
        url: "/public/Cesium1.61/Assets/Textures/NaturalEarthII/{z}/{x}/{reverseY}.jpg",
      }),
    })
  })
})