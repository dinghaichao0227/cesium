/**
 * 风场图绘制（支持动态粒子流动）
 *
 * 渲染方式：
 * 1. 动态层：Canvas 覆盖层上跑粒子，粒子按插值后的 u/v 分量移动并留下淡出的拖尾，
 *    形成流动效果。粒子坐标是经纬度，每帧投影到屏幕，因此跟随地图缩放/平移。
 * 2. 静态层（可选）：Cesium entity 箭头，表示网格点的瞬时风向风速。
 *
 * 风向默认采用气象学约定（正北起、顺时针、表示"风的来向"）。
 */

/** 单个风场格点 */
export interface WindPoint {
  lon: number;
  lat: number;
  /** 风速 m/s */
  speed: number;
  /** 风向 度 */
  direction: number;
  /** 东西向分量 m/s（不传则由 speed/direction 换算） */
  u?: number;
  /** 南北向分量 m/s（不传则由 speed/direction 换算） */
  v?: number;
}

export interface WindFieldBounds {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export interface WindFieldOptions {
  /** 网格密度，默认 14 */
  gridSize?: number;
  /** 外部数据；传入后不再生成模拟数据 */
  data?: WindPoint[];
  /** 风向约定：meteo=气象（来向，北起顺时针）；math=数学（去向，东起逆时针） */
  directionConvention?: 'meteo' | 'math';

  /** 是否开启粒子动画，默认 true */
  animate?: boolean;
  /** 粒子数量，默认 1500 */
  particleCount?: number;
  /** 速度系数：每 1 m/s 每秒移动的经纬度度数，默认 0.08 */
  speedFactor?: number;
  /** 拖尾保留率 0~1，越大尾巴越长，默认 0.93 */
  trailFade?: number;
  /** 粒子线宽，默认 1.6 */
  particleWidth?: number;
  /** 粒子最大存活帧数（避免全部堆在低速区），默认 140 */
  maxAge?: number;

  /** 是否绘制静态箭头层，默认 !animate */
  showArrows?: boolean;
  /** 箭头线宽，默认 2 */
  lineWidth?: number;
  /** 箭头最大长度（单位：纬度度数），默认网格步长的 0.9 倍 */
  maxArrowLength?: number;
  /** 箭头最小长度占最大长度的比例，默认 0.35 */
  minArrowRatio?: number;

