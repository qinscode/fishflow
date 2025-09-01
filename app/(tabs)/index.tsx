import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { FishCard } from '@/components/ui/FishCard';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTheme } from '@/hooks/useThemeColor';
import { useResponsive } from '@/hooks/useResponsive';
import { 
  useAppStore,
  useFish, 
  useCatches, 
  useUserStats,
  useAchievements,
  useUserAchievements,
} from '@/lib/store';
import { FadeInView, SlideInView } from '@/components/animations';
import { getFishCardState } from '@/lib/utils';
import { initializeMockData } from '@/lib/mockData';

export default function HomeScreen() {
  const theme = useTheme();
  const { isTablet } = useResponsive();
  
  const fish = useFish();
  const catches = useCatches();
  const userStats = useUserStats();
  const achievements = useAchievements();
  const userAchievements = useUserAchievements();
  const initializeData = useAppStore(state => state.initializeData);

  // Initialize data on mount
  useEffect(() => {
    if (fish.length === 0) {
      initializeMockData().then(() => {
        initializeData();
      });
    }
  }, []);

  // Get recent unlocks (last 3)
  const recentUnlocks = React.useMemo(() => {
    const unlockedFish = fish
      .map(f => ({ ...f, state: getFishCardState(f, catches) }))
      .filter(f => f.state === 'unlocked' || f.state === 'new')
      .slice(0, 3);
    return unlockedFish;
  }, [fish, catches]);

  // Get recent achievements
  const recentAchievements = React.useMemo(() => {
    return achievements
      .map(a => {
        const userProgress = userAchievements.find(ua => ua.achievementId === a.id);
        return { achievement: a, progress: userProgress };
      })
      .filter(a => a.progress?.tier !== null)
      .slice(0, 3);
  }, [achievements, userAchievements]);

  const quickActions = [
    {
      id: 'log-catch',
      title: '记录钓鱼',
      description: '记录新的钓鱼经历',
      icon: 'plus.circle.fill' as const,
      color: theme.colors.primary,
      onPress: () => router.push('/log'),
    },
    {
      id: 'fishdex',
      title: '浏览图鉴',
      description: '探索鱼类图鉴',
      icon: 'book.fill' as const,
      color: theme.colors.secondary,
      onPress: () => router.push('/fishdex'),
    },
    {
      id: 'stats',
      title: '查看统计',
      description: '分析钓鱼数据',
      icon: 'chart.bar.fill' as const,
      color: theme.colors.accent,
      onPress: () => router.push('/stats'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <FadeInView delay={0}>
          <ThemedView style={styles.header}>
            <View>
              <ThemedText type="h2" style={styles.greeting}>
                欢迎回来！
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.colors.textSecondary }}>
                继续你的钓鱼之旅
              </ThemedText>
            </View>
            
            <Pressable 
              style={[styles.profileButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => {
                // TODO: Navigate to profile
              }}
            >
              <IconSymbol 
                name="person.fill" 
                size={24} 
                color={theme.colors.primary} 
              />
            </Pressable>
          </ThemedView>
        </FadeInView>

        {/* Quick Stats */}
        <SlideInView direction="up" delay={200}>
          <ThemedView type="card" style={[styles.statsCard, theme.shadows.sm]}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <ThemedText type="h3" style={{ color: theme.colors.primary }}>
                  {userStats.totalCatches}
                </ThemedText>
                <ThemedText type="bodySmall" style={{ color: theme.colors.textSecondary }}>
                  总钓获
                </ThemedText>
              </View>
              
              <View style={styles.statItem}>
                <ThemedText type="h3" style={{ color: theme.colors.secondary }}>
                  {userStats.uniqueSpecies}
                </ThemedText>
                <ThemedText type="bodySmall" style={{ color: theme.colors.textSecondary }}>
                  种类
                </ThemedText>
              </View>
              
              <View style={styles.statItem}>
                <ThemedText type="h3" style={{ color: theme.colors.accent }}>
                  {userStats.currentStreak}
                </ThemedText>
                <ThemedText type="bodySmall" style={{ color: theme.colors.textSecondary }}>
                  连续天数
                </ThemedText>
              </View>
            </View>
          </ThemedView>
        </SlideInView>

        {/* Quick Actions */}
        <FadeInView delay={400}>
          <View style={styles.section}>
            <ThemedText type="title" style={styles.sectionTitle}>
              快捷操作
            </ThemedText>
            
            <View style={styles.quickActions}>
              {quickActions.map((action, index) => (
                <SlideInView key={action.id} direction="left" delay={500 + index * 100}>
                  <Pressable
                    style={[
                      styles.actionCard,
                      { backgroundColor: theme.colors.card },
                      theme.shadows.sm,
                    ]}
                    onPress={action.onPress}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                      <IconSymbol 
                        name={action.icon} 
                        size={24} 
                        color={action.color} 
                      />
                    </View>
                    
                    <View style={styles.actionContent}>
                      <ThemedText type="subtitle" style={styles.actionTitle}>
                        {action.title}
                      </ThemedText>
                      <ThemedText type="bodySmall" style={{ color: theme.colors.textSecondary }}>
                        {action.description}
                      </ThemedText>
                    </View>
                    
                    <IconSymbol 
                      name="chevron.right" 
                      size={16} 
                      color={theme.colors.textSecondary} 
                    />
                  </Pressable>
                </SlideInView>
              ))}
            </View>
          </View>
        </FadeInView>

        {/* Recent Unlocks */}
        {recentUnlocks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="title" style={styles.sectionTitle}>
                最新解锁
              </ThemedText>
              <Pressable onPress={() => router.push('/fishdex')}>
                <ThemedText type="bodySmall" style={{ color: theme.colors.primary }}>
                  查看全部
                </ThemedText>
              </Pressable>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {recentUnlocks.map((fishItem) => (
                <FishCard
                  key={fishItem.id}
                  fish={fishItem}
                  state={fishItem.state as any}
                  size="small"
                  onPress={() => router.push(`/fish/${fishItem.id}` as any)}
                  showRarity={true}
                  style={styles.smallFishCard}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="title" style={styles.sectionTitle}>
                最新成就
              </ThemedText>
              <Pressable onPress={() => router.push('/achievements')}>
                <ThemedText type="bodySmall" style={{ color: theme.colors.primary }}>
                  查看全部
                </ThemedText>
              </Pressable>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {recentAchievements.map(({ achievement, progress }) => (
                <Badge
                  key={achievement.id}
                  achievement={achievement}
                  tier={progress?.tier || null}
                  size="medium"
                  isLocked={false}
                  onPress={() => router.push('/achievements')}
                  showTitle={true}
                  style={styles.achievementBadge}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Progress Overview */}
        <View style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            图鉴进度
          </ThemedText>
          
          <ThemedView type="card" style={[styles.progressCard, theme.shadows.sm]}>
            <View style={styles.progressHeader}>
              <ThemedText type="subtitle">
                已解锁鱼类
              </ThemedText>
              <ThemedText type="bodySmall" style={{ color: theme.colors.textSecondary }}>
                {userStats.uniqueSpecies} / {fish.length}
              </ThemedText>
            </View>
            
            <ProgressBar
              progress={fish.length > 0 ? userStats.uniqueSpecies / fish.length : 0}
              height={8}
              color={theme.colors.primary}
              animated={true}
              style={styles.progressBar}
            />
            
            <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
              {fish.length > 0 
                ? `完成度 ${Math.round((userStats.uniqueSpecies / fish.length) * 100)}%`
                : '暂无数据'
              }
            </ThemedText>
          </ThemedView>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    marginBottom: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  quickActions: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: 4,
    gap: 12,
  },
  smallFishCard: {
    width: 140,
  },
  achievementBadge: {
    width: 100,
  },
  progressCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBar: {
    marginVertical: 4,
  },
});
