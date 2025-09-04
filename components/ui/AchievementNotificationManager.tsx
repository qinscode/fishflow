import React, { useState, useCallback } from 'react';
import { router } from 'expo-router';

import { AchievementNotification } from '@/components/ui/AchievementNotification';
import { Achievement, AchievementTier } from '@/lib/types';
import { useAchievements } from '@/lib/store';

interface NotificationData {
  id: string;
  achievement: Achievement;
  tier: AchievementTier;
  isUpgrade: boolean;
  previousTier?: AchievementTier;
}

export function AchievementNotificationManager() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);
  const achievements = useAchievements();

  // 添加新的通知到队列
  const addNotification = useCallback((data: Omit<NotificationData, 'id'>) => {
    const notification: NotificationData = {
      ...data,
      id: Date.now().toString(),
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // 如果当前没有显示通知，立即显示
    if (!currentNotification) {
      setCurrentNotification(notification);
    }
  }, [currentNotification]);

  // 处理通知消失
  const handleNotificationDismiss = useCallback(() => {
    setCurrentNotification(null);
    
    // 显示队列中的下一个通知
    setNotifications(prev => {
      const [, ...rest] = prev;
      if (rest.length > 0) {
        setTimeout(() => {
          setCurrentNotification(rest[0]);
        }, 500); // 短暂延迟避免动画冲突
      }
      return rest;
    });
  }, []);

  // 导航到成就页面
  const handleNavigateToAchievements = useCallback(() => {
    router.push('/achievements' as any);
  }, []);

  // 渲染当前通知
  const renderCurrentNotification = () => {
    if (!currentNotification) return null;

    return (
      <AchievementNotification
        achievement={currentNotification.achievement}
        tier={currentNotification.tier}
        isVisible={true}
        isUpgrade={currentNotification.isUpgrade}
        previousTier={currentNotification.previousTier}
        onDismiss={handleNotificationDismiss}
        onNavigateToAchievements={handleNavigateToAchievements}
      />
    );
  };

  // 暴露addNotification方法给全局使用
  React.useEffect(() => {
    // 在全局对象上注册通知管理器
    (global as any).showAchievementNotification = (
      achievementId: string,
      tier: AchievementTier,
      isUpgrade: boolean = false,
      previousTier?: AchievementTier
    ) => {
      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement) {
        addNotification({
          achievement,
          tier,
          isUpgrade,
          previousTier,
        });
      }
    };

    return () => {
      delete (global as any).showAchievementNotification;
    };
  }, [achievements, addNotification]);

  return renderCurrentNotification();
}

// 全局便捷函数
export function showAchievementNotification(
  achievementId: string,
  tier: AchievementTier,
  isUpgrade: boolean = false,
  previousTier?: AchievementTier
) {
  if ((global as any).showAchievementNotification) {
    (global as any).showAchievementNotification(achievementId, tier, isUpgrade, previousTier);
  }
}