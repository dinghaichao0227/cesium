export const sector = (Cesium: any, viewer: any) => {

  // 圆心位置
  let center = Cesium.Cartesian3.fromDegrees(114.0, 43.0);
  // 扇形的起始和终止角度（以度为单位）
  let startAngle = 0;
  let endAngle = -90;
  // 扇形的半径（米）
  let radius = 1000000;
  // 扇形边缘上的点数
  let numberOfPoints = 100;
  // 计算扇形边缘上的点集
  let positions = [center];
  for (let i = 0; i <= numberOfPoints; i++) {
    let angle = Cesium.Math.toRadians(startAngle + ((endAngle - startAngle) * i) / numberOfPoints);
    let x = radius * Math.cos(angle);
    let y = radius * Math.sin(angle);
    let point = new Cesium.Cartesian3(x, y, 0);
    positions.push(Cesium.Cartesian3.add(center, point, new Cesium.Cartesian3()));
  }
  positions.push(center); // 将路径闭合

  // 创建扇形多边形实体
  viewer.entities.add({
    polygon: {
      hierarchy: positions,
      material: Cesium.Color.RED.withAlpha(0.5),
    },
  });

  viewer.zoomTo(viewer.entities);
}
