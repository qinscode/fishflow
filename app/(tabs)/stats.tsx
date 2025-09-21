import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar, ProgressRing } from '@/components/ui/ProgressBar';
import { useTheme } from '@/hooks/useThemeColor';
import { RARITY_NAMES } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';
import { useFish, useCatches, useUserStats } from '@/lib/store';
import { formatDate, getRarityColor } from '@/lib/utils';

const { width } = Dimensions.get('window');

// 根据进度获取颜色
const getProgressColor = (progress: number, theme: any) => {
  if (progress < 10) {return '#FF6B6B';} // 红色 - 刚开始
  if (progress < 25) {return '#FFA726';} // 橙色 - 入门
  if (progress < 50) {return '#FFCA28';} // 黄色 - 进步中
  if (progress < 75) {return '#66BB6A';} // 绿色 - 不错
  if (progress < 90) {return '#42A5F5';} // 蓝色 - 很好
  return '#9C27B0'; // 紫色 - 专家级
};

// 获取进度等级名称
const getProgressLevel = (progress: number) => {
  if (progress < 10) {return '新手钓手';}
  if (progress < 25) {return '入门级';}
  if (progress < 50) {return '进阶者';}
  if (progress < 75) {return '熟练者';}
  if (progress < 90) {return '专家级';}
  return '大师级';
};

