import React, { useMemo } from 'react';
import { View } from 'react-native';

import { TideData } from '@/lib/weatherService';
import type { TideSeriesPoint, TideTrend } from '@/lib/tide';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from '@/lib/i18n';
import { useTheme } from '@/hooks/useThemeColor';

export interface TideChartProps {
  tides: TideData[];
  now?: Date;
  width?: number;
  height?: number;
  extraHours?: number; // extend view range on both sides
  // Optional: use smoothed series from lib/tide for better visuals
  series?: TideSeriesPoint[];
}

/**
 * Lightweight tide chart using a cosine interpolation between the
 * nearest tide extremes (high/low). Renders a dotted sine-like path and
 * a prominent dot for the current position. No external SVG dependency.
 */
export function TideChart({
  tides,
  now = new Date(),
  width = 240,
  height = 64,
  extraHours = 2,
  series,
}: TideChartProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    samples,
    currentX,
    currentY,
    label,
  } = useMemo(() => {
    if (series && series.length >= 3) {
      return computeFromSmoothedSeries(series, now, width, height);
    }
    return computeTideSeries(tides, now, width, height, extraHours);
  }, [tides, now, width, height, extraHours, series?.length]);

  if (!samples.length) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 8 }}>
        <ThemedText type="bodySmall" style={{ color: theme.colors.textSecondary }}>
          {t('common.no.data')}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={{ width, height, position: 'relative', alignSelf: 'center', marginTop: 6 }}>
      {/* Baseline */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: height / 2,
          height: 1,
          backgroundColor: theme.colors.border,
        }}
      />

      {/* Sine-like dotted path */}
      {samples.map((p, idx) => (
        <View
          key={idx}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: 2,
            height: 2,
            borderRadius: 1,
            backgroundColor: theme.colors.primary,
            opacity: 0.8,
          }}
        />
      ))}

      {/* Current position dot */}
      <View
        style={{
          position: 'absolute',
          left: currentX - 4,
          top: currentY - 4,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.colors.accent,
          borderWidth: 1,
          borderColor: theme.colors.surface,
        }}
      />

      {/* Label */}
      <View style={{ position: 'absolute', right: 0, top: 0 }}>
        <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
          {label}
        </ThemedText>
      </View>

      {/* Highest/Lowest tide markers with times on x-axis (series required) */}
      <TideExtremeMarkers tides={tides} series={series} width={width} height={height} />
    </View>
  );
}

function computeTideSeries(
  tides: TideData[],
  now: Date,
  width: number,
  height: number,
  extraHours: number
) {
  // Find nearest previous and next tide extremes
  const sorted = [...tides].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  const nowMs = now.getTime();
  let prev = sorted[0];
  let next = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length; i++) {
    const t = new Date(sorted[i].time).getTime();
    if (t <= nowMs) { prev = sorted[i]; }
    if (t >= nowMs) { next = sorted[i]; break; }
  }
  if (!prev || !next || prev.time === next.time) {
    return { samples: [] as { x: number; y: number }[], currentX: 0, currentY: height / 2, label: '' };
  }

  const t1 = new Date(prev.time).getTime();
  const t2 = new Date(next.time).getTime();
  const dur = Math.max(1, t2 - t1);
  const progress = Math.min(1, Math.max(0, (nowMs - t1) / dur));
  const durHours = dur / (60 * 60 * 1000);
  const marginProp = Math.max(0, Math.min(1, (extraHours || 0) / Math.max(0.1, durHours)));
  const pStart = -marginProp;
  const pEnd = 1 + marginProp;

  const h1 = prev.height;
  const h2 = next.height;
  const mean = (h1 + h2) / 2;
  const amp = Math.abs(h2 - h1) / 2;
  const isHighToLow = prev.type === 'high' && next.type === 'low';

  // Cosine interpolation across [0..pi]
  const cosAt = (p: number) => (isHighToLow ? mean + amp * Math.cos(Math.PI * p) : mean - amp * Math.cos(Math.PI * p));

  // Normalize y to chart height (invert y so higher water draws near top)
  const hMin = Math.min(h1, h2) - amp * 0.2; // small padding
  const hMax = Math.max(h1, h2) + amp * 0.2;
  const toY = (hVal: number) => {
    const norm = hMax === hMin ? 0.5 : (hVal - hMin) / (hMax - hMin);
    return Math.round((1 - norm) * (height - 8)) + 4;
  };

  const N = Math.max(32, Math.floor(width / 6));
  const samples: { x: number; y: number }[] = [];
  for (let i = 0; i < N; i++) {
    const p = pStart + (i / (N - 1)) * (pEnd - pStart);
    const x = Math.round(((p - pStart) / (pEnd - pStart)) * (width - 4)) + 2;
    const y = toY(cosAt(p));
    samples.push({ x, y });
  }

  const currentHeight = cosAt(progress);
  const currentX = Math.round(((progress - pStart) / (pEnd - pStart)) * (width - 4)) + 2;
  const currentY = toY(currentHeight);
  const label = `${currentHeight.toFixed(2)} m`;

  return { samples, currentX, currentY, label };
}

