export const area = (viewer: any, Cesium: any, positions: any) => {
  viewer.entities.add({
    rectangle: {
      coordinates: new Cesium.CallbackProperty(function () {
        let obj = Cesium.Rectangle.fromCartesianArray(positions.flatMap((pos: any) => [pos.lon, pos.lat]));
        return obj;
      }, false),
      material: Cesium.Color.RED.withAlpha(0.5),
      // height : 0,
      eyeOffset: new Cesium.Cartesian3(0, 0, -100),
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND  // 三维模式绘制时候设置贴地。不然缩放时候点会偏移
    }
  })

}