export default function StatsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  const fish = useFish();
  const catches = useCatches();
  const userStats = useUserStats();

  // Helper function to get month name
  const getMonthName = (monthIndex: number) => {
    return t(`stats.month.${monthIndex + 1}` as any);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (catches.length === 0) {
      return null;
    }

    // Split skunked vs non-skunked
    const nonSkunked = catches.filter(c => !c.isSkunked);
    const skunked = catches.filter(c => c.isSkunked);

    // Basic stats (exclude skunked)
    const totalCatches = nonSkunked.length;
    const uniqueSpecies = new Set(nonSkunked.map(c => c.fishId)).size;
    const totalWeight = nonSkunked.reduce(
      (sum, c) => sum + (c.measurements.weightKg || 0),
      0
    );
    const totalLength = nonSkunked.reduce(
      (sum, c) => sum + (c.measurements.lengthCm || 0),
      0
    );

    // Rarity distribution
    const rarityStats = fish.reduce(
      (acc, fishItem) => {
        const fishCatches = nonSkunked.filter(c => c.fishId === fishItem.id);
        if (fishCatches.length > 0) {
          acc[fishItem.rarity] =
            (acc[fishItem.rarity] || 0) + fishCatches.length;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    // Personal bests
    const heaviest = nonSkunked.reduce((max, c) => {
      return (c.measurements.weightKg || 0) > (max?.measurements.weightKg || 0)
        ? c
        : max;
    }, nonSkunked[0]);

    const longest = nonSkunked.reduce((max, c) => {
      return (c.measurements.lengthCm || 0) > (max?.measurements.lengthCm || 0)
        ? c
        : max;
    }, nonSkunked[0]);

    // Monthly stats
    const monthlyStats = nonSkunked.reduce(
      (acc, c) => {
        const month = new Date(c.timestamp).getMonth();
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    const mostActiveMonth = Object.entries(monthlyStats).reduce(
      (max, [month, count]) => {
        return count > max.count ? { month: parseInt(month), count } : max;
      },
      { month: 0, count: 0 }
    );

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCatches = nonSkunked.filter(
      c => new Date(c.timestamp) > thirtyDaysAgo
    );

    // Time-based analysis
    const hourlyStats = nonSkunked.reduce((acc, c) => {
      const hour = new Date(c.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const bestHour = Object.entries(hourlyStats).reduce(
      (max, [hour, count]) => {
        return count > max.count ? { hour: parseInt(hour), count } : max;
      },
      { hour: 6, count: 0 }
    );

    // Seasonal analysis
    const seasonalStats = nonSkunked.reduce((acc, c) => {
      const month = new Date(c.timestamp).getMonth();
      const season = month < 3 ? 'winter' : month < 6 ? 'spring' : month < 9 ? 'summer' : 'autumn';
      acc[season] = (acc[season] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Success rate by location
    const locationStats = nonSkunked.reduce((acc, c) => {
      const locationKey = c.location?.waterBodyName || c.location?.address || 'Unknown Location';
      acc[locationKey] = (acc[locationKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topLocation = Object.entries(locationStats).reduce(
      (max, [location, count]) => {
        return count > max.count ? { location, count } : max;
      },
      { location: '', count: 0 }
    );

    // Fishing streak calculation
    const sortedDates = nonSkunked
      .map(c => new Date(c.timestamp).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currentDate = new Date(sortedDates[i]);
      const diffDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);

    // Calculate current streak
    const today = new Date().toDateString();
    const lastCatchDate = nonSkunked.length > 0 ? 
      new Date(nonSkunked[nonSkunked.length - 1].timestamp).toDateString() : '';
    
    if (lastCatchDate === today) {
      currentStreak = 1;
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const prevDate = new Date(sortedDates[i]);
        const nextDate = new Date(sortedDates[i + 1]);
        const diffDays = (nextDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    const skunkedCount = skunked.length;
    const totalRecords = catches.length;
    const skunkedRate = Math.round((skunkedCount / Math.max(1, totalRecords)) * 100);

    return {
      totalCatches,
      uniqueSpecies,
      totalWeight: Math.round(totalWeight * 100) / 100,
      averageWeight: Math.round((totalWeight / totalCatches) * 100) / 100,
      totalLength: Math.round(totalLength * 100) / 100,
      averageLength: Math.round((totalLength / totalCatches) * 100) / 100,
      rarityStats,
      skunkedStats: {
        count: skunkedCount,
        rate: skunkedRate,
      },
      personalBests: {
        heaviest: heaviest
          ? {
              fish: fish.find(f => f.id === heaviest.fishId),
              weight: heaviest.measurements.weightKg,
              date: heaviest.timestamp,
            }
          : null,
        longest: longest
          ? {
              fish: fish.find(f => f.id === longest.fishId),
              length: longest.measurements.lengthCm,
              date: longest.timestamp,
            }
          : null,
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
      timeStats: {
        bestHour: bestHour.hour,
        bestHourCount: bestHour.count,
        seasonal: seasonalStats,
      },
      locationStats: {
        topLocation: topLocation.location,
        topLocationCount: topLocation.count,
        totalLocations: Object.keys(locationStats).length,
      },
      streakStats: {
        current: currentStreak,
        longest: maxStreak,
      },
      averageCatchesPerTrip: Math.round((totalCatches / Math.max(1, Object.keys(locationStats).length)) * 100) / 100,
    };
  }, [catches, fish]);

  if (!stats) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ThemedView style={styles.emptyContainer}>
          <EmptyState
            type="no-data"
            title={t('stats.no.data.title')}
            description={t('stats.no.data.description')}
            action={{
              label: t('stats.start.recording'),
              onPress: () => {
                router.push('/log');
              },
            }}
          />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="h2">{t('stats.title')}</ThemedText>
        <ThemedText type="body" style={{ color: theme.colors.textSecondary }}>
          {t('stats.subtitle')}
        </ThemedText>
        <Pressable
          onPress={() => router.push('/logs')}
          style={{
            alignSelf: 'flex-start',
            marginTop: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: theme.colors.surface,
          }}
        >
          <MaterialCommunityIcons
            name="notebook-outline"
            size={16}
            color={theme.colors.primary}
          />
          <ThemedText type="bodySmall" style={{ color: theme.colors.primary }}>
            {t('logs.view.button')}
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Skunked Stats */}
        <ThemedView type="card" style={[styles.statsCard, theme.shadows.sm]}>
          <ThemedText type="title" style={styles.cardTitle}>
            {t('stats.skunked.title')}
          </ThemedText>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <MaterialCommunityIcons
                name="emoticon-sad-outline"
                size={24}
                color={theme.colors.textSecondary}
              />
              <ThemedText type="h3" style={{ color: theme.colors.text }}>
                {stats.skunkedStats.count}
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: theme.colors.textSecondary }}
              >
                {t('stats.skunked.count')}
              </ThemedText>
            </View>

            <View style={styles.statBox}>
              <MaterialCommunityIcons
                name="percent-outline"
                size={24}
                color={theme.colors.textSecondary}
              />
              <ThemedText type="h3" style={{ color: theme.colors.text }}>
                {stats.skunkedStats.rate}%
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: theme.colors.textSecondary }}
              >
                {t('stats.skunked.rate')}
              </ThemedText>
            </View>
          </View>
        </ThemedView>
        {/* Overview Stats */}
        <ThemedView type="card" style={[styles.statsCard, theme.shadows.sm]}>
          <ThemedText type="title" style={styles.cardTitle}>
            {t('stats.overview.stats')}
          </ThemedText>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <MaterialCommunityIcons
                name="fish"
                size={24}
                color={theme.colors.primary}
              />
              <ThemedText type="h3" style={{ color: theme.colors.primary }}>
                {stats.totalCatches}
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: theme.colors.textSecondary }}
              >
                {t('stats.catches.total')}
              </ThemedText>
            </View>

            <View style={styles.statBox}>
              <MaterialCommunityIcons
                name="star-four-points-outline"
                size={24}
                color={theme.colors.secondary}
              />
              <ThemedText type="h3" style={{ color: theme.colors.secondary }}>
                {stats.uniqueSpecies}
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: theme.colors.textSecondary }}
              >
                {t('stats.unique.species')}
              </ThemedText>
            </View>

            <View style={styles.statBox}>
              <MaterialCommunityIcons
                name="weight"
                size={24}
                color={theme.colors.accent}
              />
              <ThemedText type="h3" style={{ color: theme.colors.accent }}>
                {stats.totalWeight}kg
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: theme.colors.textSecondary }}
              >
                {t('stats.total.weight')}
              </ThemedText>
            </View>

            <View style={styles.statBox}>
              <MaterialCommunityIcons
                name="ruler"
                size={24}
                color={theme.colors.warning}
              />
              <ThemedText type="h3" style={{ color: theme.colors.warning }}>
                {stats.totalLength}cm
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: theme.colors.textSecondary }}
              >
                {t('stats.total.length')}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Collection Progress */}
        <ThemedView type="card" style={[styles.statsCard, theme.shadows.sm]}>
          <ThemedText type="title" style={styles.cardTitle}>
            {t('stats.collection.progress')}
          </ThemedText>

          <View style={styles.progressContainer}>
            <View style={styles.progressRingWrapper}>
              <ProgressRing
                progress={stats.completionRate / 100}
                size={140}
                strokeWidth={10}
                color={getProgressColor(stats.completionRate, theme)}
                animated={true}
                label={`${stats.completionRate}%`}
              />
              <ThemedText
                type="caption"
                style={[styles.progressSubtitle, { color: theme.colors.textSecondary }]}
              >
                完成度
              </ThemedText>
            </View>

            <View style={styles.progressDetails}>
              <View style={styles.progressMainStat}>
                <ThemedText type="h1" style={{ color: getProgressColor(stats.completionRate, theme), fontWeight: '800' }}>
                  {stats.uniqueSpecies}
                </ThemedText>
                <ThemedText type="h2" style={{ color: theme.colors.textSecondary, fontWeight: '300' }}>
                  / {fish.length}
                </ThemedText>
              </View>
              <ThemedText
                type="subtitle"
                style={[styles.progressMainLabel, { color: theme.colors.text }]}
              >
                {t('stats.unlocked.fish')}
              </ThemedText>

              {/* 进度等级指示 */}
              <View style={styles.progressBadge}>
                <ThemedText 
                  type="caption" 
                  style={[
                    styles.progressBadgeText, 
                    { 
                      backgroundColor: getProgressColor(stats.completionRate, theme) + '20',
                      color: getProgressColor(stats.completionRate, theme),
                      borderColor: getProgressColor(stats.completionRate, theme) + '40'
                    }
                  ]}
                >
                  {getProgressLevel(stats.completionRate)}
                </ThemedText>
              </View>

              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <MaterialCommunityIcons
                    name="weight"
                    size={16}
                    color={theme.colors.accent}
                  />
                  <ThemedText type="caption" style={styles.progressStatLabel}>
                    {t('stats.average.weight')}
                  </ThemedText>
                  <ThemedText
                    type="h3"
                    style={{ color: theme.colors.accent, fontWeight: '700' }}
                  >
                    {stats.averageWeight}kg
                  </ThemedText>
                </View>
                <View style={styles.progressStat}>
                  <MaterialCommunityIcons
                    name="ruler"
                    size={16}
                    color={theme.colors.secondary}
                  />
                  <ThemedText type="caption" style={styles.progressStatLabel}>
                    {t('stats.average.length')}
                  </ThemedText>
                  <ThemedText
                    type="h3"
                    style={{ color: theme.colors.secondary, fontWeight: '700' }}
                  >
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
            {t('stats.rarity.distribution')}
          </ThemedText>

          <View style={styles.rarityStats}>
            {Object.entries(stats.rarityStats).map(([rarity, count]) => {
              const total = Object.values(stats.rarityStats).reduce(
                (sum, c) => sum + c,
                0
              );
              const percentage = Math.round((count / total) * 100);
              const color = getRarityColor(rarity as any);

              return (
                <View key={rarity} style={styles.rarityItem}>
                  <View style={styles.rarityHeader}>
                    <View
                      style={[styles.rarityDot, { backgroundColor: color }]}
                    />
                    <ThemedText type="subtitle">
                      {RARITY_NAMES[rarity as keyof typeof RARITY_NAMES]}
                    </ThemedText>
                    <ThemedText
                      type="body"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {t('stats.count.with.percentage', {
                        count: count.toString(),
                        percentage: percentage.toString(),
                      })}
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
              {t('stats.personal.bests')}
            </ThemedText>

            <View style={styles.personalBests}>
              {stats.personalBests.heaviest && (
                <View style={styles.bestRecord}>
                  <MaterialCommunityIcons
                    name="weight"
                    size={20}
                    color={theme.colors.accent}
                  />
                  <View style={styles.bestDetails}>
                    <ThemedText type="subtitle">
                      {t('stats.heaviest.record')}
                    </ThemedText>
                    <ThemedText
                      type="body"
                      style={{ color: theme.colors.primary }}
                    >
                      {stats.personalBests.heaviest.fish?.name} -{' '}
                      {stats.personalBests.heaviest.weight}kg
                    </ThemedText>
                    <ThemedText
                      type="caption"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {formatDate(
                        new Date(stats.personalBests.heaviest.date),
                        'short'
                      )}
                    </ThemedText>
                  </View>
                </View>
              )}

              {stats.personalBests.longest && (
                <View style={styles.bestRecord}>
                  <MaterialCommunityIcons
                    name="ruler"
                    size={20}
                    color={theme.colors.warning}
                  />
                  <View style={styles.bestDetails}>
                    <ThemedText type="subtitle">
                      {t('stats.longest.record')}
                    </ThemedText>
                    <ThemedText
                      type="body"
                      style={{ color: theme.colors.secondary }}
                    >
                      {stats.personalBests.longest.fish?.name} -{' '}
                      {stats.personalBests.longest.length}cm
                    </ThemedText>
                    <ThemedText
                      type="caption"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {formatDate(
                        new Date(stats.personalBests.longest.date),
                        'short'
                      )}
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
            {t('stats.activity.stats')}
          </ThemedText>

          <View style={styles.activityStats}>
            <View style={styles.activityItem}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={theme.colors.primary}
              />
              <View style={styles.activityDetails}>
                <ThemedText type="subtitle">
                  {t('stats.most.active.month')}
                </ThemedText>
                <ThemedText type="body" style={{ color: theme.colors.primary }}>
                  {getMonthName(stats.mostActiveMonth.month)} (
                  {t('stats.times.with.count', {
                    count: stats.mostActiveMonth.count.toString(),
                  })}
                  )
                </ThemedText>
              </View>
            </View>

            <View style={styles.activityItem}>
              <MaterialCommunityIcons
                name="timer-outline"
                size={20}
                color={theme.colors.secondary}
              />
              <View style={styles.activityDetails}>
                <ThemedText type="subtitle">
                  {t('stats.recent.30.days')}
                </ThemedText>
                <ThemedText
                  type="body"
                  style={{ color: theme.colors.secondary }}
                >
                  {t('stats.times.with.count', {
                    count: stats.recentActivity.count.toString(),
                  })}{' '}
                  ({stats.recentActivity.percentage}%)
                </ThemedText>
              </View>
            </View>

            <View style={styles.activityItem}>
              <MaterialCommunityIcons
                name="clock-time-four"
                size={20}
                color={theme.colors.accent}
              />
              <View style={styles.activityDetails}>
                <ThemedText type="subtitle">
                  {t('stats.best.fishing.hour')}
                </ThemedText>
                <ThemedText type="body" style={{ color: theme.colors.accent }}>
                  {stats.timeStats.bestHour}:00 - {stats.timeStats.bestHour + 1}:00
                  ({t('stats.times.with.count', {
                    count: stats.timeStats.bestHourCount.toString(),
                  })})
                </ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Streak & Consistency */}
        <ThemedView type="card" style={[styles.statsCard, theme.shadows.sm]}>
          <ThemedText type="title" style={styles.cardTitle}>
            {t('stats.streak.consistency')}
          </ThemedText>

          <View style={styles.streakStats}>
            <View style={styles.streakItem}>
              <View style={[styles.streakIcon, { backgroundColor: theme.colors.success + '20' }]}>
                <MaterialCommunityIcons
                  name="fire"
                  size={24}
                  color={theme.colors.success}
                />
              </View>
              <View style={styles.streakDetails}>
                <ThemedText type="h3" style={{ color: theme.colors.success }}>
                  {stats.streakStats.current}
                </ThemedText>
                <ThemedText type="subtitle">
                  {t('stats.current.streak')}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
                  {t('stats.consecutive.days')}
                </ThemedText>
              </View>
            </View>

            <View style={styles.streakItem}>
              <View style={[styles.streakIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                <MaterialCommunityIcons
                  name="trophy"
                  size={24}
                  color={theme.colors.warning}
                />
              </View>
              <View style={styles.streakDetails}>
                <ThemedText type="h3" style={{ color: theme.colors.warning }}>
                  {stats.streakStats.longest}
                </ThemedText>
                <ThemedText type="subtitle">
                  {t('stats.longest.streak')}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
                  {t('stats.best.record')}
                </ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Location Analytics */}
        {stats.locationStats.totalLocations > 0 && (
          <ThemedView type="card" style={[styles.statsCard, theme.shadows.sm]}>
            <ThemedText type="title" style={styles.cardTitle}>
              {t('stats.location.analytics')}
            </ThemedText>

            <View style={styles.locationStats}>
              <View style={styles.locationItem}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.locationDetails}>
                  <ThemedText type="subtitle">
                    {t('stats.favorite.spot')}
                  </ThemedText>
                  <ThemedText type="body" style={{ color: theme.colors.primary }}>
                    {stats.locationStats.topLocation || t('stats.no.location')}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
                    {t('stats.times.with.count', {
                      count: stats.locationStats.topLocationCount.toString(),
                    })}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.locationItem}>
                <MaterialCommunityIcons
                  name="map-outline"
                  size={20}
                  color={theme.colors.secondary}
                />
                <View style={styles.locationDetails}>
                  <ThemedText type="subtitle">
                    {t('stats.total.locations')}
                  </ThemedText>
                  <ThemedText type="body" style={{ color: theme.colors.secondary }}>
                    {stats.locationStats.totalLocations} {t('stats.different.spots')}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
                    {t('stats.average.catches.per.trip', {
                      average: stats.averageCatchesPerTrip.toString(),
                    })}
                  </ThemedText>
                </View>
              </View>
            </View>
          </ThemedView>
        )}

        {/* Seasonal Analysis */}
        <ThemedView type="card" style={[styles.statsCard, theme.shadows.sm]}>
          <ThemedText type="title" style={styles.cardTitle}>
            {t('stats.seasonal.analysis')}
          </ThemedText>

          <View style={styles.seasonalStats}>
            {Object.entries(stats.timeStats.seasonal).map(([season, count]) => {
              const total = Object.values(stats.timeStats.seasonal).reduce(
                (sum, c) => sum + c,
                0
              );
              const percentage = Math.round((count / total) * 100);
              const seasonColors = {
                spring: '#4CAF50',
                summer: '#FF9800',
                autumn: '#FF5722',
                winter: '#2196F3',
              };
              const color = seasonColors[season as keyof typeof seasonColors] || theme.colors.primary;
              
              const seasonIcons = {
                spring: 'flower',
                summer: 'white-balance-sunny',
                autumn: 'leaf',
                winter: 'snowflake',
              };
              const icon = seasonIcons[season as keyof typeof seasonIcons] || 'calendar';

              return (
                <View key={season} style={styles.seasonItem}>
                  <View style={styles.seasonHeader}>
                    <MaterialCommunityIcons
                      name={icon as any}
                      size={20}
                      color={color}
                    />
                    <ThemedText type="subtitle">
                      {t(`stats.season.${season}` as any)}
                    </ThemedText>
                    <ThemedText
                      type="body"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {count} ({percentage}%)
                    </ThemedText>
                  </View>
                  <ProgressBar
                    progress={percentage / 100}
                    height={6}
                    color={color}
                    style={styles.seasonProgress}
                  />
                </View>
              );
            })}
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
    gap: 24,
  },
  progressRingWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  progressSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressDetails: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 12,
    paddingLeft: 8,
  },
  progressMainStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  progressMainLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBadge: {
    marginVertical: 4,
  },
  progressBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    textAlign: 'center',
    overflow: 'hidden',
  },
  progressStats: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },
  progressStat: {
    alignItems: 'flex-start',
    gap: 4,
  },
  progressStatLabel: {
    fontSize: 10,
    opacity: 0.7,
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
  streakStats: {
    flexDirection: 'row',
    gap: 16,
  },
  streakItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakDetails: {
    flex: 1,
    gap: 4,
  },
  locationStats: {
    gap: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  locationDetails: {
    flex: 1,
    gap: 4,
  },
  seasonalStats: {
    gap: 16,
  },
  seasonItem: {
    gap: 8,
  },
  seasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  seasonProgress: {
    height: 6,
  },
});
