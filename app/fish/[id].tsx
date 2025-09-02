import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  StatusBar,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Badge } from '@/components/ui/Badge';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/hooks/useThemeColor';
import { useTranslation } from '@/lib/i18n';
import { RARITY_COLORS, WATER_TYPE_NAMES, DIFFICULTY_NAMES } from '@/lib/constants';
import { useFish, useCatches, useUserStats } from '@/lib/store';
import { Fish, FishCardState } from '@/lib/types';
import { getFishImage } from '@/lib/fishImages';
import { getFishCardState } from '@/lib/utils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function FishDetailScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isTablet } = useResponsive();
  const params = useLocalSearchParams<{ id: string }>();
  const fishId = params.id;
  
  const fish = useFish();
  const catches = useCatches();
  const userStats = useUserStats();
  
  const currentFish = fish.find(f => f.id === fishId);
  const currentIndex = fish.findIndex(f => f.id === fishId);
  const fishState: FishCardState = currentFish ? getFishCardState(currentFish, catches) : 'locked';
  const isUnlocked = fishState === 'unlocked' || fishState === 'new';
  

  if (!currentFish) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={64} color={theme.colors.textSecondary} />
          <ThemedText type="h3" style={styles.errorTitle}>{t('fish.detail.not.found.title')}</ThemedText>
          <ThemedText style={styles.errorDescription}>
            {t('fish.detail.not.found.description')}
          </ThemedText>
          <Pressable 
            style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <ThemedText style={[styles.backButtonText, { color: 'white' }]}>
              {t('common.back')}
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const rarityColor = RARITY_COLORS[currentFish.rarity];
  const rarityGradient = [rarityColor + '15', rarityColor + '05'];

  const userCatches = catches.filter(c => c.fishId === currentFish.id);
  const bestCatch = userCatches.reduce((best, current) => {
    const currentWeight = current.measurements.weightKg || 0;
    const bestWeight = best?.measurements.weightKg || 0;
    return currentWeight > bestWeight ? current : best;
  }, userCatches[0]);

  // 动画值
  const bubble1Scale = useSharedValue(1);
  const bubble2Scale = useSharedValue(1);
  const bubble3Scale = useSharedValue(1);
  const bubble1Opacity = useSharedValue(1);
  const bubble2Opacity = useSharedValue(1);
  const bubble3Opacity = useSharedValue(1);
  
  // 启动动画
  useEffect(() => {
    // 缩放动画
    bubble1Scale.value = withRepeat(
      withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bubble2Scale.value = withDelay(500, withRepeat(
      withTiming(1.15, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    ));
    bubble3Scale.value = withDelay(1000, withRepeat(
      withTiming(1.1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    ));
    
    // 透明度动画
    bubble1Opacity.value = withRepeat(
      withTiming(0.3, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bubble2Opacity.value = withDelay(800, withRepeat(
      withTiming(0.4, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    ));
    bubble3Opacity.value = withDelay(1200, withRepeat(
      withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    ));
  }, []);

  // 动画样式
  const animatedBubble1Style = useAnimatedStyle(() => ({
    transform: [{ scale: bubble1Scale.value }],
    opacity: bubble1Opacity.value,
  }));

  const animatedBubble2Style = useAnimatedStyle(() => ({
    transform: [{ scale: bubble2Scale.value }],
    opacity: bubble2Opacity.value,
  }));

  const animatedBubble3Style = useAnimatedStyle(() => ({
    transform: [{ scale: bubble3Scale.value }],
    opacity: bubble3Opacity.value,
  }));


  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={[rarityColor + '35', rarityColor + '25', rarityColor + '10']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        {/* 装饰性元素 - 丰富的泡泡效果 */}
        <View style={styles.decorativeLines}>
          {/* 几何图形 - 统一规整 */}
          <Animated.View style={[styles.geometryCircle, { backgroundColor: rarityColor + '15' }, animatedBubble1Style]} />
          <Animated.View style={[styles.geometryCircle2, { backgroundColor: rarityColor + '12' }, animatedBubble2Style]} />
          
          {/* 主要气泡组 - 右侧 */}
          <Animated.View style={[styles.rhythmBubble1, { backgroundColor: rarityColor + '20' }, animatedBubble3Style]} />
          <Animated.View style={[styles.rhythmBubble2, { backgroundColor: rarityColor + '15' }, animatedBubble1Style]} />
          <Animated.View style={[styles.rhythmBubble3, { backgroundColor: rarityColor + '10' }, animatedBubble2Style]} />
          
          {/* 左侧气泡组 */}
          <Animated.View style={[styles.leftBubble1, { backgroundColor: rarityColor + '18' }, animatedBubble2Style]} />
          <Animated.View style={[styles.leftBubble2, { backgroundColor: rarityColor + '12' }, animatedBubble3Style]} />
          <Animated.View style={[styles.leftBubble3, { backgroundColor: rarityColor + '08' }, animatedBubble1Style]} />
          
          {/* 散布的小气泡 */}
          <Animated.View style={[styles.smallBubble1, { backgroundColor: rarityColor + '15' }, animatedBubble1Style]} />
          <Animated.View style={[styles.smallBubble2, { backgroundColor: rarityColor + '12' }, animatedBubble3Style]} />
          <Animated.View style={[styles.smallBubble3, { backgroundColor: rarityColor + '10' }, animatedBubble2Style]} />
          <Animated.View style={[styles.smallBubble4, { backgroundColor: rarityColor + '14' }, animatedBubble1Style]} />
          <Animated.View style={[styles.smallBubble5, { backgroundColor: rarityColor + '08' }, animatedBubble3Style]} />
          
          {/* 微小气泡点缀 */}
          <Animated.View style={[styles.tinyBubble1, { backgroundColor: rarityColor + '12' }, animatedBubble2Style]} />
          <Animated.View style={[styles.tinyBubble2, { backgroundColor: rarityColor + '10' }, animatedBubble1Style]} />
          <Animated.View style={[styles.tinyBubble3, { backgroundColor: rarityColor + '08' }, animatedBubble3Style]} />
          <Animated.View style={[styles.tinyBubble4, { backgroundColor: rarityColor + '06' }, animatedBubble2Style]} />
        </View>
        
        <View style={styles.headerContent}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={theme.colors.text} />
          </Pressable>
          
          <View style={styles.headerTitleContainer}>
            <ThemedText type="h2" style={styles.fishName}>
              {currentFish.name}
            </ThemedText>
            <ThemedText style={[styles.fishNumber, { color: theme.colors.textSecondary }]}>
              #{(currentIndex + 1).toString().padStart(1, '0')} • {currentIndex + 1}/{fish.length}
            </ThemedText>
          </View>
          
          {!isUnlocked && (
            <View style={[styles.statusBadge, { backgroundColor: theme.colors.textSecondary + '20' }]}>
              <ThemedText style={[styles.statusText, { color: theme.colors.textSecondary }]}>
                {t('fish.detail.unknown')}
              </ThemedText>
            </View>
          )}
        </View>
        
        <View style={styles.fishImageContainer}>
          <View style={styles.fishImageWrapper}>
            <View style={styles.fishImagePlaceholder}>
              {getFishImage(currentFish.id) ? (
                <Image
                  source={getFishImage(currentFish.id)}
                  style={styles.fishImage}
                  contentFit="contain"
                />
              ) : (
                <View>
                  <IconSymbol name="fish" size={120} color={rarityColor} />
                  <ThemedText style={{ fontSize: 10, textAlign: 'center', marginTop: 4, color: theme.colors.textSecondary }}>
                    {t('fish.detail.image.id')}: {currentFish.id}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );

  const renderBasicInfo = () => (
    <ThemedView type="card" style={[styles.infoCard, theme.shadows.md]}>
      <View style={styles.cardHeader}>
        <ThemedText type="title" style={styles.cardTitle}>{t('fish.detail.basic.info')}</ThemedText>
        <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
          <ThemedText style={[styles.rarityText, { color: rarityColor }]}>
            {currentFish.rarity.toUpperCase()}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.leftAlignedInfoList}>
        <View style={styles.leftAlignedInfoRow}>
          <IconSymbol name="text.book.closed" size={16} color="#8B5CF6" />
          <ThemedText style={styles.leftAlignedLabel}>{t('fish.detail.scientific.name')}：</ThemedText>
          <ThemedText style={styles.leftAlignedValue}>{currentFish.scientificName}</ThemedText>
        </View>
        
        <View style={styles.leftAlignedInfoRow}>
          <IconSymbol name="tree" size={16} color="#059669" />
          <ThemedText style={styles.leftAlignedLabel}>{t('fish.detail.family')}：</ThemedText>
          <ThemedText style={styles.leftAlignedValue}>{currentFish.family}</ThemedText>
        </View>
        
        <View style={styles.leftAlignedInfoRow}>
          <IconSymbol name="location" size={16} color="#DC2626" />
          <ThemedText style={styles.leftAlignedLabel}>{t('fish.detail.local.names')}：</ThemedText>
          <ThemedText style={styles.leftAlignedValue}>
            {currentFish.localNames?.join('、') || t('common.none')}
          </ThemedText>
        </View>
      </View>
      
      {!isUnlocked && (
        <View style={[styles.unlockStatus, { backgroundColor: '#FFF3CD', borderColor: '#FFE69C' }]}>
          <IconSymbol name="exclamationmark.triangle" size={16} color="#856404" />
          <ThemedText style={[styles.unlockText, { color: '#856404' }]}>
            {t('fish.detail.unlock.message')}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );

  const renderStats = () => (
    <ThemedView type="card" style={[styles.infoCard, theme.shadows.md]}>
      <View style={styles.cardHeader}>
        <ThemedText type="title" style={styles.cardTitle}>{t('fish.detail.stats')}</ThemedText>
      </View>
      
      <View style={styles.twoColumnStatsList}>
        {/* 第一列 */}
        <View style={styles.statsColumn}>
          <View style={styles.leftAlignedStatRow}>
            <IconSymbol name="ruler" size={18} color="#3B82F6" />
            <ThemedText style={styles.leftAlignedStatLabel}>{t('fish.detail.length')}</ThemedText>
            <ThemedText style={styles.leftAlignedStatValue}>
              {currentFish.characteristics.minLengthCm}-{currentFish.characteristics.maxLengthCm}cm
            </ThemedText>
          </View>
          
          <View style={styles.leftAlignedStatRow}>
            <IconSymbol name="clock" size={18} color="#F59E0B" />
            <ThemedText style={styles.leftAlignedStatLabel}>{t('fish.detail.lifespan')}</ThemedText>
            <ThemedText style={styles.leftAlignedStatValue}>
              {currentFish.characteristics.lifespan}{t('fish.detail.years')}
            </ThemedText>
          </View>
        </View>
        
        {/* 第二列 */}
        <View style={styles.statsColumn}>
          <View style={styles.leftAlignedStatRow}>
            <IconSymbol name="scalemass" size={18} color="#10B981" />
            <ThemedText style={styles.leftAlignedStatLabel}>{t('fish.detail.weight')}</ThemedText>
            <ThemedText style={styles.leftAlignedStatValue}>
              {t('fish.detail.max.weight')} {currentFish.characteristics.maxWeightKg}kg
            </ThemedText>
          </View>
          
          <View style={styles.leftAlignedStatRow}>
            <IconSymbol name="target" size={18} color="#EF4444" />
            <ThemedText style={styles.leftAlignedStatLabel}>{t('fish.detail.difficulty')}</ThemedText>
            <View style={styles.difficultyRow}>
              <ProgressBar
                progress={currentFish.behavior.difficulty / 5}
                height={6}
                color="#FF9500"
                backgroundColor="#F2F2F7"
                style={styles.inlineDifficultyBar}
              />
              <ThemedText style={styles.inlineDifficultyText}>
                {DIFFICULTY_NAMES[currentFish.behavior.difficulty] || currentFish.behavior.difficulty}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </ThemedView>
  );

  const renderHabitat = () => (
    <ThemedView type="card" style={[styles.infoCard, theme.shadows.md]}>
      <View style={styles.cardHeader}>
        <ThemedText type="title" style={styles.cardTitle}>{t('fish.detail.habitat')}</ThemedText>
      </View>
      
      <View style={styles.compactHabitatInfo}>
        <View style={styles.compactHabitatRow}>
          <ThemedText style={styles.compactHabitatLabel}>{t('fish.detail.water.types')}：</ThemedText>
          <View style={styles.compactTagContainer}>
            {currentFish.habitat.waterTypes?.filter(type => type).map((type, index) => (
              <View key={index} style={[styles.compactTag, { backgroundColor: theme.colors.primary + '20' }]}>
                <ThemedText style={[styles.compactTagText, { color: theme.colors.primary }]}>
                  {WATER_TYPE_NAMES[type] || type || t('common.unknown')}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.compactHabitatRow}>
          <ThemedText style={styles.compactHabitatLabel}>{t('fish.detail.regions')}：</ThemedText>
          <View style={styles.compactTagContainer}>
            {currentFish.habitat.regions.map((region, index) => {
              // 使用与法规信息相同的颜色系统
              const stateColors = [
                theme.colors.primary,
                '#10B981',
                '#F59E0B', 
                '#EF4444',
                '#8B5CF6',
              ];
              const stateColor = stateColors[index % stateColors.length];
              
              return (
                <View key={index} style={[styles.compactTag, { backgroundColor: stateColor + '20' }]}>
                  <ThemedText style={[styles.compactTagText, { color: stateColor }]}>
                    {region}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>
        
        <View style={styles.compactHabitatRow}>
          <ThemedText style={styles.compactHabitatLabel}>{t('fish.detail.seasons')}：</ThemedText>
          <View style={styles.compactTagContainer}>
            {currentFish.habitat.seasons.map((month, index) => (
              <View key={index} style={[styles.compactTag, { backgroundColor: theme.colors.accent + '20' }]}>
                <ThemedText style={[styles.compactTagText, { color: theme.colors.accent }]}>
                  {month}{t('fish.detail.month')}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ThemedView>
  );

  const renderRegulations = () => {
    if (!currentFish.regulations || currentFish.regulations.length === 0) {return null;}
    
    // 为不同州分配不同颜色
    const stateColors = [
      { bg: theme.colors.primary + '15', text: theme.colors.primary },
      { bg: '#10B981' + '15', text: '#10B981' },
      { bg: '#F59E0B' + '15', text: '#F59E0B' },
      { bg: '#EF4444' + '15', text: '#EF4444' },
      { bg: '#8B5CF6' + '15', text: '#8B5CF6' },
    ];
    
    return (
      <ThemedView type="card" style={[styles.infoCard, theme.shadows.md]}>
        <View style={styles.cardHeader}>
          <ThemedText type="title" style={styles.cardTitle}>{t('fish.detail.regulations')}</ThemedText>
        </View>
        
        <View style={styles.regulationsGrid}>
          {currentFish.regulations.map((regulation, index) => {
            const stateColor = stateColors[index % stateColors.length];
            return (
              <View key={index} style={styles.regulationColumn}>
                <View style={styles.regulationHeader}>
                  <View style={[styles.regionBadge, { backgroundColor: stateColor.bg }]}>
                    <ThemedText style={[styles.regionBadgeText, { color: stateColor.text }]}>
                      {regulation.region}
                    </ThemedText>
                  </View>
                </View>
                
                <View style={styles.regulationContent}>
                  <View style={styles.regulationItemsGrid}>
                    {regulation.minSizeCm && (
                      <View style={styles.regulationGridItem}>
                        <View style={styles.regulationRow}>
                          <IconSymbol name="ruler" size={14} color="#3B82F6" />
                          <View style={styles.regulationTextContainer}>
                            <ThemedText style={styles.regulationLabel}>{t('fish.detail.min.size')}</ThemedText>
                            <ThemedText style={styles.regulationValue}>{regulation.minSizeCm}cm</ThemedText>
                          </View>
                        </View>
                      </View>
                    )}
                    
                    {regulation.dailyLimit && (
                      <View style={styles.regulationGridItem}>
                        <View style={styles.regulationRow}>
                          <IconSymbol name="clock.badge" size={14} color="#10B981" />
                          <View style={styles.regulationTextContainer}>
                            <ThemedText style={styles.regulationLabel}>{t('fish.detail.daily.limit')}</ThemedText>
                            <ThemedText style={styles.regulationValue}>{regulation.dailyLimit}{t('fish.detail.fish.count')}</ThemedText>
                          </View>
                        </View>
                      </View>
                    )}
                    
                    {regulation.closedSeasons && regulation.closedSeasons.length > 0 && (
                      <View style={styles.regulationGridItem}>
                        <View style={styles.regulationRow}>
                          <IconSymbol name="calendar" size={14} color="#F59E0B" />
                          <View style={styles.regulationTextContainer}>
                            <ThemedText style={styles.regulationLabel}>{t('fish.detail.closed.seasons')}</ThemedText>
                            <ThemedText style={styles.regulationValue}>
                              {regulation.closedSeasons.map(season => 
                                `${season.start}-${season.end}`
                              ).join(', ')}
                            </ThemedText>
                          </View>
                        </View>
                      </View>
                    )}
                    
                    {regulation.specialRules && regulation.specialRules.length > 0 && (
                      <View style={styles.regulationGridItem}>
                        <View style={styles.regulationRow}>
                          <IconSymbol name="exclamationmark.triangle" size={14} color="#EF4444" />
                          <View style={styles.regulationTextContainer}>
                            <ThemedText style={styles.regulationLabel}>{t('fish.detail.special.rules')}</ThemedText>
                            <ThemedText style={styles.regulationValue}>
                              {regulation.specialRules.join(', ')}
                            </ThemedText>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ThemedView>
    );
  };

  const renderPersonalRecord = () => {
    if (!isUnlocked || userCatches.length === 0) {return null;}
    
    return (
      <ThemedView type="card" style={[styles.infoCard, theme.shadows.md]}>
        <View style={styles.cardHeader}>
          <ThemedText type="title" style={styles.cardTitle}>{t('fish.detail.personal.record')}</ThemedText>
          <ThemedText style={styles.recordCount}>{t('fish.detail.caught.times', { count: userCatches.length.toString() })}</ThemedText>
        </View>
        
        {bestCatch && (
          <View style={styles.recordInfo}>
            <View style={styles.recordRow}>
              <ThemedText style={styles.recordLabel}>{t('fish.detail.best.record')}：</ThemedText>
              <ThemedText style={styles.recordValue}>
                {bestCatch.measurements.lengthCm ? `${bestCatch.measurements.lengthCm}cm` : ''} 
                {bestCatch.measurements.weightKg ? ` ${bestCatch.measurements.weightKg}kg` : ''}
              </ThemedText>
            </View>
            <View style={styles.recordRow}>
              <ThemedText style={styles.recordLabel}>{t('fish.detail.catch.time')}：</ThemedText>
              <ThemedText style={styles.recordValue}>
                {new Date(bestCatch.timestamp).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>
        )}
      </ThemedView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        
        <View style={styles.content}>
          {renderBasicInfo()}
          {renderStats()}
          {renderHabitat()}
          {renderRegulations()}
          {renderPersonalRecord()}
        </View>
      </ScrollView>
      
      {/* 右下角圆形记录按钮 */}
      <View style={styles.circularButtonContainer}>
        <Pressable 
          style={[styles.circularLogButton, { 
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
          }]}
          onPress={() => router.push(`/log?fishId=${currentFish.id}&fishName=${encodeURIComponent(currentFish.name)}`)}
        >
          <IconSymbol name="pencil" size={20} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    position: 'relative',
    paddingBottom: 60,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  // 几何图形 - 统一规整
  geometryCircle: {
    position: 'absolute',
    top: 70,
    right: 60,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  geometryCircle2: {
    position: 'absolute',
    bottom: 140,
    left: 25,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  // 主要气泡组 - 右侧
  rhythmBubble1: {
    position: 'absolute',
    top: 110,
    right: 40,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  rhythmBubble2: {
    position: 'absolute',
    top: 135,
    right: 55,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rhythmBubble3: {
    position: 'absolute',
    top: 155,
    right: 45,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // 左侧气泡组
  leftBubble1: {
    position: 'absolute',
    top: 140,
    left: 50,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  leftBubble2: {
    position: 'absolute',
    top: 165,
    left: 35,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  leftBubble3: {
    position: 'absolute',
    top: 185,
    left: 45,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // 散布的小气泡
  smallBubble1: {
    position: 'absolute',
    top: 100,
    left: 80,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  smallBubble2: {
    position: 'absolute',
    top: 180,
    right: 100,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  smallBubble3: {
    position: 'absolute',
    bottom: 160,
    left: 70,
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  smallBubble4: {
    position: 'absolute',
    bottom: 180,
    right: 80,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  smallBubble5: {
    position: 'absolute',
    top: 120,
    left: 120,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // 微小气泡点缀
  tinyBubble1: {
    position: 'absolute',
    top: 90,
    left: 100,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  tinyBubble2: {
    position: 'absolute',
    top: 200,
    right: 120,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  tinyBubble3: {
    position: 'absolute',
    bottom: 200,
    left: 90,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  tinyBubble4: {
    position: 'absolute',
    bottom: 170,
    right: 110,
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  headerSafeArea: {
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    position: 'relative',
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 右下角圆形按钮样式
  circularButtonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
  },
  circularLogButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    position: 'absolute',
    right: 0,
    top: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  fishName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  fishNumber: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  fishImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 10,
  },
  fishImageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fishImage: {
    width: 280,
    height: 170,
  },
  fishImagePlaceholder: {
    width: 290,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: -40,
  },
  infoCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 18,
  },
  rarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },
  // 新的紧凑布局样式
  compactInfoList: {
    gap: 10,
  },
  compactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  compactInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  compactLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#374151',
  },
  compactValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
  },
  compactStatsList: {
    gap: 10,
  },
  compactStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  compactStatValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
  },
  compactDifficultyContainer: {
    alignItems: 'flex-end',
    gap: 4,
    minWidth: 80,
  },
  compactDifficultyBar: {
    width: 60,
  },
  compactDifficultyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  // 栖息环境紧凑样式
  compactHabitatInfo: {
    gap: 8,
  },
  compactHabitatRow: {
    gap: 6,
    marginBottom: 4,
  },
  compactHabitatLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#374151',
    marginBottom: 4,
  },
  compactTagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  compactTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  compactTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  // 基本信息左对齐样式
  leftAlignedInfoList: {
    gap: 10,
  },
  leftAlignedInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  leftAlignedLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#374151',
    minWidth: 50,
  },
  leftAlignedValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  // 两列布局样式
  twoColumnStatsList: {
    flexDirection: 'row',
    gap: 12,
  },
  statsColumn: {
    flex: 1,
    gap: 14,
  },
  // 两列统计行样式
  twoColumnStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
  },
  difficultyRight: {
    alignItems: 'flex-end',
    gap: 2,
    flex: 1,
  },
  twoColumnDifficultyBar: {
    width: 50,
  },
  twoColumnDifficultyText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  // 左对齐属性数据样式
  leftAlignedStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 8,
  },
  leftAlignedStatLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    minWidth: 40,
  },
  leftAlignedStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  // 难度进度条行内样式
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  inlineDifficultyBar: {
    width: 60,
  },
  inlineDifficultyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  unlockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
    borderWidth: 1,
  },
  unlockText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsList: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  statLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statLabelText: {
    fontSize: 16,
    fontWeight: '400',
  },
  statValue: {
    alignItems: 'flex-end',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  difficultyContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  difficultyBar: {
    width: 80,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  habitatInfo: {
    gap: 12,
  },
  habitatRow: {
    gap: 8,
  },
  habitatLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recordCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  recordInfo: {
    gap: 8,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  recordValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  regulationItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  regulationHeader: {
    marginBottom: 6,
  },
  regionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  regulationContent: {
    gap: 4,
  },
  regulationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  regulationText: {
    fontSize: 13,
    lineHeight: 18,
  },
  // 优化后的法规样式 - 2列布局
  regulationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  regulationColumn: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
  },
  regulationCard: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  regionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  regionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  regulationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 3,
  },
  regulationTextContainer: {
    flex: 1,
  },
  regulationLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  regulationValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 1,
  },
  // 法规信息内部2列网格
  regulationItemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  regulationGridItem: {
    flex: 1,
    minWidth: '45%',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    textAlign: 'center',
  },
  errorDescription: {
    textAlign: 'center',
    opacity: 0.7,
  },
});