<template>
  <div id="cesiumContainer">
    <div id="heatmap" v-show="false"></div>
  </div>
</template>

<script>
export default {
  name: 'CesiumHeatmap',
  components: {},
  data() {
    return {};
  },
  mounted() {
    var len = 300;
    var points = [];
    var max = 100;

    //热力图图片大小
    var width = 600;
    var height = 400;

    //点坐标的矩形范围
    var latMin = 30.364807;
    var latMax = 50.251095;
    var lonMin = 34.389228;
    var lonMax = 50.666357;

    //随机创建300个点（经度、纬度、热力值）
    var dataRaw = [];
    for (var i = 0; i < len; i++) {
      var point = {
        lat: latMin + Math.random() * (latMax - latMin),
        lon: lonMin + Math.random() * (lonMax - lonMin),
        value: Math.floor(Math.random() * 100),
      };
      dataRaw.push(point);
    }

    //随机创建300个点（x、y、热力值）
    for (var i = 0; i < len; i++) {
      var dataItem = dataRaw[i];
      var point = {
        x: Math.floor(((dataItem.lat - latMin) / (latMax - latMin)) * width),
        y: Math.floor(((dataItem.lon - lonMin) / (lonMax - lonMin)) * height),
        value: Math.floor(dataItem.value),
      };
      max = Math.max(max, dataItem.value);
      points.push(point);
    }

    var heatmapInstance = h337.create({
      container: document.querySelector('#heatmap'),
    });

    var data = {
      max: max,
      data: points,
    };

    heatmapInstance.setData(data);

    var viewer = new Cesium.Viewer('cesiumContainer', {
      sceneMode: Cesium.SceneMode.SCENE2D,
      baseLayer: Cesium.ImageryLayer.fromProviderAsync(
        Cesium.TileMapServiceImageryProvider.fromUrl(Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'))
      ),
      skyBox: false,
      skyAtmosphere: false,
      animation: false,
      timeline: false,
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

    // 设置默认位置
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(114.26667, 32.46667, 30000000.0),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5686521559334161,
        roll: 10,
      },
    });
    viewer._cesiumWidget._creditContainer.style.display = 'none';

    var canvas = document.getElementsByClassName('heatmap-canvas');
    viewer.entities.add({
      name: 'heatmap',
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(lonMin, latMin, lonMax, latMax),
        material: new Cesium.ImageMaterialProperty({
          image: canvas[0],
          transparent: true,
        }),
      },
    });

    viewer.zoomTo(viewer.entities);
  },
  methods: {},
};
</script>

<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#heatmap {
  width: 500px;
  height: 500px;
}
</style>
