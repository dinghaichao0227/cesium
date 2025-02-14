// 创建 Cesium.Viewer 实例
export const polylinePoint = (viewer: any, Cesium: any, positions: any, colorS:any) => {



  // 添加轨迹线
  viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(positions.flatMap(pos => [pos.lon, pos.lat])),
      width: 2,
      material: Cesium.Color.fromCssColorString(colorS),
    },

  });
  setTimeout(() => {
    // 添加点
    positions.forEach((position, index) => {
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(position.lon, position.lat),
        point: {
          pixelSize: 5,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
        label: {
          // text: `点${index + 1}`,
          font: '14pt monospace',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -9),
        },
      });
    });

  }, 1000)




}
