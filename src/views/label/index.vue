<template>
  <div class="cesium-div">
    <div id="leftContainer" class="cesium-container"></div>
    <div id="rightContainer" class="cesium-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
// import * as Cesium from 'cesium';

let viewerLeft = null;
let viewerRight = null;

const leftContainer = ref(null);
const rightContainer = ref(null);

onMounted(() => {
  const leftViewer = new Cesium.Viewer('leftContainer', {
    // terrainProvider: Cesium.createWorldTerrain(),
    imageryProvider: new Cesium.WebMapServiceImageryProvider({
            url: "/public/Cesium1.61/Assets/Textures/NaturalEarthII/{z}/{x}/{reverseY}.jpg",
        }),
    sceneModePicker: false,
    infoBox: false,
    shouldAnimate: true,
    timeline: false,
    animation: false,
  })






  const rightViewer = new Cesium.Viewer('rightContainer', {
      sceneMode: Cesium.SceneMode.SCENE2D,
      imageryProvider: new Cesium.WebMapServiceImageryProvider({
            url: "/public/Cesium1.61/Assets/Textures/NaturalEarthII/{z}/{x}/{reverseY}.jpg",
        }),
      // terrainProvider: Cesium.createWorldTerrain(),
      sceneModePicker: false,
      infoBox: false,
      shouldAnimate: true,
      timeline: false,
      animation: false,
  })

  const MOUSE_TYPE = {
      LEFT: 0,
      RIGHT: 1
  }

  window.mouseType = MOUSE_TYPE.LEFT

  const leftHandler = new Cesium.ScreenSpaceEventHandler(leftViewer.canvas)
  leftHandler.setInputAction(() => {
      window.mouseType = MOUSE_TYPE.LEFT
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  const rightHandler = new Cesium.ScreenSpaceEventHandler(rightViewer.canvas)
  rightHandler.setInputAction(() => {
      window.mouseType = MOUSE_TYPE.RIGHT
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  leftViewer.scene.postRender.addEventListener(() => {
    if (window.mouseType === MOUSE_TYPE.RIGHT) {
        // Get the destination of the right viewer camera
        const destination = Cesium.Cartographic.toCartesian(rightViewer.camera.positionCartographic)
        // Set the left viewer camera position and orientation to match the right viewer camera
        leftViewer.camera.setView({
            destination: new Cesium.Cartesian3(destination.x, destination.y, destination.z),
            orientation: {
                heading: rightViewer.camera.heading,
                pitch: rightViewer.camera.pitch,
                roll: rightViewer.camera.roll,
            },
        })
    }
  })

  rightViewer.scene.postRender.addEventListener(() => {
    if (window.mouseType === MOUSE_TYPE.LEFT) {
        // Get the destination of the left viewer camera
        const destination =
  Cesium.Cartographic.toCartesian(leftViewer.camera.positionCartographic)
        // Set the right viewer camera position to match the left viewer camera
        rightViewer.camera.setView({
            destination: new Cesium.Cartesian3(destination.x, destination.y, destination.z),
            orientation: {
                heading: leftViewer.camera.heading,
                pitch: leftViewer.camera.pitch,
                roll: leftViewer.camera.roll,
            },
        })
      }
  })
})
</script>

<style scoped>
.cesium-div {
  display: flex;
  height: 100vh;
}

.cesium-container {
  width: 50%;
  height: 100%;
  position: relative;
}
</style>