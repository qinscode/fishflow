import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EmptyState, EmptyStates } from '@/components/ui/EmptyState';
import { FilterChip, FilterChipGroup } from '@/components/ui/FilterChip';
import { FishCard } from '@/components/ui/FishCard';
import { IconSymbol, MAPPING } from '@/components/ui/IconSymbol';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/hooks/useThemeColor';
import { RARITY_NAMES, WATER_TYPES } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';
import {
  useAppStore,
  useFish,
  useCatches,
  useFilters,
  useSearchQuery,
  useFilteredFish,
  useIsLoading,
} from '@/lib/store';
import { Fish, FishRarity, WaterType } from '@/lib/types';
import { getFishCardState, sortFish } from '@/lib/utils';

export default function FishdexScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { gridColumns, isTablet } = useResponsive();

  // Store hooks
  const fish = useFish();
  const catches = useCatches();
  const filters = useFilters();
  const searchQuery = useSearchQuery();
  const filteredFish = useFilteredFish();
  const isLoading = useIsLoading();

  const { setFilters, setSearchQuery, clearFilters, setFish, setCatches } =
    useAppStore();

  // Local state
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'recent'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Memoized sorted fish list
  const sortedFish = useMemo(() => {
    return sortFish(filteredFish, sortBy, catches);
  }, [filteredFish, sortBy, catches]);

  // Filter options
  const rarityOptions = useMemo(
    () =>
      Object.entries(RARITY_NAMES).map(([key, label]) => ({
        id: key,
        label,
      })),
    []
  );

  const waterTypeOptions = useMemo(
    () =>
      Object.entries(WATER_TYPES).map(([key, config]) => ({
        id: key,
        label: config.name,
        icon: config.icon as keyof typeof MAPPING,
      })),
    []
  );

  // Statistics
  const stats = useMemo(() => {
    const total = fish.length;
    const unlocked = new Set(catches.map(c => c.fishId)).size;
    const filtered = filteredFish.length;

    return { total, unlocked, filtered };
  }, [fish.length, catches, filteredFish.length]);

  // Handlers
  const handleFishPress = useCallback((fishItem: Fish) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/fish/${fishItem.id}` as any);
  }, []);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
    },
    [setSearchQuery]
  );

  const handleRarityFilterChange = useCallback(
    (selectedIds: string[]) => {
      setFilters({ rarity: selectedIds as FishRarity[] });
    },
    [setFilters]
  );

  const handleWaterTypeFilterChange = useCallback(
    (selectedIds: string[]) => {
      setFilters({ waterTypes: selectedIds as WaterType[] });
    },
    [setFilters]
  );

  const handleUnlockedOnlyToggle = useCallback(() => {
    setFilters({ unlockedOnly: !filters.unlockedOnly });
  }, [filters.unlockedOnly, setFilters]);

  const handleSortChange = useCallback((newSort: typeof sortBy) => {
    setSortBy(newSort);
  }, []);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setSortBy('name');
  }, [clearFilters]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simple refresh logic, reload data
    try {
      const { loadFishData } = await import('@/lib/fishDataLoader');
      setFish(loadFishData());
      console.log('Data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
    setRefreshing(false);
  }, [setFish]);

  const renderFishItem = useCallback(
    ({ item }: { item: Fish }) => {
      const state = getFishCardState(item, catches);
      return (
        <FishCard
          fish={item}
          state={state}
          size="medium"
          onPress={() => handleFishPress(item)}
          showRarity={true}
          showId={true}
          style={styles.fishCardItem}
        />
      );
    },
    [catches, handleFishPress]
  );

  const renderHeader = () => (
    <ThemedView style={styles.header}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <IconSymbol
          name="magnifyingglass"
          size={20}
          color={theme.colors.textSecondary}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text, flex: 1 }]}
          placeholder={t('fishdex.search')}
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => handleSearchChange('')}>
            <IconSymbol
              name="xmark.circle.fill"
              size={20}
              color={theme.colors.textSecondary}
            />
          </Pressable>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <ThemedText
          type="bodySmall"
          style={{ color: theme.colors.textSecondary }}
        >
          {t('common.total')} {stats.total} • {t('fishdex.unlocked')}{' '}
          {stats.unlocked} • {t('common.showing')} {stats.filtered}
        </ThemedText>
      </View>

      {/* Filter and Sort Controls */}
      <View style={styles.controlsContainer}>
        {/* Filter Toggle */}
        <FilterChip
          label={t('common.filter')}
          icon="line.3.horizontal.decrease"
          selected={showFilters}
          onPress={() => setShowFilters(!showFilters)}
          variant="outlined"
          size="small"
        />

        {/* Unlocked Only */}
        <FilterChip
          label={t('fishdex.unlocked.only')}
          selected={filters.unlockedOnly || false}
          onPress={handleUnlockedOnlyToggle}
          variant="filled"
          size="small"
        />

        {/* Sort Options */}
        <FilterChip
          label={
            sortBy === 'name'
              ? t('common.name')
              : sortBy === 'rarity'
                ? t('fishdex.rarity')
                : t('common.recent')
          }
          icon="arrow.up.arrow.down"
          selected={true}
          onPress={() => {
            const options = ['name', 'rarity', 'recent'] as const;
            const currentIndex = options.indexOf(sortBy);
            const nextIndex = (currentIndex + 1) % options.length;
            handleSortChange(options[nextIndex]);
          }}
          variant="outlined"
          size="small"
        />

        {/* Clear Filters */}
        {(Object.keys(filters).length > 0 || searchQuery.length > 0) && (
          <FilterChip
            label={t('common.clear')}
            onPress={handleClearFilters}
            variant="text"
            size="small"
          />
        )}
      </View>

      {/* Expanded Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Rarity Filters */}
          <View style={styles.filterSection}>
            <ThemedText type="caption" style={styles.filterSectionTitle}>
              {t('fishdex.rarity')}
            </ThemedText>
            <FilterChipGroup
              chips={rarityOptions}
              selectedIds={filters.rarity || []}
              onSelectionChange={handleRarityFilterChange}
              multiSelect={true}
              variant="outlined"
              size="small"
            />
          </View>

          {/* Water Type Filters */}
          <View style={styles.filterSection}>
            <ThemedText type="caption" style={styles.filterSectionTitle}>
              {t('fishdex.water.types')}
            </ThemedText>
            <FilterChipGroup
              chips={waterTypeOptions}
              selectedIds={filters.waterTypes || []}
              onSelectionChange={handleWaterTypeFilterChange}
              multiSelect={true}
              variant="outlined"
              size="small"
            />
          </View>
        </View>
      )}
    </ThemedView>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <EmptyState
          type="loading"
          title={t('common.loading')}
          description={t('fishdex.loading.description')}
        />
      </SafeAreaView>
    );
  }

  if (fish.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <EmptyStates.NoFish
          action={{
            label: t('fishdex.initialize.data'),
            onPress: handleRefresh,
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {sortedFish.length === 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {renderHeader()}
          {searchQuery ? (
            <EmptyStates.NoSearchResults
              query={searchQuery}
              action={{
                label: t('common.clear.search'),
                onPress: () => handleSearchChange(''),
              }}
            />
          ) : (
            <EmptyState
              type="no-results"
              title={t('fishdex.no.matches.title')}
              description={t('fishdex.no.matches.description')}
              action={{
                label: t('common.clear.filters'),
                onPress: handleClearFilters,
              }}
            />
          )}
        </ScrollView>
      ) : (
        <FlashList
          data={sortedFish}
          renderItem={renderFishItem}
          numColumns={gridColumns}
          ListHeaderComponent={renderHeader}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 16,
    lineHeight: 20,
  },
  statsContainer: {
    alignItems: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filtersContainer: {
    gap: 16,
    marginTop: 8,
  },
  filterSection: {
    gap: 8,
  },
  filterSectionTitle: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  fishCardItem: {
    marginHorizontal: 8,
  },
});
