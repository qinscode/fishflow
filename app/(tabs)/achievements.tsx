import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterChip, FilterChipGroup } from '@/components/ui/FilterChip';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/hooks/useThemeColor';
import { useTranslation } from '@/lib/i18n';
import {
  useAchievements,
  useUserAchievements,
  useAchievementStats,
  useCatches,
} from '@/lib/store';
import { Achievement, AchievementCategory, AchievementTier } from '@/lib/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type FilterCategory = AchievementCategory | 'all';
type FilterTier = AchievementTier | 'all';

export default function AchievementsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { gridColumns, isTablet } = useResponsive();
  const { width } = useWindowDimensions();

  const achievements = useAchievements();
  const userAchievements = useUserAchievements();
  const stats = useAchievementStats();
  const catches = useCatches();

  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>('all');
  const [selectedTier, setSelectedTier] = useState<FilterTier>('all');
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    let filtered = achievements;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    // Show only unlocked filter
    if (showOnlyUnlocked) {
      filtered = filtered.filter(a => {
        const userAchievement = userAchievements.find(
          ua => ua.achievementId === a.id
        );
        return userAchievement && userAchievement.tier !== null;
      });
    }

    return filtered;
  }, [achievements, selectedCategory, showOnlyUnlocked, userAchievements]);

  // Category options
  const categoryOptions = useMemo(
    () => [
      {
        id: 'all',
        label: t('achievements.filter.all'),
        count: achievements.length,
      },
      {
        id: 'species',
        label: t('achievements.category.species'),
        count: achievements.filter(a => a.category === 'species').length,
      },
      {
        id: 'quantity',
        label: t('achievements.category.quantity'),
        count: achievements.filter(a => a.category === 'quantity').length,
      },
      {
        id: 'size',
        label: t('achievements.category.size'),
        count: achievements.filter(a => a.category === 'size').length,
      },
      {
        id: 'location',
        label: t('achievements.category.location'),
        count: achievements.filter(a => a.category === 'location').length,
      },
      {
        id: 'special',
        label: t('achievements.category.special'),
        count: achievements.filter(a => a.category === 'special').length,
      },
    ],
    [achievements, t]
  );

  const renderAchievement = useCallback(
    ({ item: achievement }: { item: Achievement }) => {
      const userAchievement = userAchievements.find(
        ua => ua.achievementId === achievement.id
      );
      const isLocked = !userAchievement || userAchievement.tier === null;
      const tier = userAchievement?.tier || null;

      const dynamicItemStyle = {
        ...styles.achievementItem,
        minWidth: isTablet ? 160 : 140,
        maxWidth: isTablet ? 200 : 180,
      };

      return (
        <View style={dynamicItemStyle}>
          <Badge
            achievement={achievement}
            tier={tier}
            size="large"
            isLocked={isLocked}
            showTitle={true}
            style={styles.achievementBadge}
          />
        </View>
      );
    },
    [userAchievements, isTablet]
  );

  const renderStats = () => (
    <ThemedView type="card" style={[styles.statsCard, theme.shadows.sm]}>
      <View style={styles.statsHeader}>
        <ThemedText type="title">{t('achievements.stats')}</ThemedText>
        <ThemedText type="h3" style={{ color: theme.colors.primary }}>
          {stats.unlockedCount}/{stats.totalCount}
        </ThemedText>
      </View>

      <ProgressBar
        progress={stats.progressPercent / 100}
        height={8}
        color={theme.colors.primary}
        animated={true}
        style={styles.progressBar}
      />

      <View style={styles.statsDetails}>
        <View style={styles.statItem}>
          <ThemedText type="body" style={{ color: theme.colors.textSecondary }}>
            {t('achievements.completion.rate')}
          </ThemedText>
          <ThemedText type="subtitle" style={{ color: theme.colors.primary }}>
            {Math.round(stats.progressPercent)}%
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText type="body" style={{ color: theme.colors.textSecondary }}>
            {t('achievements.remaining')}
          </ThemedText>
          <ThemedText
            type="subtitle"
            style={{ color: theme.colors.textSecondary }}
          >
            {stats.totalCount - stats.unlockedCount}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );

  const renderEmpty = () => {
    if (achievements.length === 0) {
      return (
        <EmptyState
          type="no-data"
          title={t('achievements.no.data.title')}
          description={t('achievements.no.data.description')}
        />
      );
    }

    if (showOnlyUnlocked && stats.unlockedCount === 0) {
      return (
        <EmptyState
          type="no-results"
          title={t('achievements.no.unlocked.title')}
          description={t('achievements.no.unlocked.description')}
          action={{
            label: t('log.start.fishing'),
            onPress: () => {
              // Navigate to log screen
            },
          }}
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="h2">{t('achievements.title')}</ThemedText>
        <ThemedText type="body" style={{ color: theme.colors.textSecondary }}>
          {t('achievements.subtitle')}
        </ThemedText>
      </ThemedView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        {renderStats()}

        {/* Filters */}
        <ThemedView style={styles.filtersSection}>
          <ThemedText type="subtitle" style={styles.filterTitle}>
            {t('achievements.category.filter')}
          </ThemedText>

          <FilterChipGroup
            chips={categoryOptions.map(opt => ({
              id: opt.id,
              label: opt.label,
              count: opt.count,
            }))}
            selectedIds={selectedCategory === 'all' ? [] : [selectedCategory]}
            onSelectionChange={selected => {
              setSelectedCategory(
                selected.length > 0 ? (selected[0] as FilterCategory) : 'all'
              );
            }}
            multiSelect={false}
            style={styles.categoryFilters}
          />

          <View style={styles.toggleFilters}>
            <FilterChip
              label={t('achievements.show.unlocked.only')}
              selected={showOnlyUnlocked}
              onPress={() => setShowOnlyUnlocked(!showOnlyUnlocked)}
              icon="lock-open-outline"
              variant="outlined"
            />
          </View>
        </ThemedView>

        {/* Achievements Grid */}
        <ThemedView style={styles.achievementsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t('achievements.list.title')} ({filteredAchievements.length})
          </ThemedText>

          {filteredAchievements.length > 0 ? (
            <FlatList
              data={filteredAchievements}
              renderItem={renderAchievement}
              keyExtractor={item => item.id}
              numColumns={gridColumns}
              key={gridColumns} // Force re-render when columns change
              contentContainerStyle={styles.achievementsList}
              columnWrapperStyle={
                gridColumns > 1 ? styles.achievementRow : undefined
              }
              showsVerticalScrollIndicator={false}
              scrollEnabled={false} // Let parent ScrollView handle scrolling
              ItemSeparatorComponent={() => (
                <View style={styles.achievementSeparator} />
              )}
            />
          ) : (
            renderEmpty()
          )}
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
  statsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    marginBottom: 16,
  },
  statsDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  categoryFilters: {
    marginBottom: 12,
  },
  toggleFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  achievementsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  achievementsList: {
    paddingTop: 8,
  },
  achievementRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  achievementItem: {
    flex: 1,
    marginHorizontal: 8,
    marginVertical: 6,
    minWidth: 140,
    maxWidth: 180,
    alignItems: 'center',
  },
  achievementSeparator: {
    height: 8,
  },
  achievementBadge: {
    width: '100%',
  },
});
