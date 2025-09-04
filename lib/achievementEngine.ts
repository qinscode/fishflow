import * as Haptics from 'expo-haptics';

import { databaseService } from './database';
import { t } from './i18n';
import { useAppStore } from './store';
import {
  Achievement,
  AchievementTier,
  CatchRecord,
  UserAchievement,
  WaterType,
} from './types';

export interface AchievementUnlock {
  achievementId: string;
  tier: AchievementTier;
  isNew: boolean; // 是否为首次解锁该成就
  isUpgrade: boolean; // 是否为等级提升
  previousTier?: AchievementTier;
}

export class AchievementEngine {
  private static instance: AchievementEngine;
  private unlockQueue: AchievementUnlock[] = [];
  private isProcessing = false;

  private constructor() {}

  static getInstance(): AchievementEngine {
    if (!AchievementEngine.instance) {
      AchievementEngine.instance = new AchievementEngine();
    }
    return AchievementEngine.instance;
  }

  /**
   * 检查并更新所有相关成就
   */
  async checkAndUpdateAchievements(
    triggeredBy: 'catch' | 'equipment' | 'login',
    data?: any
  ): Promise<AchievementUnlock[]> {
    const { achievements, userAchievements, catches } = useAppStore.getState();
    const unlocks: AchievementUnlock[] = [];

    for (const achievement of achievements) {
      const userAchievement = userAchievements.find(
        ua => ua.achievementId === achievement.id
      );

      const progress = await this.calculateProgress(
        achievement,
        catches,
        data
      );
      const currentTier = userAchievement?.tier ?? null;
      const newTier = this.getEligibleTier(achievement, progress);

      // 检查是否有新的解锁或升级
      if (newTier && (!currentTier || this.tierOrder(newTier) > this.tierOrder(currentTier))) {
        const unlock: AchievementUnlock = {
          achievementId: achievement.id,
          tier: newTier,
          isNew: !currentTier,
          isUpgrade: !!currentTier,
          previousTier: currentTier ?? undefined,
        };
        unlocks.push(unlock);

        // 更新用户成就数据
        await this.updateUserAchievement(achievement.id, progress, newTier);
      } else if (userAchievement && progress !== userAchievement.progress) {
        // 仅更新进度，无解锁
        await this.updateUserAchievement(achievement.id, progress, currentTier || null);
      }
    }

    // 处理解锁通知
    if (unlocks.length > 0) {
      this.queueUnlockNotifications(unlocks);
    }

    return unlocks;
  }

  /**
   * 计算特定成就的进度
   */
  private async calculateProgress(
    achievement: Achievement,
    catches: CatchRecord[],
    additionalData?: any
  ): Promise<number> {
    switch (achievement.id) {
      case 'first-catch':
        return catches.filter(c => !c.isSkunked).length;

      case 'species-collector':
        const uniqueSpecies = new Set(
          catches.filter(c => !c.isSkunked && c.fishId).map(c => c.fishId)
        ).size;
        return uniqueSpecies;

      case 'quantity-master':
        return catches.filter(c => !c.isSkunked).length;

      case 'size-hunter':
        const bigFish = catches.filter(
          c => !c.isSkunked && c.measurements?.weightKg && c.measurements.weightKg >= 1
        );
        return bigFish.length;

      case 'streak-keeper':
        return this.calculateStreakDays(catches);

      case 'explorer':
        const uniqueWaterTypes = new Set(
          catches.filter(c => c.location?.waterType).map(c => c.location!.waterType)
        ).size;
        return uniqueWaterTypes;

      case 'air-force':
        return this.calculateConsecutiveSkunks(catches);

      case 'early-bird':
        return catches.filter(c => {
          const hour = new Date(c.timestamp).getHours();
          return hour >= 4 && hour < 6;
        }).length;

      case 'night-owl':
        return catches.filter(c => {
          const hour = new Date(c.timestamp).getHours();
          return hour >= 22 || hour < 4;
        }).length;

      case 'weather-warrior':
        return catches.filter(c => 
          c.conditions?.weather && 
          ['rain', 'storm', 'heavy_rain', 'thunderstorm'].includes(c.conditions.weather)
        ).length;

      case 'small-fish-specialist':
        return catches.filter(
          c => !c.isSkunked && c.measurements?.lengthCm && c.measurements.lengthCm < 10
        ).length;

      case 'catch-and-release':
        return catches.filter(c => !c.isSkunked && c.isReleased).length;

      case 'lucky-fisherman':
        // 需要检查稀有鱼类
        const { fish } = useAppStore.getState();
        const rareCatches = catches.filter(c => {
          if (c.isSkunked || !c.fishId) return false;
          const fishData = fish.find(f => f.id === c.fishId);
          return fishData && ['rare', 'epic', 'legendary'].includes(fishData.rarity);
        });
        return rareCatches.length;

      case 'multi-species':
        return this.calculateMultiSpeciesDays(catches);

      case 'equipment-hoarder':
        // 需要从装备使用统计计算
        return this.calculateEquipmentVariety(catches);

      case 'photo-enthusiast':
        return catches.filter(c => c.photos && c.photos.length > 0).length;

      case 'season-master':
        return this.calculateSeasonVariety(catches);

      case 'persistent-angler':
        return this.calculateLongestSession(catches);

      default:
        return 0;
    }
  }

