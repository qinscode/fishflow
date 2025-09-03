import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView, SlideInView } from '@/components/animations';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Badge } from '@/components/ui/Badge';
import { HomeFishCard } from '@/components/ui/HomeFishCard';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/hooks/useThemeColor';
import { useTranslation } from '@/lib/i18n';
import {
  useFish,
  useCatches,
  useUserStats,
  useAchievements,
  useUserAchievements,
} from '@/lib/store';
import { getFishCardState } from '@/lib/utils';

export default function HomeScreen() {
  const theme = useTheme();
  const { isTablet } = useResponsive();
  const { t } = useTranslation();

  const fish = useFish();
  const catches = useCatches();
  const userStats = useUserStats();
  const achievements = useAchievements();
  const userAchievements = useUserAchievements();

  // Data is initialized in root layout, no need for component-level initialization

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
        const userProgress = userAchievements.find(
          ua => ua.achievementId === a.id
        );
        return { achievement: a, progress: userProgress };
      })
      .filter(a => a.progress?.tier !== null)
      .slice(0, 3);
  }, [achievements, userAchievements]);

  const quickActions = [
    {
      id: 'log-catch',
      title: t('home.quick.log'),
      description: t('log.subtitle'),
      icon: 'plus.circle.fill' as const,
      color: theme.colors.primary,
      onPress: () => router.push('/log'),
    },
    {
      id: 'equipment',
      title: t('home.quick.equipment'),
      description: t('equipment.subtitle'),
      icon: 'wrench.and.screwdriver.fill' as const,
      color: theme.colors.secondary,
      onPress: () => router.push('/equipment'),
    },
    {
      id: 'fishdex',
      title: t('home.quick.fishdex'),
      description: t('fishdex.subtitle'),
      icon: 'book.fill' as const,
      color: theme.colors.accent,
      onPress: () => router.push('/fishdex'),
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <FadeInView delay={0}>
          <ThemedView style={styles.header}>
            <View>
              <ThemedText type="h2" style={styles.greeting}>
                {t('home.welcome')}
              </ThemedText>
              <ThemedText
                type="body"
                style={{ color: theme.colors.textSecondary }}
              >
                {t('home.subtitle')}
              </ThemedText>
            </View>

            <Pressable
              style={[
                styles.profileButton,
                { backgroundColor: theme.colors.surface },
              ]}
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
                <ThemedText
                  type="bodySmall"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {t('home.stats.catches')}
                </ThemedText>
              </View>

              <View style={styles.statItem}>
                <ThemedText type="h3" style={{ color: theme.colors.secondary }}>
                  {userStats.uniqueSpecies}
                </ThemedText>
                <ThemedText
                  type="bodySmall"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {t('home.stats.species')}
                </ThemedText>
              </View>

              <View style={styles.statItem}>
                <ThemedText type="h3" style={{ color: theme.colors.accent }}>
                  {userStats.currentStreak}
                </ThemedText>
                <ThemedText
                  type="bodySmall"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {t('home.stats.days')}
                </ThemedText>
              </View>
            </View>
          </ThemedView>
        </SlideInView>

        {/* Recent Unlocks */}
        {recentUnlocks.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="title" style={styles.sectionTitle}>
              {t('home.recent.unlocks')}
            </ThemedText>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {recentUnlocks.map(fishItem => (
                <HomeFishCard
                  key={fishItem.id}
                  fish={fishItem}
                  onPress={() => router.push(`/fish/${fishItem.id}` as any)}
                  style={styles.smallFishCard}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="title" style={styles.sectionTitle}>
              {t('home.recent.achievements')}
            </ThemedText>

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

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            {t('home.quick.actions')}
          </ThemedText>

          <View style={styles.quickActions}>
            {quickActions.map(action => (
              <SlideInView key={action.id} direction="up" delay={300}>
                <Pressable
                  style={[
                    styles.actionCard,
                    { backgroundColor: theme.colors.surface },
                    theme.shadows.sm,
                  ]}
                  onPress={action.onPress}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: `${action.color}20` },
                    ]}
                  >
                    <IconSymbol
                      name={action.icon}
                      size={24}
                      color={action.color}
                    />
                  </View>

                  <View style={styles.actionContent}>
                    <ThemedText type="body" style={styles.actionTitle}>
                      {action.title}
                    </ThemedText>
                    <ThemedText
                      type="bodySmall"
                      style={{ color: theme.colors.textSecondary }}
                    >
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

        {/* Progress Overview */}
        <View style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            {t('home.progress.fishdex')}
          </ThemedText>

          <ThemedView
            type="card"
            style={[styles.progressCard, theme.shadows.sm]}
          >
            <View style={styles.progressHeader}>
              <ThemedText type="subtitle">
                {t('home.progress.unlocked.fish')}
              </ThemedText>
              <ThemedText
                type="bodySmall"
                style={{ color: theme.colors.textSecondary }}
              >
                {userStats.uniqueSpecies} / {fish.length}
              </ThemedText>
            </View>

            <ProgressBar
              progress={
                fish.length > 0 ? userStats.uniqueSpecies / fish.length : 0
              }
              height={8}
              color={theme.colors.primary}
              animated={true}
              style={styles.progressBar}
            />

            <ThemedText
              type="caption"
              style={{ color: theme.colors.textSecondary }}
            >
              {fish.length > 0
                ? `${t('home.progress.completion')} ${Math.round((userStats.uniqueSpecies / fish.length) * 100)}%`
                : t('home.progress.no.data')}
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
    paddingBottom: 100, // Increased padding for tab bar
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
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 20,
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
