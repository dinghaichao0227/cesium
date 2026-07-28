<template>
  <div id="mapContainer">
    <div class="lonLat">
      <!-- <lonAndLat :lon="lon" :lat="lat" /> -->
    </div>
    <div id="heatmap" v-show="false"></div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="panel-section">
        <div class="section-header">
          <h3>风场控制</h3>
          <label class="toggle-switch">
            <input type="checkbox" v-model="showWind" @change="toggleWind" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="control-buttons-row">
          <button @click="toggleWindAnimation" :disabled="!showWind">
            {{ windAnimating ? '暂停' : '播放' }}
          </button>
          <button @click="resetWind" :disabled="!showWind">重置</button>
        </div>
        <div class="control-item">
          <label>风向 (°):</label>
          <input v-model.number="windDirection" type="number" min="0" max="360" @change="updateWindField" :disabled="!showWind" />
        </div>
        <div class="control-item">
          <label>风速:</label>
          <input v-model.number="windSpeed" type="number" min="0" max="100" step="0.1" @change="updateWindField" :disabled="!showWind" />
        </div>
        <div class="control-item">
          <label>粒子数量:</label>
          <input v-model.number="particleCount" type="number" min="100" max="5000" @change="updateWindField" :disabled="!showWind" />
        </div>
        <div class="control-item">
          <label>流速因子:</label>
          <input v-model.number="speedFactor" type="number" min="0.01" max="1" step="0.01" @change="updateWindField" :disabled="!showWind" />
        </div>
      </div>

      <div class="panel-section">
        <div class="section-header">
          <h3>雨场控制</h3>
          <label class="toggle-switch">
            <input type="checkbox" v-model="showRain" @change="toggleRain" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="control-buttons-row">
          <button @click="toggleRainAnimation" :disabled="!showRain">
            {{ rainAnimating ? '暂停' : '播放' }}
          </button>
          <button @click="resetRain" :disabled="!showRain">重置</button>
        </div>
        <div class="control-item">
          <label>雨量:</label>
          <input v-model.number="rainAmount" type="number" min="0" max="100" step="1" @change="updateRainField" :disabled="!showRain" />
        </div>
        <div class="control-item">
          <label>雨滴数量:</label>
          <input v-model.number="dropCount" type="number" min="100" max="5000" @change="updateRainField" :disabled="!showRain" />
        </div>
        <div class="control-item">
          <label>下落速度:</label>
          <input v-model.number="fallSpeed" type="number" min="100" max="1000" @change="updateRainField" :disabled="!showRain" />
        </div>
        <div class="control-item">
          <label>倾斜度:</label>
          <input v-model.number="slant" type="number" min="0" max="1" step="0.01" @change="updateRainField" :disabled="!showRain" />
        </div>
      </div>

      <div class="panel-section">
        <h3>全局控制</h3>
        <div class="control-buttons">
          <button @click="resetAll">全部重置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, toRefs, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import lonAndLat from './showLonAndLat/index.vue';
import router from '@/router';
import { polyline } from './config/trajectory/index';
import { pointAll } from './Configuration/pointAll';
import { sports } from './Configuration/run';
import { point } from './Configuration/point';
import { sector } from './Configuration/sector';
import { billboard } from './Configuration/billboard';
// import { area } from './Configuration/area'

import { ploygon } from './Configuration/ploygon';
import { windField } from './Configuration/windField';
import { rainfallField } from './Configuration/rainfallField';

const lon = ref<any>();
const lat = ref<any>();
let psData = ref([]);
// let ps = ref([96.39, 29.9, 137.39, 40, 9, 102, 60, 129.56]);
let pos = ref([]);
let polygonViwer = {};

// 保存 viewer 实例
let viewerInstance: any = null;

// 响应式控制变量
let windInstance: any = null;
let rainInstance: any = null;

// 风场控制参数
const showWind = ref(true); // 风场显示开关
const windAnimating = ref(true); // 风场动画状态
const windDirection = ref(45); // 风向 0-360度
const windSpeed = ref(5); // 风速
const particleCount = ref(1800); // 粒子数量
const speedFactor = ref(0.09); // 流速因子

