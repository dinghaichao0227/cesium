//  广告牌添加
export const billboard = (Cesium: any, viewer: any, positions: any) => {
  console.log(positions, '----');

  // positions.forEach((item: any, index: any) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(125.122717, 44.028762, 10),
    billboard: {
      image: 'public/start.png',
      scale: 1.5,
      // horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      // verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      // eyeOffset: {
      //   cartesian: [0.0, 0.0, -1.0],
      // },
    },
    label: {
      text: '我是广告牌',
      font: '500 30px helvetica',
      scale: 0.5,
      style: Cesium.LabelStyle.FILL,
      fillColor: Cesium.Color.WHILE,
      pixelOffset: new Cesium.Cartesian2(0, -75),
      showBackground: true,
    }
  })
  // })
}
