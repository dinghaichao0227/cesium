/**
 * 降雨场图绘制（支持动态降雨动画）
 *
 * 渲染方式：
 * 1. 动态层：Canvas 覆盖层上跑雨滴。雨滴锚点是经纬度（跟随地图缩放/平移），
 *    下落位移是屏幕像素，因此俯视图上看起来是"雨落在地图上"。
 *    雨滴的播撒密度、下落速度、长度都按该点的降雨强度调制，
 *    暴雨区又密又快，无雨区几乎没有雨滴。
 * 2. 静态层（可选）：网格色块表示雨量分级，可开启呼吸式明暗脉动。
 */

/** 单个降雨格点（值代表该格子左下角起的一个网格单元） */
export interface RainfallPoint {
  lon: number;
  lat: number;
  /** 降雨量 mm */
  rainfall: number;
}

export interface RainfallBounds {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export interface RainfallFieldOptions {
  /** 网格密度，默认 8 */
  gridSize?: number;
  /** 外部数据；传入后不再生成模拟数据 */
  data?: RainfallPoint[];

  /** 是否开启雨滴动画，默认 true */
  animate?: boolean;
  /** 雨滴数量上限，默认 1200 */
  dropCount?: number;
  /** 雨滴下落速度 像素/秒（暴雨区），默认 420 */
  fallSpeed?: number;
  /** 雨滴下落的屏幕行程 像素，超过即重播撒，默认 90 */
  fallRange?: number;
  /** 雨滴斜率（横向偏移/纵向位移），默认 0.18 */
  slant?: number;
  /** 雨滴线宽，默认 1.1 */
  dropWidth?: number;
  /** 低于该雨量的区域不生成雨滴 mm，默认 2 */
  dropThreshold?: number;

  /** 是否绘制网格色块，默认 true */
  showCells?: boolean;
  /** 色块是否呼吸式脉动，默认 true（animate 为 false 时自动关闭） */
  pulse?: boolean;
  /** 脉动周期 秒，默认 3 */
  pulsePeriod?: number;
  /** 是否显示网格边线，默认 false */
  showOutline?: boolean;

