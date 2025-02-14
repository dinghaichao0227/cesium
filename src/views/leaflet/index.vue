<template>
  <div id="map"></div>

  <div id="mapButton">
    <button type="button" id="areaMeasure">测面积</button>
    <button type="button" id="clearMeasure">清除</button>
    <button type="button" @click="onStartHeatMap">绘制热力图</button>
    <button type="button" @click="onClearHeatMap">取消绘制</button>
    <div class="latAntLon">经度：{{ lat }}, 维度：{{ lon }}</div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.animatedmarker/src/AnimatedMarker';
import '/public/leaflet/fullScreen/Control.FullScreen.css';
import '/public/leaflet/fullScreen/Control.FullScreen.css';
import '/public/leaflet/route/leaflet.motion.min.css';
import '/public/leaflet/route/leaflet.draw.css';
import 'leaflet.motion/dist/leaflet.motion.min.js';
import '/public/leaflet/fullScreen/Control.FullScreen.js';
import '/public/leaflet/heatMap/leaflet-heat.js';
import '/public/leaflet/route/leaflet.draw.js';
import '/public/leaflet/route/leaflet.motion.min.js';
import addressPoints from '/public/leaflet/heatMap/realworld.js';
import { ploygon } from '../home/configuration/ploygon';
import { area } from './components/config/measuringArea.js';
import { distance } from '/public/leaflet/measure/L.Control.measure.js';
import { point } from './components/leaflet/point/index.js';
import { trajectory } from './components/leaflet/trajectory/index.js';
import { rader } from './components/leaflet/rader/index.js';
import { sectorScan } from './components/leaflet/sectorScan/index.js';

