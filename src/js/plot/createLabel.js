import '../prompt/prompt.css'
import Prompt from '../prompt/prompt.js'
import BasePlot from './basePlot';
import util from "../util";
/**
 * 文字标绘类
 * @class
 * @augments BasePlot
 * @alias BasePlot.CreateLabel
 */
class CreateLabel extends BasePlot {
  constructor(viewer, style) {
    super(viewer, style);
    this.type = "label";
    this.viewer = viewer;
    this.style = style;
    /**
     * @property {Cesium.Cartesian3} 坐标
     */
    this.position = null;
    this.linePosition = null;
    this.pointPosition = null;
  }
  createPoint(position) {
    console.log(position, 1111111111111111111);
    if (!position) return;
    this.pointStyle.color = this.pointStyle.color || Cesium.Color.CORNFLOWERBLUE;
    this.pointStyle.outlineColor = this.pointStyle.color || Cesium.Color.CORNFLOWERBLUE;

    let color = this.pointStyle.color instanceof Cesium.Color ? this.pointStyle.color : Cesium.Color.fromCssColorString(this.pointStyle.color);
    color = color.withAlpha(this.pointStyle.colorAlpha || 1);

    let outlineColor = this.pointStyle.outlineColor instanceof Cesium.Color ? this.pointStyle.outlineColor : Cesium.Color.fromCssColorString(this.pointStyle.outlineColor);
    outlineColor = outlineColor.withAlpha(this.pointStyle.outlineColorAlpha || 1);

    return this.viewer.entities.add({
        position: position,
        point: {
            pixelSize: this.pointStyle.property || 10,
            color: color,
            outlineWidth: this.pointStyle.outlineWidth || 0,
            outlineColor: outlineColor,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        show: true
    });
}

  start(callback) {
    // console.log(this.label, 88882223333);
    if (!this.prompt && this.promptStyle.show)
      this.prompt = new Prompt(this.viewer, this.promptStyle);
    let that = this;


    this.state = "startCreate";
    if (!this.handler) this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.handler.setInputAction(function (evt) {
      //单击开始绘制
      let cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
      that.linePosition = cartesian
      if (!cartesian) return;
      that.entity = that.createPoint(cartesian);
			that.position = cartesian;
      that.entity = that.createLabel(cartesian.clone());
      that.position = cartesian.clone();
      that.endCreate();
      if (callback) callback(that.entity);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.handler.setInputAction(function (evt) {
      //单击开始绘制
      that.prompt.update(evt.endPosition, "单击新增");
      that.state = "creating";
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);



// 创建 ScreenSpaceEventHandler
var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

// 创建起始点和终点的位置
var startPosition;
var endPosition;

// 创建折线实体
var polyline;

// 监听鼠标左键按下事件
handler.setInputAction(function(event) {
    // 获取当前鼠标的表面位置
    var pickedObject = that.viewer.scene.pick(event.position);
    if ((Cesium.defined(pickedObject)) && pickedObject.primitive._renderedText === that.style.text) {
        // 如果选中了 Text 实体，则创建起始点，并将其绑定到 Text 实体的位置
        startPosition = pickedObject.id._position._value;
        console.log(startPosition, 9999966555);

        // 监听鼠标移动事件
        handler.setInputAction(function(event) {
            // 更新终点的位置
            var ray = that.viewer.camera.getPickRay(event.endPosition);
            var position = that.viewer.scene.globe.pick(ray, that.viewer.scene);
            if (Cesium.defined(position)) {
                endPosition = position;

                // 删除旧的折线
                if (Cesium.defined(polyline)) {
                  that.viewer.entities.remove(polyline);
              }
                // 创建新的折线
                polyline = that.viewer.entities.add({
                    polyline: {
                        positions: [that.pointPosition, endPosition],
                        width: 5,
                        material: Cesium.Color.RED
                    }
                });
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        ;
    }
}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

// 监听鼠标松开事件
handler.setInputAction(function(event) {

    // 取消鼠标移动事件的监听
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}, Cesium.ScreenSpaceEventType.LEFT_UP);



  }

  endCreate() {
    let that = this;
    if (that.handler) {
      that.handler.destroy();
      that.handler = null;
    }
    if (that.prompt) {
      that.prompt.destroy();
      that.prompt = null;
    }
    that.state = "endCreate";
  }

  /**
   * 当前步骤结束
   */
  done() {
    if (this.state == "startCreate") {
      this.destroy();
    } else if (this.state == "creating") {
      this.destroy();
    } else if (this.state == "startEdit" || this.state == "editing") {
      this.endEdit();
    } else {

    }
  }

  createByPositions(lnglatArr, callback) {
    if (!lnglatArr) return;
    this.state = "startCreate";
    let position =
      lnglatArr instanceof Cesium.Cartesian3
        ? lnglatArr
        : Cesium.Cartesian3.fromDegrees(
          lnglatArr[0],
          lnglatArr[1],
          lnglatArr[2]
        );
    this.position = position;
    if (!position) return;
    this.entity = this.createLabel(position, this.style.text);
    if (callback) callback(this.entity);
    this.state = "endCreate";
  }

  // 设置相关样式
  setStyle(style) {
    if (!style) return;
    if (style.fillColor) {
      let fillColor =
        style.fillColor instanceof Cesium.Color
          ? style.fillColor
          : Cesium.Color.fromCssColorString(style.fillColor || "#ffff00");
      fillColor = fillColor.withAlpha(style.fillColorAlpha || 1);
      this.entity.label.fillColor = fillColor;
    }

    this.entity.label.outlineWidth = style.outlineWidth;
    if (style.backgroundColor) {
      let backgroundColor =
        style.backgroundColor instanceof Cesium.Color
          ? style.backgroundColor
          : Cesium.Color.fromCssColorString(style.backgroundColor || "#000000");
      backgroundColor = backgroundColor.withAlpha(
        style.backgroundColorAlpha || 1
      );
      this.entity.label.backgroundColor = backgroundColor;
    }

    if (style.outlineColor) {
      let outlineColor =
        style.outlineColor instanceof Cesium.Color
          ? style.outlineColor
          : Cesium.Color.fromCssColorString(style.outlineColor || "#000000");
      outlineColor = outlineColor.withAlpha(
        style.outlineColorAlpha || 1
      );
      this.entity.label.outlineColor = outlineColor;
    }

    if (style.heightReference != undefined)
      this.entity.label.heightReference = Number(style.heightReference);
    if (style.pixelOffset) this.entity.label.pixelOffset = style.pixelOffset;

    if (style.text) this.entity.label.text = style.text;

    if (style.showBackground != undefined)
      this.entity.label.showBackground = Boolean(style.showBackground);

    if (style.scale) {
      this.entity.label.scale = Number(style.scale);
    }


    this.style = Object.assign(this.style, style);
  }
  // 获取相关样式
  getStyle() {
    let obj = {};
    let label = this.entity.label;

    let fillColor = label.fillColor.getValue();
    obj.fillColorAlpha = fillColor.alpha;
    obj.fillColor = new Cesium.Color(
      fillColor.red,
      fillColor.green,
      fillColor.blue,
      1
    ).toCssHexString();

    if (label.outlineWidth != undefined) obj.outlineWidth = label.outlineWidth._value;
    if (label.showBackground != undefined) obj.showBackground = Boolean(label.showBackground.getValue());
    if (label.backgroundColor) {
      let bkColor = label.backgroundColor.getValue();
      obj.backgroundColorAlpha = bkColor.alpha;
      obj.backgroundColor = new Cesium.Color(bkColor.red, bkColor.green, bkColor.blue, 1).toCssHexString();
    }


    if (label.outlineColor) {
      let outlineColor = label.outlineColor.getValue();
      obj.outlineColorAlpha = outlineColor.alpha;
      obj.outlineColor = new Cesium.Color(outlineColor.red, outlineColor.green, outlineColor.blue, 1).toCssHexString();
    }

    if (label.heightReference != undefined) {
      obj.heightReference = label.heightReference.getValue();
    }

    if (label.pixelOffset) obj.pixelOffset = label.pixelOffset.getValue();

    if (label.scale) obj.scale = label.scale.getValue();

    obj.text = label.text.getValue();


    return obj;
  }
  getPositions(isWgs84) {
    return isWgs84 ? util.cartesianToLnglat(this.position) : this.position;
  }

  startEdit(callback) {
    if (this.state == "startEdit" || this.state == "editing" || !this.entity)
      return;
    this.state = "startEdit";
    if (!this.modifyHandler)
      this.modifyHandler = new Cesium.ScreenSpaceEventHandler(
        this.viewer.scene.canvas
      );
    let that = this;
    let editLabel;
    this.modifyHandler.setInputAction(function (evt) {
      let pick = that.viewer.scene.pick(evt.position);
      if (Cesium.defined(pick) && pick.id) {
        editLabel = pick.id;
        that.forbidDrawWorld(true);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    this.modifyHandler.setInputAction(function (evt) {
      if (!editLabel) return;
      let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
      if (!cartesian) return;
      if (that.entity) {
        that.entity.position.setValue(cartesian);
        that.position = cartesian;
        that.state = "editing";
      }
      if (callback) callback();
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.modifyHandler.setInputAction(function (evt) {
      if (!editLabel) return;
      that.forbidDrawWorld(false);
      if (that.modifyHandler) {
        that.modifyHandler.destroy();
        that.modifyHandler = null;
        that.state = "editing";
      }
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
  }
  endEdit(callback) {
    if (this.modifyHandler) {
      this.modifyHandler.destroy();
      this.modifyHandler = null;
      if (callback) callback(this.entity);
    }
    this.forbidDrawWorld(false);
    this.state = "endEdit";
  }
  createLabel(cartesian) {
    if (!cartesian) return;
    var label = this.viewer.entities.add({
      position: cartesian,
      orientation: Cesium.Transforms.headingPitchRollQuaternion(
        cartesian,
        new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(90),    // 设置这个属性即可（顺时针旋转的角度值）
            Cesium.Math.toRadians(0),
            Cesium.Math.toRadians(0)
        ),
      ),
      label: {
        text: this.style.text || "--",
        fillColor: this.style.fillColor
          ? Cesium.Color.fromCssColorString(this.style.fillColor).withAlpha(
            this.style.fillColorAlpha || 10
          )
          : Cesium.Color.WHITE,
        backgroundColor: this.style.backgroundColor
          ? Cesium.Color.fromCssColorString(
            this.style.backgroundColor
          ).withAlpha(this.style.backgroundColorAlpha || 100)
          : Cesium.Color.WHITE,
        style: Cesium.LabelStyle.FILL,
        outlineWidth: this.style.outlineWidth || 40,
        scale: this.style.scale || 10,
        pixelOffset: this.style.pixelOffset || Cesium.Cartesian2.ZERO,
        backgroundPadding: new Cesium.Cartesian2(10, 10),
        showBackground: this.style.showBackground || true,
        heightReference: this.style.heightReference || 70,
        disableDepthTestDistance: Number.MAX_VALUE
      },
    });

    label.objId = this.objId;
    this.label = label;
    this.pointPosition = this.label.position._value
    console.log(this.label.position, 2111111);
    return label;
  }

};

export default CreateLabel;
