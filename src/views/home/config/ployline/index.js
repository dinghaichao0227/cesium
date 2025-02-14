
export const graphicals = (viewer, Cesium, pos, colorS) => {
  console.log(pos, '====');
  let polyGon = viewer.entities.add({
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(
        Cesium.Cartesian3.fromDegreesArray(pos)
      ),
      outline: true,
      material: Cesium.Color.fromCssColorString(colorS),
      outlineWidth: 4,
    },

  });
  var polyPositions = polyGon.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
  var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;//中心点
  polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
  polyGon.position = polyCenter;

  polyGon.label = {
    text: 'nihao',
    color: Cesium.Color.fromCssColorString('#fff'),
    font: 'normal 32px MicroSoft YaHei',
    showBackground: true,
    scale: 0.5,
    horizontalOrigin: Cesium.HorizontalOrigin.LEFT_CLICK,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    disableDepthTestDistance: 100000.0
  };
}
