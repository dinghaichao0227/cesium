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

  /** 是否显示右上角参数调节面板，默认 true */
  showControls?: boolean;
  /** 调节面板初始是否折叠，默认 false */
  controlsCollapsed?: boolean;
  /** 是否开启鼠标风向风速探针（悬停读数卡片），默认 true */
  showProbe?: boolean;
}

/** 可在运行时调节的显示参数 */
export interface WindFieldSettings {
  animate: boolean;
  particleCount: number;
  speedFactor: number;
  trailFade: number;
  particleWidth: number;
  showArrows: boolean;
  showLabels: boolean;
  labelStep: number;
}

/** 某一点的风信息 */
export interface WindSample {
  u: number;
  v: number;
  speed: number;
  /** 气象风向（来向，北起顺时针） */
  direction: number;
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
  /** 读取当前显示参数 */
  getSettings(): WindFieldSettings;
  /** 运行时修改显示参数（面板与内部状态同步更新） */
  setSettings(patch: Partial<WindFieldSettings>): void;
  /** 采样任意经纬度的风向风速，越界返回 null */
  sample(lon: number, lat: number): WindSample | null;
  /** 销毁：移除 entity、canvas、图例、面板并停止动画 */
  remove(): void;
}

/** 蒲福风级表（用于探针卡片的定性描述） */
const BEAUFORT: { max: number; level: number; name: string }[] = [
  { max: 0.3, level: 0, name: '无风' },
  { max: 1.6, level: 1, name: '软风' },
  { max: 3.4, level: 2, name: '轻风' },
  { max: 5.5, level: 3, name: '微风' },
  { max: 8.0, level: 4, name: '和风' },
  { max: 10.8, level: 5, name: '清风' },
  { max: 13.9, level: 6, name: '强风' },
  { max: 17.2, level: 7, name: '疾风' },
  { max: 20.8, level: 8, name: '大风' },
  { max: 24.5, level: 9, name: '烈风' },
  { max: 28.5, level: 10, name: '狂风' },
  { max: 32.7, level: 11, name: '暴风' },
  { max: Infinity, level: 12, name: '台风' },
];

/** 16 方位中文名（气象来向） */
const COMPASS_16 = [
  '北', '北东北', '东北', '东东北',
  '东', '东东南', '东南', '南东南',
  '南', '南西南', '西南', '西西南',
  '西', '西西北', '西北', '北西北',
];

function beaufortOf(speed: number) {
  return BEAUFORT.find((b) => speed < b.max) ?? BEAUFORT[BEAUFORT.length - 1];
}

function compassOf(direction: number) {
  const idx = Math.round(((direction % 360) + 360) % 360 / 22.5) % 16;
  return COMPASS_16[idx];
}

/** 风速色阶（归一化位置 -> 颜色），用于颜色插值与图例 */
const WIND_COLOR_STOPS: { stop: number; rgb: [number, number, number] }[] = [
  { stop: 0, rgb: [30, 70, 180] },
  { stop: 0.15, rgb: [0, 140, 220] },
  { stop: 0.35, rgb: [0, 200, 180] },
  { stop: 0.5, rgb: [60, 220, 100] },
  { stop: 0.65, rgb: [180, 240, 60] },
  { stop: 0.8, rgb: [255, 220, 40] },
  { stop: 0.9, rgb: [255, 140, 40] },
  { stop: 1, rgb: [255, 60, 80] },
];