  /** 是否显示雨量文字，默认 false */
  showLabels?: boolean;
  /** 只给超过该雨量的格子打标签 mm，默认 10 */
  labelThreshold?: number;
  /** 是否显示 HTML 图例，默认 true */
  showLegend?: boolean;
  /** 颜色映射的雨量上限 mm，默认 100 */
  colorMaxRainfall?: number;
  /** 数据源名称，默认 rainfallField */
  name?: string;
}

/** 降雨场句柄 */
export interface RainfallFieldHandle {
  dataSource: any;
  data: RainfallPoint[];
  minRainfall: number;
  maxRainfall: number;
  /** 启动雨滴动画 */
  start(): void;
  /** 暂停雨滴动画 */
  stop(): void;
  show(): void;
  hide(): void;
  toggle(visible?: boolean): void;
  /** 销毁：移除 entity、canvas、图例并停止动画 */
  remove(): void;
}

/**
 * 雨量分级（气象 24h 降水量分级），用于色块、雨滴颜色和图例。
 * min 为该级下界 mm。
 */
const RAIN_LEVELS: { min: number; rgb: [number, number, number]; alpha: number; label: string }[] = [
  { min: 0, rgb: [200, 220, 255], alpha: 0.0, label: '无雨' },
  { min: 2, rgb: [120, 190, 255], alpha: 0.28, label: '小雨' },
  { min: 10, rgb: [40, 130, 245], alpha: 0.4, label: '中雨' },
  { min: 25, rgb: [40, 190, 90], alpha: 0.5, label: '大雨' },
  { min: 50, rgb: [250, 200, 40], alpha: 0.58, label: '暴雨' },
  { min: 75, rgb: [230, 60, 40], alpha: 0.66, label: '大暴雨' },
];

const LEGEND_DOM_ID = 'rainfall-field-legend';
const CANVAS_DOM_ID = 'rainfall-field-canvas';

export const rainfallField = (
  Cesium: any,
  viewer: any,
  bounds: RainfallBounds = { minLon: 70, minLat: 10, maxLon: 140, maxLat: 60 },
  options: RainfallFieldOptions | number = {}
): RainfallFieldHandle => {
  // 兼容旧签名 rainfallField(Cesium, viewer, bounds, gridSize)
  const opts: RainfallFieldOptions =
    typeof options === 'number' ? { gridSize: options } : options || {};

  const gridSize = opts.gridSize ?? 8;
  const animate = opts.animate ?? true;
  const showCells = opts.showCells ?? true;
  const pulse = animate && (opts.pulse ?? true);
  const showLabels = opts.showLabels ?? false;
  const labelThreshold = opts.labelThreshold ?? 10;
  const colorMax = opts.colorMaxRainfall ?? 100;

  const lonStep = (bounds.maxLon - bounds.minLon) / gridSize;
  const latStep = (bounds.maxLat - bounds.minLat) / gridSize;

  const data = opts.data?.length ? opts.data : generateRainfallData(bounds, gridSize);

  // 雨量范围
  let minRainfall = Infinity;
  let maxRainfall = -Infinity;
  data.forEach((p) => {
    minRainfall = Math.min(minRainfall, p.rainfall);
    maxRainfall = Math.max(maxRainfall, p.rainfall);
  });
  if (!Number.isFinite(minRainfall)) {
    minRainfall = 0;
    maxRainfall = 0;
  }

  const dataSource = new Cesium.CustomDataSource(opts.name ?? 'rainfallField');
  viewer.dataSources.add(dataSource);

  if (showCells || showLabels) {
    drawCellLayer(Cesium, dataSource.entities, data, {
      lonStep,
      latStep,
      colorMax,
      showCells,
      showOutline: opts.showOutline ?? false,
      showLabels,
      labelThreshold,
      pulse,
      pulsePeriod: opts.pulsePeriod ?? 3,
    });
  }

  if (opts.showLegend ?? true) {
    drawRainfallLegend(viewer);
  }

  const animator = animate
    ? createRainAnimator(Cesium, viewer, data, bounds, {
        lonStep,
        latStep,
        dropCount: opts.dropCount ?? 1200,
        fallSpeed: opts.fallSpeed ?? 420,
        fallRange: opts.fallRange ?? 90,
        slant: opts.slant ?? 0.18,
        dropWidth: opts.dropWidth ?? 1.1,
        dropThreshold: opts.dropThreshold ?? 2,
        colorMax,
      })
    : null;

  animator?.start();

  const handle: RainfallFieldHandle = {
    dataSource,
    data,
    minRainfall,
    maxRainfall,
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

/* ---------------------------------------------------------------- 雨滴动画层 */

interface Drop {
  /** 锚点经纬度（雨滴落点所在的地理位置） */
  lon: number;
  lat: number;
  /** 已下落的屏幕像素距离 */
  offset: number;
  /** 下落速度 像素/秒 */
  speed: number;
  /** 雨滴长度 像素 */
  length: number;
  /** 该点的雨量强度 0~1，决定颜色和透明度 */
  intensity: number;
}

interface RainAnimatorOptions {
  lonStep: number;
  latStep: number;
  dropCount: number;
  fallSpeed: number;
  fallRange: number;
  slant: number;
  dropWidth: number;
  dropThreshold: number;
  colorMax: number;
}

/**
 * 在 Cesium 容器上叠一层 canvas 下雨。
 * 雨滴的地理锚点按"雨量加权"抽样，所以雨滴自然聚集在强降水区。
 */
function createRainAnimator(
  Cesium: any,
  viewer: any,
  data: RainfallPoint[],
  bounds: RainfallBounds,
  opts: RainAnimatorOptions
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
    // 比风场粒子层再高一层，雨在风之上
    zIndex: '6',
  } as CSSStyleDeclaration);

  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;

  // 只保留达到阈值的格子，并按雨量构建累积分布，用于加权抽样
  const cells = data.filter((p) => p.rainfall >= opts.dropThreshold);
  const cumulative: number[] = [];
  let totalWeight = 0;
  cells.forEach((p) => {
    totalWeight += p.rainfall;
    cumulative.push(totalWeight);
  });

  /** 按雨量加权随机取一个格子（二分查找累积分布） */
  const pickCell = (): RainfallPoint | null => {
    if (!cells.length || totalWeight <= 0) return null;
    const target = Math.random() * totalWeight;
    let lo = 0;
    let hi = cumulative.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    return cells[lo];
  };

  const respawn = (d: Drop): Drop => {
    const cell = pickCell();
    if (!cell) {
      d.intensity = 0;
      return d;
    }
    // 在格子内随机取点，雨滴不会排成网格状
    d.lon = cell.lon + Math.random() * opts.lonStep;
    d.lat = cell.lat + Math.random() * opts.latStep;
    const t = clamp(cell.rainfall / opts.colorMax, 0, 1);
    d.intensity = t;
    // 强降水：更快、更长
    d.speed = opts.fallSpeed * (0.45 + 0.55 * t) * (0.85 + Math.random() * 0.3);
    d.length = (6 + 16 * t) * (0.8 + Math.random() * 0.4);
    d.offset = Math.random() * opts.fallRange;
    return d;
  };

  let drops: Drop[] = [];
  const seed = () => {
    drops = [];
    for (let i = 0; i < opts.dropCount; i++) drops.push(respawn({} as Drop));
  };

  let dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round((container.clientWidth || 1) * dpr);
    canvas.height = Math.round((container.clientHeight || 1) * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // Cesium 1.107 只有 wgs84ToWindowCoordinates，新版本改名为 worldToWindowCoordinates
  const toWindow =
    Cesium.SceneTransforms.worldToWindowCoordinates ??
    Cesium.SceneTransforms.wgs84ToWindowCoordinates;
  const scratchCartesian = new Cesium.Cartesian3();
  const scratchWindow = new Cesium.Cartesian2();

  const project = (lon: number, lat: number): any => {
    Cesium.Cartesian3.fromDegrees(lon, lat, 0, undefined, scratchCartesian);
    return toWindow.call(Cesium.SceneTransforms, viewer.scene, scratchCartesian, scratchWindow);
  };

  let rafId = 0;
  let running = false;
  let lastTime = 0;

  const frame = (time: number) => {
    if (!running) return;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
    lastTime = time;

    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    // 雨滴是逐帧重画的短线，直接清屏（拖尾感由雨滴自身长度提供）
    ctx.clearRect(0, 0, w, h);

    ctx.lineWidth = opts.dropWidth;
    ctx.lineCap = 'round';

    for (const d of drops) {
      if (d.intensity <= 0) continue;

      d.offset += d.speed * dt;
      if (d.offset > opts.fallRange) {
        respawn(d);
        d.offset = 0;
      }

      const win = project(d.lon, d.lat);
      if (!win) continue;
      // 视野外不画
      if (win.x < -50 || win.x > w + 50 || win.y < -50 || win.y > h + 50) continue;

      // 屏幕空间下落：y 向下增长，x 按 slant 斜切
      const x = win.x + d.offset * opts.slant;
      const y = win.y + d.offset;
      const [r, g, b] = rainColorAt(d.intensity * opts.colorMax);
      // 行程末尾淡出，雨滴不会突然消失
      const fade = 1 - clamp(d.offset / opts.fallRange, 0, 1) * 0.75;
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(0.35 + d.intensity * 0.5) * fade})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + d.length * opts.slant, y + d.length);
      ctx.stroke();
    }

