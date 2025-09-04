import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  useAnimatedProps,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useThemeColor';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  backgroundColor?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  duration?: number;
  style?: ViewStyle;
  variant?: 'linear' | 'rounded';
}

export function ProgressBar({
  progress,
  color,
  backgroundColor,
  height = 8,
  showLabel = false,
  label,
  animated = true,
  duration = 500,
  style,
  variant = 'rounded',
}: ProgressBarProps) {
  const theme = useTheme();
  const animatedProgress = useSharedValue(0);

  const progressColor = color || theme.colors.primary;
  const bgColor = backgroundColor || theme.colors.borderLight;

  useEffect(() => {
    const targetProgress = Math.max(0, Math.min(1, progress));
    if (animated) {
      animatedProgress.value = withTiming(targetProgress, { duration });
    } else {
      animatedProgress.value = targetProgress;
    }
  }, [progress, animated, duration, animatedProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  const borderRadius =
    variant === 'rounded' ? height / 2 : theme.borderRadius.sm;
  const displayLabel = label || `${Math.round(progress * 100)}%`;

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <ThemedText type="caption" style={styles.labelText}>
            {displayLabel}
          </ThemedText>
        </View>
      )}

      <View
        style={[
          styles.track,
          {
            backgroundColor: bgColor,
            height,
            borderRadius,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: progressColor,
              height: height - 2,
              borderRadius: Math.max(0, borderRadius - 1),
              top: 1,
              left: 1,
            },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
}

// 改进的环形进度条组件 - 使用SVG实现精确圆弧
export interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color,
  backgroundColor,
  showLabel = true,
  label,
  animated = true,
  children,
}: ProgressRingProps) {
  const theme = useTheme();
  const animatedProgress = useSharedValue(0);

  const progressColor = color || theme.colors.primary;
  const bgColor = backgroundColor || `${theme.colors.border}40`;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const targetProgress = Math.max(0, Math.min(1, progress));
    if (animated) {
      animatedProgress.value = withSpring(targetProgress, {
        damping: 15,
        stiffness: 100,
        overshootClamping: true,
      });
    } else {
      animatedProgress.value = targetProgress;
    }
  }, [progress, animated, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const displayLabel = label || `${Math.round(progress * 100)}%`;

  return (
    <View style={[styles.ringContainer, { width: size, height: size }]}>
      {/* SVG圆形进度条 */}
      <Svg width={size} height={size} style={styles.svg}>
        {/* 背景圆 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
        />
        {/* 进度圆弧 */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* 中心内容 */}
      <View style={styles.ringCenter}>
        {children ||
          (showLabel && (
            <ThemedText type="h3" style={[styles.ringLabel, { color: progressColor }]}>
              {displayLabel}
            </ThemedText>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    marginBottom: 4,
    alignItems: 'flex-end',
  },
  labelText: {
    fontSize: 11,
    fontWeight: '500',
  },
  track: {
    position: 'relative',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    borderRadius: 0,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  ringLabel: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
