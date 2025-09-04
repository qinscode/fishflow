import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/hooks/useThemeColor';
import { useTranslation } from '@/lib/i18n';
import { Achievement, AchievementTier } from '@/lib/types';

export interface AchievementNotificationProps {
  achievement: Achievement;
  tier: AchievementTier;
  isVisible: boolean;
  isUpgrade?: boolean;
  previousTier?: AchievementTier;
  onDismiss: () => void;
  onNavigateToAchievements?: () => void;
}

export function AchievementNotification({
  achievement,
  tier,
  isVisible,
  isUpgrade = false,
  previousTier,
  onDismiss,
  onNavigateToAchievements,
}: AchievementNotificationProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  
  const translateY = useSharedValue(-300);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const shimmer = useSharedValue(0);
  const confetti = useSharedValue(0);
  
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (isVisible) {
      // 显示动画
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 10, stiffness: 150 });
      
      // 光芒效果
      shimmer.value = withSequence(
        withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 400 })
      );
      
      // 庆祝效果
      confetti.value = withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 500 })
      );

      // 触觉反馈
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // 自动消失
      timeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, 4000) as any;
    } else {
      // 隐藏动画
      translateY.value = withTiming(-300, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 });
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible]);

  const handleDismiss = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    translateY.value = withTiming(-300, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onDismiss)();
    });
  };

  const handlePress = () => {
    handleDismiss();
    onNavigateToAchievements?.();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value * 0.6,
    transform: [{ scale: 1 + shimmer.value * 0.1 }],
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confetti.value,
    transform: [
      { scale: 1 + confetti.value * 0.2 },
      { rotate: `${confetti.value * 360}deg` }
    ],
  }));

  const getTierColor = (tier: AchievementTier): string => {
    switch (tier) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      default: return theme.colors.primary;
    }
  };

  const getTitle = (): string => {
    if (isUpgrade && previousTier) {
      return `🎉 ${t('achievements.unlocked')}!`;
    }
    return `🏆 ${t('achievements.unlocked')}!`;
  };

  const getMessage = (): string => {
    const tierText = t(`achievements.tier.${tier}` as any);
    if (isUpgrade && previousTier) {
      const prevTierText = t(`achievements.tier.${previousTier}` as any);
      return `${prevTierText} → ${tierText}`;
    }
    return tierText;
  };

  if (!isVisible) {return null;}

  return (
    <View style={styles.container} pointerEvents="box-none">
      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        <Animated.View style={[styles.notificationWrapper, containerStyle]}>
          <Pressable onPress={handlePress} style={styles.pressable}>
            <ThemedView 
              type="card" 
              style={[
                styles.notification,
                { borderColor: getTierColor(tier) },
                theme.shadows.lg
              ]}
            >
              {/* 背景光芒效果 */}
              <Animated.View 
                style={[
                  styles.shimmerEffect,
                  { backgroundColor: getTierColor(tier) + '20' },
                  shimmerStyle
                ]} 
              />
              
              {/* 庆祝粒子效果 */}
              <Animated.View style={[styles.confettiContainer, confettiStyle]}>
                <MaterialCommunityIcons
                  name="party-popper"
                  size={24}
                  color={getTierColor(tier)}
                  style={styles.confettiIcon}
                />
              </Animated.View>

              <View style={styles.content}>
                {/* 成就图标 */}
                <View style={styles.badgeContainer}>
                  <Badge
                    achievement={achievement}
                    tier={tier}
                    size="large"
                    isLocked={false}
                    showProgress={false}
                    showTitle={false}
                  />
                </View>

                {/* 文本内容 */}
                <View style={styles.textContainer}>
                  <ThemedText type="title" style={[styles.title, { color: getTierColor(tier) }]}>
                    {getTitle()}
                  </ThemedText>
                  
                  <ThemedText type="subtitle" style={styles.achievementName} numberOfLines={1}>
                    {achievement.name}
                  </ThemedText>
                  
                  <ThemedText 
                    type="body" 
                    style={[styles.tierText, { color: theme.colors.textSecondary }]}
                  >
                    {getMessage()}
                  </ThemedText>

                  {achievement.tiers[tier].reward && (
                    <ThemedText 
                      type="bodySmall" 
                      style={[styles.reward, { color: theme.colors.primary }]}
                    >
                      🎁 {achievement.tiers[tier].reward}
                    </ThemedText>
                  )}
                </View>

                {/* 关闭按钮 */}
                <Pressable onPress={handleDismiss} style={styles.closeButton}>
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
              </View>

              {/* 底部提示 */}
              <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
                <ThemedText 
                  type="bodySmall" 
                  style={{ color: theme.colors.textSecondary, textAlign: 'center' }}
                >
                  🎯 {t('common.press')} {t('achievements.title')}
                </ThemedText>
              </View>
            </ThemedView>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  safeArea: {
    flex: 1,
    pointerEvents: 'box-none',
  },
  notificationWrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  pressable: {
    width: '100%',
  },
  notification: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
  },
  confettiContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  confettiIcon: {
    opacity: 0.8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    position: 'relative',
    zIndex: 5,
  },
  badgeContainer: {
    marginRight: 16,
    marginTop: 4,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  tierText: {
    fontSize: 14,
    marginBottom: 4,
  },
  reward: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  footer: {
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});