const LEGEND_DOM_ID = 'wind-field-legend';
const CANVAS_DOM_ID = 'wind-field-canvas';
const PANEL_DOM_ID = 'wind-field-panel';
const PROBE_DOM_ID = 'wind-field-probe';
const STYLE_DOM_ID = 'wind-field-style';

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

  // 可运行时调节的显示参数
  const settings: WindFieldSettings = {
    animate,
    particleCount: opts.particleCount ?? 5000,
    speedFactor: opts.speedFactor ?? 0.04,
    trailFade: opts.trailFade ?? 0.94,
    particleWidth: opts.particleWidth ?? 1.2,
    showArrows,
    showLabels,
    labelStep,
  };

  /** 重建静态箭头/标签层（参数变化时整层重画，格点量级不大，成本可接受） */
  const rebuildArrows = () => {
    dataSource.entities.removeAll();
    if (!settings.showArrows && !settings.showLabels) return;
    drawArrowLayer(Cesium, dataSource.entities, data, bounds, {
      gridSize,
      convention,
      colorMax,
      showArrows: settings.showArrows,
      showLabels: settings.showLabels,
      labelStep: settings.labelStep,
      lineWidth: opts.lineWidth ?? 2,
      maxArrowLength: opts.maxArrowLength,
      minArrowRatio: opts.minArrowRatio ?? 0.35,
    });
  };
  rebuildArrows();

  if (opts.showLegend ?? true) {
    drawWindLegend(viewer, colorMax);
  }

  // 采样器：粒子推进与鼠标探针共用一份双线性插值
  const sampler = createFieldSampler(data, bounds);

  // 动画层始终创建，便于面板实时开关，不必重建 canvas
  const animator = createParticleAnimator(Cesium, viewer, sampler, bounds, {
    particleCount: settings.particleCount,
    speedFactor: settings.speedFactor,
    trailFade: settings.trailFade,
    particleWidth: settings.particleWidth,
    maxAge: opts.maxAge ?? 200,
    colorMax,
  });
  if (settings.animate) animator.start();
  else animator.stop();

  const probe =
    (opts.showProbe ?? true)
      ? createWindProbe(Cesium, viewer, sampler, colorMax)
      : null;

  let panel: { sync(): void; remove(): void } | null = null;

  const handle: WindFieldHandle = {
    dataSource,
    data,
    minSpeed,
    maxSpeed,
    start: () => {
      settings.animate = true;
      animator.start();
      panel?.sync();
    },
    stop: () => {
      settings.animate = false;
      animator.stop();
      panel?.sync();
    },
    show: () => handle.toggle(true),
    hide: () => handle.toggle(false),
    getSettings: () => ({ ...settings }),
    setSettings(patch: Partial<WindFieldSettings>) {
      const arrowsDirty =
        (patch.showArrows !== undefined && patch.showArrows !== settings.showArrows) ||
        (patch.showLabels !== undefined && patch.showLabels !== settings.showLabels) ||
        (patch.labelStep !== undefined && patch.labelStep !== settings.labelStep);

      Object.assign(settings, patch);
      settings.labelStep = Math.max(1, Math.round(settings.labelStep));

      if (patch.particleCount !== undefined) animator.setParticleCount(settings.particleCount);
      if (patch.speedFactor !== undefined) animator.set({ speedFactor: settings.speedFactor });
      if (patch.trailFade !== undefined) animator.set({ trailFade: settings.trailFade });
      if (patch.particleWidth !== undefined) animator.set({ particleWidth: settings.particleWidth });
      if (patch.animate !== undefined) settings.animate ? animator.start() : animator.stop();
      if (arrowsDirty) rebuildArrows();

      panel?.sync();
    },
    sample(lon: number, lat: number) {
      const s = sampler(lon, lat);
      if (!s) return null;
      const [u, v] = s;
      return { u, v, speed: s[2], direction: uvToMeteoDirection(u, v) };
    },
    toggle(visible?: boolean) {
      const next = visible ?? !dataSource.show;
      dataSource.show = next;
      const legend = document.getElementById(LEGEND_DOM_ID);
      if (legend) legend.style.display = next ? 'block' : 'none';
      const panelEl = document.getElementById(PANEL_DOM_ID);
      if (panelEl) panelEl.style.display = next ? 'block' : 'none';
      probe?.toggle(next);
      if (next && settings.animate) animator.start();
      else animator.stop();
    },
    remove() {
      animator.destroy();
      probe?.destroy();
      panel?.remove();
      viewer.dataSources.remove(dataSource, true);
      document.getElementById(LEGEND_DOM_ID)?.remove();
      document.getElementById(STYLE_DOM_ID)?.remove();
    },
  };

  if (opts.showControls ?? true) {
    panel = createControlPanel(viewer, handle, {
      collapsed: opts.controlsCollapsed ?? false,
      maxSpeed: colorMax,
    });
  }

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

