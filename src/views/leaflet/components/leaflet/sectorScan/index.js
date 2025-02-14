// @ts-nocheck
export const sectorScan = (option) => {
  let { map } = option
  let radius10 = 200000;

  // 设置扇形的角度范围（单位：度）
  let startAngleDegrees10 = 200;
  let stopAngleDegrees10 = 270; // 90度

  // 创建一个扇形
  let latlngs = calculateSector(
    37.69224227956309,
    121.92799511728634,
    radius10,
    startAngleDegrees10,
    stopAngleDegrees10
  );
  let sector20 = L.polygon(latlngs, { color: 'red' }).addTo(map);

  // 创建一个表示雷达扫描扇形的多边形
  let scanLine = L.polygon(
    [
      [37.69224227956309, 121.92799511728634],
      [37.69224227956309, 121.92799511728634],
      [37.69224227956309, 121.92799511728634],
    ],
    { color: 'green' }
  ).addTo(map);

  // 创建一个雷达扫描的动画 扇形扫描
  let angle10 = 4;
  let direction = 1; // 扫描方向，1为正向，-1为反向
  setInterval(function () {
    // 计算扫描线的新位置
    let lat1 = 37.69224227956309 + (radius10 / 111111) * Math.cos(angle10);
    let lng1 =
      121.92799511728634 + ((radius10 / 111111) * Math.sin(angle10)) / Math.cos((37.69224227956309 * Math.PI) / 180);
    let lat2 = 37.69224227956309 + (radius10 / 111111) * Math.cos(angle10 + Math.PI / 180);
    let lng2 =
      121.92799511728634 +
      ((radius10 / 111111) * Math.sin(angle10 + Math.PI / 180)) / Math.cos((37.69224227956309 * Math.PI) / 180);
    // 更新扫描线的位置
    scanLine.setLatLngs([
      [37.69224227956309, 121.92799511728634],
      [lat1, lng1],
      [lat2, lng2],
    ]);
    // 更新角度
    angle10 += (direction * Math.PI) / 180;
    if (angle10 > (stopAngleDegrees10 * Math.PI) / 180) {
      direction = -1; // 到达扇形的边缘，改变扫描方向
    } else if (angle10 < (startAngleDegrees10 * Math.PI) / 180) {
      direction = 1; // 到达扇形的边缘，改变扫描方向
    }
  }, 10); // 每100毫秒更新一次

  // 计算扇形边缘点的函数
  function calculateSector(centerLat, centerLng, radius10, startAngleDegrees10, stopAngleDegrees10) {
    let latlngs = [[centerLat, centerLng]]; // 扇形的中心点
    for (let i = startAngleDegrees10; i <= stopAngleDegrees10; i += 1) {
      // 将角度转换为弧度
      let angle10 = (i * Math.PI) / 180;
      let lat = centerLat + (radius10 / 111111) * Math.cos(angle10);
      let lng = centerLng + ((radius10 / 111111) * Math.sin(angle10)) / Math.cos((centerLat * Math.PI) / 180);
      latlngs.push([lat, lng]);
    }
    latlngs.push([centerLat, centerLng]); // 扇形的中心点
    return latlngs;
  }
  // 创建一个圆
  let circle100 = L.circle([37.69224227956309, 121.92799511728634], {
    color: 'blue',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500000,
  }).addTo(map);

  // 定义一个运动轨迹
  let route = [
    [36.69224227956309, 110.92799511728634],
    [36.569224227956309, 114.92799511728634],
    [37.69224227956309, 121.92799511728634],
    [38.69224227956309, 101.92799511728634],
    [36.69224227956309, 111.92799511728634],
  ];

  let angle = 0;
  let routeIndex = 0;

  let polygon = L.polygon(
    [
      [36.69224227956309, 110.92799511728634],
      [36.69224227956309, 110.92799511728634],
      [36.69224227956309, 110.92799511728634],
    ],
    { color: 'blue' }
  ).addTo(map);
  route.forEach((item) => {
    console.log(item, 'nextLatLng');
    // 计算扫描扇形的新位置
    let lat1 = item[0] + 4.5 * Math.cos(angle);
    let lng1 = item[1] + 5.7 * Math.sin(angle);
    let lat2 = item[0] + 4.5 * Math.cos(angle + Math.PI / 8);
    let lng2 = item[1] + 5.7 * Math.sin(angle + Math.PI / 8);
    // 更新扫描扇形的位置
    polygon.setLatLngs([item, [lat1, lng1], [lat2, lng2]]);
    // 更新角度
    angle += Math.PI / 180;
  });
}
