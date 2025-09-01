import React, { memo } from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useThemeColor';
import { useResponsive } from '@/hooks/useResponsive';
import { Fish, FishCardState } from '@/lib/types';
import { getRarityColor } from '@/lib/utils';
import { RARITY_NAMES } from '@/lib/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface FishCardProps {
  fish: Fish;
  state: FishCardState;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  onLongPress?: () => void;
  showRarity?: boolean;
  showId?: boolean;
  style?: ViewStyle;
}

export const FishCard = memo<FishCardProps>(({
  fish,
  state,
  size = 'medium',
  onPress,
  onLongPress,
  showRarity = true,
  showId = false,
  style,
}) => {
  const theme = useTheme();
  const { isTablet } = useResponsive();
  const scale = useSharedValue(1);

  const cardSize = size === 'large' ? 200 : size === 'small' ? 120 : isTablet ? 180 : 160;
  const imageSize = cardSize * 0.7;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 150 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onLongPress?.();
  };

  const rarityColor = getRarityColor(fish.rarity);
  const isLocked = state === 'locked';
  const isNew = state === 'new';

  const cardStyles = [
    styles.container,
    {
      width: cardSize,
      height: cardSize * 1.2,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: isNew ? theme.colors.success : 
                   showRarity && !isLocked ? rarityColor : 
                   theme.colors.border,
    },
    theme.shadows.sm,
    style,
  ];

  return (
    <AnimatedPressable
      style={[cardStyles, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={!onPress}
    >
      {/* 图片容器 */}
      <View style={[styles.imageContainer, { height: cardSize * 0.75 }]}>
        {isLocked ? (
          <View style={[
            styles.lockedImageContainer, 
            { 
              width: imageSize, 
              height: imageSize,
              backgroundColor: theme.colors.borderLight,
              borderRadius: theme.borderRadius.md,
            }
          ]}>
            <IconSymbol 
              name="fish" 
              size={imageSize * 0.4} 
              color={theme.colors.textDisabled} 
            />
            <View style={styles.lockIconContainer}>
              <IconSymbol 
                name="lock.fill" 
                size={16} 
                color={theme.colors.textDisabled} 
              />
            </View>
          </View>
        ) : (
          <Image
            source={{ uri: fish.images.card }}
            style={[
              styles.fishImage,
              {
                width: imageSize,
                height: imageSize,
                borderRadius: theme.borderRadius.md,
              }
            ]}
            contentFit="cover"
            transition={300}
          />
        )}

        {/* NEW 标识 */}
        {isNew && (
          <View style={[
            styles.newBadge,
            { 
              backgroundColor: theme.colors.success,
              borderRadius: theme.borderRadius.sm,
            }
          ]}>
            <ThemedText type="caption" style={[styles.newBadgeText, { color: 'white' }]}>
              NEW
            </ThemedText>
          </View>
        )}
      </View>

      {/* 信息区域 */}
      <View style={styles.infoContainer}>
        {/* 鱼类名称 */}
        <ThemedText 
          type="subtitle" 
          style={[
            styles.fishName,
            { 
              color: isLocked ? theme.colors.textDisabled : theme.colors.text,
              fontSize: size === 'small' ? 14 : 16,
            }
          ]}
          numberOfLines={1}
        >
          {isLocked ? '???' : fish.name}
        </ThemedText>

        {/* ID 和稀有度 */}
        <View style={styles.metaContainer}>
          {showId && (
            <ThemedText 
              type="caption" 
              style={[
                styles.fishId,
                { color: theme.colors.textSecondary }
              ]}
            >
              #{fish.id.split('-')[1]?.toUpperCase() || fish.id.slice(0, 3).toUpperCase()}
            </ThemedText>
          )}
          
          {showRarity && (
            <View style={[
              styles.rarityBadge,
              {
                backgroundColor: isLocked ? 'transparent' : `${rarityColor}20`,
                borderColor: isLocked ? theme.colors.border : rarityColor,
                borderWidth: 1,
                borderRadius: theme.borderRadius.sm,
              }
            ]}>
              <ThemedText 
                type="caption" 
                style={[
                  styles.rarityText,
                  { 
                    color: isLocked ? theme.colors.textDisabled : rarityColor,
                    fontSize: size === 'small' ? 10 : 11,
                  }
                ]}
              >
                {RARITY_NAMES[fish.rarity]}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  fishImage: {
    resizeMode: 'cover',
  },
  lockedImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lockIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 4,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    fontWeight: '600',
    fontSize: 10,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  fishName: {
    textAlign: 'center',
    fontWeight: '600',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fishId: {
    fontSize: 11,
    fontWeight: '500',
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rarityText: {
    fontWeight: '500',
  },
});

FishCard.displayName = 'FishCard';