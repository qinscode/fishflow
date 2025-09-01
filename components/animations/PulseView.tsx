import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

interface PulseViewProps {
  children: React.ReactNode;
  isActive?: boolean;
  scale?: number;
  duration?: number;
  style?: ViewStyle;
}

export function PulseView({ 
  children, 
  isActive = true, 
  scale = 1.05,
  duration = 1000,
  style,
}: PulseViewProps) {
  const scaleValue = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      scaleValue.value = withRepeat(
        withTiming(scale, {
          duration,
          easing: Easing.inOut(Easing.quad),
        }),
        -1, // Infinite repeat
        true // Reverse
      );
    } else {
      cancelAnimation(scaleValue);
      scaleValue.value = withTiming(1, { duration: 200 });
    }
  }, [isActive, scale, duration, scaleValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}