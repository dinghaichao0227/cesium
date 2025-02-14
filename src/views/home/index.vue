<template>
  <div id="mapContainer">
    <div class="lonLat">
      <!-- <lonAndLat :lon="lon" :lat="lat" /> -->
    </div>
    <div id="heatmap" v-show="false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, toRefs, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import lonAndLat from './showLonAndLat/index.vue';
import router from '@/router';
import { polyline } from './config/trajectory/index';
import { pointAll } from './configuration/pointAll';
import { sports } from './configuration/run';
import { point } from './configuration/point';
import { sector } from './configuration/sector';
import { billboard } from './configuration/billboard';
// import { area } from './configuration/area'

import { ploygon } from './configuration/ploygon';
import { graphicals } from './config/ployLine/index';
import { polylinePoint } from './config/point/index';

import moment from 'moment';
import julian from 'julian';
import * as satellite from 'satellite.js';
const tles = [
  {
    name: '18号',
    tle1: '1 58703U 24004D   24011.92382628  .00007880  00000-0  42868-3 0  9995',
    tle2: '2 58703  97.4541 196.1781 0010603 251.8048 108.2030 15.14681513   960',
  },
];

const addCzml = (viewer, tles) => {
  const startTime = new Date('2024-07-11T08:00:00');
  const endTime = new Date('2024-07-11T20:10:00');
  const czml = tles2czml(startTime, endTime, tles);
  console.log(czml, '===');
  console.log(viewer);

  viewer._dataSourceCollection.add(Cesium.CzmlDataSource.load(czml)).then(() => {});
};

