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
import router from '@/router';

const lon = ref<any>();
const lat = ref<any>();
onMounted(() => {
  let viewer = new Cesium.Viewer('mapContainer', {
    baseLayer: Cesium.ImageryLayer.fromProviderAsync(
      Cesium.TileMapServiceImageryProvider.fromUrl(Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'))
    ),
    skyBox: false,
    skyAtmosphere: false,
    animation: true,
    timeline: true,
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
  viewer.cesiumWidget.creditContainer.style.display = 'none';

  var start = new Cesium.JulianDate.fromDate(new Date()); //把js中的时间转换为儒略时间
  start = Cesium.JulianDate.addHours(start, 8, new Cesium.JulianDate()); //东八区时间
  // 结束时间
  var stop = Cesium.JulianDate.addSeconds(start, 360, new Cesium.JulianDate());

  //确保查看器处于预期的时间
  viewer.clock.startTime = start.clone();
  viewer.clock.stopTime = stop.clone();
  viewer.clock.currentTime = start.clone();
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //循环结束时
  //时间变化来控制速度 // 时间速率，数字越大时间过的越快
  viewer.clock.multiplier = 10;
  //给时间线设置边界
  viewer.timeline.zoomTo(start, stop);

  function mySatePosition() {
    this.lon = 0;
    this.lat = 0;
    this.satelliteHeight = 700000; //卫星高度
    this.orbitHeight = 700000 / 2; //轨道高度
    this.time = 0;
  }

  function getRandState(ifLat, degree) {
    var arr = [];
    var lat = Math.floor(Math.random() * 360);
    for (var i = lat; i <= 360 + lat; i += 30) {
      var aaa = new mySatePosition();
      if (ifLat == 'lon') {
        aaa.lon = degree;
        aaa.lat = i;
      } else {
        aaa.lon = i;
        aaa.lat = degree;
      }
      aaa.time = i - lat;
      arr.push(aaa);
    }
    return arr;
  }

  function computePosition(source, panduan) {
    var property = new Cesium.SampledPositionProperty();
    for (var i = 0; i < source.length; i++) {
      var time = Cesium.JulianDate.addSeconds(start, source[i].time, new Cesium.JulianDate());
      var position = Cesium.Cartesian3.fromDegrees(
        source[i].lon,
        source[i].lat,
        panduan === 1 ? source[i].satelliteHeight : source[i].orbitHeight
      );
      property.addSample(time, position);
    }
    return property;
  }
  function startSimulation(ifLat, degree) {
    //获取路径
    let path = getRandState(ifLat, degree);
    //扫描圆锥
    var entityPath = computePosition(path, 2);
    var entity = viewer.entities.add({
      //关联时间轴  TimeIntervalCollection管理时间间隔数据的集合  把时间轴的起止时间同步为实体的
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start: start,
          stop: stop,
        }),
      ]),
      position: entityPath,
      orientation: new Cesium.VelocityOrientationProperty(entityPath),
      cylinder: {
        HeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        length: 700000,
        topRadius: 0,
        bottomRadius: 700000 / 2,
        material: Cesium.Color.RED.withAlpha(0.4),
        outline: true,
        numberOfVerticalLines: 0,
        outlineColor: Cesium.Color.RED.withAlpha(0.8),
      },
    });
    entity.position.setInterpolationOptions({
      interpolationDegree: 5,
      interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
    });
    //卫星环绕
    var satellitePath = computePosition(path, 1);
    var satelliteEntity = viewer.entities.add({
      // 将实体availability设置为与模拟时间相同的时间间隔。
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start: start,
          stop: stop,
        }),
      ]),
      //计算实体位置属性
      position: satellitePath,
      //基于位置移动自动计算方向.
      orientation: new Cesium.VelocityOrientationProperty(satellitePath),
      //加载飞机模型
      model: {
        uri: './src/assets/wx.gltf',
        minimumPixelSize: 32,
        scale: 2000.0,
      },
      //白色路径
      path: {
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: Cesium.Color.RED,
        }),
        width: 5,
      },
    });
    //插值器
    satelliteEntity.position.setInterpolationOptions({
      interpolationDegree: 5,
      interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
    });
  }
  startSimulation('lon', 120);
});
</script>

<style scoped src="./index.scss"></style>
