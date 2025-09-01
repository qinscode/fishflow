import React from 'react';
import { StyleSheet, Pressable, ViewStyle, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useThemeColor';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'filled' | 'outlined' | 'text';
  color?: string;
  icon?: keyof typeof import('@/components/ui/IconSymbol')['MAPPING'];
  count?: number;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export function FilterChip({
  label,
  selected = false,
  onPress,
  variant = 'outlined',
  color,
  icon,
  count,
  disabled = false,
  size = 'medium',
  style,
}: FilterChipProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  
  const primaryColor = color || theme.colors.primary;
  
  const chipHeight = size === 'large' ? 44 : size === 'small' ? 28 : 36;
  const fontSize = size === 'large' ? 16 : size === 'small' ? 12 : 14;
  const iconSize = size === 'large' ? 18 : size === 'small' ? 14 : 16;
  const paddingHorizontal = size === 'large' ? 20 : size === 'small' ? 12 : 16;

  const getChipStyle = () => {
    const baseStyle = {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      borderWidth: 1,
    };

    if (disabled) {
      return {
        ...baseStyle,
        backgroundColor: theme.colors.borderLight,
        borderColor: theme.colors.borderLight,
        opacity: 0.5,
      };
    }

    switch (variant) {
      case 'filled':
        return {
          backgroundColor: selected ? primaryColor : theme.colors.borderLight,
          borderColor: selected ? primaryColor : theme.colors.border,
          borderWidth: selected ? 0 : 1,
        };
        
      case 'outlined':
        return {
          backgroundColor: selected ? `${primaryColor}15` : 'transparent',
          borderColor: selected ? primaryColor : theme.colors.border,
          borderWidth: 1,
        };
        
      case 'text':
        return {
          backgroundColor: selected ? `${primaryColor}10` : 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
        };
        
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return theme.colors.textDisabled;
    }

    if (variant === 'filled' && selected) {
      return '#FFFFFF';
    }

    return selected ? primaryColor : theme.colors.text;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withTiming(0.95, { duration: 100 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1);
    }
  };

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.();
    }
  };

  const chipStyle = getChipStyle();
  const textColor = getTextColor();

  return (
    <AnimatedPressable
      style={[
        styles.chip,
        {
          height: chipHeight,
          paddingHorizontal,
          borderRadius: chipHeight / 2,
          ...chipStyle,
        },
        animatedStyle,
        style,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      <View style={styles.content}>
        {icon && (
          <IconSymbol
            name={icon}
            size={iconSize}
            color={textColor}
            style={styles.icon}
          />
        )}
        
        <ThemedText
          style={[
            styles.label,
            {
              fontSize,
              color: textColor,
              fontWeight: selected ? '600' : '500',
            },
          ]}
        >
          {label}
        </ThemedText>
        
        {count !== undefined && count > 0 && (
          <View
            style={[
              styles.countBadge,
              {
                backgroundColor: selected ? 
                  (variant === 'filled' ? 'rgba(255,255,255,0.2)' : primaryColor) : 
                  theme.colors.borderLight,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.countText,
                {
                  color: selected && variant === 'filled' ? '#FFFFFF' : 
                         selected ? '#FFFFFF' : 
                         theme.colors.textSecondary,
                  fontSize: fontSize - 2,
                },
              ]}
            >
              {count > 99 ? '99+' : count.toString()}
            </ThemedText>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

// 筛选组合组件
export interface FilterChipGroupProps {
  chips: Array<{
    id: string;
    label: string;
    icon?: keyof typeof import('@/components/ui/IconSymbol')['MAPPING'];
    count?: number;
  }>;
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  multiSelect?: boolean;
  variant?: 'filled' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export function FilterChipGroup({
  chips,
  selectedIds,
  onSelectionChange,
  multiSelect = true,
  variant = 'outlined',
  size = 'medium',
  style,
}: FilterChipGroupProps) {
  const handleChipPress = (chipId: string) => {
    if (multiSelect) {
      const newSelection = selectedIds.includes(chipId)
        ? selectedIds.filter(id => id !== chipId)
        : [...selectedIds, chipId];
      onSelectionChange(newSelection);
    } else {
      const newSelection = selectedIds.includes(chipId) ? [] : [chipId];
      onSelectionChange(newSelection);
    }
  };

  return (
    <View style={[styles.group, style]}>
      {chips.map((chip) => (
        <FilterChip
          key={chip.id}
          label={chip.label}
          icon={chip.icon}
          count={chip.count}
          selected={selectedIds.includes(chip.id)}
          onPress={() => handleChipPress(chip.id)}
          variant={variant}
          size={size}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    marginRight: -2,
  },
  label: {
    textAlign: 'center',
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});