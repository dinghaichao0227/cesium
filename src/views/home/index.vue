<template>
<div class="box">
    <div id="mapContainer"></div>
    <div class="toolbar">
        <a-button v-for="(item, index) in plotList" :key="index" class="toolbar-btn" type="primary" @click="start(item)">{{
            item.name }}</a-button>
        <a-button class="toolbar-btn" type="primary" danger @click="clear">清除</a-button>
        <a-button class="toolbar-btn" type="primary" danger @click="showData">上传</a-button>
        <a-button class="toolbar-btn" type="primary" danger @click="saveData">导出</a-button>
    <a-select  placeholder="请选择主题色" style="width: 120px" v-model:value="value" :options="options" @select="changeTheme(value)">changeTheme</a-select>
    </div>
</div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, toRefs, onMounted } from "vue";
//@ts-ignore
import markerimg from "../../assets/start.png"
//@ts-ignore

import Tool from "../../js/plot/drawTool"
//@ts-ignore

import util from "../../js/util.js";
import { popoverProps } from "ant-design-vue/lib/popover";
let viewer = undefined;
const options = reactive([
    {
        value: 'day',
        label: 'day'
    },
    {
        value: 'dark',
        label: 'dark'
    },
])

const changeTheme = (item) => {
    document.body.className = item
    console.log(item);
}

const state = reactive({
    plotList: [{
        "name": "点",
        "type": "point",
        "iconImg": "./easy3d/images/plot/point.png",
        "styleType": "point"
    },
    {
        "name": "线",
        "type": "polyline",
        "iconImg": "./easy3d/images/plot/polyline.png",
        "styleType": "polyline",
        "style": {
            "clampToGround": true,
            "color": "#ffff00"
        }
    },
    {
        "name": "面",
        "type": "polygon",
        "iconImg": "./easy3d/images/plot/polygon.png",
        "styleType": "polygon",
        "style": {
            "color": "#00FFFF",
            "colorAlpha": 0.3,
            "outline": true,
            "outlineColor": "#ff0000",
            "heightReference": 1
        }
    },
    {
        "name": "图标",
        "type": "billboard",
        "iconImg": "./easy3d/images/plot/billboard.png",
        "style": {
            "image": markerimg
        },
        "styleType": "billboard"
    },
    {
        "name": "文字",
        "type": "label",
        "iconImg": "./easy3d/images/plot/label.png",
        "style": {
            "text": "Easy3D",
            "fillColor": "#fff",
            "outline": false,
            "outlineWidth": 1,
            "outlineColor": "#ff0000",
            "heightReference": 0,
            "showBackground": true,
            "backgroundColor": "#000",
            "scale": 1
        },
        "styleType": "label"
    }
    ]
})

const { plotList } = toRefs(state);
let plotDrawTool:any = undefined;
onMounted(() => {
    //@ts-ignore
    viewer = new Cesium.Viewer('mapContainer', {
        //@ts-ignore
        imageryProvider: new Cesium.WebMapServiceImageryProvider({
            url: "/public/Cesium1.61/Assets/Textures/NaturalEarthII/{z}/{x}/{reverseY}.jpg",
        }),
            skyBox: false,
            skyAtmosphere: false,
            animation: false,
            timeline: false,
            infoBox: false,
            geocoder: false,
            sceneModePicker: false,
            fullscreenButton: true,
            navigationInstructionsInitiallyVisible: false,
            navigationHelpButton: false,
            homeButton: true,
            baseLayerPicker: false,

    });




    // viewer.scene.backgroundColor = none

    function switchToNightMode() {
      viewer.scene.globe.enableLighting = false;
      viewer.scene.skyBox.show = false;
      viewer.scene.mode = Cesium.SceneMode.SCENE2D;
      viewer.imageryLayers.lower(nightLayer);
    }

    function switchToDayMode() {
      viewer.scene.globe.enableLighting = true;
      viewer.scene.skyBox.show = true;
      viewer.scene.mode = Cesium.SceneMode.SCENE3D;
      viewer.imageryLayers.raise(nightLayer);
    }


    plotDrawTool = new Tool(viewer, {
        canEdit: true,
    });
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

});
// document.getElementsByClassName("cesium-viewer-bottom")[0].style.display = "none";
const start = (item: any) => {
    item = JSON.parse(JSON.stringify(item)); // 数据隔离
    if (!plotDrawTool) return;

    plotDrawTool.start(item);
}
const showData = () => {
    var showJson =JSON.parse(sessionStorage.getItem('jsonData'))
    plotDrawTool.showData(showJson)
}
const saveData = () => {
    plotDrawTool.saveData()
}

const clear = () => {
    if (!plotDrawTool) return;
    plotDrawTool.removeAll();
}
</script>

<style scoped>
.box {
    width: 100%;
    height: 100%;
}
#mapContainer {
    height: 100vh;
    margin: 0;
    padding: 0;
    background-color: none;
}

.toolbar {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 99;
}

.toolbar-btn {
    margin: 10px;
}
</style>
