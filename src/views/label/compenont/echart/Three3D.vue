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


const option = {
    title: {
      text: '',
      left: 'center',
    },
    xAxis3D: {
      type: 'value',
      name: 'X',
      axisLine: { lineStyle: { color: '#999' } },
      splitLine: { lineStyle: { color: '#999' } },
    },
    yAxis3D: {
      type: 'value',
      name: 'Y',
      axisLine: { lineStyle: { color: '#999' } },
      splitLine: { lineStyle: { color: '#999' } },
    },
    zAxis3D: {
      type: 'value',
      name: 'Z',
      axisLine: { lineStyle: { color: '#999' } },
      splitLine: { lineStyle: { color: '#999' } },
    },
    grid3D: {
      boxWidth: 500,
      boxDepth: 350,
      axisLine: { lineStyle: { color: '#999' } },
      axisPointer: { lineStyle: { color: '#ff0' } },
      viewControl: { distance: 300 },

    },
    series: [{
        type: 'scatter3D',
        symbol: 'image:/' + wh,

      data: [
        {
          value: [22,22,22],
          itemStyle: {
            symbol: 'image://'+ wh,
          },
        },
        {
          value: [10, 10, 10],
          itemStyle: {
            // color: 'green',
            // opacity: 0.5,
            // symbol: 'image://'+ wh,
            with: 100,
            height:100
          },
        },
        {
          value: [0, 0, 0],
          itemStyle: {
            color: 'black',
            // opacity: 0.1,
            // symbol: props.symbols,
          },
        },
      ],
      symbolSize: [110,100],
      }],
  };

onMounted(() => {
  var time = setInterval(()=>{
    const myChart = echarts.init(echartRef.value);
    myChart.setOption(option);
    console.log(option,9876);
    if (wh !== '') {
      clearInterval(time)
    }
  }, 2000)

  // 监听 ECharts 图表的渲染完成事件
  // myChart.on('rendered', () => {
  //   // 获取贴片图片的 DOM 元素
  //   const imgDom = myChart.getZr().dom.firstChild.querySelector('image');
  //   console.log(myChart.getZr().dom.firstChild.querySelector('image'));
  //   // 将贴片图片的 URL 存储到 sessionStorage 中
  //   // sessionStorage.setItem('image', imgDom.getAttribute('href'));
  // });
})
// const getRandomImageUrl = (url) => {
//   nextTick(()=> {
//     console.log(url, 8888);
//     return `${url}?_${Math.random().toString(36).substr(2, 9)}`
//   })
//   }
</script>

<style scoped>
.echart {
  width: 100%;
  height: 100%;
  background-color: #79bdf4;
}
</style>
