import React, { useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ProgressBar, ProgressRing } from '@/components/ui/ProgressBar';
import { useTheme } from '@/hooks/useThemeColor';
import { RARITY_NAMES } from '@/lib/constants';
import { 
  useFish, 
  useCatches, 
  useUserStats,
} from '@/lib/store';
import { formatDate, getRarityColor } from '@/lib/utils';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const theme = useTheme();
  
  const fish = useFish();
  const catches = useCatches();
  const userStats = useUserStats();

  // Calculate statistics
  const stats = useMemo(() => {
    if (catches.length === 0) {
      return null;
    }

    // Basic stats
    const totalCatches = catches.length;
    const uniqueSpecies = new Set(catches.map(c => c.fishId)).size;
    const totalWeight = catches.reduce((sum, c) => sum + (c.measurements.weightKg || 0), 0);
    const totalLength = catches.reduce((sum, c) => sum + (c.measurements.lengthCm || 0), 0);

    // Rarity distribution
    const rarityStats = fish.reduce((acc, fishItem) => {
      const fishCatches = catches.filter(c => c.fishId === fishItem.id);
      if (fishCatches.length > 0) {
        acc[fishItem.rarity] = (acc[fishItem.rarity] || 0) + fishCatches.length;
      }
      return acc;
    }, {} as Record<string, number>);

    // Personal bests
    const heaviest = catches.reduce((max, c) => {
      return (c.measurements.weightKg || 0) > (max?.measurements.weightKg || 0) ? c : max;
    }, catches[0]);

    const longest = catches.reduce((max, c) => {
      return (c.measurements.lengthCm || 0) > (max?.measurements.lengthCm || 0) ? c : max;
    }, catches[0]);

    // Monthly stats
    const monthlyStats = catches.reduce((acc, c) => {
      const month = new Date(c.timestamp).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const mostActiveMonth = Object.entries(monthlyStats).reduce((max, [month, count]) => {
      return count > max.count ? { month: parseInt(month), count } : max;
    }, { month: 0, count: 0 });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCatches = catches.filter(c => new Date(c.timestamp) > thirtyDaysAgo);

    return {
      totalCatches,
      uniqueSpecies,
      totalWeight: Math.round(totalWeight * 100) / 100,
      averageWeight: Math.round((totalWeight / totalCatches) * 100) / 100,
      totalLength: Math.round(totalLength * 100) / 100,
      averageLength: Math.round((totalLength / totalCatches) * 100) / 100,
      rarityStats,
      personalBests: {
        heaviest: heaviest ? {
          fish: fish.find(f => f.id === heaviest.fishId),
          weight: heaviest.measurements.weightKg,
          date: heaviest.timestamp,
        } : null,
        longest: longest ? {
          fish: fish.find(f => f.id === longest.fishId),
          length: longest.measurements.lengthCm,
          date: longest.timestamp,
        } : null,
      },
      mostActiveMonth: {
        month: mostActiveMonth.month,
        count: mostActiveMonth.count,
      },
      recentActivity: {
        count: recentCatches.length,
        percentage: Math.round((recentCatches.length / totalCatches) * 100),
      },
      completionRate: Math.round((uniqueSpecies / fish.length) * 100),
    };
  }, [catches, fish]);

  if (!stats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ThemedView style={styles.emptyContainer}>
          <EmptyState
            type="no-data"
            title="暂无统计数据"
            description="开始记录钓鱼来查看你的统计信息"
            action={{
              label: "开始记录",
              onPress: () => {
                // Navigate to log screen
              },
            }}
          />
        </ThemedView>
      </SafeAreaView>
    );
  }

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="h2">钓鱼统计</ThemedText>
        <ThemedText type="body" style={{ color: theme.colors.textSecondary }}>
          分析你的钓鱼数据
        </ThemedText>
      </ThemedView>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Stats */}
        <ThemedView type="card" style={[styles.statsCard, theme.shadows.sm]}>
          <ThemedText type="title" style={styles.cardTitle}>
            总览统计
          </ThemedText>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <IconSymbol name="fish.fill" size={24} color={theme.colors.primary} />
              <ThemedText type="h3" style={{ color: theme.colors.primary }}>
                {stats.totalCatches}
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
                总钓获数
              </ThemedText>
            </View>
            
            <View style={styles.statBox}>
              <IconSymbol name="sparkles" size={24} color={theme.colors.secondary} />
              <ThemedText type="h3" style={{ color: theme.colors.secondary }}>
                {stats.uniqueSpecies}
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
                不同物种
              </ThemedText>
            </View>
            
            <View style={styles.statBox}>
              <IconSymbol name="scalemass.fill" size={24} color={theme.colors.accent} />
              <ThemedText type="h3" style={{ color: theme.colors.accent }}>
                {stats.totalWeight}kg
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
                总重量
              </ThemedText>
            </View>
            
            <View style={styles.statBox}>
              <IconSymbol name="ruler" size={24} color={theme.colors.warning} />
              <ThemedText type="h3" style={{ color: theme.colors.warning }}>
                {stats.totalLength}cm
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
                总长度
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Collection Progress */}
        <ThemedView type="card" style={[styles.statsCard, theme.shadows.sm]}>
          <ThemedText type="title" style={styles.cardTitle}>
            收集进度
          </ThemedText>
          
          <View style={styles.progressContainer}>
            <ProgressRing
              progress={stats.completionRate / 100}
              size={120}
              color={theme.colors.primary}
              animated={true}
              label={`${stats.completionRate}%`}
            />
            
            <View style={styles.progressDetails}>
              <ThemedText type="h3" style={{ color: theme.colors.primary }}>
                {stats.uniqueSpecies} / {fish.length}
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.colors.textSecondary }}>
                已解锁鱼类
              </ThemedText>
              
              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <ThemedText type="subtitle">平均重量</ThemedText>
                  <ThemedText type="body" style={{ color: theme.colors.primary }}>
                    {stats.averageWeight}kg
                  </ThemedText>
                </View>
                <View style={styles.progressStat}>
                  <ThemedText type="subtitle">平均长度</ThemedText>
                  <ThemedText type="body" style={{ color: theme.colors.secondary }}>
                    {stats.averageLength}cm
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Rarity Distribution */}
        <ThemedView type="card" style={[styles.statsCard, theme.shadows.sm]}>
          <ThemedText type="title" style={styles.cardTitle}>
            稀有度分布
          </ThemedText>
          
          <View style={styles.rarityStats}>
            {Object.entries(stats.rarityStats).map(([rarity, count]) => {
              const total = Object.values(stats.rarityStats).reduce((sum, c) => sum + c, 0);
              const percentage = Math.round((count / total) * 100);
              const color = getRarityColor(rarity as any);
              
              return (
                <View key={rarity} style={styles.rarityItem}>
                  <View style={styles.rarityHeader}>
                    <View style={[styles.rarityDot, { backgroundColor: color }]} />
                    <ThemedText type="subtitle">
                      {RARITY_NAMES[rarity as keyof typeof RARITY_NAMES]}
                    </ThemedText>
                    <ThemedText type="body" style={{ color: theme.colors.textSecondary }}>
                      {count}条 ({percentage}%)
                    </ThemedText>
                  </View>
                  <ProgressBar
                    progress={percentage / 100}
                    height={6}
                    color={color}
                    style={styles.rarityProgress}
                  />
                </View>
              );
            })}
          </View>
        </ThemedView>

        {/* Personal Bests */}
        {(stats.personalBests.heaviest || stats.personalBests.longest) && (
          <ThemedView type="card" style={[styles.statsCard, theme.shadows.sm]}>
            <ThemedText type="title" style={styles.cardTitle}>
              个人纪录
            </ThemedText>
            
            <View style={styles.personalBests}>
              {stats.personalBests.heaviest && (
                <View style={styles.bestRecord}>
                  <IconSymbol name="scalemass.fill" size={20} color={theme.colors.accent} />
                  <View style={styles.bestDetails}>
                    <ThemedText type="subtitle">最重记录</ThemedText>
                    <ThemedText type="body" style={{ color: theme.colors.primary }}>
                      {stats.personalBests.heaviest.fish?.name} - {stats.personalBests.heaviest.weight}kg
                    </ThemedText>
                    <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
                      {formatDate(new Date(stats.personalBests.heaviest.date), 'short')}
                    </ThemedText>
                  </View>
                </View>
              )}
              
              {stats.personalBests.longest && (
                <View style={styles.bestRecord}>
                  <IconSymbol name="ruler" size={20} color={theme.colors.warning} />
                  <View style={styles.bestDetails}>
                    <ThemedText type="subtitle">最长记录</ThemedText>
                    <ThemedText type="body" style={{ color: theme.colors.secondary }}>
                      {stats.personalBests.longest.fish?.name} - {stats.personalBests.longest.length}cm
                    </ThemedText>
                    <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
                      {formatDate(new Date(stats.personalBests.longest.date), 'short')}
                    </ThemedText>
                  </View>
                </View>
              )}
            </View>
          </ThemedView>
        )}

        {/* Activity Stats */}
        <ThemedView type="card" style={[styles.statsCard, theme.shadows.sm]}>
          <ThemedText type="title" style={styles.cardTitle}>
            活动统计
          </ThemedText>
          
          <View style={styles.activityStats}>
            <View style={styles.activityItem}>
              <IconSymbol name="calendar" size={20} color={theme.colors.primary} />
              <View style={styles.activityDetails}>
                <ThemedText type="subtitle">最活跃月份</ThemedText>
                <ThemedText type="body" style={{ color: theme.colors.primary }}>
                  {monthNames[stats.mostActiveMonth.month]} ({stats.mostActiveMonth.count}次)
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <IconSymbol name="timer" size={20} color={theme.colors.secondary} />
              <View style={styles.activityDetails}>
                <ThemedText type="subtitle">近30天活跃度</ThemedText>
                <ThemedText type="body" style={{ color: theme.colors.secondary }}>
                  {stats.recentActivity.count}次 ({stats.recentActivity.percentage}%)
                </ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  statsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    minWidth: (width - 80) / 2 - 6,
    gap: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  progressDetails: {
    flex: 1,
    gap: 8,
  },
  progressStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  progressStat: {
    flex: 1,
  },
  rarityStats: {
    gap: 16,
  },
  rarityItem: {
    gap: 8,
  },
  rarityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rarityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  rarityProgress: {
    height: 6,
  },
  personalBests: {
    gap: 16,
  },
  bestRecord: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  bestDetails: {
    flex: 1,
    gap: 4,
  },
  activityStats: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  activityDetails: {
    flex: 1,
    gap: 4,
  },
});