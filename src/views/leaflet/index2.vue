<template>
  <div id="map" style="margin: 0 auto; width: 100%; height: 100%"></div>
</template>

<script>
import HeatmapOverlay from 'heatmap.js/plugins/leaflet-heatmap';
import L from 'leaflet';

export default {
  name: 'gis-population-density',
  data() {
    return {
      heatmapLayer: null,
      map: null,
    };
  },
  mounted() {
    // 引用heatmap.js
    // let script = document.createElement('script')
    // script.type = 'text/javascript'
    // script.src =
    // 'http://api.map.baidu.com/library/Heatmap/2.0/src/Heatmap_min.js'
    // document.body.appendChild(script)
    this.initmap();
  },
  methods: {
    initmap: function () {
      // this.map = L.map('map', {
      //   center: [39.9788, 116.30226],
      //   zoom: 14
      // })
      //
      // L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      //   attribution: 'Haut-Gis-Org © OpenStreetMap'
      // }).addTo(this.map)

      // 数据
      var testData = {
        max: 8,
        data: [
          { lat: 24.6408, lng: 46.7728, count: 3 },
          { lat: 50.75, lng: -1.55, count: 1 },
          { lat: 51.55, lng: -1.55, count: 9 },
          { lat: 52.65, lng: -1.45, count: 8 },
          { lat: 53.45, lng: -1.35, count: 7 },
          { lat: 54.35, lng: -1.25, count: 6 },
          { lat: 5.25, lng: -1.15, count: 5 },
        ],
      };
      // 配置
      var cfg = {
        radius: 2,
        maxOpacity: 0.8,
        scaleRadius: true,
        useLocalExtrema: true,
        latField: 'lat',
        lngField: 'lng',
        valueField: 'count',
      };
      this.heatmapLayer = new HeatmapOverlay(cfg);
      // 图层
      let baseLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Haut-Gis-Org © OpenStreetMap',
      });
      this.map = L.map('map', {
        center: [25.6586, -80.3568],
        zoom: 4,
      });
      baseLayer.addTo(this.map);
      this.heatmapLayer.addTo(this.map);
      this.heatmapLayer.setData(testData);

      L.control.scale({ maxWidth: 200, metric: true, imperial: false }).addTo(this.map);

      let baseLayers = {
        heatmapLayer: this.heatmapLayer,
        OpenStreetMap: baseLayer,
      };
      // let overlays = {
      //   'Marker': null,
      //   'Roads': null
      // }
      L.control.layers(baseLayers).addTo(this.map);
    },
  },
};
</script>

<style scoped>
@import 'https://unpkg.com/leaflet@1.0.3/dist/leaflet.css';
</style>
