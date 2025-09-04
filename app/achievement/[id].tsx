import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInUp,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView } from '@/components/animations';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTheme } from '@/hooks/useThemeColor';
import { getAchievementName, getAchievementDescription } from '@/lib/achievementHelpers';
import { useTranslation } from '@/lib/i18n';
import {
  useAchievements,
  useUserAchievements,
} from '@/lib/store';
import { AchievementTier } from '@/lib/types';

const { width } = Dimensions.get('window');

export default function AchievementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { t } = useTranslation();
  
  const achievements = useAchievements();
  const userAchievements = useUserAchievements();
  
  const achievement = useMemo(() => 
    achievements.find(a => a.id === id), [achievements, id]
  );
  
  const userAchievement = useMemo(() => 
    userAchievements.find(ua => ua.achievementId === id), [userAchievements, id]
  );
  
  if (!achievement) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ThemedView style={styles.errorContainer}>
          <MaterialCommunityIcons 
            name="trophy-broken" 
            size={48} 
            color={theme.colors.textSecondary} 
          />
          <ThemedText type="title" style={{ color: theme.colors.textSecondary }}>
            {t('achievement.detail.not.found')}
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }
  
  const isLocked = !userAchievement || userAchievement.tier === null;
  const currentTier = userAchievement?.tier || null;
  const progress = userAchievement?.progress || 0;
  
  const renderTierCard = (tier: AchievementTier, index: number) => {
    const requirement = achievement.tiers[tier].requirement;
    const reward = achievement.tiers[tier].reward;
    const isCompleted = currentTier && (
      (tier === 'bronze') ||
      (tier === 'silver' && (currentTier === 'silver' || currentTier === 'gold')) ||
      (tier === 'gold' && currentTier === 'gold')
    );
    const isCurrentTarget = !isCompleted && (
      (tier === 'bronze' && !currentTier) ||
      (tier === 'silver' && currentTier === 'bronze') ||
      (tier === 'gold' && currentTier === 'silver')
    );
    
    const tierColors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0', 
      gold: '#FFD700'
    };
    
    return (
      <Animated.View
        key={tier}
        entering={SlideInUp.delay(index * 150).springify()}
        style={[
          styles.tierCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isCompleted ? tierColors[tier] : theme.colors.border,
            borderWidth: isCompleted ? 2 : 1,
            opacity: isCompleted ? 1 : isCurrentTarget ? 0.9 : 0.6,
          },
          theme.shadows.sm
        ]}
      >
        {/* Tier Header */}
        <View style={styles.tierHeader}>
          <View style={[styles.tierBadge, { backgroundColor: tierColors[tier] + '20' }]}>
            <MaterialCommunityIcons
              name={tier === 'gold' ? 'trophy' : tier === 'silver' ? 'medal' : 'circle'}
              size={20}
              color={tierColors[tier]}
            />
            <ThemedText
              type="body"
              style={[styles.tierTitle, { color: tierColors[tier] }]}
            >
              {t(`achievements.tier.${tier}`)}
            </ThemedText>
          </View>
          
          {isCompleted && (
            <Animated.View entering={ZoomIn.springify()}>
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={theme.colors.success}
              />
            </Animated.View>
          )}
        </View>
        
        {/* Requirements */}
        <View style={styles.requirementSection}>
          <ThemedText type="body" style={styles.requirementLabel}>
            {t('achievement.detail.requirement')}:
          </ThemedText>
          <ThemedText type="subtitle" style={{ color: theme.colors.primary }}>
            {requirement}
          </ThemedText>
        </View>
        
        {/* Progress for current target */}
        {isCurrentTarget && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <ThemedText type="bodySmall" style={{ color: theme.colors.textSecondary }}>
                {t('achievement.detail.progress')}
              </ThemedText>
              <ThemedText type="bodySmall" style={{ color: theme.colors.primary }}>
                {progress}/{requirement}
              </ThemedText>
            </View>
            <ProgressBar
              progress={Math.min(progress / requirement, 1)}
              height={6}
              color={tierColors[tier]}
              animated={true}
            />
          </View>
        )}
        
        {/* Reward */}
        {reward && (
          <View style={styles.rewardSection}>
            <ThemedText type="bodySmall" style={{ color: theme.colors.textSecondary }}>
              {t('achievement.detail.reward')}: {reward}
            </ThemedText>
          </View>
        )}
      </Animated.View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with back button */}
      <Animated.View
        entering={FadeIn}
        style={[styles.header, { borderBottomColor: theme.colors.border }]}
      >
        <Pressable
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.text}
          />
        </Pressable>
        
        <ThemedText type="title" style={styles.headerTitle}>
          {t('achievement.detail.title')}
        </ThemedText>
        
        <View style={styles.headerSpacer} />
      </Animated.View>
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Achievement Hero Section */}
        <FadeInView delay={200}>
          <ThemedView type="card" style={[styles.heroCard, theme.shadows.lg]}>
            {/* Large Badge */}
            <View style={styles.heroBadge}>
              <Badge
                achievement={achievement}
                tier={currentTier}
                size="large"
                isLocked={isLocked}
                progress={currentTier ? 1 : progress / achievement.tiers.bronze.requirement}
                showProgress={isLocked}
                showTitle={false}
              />
            </View>
            
            {/* Achievement Info */}
            <View style={styles.heroInfo}>
              <ThemedText type="h2" style={styles.achievementName}>
                {getAchievementName(achievement)}
              </ThemedText>
              
              <ThemedText 
                type="body" 
                style={[styles.achievementDescription, { color: theme.colors.textSecondary }]}
              >
                {getAchievementDescription(achievement)}
              </ThemedText>
              
              {/* Status Badge */}
              <View style={[
                styles.statusBadge,
                {
                  backgroundColor: isLocked 
                    ? theme.colors.surface 
                    : theme.colors.success + '20'
                }
              ]}>
                <MaterialCommunityIcons
                  name={isLocked ? "lock" : "check-circle"}
                  size={16}
                  color={isLocked ? theme.colors.textSecondary : theme.colors.success}
                />
                <ThemedText
                  type="bodySmall"
                  style={{
                    color: isLocked ? theme.colors.textSecondary : theme.colors.success,
                    fontWeight: '600'
                  }}
                >
                  {isLocked ? t('achievement.detail.locked') : currentTier ? `${t('achievement.detail.unlocked')} - ${t(`achievements.tier.${currentTier}` as any)}` : t('achievement.detail.locked')}
                </ThemedText>
              </View>
              
              {userAchievement?.unlockedAt && (
                <ThemedText type="bodySmall" style={{ color: theme.colors.textSecondary }}>
                  {t('achievement.detail.unlocked.on')} {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                </ThemedText>
              )}
            </View>
          </ThemedView>
        </FadeInView>
        
        {/* Achievement Tiers */}
        <FadeInView delay={400}>
          <View style={styles.tiersSection}>
            <ThemedText type="title" style={styles.sectionTitle}>
              {t('achievement.detail.tiers.title')}
            </ThemedText>
            
            <View style={styles.tiersContainer}>
              {['bronze', 'silver', 'gold'].map((tier, index) => 
                renderTierCard(tier as AchievementTier, index)
              )}
            </View>
          </View>
        </FadeInView>
        
        {/* Category Info */}
        <FadeInView delay={600}>
          <ThemedView type="card" style={[styles.infoCard, theme.shadows.sm]}>
            <View style={styles.infoRow}>
              <ThemedText type="body" style={{ color: theme.colors.textSecondary }}>
                {t('achievement.detail.category')}:
              </ThemedText>
              <View style={[styles.categoryBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <ThemedText type="body" style={{ color: theme.colors.primary }}>
                  {t(`achievements.category.${achievement.category}` as any)}
                </ThemedText>
              </View>
            </View>
            
            {achievement.isHidden && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="eye-off"
                  size={16}
                  color={theme.colors.textSecondary}
                />
                <ThemedText type="bodySmall" style={{ color: theme.colors.textSecondary }}>
                  {t('achievement.detail.hidden')}
                </ThemedText>
              </View>
            )}
          </ThemedView>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  heroCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  heroBadge: {
    marginBottom: 20,
  },
  heroInfo: {
    alignItems: 'center',
    gap: 12,
  },
  achievementName: {
    textAlign: 'center',
    fontWeight: '700',
  },
  achievementDescription: {
    textAlign: 'center',
    lineHeight: 22,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tiersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  tiersContainer: {
    gap: 12,
  },
  tierCard: {
    padding: 16,
    borderRadius: 12,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tierTitle: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  requirementSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementLabel: {
    color: '#666',
  },
  progressSection: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rewardSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});