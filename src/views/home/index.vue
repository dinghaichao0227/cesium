<template>
  <div id="mapContainer">
    <div class="lonLat">
      <lonAndLat :lon="lon" :lat="lat" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, toRefs, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import lonAndLat from './showLonAndLat/index.vue';
import router from '@/router';

import { polyline } from './config/trajectory/index';

const lon = ref<any>();
const lat = ref<any>();
onMounted(() => {
  let viewer = new Cesium.Viewer('mapContainer', {
    baseLayer: Cesium.ImageryLayer.fromProviderAsync(
      Cesium.TileMapServiceImageryProvider.fromUrl(Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'))
    ),
    skyBox: false,
    skyAtmosphere: false,
    animation: false,
    timeline: false,
    infoBox: false,
    geocoder: false,
    sceneModePicker: false,
    fullscreenButton: false,
    navigationInstructionsInitiallyVisible: false,
    navigationHelpButton: false,
    homeButton: false,
    baseLayerPicker: false,
    enableCompass: false,
  });
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

  // const startPoint = [
  //   7292687.487964332,

  //   -55393460.97952435,

  //   39349949.17105431,
  // ];
  // // 将世界坐标转换为经纬度高度
  // let cartesian3 = new Cesium.Cartesian3(
  //   Math.abs(startPoint[0]),
  //   Math.abs(startPoint[1]),
  //   Math.abs(startPoint[1]),
  //   startPoint[2]
  // );
  // let cartographic1 = Cesium.Cartographic.fromCartesian(cartesian3);
  // let lat = 180 - Cesium.Math.toDegrees(cartographic1.latitude);
  // let lon = Cesium.Math.toDegrees(cartographic1.longitude);
  // let alt = cartesian3.height;
  // console.log(lat, 988);
});
</script>

<style scoped src="./index.scss"></style>
