
export const area = (map) => {

  var DRAWING = false; //是否正在绘制
  var BarDRAWLAYERS = [];
  var MEASUREAREATOOLTIP; //量面提示
  var DRAWPOLYGON; //绘制的面
  var DRAWMOVEPOLYGON; //绘制过程中的面
  var DRAWPOLYGONPOINTS = []; //绘制的面的节点集
  let marker = null;

  var MEASURERESULT = 0; //测量结果

  //测量面积按钮点击事件
  $('#areaMeasure').click(function () {
    //开始绘制多边形
    startDrawPolygon();
  });

  /*多边形*/
  function startDrawPolygon(func) {
    MEASURERESULT = 0;
    map.getContainer().style.cursor = 'crosshair';
    //地图添加鼠标按下事件
    map.on('mousedown', function (e) {
      DRAWING = true;
      DRAWPOLYGONPOINTS.push(e.latlng);
      DRAWPOLYGON.addLatLng(e.latlng);
    });
    //地图添加鼠标移动事件
    map.on('mousemove', function (e) {
      if (DRAWING) {
        //清除上次数据
        if (DRAWMOVEPOLYGON != undefined && DRAWMOVEPOLYGON != null) {
          map.removeLayer(DRAWMOVEPOLYGON);
        }
        var prevPoint = DRAWPOLYGONPOINTS[DRAWPOLYGONPOINTS.length - 1];
        var firstPoint = DRAWPOLYGONPOINTS[0];
        DRAWMOVEPOLYGON = new L.Polygon([firstPoint, prevPoint, e.latlng], shapeOptions);
        map.addLayer(DRAWMOVEPOLYGON);
      }
    });

    //地图添加鼠标双击事件
    map.on('dblclick', function (e) {
      map.getContainer().style.cursor = '';
      var tempPoints = [];
      for (var i = 0; i < DRAWPOLYGONPOINTS.length; i++) {
        tempPoints.push(DRAWPOLYGONPOINTS[i]);
      }
      tempPoints.push(e.latlng);
      //计算面积
      var distance = CalArea(tempPoints);
      //声明标记
      marker = new L.Marker(e.latlng, {
        draggable: false
      });
      //地图上添加标记
      map.addLayer(marker);
      //标记弹窗显示面积
      marker.bindPopup("总面积：" + (distance / 1000000).toFixed(3) + '平方公里').openPopup();
      if (DRAWING) {
        if (DRAWMOVEPOLYGON != undefined && DRAWMOVEPOLYGON != null) {
          map.removeLayer(DRAWMOVEPOLYGON);
          DRAWMOVEPOLYGON = null;
        }
        BarDRAWLAYERS.push(DRAWPOLYGON);
        if (func) {
          func(DRAWPOLYGONPOINTS);
        }
        DRAWPOLYGONPOINTS = [];
        DRAWING = false;
        //地图移除事件
        map.off('mousedown');
        map.off('mousemove');
        map.off('dblclick');
      }
    });

    var shapeOptions = {
      color: '#F54124',
      weight: 3,
      opacity: 0.8,
      fill: true,
      fillColor: null,
      fillOpacity: 0.2,
      clickable: true
    },

      DRAWPOLYGON = new L.Polygon([], shapeOptions);
    map.addLayer(DRAWPOLYGON);

    //计算面积
    function CalArea(latLngs) {
      var pointsCount = latLngs.length,
        area = 0.0,
        d2r = Math.PI / 180,
        p1, p2;
      if (pointsCount > 2) {
        for (var i = 0; i < pointsCount; i++) {
          p1 = latLngs[i];
          p2 = latLngs[(i + 1) % pointsCount];
          area += ((p2.lng - p1.lng) * d2r) *
            (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
        }
        area = area * 6378137.0 * 6378137.0 / 2.0;
      }
      return Math.abs(area);
    }
  }

  //清除按钮点击事件
  $('#clearMeasure').click(function () {
    qingchu()
  })

  //执行清除方法
  function qingchu(func) {
    for (var i = 0; i < BarDRAWLAYERS.length; i++) {
      //移除图层
      map.removeLayer(BarDRAWLAYERS[i]);
    }
    //清空数组
    BarDRAWLAYERS = [];
    if (marker) {
      map.removeLayer(marker)
    }
  }
}
