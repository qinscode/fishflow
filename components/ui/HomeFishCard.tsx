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
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/hooks/useThemeColor';
import { Fish } from '@/lib/types';
import { getRarityColor } from '@/lib/utils';
import { FISH_IMAGES } from '@/lib/fishImagesMap';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface HomeFishCardProps {
  fish: Fish;
  onPress?: () => void;
  style?: ViewStyle;
}

export const HomeFishCard = memo<HomeFishCardProps>(({
  fish,
  onPress,
  style,
}) => {
  const theme = useTheme();
  const { isTablet } = useResponsive();
  const scale = useSharedValue(1);

  // 首页卡片固定尺寸，更宽更扁
  const cardWidth = isTablet ? 180 : 160;
  const cardHeight = isTablet ? 140 : 120;

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

  const rarityColor = getRarityColor(fish.rarity);

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
    styles.homeCard,
    {
      width: cardWidth,
      height: cardHeight,
      backgroundColor: 'white',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: rarityColor,
    },
    theme.shadows.md,
    style,
  ];

  return (
    <AnimatedPressable
      style={[cardStyles, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={!onPress}
    >
      {/* 鱼类名称 - 顶部居中 */}
      <View style={styles.nameSection}>
        <ThemedText 
          style={[
            styles.fishName,
            { color: '#333' }
          ]} 
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.8}
        >
          {fish.name}
        </ThemedText>
      </View>

      {/* 图片区域 - 占主要空间 */}
      <View style={styles.imageSection}>
        <Image
          source={FISH_IMAGES[fish.id] || require('@/assets/images/fish/1.png')}
          style={styles.fishImage}
          contentFit="contain"
          transition={200}
        />
      </View>

      {/* 星级区域 - 底部 */}
      <View style={styles.starSection}>
        <View style={styles.starContainer}>
          {Array.from({ length: 5 }).map((_, index) => (
            <IconSymbol
              key={index}
              name="star.fill"
              size={12}
              color={index < starCount ? rarityColor : '#e0e0e0'}
            />
          ))}
        </View>
      </View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  homeCard: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    overflow: 'hidden',
  },
  
  // 名称区域
  nameSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  fishName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // 图片区域
  imageSection: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  
  fishImage: {
    width: '85%',
    height: '100%',
    resizeMode: 'contain',
  },
  
  // 星级区域
  starSection: {
    width: '100%',
    alignItems: 'center',
  },
  
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
});

HomeFishCard.displayName = 'HomeFishCard';