import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useThemeColor';
import { useResponsive } from '@/hooks/useResponsive';

export interface EmptyStateProps {
  type: 'no-data' | 'no-results' | 'error' | 'loading' | 'offline';
  title: string;
  description?: string;
  illustration?: string | React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  lottieAnimation?: string;
  style?: ViewStyle;
}

export function EmptyState({
  type,
  title,
  description,
  illustration,
  action,
  secondaryAction,
  lottieAnimation,
  style,
}: EmptyStateProps) {
  const theme = useTheme();
  const { isTablet } = useResponsive();

  const getDefaultIllustration = () => {
    const iconSize = isTablet ? 120 : 80;
    const iconColor = theme.colors.textDisabled;

    switch (type) {
      case 'no-data':
        return (
          <IconSymbol 
            name="fish" 
            size={iconSize} 
            color={iconColor} 
          />
        );
      case 'no-results':
        return (
          <IconSymbol 
            name="magnifyingglass" 
            size={iconSize} 
            color={iconColor} 
          />
        );
      case 'error':
        return (
          <IconSymbol 
            name="exclamationmark.triangle.fill" 
            size={iconSize} 
            color={theme.colors.error} 
          />
        );
      case 'loading':
        return (
          <IconSymbol 
            name="timer" 
            size={iconSize} 
            color={iconColor} 
          />
        );
      case 'offline':
        return (
          <IconSymbol 
            name="wifi.slash" 
            size={iconSize} 
            color={iconColor} 
          />
        );
      default:
        return (
          <IconSymbol 
            name="fish" 
            size={iconSize} 
            color={iconColor} 
          />
        );
    }
  };

  const renderIllustration = () => {
    if (React.isValidElement(illustration)) {
      return illustration;
    }

    if (typeof illustration === 'string') {
      return (
        <Image
          source={{ uri: illustration }}
          style={styles.illustrationImage}
          contentFit="contain"
        />
      );
    }

    // TODO: 如果需要Lottie动画，可以在这里添加
    // if (lottieAnimation) {
    //   return <LottieView source={lottieAnimation} autoPlay loop style={styles.lottie} />;
    // }

    return getDefaultIllustration();
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      style={[styles.container, style]}
    >
      <ThemedView type="default" style={styles.content}>
        {/* 插图 */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.illustrationContainer}
        >
          {renderIllustration()}
        </Animated.View>

        {/* 文本内容 */}
        <Animated.View 
          entering={FadeInUp.delay(400).duration(600)}
          style={styles.textContainer}
        >
          <ThemedText 
            type="title" 
            style={[
              styles.title,
              { 
                fontSize: isTablet ? 24 : 20,
                color: theme.colors.text,
              }
            ]}
          >
            {title}
          </ThemedText>

          {description && (
            <ThemedText 
              type="body" 
              style={[
                styles.description,
                { 
                  fontSize: isTablet ? 18 : 16,
                  color: theme.colors.textSecondary,
                }
              ]}
            >
              {description}
            </ThemedText>
          )}
        </Animated.View>

        {/* 操作按钮 */}
        {(action || secondaryAction) && (
          <Animated.View 
            entering={FadeInUp.delay(600).duration(600)}
            style={styles.actionsContainer}
          >
            {action && (
              <Pressable
                style={[
                  styles.actionButton,
                  styles.primaryAction,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.borderRadius.md,
                  },
                  theme.shadows.sm,
                ]}
                onPress={action.onPress}
              >
                <ThemedText 
                  type="button" 
                  style={[styles.actionText, { color: '#FFFFFF' }]}
                >
                  {action.label}
                </ThemedText>
              </Pressable>
            )}

            {secondaryAction && (
              <Pressable
                style={[
                  styles.actionButton,
                  styles.secondaryAction,
                  {
                    borderColor: theme.colors.border,
                    borderRadius: theme.borderRadius.md,
                  },
                ]}
                onPress={secondaryAction.onPress}
              >
                <ThemedText 
                  type="button" 
                  style={[styles.actionText, { color: theme.colors.primary }]}
                >
                  {secondaryAction.label}
                </ThemedText>
              </Pressable>
            )}
          </Animated.View>
        )}
      </ThemedView>
    </Animated.View>
  );
}

// 预定义的常见空状态
export const EmptyStates = {
  NoFish: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      type="no-data"
      title="还没有记录任何鱼类"
      description="开始你的钓鱼之旅，记录第一条鱼吧！"
      action={{
        label: "记录钓鱼",
        onPress: () => {},
      }}
      {...props}
    />
  ),

  NoSearchResults: (props: Partial<EmptyStateProps> & { query: string }) => (
    <EmptyState
      type="no-results"
      title="没有找到相关结果"
      description={`没有找到与"${props.query}"相关的鱼类`}
      action={{
        label: "清除搜索",
        onPress: () => {},
      }}
      {...props}
    />
  ),

  NoAchievements: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      type="no-data"
      title="还没有获得任何成就"
      description="完成钓鱼挑战来解锁成就徽章"
      action={{
        label: "开始钓鱼",
        onPress: () => {},
      }}
      {...props}
    />
  ),

  NoStats: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      type="no-data"
      title="还没有统计数据"
      description="记录一些钓鱼经历来查看你的统计信息"
      action={{
        label: "记录第一次钓鱼",
        onPress: () => {},
      }}
      {...props}
    />
  ),

  Error: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      type="error"
      title="出现了问题"
      description="请稍后重试，或联系我们获取帮助"
      action={{
        label: "重试",
        onPress: () => {},
      }}
      secondaryAction={{
        label: "返回",
        onPress: () => {},
      }}
      {...props}
    />
  ),

  Offline: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      type="offline"
      title="网络连接已断开"
      description="请检查你的网络连接后重试"
      action={{
        label: "重新连接",
        onPress: () => {},
      }}
      {...props}
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  illustrationContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationImage: {
    width: 120,
    height: 120,
  },
  lottie: {
    width: 150,
    height: 150,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryAction: {
    // Primary action styles applied via backgroundColor
  },
  secondaryAction: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  actionText: {
    fontWeight: '600',
  },
});