const tles2czml = (startTime, endTime, tles) => {
  // 计算起始时间和终止时间相隔的分钟数
  let minsInDuration = (endTime.getTime() - startTime.getTime()) / 6000; //mins
  //设置为开始时间
  let initialTime = moment(startTime.toISOString()).toISOString();
  //设置为结束时间
  endTime = moment(endTime.toISOString()).toISOString();
  // 初始化czml数据，创建场景信息
  let tempCZML = [];
  tempCZML.push({
    id: 'document',
    name: 'CZML Point - Time Dynamic',
    version: '1.0',
    clock: {
      interval: `${initialTime}/${endTime}`,
      multiplier: 1,
      range: 'LOOP_STOP',
      step: 'SYSTEM_CLOCK',
    },
  });
  // 处理每一个sat
  for (let no = 0; no < tles.length; no++) {
    if (!tles[no].name) {
      console.log('请输入第' + no + 1 + '个卫星的名称');
      return;
    }
    if (!tles[no].tle1) {
      console.log('请输入第' + no + 1 + '个卫星的第一个两行数');
      return;
    }
    if (!tles[no].tle2) {
      console.log('请输入第' + no + 1 + '个卫星的第二个两行数');
      return;
    }
    let sat_name = tles[no].name;
    // 保存位置信息
    let res = [];
    let satrec;
    satrec = satellite.twoline2satrec(tles[no].tle1, tles[no].tle2);
    //satrec.no：以弧度/分钟为单位的平均运动，一天有1440分钟，一弧度是0.159155圈
    // to go from RAD/DAY -> REV/DAY: rad * 1440 * 0.159155
    //to go from REV/PER DAY to MINS/REV -> 1440/RevPerDay
    let totalIntervalsInDay = satrec.no * 1440 * 0.159155; //1440 = min && 0.159155 = 1turn
    // 获得运行一圈的分钟数
    let minsPerInterval = 1440 / totalIntervalsInDay; // mins for 1 revolution around earth
    // intervalTime 取起始时间 格式为2008-09-20T12:25:40.104Z
    let intervalTime = moment(startTime.toISOString()).toISOString();

    let leadIntervalArray = [];
    let trailIntervalArray = [];
    console.log('Setting intervals...');
    // 注意：这里之所以要倒过来求leadInterval和trailInterval是因为如果正着求，很有可能在终止时刻卫星并没有运行完一圈，导致轨道只显示一半
    for (let i = minsInDuration; i >= 0; i -= minsPerInterval) {
      if (i <= minsPerInterval) {
        // intial interval
        let currentOrbitalInterval = {
          interval: `${startTime.toISOString()}/${intervalTime}`,
          epoch: `${startTime.toISOString()}`,
          number: [0, minsPerInterval * 60, minsPerInterval * 60, 0],
        };
        let currTrail = {
          interval: `${startTime.toISOString()}/${intervalTime}`,
          epoch: `${startTime.toISOString()}`,
          number: [0, 0, minsPerInterval * 60, minsPerInterval * 60],
        };
        leadIntervalArray.push(currentOrbitalInterval);
        trailIntervalArray.push(currTrail);
      } else {
        //not initial so make intervals
        let previousIntervalTime = moment(intervalTime).add(-minsPerInterval, 'm').toISOString();
        let currentOrbitalInterval = {
          interval: `${previousIntervalTime}/${intervalTime}`,
          epoch: `${previousIntervalTime}`,
          number: [0, minsPerInterval * 60, minsPerInterval * 60, 0],
        };
        let currTrail = {
          interval: `${previousIntervalTime}/${intervalTime}`,
          epoch: `${previousIntervalTime}`,
          number: [0, 0, minsPerInterval * 60, minsPerInterval * 60],
        };
        intervalTime = moment(intervalTime).add(-minsPerInterval, 'm').toISOString();
        leadIntervalArray.push(currentOrbitalInterval);
        trailIntervalArray.push(currTrail);
      }
    }
    // Seconds between current time and epoch time
    let sec = (startTime - julian.toDate(satrec.jdsatepoch)) / 1000;
    console.log(startTime, julian.toDate(satrec.jdsatepoch), sec);
    for (let i = sec; i <= sec + minsInDuration * 60; i++) {
      //每60秒计算一个位置信息，最后采用拉格朗日插值法处理数据
      // 根据当前时间距tle两行数历元时刻的分钟数，计算当前卫星位置和速度
      let positionAndVelocity = satellite.sgp4(satrec, i * 0.0166667); // 0.0166667min = 1sec
      // 地惯坐标系
      let positionEci = positionAndVelocity.position;
      positionEci.x = positionEci.x * 1000;
      positionEci.y = positionEci.y * 1000;
      positionEci.z = positionEci.z * 1000;
      // let velocityEci = positionAndVelocity.velocity;
      // velocityEci.x = velocityEci.x * 1000;
      // velocityEci.y = velocityEci.y * 1000;
      // velocityEci.z = velocityEci.z * 1000;
      res.push(i - sec, positionEci.x, positionEci.y, positionEci.z);
    }
    let initialCZMLProps = {
      id: `${sat_name}`,
      name: `${sat_name}`,
      availability: `${initialTime}/${endTime}`,
      label: {
        fillColor: {
          rgba: [255, 0, 255, 255],
        },
        font: '11pt Lucida Console',
        horizontalOrigin: 'LEFT',
        outlineColor: {
          rgba: [0, 0, 0, 255],
        },
        outlineWidth: 2,
        pixelOffset: {
          cartesian2: [12, 0],
        },
        show: true,
        style: 'FILL_AND_OUTLINE',
        text: `${sat_name}`,
        verticalOrigin: 'CENTER',
      },
      path: {
        show: [
          {
            interval: `${initialTime}/${endTime}`,
            boolean: true,
          },
        ],
        width: 3,
        material: {
          solidColor: {
            color: {
              rgba: [
                // 随机生成轨道颜色
                Math.floor(255 * Math.random(0, 1)),
                Math.floor(255 * Math.random(0, 1)),
                Math.floor(255 * Math.random(0, 1)),
                255,
              ],
            },
          },
        },
        resolution: 120,
        // The time ahead of the animation time, in seconds, to show the path.
        leadTime: leadIntervalArray,
        // The time behind the animation time, in seconds, to show the
        trailTime: trailIntervalArray,
      },
      billboard: {
        image:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADJSURBVDhPnZHRDcMgEEMZjVEYpaNklIzSEfLfD4qNnXAJSFWfhO7w2Zc0Tf9QG2rXrEzSUeZLOGm47WoH95x3Hl3jEgilvDgsOQUTqsNl68ezEwn1vae6lceSEEYvvWNT/Rxc4CXQNGadho1NXoJ+9iaqc2xi2xbt23PJCDIB6TQjOC6Bho/sDy3fBQT8PrVhibU7yBFcEPaRxOoeTwbwByCOYf9VGp1BYI1BA+EeHhmfzKbBoJEQwn1yzUZtyspIQUha85MpkNIXB7GizqDEECsAAAAASUVORK5CYII=',
        scale: 1.5,
        show: true,
      },
      position: {
        // 采用拉格朗日插值法
        interpolationAlgorithm: 'LAGRANGE',
        // 1为线性插值，2为平方插值
        interpolationDegree: 2,
        // 参考坐标系，地惯坐标系
        referenceFrame: 'INERTIAL',
        epoch: `${initialTime}`,
        cartesian: res,
      },
    };
    tempCZML.push(initialCZMLProps);
  }
  return tempCZML;
};

