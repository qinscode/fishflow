import React, { useMemo } from 'react';
import { View } from 'react-native';

import { TideData } from '@/lib/weatherService';
import { ThemedText } from '@/components/ThemedText';
import { useTranslation } from '@/lib/i18n';
import { useTheme } from '@/hooks/useThemeColor';

export interface TideChartProps {
  tides: TideData[];
  now?: Date;
  width?: number;
  height?: number;
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
}: TideChartProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    samples,
    currentX,
    currentY,
    label,
  } = useMemo(() => computeTideSeries(tides, now, width, height), [tides, now, width, height]);

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
    </View>
  );
}

function computeTideSeries(
  tides: TideData[],
  now: Date,
  width: number,
  height: number
) {
  // Find nearest previous and next tide extremes
  const sorted = [...tides].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  const nowMs = now.getTime();
  let prev = sorted[0];
  let next = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length; i++) {
    const t = new Date(sorted[i].time).getTime();
    if (t <= nowMs) prev = sorted[i];
    if (t >= nowMs) { next = sorted[i]; break; }
  }
  if (!prev || !next || prev.time === next.time) {
    return { samples: [] as { x: number; y: number }[], currentX: 0, currentY: height / 2, label: '' };
  }

  const t1 = new Date(prev.time).getTime();
  const t2 = new Date(next.time).getTime();
  const dur = Math.max(1, t2 - t1);
  const progress = Math.min(1, Math.max(0, (nowMs - t1) / dur));

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
    const p = i / (N - 1);
    const x = Math.round(p * (width - 4)) + 2;
    const y = toY(cosAt(p));
    samples.push({ x, y });
  }

  const currentHeight = cosAt(progress);
  const currentX = Math.round(progress * (width - 4)) + 2;
  const currentY = toY(currentHeight);
  const label = `${currentHeight.toFixed(2)} m`;

  return { samples, currentX, currentY, label };
}

export default TideChart;
