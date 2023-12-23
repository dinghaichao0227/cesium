// 创建 Cesium.Viewer 实例
export const polyline = (viewer: any, Cesium: any) => {


  // 后端返回的经纬度数据
  const positions = [
    { lon: 116.39, lat: 39.9 },
    { lon: 117.39, lat: 40.9 },
    { lon: 118.39, lat: 42.9 },
    { lon: 119.39, lat: 43.9 },
    { lon: 120.39, lat: 45.9 },
    { lon: 122.39, lat: 46.9 },
    { lon: 123.39, lat: 47.9 },
    { lon: 127.39, lat: 49.9 },
    { lon: 124.39, lat: 48.9 },
    { lon: 132.39, lat: 50.9 },
    { lon: 130.39, lat: 51.9 },
    { lon: 142.39, lat: 52.9 },
    { lon: 154.39, lat: 53.9 },

    // ... 更多的点
  ];
  // 添加轨迹线
  viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(positions.flatMap(pos => [pos.lon, pos.lat])),
      width: 2,
      material: Cesium.Color.RED,
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
