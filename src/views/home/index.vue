<template>
    <div id="mapContainer"></div>
    <div class="toolbar">
        <a-button v-for="(item, index) in plotList" :key="index" class="toolbar-btn" type="primary" @click="start(item)">{{
            item.name }}</a-button>
        <a-button class="toolbar-btn" type="primary" danger @click="clear">清除</a-button>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, toRefs, onMounted } from "vue";
//@ts-ignore
import markerimg from "@/assets/start.png"
//@ts-ignore

import Tool from "@/js/plot/drawTool.js"
//@ts-ignore

import util from "@/js/util.js";
// import * as Cesium from "/public/Cesium1.61/Cesium.js"
let viewer = undefined;

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
            animation: false,  // 设置动画小组件关闭展示
            timeline: false, // 时间轴关闭展示
            infoBox: false, // 信息盒子关闭展示
            geocoder: false, // 地理编码搜索关闭展示
            sceneModePicker: false, // 场景选择器关闭展示
            fullscreenButton: true, // 全屏按钮关闭展示
            navigationInstructionsInitiallyVisible: false, // 导航说明是否最初展示
            navigationHelpButton: false, // 导航帮助按钮关闭展示
            homeButton: true,
            baseLayerPicker: false
    });
    // const entity = viewer.entities.add({
    //   position: Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
    //   label: {
    //     text: '双击以编辑',
    //     font: '24px sans-serif',
    //     fillColor: Cesium.Color.WHITE
    //   }
    // });
    // const editables = new Cesium.Editables(viewer, {
    //   entities: [entity]
    // });
    // viewer.selectedEntityChanged.addEventListener(() => {
    //   editables.update();
    // });
    // viewer.zoomTo(viewer.entities);
    plotDrawTool = new Tool(viewer, {
        canEdit: true,
    });

});
const start = (item: any) => {
    item = JSON.parse(JSON.stringify(item)); // 数据隔离
    if (!plotDrawTool) return;

    plotDrawTool.start(item);
}

const clear = () => {
    if (!plotDrawTool) return;
    plotDrawTool.removeAll();
}
</script>

<style scoped>
#mapContainer {
    height: 100%;
    margin: 0;
    padding: 0;
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