    rafId = requestAnimationFrame(frame);
  };

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
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      canvas.style.display = 'none';
    },
    destroy() {
      this.stop();
      window.removeEventListener('resize', resize);
      canvas.remove();
    },
  };
}

/* --------------------------------------------------------------- 静态色块层 */

interface CellLayerOptions {
  lonStep: number;
  latStep: number;
  colorMax: number;
  showCells: boolean;
  showOutline: boolean;
  showLabels: boolean;
  labelThreshold: number;
  pulse: boolean;
  pulsePeriod: number;
}

function drawCellLayer(
  Cesium: any,
  entities: any,
  data: RainfallPoint[],
  opts: CellLayerOptions
) {
  const startTime = Date.now();

  data.forEach((p) => {
    const level = rainLevelOf(p.rainfall);
    if (level.alpha <= 0 && !opts.showLabels) return;

    if (opts.showCells && level.alpha > 0) {
      const base = Cesium.Color.fromBytes(level.rgb[0], level.rgb[1], level.rgb[2], 255);
      const intensity = clamp(p.rainfall / opts.colorMax, 0, 1);

      // 呼吸脉动：雨越大脉动幅度越明显，且各格子相位错开，整体像云团在涨落
      const phase = Math.random() * Math.PI * 2;
      const material = opts.pulse
        ? new Cesium.ColorMaterialProperty(
            new Cesium.CallbackProperty(() => {
              const t = (Date.now() - startTime) / 1000;
              const wave = Math.sin((t / opts.pulsePeriod) * Math.PI * 2 + phase);
              const amp = 0.12 + 0.1 * intensity;
              return base.withAlpha(clamp(level.alpha + wave * amp, 0.05, 0.95));
            }, false)
          )
        : new Cesium.ColorMaterialProperty(base.withAlpha(level.alpha));

      entities.add({
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray([
              p.lon, p.lat,
              p.lon + opts.lonStep, p.lat,
              p.lon + opts.lonStep, p.lat + opts.latStep,
              p.lon, p.lat + opts.latStep,
            ])
          ),
          material,
          outline: opts.showOutline,
          outlineColor: Cesium.Color.fromBytes(128, 128, 128, 80),
        },
      });
    }

    if (opts.showLabels && p.rainfall >= opts.labelThreshold) {
      entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          p.lon + opts.lonStep / 2,
          p.lat + opts.latStep / 2
        ),
        label: {
          text: p.rainfall.toFixed(1),
          font: 'bold 11px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    }
  });
}

