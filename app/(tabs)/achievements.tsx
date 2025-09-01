import React, { useState, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Badge } from '@/components/ui/Badge';
import { FilterChip, FilterChipGroup } from '@/components/ui/FilterChip';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useThemeColor';
import { useResponsive } from '@/hooks/useResponsive';
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
  const { gridColumns, isTablet } = useResponsive();
  const { width } = useWindowDimensions();
  
  const achievements = useAchievements();
  const userAchievements = useUserAchievements();
  const stats = useAchievementStats();
  const catches = useCatches();
  
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
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
        const userAchievement = userAchievements.find(ua => ua.achievementId === a.id);
        return userAchievement && userAchievement.tier !== null;
      });
    }

    return filtered;
  }, [achievements, selectedCategory, showOnlyUnlocked, userAchievements]);

  // Category options
  const categoryOptions = useMemo(() => [
    { id: 'all', label: '全部', count: achievements.length },
    { id: 'species', label: '物种', count: achievements.filter(a => a.category === 'species').length },
    { id: 'quantity', label: '数量', count: achievements.filter(a => a.category === 'quantity').length },
    { id: 'size', label: '尺寸', count: achievements.filter(a => a.category === 'size').length },
    { id: 'location', label: '地点', count: achievements.filter(a => a.category === 'location').length },
    { id: 'special', label: '特殊', count: achievements.filter(a => a.category === 'special').length },
  ], [achievements]);

  const renderAchievement = ({ item: achievement }: { item: Achievement }) => {
    const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
    const isLocked = !userAchievement || userAchievement.tier === null;
    const tier = userAchievement?.tier || null;

    return (
      <Badge
        achievement={achievement}
        tier={tier}
        size="large"
        isLocked={isLocked}
        showTitle={true}
        style={styles.achievementBadge}
      />
    );
  };

  const renderStats = () => (
    <ThemedView type="card" style={[styles.statsCard, theme.shadows.sm]}>
      <View style={styles.statsHeader}>
        <ThemedText type="title">成就统计</ThemedText>
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
            完成率
          </ThemedText>
          <ThemedText type="subtitle" style={{ color: theme.colors.primary }}>
            {Math.round(stats.progressPercent)}%
          </ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <ThemedText type="body" style={{ color: theme.colors.textSecondary }}>
            剩余成就
          </ThemedText>
          <ThemedText type="subtitle" style={{ color: theme.colors.textSecondary }}>
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
          title="暂无成就数据"
          description="成就系统正在加载中"
        />
      );
    }

    if (showOnlyUnlocked && stats.unlockedCount === 0) {
      return (
        <EmptyState
          type="no-results"
          title="还没有解锁任何成就"
          description="开始钓鱼来获得你的第一个成就吧！"
          action={{
            label: "开始钓鱼",
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="h2">成就系统</ThemedText>
        <ThemedText type="body" style={{ color: theme.colors.textSecondary }}>
          完成挑战，收集成就徽章
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
            分类筛选
          </ThemedText>
          
          <FilterChipGroup
            chips={categoryOptions.map(opt => ({ id: opt.id, label: opt.label, count: opt.count }))}
            selectedIds={selectedCategory === 'all' ? [] : [selectedCategory]}
            onSelectionChange={(selected) => {
              setSelectedCategory(selected.length > 0 ? selected[0] as FilterCategory : 'all');
            }}
            multiSelect={false}
            style={styles.categoryFilters}
          />

          <View style={styles.toggleFilters}>
            <FilterChip
              label="仅显示已解锁"
              selected={showOnlyUnlocked}
              onPress={() => setShowOnlyUnlocked(!showOnlyUnlocked)}
              icon="lock.open.fill"
              variant="outlined"
            />
          </View>
        </ThemedView>

        {/* Achievements Grid */}
        <ThemedView style={styles.achievementsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            成就列表 ({filteredAchievements.length})
          </ThemedText>
          
          {filteredAchievements.length > 0 ? (
            <View style={styles.achievementsGrid}>
              {filteredAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementItem}>
                  {renderAchievement({ item: achievement })}
                </View>
              ))}
            </View>
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
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  achievementItem: {
    width: '48%',
    minWidth: 150,
  },
  achievementBadge: {
    width: '100%',
  },
});