function computeFromSmoothedSeries(
  series: TideSeriesPoint[],
  now: Date,
  width: number,
  height: number,
) {
  const times = series.map(p => new Date(p.time).getTime());
  const levels = series.map(p => p.level);
  if (times.length < 3) {
    return { samples: [] as { x: number; y: number }[], currentX: 0, currentY: height / 2, label: '' };
  }
  const tMin = times[0];
  const tMax = times[times.length - 1];
  const hMinVal = Math.min(...levels);
  const hMaxVal = Math.max(...levels);
  const toY = (hVal: number) => {
    const norm = hMaxVal === hMinVal ? 0.5 : (hVal - hMinVal) / (hMaxVal - hMinVal);
    return Math.round((1 - norm) * (height - 8)) + 4;
  };
  const N = Math.max(48, Math.floor(width / 4));
  const samples: { x: number; y: number }[] = [];
  for (let i = 0; i < N; i++) {
    const p = i / (N - 1);
    const t = tMin + p * (tMax - tMin);
    // nearest series point
    let idx = 0;
    let best = Number.POSITIVE_INFINITY;
    for (let k = 0; k < times.length; k++) {
      const d = Math.abs(times[k] - t);
      if (d < best) { best = d; idx = k; }
    }
    const x = Math.round(p * (width - 4)) + 2;
    const y = toY(levels[idx]);
    samples.push({ x, y });
  }
  // current location
  let nowIdx = 0;
  let best = Number.POSITIVE_INFINITY;
  const nowMs = now.getTime();
  for (let k = 0; k < times.length; k++) {
    const d = Math.abs(times[k] - nowMs);
    if (d < best) { best = d; nowIdx = k; }
  }
  const progress = (times[nowIdx] - tMin) / Math.max(1, tMax - tMin);
  const currentX = Math.round(progress * (width - 4)) + 2;
  const currentY = toY(levels[nowIdx]);
  const label = `${levels[nowIdx].toFixed(2)} m`;
  return { samples, currentX, currentY, label };
}

export default TideChart;

function TideExtremeMarkers({
  tides, // unused but kept for API compatibility
  series,
  width,
  height,
}: { tides: TideData[]; series?: TideSeriesPoint[]; width: number; height: number }) {
  const theme = useTheme();
  if (!series || series.length < 3) { return null; }

  const tMin = new Date(series[0].time).getTime();
  const tMax = new Date(series[series.length - 1].time).getTime();
  const hMin = Math.min(...series.map(p => p.level));
  const hMax = Math.max(...series.map(p => p.level));
  const toX = (ms: number) => {
    const p = (ms - tMin) / Math.max(1, (tMax - tMin));
    const pClamped = Math.max(0, Math.min(1, p));
    return Math.round(pClamped * (width - 4)) + 2;
  };
  const toY = (lvl: number) => {
    const norm = hMax === hMin ? 0.5 : (lvl - hMin) / (hMax - hMin);
    return Math.round((1 - norm) * (height - 8)) + 4;
  };
  const nearestIdx = (ms: number) => {
    let best = 0; let bestDiff = Number.POSITIVE_INFINITY;
    for (let i = 0; i < series.length; i++) {
      const d = Math.abs(new Date(series[i].time).getTime() - ms);
      if (d < bestDiff) { best = i; bestDiff = d; }
    }
    return best;
  };
  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  // Compute extremes directly from smoothed series to ensure perfect visual alignment
  let idxHi = 0, idxLo = 0;
  for (let i = 1; i < series.length; i++) {
    if (series[i].level > series[idxHi].level) { idxHi = i; }
    if (series[i].level < series[idxLo].level) { idxLo = i; }
  }
  const xHi = toX(new Date(series[idxHi].time).getTime());
  const xLo = toX(new Date(series[idxLo].time).getTime());
  const timeHi = fmtTime(series[idxHi].time);
  const timeLo = fmtTime(series[idxLo].time);

  const nodes: React.ReactNode[] = [];
  nodes.push(
    <CenteredCaption key="hi-time" x={xHi} y={height - 4} text={timeHi} />
  );
  nodes.push(
    <CenteredCaption key="lo-time" x={xLo} y={height - 4} text={timeLo} />
  );
  return <>{nodes}</>;
}

function CenteredCaption({ x, y, text, above = false }: { x: number; y: number; text: string; above?: boolean }) {
  const theme = useTheme();
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const top = above ? y - size.h - 6 : y + 6;
  const left = Math.round(x - size.w / 2);
  return (
    <View
      style={{ position: 'absolute', left, top }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width !== size.w || height !== size.h) {
          setSize({ w: width, h: height });
        }
      }}
    >
      <ThemedText type="caption" style={{ color: above ? theme.colors.text : theme.colors.textSecondary }}>
        {text}
      </ThemedText>
    </View>
  );
}
