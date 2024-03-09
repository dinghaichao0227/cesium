export const line = (Cesium: any, viewer: any, positions: any) => {
  viewer.entities.add({
    id: 'drawPolyline',
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(positions.flatMap((pos: any) => [pos.lon, pos.lat])),
      show: true,
      material: Cesium.Color.GREEN,
      depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({ // 折线低于地形时用于绘制折线的材料
        color: Cesium.Color.RED
      }),
      width: 5,
      clampToGround: true,
      eyeOffset: new Cesium.Cartesian3(0, 0, -100),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    },
  })
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
