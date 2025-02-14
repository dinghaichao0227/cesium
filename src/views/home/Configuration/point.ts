export const point = (Cesium: any, viewer: any, positions: any) => {
  positions.forEach((item: any, index: any) => {
    viewer.entities.add({
      id: item.id,
      position: Cesium.Cartesian3.fromDegrees(item.lon, item.lat),
      point: {
        pixelSize: 20,
        color: Cesium.Color.BLACK,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
    })
  })
}
