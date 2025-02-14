
export const trajectory = (option) => {
  let { map, L } = option
  const data = [
    [36.69224227956309, 110.92799511728634],
    [36.569224227956309, 114.92799511728634],
    [37.69224227956309, 121.92799511728634],
    [38.69224227956309, 101.92799511728634],
    [36.69224227956309, 111.92799511728634],
  ];
  const peopleIcon = L.icon({
    iconUrl: 'public/start.png', // 替换为你自己的标记图标路径 './image/img.png'
    iconSize: [25, 41], //图片大小
    iconAnchor: [25, 70], //图片位置
  });
  // setInterval(() => {
  let marker = L.animatedMarker(data, {
    autoStart: true,
    distance: 100, // 运动轨迹的总距离，单位为像素
    interval: 1000, // 每帧之间的时间间隔，单位为毫秒
    icon: peopleIcon,
  }).addTo(map);
}
