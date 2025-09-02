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
      height: cardSize * 1, // 减少卡片高度比例
      backgroundColor: 'white',
      borderRadius: 16,
      borderWidth: 2, // 减少边框宽度从3到2
      borderColor: rarityColor, // 只根据稀有度显示边框颜色
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
      {/* 顶部鱼类名称区域 - 移除所有状态指示器 */}
      <View style={styles.headerSection}>
        <ThemedText 
          style={[
            styles.fishTitle,
            { color: '#333' }
          ]} 
          numberOfLines={2}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.8}
        >
          {fish.name}
        </ThemedText>
      </View>

      {/* 中间图片区域 - 显示真实鱼类照片，移除锁定徽章 */}
      <View style={styles.imageSection}>
        <View style={styles.imageBackground}>
          <Image
            source={FISH_IMAGES[fish.id] || require('@/assets/images/fish/1.png')}
            style={styles.fishImageNew}
            contentFit="contain"
            transition={200}
          />
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
    padding: 10, // 进一步减少内边距
    overflow: 'hidden',
  },
  
  // 顶部标题区域
  headerSection: {
    width: '100%',
    paddingHorizontal: 4,
    // marginBottom: 2, // 进一步减少底部边距
    alignItems: 'center',
    minHeight: 36, // 为更大字体增加高度
  },
  
  fishTitle: {
    fontSize: 16, // 增大字体
    fontWeight: '700', // 加粗
    textAlign: 'center',
    lineHeight: 18, // 相应调整行高
  },
  
  // 中间图片区域
  imageSection: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // marginVertical: 2, // 进一步减少垂直边距
  },
  
  imageBackground: {
    width: '95%', // 进一步增加图片区域宽度
    height: '100%',
    borderRadius: 6, // 进一步减少圆角
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  
  fishImageNew: {
    width: '98%', // 进一步增加图片宽度
    height: '98%', // 进一步增加图片高度
    resizeMode: 'contain',
  },
  
  // 底部星级区域
  starSection: {
    width: '100%',
    alignItems: 'center',
    // paddingVertical: 2, // 进一步减少垂直内边距
  },
  
  starContainer: {
    flexDirection: 'row',
    // gap: 2, // 进一步减少星星间距
  },
});

FishCard.displayName = 'FishCard';