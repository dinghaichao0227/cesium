import h337 from 'heatmapjs'

// 初始化 heat map
export const heatMapInit = () => {
  let config = {
    container: this.$refs.display, // 显示热力图的 dom 元素、或元素 id 名
    radius: 70, // 半径
    maxOpacity: 1, // 最大透明度 0 - 1.0
    minOpacity: 0, // 最小透明度 0 - 1.0
    blur: 0.6 // 边缘羽化程度 0.0 - 1.0
  }
  // create heatmap with configuration
  this.heatmap = h337.create(config);
  this.updateHeatMap()
},

  // 根据数据数组 更新 heatmap 图
  updateHeatMap(){
    let dataHeat = this.dataOrigin.map(item => {
      return {
        x: item.reserve.location.offsetX + 30,
        y: item.reserve.location.offsetY + 30,
        value: item.unit[2].value
      }
    })
    this.heatmap.setData(
      {
        data: dataHeat,
        max: 30,
        min: -10
      }
    )
  }
