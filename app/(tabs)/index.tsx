import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView, SlideInView } from '@/components/animations';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HomeFishCard } from '@/components/ui/HomeFishCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/hooks/useThemeColor';
import { useTranslation } from '@/lib/i18n';
import {
  useFish,
  useCatches,
  useUserStats,
} from '@/lib/store';
import { getFishCardState, formatDate } from '@/lib/utils';

export default function HomeScreen() {
  const theme = useTheme();
  const { isTablet } = useResponsive();
  const { t } = useTranslation();

  const fish = useFish();
  const catches = useCatches();
  const userStats = useUserStats();

  // Data is initialized in root layout, no need for component-level initialization

  // Get recent unlocks (last 3)
  const recentUnlocks = React.useMemo(() => {
    const unlockedFish = fish
      .map(f => ({ ...f, state: getFishCardState(f, catches) }))
      .filter(f => f.state === 'unlocked' || f.state === 'new')
      .slice(0, 3);
    return unlockedFish;
  }, [fish, catches]);


  // Non-skunked catch count for display
  const nonSkunkedCount = React.useMemo(
    () => catches.filter(c => !c.isSkunked).length,
    [catches]
  );

  const quickActions = [
    {
      id: 'log-catch',
      title: t('home.quick.log'),
      description: t('log.subtitle'),
      icon: 'plus' as const,
      color: '#007AFF',
      onPress: () => router.push('/log'),
    },
    {
      id: 'view-logs',
      title: t('home.quick.logs'),
      description: t('logs.subtitle'),
      icon: 'format-list-bulleted' as const,
      color: '#5856D6',
      onPress: () => router.push('/logs'),
    },
    {
      id: 'equipment',
      title: t('home.quick.equipment'),
      description: t('equipment.subtitle'),
      icon: 'wrench' as const,
      color: '#FF9500',
      onPress: () => router.push('/equipment'),
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
              <MaterialCommunityIcons
                name="account-circle"
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
                  {nonSkunkedCount}
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


        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            {t('home.quick.actions')}
          </ThemedText>

          <View style={styles.circularActionsGrid}>
            {quickActions.map(action => (
              <SlideInView key={action.id} direction="up" delay={300}>
                <Pressable
                  style={({ pressed }) => [
                    styles.circularActionCard,
                    {
                      backgroundColor: pressed
                        ? theme.colors.surface
                        : 'transparent',
                      transform: pressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
                    },
                  ]}
                  onPress={action.onPress}
                >
                  <View
                    style={[
                      styles.circularActionIcon,
                      {
                        backgroundColor: action.color,
                        opacity: 0.9,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={action.icon as any}
                      size={28}
                      color="white"
                    />
                  </View>

                  <ThemedText type="bodySmall" style={styles.circularActionTitle}>
                    {action.title}
                  </ThemedText>
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

        {/* Fishing Log */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedText type="title" style={styles.sectionTitle}>
              {t('logs.title')}
            </ThemedText>
            <Pressable onPress={() => router.push('/logs')} style={{ padding: 6 }}>
              <ThemedText type="bodySmall" style={{ color: theme.colors.primary }}>
                {t('logs.view.button')}
              </ThemedText>
            </Pressable>
          </View>

          {catches.length === 0 ? (
            <ThemedView type="card" style={[styles.logCard, theme.shadows.sm]}>
              <Pressable onPress={() => router.push('/log')} style={styles.row}>
                <View style={[styles.icon, { backgroundColor: theme.colors.surface }]}>
                  <MaterialCommunityIcons name="plus" size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.content}>
                  <ThemedText type="body" style={styles.title}>
                    {t('logs.empty.title')}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
                    {t('logs.empty.description')}
                  </ThemedText>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.textSecondary} />
              </Pressable>
            </ThemedView>
          ) : (
            catches
              .slice()
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 5)
              .map(record => {
                const fishItem = fish.find(f => f.id === record.fishId);
                const title = record.isSkunked
                  ? t('logs.item.skunked')
                  : fishItem?.name || t('logs.item.unknown');
                return (
                  <ThemedView key={record.id} type="card" style={[styles.logCard, theme.shadows.sm]}>
                    <Pressable onPress={() => router.push(`/logs/${record.id}` as any)} style={styles.row}>
                      <View style={[styles.icon, { backgroundColor: theme.colors.surface }]}>
                        <MaterialCommunityIcons
                          name={record.isSkunked ? 'emoticon-sad-outline' : 'fish'}
                          size={22}
                          color={record.isSkunked ? theme.colors.textSecondary : theme.colors.primary}
                        />
                      </View>
                      <View style={styles.content}>
                        <ThemedText type="body" style={styles.title}>
                          {title}
                        </ThemedText>
                        <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
                          {formatDate(record.timestamp)}
                          {record.measurements.lengthCm ? ` · ${record.measurements.lengthCm}cm` : ''}
                          {record.measurements.weightKg ? ` · ${record.measurements.weightKg}kg` : ''}
                        </ThemedText>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.textSecondary} />
                    </Pressable>
                  </ThemedView>
                );
              })
          )}
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
    margin: 24,
    marginTop: 16,
    padding: 24,
    borderRadius: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 20,
    color: '#1D1D1F',
  },
  circularActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  circularActionCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    minWidth: 100,
    flex: 1,
    maxWidth: 120,
  },
  circularActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  circularActionTitle: {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 16,
  },
  horizontalList: {
    paddingHorizontal: 4,
    gap: 12,
  },
  smallFishCard: {
    width: 140,
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
  // Fishing Log styles
  logCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
});
