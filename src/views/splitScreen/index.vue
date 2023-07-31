<template>
  <div class="cesium-div">
    <!-- <div id="leftContainer" class="cesium-container"></div> -->
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

var rightViewer = null;

onMounted(() => {

  rightViewer = new Cesium.Viewer('rightContainer', {
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
})
</script>

<style scoped>
.cesium-div {
  display: flex;
  height: 100vh;
}

.cesium-container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>