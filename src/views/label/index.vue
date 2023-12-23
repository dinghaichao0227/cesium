<template>
  <div class="box">
    <header class="box-header">header</header>
    <main class="box-main">
      <div class="box-main-content">
        <div class="content-top">绘制文字</div>
        <div class="content-bottom-left">
          <div class="left-drawer">
            <div class="left-drawer-icon">
              <div v-show="isVisible" class="left-drawer-label">
                <div class="label-list">
                  <div v-for="(item, index) in iconList" :key="index">
                    <p>{{ item.name }}</p>
                  </div>
                </div>
              </div>
              <double-right-outlined v-if="isVisible === true" @click="onShow" />
              <double-left-outlined v-else @click="onShow" />
            </div>
          </div>
        </div>
        <div class="content-bottom-right">
          <div class="right-drawer">
            <div class="right-drawer-box">
              <double-right-outlined v-if="visible === true" @click="showDrawer" />
              <double-left-outlined v-else @click="showDrawer" />
              <div v-show="visible" class="right-drawer-content">
                <div>哈哈哈</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="leftContainer" class="map-container1"></div>
      <div id="rightContainer" class="map-container2"></div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons-vue';
import { ref, onMounted, onBeforeUnmount } from 'vue';
const visible = ref(true);
const isVisible = ref(true);
let viewerLeft = null;
let viewerRight = null;
const leftContainer = ref(null);
const rightContainer = ref(null);

const iconList = ref<Array>([
  {
    name: '图片',
  },
  {
    name: '图片',
  },
  {
    name: '图片',
  },
  {
    name: '图片',
  },
  {
    name: '图片',
  },
]);

const afterOpenChange = (bool: boolean) => {
  console.log('visible', bool);
};

const showDrawer = () => {
  visible.value = !visible.value;
};
const onShow = () => {
  isVisible.value = !isVisible.value;
};

onMounted(() => {
  const leftViewer = new Cesium.Viewer('leftContainer', {
    imageryProvider: new Cesium.WebMapServiceImageryProvider({
      url: '/public/Cesium1.61/Assets/Textures/NaturalEarthII/{z}/{x}/{reverseY}.jpg',
    }),
    skyBox: false,
    skyAtmosphere: false,
    animation: false,
    timeline: false,
    infoBox: false,
    geocoder: false,
    sceneModePicker: false,
    fullscreenButton: true,
    navigationInstructionsInitiallyVisible: false,
    navigationHelpButton: false,
    homeButton: true,
    baseLayerPicker: false,
  });

  const rightViewer = new Cesium.Viewer('rightContainer', {
    sceneMode: Cesium.SceneMode.SCENE2D,
    imageryProvider: new Cesium.WebMapServiceImageryProvider({
      url: '/public/Cesium1.61/Assets/Textures/NaturalEarthII/{z}/{x}/{reverseY}.jpg',
    }),
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

  const MOUSE_TYPE = {
    LEFT: 0,
    RIGHT: 1,
  };

  window.mouseType = MOUSE_TYPE.LEFT;

  const leftHandler = new Cesium.ScreenSpaceEventHandler(leftViewer.canvas);
  leftHandler.setInputAction(() => {
    window.mouseType = MOUSE_TYPE.LEFT;
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  const rightHandler = new Cesium.ScreenSpaceEventHandler(rightViewer.canvas);
  rightHandler.setInputAction(() => {
    window.mouseType = MOUSE_TYPE.RIGHT;
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  leftViewer.scene.postRender.addEventListener(() => {
    if (window.mouseType === MOUSE_TYPE.RIGHT && rightViewer.camera.changed) {
      const destination = Cesium.Cartographic.toCartesian(rightViewer.camera.positionCartographic);
      const heading = rightViewer.camera.heading;
      const pitch = rightViewer.camera.pitch;
      const roll = rightViewer.camera.roll;

      leftViewer.camera.setView({
        destination: destination,
        orientation: {
          heading: heading,
          pitch: pitch,
          roll: roll,
        },
      });
    }
  });

  rightViewer.scene.postRender.addEventListener(() => {
    if (window.mouseType === MOUSE_TYPE.LEFT && leftViewer.camera.changed) {
      const destination = Cesium.Cartographic.toCartesian(leftViewer.camera.positionCartographic);
      const heading = leftViewer.camera.heading;
      const pitch = leftViewer.camera.pitch;
      const roll = leftViewer.camera.roll;

      rightViewer.camera.setView({
        destination: destination,
        orientation: {
          heading: heading,
          pitch: pitch,
          roll: roll,
        },
      });
    }
  });
});
</script>

<style scoped>
.box {
  width: 100%;
  height: 100%;
  background-color: #808080;
  display: flex;
  flex-direction: column;
  color: #fff;
}
.box-header {
  height: 50px;
  background-color: #25181e;
  display: flex;
  flex-shrink: 0;
}
.box-main {
  flex: 1;
  background-color: burlywood;
}
.content-top {
  width: 800px;
}

.box-main-content {
  position: absolute;
  width: 100vw;
  z-index: 9999;
}
.map-container1 {
  width: 200px;
  height: 200px;
  position: absolute;
  z-index: 9999;
  bottom: 0px;
}
.map-container2 {
  height: 94vh;
  width: 100vw;
  position: relative;

  z-index: 999;
}
.content-bottom-left {
  position: absolute;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 0%;
  top: 50px;
}
.content-bottom-right {
  position: absolute;
  top: 0%;
  right: 0%;
  height: 91.3vh;
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
}
.left-drawer-icon {
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
}
.left-drawer-label {
  width: 300px;
  height: 50px;
  background-color: rgb(19, 36, 81);
  opacity: 0.5;
  border-radius: 10px;
}
.right-drawer-box {
  display: flex;
  align-items: center;
}
.right-drawer-content {
  width: 500px;
  height: 91.3vh;
  background-color: rgb(19, 36, 81);
  opacity: 0.5;
}
.label-list {
  display: flex;
  height: 50px;
  align-items: center;
  justify-content: space-around;
  margin-top: 5px;
}

.custom-class {
  background-color: red;
}
</style>
