# 风场图和降雨场图功能说明

## 功能介绍

### 1. 风场图 (Wind Field)
在地图上绘制风向和风速的可视化显示。

**特性:**
- **风向显示**: 使用箭头表示风的方向
- **风速显示**: 
  - 箭头长度代表风速大小
  - 箭头颜色代表风速等级（蓝→绿→黄→红）
- **数据标签**: 每个网格点显示具体的风速值（单位：m/s）
- **颜色映射**:
  - 蓝色: 低风速
  - 绿色: 中等风速
  - 黄色: 较高风速
  - 红色: 高风速

### 2. 降雨场图 (Rainfall Field)
在地图上绘制降雨量的分布情况。

**特性:**
- **降雨量显示**: 使用网格单元格的颜色和透明度表示降雨量
- **数据标签**: 每个网格单元格显示具体的降雨量（单位：mm）
- **颜色分级**:
  - 浅蓝色: 0 mm (无雨)
  - 蓝色: 10 mm (小雨)
  - 绿色: 50 mm (中雨)
  - 黄色: 75 mm (大雨)
  - 红色: 100 mm (暴雨)
- **透明度分级**: 降雨量越大，透明度越高，覆盖感越强

## 代码实现

### 导入模块
```typescript
import { windField } from './Configuration/windField';
import { rainfallField } from './Configuration/rainfallField';
```

### 调用函数

#### 风场图
```typescript
windField(Cesium, viewer, {
  minLon: 70,      // 最小经度
  minLat: 10,      // 最小纬度
  maxLon: 140,     // 最大经度
  maxLat: 60,      // 最大纬度
}, 8);             // gridSize: 网格大小（8x8网格）
```

#### 降雨场图
```typescript
rainfallField(Cesium, viewer, {
  minLon: 70,      // 最小经度
  minLat: 10,      // 最小纬度
  maxLon: 140,     // 最大经度
  maxLat: 60,      // 最大纬度
}, 8);             // gridSize: 网格大小（8x8网格）
```

## 参数说明

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| Cesium | any | Cesium库实例 | - |
| viewer | any | Cesium Viewer实例 | - |
| bounds | object | 地图显示范围 | {minLon: 70, minLat: 10, maxLon: 140, maxLat: 60} |
| bounds.minLon | number | 最小经度 | 70 |
| bounds.minLat | number | 最小纬度 | 10 |
| bounds.maxLon | number | 最大经度 | 140 |
| bounds.maxLat | number | 最大纬度 | 60 |
| gridSize | number | 网格划分数 | 10(风场)/8(降雨) |

## 自定义数据

如需替换默认的模拟数据，可以修改以下函数：

### 风场数据生成
编辑 `windField.ts` 中的 `generateWindData()` 函数：
```typescript
function generateWindData(bounds: any, gridSize: number) {
  // 修改这里的数据生成逻辑
  const speed = 2 + 6 * Math.sin((lon / 10) * Math.PI) * Math.cos((lat / 10) * Math.PI);
  const direction = (Math.sin((lon / 20) * Math.PI) * 180 + Math.cos((lat / 20) * Math.PI) * 180) % 360;
}
```

### 降雨量数据生成
编辑 `rainfallField.ts` 中的 `generateRainfallData()` 函数：
```typescript
function generateRainfallData(bounds: any, gridSize: number) {
  // 修改这里的数据生成逻辑
  const rainfall = Math.max(0, 50 * Math.sin((lon / 15) * Math.PI) * Math.cos((lat / 15) * Math.PI) + ...);
}
```

## 连接真实数据

如果要使用真实的气象数据，可以：

1. 调用气象API获取数据（如高德地图天气API、OpenWeatherMap等）
2. 使用获取的数据替换 `generateWindData()` 和 `generateRainfallData()` 中的模拟数据
3. 根据实际数据范围调整颜色映射函数

示例：
```typescript
// 获取实际风场数据
const realWindData = await fetchWindDataFromAPI();

// 修改数据生成逻辑
const windData = realWindData.map(item => ({
  lon: item.longitude,
  lat: item.latitude,
  speed: item.windSpeed,
  direction: item.windDirection
}));
```

## 性能优化建议

1. **减少网格大小**: 降低 `gridSize` 参数可以减少绘制的对象数量
2. **隐藏标签**: 可以在风场或降雨场中注释掉标签绘制代码来提高性能
3. **动态更新**: 对于实时数据，可以定期清除旧数据并重新调用函数

## 故障排除

- **看不到图层**: 确保相机位置在指定的地理范围内
- **样式不正确**: 检查Cesium版本是否支持使用的API
- **性能问题**: 尝试减少 `gridSize` 或隐藏标签

## 扩展功能

可以根据需要扩展：
- 添加时间维度，显示风场/降雨的变化
- 添加图例UI组件
- 支持点击网格显示详细信息
- 添加动画效果（流动的风线等）
