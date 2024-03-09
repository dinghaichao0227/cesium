  / 加速——速度 * 2：
viewer.clockViewModel.multiplier *= 2;

// 减速——速度 / 2
viewer.clockViewModel.multiplier /= 2;

// 开始/暂停
viewer.clock.shouldAnimate = true/false;

// 重置
viewer.clock.currentTime = viewer.clock.startTime;

// 循环/不循环
// 时间轴执行完后停止（LOOP_STOP为循环，UNBOUNDED为继续读秒）
viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;


/**
* 关闭浏览器监听事件
* 运动轨迹
* 将所有点连接
* 运行行程
*


*/


<template>
  <div>
    <h1>监听浏览器关闭</h1>
  </div>
</template>

<script>
export default {
  mounted () {
    window.addEventListener('beforeunload', this.onBeforeUnload)
  },
  beforeDestroy () {
    window.removeEventListener('beforeunload', this.onBeforeUnload)
  },
  methods: {
    onBeforeUnload (event) {
      event.preventDefault()
      event.returnValue = '确定要离开吗？'
    }
  }
}


<div style="position: relactive" >
  <ul>
  <li id="drawpoint" > 点击开始画点 < /li>
    < li id = "drawline" > 点击开始画线 < /li>
      < li id = "drawplane" > 点击开始画面 < /li>
        < /ul>

        < span id = "point" style = "position: absolute; z-index: 1" > fllow me < /span>
          < div id = "cesiumContainer" > </div>
            < /div>


import * as Cesium from "cesium";
import { Viewer } from "cesium";
const viewer = new Viewer("cesiumContainer", {
  infoBox: false, // If set to false, the InfoBox widget will not be created.
  terrainProvider: Cesium.createWorldTerrain({
    requesWaterMask: true,
    requestVertexNormals: true
  })
});