export default {
  name: 'MyMap',

  data() {
    return {
      lat: null,
      lon: null,
      draw: false,
    };
  },
  methods: {
    onStartHeatMap() {
      this.draw = true;
    },
    onClearHeatMap() {
      this.draw = false;
    },
  },
  mounted() {
    let map = L.map('map', {
      fullscreenControl: true, // 全屏放大缩小
      fullscreenControlOptions: {
        position: 'topleft',
      },
    }).setView([36.505, 110.09], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    var options = {
      draw: {
        circle: false, // Turns off this drawing tool
        rectangle: false,
        marker: false,
        circlemarker: false,
      },
    };

    var drawControl = new L.Control.Draw(options);
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (e) {
      var type = e.layerType,
        layer = e.layer;

      if (type === 'polyline') {
        var line = L.motion
          .polyline(
            layer.getLatLngs(),
            {
              color: 'orange',
            },
            {
              auto: true,
              easing: L.Motion.Ease.swing,
            }
          )
          .motionSpeed(100000)
          .addTo(map);
      }

      if (type === 'polygon') {
        L.motion
          .polygon(
            layer.getLatLngs(),
            {
              color: 'red',
              fill: true,
              fillOpacity: 0.4,
            },
            {
              auto: true,
            },
            {
              removeOnEnd: true,
              icon: L.divIcon({
                className: 'red',
                html: "<i class='fa fa-superpowers fa-spin fa-2x' aria-hidden='true' motion-base='0'></i>",
                iconSize: L.point(24, 24),
                iconAnchor: L.point(5, 22),
              }),
            }
          )
          .motionDuration(10000)
          .addTo(map);
      }
    });

    var trackRoute = JSON.parse(
      '[{"lat":51.15815239612826,"lng":-2.2055053710937504},{"lat":51.18569785341817,"lng":-2.1615600585937504},{"lat":51.19120493896969,"lng":-2.122009252198041},{"lat":51.22698519222996,"lng":-2.0187377929687504},{"lat":51.20221718842518,"lng":-1.979186986573041},{"lat":51.24211458943536,"lng":-1.8956908676773312},{"lat":51.22285808183325,"lng":-1.8429565429687502},{"lat":51.253114667550555,"lng":-1.7726440262049439},{"lat":51.25036488157529,"lng":-1.7023315094411375},{"lat":51.264112114656214,"lng":-1.6276245284825566},{"lat":51.28472525702113,"lng":-1.56829833984375},{"lat":51.26960987786426,"lng":-1.5309448074549437},{"lat":51.27510698339771,"lng":-1.4891967270523312},{"lat":51.29296795605501,"lng":-1.4474487304687502},{"lat":51.286099169144734,"lng":-1.3837279938161375},{"lat":51.27922935475756,"lng":-1.3397826813161373},{"lat":51.31494117540117,"lng":-1.2694701645523312},{"lat":51.32866911860522,"lng":-1.2057494278997185},{"lat":51.35611262745693,"lng":-1.1266478989273312},{"lat":51.39039390837808,"lng":-1.0695190262049439},{"lat":51.382168736719194,"lng":-1.0057982895523312},{"lat":51.37394211276064,"lng":-0.9596557449549438},{"lat":51.353369031707764,"lng":-0.9025268722325565},{"lat":51.347881294944216,"lng":-0.8651732560247184},{"lat":51.32866911860522,"lng":-0.8234251756221057},{"lat":51.31082203572863,"lng":-0.7860717270523311},{"lat":51.28335135620783,"lng":-0.6981811020523311},{"lat":51.291594301829406,"lng":-0.5905150528997184},{"lat":51.32043285621175,"lng":-0.5267943162471057},{"lat":51.36434245505222,"lng":-0.43670645914971834},{"lat":51.37805558339966,"lng":-0.35321029834449297},{"lat":51.3506252193158,"lng":-0.313659617677331},{"lat":51.32180564750844,"lng":-0.3004760574549437},{"lat":51.29296795605501,"lng":-0.27191153727471834},{"lat":51.27510698339771,"lng":-0.20159910432994368},{"lat":51.31631415723791,"lng":-0.12249740771949293},{"lat":51.361599352206966,"lng":-0.08074949495494367},{"lat":51.36022772609213,"lng":-0.0038450304418802266},{"lat":51.32866906624522,"lng":0.04449474625289441},{"lat":51.30807559747286,"lng":0.08184819482266904},{"lat":51.28747293535334,"lng":0.1367800030857325},{"lat":51.26686102604075,"lng":0.20709243603050712},{"lat":51.2599882819768,"lng":0.2444462198764086},{"lat":51.22148222615174,"lng":0.33453390933573246},{"lat":51.18156698919849,"lng":0.3960574138909579},{"lat":51.14988546610741,"lng":0.4663701821118594},{"lat":51.109908194320916,"lng":0.5718386638909579},{"lat":51.107149852721776,"lng":0.6751100812107326},{"lat":51.053329467578955,"lng":0.7805788982659579},{"lat":51.014650651391285,"lng":0.8377076033502817},{"lat":50.9690233345503,"lng":0.9036255721002818},{"lat":50.93996435333021,"lng":0.9585572127252818},{"lat":50.921966522212145,"lng":0.9651490766555072}]'
    );
    var shipRoute = JSON.parse(
      '[{"lat":50.921966522212145,"lng":0.9651490766555072},{"lat":50.926120475839824,"lng":1.0437014233320954},{"lat":50.94965276094792,"lng":1.1008302960544827},{"lat":50.96210622406778,"lng":1.184326456859708},{"lat":50.98700308620511,"lng":1.2678226176649334},{"lat":51.014650625032424,"lng":1.3710940349847078},{"lat":51.018796350737,"lng":1.4677737560123207},{"lat":51.062994180347005,"lng":1.5600588452070954},{"lat":51.07265684948244,"lng":1.65234393440187},{"lat":51.08093750173957,"lng":1.7358400952070954},{"lat":51.11680330181327,"lng":1.7973634321242573},{"lat":51.136104124419646,"lng":1.8940431531518698},{"lat":51.137482451626596,"lng":2.0126956980675463},{"lat":51.18845145219318,"lng":2.1203612443059687},{"lat":51.1898282161464,"lng":2.2412108536809687},{"lat":51.18569780089507,"lng":2.335693342611194},{"lat":51.207632884080915,"lng":2.427429333329201},{"lat":51.18836197273001,"lng":2.519714422523976},{"lat":51.1677055637131,"lng":2.618591375648976},{"lat":51.129466960517135,"lng":2.6630860380828385}]'
    );
    var carRoute = JSON.parse(
      '[{"lat":51.129466960517135,"lng":2.6630860380828385},{"lat":51.07664802198799,"lng":2.738342452794314},{"lat":51.055941653758396,"lng":2.749328780919314},{"lat":51.00067931792692,"lng":2.7778932172805075},{"lat":50.943967078334666,"lng":2.826233077794314},{"lat":50.89794502437422,"lng":2.867431640625},{"lat":50.846655509682435,"lng":2.9003906250000004},{"lat":50.824458803489804,"lng":2.9619141295552254},{"lat":50.79669804718136,"lng":3.0190430022776127},{"lat":50.76475273687021,"lng":3.1025391630828385},{"lat":50.72444284265441,"lng":3.1772460602223873},{"lat":50.65207604172236,"lng":3.282714877277613},{"lat":50.60469890778924,"lng":3.357421942055226},{"lat":50.562855920362125,"lng":3.425537142902613},{"lat":50.5181824559931,"lng":3.495849743485451},{"lat":50.47905843134065,"lng":3.570556808263064},{"lat":50.47626260659788,"lng":3.629882913082838},{"lat":50.492339146862776,"lng":3.772155828773976},{"lat":50.514693454200405,"lng":3.903991766273976},{"lat":50.510502790942944,"lng":3.9633178710937504},{"lat":50.49792872905663,"lng":4.024841375648976},{"lat":50.48185790425272,"lng":4.073730502277614},{"lat":50.47347053735934,"lng":4.133056774735452},{"lat":50.4776644868276,"lng":4.20336937531829},{"lat":50.479062245100565,"lng":4.231933560222388}]'
    );
    var planeRoute1 = JSON.parse('[{"lat":50.48445898955202,"lng":4.251709654927255},{"lat":50,"lng":0}]');
    var planeRoute2 = JSON.parse('[{"lat":50,"lng":0},{"lat":51.15815239612826,"lng":-2.2055053710937504}]');

    var seqGroup = L.motion
      .seq([
        L.motion
          .polyline(
            trackRoute,
            {
              color: 'orangered',
            },
            {
              easing: L.Motion.Ease.easeInOutQuad,
            },
            {
              removeOnEnd: true,
              icon: L.divIcon({
                html: "<i class='fa fa-truck fa-2x fa-flip-horizontal' aria-hidden='true'></i>",
                iconSize: L.point(27.5, 24),
              }),
            }
          )
          .motionDuration(8000),
        L.motion
          .polyline(
            shipRoute,
            {
              color: 'steelblue',
            },
            {
              easing: L.Motion.Ease.easeInOutQuart,
            },
            {
              removeOnEnd: true,
              showMarker: true,
              icon: L.divIcon({
                html: "<i class='fa fa-ship fa-2x' aria-hidden='true'></i>",
                iconSize: L.point(27.5, 24),
              }),
            }
          )
          .motionDuration(9000),
        L.motion
          .polyline(
            carRoute,
            {
              colors: 'SlateGrey',
            },
            {
              easing: L.Motion.Ease.easeInOutElastic,
            },
            {
              removeOnEnd: true,
              icon: L.divIcon({
                html: "<i class='fa fa-car fa-2x' aria-hidden='true'></i>",
                iconSize: L.point(27.5, 24),
              }),
            }
          )
          .motionDuration(7000),
        L.motion.seq([
          L.motion
            .polyline(
              planeRoute1,
              {
                color: 'indigo',
              },
              null,
              {
                removeOnEnd: false,
                icon: L.divIcon({
                  html: "<i class='fa fa-plane fa-2x' aria-hidden='true' motion-base='-43'></i>",
                  iconSize: L.point(19, 24),
                }),
              }
            )
            .motionDuration(5000),
          L.motion
            .polyline(
              planeRoute2,
              {
                color: 'khaki',
              },
              null
            )
            .motionDuration(7000),
        ]),
      ])
      .addTo(map);

    seqGroup.on('click', function () {
      seqGroup.motionStart();
    });

    seqGroup.on('dblclick', function (e) {
      seqGroup.motionToggle();
    });

    setTimeout(function () {
      seqGroup.motionStart();
    }, 1000);

    /**
     * 热力图
     */
    let addressPoint = addressPoints.map((item) => {
      return [item[0], item[1]];
    });
    let heat = L.heatLayer(addressPoint).addTo(map);
    let draw = true;
    /**
     * 绘制热力图
     */

    map.on({
      movestart: function () {
        this.draw = false;
      },
      moveend: function () {
        this.draw = true;
      },
    });

    /**台风**/

    const getTF = (lat, ne, se, sw, nw) => {
      const TF = {
        longitude: 144.9,
        latitude: 26.2,
        radius7_quad: { ne: 350, se: 300, sw: 150, nw: 280 },
      };
      // 求出方位半径方向上弧形经纬度
      const getPoints = (center, cradius, startAngle) => {
        let radius = cradius / 90;
        let pointNum = 90;
        let endAngle = startAngle + 90;
        let points = [];
        let sin;
        let cos;
        let x;
        let y;
        let angle;

        for (var i = 0; i <= pointNum; i++) {
          angle = startAngle + ((endAngle - startAngle) * i) / pointNum;
          sin = Math.sin((angle * Math.PI) / 180);
          cos = Math.cos((angle * Math.PI) / 180);
          x = center[0] + radius * sin;
          y = center[1] + radius * cos;
          points.push([x, y]);
        }
        return points;
      };

      let r7Ne = getPoints(lat, ne, 0);
      let r7Nw = getPoints(lat, nw, 90);
      let r7Sw = getPoints(lat, sw, 180);
      let r7Se = getPoints(lat, se, 270);

      return [...r7Ne, ...r7Nw, ...r7Sw, ...r7Se];
    };
    var kk = getTF([26.2, 144.9], 148.4, 28.3, 995, 20);

    //台风添加

    L.polygon(kk, {
      fillColor: '#000',
      fillOpacity: 0.3,
      color: '#f0f0f0',
      weight: 1.5,
    }).addTo(map);
    /**
     * 测量区域
     */
    area(map);

    /**
     * 测量距离
     */
    distance(L);
    L.control.measure({}).addTo(map);

    /**
     * 绘制点
     */
    point({ map });

    /**
     * 绘制运动轨迹
     */

    trajectory({ map, L });

    /**
     * 雷达扫描
     */
    rader({ map });
    /**
     * 扇形扫描
     */
    sectorScan({ map });

    // 监听 mousemove 事件
    map.on('mousemove', (e) => {
      let latlng = e.latlng;
      this.lat = latlng.lat.toFixed(4);
      this.lon = latlng.lng.toFixed(4);
      if (this.draw) {
        heat.addLatLng(e.latlng);
      }
    });
  },
};
</script>

<style scoped>
#map {
  height: 100vh;
  z-index: 900;
}
#mapButton {
  position: absolute;
  z-index: 10000;
  top: 10px;
  left: 50px;
}
.latAntLon {
  width: 250px;
  height: 25px;
  line-height: 25px;
  background-color: #fff;
  opacity: 0.8;
  position: absolute;
  top: 95vh;
  left: -20px;
}
.leaflet-div-icon {
  background: transparent !important;
  border: none !important;
  color: white;
}

.red {
  color: red !important;
}
</style>
