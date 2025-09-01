import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

type SlideDirection = 'up' | 'down' | 'left' | 'right';

interface SlideInViewProps {
  children: React.ReactNode;
  direction?: SlideDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  style?: ViewStyle;
  onAnimationComplete?: () => void;
}

export function SlideInView({ 
  children, 
  direction = 'up',
  delay = 0,
  duration = 500,
  distance = 50,
  style,
  onAnimationComplete,
}: SlideInViewProps) {
  const translateX = useSharedValue(direction === 'left' ? -distance : direction === 'right' ? distance : 0);
  const translateY = useSharedValue(direction === 'up' ? distance : direction === 'down' ? -distance : 0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      }, (finished) => {
        if (finished && onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, duration, distance, direction, translateX, translateY, opacity, onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}