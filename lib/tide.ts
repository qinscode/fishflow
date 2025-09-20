// Tide API utilities using Open‑Meteo (no API key required)
// - Fetches today's hourly tide heights (preferred) or marine sea level as fallback
// - Interpolates to 5‑minute resolution
// - Smooths with a moving average to form a sine‑like curve
// - Detects local highs/lows and computes current level + trend
//
// Notes:
// - Open‑Meteo's coastal grid has limited accuracy; treat as indicative only.
// - All units are meters for height and ISO strings for time.

export type TideTrend = 'rising' | 'falling' | 'flat';

export interface TideSeriesPoint {
  time: string; // ISO local time as returned by API
  level: number; // meters
}

export interface TideExtreme {
  time: string; // ISO local time
  level: number; // meters
  type: 'high' | 'low';
}

export interface TideSummary {
  nowLocal: string;
  nowLevelM: number;
  trend: TideTrend;
  highs: TideExtreme[];
  lows: TideExtreme[];
  series: TideSeriesPoint[]; // smoothed, 5‑minute step
  meta: {
    source: 'open-meteo-tide' | 'open-meteo-marine';
    timezone?: string;
    note?: string;
  };
}

interface HourlyResponse {
  time: string[];
  values: number[]; // tide_height or sea_level_height_msl in meters
  timezone?: string;
}

// --- Public API ---

/**
 * Get a tide summary for today for a given lat/lon.
 * - Uses Open‑Meteo Tide API first; falls back to Marine API.
 */
export async function getTodayTideSummary(
  lat: number,
  lon: number,
  opts?: { smoothWindow?: number; stepMinutes?: number; now?: Date }
): Promise<TideSummary | null> {
  const smoothWindow = clampOdd(opts?.smoothWindow ?? 21, 3, 301);
  const stepMinutes = Math.max(1, Math.floor(opts?.stepMinutes ?? 5));
  const now = opts?.now ?? new Date();

  // Use marine API sea_level_height_msl exclusively
  let src: 'open-meteo-tide' | 'open-meteo-marine' = 'open-meteo-marine';
  const hourly = await fetchOpenMeteoMarineHourly(lat, lon);
  if (!hourly || hourly.time.length === 0) {
    return null;
  }

  const { time: hourlyTimes, values: hourlyVals, timezone } = hourly;

  // Build a uniform time grid (stepMinutes) across the hourly bounds
  const grid = buildUniformTimeGrid(hourlyTimes, stepMinutes);
  const interp = interpolate1D(
    hourlyTimes.map((t) => new Date(t).getTime()),
    hourlyVals,
    grid.map((g) => g.getTime())
  );

  // Smooth to a sine‑like curve
  const smooth = movingAverage(interp, smoothWindow);

  // Detect extrema on smoothed series
  const highs: TideExtreme[] = [];
  const lows: TideExtreme[] = [];
  detectExtrema(
    smooth,
    (idx) => {
      highs.push({ time: grid[idx].toISOString(), level: round2(smooth[idx]), type: 'high' });
    },
    (idx) => {
      lows.push({ time: grid[idx].toISOString(), level: round2(smooth[idx]), type: 'low' });
    }
  );

  // Current index and trend
  const nowIdx = nearestIndex(grid, now);
  const prev = Math.max(0, nowIdx - 1);
  const next = Math.min(smooth.length - 1, nowIdx + 1);
  const slope = smooth[next] - smooth[prev];
  const trend: TideTrend = slope > 0 ? 'rising' : slope < 0 ? 'falling' : 'flat';

  // Assemble smoothed series
  const series: TideSeriesPoint[] = grid.map((g, i) => ({ time: g.toISOString(), level: round2(smooth[i]) }));

  return {
    nowLocal: grid[nowIdx].toISOString(),
    nowLevelM: round2(smooth[nowIdx]),
    trend,
    highs,
    lows,
    series,
    meta: {
      source: src,
      timezone,
      note: 'Indicative only. Coastal accuracy limited on coarse grids.',
    },
  };
}

// --- Fetch helpers ---

async function fetchOpenMeteoTideHourly(lat: number, lon: number): Promise<HourlyResponse | null> {
  try {
    const { start, end } = todayRange();
    const url = `https://tide-api.open-meteo.com/v1/tide?latitude=${lat}&longitude=${lon}` +
      `&hourly=tide_height&start_date=${start}&end_date=${end}&timezone=auto&cell_selection=sea`;
    const res = await fetch(url);
    if (!res.ok) {
      return null;
    }
    const json: any = await res.json();
    const times: string[] | undefined = json?.hourly?.time;
    const vals: number[] | undefined = json?.hourly?.tide_height;
    if (!Array.isArray(times) || !Array.isArray(vals) || times.length !== vals.length) {
      return null;
    }
    return { time: times, values: vals.map(toNumber), timezone: json?.timezone }; 
  } catch {
    return null;
  }
}

