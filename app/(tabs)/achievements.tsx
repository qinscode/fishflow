import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
  interpolate,
  FadeIn,
  SlideInRight,
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
import { getAchievementName } from '@/lib/achievementHelpers';
import { useTranslation } from '@/lib/i18n';
import {
  useAchievements,
  useUserAchievements,
  useAchievementStats,
  useCatches,
} from '@/lib/store';
import { Achievement, AchievementCategory, AchievementTier } from '@/lib/types';

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
    ({ item: achievement, index }: { item: Achievement; index: number }) => {
      const userAchievement = userAchievements.find(
        ua => ua.achievementId === achievement.id
      );
      const isLocked = !userAchievement || userAchievement.tier === null;
      const tier = userAchievement?.tier || null;
      const progress = (userAchievement?.progress || 0) / (achievement.tiers[tier || 'bronze'].requirement || 1);

      const dynamicItemStyle = {
        ...styles.achievementItem,
        minWidth: isTablet ? 160 : 140,
        maxWidth: isTablet ? 200 : 180,
      };

      return (
        <Animated.View
          entering={FadeIn.delay(index * 100).springify()}
          style={dynamicItemStyle}
        >
          <Pressable
            style={styles.achievementCard}
            onPress={() =>
              router.push({
                pathname: '/achievement/[id]',
                params: { id: achievement.id },
              })
            }
          >
            <ThemedView 
              type="card" 
              style={[
                styles.cardContent,
                isLocked ? styles.lockedCard : styles.unlockedCard,
                tier && styles[`${tier}Card`],
                theme.shadows.sm
              ]}
            >
              {/* Achievement Badge */}
              <View style={styles.badgeContainer}>
                <Badge
                  achievement={achievement}
                  tier={tier}
                  size="large"
                  isLocked={isLocked}
                  progress={progress}
                  showProgress={isLocked}
                  showTitle={false}
                />
                
                {/* New indicator */}
                {userAchievement && !userAchievement.isViewed && (
                  <Animated.View
                    entering={SlideInRight.springify()}
                    style={[styles.newBadge, { backgroundColor: theme.colors.secondary }]}
                  >
                    <ThemedText type="bodySmall" style={styles.newText}>
                      {t('fishdex.new')}
                    </ThemedText>
                  </Animated.View>
                )}
              </View>

              {/* Achievement Info */}
              <View style={styles.achievementInfo}>
                <ThemedText
                  type="body"
                  numberOfLines={2}
                  style={[
                    styles.achievementTitle,
                    isLocked && { color: theme.colors.textSecondary }
                  ]}
                >
                  {getAchievementName(achievement)}
                </ThemedText>
                
                {/* Progress or status */}
                {isLocked ? (
                  <View style={styles.progressContainer}>
                    <ThemedText
                      type="bodySmall"
                      style={[styles.progressText, { color: theme.colors.textSecondary }]}
                    >
                      {userAchievement?.progress || 0}/{achievement.tiers.bronze.requirement}
                    </ThemedText>
                  </View>
                ) : (
                  <View style={[styles.tierBadge, { backgroundColor: theme.colors[tier === 'gold' ? 'warning' : tier === 'silver' ? 'textSecondary' : 'secondary'] + '20' }]}>
                    <ThemedText
                      type="bodySmall"
                      style={[
                        styles.tierText,
                        { color: theme.colors[tier === 'gold' ? 'warning' : tier === 'silver' ? 'textSecondary' : 'secondary'] }
                      ]}
                    >
                      {tier ? t(`achievements.tier.${tier}` as any) : ''}
                    </ThemedText>
                  </View>
                )}
              </View>
            </ThemedView>
          </Pressable>
        </Animated.View>
      );
    },
    [userAchievements, isTablet, theme, t]
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
              renderItem={({ item, index }) => renderAchievement({ item, index })}
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
  },
  achievementSeparator: {
    height: 8,
  },
  achievementCard: {
    width: '100%',
  },
  cardContent: {
    padding: 16,
    borderRadius: 12,
    minHeight: 140,
  },
  lockedCard: {
    opacity: 0.6,
  },
  unlockedCard: {
    opacity: 1,
  },
  bronzeCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#CD7F32',
  },
  silverCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#C0C0C0',
  },
  goldCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 10,
  },
  newText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  achievementInfo: {
    alignItems: 'center',
  },
  achievementTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