type FieldSampler = (lon: number, lat: number) => [number, number, number] | null;

/**
 * 在 Cesium 容器上叠一层 canvas 跑粒子。
 * 粒子在经纬度空间推进，每帧用 viewer 投影到屏幕坐标，因此天然跟随相机。
 */
function createParticleAnimator(
  Cesium: any,
  viewer: any,
  sampler: FieldSampler,
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

  /** 增量调整粒子数量，避免整场重播撒造成视觉断裂 */
  const setParticleCount = (count: number) => {
    const next = Math.max(0, Math.round(count));
    opts.particleCount = next;
    while (particles.length > next) particles.pop();
    while (particles.length < next) particles.push(randomize({} as Particle));
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

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

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

          // 绘制天气风场流线效果
          const dx = tx - p.sx;
          const dy = ty - p.sy;
          const length = Math.sqrt(dx * dx + dy * dy);

          // 线条宽度根据风速变化，快速风更明显
          const lineWidth = 1 + ratio * 2;

          // 基础流线绘制
          const baseAlpha = 0.6 + ratio * 0.25;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${baseAlpha * lifeAlpha})`;
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          ctx.moveTo(p.sx, p.sy);
          ctx.lineTo(tx, ty);
          ctx.stroke();

          // 高风速时添加发光效果
          if (ratio > 0.6 && length > 2) {
            ctx.shadowBlur = 6;
            ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.5 * lifeAlpha})`;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.9 * lifeAlpha})`;
            ctx.lineWidth = lineWidth * 0.6;
            ctx.beginPath();
            ctx.moveTo(p.sx, p.sy);
            ctx.lineTo(tx, ty);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }

          // 流线头部渐变（增强流动方向感）
          if (length > 3) {
            const gradient = ctx.createLinearGradient(p.sx, p.sy, tx, ty);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
            gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${baseAlpha * 0.5 * lifeAlpha})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${baseAlpha * lifeAlpha})`);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(p.sx, p.sy);
            ctx.lineTo(tx, ty);
            ctx.stroke();
          }
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
    setParticleCount,
    /** 运行时修改粒子外观/速度参数 */
    set(patch: Partial<AnimatorOptions>) {
      Object.assign(opts, patch);
    },
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

