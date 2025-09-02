import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import React from 'react';
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
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Badge } from '@/components/ui/Badge';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/hooks/useThemeColor';
import { RARITY_COLORS, WATER_TYPE_NAMES, DIFFICULTY_NAMES } from '@/lib/constants';
import { useFish, useCatches, useUserStats } from '@/lib/store';
import { Fish, FishCardState } from '@/lib/types';
import { getFishCardState } from '@/lib/utils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function FishDetailScreen() {
  const theme = useTheme();
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
  
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);

  if (!currentFish) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={64} color={theme.colors.textSecondary} />
          <ThemedText type="h3" style={styles.errorTitle}>鱼类未找到</ThemedText>
          <ThemedText style={styles.errorDescription}>
            无法找到指定的鱼类信息
          </ThemedText>
          <Pressable 
            style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <ThemedText style={[styles.backButtonText, { color: 'white' }]}>
              返回
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

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [
        {
          translateY: withTiming(scrollY.value > 100 ? -50 : 0, { duration: 200 }),
        },
      ],
    };
  });

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        scrollY.value,
        [0, 200],
        [rarityColor + '20', theme.colors.background]
      ),
    };
  });

  const renderHeader = () => (
    <Animated.View style={[styles.header, backgroundAnimatedStyle]}>
      <LinearGradient
        colors={[rarityColor + '30', rarityColor + '10', 'transparent']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <Animated.View style={[styles.headerContent, headerAnimatedStyle]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} color="white" />
        </Pressable>
        
        <View style={styles.headerInfo}>
          <ThemedText type="h1" style={[styles.fishName, { color: 'white' }]}>
            {currentFish.name}
          </ThemedText>
          <ThemedText style={[styles.fishNumber, { color: 'rgba(255, 255, 255, 0.8)' }]}>
            #{currentFish.id.split('-')[0].toUpperCase()} • {currentIndex + 1}/{fish.length}
          </ThemedText>
        </View>
      </Animated.View>
      
      <View style={styles.fishImageContainer}>
        <View style={[styles.fishImageBg, { backgroundColor: rarityColor + '20' }]}>
          <View style={styles.fishImagePlaceholder}>
            {currentFish.images.hero ? (
              <Image
                source={currentFish.images.hero}
                style={styles.fishImage}
                contentFit="contain"
                transition={200}
              />
            ) : (
              <IconSymbol name="fish" size={120} color={rarityColor} />
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderBasicInfo = () => (
    <ThemedView type="card" style={[styles.infoCard, theme.shadows.md]}>
      <View style={styles.cardHeader}>
        <ThemedText type="title" style={styles.cardTitle}>基本信息</ThemedText>
        <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
          <ThemedText style={[styles.rarityText, { color: rarityColor }]}>
            {currentFish.rarity.toUpperCase()}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <IconSymbol name="text.book.closed" size={16} color={theme.colors.textSecondary} />
        <ThemedText style={styles.infoLabel}>学名：</ThemedText>
        <ThemedText style={styles.infoValue}>{currentFish.scientificName}</ThemedText>
      </View>
      
      <View style={styles.infoRow}>
        <IconSymbol name="tree" size={16} color={theme.colors.textSecondary} />
        <ThemedText style={styles.infoLabel}>科属：</ThemedText>
        <ThemedText style={styles.infoValue}>{currentFish.family}</ThemedText>
      </View>
      
      <View style={styles.infoRow}>
        <IconSymbol name="location" size={16} color={theme.colors.textSecondary} />
        <ThemedText style={styles.infoLabel}>别名：</ThemedText>
        <ThemedText style={styles.infoValue}>
          {currentFish.localNames?.join('、') || '无'}
        </ThemedText>
      </View>
      
      {!isUnlocked && (
        <View style={styles.unlockStatus}>
          <IconSymbol name="lock.open" size={16} color={theme.colors.warning} />
          <ThemedText style={[styles.unlockText, { color: theme.colors.warning }]}>
            钓获此鱼类后将解锁个人记录
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );

  const renderStats = () => (
    <ThemedView type="card" style={[styles.infoCard, theme.shadows.md]}>
      <View style={styles.cardHeader}>
        <ThemedText type="title" style={styles.cardTitle}>属性数据</ThemedText>
      </View>
      
      <View style={styles.statsList}>
        <View style={styles.statRow}>
          <View style={styles.statLabel}>
            <IconSymbol name="ruler" size={16} color={theme.colors.primary} />
            <ThemedText>长度</ThemedText>
          </View>
          <View style={styles.statValue}>
            <ThemedText style={styles.statNumber}>
              {currentFish.characteristics.minLengthCm}-{currentFish.characteristics.maxLengthCm}cm
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.statLabel}>
            <IconSymbol name="scalemass" size={16} color={theme.colors.secondary} />
            <ThemedText>重量</ThemedText>
          </View>
          <View style={styles.statValue}>
            <ThemedText style={styles.statNumber}>
              最大 {currentFish.characteristics.maxWeightKg}kg
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.statLabel}>
            <IconSymbol name="clock" size={16} color={theme.colors.accent} />
            <ThemedText>寿命</ThemedText>
          </View>
          <View style={styles.statValue}>
            <ThemedText style={styles.statNumber}>
              {currentFish.characteristics.lifespan}年
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.statLabel}>
            <IconSymbol name="target" size={16} color={theme.colors.warning} />
            <ThemedText>难度</ThemedText>
          </View>
          <View style={styles.statValue}>
            <ProgressBar
              progress={currentFish.behavior.difficulty / 5}
              height={8}
              color={theme.colors.warning}
              style={styles.difficultyBar}
            />
            <ThemedText style={styles.statNumber}>
              {DIFFICULTY_NAMES[currentFish.behavior.difficulty] || currentFish.behavior.difficulty}
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );

  const renderHabitat = () => (
    <ThemedView type="card" style={[styles.infoCard, theme.shadows.md]}>
      <View style={styles.cardHeader}>
        <ThemedText type="title" style={styles.cardTitle}>栖息环境</ThemedText>
      </View>
      
      <View style={styles.habitatInfo}>
        <View style={styles.habitatRow}>
          <ThemedText style={styles.habitatLabel}>水域类型：</ThemedText>
          <View style={styles.tagContainer}>
            {currentFish.habitat.waterTypes?.filter(type => type).map((type, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}>
                <ThemedText style={[styles.tagText, { color: theme.colors.primary }]}>
                  {WATER_TYPE_NAMES[type] || type || '未知'}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.habitatRow}>
          <ThemedText style={styles.habitatLabel}>分布地区：</ThemedText>
          <View style={styles.tagContainer}>
            {currentFish.habitat.regions.map((region, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: theme.colors.secondary + '20' }]}>
                <ThemedText style={[styles.tagText, { color: theme.colors.secondary }]}>
                  {region}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.habitatRow}>
          <ThemedText style={styles.habitatLabel}>活跃季节：</ThemedText>
          <View style={styles.tagContainer}>
            {currentFish.habitat.seasons.map((month, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: theme.colors.accent + '20' }]}>
                <ThemedText style={[styles.tagText, { color: theme.colors.accent }]}>
                  {month}月
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
    
    return (
      <ThemedView type="card" style={[styles.infoCard, theme.shadows.md]}>
        <View style={styles.cardHeader}>
          <ThemedText type="title" style={styles.cardTitle}>法规信息</ThemedText>
        </View>
        
        {currentFish.regulations.map((regulation, index) => (
          <View key={index} style={styles.regulationItem}>
            <View style={styles.regulationHeader}>
              <ThemedText style={[styles.regionName, { color: theme.colors.primary }]}>
                {regulation.region}
              </ThemedText>
            </View>
            
            <View style={styles.regulationContent}>
              {regulation.minSizeCm && (
                <View style={styles.regulationRow}>
                  <IconSymbol name="ruler" size={14} color={theme.colors.textSecondary} />
                  <ThemedText style={styles.regulationText}>
                    最小尺寸: {regulation.minSizeCm}cm
                  </ThemedText>
                </View>
              )}
              
              {regulation.dailyLimit && (
                <View style={styles.regulationRow}>
                  <IconSymbol name="number" size={14} color={theme.colors.textSecondary} />
                  <ThemedText style={styles.regulationText}>
                    日限制: {regulation.dailyLimit}尾
                  </ThemedText>
                </View>
              )}
              
              {regulation.closedSeasons && regulation.closedSeasons.length > 0 && (
                <View style={styles.regulationRow}>
                  <IconSymbol name="calendar" size={14} color={theme.colors.warning} />
                  <ThemedText style={styles.regulationText}>
                    禁钓期: {regulation.closedSeasons.map(season => 
                      `${season.start} 至 ${season.end}`
                    ).join(', ')}
                  </ThemedText>
                </View>
              )}
              
              {regulation.specialRules && regulation.specialRules.length > 0 && (
                <View style={styles.regulationRow}>
                  <IconSymbol name="exclamationmark.triangle" size={14} color={theme.colors.warning} />
                  <ThemedText style={styles.regulationText}>
                    特殊规定: {regulation.specialRules.join(', ')}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        ))}
      </ThemedView>
    );
  };

  const renderPersonalRecord = () => {
    if (!isUnlocked || userCatches.length === 0) {return null;}
    
    return (
      <ThemedView type="card" style={[styles.infoCard, theme.shadows.md]}>
        <View style={styles.cardHeader}>
          <ThemedText type="title" style={styles.cardTitle}>个人记录</ThemedText>
          <ThemedText style={styles.recordCount}>已钓获 {userCatches.length} 次</ThemedText>
        </View>
        
        {bestCatch && (
          <View style={styles.recordInfo}>
            <View style={styles.recordRow}>
              <ThemedText style={styles.recordLabel}>最佳记录：</ThemedText>
              <ThemedText style={styles.recordValue}>
                {bestCatch.measurements.lengthCm ? `${bestCatch.measurements.lengthCm}cm` : ''} 
                {bestCatch.measurements.weightKg ? ` ${bestCatch.measurements.weightKg}kg` : ''}
              </ThemedText>
            </View>
            <View style={styles.recordRow}>
              <ThemedText style={styles.recordLabel}>钓获时间：</ThemedText>
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
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
          headerOpacity.value = event.nativeEvent.contentOffset.y > 100 ? 0.8 : 1;
        }}
        scrollEventThrottle={16}
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
      
      {/* 底部悬浮记录按钮 */}
      <View style={[styles.floatingButtonContainer, theme.shadows.lg]}>
        <Pressable 
          style={[styles.floatingLogButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push(`/log?fishId=${currentFish.id}&fishName=${encodeURIComponent(currentFish.name)}`)}
        >
          <IconSymbol name="plus" size={24} color="white" />
          <ThemedText type="button" style={[styles.floatingButtonText, { color: 'white' }]}>
            记录钓获
          </ThemedText>
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
    paddingBottom: 100, // 给底部按钮留空间
  },
  header: {
    height: 300,
    position: 'relative',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  floatingLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    minHeight: 56,
  },
  floatingButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  fishName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fishNumber: {
    fontSize: 16,
  },
  fishImageContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fishImageBg: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fishImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -30,
  },
  infoCard: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 60,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  unlockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  unlockText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsList: {
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  difficultyBar: {
    width: 60,
  },
  habitatInfo: {
    gap: 16,
  },
  habitatRow: {
    gap: 12,
  },
  habitatLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
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
    gap: 12,
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
  fishImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  regulationItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  regulationHeader: {
    marginBottom: 8,
  },
  regionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  regulationContent: {
    gap: 6,
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