// 绘制点
document
  .getElementById("drawpoint")
  .addEventListener("click", function () {
    let tempEntities = [];
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    var tooltip = document.getElementById("point");
    handler.setInputAction(function (movement) {
      tooltip.style.left = movement.endPosition.x + "px";
      tooltip.style.top = movement.endPosition.y + "px";
      // sceneTransformWorld(tooltip.style.left,tooltip.style.top)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(function (movement) {
      let position = viewer.camera.pickEllipsoid(
        movement.position,
        viewer.scene.globe.ellipsoid
      );
      // 调用函数画点
      let point = drawPoint(position);
      tempEntities.push(point);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(function () {
      // 关闭事件句柄
      handler.destroy();
      handler = null;
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    handler.setInputAction(function () {
      handler.destroy();
      handler = null;
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  });

// 添加点
function drawPoint(position, config) {
  var config = config ? config : {};
  var pointGeometry = viewer.entities.add({
    name: "点几何对象",
    position: position,
    point: {
      color: Cesium.Color.SKYBLUE,
      pixelSize: 10,
      outlineColor: Cesium.Color.YELLOW,
      outlineWidth: 3,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
  return pointGeometry;
}

//绘制线
document
  .getElementById("drawline")
  .addEventListener("click", function () {
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    var tempPoints = [];
    let tempEntities = [];
    var tooltip = document.getElementById("point");
    //左键点击操作
    handler.setInputAction(function (click) {
      //调用获取位置信息的接口
      let position = viewer.camera.pickEllipsoid(
        click.position,
        viewer.scene.globe.ellipsoid
      );
      tempPoints.push(position);
      let tempLength = tempPoints.length;
      //调用绘制点的接口
      let point = drawPoint(tempPoints[tempPoints.length - 1]);
      tempEntities.push(point);
      if (tempLength > 1) {
        // 把倒数2根线连起来
        let pointline = drawPolyline([
          tempPoints[tempPoints.length - 2],
          tempPoints[tempPoints.length - 1],
        ]);
        tempEntities.push(pointline);
      } else {
        console.log("开始绘制");
      }
      return;
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //右键点击操作
    handler.setInputAction(function (click) {
      // 大于3根就连在一起
      if (tempPoints.length > 2) {
        drawPolyline([tempPoints[0], tempPoints[tempPoints.length - 1]]);
      }

      console.log("绘制结束");
      tempPoints = [];
      handler.destroy(); //关闭事件句柄
      handler = null;
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  });

// 添加线
function drawPolyline(positions, config) {
  if (positions.length < 1) return;
  var config = config ? config : {};
  var polylineGeometry = viewer.entities.add({
    name: "线几何对象",
    polyline: {
      positions: positions,
      width: config.width ? config.width : 5.0,
      material: new Cesium.PolylineGlowMaterialProperty({
        color: config.color
          ? new Cesium.Color.fromCssColorString(config.color)
          : Cesium.Color.GOLD,
      }),
      depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({
        color: config.color
          ? new Cesium.Color.fromCssColorString(config.color)
          : Cesium.Color.GOLD,
      }),
    },
  });
  return polylineGeometry;
}


//绘制面
document
  .getElementById("drawplane")
  .addEventListener("click", function () {
    var tempPoints = [];
    let tempEntities = []
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    //左键点击操作
    handler.setInputAction(function (click) {
      //调用获取位置信息的接口
      let position = viewer.camera.pickEllipsoid(
        click.position,
        viewer.scene.globe.ellipsoid
      );
      tempPoints.push(position);
      let tempLength = tempPoints.length;
      //调用绘制点的接口
      let point = drawPoint(position);
      tempEntities.push(point);
      if (tempLength > 1) {
        let pointline = drawPolyline([
          tempPoints[tempPoints.length - 2],
          tempPoints[tempPoints.length - 1],
        ]);
        tempEntities.push(pointline);
      } else {
        console.log("请绘制下一个点，右键结束");
      }
      return;
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //右键点击操作
    handler.setInputAction(function (click) {
      let cartesian = viewer.camera.pickEllipsoid(
        click.position,
        viewer.scene.globe.ellipsoid
      );
      if (cartesian) {
        let tempLength = tempPoints.length;
        if (tempLength < 3) {
          alert("请选择3个以上的点再执行闭合操作命令");
        } else {
          //闭合最后一条线
          let pointline = drawPolyline([
            tempPoints[tempPoints.length - 1],
            tempPoints[0],
          ]);
          tempEntities.push(pointline);
          drawPolygon(tempPoints);
          tempEntities.push(tempPoints);
          handler.destroy(); //关闭事件句柄
          handler = null;
        }
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    // 绘制面函数
    function drawPolygon(positions, config) {
      if (positions.length < 2) return;
      var config = config ? config : {};
      var polygonGeometry = viewer.entities.add({
        name: "线几何对象",
        polygon: {
          height: 0.1,
          hierarchy: new Cesium.PolygonHierarchy(positions),
          material: config.color
            ? new Cesium.Color.fromCssColorString(config.color).withAlpha(
              0.2
            )
            : new Cesium.Color.fromCssColorString("red").withAlpha(
              0.2
            ),
          perPositionHeight: true,
        },
      });
      return polygonGeometry;
    }
  });





// 有可能会用到

  /////////////// 环绕飞行 ///////
  // const viewer = new Cesium.Viewer('cesiumContainer', {
  //   infoBox: false, //Disable InfoBox widget
  //   selectionIndicator: false, //Disable selection indicator
  //   shouldAnimate: true, // Enable animations
  //   terrain: Cesium.Terrain.fromWorldTerrain(),
  // });

  // Enable lighting based on the sun position
  // viewer.scene.globe.enableLighting = true;

  // //Enable depth testing so things behind the terrain disappear.
  // viewer.scene.globe.depthTestAgainstTerrain = true;

  // //Set the random number seed for consistent results.
  // Cesium.Math.setRandomNumberSeed(3);

  // //Set bounds of our simulation time
  // const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
  // const stop = Cesium.JulianDate.addSeconds(start, 360, new Cesium.JulianDate());

  // //Make sure viewer is at the desired time.
  // viewer.clock.startTime = start.clone();
  // viewer.clock.stopTime = stop.clone();
  // viewer.clock.currentTime = start.clone();
  // viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
  // viewer.clock.multiplier = 10;

  // //Set timeline to simulation bounds
  // viewer.timeline.zoomTo(start, stop);

  // //Generate a random circular pattern with varying heights.
  // function computeCirclularFlight(lon, lat, radius) {
  //   const property = new Cesium.SampledPositionProperty();
  //   for (let i = 0; i <= 360; i += 45) {
  //     const radians = Cesium.Math.toRadians(i);
  //     const time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
  //     const position = Cesium.Cartesian3.fromDegrees(
  //       lon + radius * 1.5 * Math.cos(radians),
  //       lat + radius * Math.sin(radians),
  //       Cesium.Math.nextRandomNumber() * 500 + 1750
  //     );
  //     property.addSample(time, position);

  //     //Also create a point for each sample we generate.
  //     viewer.entities.add({
  //       position: position,
  //       point: {
  //         pixelSize: 8,
  //         color: Cesium.Color.TRANSPARENT,
  //         outlineColor: Cesium.Color.YELLOW,
  //         outlineWidth: 3,
  //       },
  //     });
  //   }
  //   return property;
  // }

  // //Compute the entity position property.
  // const position = computeCirclularFlight(-112.110693, 36.0994841, 0.03);

  // //Actually create the entity
  // const entity = viewer.entities.add({
  //   //Set the entity availability to the same interval as the simulation time.
  //   availability: new Cesium.TimeIntervalCollection([
  //     new Cesium.TimeInterval({
  //       start: start,
  //       stop: stop,
  //     }),
  //   ]),

  //   //Use our computed positions
  //   position: position,

  //   //Automatically compute orientation based on position movement.
  //   orientation: new Cesium.VelocityOrientationProperty(position),

  //   //Load the Cesium plane model to represent the entity
  //   model: {
  //     uri: '../../assets/Cesium_Air.glb',
  //     minimumPixelSize: 64,
  //   },

  //   //Show the path as a pink line sampled in 1 second increments.
  //   path: {
  //     resolution: 1,
  //     material: new Cesium.PolylineGlowMaterialProperty({
  //       glowPower: 0.1,
  //       color: Cesium.Color.YELLOW,
  //     }),
  //     width: 10,
  //   },
  // });

  // //Add button to view the path from the top down
  // Sandcastle.addDefaultToolbarButton('View Top Down', function () {
  //   viewer.trackedEntity = undefined;
  //   viewer.zoomTo(viewer.entities, new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90)));
  // });

  // //Add button to view the path from the side
  // Sandcastle.addToolbarButton('View Side', function () {
  //   viewer.trackedEntity = undefined;
  //   viewer.zoomTo(
  //     viewer.entities,
  //     new Cesium.HeadingPitchRange(Cesium.Math.toRadians(-90), Cesium.Math.toRadians(-15), 7500)
  //   );
  // });

  // //Add button to track the entity as it moves
  // Sandcastle.addToolbarButton('View Aircraft', function () {
  //   viewer.trackedEntity = entity;
  // });

  // //Add a combo box for selecting each interpolation mode.
  // Sandcastle.addToolbarMenu(
  //   [
  //     {
  //       text: 'Interpolation: Linear Approximation',
  //       onselect: function () {
  //         entity.position.setInterpolationOptions({
  //           interpolationDegree: 1,
  //           interpolationAlgorithm: Cesium.LinearApproximation,
  //         });
  //       },
  //     },
  //     {
  //       text: 'Interpolation: Lagrange Polynomial Approximation',
  //       onselect: function () {
  //         entity.position.setInterpolationOptions({
  //           interpolationDegree: 5,
  //           interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
  //         });
  //       },
  //     },
  //     {
  //       text: 'Interpolation: Hermite Polynomial Approximation',
  //       onselect: function () {
  //         entity.position.setInterpolationOptions({
  //           interpolationDegree: 2,
  //           interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
  //         });
  //       },
  //     },
  //   ],
  //   'interpolationMenu'
  // );
const startPoint = [
    7292687.487964332,

    -55393460.97952435,

    39349949.17105431,
  ];
  // 将世界坐标转换为经纬度高度
  let cartesian3 = new Cesium.Cartesian3(
    Math.abs(startPoint[0]),
    Math.abs(startPoint[1]),
    Math.abs(startPoint[1]),
    startPoint[2]
  );
  let cartographic1 = Cesium.Cartographic.fromCartesian(cartesian3);
  let lat = 180 - Cesium.Math.toDegrees(cartographic1.latitude);
  let lon = Cesium.Math.toDegrees(cartographic1.longitude);
  let alt = cartesian3.height;
  console.log(lat, 988);
  let heatmap = h337.create(config);
  heatmap.setData({
    data: [
      { lon: 120, lat: 100, value: 23 },
      { lon: 120, lat: 110, value: 23 },
      { lon: 120, lat: 120, value: 23 },
      { lon: 120, lat: 110, value: 23 },
      { lon: 160, lat: 40, value: 23 },
      { lon: 130, lat: 50, value: 23 },
    ],
    max: 30,
    min: 0,
  });





/**
 * @description cesium绘制 点、线、面
 * @export
 * @class Draw
 * @example
 * let draw = new Draw(viewer)
 * draw.drawCircle();
 */
export default class Draw {
    constructor(viewer, config) {
        /**cesium实例对象 */
        this.viewer = viewer;
        // 默认配置
        this.config = config || {
            // 几何-边框宽度
            borderWidth: 2,
            // 几何-边框颜色
            borderColor: Cesium.Color.WHITE,
            lineColor: Cesium.Color.fromCssColorString("#00ffff"),
            // 填充材质
            material: Cesium.Color.fromCssColorString("#00ffff").withAlpha(0.4)
        };
        /**存贮绘制的数据 坐标 */
        this.infoDetail = { point: [], line: [], rectangle: [], circle: [], planeSelf: [] };
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    }
    /*******
     * @function: function
     * @return {*}
     * @description: 绘制点数据
     */
    drawPoint() {
        this.handler.destroy();

        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.handler.setInputAction((click) => {
            /**点击位置笛卡尔坐标 */
            let cartesian = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid);
            /**笛卡尔转弧度坐标 */
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic());
            /**点击位置经度 */
            let lng = Cesium.Math.toDegrees(cartographic.longitude);
            /**点击位置维度 */
            let lat = Cesium.Math.toDegrees(cartographic.latitude);
            /**实体的唯一标注 */
            let id = new Date().getTime();
            this.viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
                name: 'point',
                id: id,
                point: {
                    color: this.config.material,
                    pixelSize: 12,
                    outlineColor: this.config.borderColor,
                    outlineWidth: this.config.borderWidth
                }
            });
            this.infoDetail.point.push({ id: id, position: [lng, lat] });

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.handler.setInputAction((click) => {
            this.handler.destroy();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    /*******
     * @function: function
     * @description: 绘制矩形区域
     * @return {*}
     */
    drawRectangle() {
        this.handler.destroy();
        /**
         * 矩形四点坐标
         */
        let westSouthEastNorth = [];
        /**实体的唯一标注 */
        let id = null;
        // 矩形绘制类型-- polygon、rectangle
        const rectangleType = 'polygon';
        /**地图点击对象 */
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.handler.setInputAction((click) => {
            /**点击位置笛卡尔坐标 */
            let cartesian = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid);
            /**笛卡尔转弧度坐标 */
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic());
            /**点击位置经度 */
            let lng1 = Cesium.Math.toDegrees(cartographic.longitude);
            /**点击位置维度 */
            let lat1 = Cesium.Math.toDegrees(cartographic.latitude);
            /**边框坐标 */
            westSouthEastNorth = [lng1, lat1];
            id = new Date().getTime();
            if (westSouthEastNorth) {
                this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            }
            // 面实例对象
            const rectangleStyle = {
                height: 0,
                // 填充的颜色，withAlpha透明度
                material: this.config.material,
                // 是否被提供的材质填充
                fill: true,
                // 是否显示
                show: true,
            };
            //
            let rectangleOptions = {
                name: 'rectangle',
                id: id,
                polyline: {
                    positions: new Cesium.CallbackProperty(function () { return Cesium.Cartesian3.fromDegreesArray(westSouthEastNorth) }),
                    material: this.config.borderColor,
                    width: this.config.borderWidth,
                    zIndex: 1
                }
            }
            // 根据polygon绘制矩形
            if (rectangleType === 'polygon') {
                rectangleOptions['polygon'] = {
                    hierarchy: new Cesium.CallbackProperty(function () {
                        return {
                            positions: Cesium.Cartesian3.fromDegreesArray(westSouthEastNorth)
                        }
                    }),
                    ...rectangleStyle
                };
            }
            // 根据rectangle绘制矩形
            if (rectangleType === 'rectangle') {
                rectangleOptions['rectangle'] = {
                    coordinates: new Cesium.CallbackProperty(function () {
                        const rectangle = Cesium.Rectangle.fromCartesianArray(Cesium.Cartesian3.fromDegreesArray(westSouthEastNorth));
                        // 计算矩形四个角的坐标，绘制完成调用，此处为测试
                        // 西北角弧度坐标（左上）
                        // const northwest = Cesium.Rectangle.northwest(rectangle);
                        // 西南角弧度坐标（左下）
                        // const southwest = Cesium.Rectangle.southwest(rectangle);
                        // 东北角弧度坐标（右上）
                        // const northeast = Cesium.Rectangle.northeast(rectangle);
                        // 东南角弧度坐标（右下）
                        // const southeast = Cesium.Rectangle.southeast(rectangle);
                        // console.log(Cesium.Math.toDegrees(northwest.longitude));
                        // console.log(Cesium.Math.toDegrees(northwest.latitude));
                        // console.log(northwest.height);
                        return rectangle;
                    }, false),
                    ...rectangleStyle
                };
            }
            /**面实例对象 */
            let polygons = this.viewer.entities.add(rectangleOptions);
            this.handler.setInputAction((move) => {
                let cartesian = this.viewer.camera.pickEllipsoid(move.endPosition, this.viewer.scene.globe.ellipsoid);
                let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic());
                let lng = Cesium.Math.toDegrees(cartographic.longitude);
                let lat = Cesium.Math.toDegrees(cartographic.latitude);

                westSouthEastNorth = [lng1, lat1, lng1, lat, lng, lat, lng, lat1, lng1, lat1];


            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.handler.setInputAction(() => {
            this.handler.destroy();
            this.infoDetail.rectangle.push({ id: id, position: westSouthEastNorth });
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    /*******
     * @function: function
     * @description: 绘制圆形区域
     * @return {*}
     */
    drawCircle() {
        this.handler.destroy();
        /**实体的唯一标注 */
        let id = null;
        /**圆半径 */
        let radius = 0;
        /**圆心 */
        let lngLat = [];
        // 圆边界坐标
        let boundaryPositions = [];
        /**鼠标事件 */
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.handler.setInputAction((click) => {
            id = new Date().getTime();
            let cartesian = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid);
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic());
            let lng = Cesium.Math.toDegrees(cartographic.longitude);
            let lat = Cesium.Math.toDegrees(cartographic.latitude);
            lngLat = [lng, lat];
            let entity = this.viewer.entities.add({
                position: new Cesium.CallbackProperty(function () { return new Cesium.Cartesian3.fromDegrees(...lngLat, 0) }, false),
                name: 'circle',
                id: id,
                ellipse: {
                    height: 0,
                    material: this.config.material
                },
                polyline: {
                    width: this.config.borderWidth,
                    material: this.config.borderColor
                }
            });

            entity.ellipse.semiMajorAxis = new Cesium.CallbackProperty(function () { return radius; }, false);
            entity.ellipse.semiMinorAxis = new Cesium.CallbackProperty(function () { return radius; }, false);
            entity.polyline.positions = new Cesium.CallbackProperty(function () { return boundaryPositions; }, false);

            if (lngLat) {
                this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            }
            this.handler.setInputAction((move) => {
                boundaryPositions = [];
                let cartesian2 = this.viewer.camera.pickEllipsoid(move.endPosition, this.viewer.scene.globe.ellipsoid);
                if (Cesium.defined(cartesian2)) {
                    radius = Cesium.Cartesian3.distance(cartesian, cartesian2);
                    // 计算几何体圆的轮廓
                    let circleOutlineGeometryCreate = Cesium.CircleOutlineGeometry.createGeometry(new Cesium.CircleOutlineGeometry({
                        center: new Cesium.Cartesian3.fromDegrees(...lngLat, 0),
                        radius: radius || 1,
                        granularity: 0.01
                    }));
                    // 获取几何体圆的边界坐标
                    let positions = [].slice.call(circleOutlineGeometryCreate.attributes.position.values);
                    for (let i = 0; i < positions.length; i += 3) {
                        boundaryPositions.push(new Cesium.Cartesian3(positions[i], positions[i + 1], positions[i + 2]));
                    }
                    // 添加第一个点，实现闭合圆
                    if (boundaryPositions.length !== 0) {
                        boundaryPositions.push(boundaryPositions[0]);
                    }
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.handler.setInputAction(() => {
            this.infoDetail.circle.push({ id: id, center: lngLat, radius: radius });
            this.handler.destroy();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    /*******
     * @function: function
     * @description: 自定义区域绘制
     * @return {*}
     */
    drawPlane() {
        this.handler.destroy();
        /**实体的唯一标注 */
        let id = new Date().getTime();
        /**记录拐点坐标 */
        let positions = [],
            /**记录返回结果 */
            codeInfo = [],
            /**面的hierarchy属性 */
            polygon = new Cesium.PolygonHierarchy(),
            _polygonEntity = new Cesium.Entity(),
            /**面对象配置 */
            polyObj = null;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        // left
        this.handler.setInputAction((movement) => {
            let cartesian = this.viewer.camera.pickEllipsoid(movement.position, this.viewer.scene.globe.ellipsoid);
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic());
            let lng = Cesium.Math.toDegrees(cartographic.longitude);
            let lat = Cesium.Math.toDegrees(cartographic.latitude);


            if (cartesian && cartesian.x) {
                if (positions.length == 0) {
                    positions.push(cartesian.clone());
                }
                codeInfo.push([lng, lat]);
                positions.push(cartesian.clone());
                polygon.positions.push(cartesian.clone());
                if (!polyObj) {
                    _polygonEntity.polyline = {
                        width: this.config.borderWidth,
                        material: this.config.borderColor,
                        clampToGround: false
                    };
                    _polygonEntity.polyline.positions = new Cesium.CallbackProperty(function () {
                        return positions;
                    }, false);

                    _polygonEntity.polygon = {

                        hierarchy: new Cesium.CallbackProperty(function () {
                            return polygon;
                        }, false),

                        material: this.config.material,
                        clampToGround: false
                    }
                    _polygonEntity.name = 'planeSelf'

                    _polygonEntity._id = id;
                    polyObj = this.viewer.entities.add(_polygonEntity);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // mouse
        this.handler.setInputAction((movement) => {
            let cartesian = this.viewer.camera.pickEllipsoid(movement.endPosition, this.viewer.scene.globe.ellipsoid);
            if (Cesium.defined(cartesian)) {
                let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic());
                let lng = Cesium.Math.toDegrees(cartographic.longitude);
                let lat = Cesium.Math.toDegrees(cartographic.latitude);

                if (positions.length >= 0) {
                    if (cartesian && cartesian.x) {
                        positions.pop();
                        positions.push(cartesian);
                        polygon.positions.pop();
                        polygon.positions.push(cartesian);
                        codeInfo.pop();
                        codeInfo.push([lng, lat]);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // right
        this.handler.setInputAction((movement) => {
            this.infoDetail.planeSelf.push({ id: id, positions: codeInfo });

            this.handler.destroy();
            positions.push(positions[0]);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    }

    /*******
     * @function: function
     * @return {*}
     * @description: 绘制线段
     */
    drawLine() {
        this.handler.destroy();
        /**实体的唯一标注 */
        let id = null;
        /**记录拐点坐标 */
        let positions = [],
            /**记录返回结果 */
            codeInfo = [],
            /**面的hierarchy属性 */
            polygon = new Cesium.PolygonHierarchy(),
            _polygonEntity = new Cesium.Entity(),
            /**面对象配置 */
            polyObj = null;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        // left
        this.handler.setInputAction((movement) => {
            id = new Date().getTime();
            let cartesian = this.viewer.camera.pickEllipsoid(movement.position, this.viewer.scene.globe.ellipsoid);
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic());
            let lng = Cesium.Math.toDegrees(cartographic.longitude);
            let lat = Cesium.Math.toDegrees(cartographic.latitude);

            if (cartesian && cartesian.x) {
                if (positions.length == 0) {
                    positions.push(cartesian.clone());
                }
                codeInfo.push([lng, lat])
                positions.push(cartesian.clone());
                polygon.positions.push(cartesian.clone());
                if (!polyObj) {
                    _polygonEntity.polyline = {
                        width: this.config.borderWidth,
                        material: this.config.lineColor,
                        clampToGround: false
                    };
                    _polygonEntity.polyline.positions = new Cesium.CallbackProperty(function () {
                        return positions;
                    }, false);
                    _polygonEntity.name = 'line';
                    _polygonEntity._id = id;

                    polyObj = this.viewer.entities.add(_polygonEntity);
                }
            }

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // mouse
        this.handler.setInputAction((movement) => {
            let cartesian = this.viewer.camera.pickEllipsoid(movement.endPosition, this.viewer.scene.globe.ellipsoid);
            if (Cesium.defined(cartesian)) {
                let cartographic = Cesium.Cartographic.fromCartesian(cartesian, this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic());
                let lng = Cesium.Math.toDegrees(cartographic.longitude);
                let lat = Cesium.Math.toDegrees(cartographic.latitude);

                if (positions.length >= 0) {
                    if (cartesian && cartesian.x) {
                        positions.pop();
                        positions.push(cartesian);
                        codeInfo.pop();
                        codeInfo.push([lng, lat]);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // right
        this.handler.setInputAction((movement) => {
            this.infoDetail.line.push({ id: id, positions: codeInfo });
            this.handler.destroy();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    /*******
     * @function: function
     * @description: 移除实体对象
     * @return {*}
     */
    removeEntity() {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
        this.handler.setInputAction((move) => {
            /**实体对象信息  {id：entities，primitive：。。} */
            let pick = this.viewer.scene.pick(move.endPosition);

            if (pick && pick.id && pick.id.id) {
                document.body.style.cursor = "pointer";
                this.handler.setInputAction((click) => {
                    let newPoint;
                    switch (pick.id.name) {

                        case 'point':
                            /**删除某一条数据 */
                            newPoint = this.infoDetail.point.filter(item => item.id != pick.id._id);
                            this.infoDetail.point = newPoint;
                            break
                        case 'line':
                            /**删除某一条数据 */
                            newPoint = this.infoDetail.line.filter(item => item.id != pick.id._id);
                            this.infoDetail.line = newPoint;
                            break
                        case 'rectangle':
                            /**删除某一条数据 */
                            newPoint = this.infoDetail.rectangle.filter(item => item.id != pick.id._id);
                            this.infoDetail.rectangle = newPoint;
                            break

                        case 'planeSelf':
                            /**删除某一条数据 */
                            newPoint = this.infoDetail.planeSelf.filter(item => item.id != pick.id._id);
                            this.infoDetail.planeSelf = newPoint;
                            break
                        case 'circle':
                            /**删除某一条数据 */
                            newPoint = this.infoDetail.circle.filter(item => item.id != pick.id._id);
                            this.infoDetail.circle = newPoint;
                            break
                        default: break
                    }
                    this.viewer.entities.remove(pick.id);
                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            } else {

                document.body.style = "cursor: default;";

            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    /*******
     * @function: function
     * @return {*}
     * @description: 返回绘制数据
     */
    backInfoDetail() {
        return this.infoDetail;
    }
    /**
     * @description 计算空间两点间距离(计算第一个点、最后一个点)-方法1
     * @param {*} lat1
     * @param {*} lng1
     * @param {*} lat2
     * @param {*} lng2
     * @return {*} m
     */
    getSpaceDistance_first_last_1(lat1, lng1, lat2, lng2) {
        var EARTH_RADIUS = 6378137.0;    //单位M
        var PI = Math.PI;

        function getRad(d) {
            return d * PI / 180.0;
        }
        var f = getRad((lat1 + lat2) / 2);
        var g = getRad((lat1 - lat2) / 2);
        var l = getRad((lng1 - lng2) / 2);

        var sg = Math.sin(g);
        var sl = Math.sin(l);
        var sf = Math.sin(f);

        var s, c, w, r, d, h1, h2;
        var a = EARTH_RADIUS;
        var fl = 1 / 298.257;

        sg = sg * sg;
        sl = sl * sl;
        sf = sf * sf;

        s = sg * (1 - sl) + (1 - sf) * sl;
        c = (1 - sg) * (1 - sl) + sf * sl;

        w = Math.atan(Math.sqrt(s / c));
        r = Math.sqrt(s * c) / w;
        d = 2 * w * a;
        h1 = (3 * r - 1) / 2 / c;
        h2 = (3 * r + 1) / 2 / s;

        return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
    }
    /**
     * @description 计算空间两点间距离(计算数组第一个点、最后一个点)-方法2
     * @param {*} positions [Cartesian3 { x, y, z }]
     * @return {*} m
     */
    getSpaceDistance_first_last_2(positions) {
        let distance = 0;
        for (let i = 0; i < positions.length - 1; i++) {
            const point1cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
            const point2cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
            // 根据经纬度计算出距离
            const geodesic = new Cesium.EllipsoidGeodesic();
            // 设置测地线的起点和终点
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            // 获取起点和终点之间的表面距离
            let s = geodesic.surfaceDistance;
            //返回两点之间的距离
            s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
            distance = s;
        }
        return distance.toFixed(2);
    }
    /**
     * @description 空间两点距离计算函数(每次计算数组最后两个点之间的距离)
     * @param {*} positions [Cartesian3 { x, y, z }]
     * @return {*} m
     */
    getSpaceDistance_last_last(positions) {
        let distance = 0;
        for (let i = 0; i < positions.length - 1; i++) {
            const point1cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
            const point2cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 2]);
            // 根据经纬度计算出距离
            const geodesic = new Cesium.EllipsoidGeodesic();
            // 设置测地线的起点和终点
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            // 获取起点和终点之间的表面距离
            let s = geodesic.surfaceDistance;
            //返回两点之间的距离
            s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
            distance = s;
        }
        return distance.toFixed(2);
    }
    /**
     * @description 空间两点距离计算函数(所有点之间的距离相加)
     * @param {*} positions Cartesian3 { x, y, z }
     * @return {*} m
     */
    getSpaceDistance_all(positions) {
        let distance = 0;
        for (let i = 0; i < positions.length - 1; i++) {
            const point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
            const point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
            // 根据经纬度计算出距离
            const geodesic = new Cesium.EllipsoidGeodesic();
            // 设置测地线的起点和终点
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            // 获取起点和终点之间的表面距离
            let s = geodesic.surfaceDistance;
            //返回两点之间的距离
            s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
            distance = distance + s;
        }
        return distance.toFixed(2);
    }
}
