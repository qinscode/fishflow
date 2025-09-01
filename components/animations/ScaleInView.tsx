import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface ScaleInViewProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
  onAnimationComplete?: () => void;
}

export function ScaleInView({ 
  children, 
  delay = 0,
  style,
  onAnimationComplete,
}: ScaleInViewProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSequence(
        withSpring(1.1, { damping: 10 }),
        withSpring(1, { damping: 15 }, (finished) => {
          if (finished && onAnimationComplete) {
            runOnJS(onAnimationComplete)();
          }
        })
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, scale, onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}