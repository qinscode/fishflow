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
import { RARITY_COLORS, WATER_TYPE_NAMES, DIFFICULTY_NAMES } from '@/lib/constants';
import { useFish, useCatches, useUserStats } from '@/lib/store';
import { Fish, FishCardState } from '@/lib/types';
import { getFishImage } from '@/lib/fishImages';
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
      
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
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
                UNKNOWN
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
                    图片ID: {currentFish.id}
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
        <ThemedText type="title" style={styles.cardTitle}>基本信息</ThemedText>
        <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
          <ThemedText style={[styles.rarityText, { color: rarityColor }]}>
            {currentFish.rarity.toUpperCase()}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <IconSymbol name="text.book.closed" size={16} color={theme.colors.textSecondary} />
        <View style={styles.infoContent}>
          <ThemedText style={styles.infoLabel}>学名：</ThemedText>
          <ThemedText style={styles.infoValue}>{currentFish.scientificName}</ThemedText>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <IconSymbol name="tree" size={16} color={theme.colors.textSecondary} />
        <View style={styles.infoContent}>
          <ThemedText style={styles.infoLabel}>科属：</ThemedText>
          <ThemedText style={styles.infoValue}>{currentFish.family}</ThemedText>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <IconSymbol name="location" size={16} color={theme.colors.textSecondary} />
        <View style={styles.infoContent}>
          <ThemedText style={styles.infoLabel}>别名：</ThemedText>
          <ThemedText style={styles.infoValue}>
            {currentFish.localNames?.join('、') || '无'}
          </ThemedText>
        </View>
      </View>
      
      {!isUnlocked && (
        <View style={[styles.unlockStatus, { backgroundColor: '#FFF3CD', borderColor: '#FFE69C' }]}>
          <IconSymbol name="exclamationmark.triangle" size={16} color="#856404" />
          <ThemedText style={[styles.unlockText, { color: '#856404' }]}>
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
            <IconSymbol name="ruler" size={20} color="#007AFF" />
            <ThemedText style={styles.statLabelText}>长度</ThemedText>
          </View>
          <View style={styles.statValue}>
            <ThemedText style={styles.statNumber}>
              {currentFish.characteristics.minLengthCm}-{currentFish.characteristics.maxLengthCm}cm
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.statLabel}>
            <IconSymbol name="scalemass" size={20} color="#007AFF" />
            <ThemedText style={styles.statLabelText}>重量</ThemedText>
          </View>
          <View style={styles.statValue}>
            <ThemedText style={styles.statNumber}>
              最大 {currentFish.characteristics.maxWeightKg}kg
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.statLabel}>
            <IconSymbol name="clock" size={20} color="#007AFF" />
            <ThemedText style={styles.statLabelText}>寿命</ThemedText>
          </View>
          <View style={styles.statValue}>
            <ThemedText style={styles.statNumber}>
              {currentFish.characteristics.lifespan}年
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.statLabel}>
            <IconSymbol name="target" size={20} color="#007AFF" />
            <ThemedText style={styles.statLabelText}>难度</ThemedText>
          </View>
          <View style={styles.statValue}>
            <View style={styles.difficultyContainer}>
              <ProgressBar
                progress={currentFish.behavior.difficulty / 5}
                height={8}
                color="#FF9500"
                backgroundColor="#F2F2F7"
                style={styles.difficultyBar}
              />
              <ThemedText style={styles.difficultyText}>
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
    paddingBottom: 100,
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
    marginBottom: 12,
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