/* ------------------------------------------------------------------ 工具函数 */

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** 取雨量所属的分级 */
function rainLevelOf(rainfall: number) {
  let level = RAIN_LEVELS[0];
  for (const l of RAIN_LEVELS) {
    if (rainfall >= l.min) level = l;
    else break;
  }
  return level;
}

/** 雨量 -> rgb（在相邻分级之间线性过渡，避免色块出现硬边） */
function rainColorAt(rainfall: number): [number, number, number] {
  for (let i = 0; i < RAIN_LEVELS.length - 1; i++) {
    const a = RAIN_LEVELS[i];
    const b = RAIN_LEVELS[i + 1];
    if (rainfall < b.min) {
      const t = b.min === a.min ? 0 : clamp((rainfall - a.min) / (b.min - a.min), 0, 1);
      return [
        Math.round(a.rgb[0] + (b.rgb[0] - a.rgb[0]) * t),
        Math.round(a.rgb[1] + (b.rgb[1] - a.rgb[1]) * t),
        Math.round(a.rgb[2] + (b.rgb[2] - a.rgb[2]) * t),
      ];
    }
  }
  return RAIN_LEVELS[RAIN_LEVELS.length - 1].rgb;
}

/**
 * 生成降雨量网格数据（模拟数据，接入真实数据时用 options.data 传入）
 * 多个正弦叠加造出连片的雨带，而不是散点。
 */
function generateRainfallData(bounds: RainfallBounds, gridSize: number): RainfallPoint[] {
  const data: RainfallPoint[] = [];
  const lonStep = (bounds.maxLon - bounds.minLon) / gridSize;
  const latStep = (bounds.maxLat - bounds.minLat) / gridSize;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const lon = bounds.minLon + lonStep * j;
      const lat = bounds.minLat + latStep * i;

      const band =
        50 * Math.sin((lon / 15) * Math.PI) * Math.cos((lat / 15) * Math.PI) +
        30 * Math.sin(((lon + lat) / 20) * Math.PI);
      const rainfall = clamp(Math.max(0, band) + Math.random() * 10, 0, 100);

      data.push({ lon, lat, rainfall });
    }
  }

  return data;
}

/** 绘制降雨图例（HTML 覆盖层，放在风场图例上方，避免互相遮挡） */
function drawRainfallLegend(viewer: any) {
  document.getElementById(LEGEND_DOM_ID)?.remove();

  // 跳过"无雨"级，图例只列有色的分级
  const rows = RAIN_LEVELS.slice(1)
    .map((l, i, arr) => {
      const next = arr[i + 1];
      const range = next ? `${l.min}~${next.min}` : `≥${l.min}`;
      return `
        <div style="display:flex;align-items:center;gap:6px;margin-top:3px;">
          <span style="width:14px;height:10px;border-radius:2px;flex:none;
            background:rgb(${l.rgb[0]}, ${l.rgb[1]}, ${l.rgb[2]});"></span>
          <span style="flex:none;">${l.label}</span>
          <span style="margin-left:auto;opacity:.75;">${range}</span>
        </div>`;
    })
    .join('');

  const el = document.createElement('div');
  el.id = LEGEND_DOM_ID;
  el.innerHTML = `<div style="font-size:12px;margin-bottom:2px;">降雨量 (mm)</div>${rows}`;
  Object.assign(el.style, {
    position: 'absolute',
    right: '12px',
    bottom: '120px',
    width: '160px',
    padding: '8px 10px',
    background: 'rgba(20, 26, 38, 0.72)',
    color: '#fff',
    borderRadius: '4px',
    fontFamily: 'sans-serif',
    fontSize: '11px',
    pointerEvents: 'none',
    zIndex: '10',
  } as CSSStyleDeclaration);

  const container: HTMLElement = viewer.container ?? document.body;
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }
  container.appendChild(el);
}
