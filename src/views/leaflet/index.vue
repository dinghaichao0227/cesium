<template>
  <div id="map"></div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.animatedmarker/src/AnimatedMarker';

export default {
  name: 'MyMap',
  mounted() {
    let map = L.map('map').setView([36.505, 110.09], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    /**
     * 绘制运动轨迹
     */
    const data = [
      [36.69224227956309, 110.92799511728634],
      [36.569224227956309, 114.92799511728634],
      [37.69224227956309, 121.92799511728634],
      [38.69224227956309, 101.92799511728634],
      [36.69224227956309, 111.92799511728634],
    ];
    const peopleIcon = L.icon({
      iconUrl: 'public/start.png', // 替换为你自己的标记图标路径 './image/img.png'
      iconSize: [25, 41], //图片大小
      iconAnchor: [25, 70], //图片位置
    });
    // setInterval(() => {
    let marker = L.animatedMarker(data, {
      autoStart: true,
      distance: 100, // 运动轨迹的总距离，单位为像素
      interval: 2000, // 每帧之间的时间间隔，单位为毫秒
      icon: peopleIcon,
    }).addTo(map);

    // let line = L.polyline(data, { color: 'red' }).addTo(map);
    // }, 2000);

    /**
     * 雷达
     */
    // 勾画扇形start

    /**
     * 雷达扫描
     */

    let circle = L.circle([36.69224227956309, 111.92799511728634], {
      color: 'red',
      fillColor: '#fff',
      fillOpacity: 0.5,
      radius: 500000,
    }).addTo(map);
    ///////////////////////////////雷达扫描////////////////

    let polygon = L.polygon(
      [
        [36.69224227956309, 111.92799511728634],
        [36.69224227956309, 111.92799511728634],
        [36.69224227956309, 111.92799511728634],
      ],
      { color: 'red' }
    ).addTo(map);

    // 创建一个雷达扫描的动画
    let angle = 0;
    setInterval(function () {
      // 计算扫描扇形的新位置
      let lat1 = 36.69224227956309 + 4.5 * Math.cos(angle);
      let lng1 = 111.92799511728634 + 5.7 * Math.sin(angle);
      let lat2 = 36.69224227956309 + 4.5 * Math.cos(angle + Math.PI / 8);
      let lng2 = 111.92799511728634 + 5.7 * Math.sin(angle + Math.PI / 8);
      // 更新扫描扇形的位置
      polygon.setLatLngs([
        [36.69224227956309, 111.92799511728634],
        [lat1, lng1],
        [lat2, lng2],
      ]);
      // 更新角度
      angle += Math.PI / 180;
    }, 100); // 每100毫秒更新一次

    /////////////////////////////=====///////////////////////

    // let ctx;
    // let deg = 0;
    // let mylayerGroup;
    // function init(type = 'add') {
    //   if (type === 'add') {
    //     deg += 30;
    //   } else {
    //     deg -= 30;
    //   }
    //   console.log(deg);
    //   if (mylayerGroup) {
    //     mylayerGroup.clearLayers();
    //   }

    //   let clon = 111.92799511728634;
    //   let clat = 36.69224227956309;
    //   let points = getPoints([clat, clon], 0.019, 0, 360, 5000);
    //   points[points.length] = points[0];
    //   let layer1 = L.polygon(points, { color: 'rgba(0,0,0,...1)' }).addTo(map);
    //   let points = getPoints([clat, clon], 0.019, 45 + deg, 90 + deg, 50000);
    //   points[points.length] = points[0];
    //   let layer2 = L.polygon(points, { color: 'rgba(0,0,0,.5)', fillColor: '#323030' });
    //   mylayerGroup = L.layerGroup([layer1, layer2]);
    //   map.addLayer(mylayerGroup);
    //   map.flyTo([clat, clon]);
    // }
    // init();

    // function getPoints(center, radius, startAngle, endAngle, pointNum) {
    //   let sin;
    //   let cos;
    //   let x;
    //   let y;
    //   let angle;
    //   let points = new Array();
    //   points.push(center);
    //   for (let i = 0; i <= pointNum; i++) {
    //     angle = startAngle + ((endAngle - startAngle) * i) / pointNum;
    //     sin = Math.sin((angle * Math.PI) / 180);
    //     cos = Math.cos((angle * Math.PI) / 180);
    //     y = center[0] + radius * cos;
    //     x = center[1] + radius * sin;
    //     points[i] = [y, x];
    //   }
    //   let point = points;
    //   point.push(center);
    //   return point;
    // }

    ///////////////////===--/////////////////

    // 设置扇形的半径（单位：米）

    // 绘制一个点

    /////////////////////////绘制坐标点扇形//////////////////

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
    ////////////////====扇形中做扫描====//////////////////

    // 设置扇形的半径（单位：米）
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

    // 创建一个雷达扫描的动画
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
  },
};
</script>

<style scoped>
#map {
  height: 100vh;
}
</style>
