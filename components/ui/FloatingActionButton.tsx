import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useThemeColor';

interface FloatingActionButtonProps {
  icon?: string;
  label?: string;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const SIZES = {
  small: { size: 48, iconSize: 20, fontSize: 14 },
  medium: { size: 56, iconSize: 24, fontSize: 16 },
  large: { size: 64, iconSize: 28, fontSize: 18 },
};

export function FloatingActionButton({ 
  icon = 'plus.circle.fill',
  label,
  onPress,
  size = 'medium',
  style,
}: FloatingActionButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const { size: buttonSize, iconSize, fontSize } = SIZES[size];

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSequence(
      withTiming(1.05, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: theme.colors.primary,
          },
          theme.shadows.lg,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <IconSymbol
          name={icon as any}
          size={iconSize}
          color={theme.colors.surface}
        />
        
        {label && (
          <ThemedText 
            type="caption" 
            style={[
              styles.label, 
              { 
                color: theme.colors.surface,
                fontSize,
              }
            ]}
          >
            {label}
          </ThemedText>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  label: {
    marginTop: 2,
    fontWeight: '600',
  },
});