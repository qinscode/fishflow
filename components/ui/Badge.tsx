import * as Haptics from 'expo-haptics';
import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol, MAPPING } from '@/components/ui/IconSymbol';
import { ProgressRing } from '@/components/ui/ProgressBar';
import { useTheme } from '@/hooks/useThemeColor';
import { getAchievementName } from '@/lib/achievementHelpers';
import { ACHIEVEMENT_TIER_COLORS } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';
import { Achievement, AchievementTier } from '@/lib/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface BadgeProps {
  achievement: Achievement;
  tier: AchievementTier | null;
  size?: 'small' | 'medium' | 'large';
  isLocked?: boolean;
  progress?: number; // 0-1, 仅在未解锁时显示
  onPress?: () => void;
  showProgress?: boolean;
  showTitle?: boolean;
  style?: ViewStyle;
}

export function Badge({
  achievement,
  tier,
  size = 'medium',
  isLocked = false,
  progress = 0,
  onPress,
  showProgress = true,
  showTitle = true,
  style,
}: BadgeProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);

  const badgeSize = size === 'large' ? 80 : size === 'small' ? 48 : 64;
  const iconSize = badgeSize * 0.4;

  React.useEffect(() => {
    if (!isLocked && tier) {
      // 解锁时的光芒动画
      shimmer.value = withTiming(1, { duration: 1000 });
    }
  }, [isLocked, tier, shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0, 0.8, 0]);
    return {
      opacity,
    };
  });

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

  const getBadgeStyle = () => {
    if (isLocked) {
      return {
        backgroundColor: theme.colors.borderLight,
        borderColor: theme.colors.border,
      };
    }

    if (tier) {
      const tierColor = ACHIEVEMENT_TIER_COLORS[tier];
      return {
        backgroundColor: `${tierColor}20`,
        borderColor: tierColor,
      };
    }

    return {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    };
  };

  const getIconColor = () => {
    if (isLocked) {
      return theme.colors.textDisabled;
    }

    if (tier) {
      return ACHIEVEMENT_TIER_COLORS[tier];
    }

    return theme.colors.primary;
  };

  const badgeStyle = getBadgeStyle();
  const iconColor = getIconColor();

  return (
    <View style={[styles.container, style]}>
      <AnimatedPressable
        style={[
          styles.badge,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            borderWidth: 3,
            ...badgeStyle,
          },
          animatedStyle,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={!onPress}
      >
        {/* 进度环 */}
        {isLocked && showProgress && progress > 0 && (
          <View style={StyleSheet.absoluteFillObject}>
            <ProgressRing
              progress={progress}
              size={badgeSize}
              strokeWidth={3}
              color={theme.colors.primary}
              backgroundColor="transparent"
              animated
            />
          </View>
        )}

        {/* 背景光芒效果 */}
        {!isLocked && tier && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderRadius: badgeSize / 2,
                backgroundColor: ACHIEVEMENT_TIER_COLORS[tier],
              },
              shimmerStyle,
            ]}
          />
        )}

        {/* 图标 */}
        <View style={styles.iconContainer}>
          {isLocked ? (
            <IconSymbol name="lock.fill" size={iconSize} color={iconColor} />
          ) : (
            <IconSymbol
              name={achievement.icon as keyof typeof MAPPING}
              size={iconSize}
              color={iconColor}
            />
          )}
        </View>

        {/* 等级标识 */}
        {!isLocked && tier && (
          <View
            style={[
              styles.tierBadge,
              {
                backgroundColor: ACHIEVEMENT_TIER_COLORS[tier],
              },
            ]}
          >
            <ThemedText type="caption" style={styles.tierText}>
              {t(`achievements.tier.${tier}` as any)}
            </ThemedText>
          </View>
        )}
      </AnimatedPressable>

      {/* 标题 */}
      {showTitle && (
        <View style={styles.titleContainer}>
          <ThemedText
            type="bodySmall"
            style={[
              styles.title,
              {
                color: isLocked ? theme.colors.textDisabled : theme.colors.text,
                fontSize: size === 'small' ? 12 : 14,
              },
            ]}
            numberOfLines={2}
          >
            {getAchievementName(achievement)}
          </ThemedText>

          {isLocked && showProgress && (
            <ThemedText
              type="caption"
              style={[
                styles.progressText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {Math.round(progress * 100)}%
            </ThemedText>
          )}
        </View>
      )}
    </View>
  );
}

// 徽章墙组件
export interface BadgeWallProps {
  achievements: Achievement[];
  userProgress: {
    achievementId: string;
    progress: number;
    tier: AchievementTier | null;
  }[];
  onBadgePress: (achievement: Achievement) => void;
  size?: 'small' | 'medium' | 'large';
  columns?: number;
  showProgress?: boolean;
  style?: ViewStyle;
}

export function BadgeWall({
  achievements,
  userProgress,
  onBadgePress,
  size = 'medium',
  columns = 3,
  showProgress = true,
  style,
}: BadgeWallProps) {
  const progressMap = new Map(userProgress.map(p => [p.achievementId, p]));

  return (
    <View style={[styles.wall, { gap: 16 }, style]}>
      {achievements.map((achievement, index) => {
        const progress = progressMap.get(achievement.id);
        const isLocked = !progress || progress.tier === null;

        return (
          <View
            key={achievement.id}
            style={[styles.badgeWrapper, { width: `${100 / columns}%` }]}
          >
            <Badge
              achievement={achievement}
              tier={progress?.tier || null}
              size={size}
              isLocked={isLocked}
              progress={progress?.progress || 0}
              onPress={() => onBadgePress(achievement)}
              showProgress={showProgress}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  titleContainer: {
    alignItems: 'center',
    gap: 2,
    maxWidth: 100,
  },
  title: {
    textAlign: 'center',
    fontWeight: '500',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '500',
  },
  wall: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
});