async function fetchOpenMeteoMarineHourly(lat: number, lon: number): Promise<HourlyResponse | null> {
  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
      `&hourly=sea_level_height_msl&timezone=auto&cell_selection=sea&forecast_days=1&current=sea_level_height_msl`;
    try { console.log('[Tide] marine.url:', url); } catch {}
    const res = await fetch(url);
    if (!res.ok) {
      return null;
    }
    const json: any = await res.json();
    const times: string[] | undefined = json?.hourly?.time;
    const vals: number[] | undefined = json?.hourly?.sea_level_height_msl;
    if (!Array.isArray(times) || !Array.isArray(vals) || times.length !== vals.length) {
      return null;
    }
    return { time: times, values: vals.map(toNumber), timezone: json?.timezone };
  } catch {
    return null;
  }
}

// --- Math helpers ---

function movingAverage(y: number[], window: number): number[] {
  const win = clampOdd(Math.floor(window), 3, Math.min(301, y.length | 1));
  const pad = Math.floor(win / 2);
  const kernel = 1 / win;
  const out: number[] = new Array(y.length);
  for (let i = 0; i < y.length; i++) {
    // Edge extension
    let sum = 0;
    for (let k = -pad; k <= pad; k++) {
      const idx = clamp(i + k, 0, y.length - 1);
      sum += y[idx];
    }
    out[i] = sum * kernel;
  }
  return out;
}

function interpolate1D(xs: number[], ys: number[], grid: number[]): number[] {
  if (xs.length !== ys.length || xs.length === 0) {
    return [];
  }
  const out: number[] = new Array(grid.length);
  let j = 0;
  for (let i = 0; i < grid.length; i++) {
    const g = grid[i];
    while (j < xs.length - 2 && xs[j + 1] < g) {
      j++;
    }
    const x0 = xs[j], x1 = xs[j + 1] ?? xs[j];
    const y0 = ys[j], y1 = ys[j + 1] ?? ys[j];
    out[i] = x1 === x0 ? y0 : y0 + ((y1 - y0) * (g - x0)) / (x1 - x0);
  }
  return out;
}

function detectExtrema(
  y: number[],
  onHigh: (idx: number) => void,
  onLow: (idx: number) => void
) {
  for (let i = 1; i < y.length - 1; i++) {
    const dy1 = y[i] - y[i - 1];
    const dy2 = y[i + 1] - y[i];
    if (dy1 > 0 && dy2 < 0) {
      onHigh(i);
    } else if (dy1 < 0 && dy2 > 0) {
      onLow(i);
    }
  }
}

function buildUniformTimeGrid(hourlyTimes: string[], stepMinutes: number): Date[] {
  if (!hourlyTimes.length) {
    return [];
  }
  const t0 = new Date(hourlyTimes[0]).getTime();
  const t1 = new Date(hourlyTimes[hourlyTimes.length - 1]).getTime();
  const stepMs = stepMinutes * 60 * 1000;
  const out: Date[] = [];
  for (let t = t0; t <= t1; t += stepMs) {
    out.push(new Date(t));
  }
  if (out.length && out[out.length - 1].getTime() < t1) {
    out.push(new Date(t1));
  }
  return out;
}

function nearestIndex(arr: Date[], when: Date): number {
  if (!arr.length) {
    return 0;
  }
  const w = when.getTime();
  let best = 0;
  let bestAbs = Math.abs(arr[0].getTime() - w);
  for (let i = 1; i < arr.length; i++) {
    const d = Math.abs(arr[i].getTime() - w);
    if (d < bestAbs) {
      best = i;
      bestAbs = d;
    }
  }
  return best;
}

function todayRange(): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  const s = `${y}-${m}-${d}`;
  return { start: s, end: s };
}

// --- tiny utils ---

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
function clampOdd(n: number, lo: number, hi: number) {
  const x = clamp(n, lo, hi);
  return x % 2 === 0 ? x + 1 : x;
}
function toNumber(n: any): number {
  const x = Number(n);
  return isFinite(x) ? x : 0;
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// Optional: export primitives for reuse in charts/hook logic
export const tideMath = { movingAverage, interpolate1D, detectExtrema };
