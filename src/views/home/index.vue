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

const lon = ref<any>();
const lat = ref<any>();
let psData = ref([]);
// let ps = ref([96.39, 29.9, 137.39, 40, 9, 102, 60, 129.56]);
let pos = ref([]);
let polygonViwer = {};

onMounted(() => {
  let viewer = new Cesium.Viewer('mapContainer', {
    sceneMode: Cesium.SceneMode.SCENE2D,
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
    homeButton: false,
    baseLayerPicker: false,
    enableCompass: false,
  });

  //扇形 =====
  sector(Cesium, viewer);
  //===

  polyline(viewer, Cesium);
  viewer.cesiumWidget.creditContainer.style.display = 'none';

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
   * 定位贴图
   */
  let psList = [{ lon: 142.39, lat: 18.9 }];
  billboard(Cesium, viewer, psList);

  /**
   * 运动轨迹
   */

  // setTimeout(() => {
  sports(Cesium, viewer);
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
      pos.value.push(position.longitude, position.latitude, position.height);
      console.log(pos.value, 38);
      polygon(Cesium, viewer, pos.value);

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
// 下面是新加的-------------------
</script>

<style scoped src="./index.scss"></style>