// 雨场控制参数
const showRain = ref(true); // 雨场显示开关
const rainAnimating = ref(true); // 雨场动画状态
const rainAmount = ref(50); // 雨量
const dropCount = ref(1400); // 雨滴数量
const fallSpeed = ref(420); // 下落速度
const slant = ref(0.18); // 倾斜度

// 时间控制
const duration = ref(60); // 时长（秒）

onMounted(() => {
  viewerInstance = new Cesium.Viewer('mapContainer', {
    sceneMode: Cesium.SceneMode.SCENE2D,

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
    homeButton: false,
    baseLayerPicker: false,
    enableCompass: false,
  });

  //扇形 =====
  sector(Cesium, viewerInstance);
  //===

  polyline(viewerInstance, Cesium);
  viewerInstance.cesiumWidget.creditContainer.style.display = 'none';

  // 获取坐标点
  const handler = new Cesium.ScreenSpaceEventHandler(viewerInstance.scene.canvas);

  // handler设置输入动作
  handler.setInputAction((movement) => {
    const cartesian = viewerInstance.camera.pickEllipsoid(movement.endPosition, viewerInstance.scene.globe.ellipsoid);
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

    const cartesian = viewerInstance.camera._position;
    console.log(cartesian, 89);

    if (cartesian) {
      // 转换为不包含地形的笛卡尔坐标
      let cartesian1 = viewerInstance.camera.pickEllipsoid(movement.position, viewerInstance.scene.globe.ellipsoid);
      let cartesian2 = viewerInstance.scene.globe.ellipsoid.cartesianToCartographic(cartesian1);
      let longitude = ((cartesian2.longitude * 180) / Math.PI).toFixed(4);
      let latitude = ((cartesian2.latitude * 180) / Math.PI).toFixed(4);

      console.log(longitude, latitude, 987);
      let cameraObj = {
        position: viewerInstance.camera.position,
        heading: viewerInstance.camera.heading,
        pitch: viewerInstance.camera.pitch,
      };
    }
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK); //指定监听的事件类型为鼠标移

  // 设置默认位置
  viewerInstance.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(106.26667, 38.46667, 10000000.0),
    orientation: {
      heading: 6.283185307179586,
      pitch: -1.5686521559334161,
      roll: 0,
    },
  });

  // 绘制风场图（动态粒子流动 + 风向风速可调面板）
  windInstance = windField(
    Cesium,
    viewerInstance,
    { minLon: 70, minLat: 10, maxLon: 140, maxLat: 60 },
    {
      gridSize: 14,
      directionConvention: 'meteo', // 气象风向：正北起、顺时针、表示风的来向
      animate: true, // 粒子动画
      particleCount: particleCount.value,
      speedFactor: speedFactor.value, // 越大流动越快
      trailFade: 0.94, // 越大拖尾越长
      particleWidth: 1.6,
      showArrows: false, // 需要同时看静态箭头时置为 true
      showLabels: false,
      showLegend: true,
      showControls: false, // 使用自定义控制面板
      showProbe: true, // 鼠标悬停显示风向罗盘 + 风速 + 蒲福风级
    }
  );
  // wind.stop() / wind.start() / wind.hide() / wind.remove()
  // wind.setSettings({ particleCount: 3000, showArrows: true })
  // wind.sample(105, 35) -> { u, v, speed, direction }

  // 绘制降雨场图（动态雨滴 + 色块脉动）
  rainInstance = rainfallField(
    Cesium,
    viewerInstance,
    { minLon: 70, minLat: 10, maxLon: 140, maxLat: 60 },
    {
      gridSize: 10,
      animate: true, // 雨滴动画
      dropCount: dropCount.value,
      fallSpeed: fallSpeed.value, // 下落速度 像素/秒
      fallRange: 90, // 单个雨滴的下落行程 像素
      slant: slant.value, // 雨丝倾斜度
      dropThreshold: 2, // 小于 2mm 的区域不下雨
      showCells: true, // 雨量色块
      pulse: true, // 色块呼吸脉动
      showLabels: false,
      showLegend: true,
    }
  );
  // rain.stop() / rain.start() / rain.hide() / rain.remove()

  /**
   * 点的运动程序
   */

  pointAll(Cesium, viewer);

  /**
   * 定位贴图
   */
  let psList = [{ lon: 142.39, lat: 18.9 }];
  billboard(Cesium, viewerInstance, psList);

  /**
   * 运动轨迹
   */

  // setTimeout(() => {
  sports(Cesium, viewerInstance);
  viewerInstance.clock.shouldAnimate = false; // 控制时间轴的开始和结束
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
  ploygon(Cesium, viewerInstance, position, configs);

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
    const cartesian = viewerInstance.camera._position;

    if (cartesian) {
      // 转换为不包含地形的笛卡尔坐标
      let cartesian1 = viewerInstance.camera.pickEllipsoid(movement.position, viewerInstance.scene.globe.ellipsoid);
      let cartesian2 = viewerInstance.scene.globe.ellipsoid.cartesianToCartographic(cartesian1);
      let longitude = ((cartesian2.longitude * 180) / Math.PI).toFixed(4);
      let latitude = ((cartesian2.latitude * 180) / Math.PI).toFixed(4);

      let position = {
        longitude: +longitude,
        latitude: +latitude,
        height: 100,
      };
      pos.value.push(position.longitude, position.latitude, position.height);
      console.log(pos.value, 38);
      polygon(Cesium, viewerInstance, pos.value);

      let cameraObj = {
        position: viewerInstance.camera.position,
        heading: viewerInstance.camera.heading,
        pitch: viewerInstance.camera.pitch,
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

  point(Cesium, viewerInstance, posList);
});

/**
 * 可以选择多个点的区域 这样面积会更大用户就不用局限在三个点
 */
if (pos.length > 3) {
  polygon(Cesium, viewerInstance, pos);
}
function polygon(Cesium, viewerInstance, pos) {
  //加载面图形
  viewerInstance.entities.remove(polygonViwer); // 删除某一个对象

  return (polygonViwer = viewerInstance.entities.add({
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

/**
 * 切换风场显示
 */
const toggleWind = () => {
  if (windInstance) {
    if (showWind.value) {
      windInstance.show();
      windAnimating.value = true;
      windInstance.start();
    } else {
      windInstance.hide();
      windAnimating.value = false;
    }
    console.log('风场显示:', showWind.value ? '开启' : '关闭');
  }
};

/**
 * 切换风场动画
 */
const toggleWindAnimation = () => {
  if (windInstance && showWind.value) {
    windAnimating.value = !windAnimating.value;
    windAnimating.value ? windInstance.start() : windInstance.stop();
    console.log('风场动画:', windAnimating.value ? '播放' : '暂停');
  }
};

/**
 * 切换雨场显示
 */
const toggleRain = () => {
  if (!viewerInstance) return;

  if (showRain.value) {
    // 重新创建雨场
    rainInstance = rainfallField(
      Cesium,
      viewerInstance,
      { minLon: 70, minLat: 10, maxLon: 140, maxLat: 60 },
      {
        gridSize: 10,
        animate: true,
        dropCount: dropCount.value,
        fallSpeed: fallSpeed.value,
        fallRange: 90,
        slant: slant.value,
        dropThreshold: 2,
        showCells: true,
        pulse: true,
        showLabels: false,
        showLegend: true,
      }
    );
    rainAnimating.value = true;
  } else {
    // 销毁雨场
    if (rainInstance) {
      rainInstance.remove();
    }
    rainAnimating.value = false;
  }
  console.log('雨场显示:', showRain.value ? '开启' : '关闭');
};

/**
 * 切换雨场动画
 */
const toggleRainAnimation = () => {
  if (rainInstance && showRain.value) {
    rainAnimating.value = !rainAnimating.value;
    rainAnimating.value ? rainInstance.start() : rainInstance.stop();
    console.log('雨场动画:', rainAnimating.value ? '播放' : '暂停');
  } else if (showRain.value && viewerInstance) {
    // 如果雨场不存在但开启状态，重新创建
    rainInstance = rainfallField(
      Cesium,
      viewerInstance,
      { minLon: 70, minLat: 10, maxLon: 140, maxLat: 60 },
      {
        gridSize: 10,
        animate: true,
        dropCount: dropCount.value,
        fallSpeed: fallSpeed.value,
        fallRange: 90,
        slant: slant.value,
        dropThreshold: 2,
        showCells: true,
        pulse: true,
        showLabels: false,
        showLegend: true,
      }
    );
    rainAnimating.value = true;
    console.log('雨场动画: 播放');
  }
};

/**
 * 更新风场设置
 */
const updateWindField = () => {
  if (windInstance && showWind.value) {
    windInstance.setSettings({
      particleCount: particleCount.value,
      speedFactor: speedFactor.value,
      // 根据风向和风速动态调整粒子运动方向
      direction: windDirection.value,
    });
    console.log('风场已更新:', {
      direction: windDirection.value,
      speed: windSpeed.value,
      particleCount: particleCount.value,
      speedFactor: speedFactor.value,
    });
  }
};

/**
 * 更新雨场设置（通过销毁并重新创建）
 */
const updateRainField = () => {
  if (!showRain.value || !viewerInstance) return;

  // 销毁旧的雨场
  if (rainInstance) {
    rainInstance.remove();
  }

  // 重新创建雨场
  rainInstance = rainfallField(
    Cesium,
    viewerInstance,
    { minLon: 70, minLat: 10, maxLon: 140, maxLat: 60 },
    {
      gridSize: 10,
      animate: rainAnimating.value, // 雨滴动画
      dropCount: dropCount.value,
      fallSpeed: fallSpeed.value, // 下落速度 像素/秒
      fallRange: 90, // 单个雨滴的下落行程 像素
      slant: slant.value, // 雨丝倾斜度
      dropThreshold: 2, // 小于 2mm 的区域不下雨
      showCells: true, // 雨量色块
      pulse: true, // 色块呼吸脉动
      showLabels: false,
      showLegend: true,
    }
  );

  console.log('雨场已更新:', {
    rainAmount: rainAmount.value,
    dropCount: dropCount.value,
    fallSpeed: fallSpeed.value,
    slant: slant.value,
  });
};

/**
 * 重置风场参数
 */
const resetWind = () => {
  windDirection.value = 45;
  windSpeed.value = 5;
  particleCount.value = 1800;
  speedFactor.value = 0.09;
  windAnimating.value = true;
  if (windInstance) {
    windInstance.start();
    updateWindField();
  }
  console.log('风场参数已重置');
};

/**
 * 重置雨场参数
 */
const resetRain = () => {
  rainAmount.value = 50;
  dropCount.value = 1400;
  fallSpeed.value = 420;
  slant.value = 0.18;
  rainAnimating.value = true;
  if (rainInstance) {
    rainInstance.start();
    updateRainField();
  }
  console.log('雨场参数已重置');
};

/**
 * 全部重置
 */
const resetAll = () => {
  resetWind();
  resetRain();
  duration.value = 60;
  console.log('所有参数已重置');
};
</script>

<style scoped src="./index.scss"></style>

<style scoped>
.control-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 280px;
  max-height: 90vh;
  overflow-y: auto;
}

.panel-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.panel-section:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.panel-section h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 切换开关样式 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .slider {
  background-color: #4a90e2;
}

.toggle-switch input:checked + .slider:before {
  transform: translateX(20px);
}

.control-buttons-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.control-buttons-row button {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
  background: #4a90e2;
  color: white;
}

.control-buttons-row button:hover:not(:disabled) {
  background: #357abd;
}

.control-buttons-row button:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.control-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.control-item label {
  min-width: 100px;
  font-size: 14px;
  color: #555;
}

.control-item input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.control-item input:focus {
  outline: none;
  border-color: #4a90e2;
}

.control-item input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.control-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.control-buttons button {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
  background: #666;
  color: white;
}

.control-buttons button:hover {
  background: #555;
}
</style>