  /** 是否显示风速文字，默认 false */
  showLabels?: boolean;
  /** 每隔几个点显示一个标签，默认 2 */
  labelStep?: number;
  /** 是否显示 HTML 图例，默认 true */
  showLegend?: boolean;
  /** 颜色映射的风速上限，默认取数据最大值 */
  colorMaxSpeed?: number;
  /** 数据源名称，默认 windField */
  name?: string;
}

/** 风场句柄 */
export interface WindFieldHandle {
  dataSource: any;
  data: WindPoint[];
  minSpeed: number;
  maxSpeed: number;
  /** 启动粒子动画 */
  start(): void;
  /** 暂停粒子动画 */
  stop(): void;
  show(): void;
  hide(): void;
  toggle(visible?: boolean): void;
  /** 销毁：移除 entity、canvas、图例并停止动画 */
  remove(): void;
}

/** 风速色阶（归一化位置 -> 颜色），用于颜色插值与图例 */
const WIND_COLOR_STOPS: { stop: number; rgb: [number, number, number] }[] = [
  { stop: 0, rgb: [40, 80, 200] },
  { stop: 0.25, rgb: [0, 170, 200] },
  { stop: 0.5, rgb: [40, 190, 80] },
  { stop: 0.75, rgb: [250, 200, 40] },
  { stop: 1, rgb: [220, 40, 40] },
];

const LEGEND_DOM_ID = 'wind-field-legend';
const CANVAS_DOM_ID = 'wind-field-canvas';

export const windField = (
  Cesium: any,
  viewer: any,
  bounds: WindFieldBounds = { minLon: 70, minLat: 10, maxLon: 140, maxLat: 60 },
  options: WindFieldOptions | number = {}
): WindFieldHandle => {
  // 兼容旧签名 windField(Cesium, viewer, bounds, gridSize)
  const opts: WindFieldOptions = typeof options === 'number' ? { gridSize: options } : options || {};

  const gridSize = opts.gridSize ?? 14;
  const convention = opts.directionConvention ?? 'meteo';
  const animate = opts.animate ?? true;
  const showArrows = opts.showArrows ?? !animate;
  const showLabels = opts.showLabels ?? false;
  const labelStep = Math.max(1, opts.labelStep ?? 2);

  const data = opts.data?.length ? opts.data : generateWindData(bounds, gridSize);

  // 补齐 u/v 分量（粒子推进直接用分量，避免反复三角运算）
  data.forEach((p) => {
    if (p.u === undefined || p.v === undefined) {
      const [u, v] = toUV(p.speed, p.direction, convention);
      p.u = u;
      p.v = v;
    }
  });

  // 风速范围
  let minSpeed = Infinity;
  let maxSpeed = -Infinity;
  data.forEach((p) => {
    minSpeed = Math.min(minSpeed, p.speed);
    maxSpeed = Math.max(maxSpeed, p.speed);
  });
  if (!Number.isFinite(minSpeed)) {
    minSpeed = 0;
    maxSpeed = 0;
  }
  const colorMax = opts.colorMaxSpeed ?? maxSpeed ?? 1;

  // 独立数据源，便于整体控制
  const dataSource = new Cesium.CustomDataSource(opts.name ?? 'windField');
  viewer.dataSources.add(dataSource);

  if (showArrows || showLabels) {
    drawArrowLayer(Cesium, dataSource.entities, data, bounds, {
      gridSize,
      convention,
      colorMax,
      showArrows,
      showLabels,
      labelStep,
      lineWidth: opts.lineWidth ?? 2,
      maxArrowLength: opts.maxArrowLength,
      minArrowRatio: opts.minArrowRatio ?? 0.35,
    });
  }

  if (opts.showLegend ?? true) {
    drawWindLegend(viewer, colorMax);
  }

  const animator = animate
    ? createParticleAnimator(Cesium, viewer, data, bounds, {
        particleCount: opts.particleCount ?? 1500,
        speedFactor: opts.speedFactor ?? 0.08,
        trailFade: opts.trailFade ?? 0.93,
        particleWidth: opts.particleWidth ?? 1.6,
        maxAge: opts.maxAge ?? 140,
        colorMax,
      })
    : null;

  animator?.start();

  const handle: WindFieldHandle = {
    dataSource,
    data,
    minSpeed,
    maxSpeed,
    start: () => animator?.start(),
    stop: () => animator?.stop(),
    show: () => handle.toggle(true),
    hide: () => handle.toggle(false),
    toggle(visible?: boolean) {
      const next = visible ?? !dataSource.show;
      dataSource.show = next;
      const legend = document.getElementById(LEGEND_DOM_ID);
      if (legend) legend.style.display = next ? 'block' : 'none';
      if (next) animator?.start();
      else animator?.stop();
    },
    remove() {
      animator?.destroy();
      viewer.dataSources.remove(dataSource, true);
      document.getElementById(LEGEND_DOM_ID)?.remove();
    },
  };

  return handle;
};

/* ---------------------------------------------------------------- 粒子动画层 */

interface Particle {
  lon: number;
  lat: number;
  /** 上一帧的屏幕坐标（复用，避免每帧重复投影同一个点） */
  sx: number;
  sy: number;
  /** 上一帧屏幕坐标是否有效 */
  hasScreen: boolean;
  age: number;
  speed: number;
}

interface AnimatorOptions {
  particleCount: number;
  speedFactor: number;
  trailFade: number;
  particleWidth: number;
  maxAge: number;
  colorMax: number;
}

/**
 * 在 Cesium 容器上叠一层 canvas 跑粒子。
 * 粒子在经纬度空间推进，每帧用 viewer 投影到屏幕坐标，因此天然跟随相机。
 */
function createParticleAnimator(
  Cesium: any,
  viewer: any,
  data: WindPoint[],
  bounds: WindFieldBounds,
  opts: AnimatorOptions
) {
  const container: HTMLElement = viewer.container ?? document.body;
  document.getElementById(CANVAS_DOM_ID)?.remove();

  const canvas = document.createElement('canvas');
  canvas.id = CANVAS_DOM_ID;
  Object.assign(canvas.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '5',
  } as CSSStyleDeclaration);

  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  const sampler = createFieldSampler(data, bounds);
  let particles: Particle[] = [];
  let rafId = 0;
  let running = false;
  let dpr = 1;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // 改尺寸会清空画布，旧屏幕坐标同时失效
    for (const p of particles) p.hasScreen = false;
  };

  const randomize = (p: Particle) => {
    p.lon = bounds.minLon + Math.random() * (bounds.maxLon - bounds.minLon);
    p.lat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
    p.hasScreen = false;
    p.age = Math.floor(Math.random() * opts.maxAge);
    p.speed = 0;
    return p;
  };

  const seed = () => {
    particles = [];
    for (let i = 0; i < opts.particleCount; i++) {
      particles.push(randomize({} as Particle));
    }
  };

  // Cesium 1.107 只有 wgs84ToWindowCoordinates，新版本改名为 worldToWindowCoordinates
  const toWindow =
    Cesium.SceneTransforms.worldToWindowCoordinates ??
    Cesium.SceneTransforms.wgs84ToWindowCoordinates;
  // 复用同一组临时对象，避免每帧产生上万次 GC
  const scratchCartesian = new Cesium.Cartesian3();
  const scratchWindow = new Cesium.Cartesian2();

  /** 经纬度 -> canvas CSS 像素坐标；不可见时返回 null */
  const project = (lon: number, lat: number): any => {
    Cesium.Cartesian3.fromDegrees(lon, lat, 0, undefined, scratchCartesian);
    return toWindow.call(Cesium.SceneTransforms, viewer.scene, scratchCartesian, scratchWindow);
  };

  let lastTime = 0;

  const frame = (time: number) => {
    if (!running) return;
    // dt 以秒为单位并做上限，切标签页回来时不会瞬移
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
    lastTime = time;

    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    // 用半透明黑覆盖上一帧形成拖尾淡出，而不是 clearRect
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = `rgba(0, 0, 0, ${1 - opts.trailFade})`;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    ctx.lineWidth = opts.particleWidth;
    ctx.lineCap = 'round';

    for (const p of particles) {
      // 推进：u/v 是 m/s，speedFactor 换算成"度/秒"
      const sample = sampler(p.lon, p.lat);
      if (!sample) {
        randomize(p);
        continue;
      }
      const [u, v, speed] = sample;

      // 经度步长按纬度修正，保证视觉上的移动速度均匀
      const cosLat = Math.max(0.15, Math.cos((p.lat * Math.PI) / 180));
      p.lon += (u * opts.speedFactor * dt) / cosLat;
      p.lat += v * opts.speedFactor * dt;
      p.speed = speed;
      p.age++;

      // 出界或超龄则重新播撒，保持粒子分布均匀
      if (
        p.age > opts.maxAge ||
        p.lon < bounds.minLon ||
        p.lon > bounds.maxLon ||
        p.lat < bounds.minLat ||
        p.lat > bounds.maxLat
      ) {
        randomize(p);
        continue;
      }

      const to = project(p.lon, p.lat);
      if (!to) {
        p.hasScreen = false;
        continue;
      }
      const tx = to.x;
      const ty = to.y;

      // 上一帧已有屏幕坐标则直接复用，省掉一半投影计算
      if (p.hasScreen) {
        // 跨越屏幕的异常长线段（换日线、地球背面）直接跳过
        if (Math.abs(tx - p.sx) < w / 3 && Math.abs(ty - p.sy) < h / 3) {
          const ratio = opts.colorMax > 0 ? clamp(speed / opts.colorMax, 0, 1) : 0;
          const [r, g, b] = interpolateStops(ratio);
          // 生命周期两端淡入淡出，避免粒子突然出现/消失
          const lifeAlpha = Math.min(1, Math.min(p.age, opts.maxAge - p.age) / 12);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(0.35 + ratio * 0.6) * lifeAlpha})`;
          ctx.beginPath();
          ctx.moveTo(p.sx, p.sy);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }
      }

      p.sx = tx;
      p.sy = ty;
      p.hasScreen = true;
    }

    rafId = requestAnimationFrame(frame);
  };

  // 相机移动时清空画布并作废缓存的屏幕坐标，
  // 否则平移/缩放后第一帧会把"旧屏幕位置 -> 新屏幕位置"画成一道假线
  const clearTrails = () => {
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    for (const p of particles) p.hasScreen = false;
  };
  viewer.camera.moveStart.addEventListener(clearTrails);
  viewer.camera.changed.addEventListener(clearTrails);
  window.addEventListener('resize', resize);

  resize();
  seed();

  return {
    start() {
      if (running) return;
      running = true;
      canvas.style.display = 'block';
      lastTime = 0;
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(rafId);
      canvas.style.display = 'none';
    },
    destroy() {
      this.stop();
      window.removeEventListener('resize', resize);
      viewer.camera.moveStart.removeEventListener(clearTrails);
      viewer.camera.changed.removeEventListener(clearTrails);
      canvas.remove();
    },
  };
}

/**
 * 双线性插值采样器：任意经纬度 -> [u, v, speed]
 * 依赖 data 是规则网格（generateWindData 或外部规则网格数据）。
 */
function createFieldSampler(data: WindPoint[], bounds: WindFieldBounds) {
  // 还原网格结构
  const lons = Array.from(new Set(data.map((p) => p.lon))).sort((a, b) => a - b);
  const lats = Array.from(new Set(data.map((p) => p.lat))).sort((a, b) => a - b);
  const index = new Map<string, WindPoint>();
  data.forEach((p) => index.set(`${p.lon},${p.lat}`, p));

  const nearestIdx = (arr: number[], value: number) => {
    let lo = 0;
    let hi = arr.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (arr[mid] <= value) lo = mid;
      else hi = mid;
    }
    return lo;
  };

  return (lon: number, lat: number): [number, number, number] | null => {
    if (lon < bounds.minLon || lon > bounds.maxLon || lat < bounds.minLat || lat > bounds.maxLat) {
      return null;
    }
    const i = nearestIdx(lons, lon);
    const j = nearestIdx(lats, lat);

    const p00 = index.get(`${lons[i]},${lats[j]}`);
    const p10 = index.get(`${lons[i + 1]},${lats[j]}`) ?? p00;
    const p01 = index.get(`${lons[i]},${lats[j + 1]}`) ?? p00;
    const p11 = index.get(`${lons[i + 1]},${lats[j + 1]}`) ?? p00;
    if (!p00 || !p10 || !p01 || !p11) return null;

    const tx = lons[i + 1] !== undefined ? (lon - lons[i]) / (lons[i + 1] - lons[i]) : 0;
    const ty = lats[j + 1] !== undefined ? (lat - lats[j]) / (lats[j + 1] - lats[j]) : 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const u = lerp(lerp(p00.u!, p10.u!, tx), lerp(p01.u!, p11.u!, tx), ty);
    const v = lerp(lerp(p00.v!, p10.v!, tx), lerp(p01.v!, p11.v!, tx), ty);

    return [u, v, Math.sqrt(u * u + v * v)];
  };
}

/* ------------------------------------------------------------------ 工具函数 */

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** 风速/风向 -> u/v 分量（u 向东为正，v 向北为正） */
function toUV(speed: number, direction: number, convention: 'meteo' | 'math'): [number, number] {
  // 气象风向是"来向"，去向 = direction + 180；再从"北起顺时针"换成"东起逆时针"
  const mathDeg = convention === 'meteo' ? 90 - (direction + 180) : direction;
  const rad = (mathDeg * Math.PI) / 180;
  return [Math.cos(rad) * speed, Math.sin(rad) * speed];
}

/* ------------------------------------------------------------- 静态箭头图层 */

interface ArrowLayerOptions {
  gridSize: number;
  convention: 'meteo' | 'math';
  colorMax: number;
  showArrows: boolean;
  showLabels: boolean;
  labelStep: number;
  lineWidth: number;
  maxArrowLength?: number;
  minArrowRatio: number;
}

function drawArrowLayer(
  Cesium: any,
  entities: any,
  data: WindPoint[],
  bounds: WindFieldBounds,
  opts: ArrowLayerOptions
) {
  const latStep = (bounds.maxLat - bounds.minLat) / opts.gridSize;
  const maxArrowLength = opts.maxArrowLength ?? Math.abs(latStep) * 0.9;

  data.forEach((p, i) => {
    const color = getWindSpeedColor(Cesium, p.speed, opts.colorMax);

    if (opts.showArrows) {
      const ratio = opts.colorMax > 0 ? clamp(p.speed / opts.colorMax, 0, 1) : 0;
      const length = maxArrowLength * (opts.minArrowRatio + (1 - opts.minArrowRatio) * ratio);
      entities.add({
        polyline: {
          positions: buildArrowPositions(Cesium, p, length, opts.convention),
          width: opts.lineWidth,
          material: color,
          clampToGround: false,
        },
      });
    }

    if (opts.showLabels && i % opts.labelStep === 0) {
      entities.add({
        position: Cesium.Cartesian3.fromDegrees(p.lon, p.lat),
        label: {
          text: p.speed.toFixed(1),
          font: 'bold 11px sans-serif',
          fillColor: color,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          pixelOffset: new Cesium.Cartesian2(0, 6),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    }
  });
}

/**
 * 生成箭头折线顶点（杆 + 两侧箭羽，一条折线走完，减少 entity 数量）
 * 顺序：尾 -> 头 -> 箭羽1 -> 头 -> 箭羽2
 */
function buildArrowPositions(
  Cesium: any,
  p: WindPoint,
  length: number,
  convention: 'meteo' | 'math'
) {
  const mathDeg = convention === 'meteo' ? 90 - (p.direction + 180) : p.direction;
  const rad = (mathDeg * Math.PI) / 180;

  // 经度方向按纬度做投影修正，避免高纬度箭头被横向拉长
  const cosLat = Math.max(0.15, Math.cos((p.lat * Math.PI) / 180));
  const dLon = (Math.cos(rad) * length) / cosLat;
  const dLat = Math.sin(rad) * length;

  // 以格点为箭头中心，视觉上更居中
  const tailLon = p.lon - dLon / 2;
  const tailLat = p.lat - dLat / 2;
  const headLon = p.lon + dLon / 2;
  const headLat = p.lat + dLat / 2;

  const headSize = length * 0.35;
  const barb = (offsetDeg: number) => {
    const a = rad + (offsetDeg * Math.PI) / 180;
    return [headLon - (Math.cos(a) * headSize) / cosLat, headLat - Math.sin(a) * headSize];
  };
  const [b1Lon, b1Lat] = barb(-28);
  const [b2Lon, b2Lat] = barb(28);

  return Cesium.Cartesian3.fromDegreesArray([
    tailLon, tailLat,
    headLon, headLat,
    b1Lon, b1Lat,
    headLon, headLat,
    b2Lon, b2Lat,
  ]);
}

/**
 * 生成风场网格数据（模拟数据，接入真实数据时用 options.data 传入）
 * 先构造连续的 u/v 场，再反算风速风向，保证相邻格点不会突变。
 */
function generateWindData(bounds: WindFieldBounds, gridSize: number): WindPoint[] {
  const data: WindPoint[] = [];
  const lonStep = (bounds.maxLon - bounds.minLon) / gridSize;
  const latStep = (bounds.maxLat - bounds.minLat) / gridSize;

  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j <= gridSize; j++) {
      const lon = bounds.minLon + lonStep * j;
      const lat = bounds.minLat + latStep * i;

      const u = 6 * Math.sin((lat / 18) * Math.PI) + 3 * Math.cos((lon / 25) * Math.PI);
      const v = 5 * Math.cos((lon / 20) * Math.PI) + 2 * Math.sin((lat / 15) * Math.PI);

      const speed = Math.sqrt(u * u + v * v);
      // 由 u/v 反算气象风向（来向，北起顺时针）
      let direction = (270 - (Math.atan2(v, u) * 180) / Math.PI) % 360;
      if (direction < 0) direction += 360;

      data.push({ lon, lat, speed, direction, u, v });
    }
  }

  return data;
}

/* ------------------------------------------------------------------ 颜色映射 */

/** 根据风速获取 Cesium 颜色（按色阶线性插值） */
function getWindSpeedColor(Cesium: any, speed: number, maxSpeed: number) {
  const ratio = maxSpeed > 0 ? clamp(speed / maxSpeed, 0, 1) : 0;
  const [r, g, b] = interpolateStops(ratio);
  return Cesium.Color.fromBytes(r, g, b, 235);
}

/** 归一化位置 -> rgb，供 canvas 和 entity 共用 */
function interpolateStops(ratio: number): [number, number, number] {
  for (let i = 0; i < WIND_COLOR_STOPS.length - 1; i++) {
    const a = WIND_COLOR_STOPS[i];
    const b = WIND_COLOR_STOPS[i + 1];
    if (ratio <= b.stop) {
      const t = b.stop === a.stop ? 0 : (ratio - a.stop) / (b.stop - a.stop);
      return [
        Math.round(a.rgb[0] + (b.rgb[0] - a.rgb[0]) * t),
        Math.round(a.rgb[1] + (b.rgb[1] - a.rgb[1]) * t),
        Math.round(a.rgb[2] + (b.rgb[2] - a.rgb[2]) * t),
      ];
    }
  }
  return WIND_COLOR_STOPS[WIND_COLOR_STOPS.length - 1].rgb;
}

/** 绘制风场图例（HTML 覆盖层，挂在 viewer 容器右下角） */
function drawWindLegend(viewer: any, maxSpeed: number) {
  document.getElementById(LEGEND_DOM_ID)?.remove();

  const gradient = WIND_COLOR_STOPS.map(
    (s) => `rgb(${s.rgb[0]}, ${s.rgb[1]}, ${s.rgb[2]}) ${(s.stop * 100).toFixed(0)}%`
  ).join(', ');

  const ticks = [0, 0.25, 0.5, 0.75, 1]
    .map((t) => `<span>${(maxSpeed * t).toFixed(1)}</span>`)
    .join('');

  const el = document.createElement('div');
  el.id = LEGEND_DOM_ID;
  el.innerHTML = `
    <div style="font-size:12px;margin-bottom:4px;">风速 (m/s)</div>
    <div style="height:10px;border-radius:2px;background:linear-gradient(to right, ${gradient});"></div>
    <div style="display:flex;justify-content:space-between;font-size:10px;margin-top:2px;">${ticks}</div>
  `;
  Object.assign(el.style, {
    position: 'absolute',
    right: '12px',
    bottom: '48px',
    width: '160px',
    padding: '8px 10px',
    background: 'rgba(20, 26, 38, 0.72)',
    color: '#fff',
    borderRadius: '4px',
    fontFamily: 'sans-serif',
    pointerEvents: 'none',
    zIndex: '10',
  } as CSSStyleDeclaration);

  const container: HTMLElement = viewer.container ?? document.body;
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }
  container.appendChild(el);
}
