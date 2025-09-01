import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useThemeColor';

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
  }, [progress, animated, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  const borderRadius = variant === 'rounded' ? height / 2 : theme.borderRadius.sm;
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

// 环形进度条组件
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
  size = 60,
  strokeWidth = 6,
  color,
  backgroundColor,
  showLabel = false,
  label,
  animated = true,
  children,
}: ProgressRingProps) {
  const theme = useTheme();
  const animatedProgress = useSharedValue(0);

  const progressColor = color || theme.colors.primary;
  const bgColor = backgroundColor || theme.colors.borderLight;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const targetProgress = Math.max(0, Math.min(1, progress));
    if (animated) {
      animatedProgress.value = withSpring(targetProgress);
    } else {
      animatedProgress.value = targetProgress;
    }
  }, [progress, animated]);

  const animatedStyle = useAnimatedStyle(() => {
    const strokeDashoffset = circumference * (1 - animatedProgress.value);
    return {
      strokeDashoffset: strokeDashoffset,
    } as any;
  });

  const displayLabel = label || `${Math.round(progress * 100)}%`;

  return (
    <View style={[styles.ringContainer, { width: size, height: size }]}>
      <Animated.View style={{ width: size, height: size }}>
        {/* Background circle */}
        <View
          style={[
            styles.ringBackground,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: bgColor,
            },
          ]}
        />
        
        {/* Progress arc */}
        <Animated.View
          style={[
            styles.ringProgress,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: progressColor,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              transform: [{ rotate: '-90deg' }],
            },
            animatedStyle,
          ]}
        />
      </Animated.View>

      {/* Center content */}
      <View style={styles.ringCenter}>
        {children || (
          showLabel && (
            <ThemedText type="caption" style={styles.ringLabel}>
              {displayLabel}
            </ThemedText>
          )
        )}
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
  ringBackground: {
    position: 'absolute',
  },
  ringProgress: {
    position: 'absolute',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});