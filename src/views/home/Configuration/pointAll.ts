export const pointAll = (Cesium: any, viewer: any) => {
  // 控制点
  var controls = [
    Cesium.Cartesian3.fromDegrees(110, 10),
    Cesium.Cartesian3.fromDegrees(111, 11),
    Cesium.Cartesian3.fromDegrees(112, 9),
    Cesium.Cartesian3.fromDegrees(114, 10),
    Cesium.Cartesian3.fromDegrees(130, 10),
  ];

  for (var i = 0; i < controls.length; i++) {
    viewer.entities.add({
      position: controls[i],
      point: {
        color: Cesium.Color.RED,
        pixelSize: 10,
      },
    });
  }
  viewer.zoomTo(viewer.entities);

  // CatmullRomSpline
  var spline = new Cesium.CatmullRomSpline({
    points: controls,
    times: [0.0, 0.25, 0.5, 0.75, 1],
  });

  var positions = [];
  for (var i = 0; i <= 100; i++) {
    var cartesian3 = spline.evaluate(i / 100);
    positions.push(cartesian3);
    viewer.entities.add({
      position: cartesian3,
      point: {
        color: Cesium.Color.BLUE,
        pixelSize: 6,
      },
    });
  }

  // viewer.entities.add({
  //   name: 'CatmullRomSpline',
  //   polyline: {
  //     positions: positions,
  //     width: 3,
  //     material: Cesium.Color.WHITE,
  //   },
  // });

  //   // HermiteSpline
  //   var spline = Cesium.HermiteSpline.createNaturalCubic({
  //     times: [0.0, 0.25, 0.5, 0.75, 1],
  //     points: controls,
  //   });

  //   var positions = [];
  //   for (var i = 0; i <= 100; i++) {
  //     var cartesian3 = spline.evaluate(i / 100);
  //     positions.push(cartesian3);
  //     viewer.entities.add({
  //       position: cartesian3,
  //       point: {
  //         color: Cesium.Color.WHITE,
  //         pixelSize: 6,
  //       },
  //     });
  //   }

  //   viewer.entities.add({
  //     name: 'HermiteSpline',
  //     polyline: {
  //       positions: positions,
  //       width: 3,
  //       material: Cesium.Color.RED,
  //     },
  //   });

  //   // LinearSpline
  //   var spline = new Cesium.LinearSpline({
  //     times: [0.0, 0.25, 0.5, 0.75, 1],
  //     points: controls,
  //   });

  //   var positions = [];
  //   for (var i = 0; i <= 100; i++) {
  //     var cartesian3 = spline.evaluate(i / 100);
  //     positions.push(cartesian3);
  //     viewer.entities.add({
  //       position: cartesian3,
  //       point: {
  //         color: Cesium.Color.YELLOW,
  //         pixelSize: 6,
  //       },
  //     });
  //   }

  //   viewer.entities.add({
  //     name: 'LinearSpline',
  //     polyline: {
  //       positions: positions,
  //       width: 3,
  //       material: Cesium.Color.GREEN,
  //     },
  //   });

}