/** u/v 分量 -> 气象风向（来向，北起顺时针，0~360） */
function uvToMeteoDirection(u: number, v: number) {
  let direction = (270 - (Math.atan2(v, u) * 180) / Math.PI) % 360;
  if (direction < 0) direction += 360;
  return direction;
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
 * 改进：生成更接近真实天气的风场模式，包含气旋、反气旋和锋面系统。
 */
function generateWindData(bounds: WindFieldBounds, gridSize: number): WindPoint[] {
  const data: WindPoint[] = [];
  const lonStep = (bounds.maxLon - bounds.minLon) / gridSize;
  const latStep = (bounds.maxLat - bounds.minLat) / gridSize;

  // 计算区域的中心点，用于生成局部风场模式
  const centerLon = (bounds.minLon + bounds.maxLon) / 2;
  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const regionSize = Math.max(bounds.maxLon - bounds.minLon, bounds.maxLat - bounds.minLat);

  // 定义多个天气系统（气旋、反气旋、高压脊、低压槽）
  const systems = [
    // 主气旋（低压中心，逆时针辐合）
    { lon: centerLon - regionSize * 0.2, lat: centerLat + regionSize * 0.15, type: 'cyclone', strength: 6, scale: 0.4 },
    // 反气旋（高压中心，顺时针辐散）
    { lon: centerLon + regionSize * 0.25, lat: centerLat - regionSize * 0.2, type: 'anticyclone', strength: 5, scale: 0.35 },
    // 副气旋
    { lon: centerLon + regionSize * 0.1, lat: centerLat + regionSize * 0.25, type: 'cyclone', strength: 4, scale: 0.3 },
  ];

  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j <= gridSize; j++) {
      const lon = bounds.minLon + lonStep * j;
      const lat = bounds.minLat + latStep * i;

      // 归一化到 [-1, 1] 范围，方便生成局部模式
      const nx = (lon - centerLon) / (regionSize / 2);
      const ny = (lat - centerLat) / (regionSize / 2);

      // 基础西风带（中纬度地区的主导风向）
      let u = 3 + Math.sin(lat * 0.1) * 2;
      let v = Math.cos(lon * 0.08) * 1.5;

      // 叠加天气系统的影响
      for (const sys of systems) {
        const dx = (lon - sys.lon) / (regionSize * sys.scale);
        const dy = (lat - sys.lat) / (regionSize * sys.scale);
        const distSq = dx * dx + dy * dy;
        const influence = Math.exp(-distSq) * sys.strength;

        if (sys.type === 'cyclone') {
          // 气旋：逆时针旋转 + 向中心辐合
          u += (-dy * influence) - (dx * influence * 0.3);
          v += (dx * influence) - (dy * influence * 0.3);
        } else {
          // 反气旋：顺时针旋转 + 向外辐散
          u += (dy * influence) + (dx * influence * 0.3);
          v += (-dx * influence) + (dy * influence * 0.3);
        }
      }

      // 添加大尺度波动（罗斯贝波）
      u += Math.sin((lat / 10) * Math.PI) * 2;
      v += Math.cos((lon / 12) * Math.PI) * 1.5;

      // 添加随机扰动（模拟小尺度天气现象）
      u += Math.sin(lon * 0.5 + lat * 0.3) * 0.8;
      v += Math.cos(lon * 0.3 - lat * 0.5) * 0.8;

      // 边缘衰减，减少边界效应
      const edgeDist = Math.min(
        Math.min((lon - bounds.minLon), (bounds.maxLon - lon)),
        Math.min((lat - bounds.minLat), (bounds.maxLat - lat))
      ) / regionSize;
      const edgeFactor = Math.min(1, edgeDist * 3);
      u *= edgeFactor;
      v *= edgeFactor;

      const speed = Math.sqrt(u * u + v * v);
      // 由 u/v 反算气象风向（来向，北起顺时针）
      const direction = uvToMeteoDirection(u, v);

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

/* ------------------------------------------------------------------ UI 层 */

/** 保证容器可作为绝对定位参照，并返回它 */
function prepareContainer(viewer: any): HTMLElement {
  const container: HTMLElement = viewer.container ?? document.body;
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }
  return container;
}

/** 注入一次共享样式（玻璃拟态卡片 + 自定义滑块外观） */
function ensureStyles() {
  if (document.getElementById(STYLE_DOM_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_DOM_ID;
  style.textContent = `
  .wf-card{
    position:absolute;z-index:10;color:#e8eefc;
    font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
    background:linear-gradient(160deg,rgba(22,29,45,.86),rgba(14,19,31,.92));
    border:1px solid rgba(255,255,255,.12);
    border-radius:12px;
    box-shadow:0 8px 28px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.08);
    backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
    font-variant-numeric:tabular-nums;
  }
  .wf-title{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;letter-spacing:.5px;}
  .wf-title .wf-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px #4ade80;}
  .wf-title .wf-dot.off{background:#64748b;box-shadow:none;}

  /* 图例 */
  #${LEGEND_DOM_ID}{right:16px;bottom:52px;width:196px;padding:10px 12px;pointer-events:none;}
  #${LEGEND_DOM_ID} .wf-bar{height:10px;border-radius:5px;margin-top:8px;
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);}
  #${LEGEND_DOM_ID} .wf-ticks{display:flex;justify-content:space-between;font-size:10px;
    margin-top:5px;color:rgba(232,238,252,.62);}

  /* 控制面板 */
  #${PANEL_DOM_ID}{right:16px;top:16px;width:238px;padding:12px 14px 6px;user-select:none;}
  #${PANEL_DOM_ID} .wf-head{display:flex;align-items:center;justify-content:space-between;
    padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.09);}
  #${PANEL_DOM_ID} .wf-fold{cursor:pointer;width:20px;height:20px;line-height:18px;text-align:center;
    border-radius:6px;font-size:11px;color:rgba(232,238,252,.7);
    background:rgba(255,255,255,.06);transition:.18s;}
  #${PANEL_DOM_ID} .wf-fold:hover{background:rgba(255,255,255,.14);color:#fff;}
  #${PANEL_DOM_ID} .wf-body{overflow:hidden;transition:max-height .26s ease,opacity .2s ease;
    max-height:520px;opacity:1;padding-top:10px;}
  #${PANEL_DOM_ID}.collapsed .wf-body{max-height:0;opacity:0;padding-top:0;}
  #${PANEL_DOM_ID}.collapsed{padding-bottom:12px;}

  .wf-row{margin-bottom:11px;}
  .wf-row-top{display:flex;justify-content:space-between;align-items:baseline;
    font-size:11px;color:rgba(232,238,252,.7);margin-bottom:5px;}
  .wf-row-top b{font-size:11px;font-weight:600;color:#8ab4ff;}
  .wf-range{-webkit-appearance:none;appearance:none;width:100%;height:4px;border-radius:2px;
    background:rgba(255,255,255,.14);outline:none;cursor:pointer;}
  .wf-range::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;
    background:#fff;border:3px solid #4b82f7;box-shadow:0 1px 4px rgba(0,0,0,.5);transition:.15s;}
  .wf-range::-webkit-slider-thumb:hover{transform:scale(1.18);}
  .wf-range::-moz-range-thumb{width:11px;height:11px;border-radius:50%;background:#fff;
    border:3px solid #4b82f7;box-shadow:0 1px 4px rgba(0,0,0,.5);}

  .wf-switches{display:flex;flex-wrap:wrap;gap:6px;padding:2px 0 10px;}
  .wf-chip{flex:1 1 auto;text-align:center;font-size:11px;padding:5px 8px;border-radius:7px;
    cursor:pointer;transition:.18s;background:rgba(255,255,255,.06);
    border:1px solid rgba(255,255,255,.08);color:rgba(232,238,252,.62);white-space:nowrap;}
  .wf-chip:hover{background:rgba(255,255,255,.12);}
  .wf-chip.on{background:linear-gradient(180deg,rgba(75,130,247,.34),rgba(75,130,247,.18));
    border-color:rgba(120,165,255,.6);color:#fff;box-shadow:0 0 12px rgba(75,130,247,.22);}

  /* 探针卡片 */
  #${PROBE_DOM_ID}{padding:10px 12px;pointer-events:none;min-width:150px;
    opacity:0;transition:opacity .14s ease;}
  #${PROBE_DOM_ID}.on{opacity:1;}
  #${PROBE_DOM_ID} .wf-probe-main{display:flex;align-items:center;gap:10px;}
  #${PROBE_DOM_ID} .wf-speed{font-size:20px;font-weight:700;line-height:1;}
  #${PROBE_DOM_ID} .wf-unit{font-size:10px;color:rgba(232,238,252,.55);margin-left:2px;font-weight:400;}
  #${PROBE_DOM_ID} .wf-meta{font-size:11px;color:rgba(232,238,252,.72);margin-top:3px;}
  #${PROBE_DOM_ID} .wf-coord{font-size:10px;color:rgba(232,238,252,.42);margin-top:5px;
    padding-top:5px;border-top:1px solid rgba(255,255,255,.08);}
  `;
  document.head.appendChild(style);
}

/** 色阶 CSS 渐变字符串 */
function colorStopsGradient() {
  return WIND_COLOR_STOPS.map(
    (s) => `rgb(${s.rgb[0]}, ${s.rgb[1]}, ${s.rgb[2]}) ${(s.stop * 100).toFixed(0)}%`
  ).join(', ');
}

/** 绘制风场图例（HTML 覆盖层，挂在 viewer 容器右下角） */
function drawWindLegend(viewer: any, maxSpeed: number) {
  ensureStyles();
  document.getElementById(LEGEND_DOM_ID)?.remove();

  const ticks = [0, 0.25, 0.5, 0.75, 1]
    .map((t) => `<span>${(maxSpeed * t).toFixed(0)}</span>`)
    .join('');

  const el = document.createElement('div');
  el.id = LEGEND_DOM_ID;
  el.className = 'wf-card';
  el.innerHTML = `
    <div class="wf-title"><span class="wf-dot"></span>风速 <span style="color:rgba(232,238,252,.5);font-weight:400;">m/s</span></div>
    <div class="wf-bar" style="background:linear-gradient(to right, ${colorStopsGradient()});"></div>
    <div class="wf-ticks">${ticks}</div>
  `;
  prepareContainer(viewer).appendChild(el);
}

/* --------------------------------------------------------------- 控制面板 */

interface SliderDef {
  key: 'particleCount' | 'speedFactor' | 'trailFade' | 'particleWidth' | 'labelStep';
  label: string;
  min: number;
  max: number;
  step: number;
  /** 显示用格式化 */
  format: (v: number) => string;
}

const SLIDERS: SliderDef[] = [
  { key: 'particleCount', label: '粒子数量', min: 500, max: 8000, step: 100, format: (v) => String(v) },
  { key: 'speedFactor', label: '流动速度', min: 0.01, max: 0.15, step: 0.005, format: (v) => v.toFixed(2) },
  { key: 'trailFade', label: '拖尾长度', min: 0.8, max: 0.98, step: 0.005, format: (v) => v.toFixed(2) },
  { key: 'particleWidth', label: '粒子粗细', min: 0.5, max: 4, step: 0.1, format: (v) => v.toFixed(1) },
  { key: 'labelStep', label: '标签间隔', min: 1, max: 8, step: 1, format: (v) => `每 ${v} 点` },
];

/**
 * 右上角参数调节面板：滑块调粒子表现，胶囊按钮切换图层。
 * 所有修改都通过 handle.setSettings 走同一条路径，保证 API 调用与 UI 状态一致。
 */
function createControlPanel(
  viewer: any,
  handle: WindFieldHandle,
  cfg: { collapsed: boolean; maxSpeed: number }
) {
  ensureStyles();
  document.getElementById(PANEL_DOM_ID)?.remove();

  const el = document.createElement('div');
  el.id = PANEL_DOM_ID;
  el.className = `wf-card${cfg.collapsed ? ' collapsed' : ''}`;

  const rows = SLIDERS.map(
    (s) => `
    <div class="wf-row" data-row="${s.key}">
      <div class="wf-row-top"><span>${s.label}</span><b data-val="${s.key}"></b></div>
      <input class="wf-range" type="range" data-key="${s.key}"
             min="${s.min}" max="${s.max}" step="${s.step}" />
    </div>`
  ).join('');

  el.innerHTML = `
    <div class="wf-head">
      <div class="wf-title"><span class="wf-dot" data-dot></span>风场控制
        <span style="color:rgba(232,238,252,.45);font-weight:400;">峰值 ${cfg.maxSpeed.toFixed(1)} m/s</span>
      </div>
      <div class="wf-fold" data-fold>${cfg.collapsed ? '▼' : '▲'}</div>
    </div>
    <div class="wf-body">
      <div class="wf-switches">
        <div class="wf-chip" data-chip="animate">粒子</div>
        <div class="wf-chip" data-chip="showArrows">风向箭头</div>
        <div class="wf-chip" data-chip="showLabels">风速标注</div>
      </div>
      ${rows}
    </div>
  `;

  prepareContainer(viewer).appendChild(el);

  // 面板上的滚轮/拖拽不应传给 Cesium 相机
  const stop = (e: Event) => e.stopPropagation();
  ['wheel', 'mousedown', 'pointerdown', 'dblclick', 'contextmenu'].forEach((t) =>
    el.addEventListener(t, stop)
  );

  const sync = () => {
    const s = handle.getSettings();

    el.querySelectorAll<HTMLElement>('[data-chip]').forEach((chip) => {
      const key = chip.dataset.chip as keyof WindFieldSettings;
      chip.classList.toggle('on', Boolean(s[key]));
    });

    SLIDERS.forEach((def) => {
      const input = el.querySelector<HTMLInputElement>(`input[data-key="${def.key}"]`);
      const label = el.querySelector<HTMLElement>(`b[data-val="${def.key}"]`);
      const value = s[def.key] as number;
      if (input && document.activeElement !== input) input.value = String(value);
      if (label) label.textContent = def.format(value);

      // 只在相关图层开启时才显示对应的滑块，面板保持简洁
      const row = el.querySelector<HTMLElement>(`[data-row="${def.key}"]`);
      if (!row) return;
      const visible =
        def.key === 'labelStep' ? s.showLabels : s.animate;
      row.style.display = visible ? 'block' : 'none';
    });

    el.querySelector<HTMLElement>('[data-dot]')?.classList.toggle('off', !s.animate);
  };

  el.querySelectorAll<HTMLInputElement>('input[data-key]').forEach((input) => {
    input.addEventListener('input', () => {
      handle.setSettings({ [input.dataset.key!]: Number(input.value) } as Partial<WindFieldSettings>);
    });
  });

  el.querySelectorAll<HTMLElement>('[data-chip]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.chip as keyof WindFieldSettings;
      handle.setSettings({ [key]: !handle.getSettings()[key] } as Partial<WindFieldSettings>);
    });
  });

  const fold = el.querySelector<HTMLElement>('[data-fold]')!;
  fold.addEventListener('click', () => {
    const collapsed = el.classList.toggle('collapsed');
    fold.textContent = collapsed ? '▼' : '▲';
  });

  sync();

  return {
    sync,
    remove() {
      el.remove();
    },
  };
}