  /**
   * 获取符合条件的最高等级
   */
  private getEligibleTier(
    achievement: Achievement,
    progress: number
  ): AchievementTier | null {
    const tiers = achievement.tiers;
    
    if (progress >= tiers.gold.requirement) return 'gold';
    if (progress >= tiers.silver.requirement) return 'silver';
    if (progress >= tiers.bronze.requirement) return 'bronze';
    
    return null;
  }

  /**
   * 获取等级序号（用于比较）
   */
  private tierOrder(tier: AchievementTier): number {
    switch (tier) {
      case 'bronze': return 1;
      case 'silver': return 2;
      case 'gold': return 3;
      default: return 0;
    }
  }

  /**
   * 更新用户成就数据
   */
  private async updateUserAchievement(
    achievementId: string,
    progress: number,
    tier: AchievementTier | null
  ): Promise<void> {
    const { userAchievements, setUserAchievements } = useAppStore.getState();
    
    const existingIndex = userAchievements.findIndex(
      ua => ua.achievementId === achievementId
    );

    const updatedAchievement: UserAchievement = {
      achievementId,
      progress,
      tier,
      unlockedAt: tier ? new Date().toISOString() : undefined,
      isViewed: false, // 标记为未查看，用于显示"NEW"标签
    };

    let newUserAchievements: UserAchievement[];
    
    if (existingIndex >= 0) {
      // 更新现有成就
      newUserAchievements = [...userAchievements];
      newUserAchievements[existingIndex] = {
        ...newUserAchievements[existingIndex],
        ...updatedAchievement,
      };
    } else {
      // 添加新成就
      newUserAchievements = [...userAchievements, updatedAchievement];
    }

    // 更新状态和数据库
    setUserAchievements(newUserAchievements);
    
    try {
      // 批量更新数据库 - 逐个更新每个成就
      for (const achievement of newUserAchievements) {
        await databaseService.updateUserAchievement(achievement);
      }
    } catch (error) {
      console.error('Failed to save user achievements:', error);
    }
  }

  /**
   * 计算连续钓鱼天数
   */
  private calculateStreakDays(catches: CatchRecord[]): number {
    if (catches.length === 0) return 0;

    const fishingDates = Array.from(
      new Set(
        catches
          .filter(c => !c.isSkunked)
          .map(c => new Date(c.timestamp).toDateString())
      )
    ).sort();

    if (fishingDates.length === 0) return 0;

    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < fishingDates.length; i++) {
      const prevDate = new Date(fishingDates[i - 1]);
      const currDate = new Date(fishingDates[i]);
      const daysDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }

  /**
   * 计算连续空军次数
   */
  private calculateConsecutiveSkunks(catches: CatchRecord[]): number {
    const sortedCatches = [...catches].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let maxConsecutiveSkunks = 0;
    let currentConsecutiveSkunks = 0;

    for (const catchRecord of sortedCatches) {
      if (catchRecord.isSkunked) {
        currentConsecutiveSkunks++;
        maxConsecutiveSkunks = Math.max(maxConsecutiveSkunks, currentConsecutiveSkunks);
      } else {
        currentConsecutiveSkunks = 0;
      }
    }

    return maxConsecutiveSkunks;
  }

  /**
   * 计算多物种单日记录天数
   */
  private calculateMultiSpeciesDays(catches: CatchRecord[]): number {
    const catchesByDate = catches
      .filter(c => !c.isSkunked && c.fishId)
      .reduce((acc, catch_) => {
        const date = new Date(catch_.timestamp).toDateString();
        if (!acc[date]) acc[date] = new Set();
        acc[date].add(catch_.fishId);
        return acc;
      }, {} as Record<string, Set<string>>);

    return Object.values(catchesByDate).filter(species => species.size >= 2).length;
  }

