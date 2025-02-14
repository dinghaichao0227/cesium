<template>
    <div ref="echartRef" class="echart"></div>
</template>

<script setup>
import * as echarts from 'echarts'
import * as echartsGL from 'echarts-gl'
import { ref, onMounted, onUpdated, watch, defineProps } from "vue"
const picture = ref()
const echartRef = ref();
import wh from "/public/start.png"
const loaded =ref(false);
const img = new Image();
img.src = wh;
img.onLoad= ()=> {
  loaded.value = true;
}
// const symbol = ref('image://' + tu)
// const props = defineProps({
//    symbols: {
//     type: String,
//     required: true,
//   },
// })


// watch(props.symbols, (newValue, oldValue)=> {
//   console.log(newValue, oldValue, 776)
//   // if(newVal.value !== newValue) {
//   //   newVal.value = newValue
//   //   info.value.clear()
//   //   let option = myChart.setOption(dataY)
//   //   info.value(option)
//   // }
// })
        var categories = [{
            name: " 贾家 "
        }, {
            name: " 林家 "
        }, {
            name: " 薛家 "
        }];
        var option = {
            tooltip: {
                formatter: function(x) {
                    return x.data.des;
                }
            },
            legend: [{
                // selectedMode: 'single',
                //设置可以根据类别显示or隐藏节点
                data: categories.map(function(a) {
                    return a.name;
                })
            }],
            color: ['#9A60B4', '#ee6666', '#91cc75', '#FAC858'],
            series: [{
                type: 'graph', // 类型:关系图
                layout: 'force', //图的布局，类型为力导图
                symbolSize: 40, // 调整节点的大小
                roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
                edgeSymbol: ['circle', 'arrow'],
                edgeSymbolSize: [2, 10],
                // itemStyle: {
                //     color: " rgba(101, 90, 90, 1) "
                // },
                edgeLabel: {
                    normal: {
                        textStyle: {
                            fontSize: 20
                        }
                    }
                },
                force: {
                    repulsion: 2500,
                    edgeLength: [10, 100]
                },
                draggable: true,
                focusNodeAdjacency: true, //聚焦邻接节点
                legendHoverLink: true, //启用图例 hover 时的联动高亮
                lineStyle: {
                    normal: {
                        width: 2,
                        // color: " aaa ",
                        color: '#4b565b',
                        opacity: 0.5,
                        //curveness: 0.1,
                    }
                },
                emphasis: {

                    itemStyle: {
                        shadowColor: " rgba(0, 0, 0, 0.4) ",
                        shadowBlur: 5,
                    },
                    lineStyle: {
                        width: 3,
                    }
                },

                edgeLabel: {
                    normal: {
                        show: true,
                        formatter: function(x) {
                            return x.data.name;
                        }
                    }
                },
                label: {
                    normal: {
                        show: true,
                        textStyle: {}
                    }
                },

                // 数据
                data: [{
                    name: '贾宝玉',
                    des: '爱憎分明',
                    symbolSize: 70, //节点大小
                    category: 0, //设置节点所属类别
                }, {
                    name: '林黛玉',
                    des: '敏感细腻',
                    symbolSize: 70,
                    category: 1,
                }, {
                    name: '薛宝钗',
                    des: '圆滑世故',
                    symbolSize: 70,
                    category: 2,
                }, {
                    name: '晴雯',
                    des: '美丽聪慧',
                    symbolSize: 50,
                    category: 0,
                }],
                links: [{
                    source: '贾宝玉', //源节点
                    target: '林黛玉', //目标节点
                    name: '表兄妹', //关系
                    des: '',
                    label: {
                        show: true
                    },
                    lineStyle: {
                        curveness: 0//线条弧度
                    }
                }, {
                    source: '贾宝玉',
                    target: '薛宝钗',
                    name: '表姐弟',
                    des: '',
                    label: {
                        show: true
                    },
                    lineStyle: {
                        curveness: -0.4
                    }
                }, {
                    source: '贾宝玉',
                    target: '薛宝钗',
                    name: '夫妻',
                    des: '',
                    label: {
                        show: true
                    },
                    lineStyle: {
                        curveness: 0.4
                    }
                }, {
                    source: '贾宝玉',
                    target: '晴雯',
                    name: '主仆',
                    des: '',
                    label: {
                        show: true
                    },
                    lineStyle: {
                        curveness: 0.3
                    }
                }],
                categories: categories, //给类别赋值
            }]
        };


onMounted(() => {
    const myChart = echarts.init(echartRef.value);
    myChart.setOption(option);
})
</script>

<style scoped>
.echart {
  width: 100%;
  height: 100%;
  background-color: #79bdf4;
}
</style>
