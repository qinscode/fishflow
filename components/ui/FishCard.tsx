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

  // 根据稀有度获取星星数量
  const getStarCount = (rarity: string): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'unique': return 2;
      case 'rare': return 3;
      case 'epic': return 4;
      case 'legendary': return 5;
      default: return 1;
    }
  };

  const starCount = getStarCount(fish.rarity);

  const cardStyles = [
    styles.cardContainer,
    {
      width: cardSize,
      height: cardSize * 1.3,
      backgroundColor: 'white',
      borderRadius: 16,
      borderWidth: 3,
      borderColor: rarityColor,
      borderStyle: isLocked ? 'dashed' : 'solid', // 未解锁用虚线边框
    },
    theme.shadows.lg,
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
      {/* 顶部鱼类名称区域 */}
      <View style={styles.headerSection}>
        <ThemedText style={[
          styles.fishTitle,
          { color: '#333' }
        ]} numberOfLines={1}>
          {fish.name}
        </ThemedText>
        
        {/* 状态指示器 */}
        <View style={styles.statusIndicators}>
          {isLocked && (
            <View style={styles.lockIndicator}>
              <IconSymbol name="lock.fill" size={12} color="white" />
            </View>
          )}
          {!isLocked && (
            <View style={styles.newIndicator}>
              <IconSymbol name="checkmark" size={12} color="white" />
            </View>
          )}
        </View>
      </View>

      {/* 中间图片区域 - 始终显示真实鱼类照片 */}
      <View style={styles.imageSection}>
        <View style={[
          styles.imageBackground,
          { backgroundColor: `${rarityColor}08` }
        ]}>
          <Image
            source={FISH_IMAGES[fish.id] || require('@/assets/images/fish/1.png')}
            style={[
              styles.fishImageNew,
              {
                opacity: isLocked ? 0.7 : 1, // 未解锁稍微降低透明度但保持彩色
              }
            ]}
            contentFit="contain"
            transition={200}
          />
          
          {/* 未解锁时在图片上添加锁定徽章 */}
          {isLocked && (
            <View style={styles.lockBadgeOverlay}>
              <IconSymbol name="lock.fill" size={20} color="rgba(255,255,255,0.9)" />
            </View>
          )}
        </View>
      </View>

      {/* 底部星级评定区域 */}
      <View style={styles.starSection}>
        <View style={styles.starContainer}>
          {Array.from({ length: 5 }).map((_, index) => (
            <IconSymbol
              key={index}
              name="star.fill"
              size={16}
              color={index < starCount ? rarityColor : '#e0e0e0'}
            />
          ))}
        </View>
      </View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    overflow: 'hidden',
  },
  
  // 顶部标题区域
  headerSection: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  
  fishTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  
  statusIndicators: {
    flexDirection: 'row',
    gap: 6,
  },
  
  lockIndicator: {
    backgroundColor: '#666',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  newIndicator: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 中间图片区域
  imageSection: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  
  imageBackground: {
    width: '85%',
    height: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  fishImageNew: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  
  // 锁定徽章覆盖层
  lockBadgeOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // 底部星级区域
  starSection: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  starContainer: {
    flexDirection: 'row',
    gap: 4,
  },
});

FishCard.displayName = 'FishCard';