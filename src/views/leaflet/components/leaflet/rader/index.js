// @ts-nocheck
export const rader = (option) => {
  let { map } = option

  let circle = L.circle([36.69224227956309, 111.92799511728634], {
    color: 'red',
    fillColor: '#fff',
    fillOpacity: 0.5,
    radius: 500000,
  }).addTo(map);

  let marker1 = L.marker([37.69224227956309, 121.92799511728634]).addTo(map);

  // 设置扇形的半径（单位：米）
  let radius = 200000;

  // 设置扇形的角度范围（单位：度）
  let startAngleDegrees = 200;
  let stopAngleDegrees = 270; // 90度

  // 创建一个扇形
  let latlngs2 = calculateSector(
    marker1.getLatLng().lat,
    marker1.getLatLng().lng,
    radius,
    startAngleDegrees,
    stopAngleDegrees
  );
  let sector = L.polygon(latlngs2, { color: 'red' }).addTo(map);

  // 计算扇形边缘点的函数
  function calculateSector(centerLat, centerLng, radius, startAngleDegrees, stopAngleDegrees) {
    let latlngs3 = [[centerLat, centerLng]]; // 扇形的中心点
    for (let i = startAngleDegrees; i <= stopAngleDegrees; i += 1) {
      // 将角度转换为弧度
      let angle = (i * Math.PI) / 180;
      let lat = centerLat + (radius / 111111) * Math.cos(angle);
      let lng = centerLng + ((radius / 111111) * Math.sin(angle)) / Math.cos((centerLat * Math.PI) / 180);
      latlngs3.push([lat, lng]);
    }
    latlngs3.push([centerLat, centerLng]); // 扇形的中心点
    return latlngs3;
  }
}
