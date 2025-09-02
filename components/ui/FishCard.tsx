import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/hooks/useThemeColor';
import { RARITY_NAMES } from '@/lib/constants';
import { Fish, FishCardState } from '@/lib/types';
import { getRarityColor } from '@/lib/utils';
import { FISH_IMAGES } from '@/lib/fishImagesMap';

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
      height: cardSize * 1.15, // 稍微调整高度比例
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl, // 使用更大的圆角
      borderWidth: 1,
      borderColor: isNew ? theme.colors.success : theme.colors.borderLight,
    },
    theme.shadows.md, // 使用中等阴影
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
      <View style={[styles.imageContainer, { height: cardSize * 0.65 }]}>
        <View style={[
          styles.imageWrapper,
          {
            width: cardSize * 0.9,
            height: cardSize * 0.6,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: isLocked 
              ? theme.colors.surface + '80'
              : rarityColor + '12',
            overflow: 'hidden',
          }
        ]}>
          {/* 鱼类图片 */}
          <Image
            source={FISH_IMAGES[fish.id] || require('@/assets/images/fish/1.png')}
            style={{
              width: '100%',
              height: '100%',
            }}
            contentFit="cover"
            transition={200}
          />

          {/* 渐变遮罩层 */}
          <View style={styles.gradientOverlay} />

          {/* 状态指示器 */}
          <View style={styles.statusContainer}>
            {isLocked && (
              <View style={styles.modernLockBadge}>
                <IconSymbol 
                  name="lock.fill" 
                  size={8} 
                  color="white" 
                />
              </View>
            )}
            
            {!isLocked && (
              <View style={[styles.rarityIndicator, { backgroundColor: rarityColor }]} />
            )}
          </View>
        </View>

        {/* NEW 标识 */}
        {isNew && (
          <View style={styles.modernNewBadge}>
            <ThemedText type="caption" style={styles.newBadgeText}>
              NEW
            </ThemedText>
          </View>
        )}
      </View>

      {/* 信息区域 */}
      <View style={styles.modernInfoContainer}>
        {/* 鱼类名称 */}
        <ThemedText 
          type="subtitle" 
          style={[
            styles.modernFishName,
            { 
              color: theme.colors.text,
              fontSize: size === 'small' ? 13 : 15,
            }
          ]}
          numberOfLines={1}
        >
          {fish.name}
        </ThemedText>

        {/* ID 和稀有度 - 水平布局 */}
        <View style={styles.modernMetaContainer}>
          {showId && (
            <View style={[
              styles.modernIdBadge,
              { backgroundColor: theme.colors.surface }
            ]}>
              <ThemedText 
                type="caption" 
                style={[
                  styles.modernIdText,
                  { color: theme.colors.textSecondary }
                ]}
              >
                #{fish.id}
              </ThemedText>
            </View>
          )}
          
          {showRarity && !isLocked && (
            <View style={[
              styles.modernRarityBadge,
              { backgroundColor: rarityColor + '20' }
            ]}>
              <View style={[
                styles.rarityDot,
                { backgroundColor: rarityColor }
              ]} />
              <ThemedText 
                type="caption" 
                style={[
                  styles.modernRarityText,
                  { 
                    color: rarityColor,
                    fontSize: size === 'small' ? 9 : 10,
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
    padding: 16,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  imageWrapper: {
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  statusContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  modernLockBadge: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modernNewBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  newBadgeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  modernInfoContainer: {
    width: '100%',
    paddingHorizontal: 4,
    gap: 6,
  },
  modernFishName: {
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
  },
  modernMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modernIdBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modernIdText: {
    fontSize: 10,
    fontWeight: '500',
  },
  modernRarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  rarityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  modernRarityText: {
    fontWeight: '600',
  },
  
  // Legacy styles - can be removed later
  fishImage: {
    resizeMode: 'cover',
  },
  lockedImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unlockedImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
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
  fishImageWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fishIconOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
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