const lon = ref<any>();
const lat = ref<any>();
let psData = ref([]);
// let ps = ref([96.39, 29.9, 137.39, 40, 9, 102, 60, 129.56]);
let pos = ref([]);
let polygonViwer = {};

onMounted(() => {
  let viewer = new Cesium.Viewer('mapContainer', {
    // sceneMode: Cesium.SceneMode.SCENE2D, //首次展示二维

    // google 瓦片贴图
    baseLayer: Cesium.ImageryLayer.fromProviderAsync(
      Cesium.TileMapServiceImageryProvider.fromUrl(Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'))
    ),

    // 普通瓦片贴图
    baseLayer: Cesium.ImageryLayer.fromProviderAsync(
      Cesium.TileMapServiceImageryProvider.fromUrl(Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'))
    ),

    skyBox: false,
    skyAtmosphere: false,
    animation: true,
    timeline: true,
    infoBox: false,
    geocoder: false,
    sceneModePicker: true,
    fullscreenButton: false,
    navigationInstructionsInitiallyVisible: false,
    navigationHelpButton: false,
    homeButton: true,
    baseLayerPicker: false,
    enableCompass: false,
  });

  /** 调整相机视角 */
  viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (e) {
    e.cancel = true;
    //你要飞的位置
    viewer.camera.flyTo({
      destination: Cesium.Rectangle.fromDegrees(80, 16, 135.0, 57.5),
    });
  });
  // let graphical = viewer.entities.add({
  //   position: Cesium.Cartesian3.fromDegrees(-72.0, 25.0),
  //   ellipse: {
  //     semiMinorAxis: 250000.0,
  //     semiMajorAxis: 250000.0,
  //     rotation: Cesium.Math.toRadians(-40.0),
  //     outline: true, // 绘制轮廓
  //     outlineColor: Cesium.Color.RED.withAlpha(0.5), // 轮廓颜色
  //     outlineWidth: 40, // 轮廓宽度
  //     stRotation: Cesium.Math.toRadians(90), // 纹理旋转
  //     material: Cesium.Color.WHITE.withAlpha(0.5), // 可以设置填充颜色，但接下来会设置fill为false
  //     fill: false, // 关键在这里，设置fill为false，确保椭圆没有填充
  //   },
  // });
  addCzml(viewer, tles);

  //扇形 =====
  sector(Cesium, viewer);

  //用来存储当前位置
  const currentPosition = new Cesium.Cartesian3();
  //获取Primitive模型的位置
  Cesium.Matrix4.getTranslation(PrimitiveModel.modelMatrix, currentPosition);
  //获取cesium的当前时间作为动画的初始时间
  const startTime = Cesium.JulianDate.now();

  //确保你画曲线的实体里面有positions属性
  const positionss = Entity.polyline.positions.getValue();
  // 选择曲线上的一个点作为目标位置
  const targetPosition = positionss[80];
  // 计算结束时间
  let animationDurationInSeconds = 10; //我让动画持续十秒
  const endTime = new Cesium.JulianDate();
  Cesium.JulianDate.addSeconds(startTime, animationDurationInSeconds, endTime);

  const positionProperty = new Cesium.SampledPositionProperty();
  // 添加起始位置到属性
  positionProperty.addSample(startTime, currentPosition);
  // 添加目标位置到属性
  positionProperty.addSample(endTime, targetPosition);

  // 创建模型实体并添加到viewer
  const satelliteEntity = viewer.entities.add({
    id: 'EntityModel',
    position: positionProperty,
    model: {
      uri: modelUrl,
      minimumPixelSize: 64,
    },
  });
  //h绘制圆形
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(118.0, 39.0),
    ellipse: {
      semiMinorAxis: 250000.0,
      semiMajorAxis: 250000.0,
      rotation: Cesium.Math.toRadians(-40.0),
      outline: true, // 绘制轮廓
      outlineColor: Cesium.Color.WHITE.withAlpha(0.5), // 轮廓颜色
      outlineWidth: 10000, // 轮廓宽度
      stRotation: Cesium.Math.toRadians(90), // 纹理旋转
      material: Cesium.Color.WHITE.withAlpha(0.5), // 可以设置填充颜色，但接下来会设置fill为false
      fill: false, // 关键在这里，设置fill为false，确保椭圆没有填充
    },
  });

  /** 多边形 */
  let line = [-118.0, 30.0, -115.0, 30.0, -117.1, 31.1, -118.0, 33.0];
  let bgC = '#000';
  graphicals(viewer, Cesium, line, bgC);

  /** 多边形 */
  let lineB = [-118.8, 35.0, -105.0, 20.0, -107.1, 32.1, -108.0, 36.0];
  let bgB = '#808080';
  graphicals(viewer, Cesium, lineB, bgB);

  /** 多边形 */
  let lineV = [-119.0, 40.0, -125.0, 30.0, -127.1, 34.1, -118.0, 36.0];
  let bgD = '#cfa4ff';
  graphicals(viewer, Cesium, lineV, bgD);

  /** 绘制线 */
  polyline(viewer, Cesium);
  viewer.cesiumWidget.creditContainer.style.display = 'none';

  /** 同一点多条线 */
  let positions = [
    {
      lon: 118,
      lat: 31,
    },
    {
      lon: 138,
      lat: 45,
    },
  ];
  let colorOne = '#42baff';
  polylinePoint(viewer, Cesium, positions, colorOne);

  let pos = [
    {
      lon: 118,
      lat: 31,
    },
    {
      lon: 128,
      lat: 40,
    },
  ];
  let colorTwo = '#fed300';
  polylinePoint(viewer, Cesium, pos, colorTwo);
  // 获取坐标点
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  // handler设置输入动作
  handler.setInputAction((movement) => {
    const cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
    if (cartesian) {
      // 将获取的坐标转换为经纬度
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      // 获取经度并将其从弧度转换为度
      lon.value = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
      // 获取纬度并将其从弧度转换为度
      localStorage.setItem('lon', lon.value);
      lat.value = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
      localStorage.setItem('lat', lat.value);

      // 获取高度
      const heightString = cartographic.height;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE); //指定监听的事件类型为鼠标移动

  // 鼠标右键
  handler.setInputAction((movement) => {
    posList.map((item) => {
      if (item.id === 2) {
        viewer.entities.removeById(2);
        // viewer.entities.removeAll();
      }
    });

    const cartesian = viewer.camera._position;
    console.log(cartesian, 89);

    if (cartesian) {
      // 转换为不包含地形的笛卡尔坐标
      let cartesian1 = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
      let cartesian2 = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian1);
      let longitude = ((cartesian2.longitude * 180) / Math.PI).toFixed(4);
      let latitude = ((cartesian2.latitude * 180) / Math.PI).toFixed(4);

      console.log(longitude, latitude, 987);
      let cameraObj = {
        position: viewer.camera.position,
        heading: viewer.camera.heading,
        pitch: viewer.camera.pitch,
      };
    }
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK); //指定监听的事件类型为鼠标移

  // 设置默认位置
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(106.26667, 38.46667, 10000000.0),
    orientation: {
      heading: 6.283185307179586,
      pitch: -1.5686521559334161,
      roll: 0,
    },
  });

  /**
   * 点的运动程序
   */

  pointAll(Cesium, viewer);

  /**
   * 定位贴图位置
   */
  let psList = [{ lon: 142.39, lat: 18.9 }];
  billboard(Cesium, viewer, psList);

  /**
   * 运动轨迹
   */

  // setTimeout(() => {
  // sports(Cesium, viewer);
  viewer.clock.shouldAnimate = false; // 控制时间轴的开始和结束
  // }, 1000);

  /**
   * 画线
  转经纬度
   */
  let position = [
    { lon: 96.39, lat: 29.9 },
    { lon: 137.39, lat: 40.9 },
    { lon: 107.39, lat: 60.9 },
    { lon: 112.39, lat: 80.9 },
    { lon: 127.39, lat: 20.9 },
  ];
  // line(Cesium, viewer, position);
  let configs = {
    color: 'RED',
  };
  ploygon(Cesium, viewer, position, configs);

  /**
   * 画区域
   */
  let posArea = [
    { lon: 96.39, lat: 29.9 },
    { lon: 137.39, lat: 40.9 },
    { lon: 86.39, lat: 59.9 },
    { lon: 137.39, lat: 70.9 },
    { lon: 146.39, lat: 89.9 },
    { lon: 167.39, lat: 30.9 },
  ];
  // area(Cesium, viewer, posArea);
  // 鼠标左键
  handler.setInputAction((movement) => {
    const cartesian = viewer.camera._position;

    if (cartesian) {
      // 转换为不包含地形的笛卡尔坐标
      let cartesian1 = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
      let cartesian2 = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian1);
      let longitude = ((cartesian2.longitude * 180) / Math.PI).toFixed(4);
      let latitude = ((cartesian2.latitude * 180) / Math.PI).toFixed(4);

      let position = {
        longitude: +longitude,
        latitude: +latitude,
        height: 100,
      };
      // pos.value.push(position.longitude, position.latitude, position.height);
      // console.log(pos.value, 38);
      // polygon(Cesium, viewer, pos.value);

      let cameraObj = {
        position: viewer.camera.position,
        heading: viewer.camera.heading,
        pitch: viewer.camera.pitch,
      };
      // console.log(cartesian, 987);
      // psData.value.push(cameraObj.position);
      // console.log(psData.value, 8282);
      // ps.value.push(Object.values(cameraObj.position));
      // console.log(ps.value, 29191919);
    }
    var pickedFeature = viewer.scene.pick(movement.position);
    console.log(pickedFeature);

    if (Cesium.defined(pickedFeature)) {
      silhouetteGreen.selected = [pickedFeature];
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK); //指定监听的事件类型为鼠标移

  // 有用

  let posList = [
    {
      lon: 100,
      lat: 40,
      id: 1,
    },
    {
      lon: 100,
      lat: 50,
      id: 2,
    },
    {
      lon: 100,
      lat: 60,
      id: 3,
    },
    {
      lon: 100,
      lat: 70,
      id: 4,
    },
  ];

  point(Cesium, viewer, posList);
});

/**
 * 可以选择多个点的区域 这样面积会更大用户就不用局限在三个点
 */
if (pos.length > 3) {
  polygon(Cesium, viewer, pos);
}
function polygon(Cesium, viewer, pos) {
  //加载面图形
  viewer.entities.remove(polygonViwer); // 删除某一个对象

  return (polygonViwer = viewer.entities.add({
    // id: 1,
    polygon: {
      height: 0.1,
      hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(pos)), // 面的顶点坐标集合
      material: new Cesium.Color.fromCssColorString('#FFD700').withAlpha(0.5), // 颜色和透明度
      perPositionHeight: true, // 是否支持坐标高度
    },
  }));
}
</script>

<style scoped src="./index.scss"></style>