  /**
   * 计算装备多样性
   */
  private calculateEquipmentVariety(catches: CatchRecord[]): number {
    const equipmentCombinations = new Set(
      catches.map(c => 
        JSON.stringify({
          rod: c.equipment?.rod || '',
          reel: c.equipment?.reel || '',
          bait: c.equipment?.bait || '',
        })
      )
    );
    return equipmentCombinations.size;
  }

  /**
   * 计算季节多样性
   */
  private calculateSeasonVariety(catches: CatchRecord[]): number {
    const seasons = new Set(
      catches.map(c => {
        const month = new Date(c.timestamp).getMonth() + 1;
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
      })
    );
    return seasons.size;
  }

  /**
   * 计算最长钓鱼时长（小时）
   */
  private calculateLongestSession(catches: CatchRecord[]): number {
    // 这需要根据钓鱼记录的时间戳来估算钓鱼时长
    // 简化版本：假设每次钓鱼都是1小时，返回单日最多钓鱼次数
    const catchesByDate = catches.reduce((acc, catch_) => {
      const date = new Date(catch_.timestamp).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Math.max(...Object.values(catchesByDate), 0);
  }

  /**
   * 队列化解锁通知
   */
  private queueUnlockNotifications(unlocks: AchievementUnlock[]): void {
    this.unlockQueue.push(...unlocks);
    if (!this.isProcessing) {
      this.processUnlockQueue();
    }
  }

  /**
   * 处理解锁通知队列
   */
  private async processUnlockQueue(): Promise<void> {
    if (this.isProcessing || this.unlockQueue.length === 0) return;

    this.isProcessing = true;
    const { achievements } = useAppStore.getState();

    while (this.unlockQueue.length > 0) {
      const unlock = this.unlockQueue.shift()!;
      const achievement = achievements.find(a => a.id === unlock.achievementId);
      
      if (achievement) {
        await this.showUnlockNotification(achievement, unlock);
        // 添加触觉反馈
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // 延迟以避免通知重叠
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    this.isProcessing = false;
  }

  /**
   * 显示解锁通知
   */
  private async showUnlockNotification(
    achievement: Achievement,
    unlock: AchievementUnlock
  ): Promise<void> {
    // 使用全局通知管理器显示通知
    if ((global as any).showAchievementNotification) {
      (global as any).showAchievementNotification(
        unlock.achievementId,
        unlock.tier,
        unlock.isUpgrade,
        unlock.previousTier
      );
    } else {
      // 回退到系统Alert（开发时可能用到）
      const tierText = t(`achievements.tier.${unlock.tier}` as any);
      const achievementName = achievement.name;
      
      let title: string;
      let message: string;

      if (unlock.isNew) {
        title = `🏆 ${t('achievements.unlocked')}!`;
        message = `${achievementName}\n${tierText}`;
      } else {
        title = `⬆️ ${t('achievements.tier.gold')} ${t('achievements.unlocked')}!`;
        message = `${achievementName}\n${t(`achievements.tier.${unlock.previousTier}` as any)} → ${tierText}`;
      }

      const { Alert } = await import('react-native');
      Alert.alert(title, message, [
        { text: t('common.ok'), style: 'default' },
      ]);
    }
  }

  /**
   * 标记成就为已查看
   */
  async markAchievementAsViewed(achievementId: string): Promise<void> {
    const { userAchievements, setUserAchievements } = useAppStore.getState();
    
    const updatedAchievements = userAchievements.map(ua =>
      ua.achievementId === achievementId
        ? { ...ua, isViewed: true }
        : ua
    );

    setUserAchievements(updatedAchievements);

    try {
      // 只更新修改的成就
      const updatedAchievement = updatedAchievements.find(ua => ua.achievementId === achievementId);
      if (updatedAchievement) {
        await databaseService.updateUserAchievement(updatedAchievement);
      }
    } catch (error) {
      console.error('Failed to update achievement view status:', error);
    }
  }

  /**
   * 手动触发成就检查（用于测试）
   */
  async manualAchievementCheck(): Promise<AchievementUnlock[]> {
    return await this.checkAndUpdateAchievements('login');
  }
}

// 导出单例实例
export const achievementEngine = AchievementEngine.getInstance();

/**
 * 便捷函数：在钓获记录后检查成就
 */
export async function checkAchievementsAfterCatch(
  catchRecord: CatchRecord
): Promise<AchievementUnlock[]> {
  return await achievementEngine.checkAndUpdateAchievements('catch', catchRecord);
}

/**
 * 便捷函数：登录时检查成就
 */
export async function checkAchievementsOnLogin(): Promise<AchievementUnlock[]> {
  return await achievementEngine.checkAndUpdateAchievements('login');
}