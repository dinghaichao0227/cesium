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

    /** 热力图 */
    // 测试热力图
    function addHeatMap() {
      let bounds = {
        west: 106.243911,
        east: 106.270811,
        south: 29.244545,
        north: 29.289995,
      };
      let heatMap = CesiumHeatmap.create(
        viewer, // your cesium viewer
        bounds, // bounds for heatmap layer
        {
          // heatmap.js options go here
          // maxOpacity: 0.3
          gradient: {
            // the gradient used if not given in the heatmap options object
            '.3': '#d9e7fc',
            '.65': '#2a7aed',
            '.8': '#fbd801',
            '.95': '#18c3a1',
          },
        }
      );
      let data = [
        { x: 106.254153, y: 29.2883939, value: 76 },
        { x: 106.2654284, y: 29.2854935, value: 63 },
        { x: 106.265005, y: 29.284573, value: 1 },
        { x: 106.264001, y: 29.283456, value: 21 },
        { x: 106.263219, y: 29.282181, value: 28 },
        { x: 106.262788, y: 29.279673, value: 41 },
        { x: 106.2632087, y: 29.2742665, value: 75 },
        { x: 106.2505158, y: 29.28138, value: 76 },
        { x: 106.2531094, y: 29.2833591, value: 100 },
        { x: 106.2531093, y: 29.284456, value: 80 },
        { x: 106.253293, y: 29.284826, value: 1 },
        { x: 106.250099, y: 29.285638, value: 21 },
        { x: 106.2469149, y: 29.2864109, value: 28 },
        { x: 106.254119, y: 29.276274, value: 41 },
      ];
      let valueMin = 0;
      let valueMax = 50;
      heatMap.setWGS84Data(valueMin, valueMax, data);
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(106.254153, 29.2742665, 2e3),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
          roll: 0.0,
        },
      });
    }
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
