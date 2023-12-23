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
