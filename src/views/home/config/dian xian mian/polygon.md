
// //加载点1
// var point1 = viewer.entities.add({
//   id: 'point1', // id属性
//   position: Cesium.Cartesian3.fromDegrees(103, 30, 100), // 位置
//   point: {
//     // 点
//     color: new Cesium.Color.fromCssColorString('#3388ff'), // 点颜色
//     pixelSize: 10, // 点大小
//     outlineColor: new Cesium.Color.fromCssColorString('#ffffff'), // 点的外圈线颜色
//     outlineWidth: 2, // 点的外圈线宽度
//     disableDepthTestDistance: Number.POSITIVE_INFINITY, // 被遮挡是否可见（也就是将这个Entity在场景中置顶）
//   },
//   billboard: {
//     image: pinBuilder.fromText('first', Cesium.Color.ROYALBLUE, 48).toDataURL(),
//     verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
//   },
// });
//加载点2,并绘制label文字和billboard广告牌
var point2 = viewer.entities.add({
  id: 'point2', // id属性
  position: Cesium.Cartesian3.fromDegrees(104, 30, 100), // 位置
  point: {
    // 点
    color: new Cesium.Color.fromCssColorString('#ff88ff'), // 点颜色
    pixelSize: 10, // 点大小
    outlineColor: new Cesium.Color.fromCssColorString('#ffffff'), // 点的外圈线颜色
    outlineWidth: 2, // 点的外圈线宽度
    disableDepthTestDistance: Number.POSITIVE_INFINITY, // 被遮挡是否可见（也就是将这个Entity在场景中置顶）
  },
  label: {
    text: '紫色点的label标签',
    font: '16px sans-serif', // 字体大小
    style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 字体样式
    fillColor: new Cesium.Color.fromCssColorString('#ff88ff'), // 字体填充色
    outlineWidth: 1, // 字体外圈线宽度（同样也有颜色可设置）
    outlineColor: new Cesium.Color.fromCssColorString('#ffffff'),
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 垂直位置
    pixelOffset: new Cesium.Cartesian2(0, 15), // 中心位置
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  },
  billboard: {
    image: 'https://leafletjs.com/docs/images/logo-ua.png', //billboard广告牌
    show: true, // default
    pixelOffset: new Cesium.Cartesian2(0, -10), // default: (0, 0)设置图片的偏移，是按屏幕坐标来偏移的
    eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0), // default
    horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // default
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
    scale: 2.0, // default: 1.0
    color: new Cesium.Color.fromCssColorString('#ffffff'), // default: WHITE
    rotation: 0, // default: 0.0
    alignedAxis: Cesium.Cartesian3.ZERO, // default
    width: 200, // default: undefined
    height: 50, // default: undefined
    scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1, 1000000, 0.0), // 按距离缩放，距离大于10000米时，图标不显示
  },
});
//加载点3
var point3 = viewer.entities.add({
  id: 'point3', // id属性
  position: Cesium.Cartesian3.fromDegrees(103.5, 30.5, 100), // 位置
  point: {
    // 点
    color: new Cesium.Color.fromCssColorString('#00ffff'), // 点颜色
    pixelSize: 10, // 点大小
    outlineColor: new Cesium.Color.fromCssColorString('#ffffff'), // 点的外圈线颜色
    outlineWidth: 2, // 点的外圈线宽度
    disableDepthTestDistance: Number.POSITIVE_INFINITY, // 被遮挡是否可见（也就是将这个Entity在场景中置顶）
  },
});
//加载点4
var point4 = viewer.entities.add({
  id: 'point4', // id属性
  position: Cesium.Cartesian3.fromDegrees(134, 90, 100), // 位置
  point: {
    // 点
    color: new Cesium.Color.fromCssColorString('#00ffff'), // 点颜色
    pixelSize: 10, // 点大小
    outlineColor: new Cesium.Color.fromCssColorString('#ffffff'), // 点的外圈线颜色
    outlineWidth: 2, // 点的外圈线宽度
    disableDepthTestDistance: Number.POSITIVE_INFINITY, // 被遮挡是否可见（也就是将这个Entity在场景中置顶）
  },
});
//加载线条
var line = viewer.entities.add({
  name: 'line', // 线的name属性
  polyline: {
    // 线
    positions: [Cesium.Cartesian3.fromDegrees(103, 30, 100), Cesium.Cartesian3.fromDegrees(134, 90, 100)], // 由点构线
    width: 5.0, // 线的宽度
    material: new Cesium.PolylineGlowMaterialProperty({
      color: new Cesium.Color.fromCssColorString('#ff0000'),
    }), // 线的材质、样式
  },
});
//加载面图形
var polygon = viewer.entities.add({
  polygon: {
    height: 0.1,
    hierarchy: new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArrayHeights([123, 30, 100, 103.5, 30.5, 100, 104, 30, 100, 134, 90, 100])
    ), // 面的顶点坐标集合
    material: new Cesium.Color.fromCssColorString('#FFD700').withAlpha(0.5), // 颜色和透明度
    perPositionHeight: true, // 是否支持坐标高度
  },
});

// 将三维球定位到模型
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(103.5, 30, 200000),
  orientation: {
    heading: Cesium.Math.toRadians(348.4202942851978),
    pitch: Cesium.Math.toRadians(-89.74026687972041),
    roll: Cesium.Math.toRadians(0),
  },
  complete: function callback() {
    // 定位完成之后的回调函数
  },
});
