export const ploygon = (Cesium: any, viewer: any, positions: any, configs: any) => {
  if (positions.length < 2) return;
  let config = configs ? configs : {};
  viewer.entities.add({
    name: "线几何对象",
    polygon: {
      height: 0.1,
      hierarchy: Cesium.PolygonHierarchy(positions),
      material: config.color ? new Cesium.Color.fromCssColorString(config.color).withAlpha(.2) : new Cesium.Color.fromCssColorString("#FFD700").withAlpha(.2),
      perPositionHeight: true,
    }
  });
  // return polygonGeometry;
  positions.forEach((item: any, index: any) => {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(item.lon, item.lat),
      point: {
        pixelSize: 5,
        color: Cesium.Color.GREEN,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
    })
  })
}
