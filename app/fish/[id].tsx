import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import {
  RARITY_COLORS,
  EDIBILITY_COLORS,
  WATER_TYPE_NAMES,
  DIFFICULTY_NAMES,
} from '@/lib/constants';
import { getFishImage } from '@/lib/fishImages';
import { useTranslation } from '@/lib/i18n';
import {
  useFish,
  useCatches,
  useUserStats,
  useFilteredFish,
} from '@/lib/store';
import { Fish, FishCardState } from '@/lib/types';
import { getFishCardState, getColorByEdibility, sortFish } from '@/lib/utils';

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
  const filteredFish = useFilteredFish();
  const [sortBy, setSortBy] = React.useState<'name' | 'edibility' | 'recent'>(
    'name'
  );

  React.useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('fishdex.sortBy');
        if (saved === 'name' || saved === 'edibility' || saved === 'recent') {
          setSortBy(saved);
        }
      } catch {}
    })();
  }, []);

  // 动画值 - 必须在早期返回之前声明
  const bubble1Scale = useSharedValue(1);
  const bubble2Scale = useSharedValue(1);
  const bubble3Scale = useSharedValue(1);
  const bubble1Opacity = useSharedValue(1);
  const bubble2Opacity = useSharedValue(1);
  const bubble3Opacity = useSharedValue(1);

  // 动画样式 - 必须在早期返回之前声明
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

  // 启动动画 - 必须在早期返回之前声明
  useEffect(() => {
    // 缩放动画
    bubble1Scale.value = withRepeat(
      withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bubble2Scale.value = withDelay(
      500,
      withRepeat(
        withTiming(1.15, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
    bubble3Scale.value = withDelay(
      1000,
      withRepeat(
        withTiming(1.1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );

    // 透明度动画
    bubble1Opacity.value = withRepeat(
      withTiming(0.3, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bubble2Opacity.value = withDelay(
      800,
      withRepeat(
        withTiming(0.4, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
    bubble3Opacity.value = withDelay(
      1200,
      withRepeat(
        withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, [
    bubble1Scale,
    bubble2Scale,
    bubble3Scale,
    bubble1Opacity,
    bubble2Opacity,
    bubble3Opacity,
  ]);

  const currentFish = fish.find(f => f.id === fishId);
  const sortedList = React.useMemo(
    () => sortFish(filteredFish, sortBy, catches),
    [filteredFish, sortBy, catches]
  );
  const currentIndex =
    sortedList.findIndex(f => f.id === fishId) !== -1
      ? sortedList.findIndex(f => f.id === fishId)
      : fish.findIndex(f => f.id === fishId);
  const fishState: FishCardState = currentFish
    ? getFishCardState(currentFish, catches)
    : 'locked';
  const isUnlocked = fishState === 'unlocked' || fishState === 'new';

  // Helpers: map strings to MaterialCommunityIcons names
  const getCookingMethodIcon = (method: string): string => {
    const m = method.toLowerCase();
    if (m.includes('sashimi') || m.includes('生食')) {return 'fish';}
    if (m.includes('grill') || m.includes('烤')) {return 'fire';}
    if (m.includes('barbecue') || m.includes('烧烤')) {return 'grill';}
    if (m.includes('bake') || m.includes('烘')) {return 'bread-slice-outline';}
    if (m.includes('smoke') || m.includes('熏')) {return 'smoke';}
    if (m.includes('poach') || m.includes('水煮')) {return 'pot-steam';}
    if (m.includes('pan') || m.includes('煎')) {return 'frying-pan';}
    if (m.includes('stir') || m.includes('翻炒')) {return 'pot-mix';}
    return 'silverware-fork-knife';
  };

  const getFeedingHabitIcon = (habit: string): string => {
    const h = habit.toLowerCase();
    if (h.includes('fish') || h.includes('鱼')) {return 'fish';}
    if (h.includes('squid') || h.includes('乌贼') || h.includes('鱿'))
      {return 'octopus';}
    if (h.includes('crustacean') || h.includes('甲壳')) {return 'crab';}
    if (h.includes('cephalopod') || h.includes('头足')) {return 'octopus';}
    return 'food';
  };

  // 确保数据已加载完成再判断状态
  const shouldShowUnknown = currentFish && catches.length >= 0 && !isUnlocked;

  if (!currentFish) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.errorContainer}>
          <IconSymbol
            name="exclamationmark.triangle"
            size={64}
            color={theme.colors.textSecondary}
          />
          <ThemedText type="h3" style={styles.errorTitle}>
            {t('fish.detail.not.found.title')}
          </ThemedText>
          <ThemedText style={styles.errorDescription}>
            {t('fish.detail.not.found.description')}
          </ThemedText>
          <Pressable
            style={[
              styles.backButton,
              { backgroundColor: theme.colors.primary },
            ]}
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

  // 使用edibility评级来决定主题色，而不是rarity
  const edibilityColor = getColorByEdibility(currentFish.edibility?.rating);
  const edibilityGradient = [edibilityColor + '15', edibilityColor + '05'];

  const userCatches = catches.filter(c => c.fishId === currentFish.id);
  const bestCatch = userCatches.reduce((best, current) => {
    const currentWeight = current.measurements.weightKg || 0;
    const bestWeight = best?.measurements.weightKg || 0;
    return currentWeight > bestWeight ? current : best;
  }, userCatches[0]);

  // Helper function to get difficulty name
  const getDifficultyName = (difficulty: number) => {
    return t(`difficulty.${difficulty}` as any);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={[
          edibilityColor + '35',
          edibilityColor + '25',
          edibilityColor + '10',
        ]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        {/* 装饰性元素 - 丰富的泡泡效果 */}
        <View style={styles.decorativeLines}>
          {/* 几何图形 - 统一规整 */}
          <Animated.View
            style={[
              styles.geometryCircle,
              { backgroundColor: edibilityColor + '15' },
              animatedBubble1Style,
            ]}
          />
          <Animated.View
            style={[
              styles.geometryCircle2,
              { backgroundColor: edibilityColor + '12' },
              animatedBubble2Style,
            ]}
          />

          {/* 主要气泡组 - 右侧 */}
          <Animated.View
            style={[
              styles.rhythmBubble1,
              { backgroundColor: edibilityColor + '20' },
              animatedBubble3Style,
            ]}
          />
          <Animated.View
            style={[
              styles.rhythmBubble2,
              { backgroundColor: edibilityColor + '15' },
              animatedBubble1Style,
            ]}
          />
          <Animated.View
            style={[
              styles.rhythmBubble3,
              { backgroundColor: edibilityColor + '10' },
              animatedBubble2Style,
            ]}
          />

          {/* 左侧气泡组 */}
          <Animated.View
            style={[
              styles.leftBubble1,
              { backgroundColor: edibilityColor + '18' },
              animatedBubble2Style,
            ]}
          />
          <Animated.View
            style={[
              styles.leftBubble2,
              { backgroundColor: edibilityColor + '12' },
              animatedBubble3Style,
            ]}
          />
          <Animated.View
            style={[
              styles.leftBubble3,
              { backgroundColor: edibilityColor + '08' },
              animatedBubble1Style,
            ]}
          />

          {/* 散布的小气泡 */}
          <Animated.View
            style={[
              styles.smallBubble1,
              { backgroundColor: edibilityColor + '15' },
              animatedBubble1Style,
            ]}
          />
          <Animated.View
            style={[
              styles.smallBubble2,
              { backgroundColor: edibilityColor + '12' },
              animatedBubble3Style,
            ]}
          />
          <Animated.View
            style={[
              styles.smallBubble3,
              { backgroundColor: edibilityColor + '10' },
              animatedBubble2Style,
            ]}
          />
          <Animated.View
            style={[
              styles.smallBubble4,
              { backgroundColor: edibilityColor + '14' },
              animatedBubble1Style,
            ]}
          />
          <Animated.View
            style={[
              styles.smallBubble5,
              { backgroundColor: edibilityColor + '08' },
              animatedBubble3Style,
            ]}
          />

          {/* 微小气泡点缀 */}
          <Animated.View
            style={[
              styles.tinyBubble1,
              { backgroundColor: edibilityColor + '12' },
              animatedBubble2Style,
            ]}
          />
          <Animated.View
            style={[
              styles.tinyBubble2,
              { backgroundColor: edibilityColor + '10' },
              animatedBubble1Style,
            ]}
          />
          <Animated.View
            style={[
              styles.tinyBubble3,
              { backgroundColor: edibilityColor + '08' },
              animatedBubble3Style,
            ]}
          />
          <Animated.View
            style={[
              styles.tinyBubble4,
              { backgroundColor: edibilityColor + '06' },
              animatedBubble2Style,
            ]}
          />
        </View>

        <View style={styles.headerContent}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol
              name="chevron.left"
              size={24}
              color={theme.colors.text}
            />
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <ThemedText type="h2" style={styles.fishName}>
              {currentFish.name}
            </ThemedText>
            <ThemedText
              style={[styles.fishNumber, { color: theme.colors.textSecondary }]}
            >
              #{currentFish.id} • {currentIndex + 1}/{fish.length}
            </ThemedText>
          </View>
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
                  <IconSymbol name="fish" size={120} color={edibilityColor} />
                  <ThemedText
                    style={{
                      fontSize: 10,
                      textAlign: 'center',
                      marginTop: 4,
                      color: theme.colors.textSecondary,
                    }}
                  >
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
        <ThemedText type="title" style={styles.cardTitle}>
          {t('fish.detail.basic.info')}
        </ThemedText>
        <View
          style={[
            styles.rarityBadge,
            { backgroundColor: edibilityColor + '20' },
          ]}
        >
          <ThemedText style={[styles.rarityText, { color: edibilityColor }]}>
            {currentFish.edibility?.rating?.toUpperCase() || 'UNKNOWN'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.leftAlignedInfoList}>
        <View style={styles.leftAlignedInfoRow}>
          <MaterialCommunityIcons
            name="book-open-page-variant"
            size={16}
            color="#8B5CF6"
            style={styles.leftAlignedIcon}
          />
          <ThemedText style={styles.leftAlignedLabel}>
            {t('fish.detail.scientific.name')}：
          </ThemedText>
          <ThemedText style={styles.leftAlignedValue}>
            {currentFish.scientificName}
          </ThemedText>
        </View>

        <View style={styles.leftAlignedInfoRow}>
          <MaterialCommunityIcons
            name="tree-outline"
            size={16}
            color="#059669"
            style={styles.leftAlignedIcon}
          />
          <ThemedText style={styles.leftAlignedLabel}>
            {t('fish.detail.family')}：
          </ThemedText>
          <ThemedText style={styles.leftAlignedValue}>
            {currentFish.family}
          </ThemedText>
        </View>

        <View style={styles.leftAlignedInfoRow}>
          <MaterialCommunityIcons
            name="tag-multiple-outline"
            size={16}
            color="#DC2626"
            style={styles.leftAlignedIcon}
          />
          <ThemedText style={styles.leftAlignedLabel}>
            {t('fish.detail.local.names')}：
          </ThemedText>
          <ThemedText style={styles.leftAlignedValue}>
            {currentFish.localNames?.join('、') || t('common.none')}
          </ThemedText>
        </View>
      </View>

      {shouldShowUnknown && (
        <View
          style={[
            styles.unlockStatus,
            { backgroundColor: '#FFF3CD', borderColor: '#FFE69C' },
          ]}
        >
          <IconSymbol
            name="exclamationmark.triangle"
            size={16}
            color="#856404"
          />
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
        <ThemedText type="title" style={styles.cardTitle}>
          {t('fish.detail.stats')}
        </ThemedText>
      </View>

      <View style={styles.twoColumnStatsList}>
        {/* 第一列 */}
        <View style={styles.statsColumn}>
          <View style={styles.leftAlignedStatRow}>
            <MaterialCommunityIcons name="ruler" size={18} color="#3B82F6" />
            <ThemedText style={styles.leftAlignedStatLabel}>
              {t('fish.detail.length')}
            </ThemedText>
            <ThemedText style={styles.leftAlignedStatValue}>
              {currentFish.characteristics.minLengthCm}-
              {currentFish.characteristics.maxLengthCm}cm
            </ThemedText>
          </View>

          <View style={styles.leftAlignedStatRow}>
            <MaterialCommunityIcons
              name="timeline-clock-outline"
              size={18}
              color="#F59E0B"
            />
            <ThemedText style={styles.leftAlignedStatLabel}>
              {t('fish.detail.lifespan')}
            </ThemedText>
            <ThemedText style={styles.leftAlignedStatValue}>
              {currentFish.characteristics.lifespan}
              {t('fish.detail.years')}
            </ThemedText>
          </View>
        </View>

        {/* 第二列 */}
        <View style={styles.statsColumn}>
          <View style={styles.leftAlignedStatRow}>
            <MaterialCommunityIcons name="weight" size={18} color="#10B981" />
            <ThemedText style={styles.leftAlignedStatLabel}>
              {t('fish.detail.weight')}
            </ThemedText>
            <ThemedText style={styles.leftAlignedStatValue}>
              {t('fish.detail.max.weight')}{' '}
              {currentFish.characteristics.maxWeightKg}kg
            </ThemedText>
          </View>

          <View style={styles.leftAlignedStatRow}>
            <MaterialCommunityIcons name="target" size={18} color="#EF4444" />
            <ThemedText style={styles.leftAlignedStatLabel}>
              {t('fish.detail.difficulty')}
            </ThemedText>
            <View style={styles.difficultyRow}>
              <ProgressBar
                progress={currentFish.behavior.difficulty / 5}
                height={6}
                color="#FF9500"
                backgroundColor="#F2F2F7"
                style={styles.inlineDifficultyBar}
              />
              <ThemedText style={styles.inlineDifficultyText}>
                {getDifficultyName(currentFish.behavior.difficulty)}
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
        <ThemedText type="title" style={styles.cardTitle}>
          {t('fish.detail.habitat')}
        </ThemedText>
      </View>

      <View style={styles.habitatOptimizedGrid}>
        {/* 水域类型 */}
        <View style={styles.habitatOptimizedRow}>
          <View style={styles.habitatOptimizedIconLabel}>
            <MaterialCommunityIcons name="water" size={18} color="#3B82F6" />
            <ThemedText style={styles.habitatOptimizedLabel}>
              {t('fish.detail.water.types')}
            </ThemedText>
          </View>
          <View style={styles.habitatOptimizedTags}>
            {currentFish.habitat.waterTypes
              ?.filter(type => type)
              .map((type, index) => (
                <View
                  key={index}
                  style={[
                    styles.habitatOptimizedTag,
                    { backgroundColor: '#3B82F6' + '15' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.habitatOptimizedTagText,
                      { color: '#3B82F6' },
                    ]}
                  >
                    {WATER_TYPE_NAMES[type] || type || t('common.unknown')}
                  </ThemedText>
                </View>
              ))}
          </View>
        </View>

        {/* 分布地区 */}
        <View style={styles.habitatOptimizedRow}>
          <View style={styles.habitatOptimizedIconLabel}>
            <MaterialCommunityIcons
              name="map-marker"
              size={18}
              color="#10B981"
            />
            <ThemedText style={styles.habitatOptimizedLabel}>
              {t('fish.detail.regions')}
            </ThemedText>
          </View>
          <View style={styles.habitatOptimizedTags}>
            {currentFish.habitat.regions.map((region, index) => (
              <View
                key={index}
                style={[
                  styles.habitatOptimizedTag,
                  { backgroundColor: '#10B981' + '15' },
                ]}
              >
                <ThemedText
                  style={[styles.habitatOptimizedTagText, { color: '#10B981' }]}
                >
                  {region}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* 活跃季节 */}
        <View style={styles.habitatOptimizedRow}>
          <View style={styles.habitatOptimizedIconLabel}>
            <MaterialCommunityIcons name="calendar" size={18} color="#F59E0B" />
            <ThemedText style={styles.habitatOptimizedLabel}>
              {t('fish.detail.seasons')}
            </ThemedText>
          </View>
          <View style={styles.habitatOptimizedTags}>
            {currentFish.habitat.seasons.slice(0, 4).map((season, index) => (
              <View
                key={index}
                style={[
                  styles.habitatOptimizedTag,
                  { backgroundColor: '#F59E0B' + '15' },
                ]}
              >
                <ThemedText
                  style={[styles.habitatOptimizedTagText, { color: '#F59E0B' }]}
                >
                  {season}
                  {typeof season === 'number' ? t('fish.detail.month') : ''}
                </ThemedText>
              </View>
            ))}
            {currentFish.habitat.seasons.length > 4 && (
              <View
                style={[
                  styles.habitatOptimizedTag,
                  { backgroundColor: '#F59E0B' + '10' },
                ]}
              >
                <ThemedText
                  style={[styles.habitatOptimizedTagText, { color: '#F59E0B' }]}
                >
                  +{currentFish.habitat.seasons.length - 4}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* 水深信息（如果有的话） */}
        {currentFish.habitat.depth && (
          <View style={styles.habitatOptimizedRow}>
            <View style={styles.habitatOptimizedIconLabel}>
              <IconSymbol name="arrow.down" size={18} color="#6B7280" />
              <ThemedText style={styles.habitatOptimizedLabel}>水深</ThemedText>
            </View>
            <View style={styles.habitatOptimizedTags}>
              <View
                style={[
                  styles.habitatOptimizedTag,
                  { backgroundColor: '#6B7280' + '15' },
                ]}
              >
                <ThemedText
                  style={[styles.habitatOptimizedTagText, { color: '#6B7280' }]}
                >
                  {currentFish.habitat.depth}
                </ThemedText>
              </View>
            </View>
          </View>
        )}
      </View>
    </ThemedView>
  );

  const renderRegulations = () => {
    if (!currentFish.regulations || currentFish.regulations.length === 0) {
      return null;
    }

    return (
      <ThemedView type="card" style={[styles.infoCard, theme.shadows.md]}>
        <View style={styles.cardHeader}>
          <ThemedText type="title" style={styles.cardTitle}>
            {t('fish.detail.regulations')}
          </ThemedText>
        </View>

        <View style={styles.regulationsHorizontalContainer}>
          {currentFish.regulations.map((regulation, index) => (
            <View key={index} style={styles.regulationHorizontalItem}>
              {/* 地区徽章 */}
              <View style={styles.regulationHorizontalHeader}>
                <IconSymbol
                  name="location"
                  size={18}
                  color={theme.colors.primary}
                />
                <ThemedText
                  style={[
                    styles.regulationHorizontalRegion,
                    { color: theme.colors.primary },
                  ]}
                >
                  {regulation.region}
                </ThemedText>
              </View>

              {/* 规定信息 - 水平排列 */}
              <View style={styles.regulationHorizontalGrid}>
                {regulation.dailyLimit && (
                  <View style={styles.regulationHorizontalInfoItem}>
                    <IconSymbol name="clock.badge" size={12} color="#10B981" />
                    <View style={styles.regulationHorizontalContent}>
                      <ThemedText style={styles.regulationHorizontalLabel}>
                        日限
                      </ThemedText>
                      <ThemedText style={styles.regulationHorizontalValue}>
                        {regulation.dailyLimit}
                      </ThemedText>
                    </View>
                  </View>
                )}

                {regulation.possessionLimit && (
                  <View style={styles.regulationHorizontalInfoItem}>
                    <IconSymbol name="bag" size={12} color="#F59E0B" />
                    <View style={styles.regulationHorizontalContent}>
                      <ThemedText style={styles.regulationHorizontalLabel}>
                        持有
                      </ThemedText>
                      <ThemedText style={styles.regulationHorizontalValue}>
                        {regulation.possessionLimit}
                      </ThemedText>
                    </View>
                  </View>
                )}

                {regulation.minSizeCm && (
                  <View style={styles.regulationHorizontalInfoItem}>
                    <IconSymbol name="ruler" size={12} color="#3B82F6" />
                    <View style={styles.regulationHorizontalContent}>
                      <ThemedText style={styles.regulationHorizontalLabel}>
                        尺寸
                      </ThemedText>
                      <ThemedText style={styles.regulationHorizontalValue}>
                        {regulation.minSizeCm}cm
                      </ThemedText>
                    </View>
                  </View>
                )}

                {regulation.closedSeasons &&
                  regulation.closedSeasons.length > 0 && (
                    <View style={styles.regulationHorizontalInfoItem}>
                      <IconSymbol name="calendar" size={12} color="#EF4444" />
                      <View style={styles.regulationHorizontalContent}>
                        <ThemedText style={styles.regulationHorizontalLabel}>
                          禁期
                        </ThemedText>
                        <ThemedText style={styles.regulationHorizontalValue}>
                          {regulation.closedSeasons.length}
                        </ThemedText>
                      </View>
                    </View>
                  )}

                {regulation.specialRules &&
                  regulation.specialRules.length > 0 && (
                    <View style={styles.regulationHorizontalInfoItem}>
                      <IconSymbol
                        name="exclamationmark.triangle"
                        size={12}
                        color="#8B5CF6"
                      />
                      <View style={styles.regulationHorizontalContent}>
                        <ThemedText style={styles.regulationHorizontalLabel}>
                          特殊
                        </ThemedText>
                        <ThemedText style={styles.regulationHorizontalValue}>
                          {regulation.specialRules.length}
                        </ThemedText>
                      </View>
                    </View>
                  )}
              </View>
            </View>
          ))}
        </View>
      </ThemedView>
    );
  };

  const renderEdibility = () => {
    if (!currentFish.edibility) {
      return null;
    }

    return (
      <ThemedView type="card" style={[styles.infoCard, theme.shadows.md]}>
        <View style={styles.cardHeader}>
          <ThemedText type="title" style={styles.cardTitle}>
            {t('fish.detail.edibility')}
          </ThemedText>
          {currentFish.edibility.rating && (
            <View
              style={[
                styles.rarityBadge,
                { backgroundColor: edibilityColor + '20' },
              ]}
            >
              <ThemedText
                style={[styles.rarityText, { color: edibilityColor }]}
              >
                {currentFish.edibility.rating.toUpperCase()}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.leftAlignedInfoList}>
          {currentFish.edibility.taste && (
            <View style={styles.leftAlignedInfoRow}>
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={16}
                color="#F59E0B"
              />
              <ThemedText style={styles.leftAlignedLabel}>
                {t('fish.detail.taste')}：
              </ThemedText>
              <ThemedText style={styles.leftAlignedValue}>
                {currentFish.edibility.taste}
              </ThemedText>
            </View>
          )}

          {currentFish.edibility.cookingMethods &&
            currentFish.edibility.cookingMethods.length > 0 && (
              <View style={styles.compactHabitatRow}>
                <ThemedText style={styles.compactHabitatLabel}>
                  {t('fish.detail.cooking.methods')}：
                </ThemedText>
                <View style={styles.compactTagContainer}>
                  {currentFish.edibility.cookingMethods.map((method, index) => (
                    <View
                      key={index}
                      style={[
                        styles.compactTag,
                        { backgroundColor: '#F59E0B' + '20' },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={getCookingMethodIcon(method) as any}
                        size={14}
                        color="#F59E0B"
                        style={{ marginRight: 4 }}
                      />
                      <ThemedText
                        style={[styles.compactTagText, { color: '#F59E0B' }]}
                      >
                        {method}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}

          {currentFish.edibility.notes && (
            <View style={styles.leftAlignedInfoRow}>
              <MaterialCommunityIcons
                name="note-text-outline"
                size={16}
                color="#6B7280"
              />
              <ThemedText style={styles.leftAlignedLabel}>
                {t('fish.detail.notes')}：
              </ThemedText>
              <ThemedText style={styles.leftAlignedValue}>
                {currentFish.edibility.notes}
              </ThemedText>
            </View>
          )}
        </View>
      </ThemedView>
    );
  };

  const renderBehavior = () => (
    <ThemedView type="card" style={[styles.infoCard, theme.shadows.md]}>
      <View style={styles.cardHeader}>
        <ThemedText type="title" style={styles.cardTitle}>
          {t('fish.detail.behavior')}
        </ThemedText>
      </View>

      <View style={styles.leftAlignedInfoList}>
        <View style={styles.leftAlignedInfoRow}>
          <MaterialCommunityIcons
            name="clock-time-four-outline"
            size={16}
            color="#3B82F6"
          />
          <ThemedText style={styles.leftAlignedLabel}>
            {t('fish.detail.active.time')}：
          </ThemedText>
          <ThemedText style={styles.leftAlignedValue}>
            {t(`fish.detail.active.${currentFish.behavior.activeTime}`)}
          </ThemedText>
        </View>

        <View style={styles.compactHabitatRow}>
          <ThemedText style={styles.compactHabitatLabel}>
            {t('fish.detail.feeding.habits')}：
          </ThemedText>
          <View style={styles.compactTagContainer}>
            {currentFish.behavior.feedingHabits.map((habit, index) => (
              <View
                key={index}
                style={[
                  styles.compactTag,
                  { backgroundColor: '#10B981' + '20' },
                ]}
              >
                <MaterialCommunityIcons
                  name={getFeedingHabitIcon(habit) as any}
                  size={14}
                  color="#10B981"
                  style={{ marginRight: 4 }}
                />
                <ThemedText
                  style={[styles.compactTagText, { color: '#10B981' }]}
                >
                  {habit}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ThemedView>
  );

  const renderPersonalRecord = () => {
    if (shouldShowUnknown || userCatches.length === 0) {
      return null;
    }

    return (
      <ThemedView type="card" style={[styles.infoCard, theme.shadows.md]}>
        <View style={styles.cardHeader}>
          <ThemedText type="title" style={styles.cardTitle}>
            {t('fish.detail.personal.record')}
          </ThemedText>
          <ThemedText style={styles.recordCount}>
            {t('fish.detail.caught.times', {
              count: userCatches.length.toString(),
            })}
          </ThemedText>
        </View>

        {bestCatch && (
          <View style={styles.recordInfo}>
            <View style={styles.recordRow}>
              <ThemedText style={styles.recordLabel}>
                {t('fish.detail.best.record')}：
              </ThemedText>
              <ThemedText style={styles.recordValue}>
                {bestCatch.measurements.lengthCm
                  ? `${bestCatch.measurements.lengthCm}cm`
                  : ''}
                {bestCatch.measurements.weightKg
                  ? ` ${bestCatch.measurements.weightKg}kg`
                  : ''}
              </ThemedText>
            </View>
            <View style={styles.recordRow}>
              <ThemedText style={styles.recordLabel}>
                {t('fish.detail.catch.time')}：
              </ThemedText>
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
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

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
          {renderEdibility()}
          {renderBehavior()}
          {renderPersonalRecord()}
        </View>
      </ScrollView>

      {/* 右下角圆形记录按钮 */}
      <View style={styles.circularButtonContainer}>
        <Pressable
          style={[
            styles.circularLogButton,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
            },
          ]}
          onPress={() =>
            router.push(
              `/log?fishId=${currentFish.id}&fishName=${encodeURIComponent(currentFish.name)}`
            )
          }
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
    left: 60,
    right: 60,
    top: 8,
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
    lineHeight: 28,
    flexWrap: 'wrap',
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
    alignItems: 'flex-start',
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
  leftAlignedIcon: {
    marginTop: 2,
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
  // Removed duplicate statLabel and statValue - keeping the later more specific versions
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
  statLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statLabelText: {
    fontSize: 16,
    fontWeight: '400',
  },
  statValue: {},
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
  // Removed duplicate regulationRow - keeping the later more specific version
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
  // Two-column compact layout styles
  habitatTwoColumnGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  habitatColumn: {
    flex: 1,
  },
  habitatCompactSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  habitatCompactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  habitatCompactTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  habitatCompactTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  habitatCompactTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  habitatCompactTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  regulationsTwoColumnContainer: {
    gap: 8,
  },
  regulationCompactItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  regulationCompactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  regulationCompactRegion: {
    fontSize: 13,
    fontWeight: '600',
  },
  regulationCompactGrid: {
    gap: 6,
  },
  regulationCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  regulationCompactContent: {
    flex: 1,
  },
  regulationCompactLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
  },
  regulationCompactValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  // Clean layout styles without gray backgrounds
  habitatCleanSection: {
    marginBottom: 16,
  },
  habitatCleanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  habitatCleanTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  habitatCleanTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  habitatCleanTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  habitatCleanTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  regulationsThreeColumnContainer: {
    gap: 12,
  },
  regulationCleanItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  regulationCleanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  regulationCleanRegion: {
    fontSize: 13,
    fontWeight: '600',
  },
  regulationThreeColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  regulationCleanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '30%', // 3列布局，每个占30%，留出间距
    marginBottom: 8,
  },
  regulationCleanContent: {
    flex: 1,
  },
  regulationCleanLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: '#6B7280',
  },
  regulationCleanValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  regulationPlaceholder: {
    width: '30%', // 与regulationCleanRow保持一致
  },
  // New optimized styles for compact layout
  habitatOptimizedGrid: {
    gap: 12,
  },
  habitatOptimizedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  habitatOptimizedIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  habitatOptimizedLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
  },
  habitatOptimizedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  habitatOptimizedTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  habitatOptimizedTagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  regulationsOptimizedContainer: {
    gap: 8,
  },
  regulationOptimizedItem: {
    paddingVertical: 12,
  },
  regulationOptimizedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  regulationOptimizedRegion: {
    fontSize: 12,
    fontWeight: '600',
  },
  regulationOptimizedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  regulationOptimizedInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  regulationOptimizedInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  regulationOptimizedContent: {
    flex: 1,
  },
  regulationOptimizedLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: '#6B7280',
  },
  regulationOptimizedValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  regulationOptimizedInfoLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: '#6B7280',
  },
  regulationOptimizedInfoValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  // New styles for horizontal regulations layout
  regulationsHorizontalContainer: {
    gap: 16,
  },
  regulationHorizontalItem: {
    paddingVertical: 8,
  },
  regulationHorizontalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  regulationHorizontalRegion: {
    fontSize: 14,
    fontWeight: '600',
  },
  regulationHorizontalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  regulationHorizontalInfoItem: {
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 50,
  },
  regulationHorizontalContent: {
    alignItems: 'center',
    marginTop: 4,
  },
  regulationHorizontalLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 2,
  },
  regulationHorizontalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
});