/* ----------------------------------------------------------------- 鼠标探针 */

/**
 * 鼠标悬停读数卡片：跟随光标显示该点风速、蒲福风级、风向（罗盘 + 中文方位）。
 * 用 Cesium 的鼠标事件把屏幕坐标反投到经纬度，再走同一个插值采样器。
 */
function createWindProbe(Cesium: any, viewer: any, sampler: FieldSampler, colorMax: number) {
  ensureStyles();
  document.getElementById(PROBE_DOM_ID)?.remove();

  const el = document.createElement('div');
  el.id = PROBE_DOM_ID;
  el.className = 'wf-card';
  el.innerHTML = `
    <div class="wf-probe-main">
      <canvas data-dial width="88" height="88" style="width:44px;height:44px;"></canvas>
      <div>
        <div class="wf-speed" data-speed>0<span class="wf-unit">m/s</span></div>
        <div class="wf-meta" data-meta></div>
      </div>
    </div>
    <div class="wf-coord" data-coord></div>
  `;
  const container = prepareContainer(viewer);
  container.appendChild(el);

  const dial = el.querySelector<HTMLCanvasElement>('[data-dial]')!;
  const dctx = dial.getContext('2d')!;
  const speedEl = el.querySelector<HTMLElement>('[data-speed]')!;
  const metaEl = el.querySelector<HTMLElement>('[data-meta]')!;
  const coordEl = el.querySelector<HTMLElement>('[data-coord]')!;

  /** 画罗盘：外圈刻度 + 指向"风的去向"的箭头 */
  const drawDial = (direction: number, ratio: number, rgb: [number, number, number]) => {
    const size = dial.width;
    const c = size / 2;
    const color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    dctx.clearRect(0, 0, size, size);

    // 外圈
    dctx.lineWidth = 3;
    dctx.strokeStyle = 'rgba(255,255,255,.16)';
    dctx.beginPath();
    dctx.arc(c, c, c - 6, 0, Math.PI * 2);
    dctx.stroke();

    // 风速圆弧（从正上方顺时针）
    dctx.lineWidth = 5;
    dctx.strokeStyle = color;
    dctx.lineCap = 'round';
    dctx.beginPath();
    dctx.arc(c, c, c - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(ratio, 0.02, 1));
    dctx.stroke();

    // 箭头指向风的去向：屏幕上 0° 朝上，顺时针
    const rad = ((direction + 180) * Math.PI) / 180;
    const len = c - 16;
    const tipX = c + Math.sin(rad) * len;
    const tipY = c - Math.cos(rad) * len;
    const tailX = c - Math.sin(rad) * len * 0.75;
    const tailY = c + Math.cos(rad) * len * 0.75;

    dctx.lineWidth = 4;
    dctx.strokeStyle = color;
    dctx.beginPath();
    dctx.moveTo(tailX, tailY);
    dctx.lineTo(tipX, tipY);
    dctx.stroke();

    // 三角箭头头部
    const wing = 9;
    dctx.fillStyle = color;
    dctx.beginPath();
    dctx.moveTo(tipX, tipY);
    dctx.lineTo(
      tipX - Math.sin(rad - 0.5) * wing,
      tipY + Math.cos(rad - 0.5) * wing
    );
    dctx.lineTo(
      tipX - Math.sin(rad + 0.5) * wing,
      tipY + Math.cos(rad + 0.5) * wing
    );
    dctx.closePath();
    dctx.fill();

    // 中心点
    dctx.fillStyle = 'rgba(255,255,255,.85)';
    dctx.beginPath();
    dctx.arc(c, c, 2.5, 0, Math.PI * 2);
    dctx.fill();
  };

  let visible = true;
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  const hide = () => el.classList.remove('on');

  handler.setInputAction((movement: any) => {
    if (!visible) return;
    const cartesian = viewer.camera.pickEllipsoid(
      movement.endPosition,
      viewer.scene.globe.ellipsoid
    );
    if (!cartesian) return hide();

    const carto = Cesium.Cartographic.fromCartesian(cartesian);
    const lon = Cesium.Math.toDegrees(carto.longitude);
    const lat = Cesium.Math.toDegrees(carto.latitude);
    const s = sampler(lon, lat);
    if (!s) return hide();

    const [u, v, speed] = s;
    const direction = uvToMeteoDirection(u, v);
    const ratio = colorMax > 0 ? clamp(speed / colorMax, 0, 1) : 0;
    const rgb = interpolateStops(ratio);
    const bf = beaufortOf(speed);

    speedEl.innerHTML = `${speed.toFixed(1)}<span class="wf-unit">m/s</span>`;
    speedEl.style.color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    metaEl.innerHTML = `${compassOf(direction)}风 ${direction.toFixed(0)}° · ${bf.level} 级${bf.name}`;
    coordEl.textContent = `${lon.toFixed(2)}°E  ${lat.toFixed(2)}°N`;
    drawDial(direction, ratio, rgb);

    // 卡片贴着光标右下方，靠近视口边缘时翻转，避免被裁掉
    const rect = container.getBoundingClientRect();
    const cw = el.offsetWidth;
    const ch = el.offsetHeight;
    let x = movement.endPosition.x + 16;
    let y = movement.endPosition.y + 16;
    if (x + cw > rect.width - 8) x = movement.endPosition.x - cw - 16;
    if (y + ch > rect.height - 8) y = movement.endPosition.y - ch - 16;
    el.style.left = `${Math.max(8, x)}px`;
    el.style.top = `${Math.max(8, y)}px`;
    el.classList.add('on');
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  return {
    toggle(next: boolean) {
      visible = next;
      if (!next) hide();
    },
    destroy() {
      handler.destroy();
      el.remove();
    },
  };
}

