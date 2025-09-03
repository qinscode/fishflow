import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView, SlideInView } from '@/components/animations';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useThemeColor';
import { WATER_TYPE_NAMES } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';
import { useEquipmentSets, useEquipmentStats } from '@/lib/store';
import { EquipmentSet } from '@/lib/types';

export default function EquipmentScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const equipmentSets = useEquipmentSets();
  const equipmentStats = useEquipmentStats();

  // Helper function to get water type names with translations
  const getWaterTypeName = (waterType: string) => {
    return (
      t(`water.${waterType}` as any) ||
      WATER_TYPE_NAMES[waterType as keyof typeof WATER_TYPE_NAMES] ||
      waterType
    );
  };

  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'favorites' | 'recent'
  >('all');

  const filteredEquipmentSets = React.useMemo(() => {
    switch (selectedFilter) {
      case 'favorites':
        // 由于没有预设装备，这里可以显示用户标记为收藏的装备
        return equipmentSets.filter(
          set =>
            set.tags.includes(t('equipment.tags.favorite')) ||
            set.tags.includes(t('equipment.tags.common'))
        );
      case 'recent':
        const stats = equipmentStats.filter(s => s.lastUsedAt);
        const recentSetIds = stats
          .sort(
            (a, b) =>
              new Date(b.lastUsedAt).getTime() -
              new Date(a.lastUsedAt).getTime()
          )
          .slice(0, 5)
          .map(s => s.equipmentSetId);
        return equipmentSets.filter(set => recentSetIds.includes(set.id));
      default:
        return equipmentSets;
    }
  }, [equipmentSets, equipmentStats, selectedFilter]);

  const handleCreateNew = () => {
    router.push('/equipment/create' as any);
  };

  const handleEditSet = (setId: string) => {
    router.push(`/equipment/${setId}` as any);
  };

  const handleDeleteSet = (set: EquipmentSet) => {
    Alert.alert(
      t('equipment.delete.title'),
      t('equipment.delete.message', { name: set.name }),
      [
        { text: t('equipment.delete.cancel'), style: 'cancel' },
        {
          text: t('equipment.delete.confirm'),
          style: 'destructive',
          onPress: () => {
            // TODO: 调用删除装备组合的方法
          },
        },
      ]
    );
  };

  const getSetStats = (setId: string) => {
    return equipmentStats.find(s => s.equipmentSetId === setId);
  };

  const filters = [
    { key: 'all', label: t('equipment.filter.all'), icon: 'list.bullet' },
    {
      key: 'favorites',
      label: t('equipment.filter.favorites'),
      icon: 'heart.fill',
    },
    { key: 'recent', label: t('equipment.filter.recent'), icon: 'clock.fill' },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <FadeInView delay={0}>
        <ThemedView style={styles.header}>
          <View>
            <ThemedText type="h2" style={styles.title}>
              {t('equipment.title')}
            </ThemedText>
            <ThemedText
              type="body"
              style={{ color: theme.colors.textSecondary }}
            >
              {t('equipment.subtitle')}
            </ThemedText>
          </View>

          <Pressable
            style={[
              styles.addButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleCreateNew}
          >
            <IconSymbol name="plus" size={24} color="white" />
          </Pressable>
        </ThemedView>
      </FadeInView>

      {/* Filter Tabs */}
      <SlideInView direction="up" delay={200}>
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterTabs}>
              {filters.map(filter => (
                <Pressable
                  key={filter.key}
                  style={[
                    styles.filterTab,
                    {
                      backgroundColor:
                        selectedFilter === filter.key
                          ? theme.colors.primary
                          : theme.colors.surface,
                    },
                  ]}
                  onPress={() => setSelectedFilter(filter.key as any)}
                >
                  <IconSymbol
                    name={filter.icon as any}
                    size={16}
                    color={
                      selectedFilter === filter.key
                        ? 'white'
                        : theme.colors.text
                    }
                  />
                  <ThemedText
                    type="bodySmall"
                    style={{
                      color:
                        selectedFilter === filter.key
                          ? 'white'
                          : theme.colors.text,
                      fontWeight: selectedFilter === filter.key ? '600' : '400',
                    }}
                  >
                    {filter.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </SlideInView>

      {/* Equipment Sets List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredEquipmentSets.length === 0 ? (
          <SlideInView direction="up" delay={400}>
            <ThemedView
              type="card"
              style={[styles.emptyState, theme.shadows.sm]}
            >
              <IconSymbol
                name="wrench.and.screwdriver"
                size={48}
                color={theme.colors.textSecondary}
              />
              <ThemedText
                type="subtitle"
                style={{ color: theme.colors.textSecondary, marginTop: 16 }}
              >
                {t('equipment.empty.title')}
              </ThemedText>
              <ThemedText
                type="body"
                style={{
                  color: theme.colors.textSecondary,
                  marginTop: 8,
                  textAlign: 'center',
                }}
              >
                {t('equipment.empty.subtitle')}
              </ThemedText>
              <Pressable
                style={[
                  styles.createButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleCreateNew}
              >
                <ThemedText
                  type="bodySmall"
                  style={{ color: 'white', fontWeight: '600' }}
                >
                  {t('equipment.create')}
                </ThemedText>
              </Pressable>
            </ThemedView>
          </SlideInView>
        ) : (
          <View style={styles.equipmentList}>
            {filteredEquipmentSets.map((set, index) => {
              const stats = getSetStats(set.id);
              return (
                <SlideInView
                  key={set.id}
                  direction="up"
                  delay={400 + index * 100}
                >
                  <EquipmentSetCard
                    set={set}
                    stats={stats}
                    onPress={() => handleEditSet(set.id)}
                    onDelete={() => handleDeleteSet(set)}
                    theme={theme}
                    t={t}
                    getWaterTypeName={getWaterTypeName}
                  />
                </SlideInView>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface EquipmentSetCardProps {
  set: EquipmentSet;
  stats?: any; // TODO: Type properly
  onPress: () => void;
  onDelete: () => void;
  theme: any;
  t: (key: any) => string;
  getWaterTypeName: (waterType: string) => string;
}

function EquipmentSetCard({
  set,
  stats,
  onPress,
  onDelete,
  theme,
  t,
  getWaterTypeName,
}: EquipmentSetCardProps) {
  return (
    <ThemedView type="card" style={[styles.equipmentCard, theme.shadows.md]}>
      <Pressable style={styles.cardPressable} onPress={onPress}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <ThemedText type="subtitle" style={styles.equipmentName}>
              {set.name}
            </ThemedText>
          </View>

          {set.description && (
            <ThemedText
              type="bodySmall"
              style={{ color: theme.colors.textSecondary }}
            >
              {set.description}
            </ThemedText>
          )}
        </View>

        {/* Equipment Details */}
        <View style={styles.equipmentDetails}>
          <View style={styles.equipmentRow}>
            <IconSymbol
              name="line.3.horizontal"
              size={16}
              color={theme.colors.textSecondary}
            />
            <ThemedText
              type="bodySmall"
              style={{ color: theme.colors.textSecondary }}
            >
              {set.rod} • {set.reel}
            </ThemedText>
          </View>
          <View style={styles.equipmentRow}>
            <IconSymbol
              name="link"
              size={16}
              color={theme.colors.textSecondary}
            />
            <ThemedText
              type="bodySmall"
              style={{ color: theme.colors.textSecondary }}
            >
              {set.line} • {set.hook}
            </ThemedText>
          </View>
          <View style={styles.equipmentRow}>
            <IconSymbol
              name="fish"
              size={16}
              color={theme.colors.textSecondary}
            />
            <ThemedText
              type="bodySmall"
              style={{ color: theme.colors.textSecondary }}
            >
              {set.bait}
            </ThemedText>
          </View>
        </View>

        {/* Water Types */}
        {set.waterTypes.length > 0 && (
          <View style={styles.waterTypesContainer}>
            <View style={styles.waterTypes}>
              {set.waterTypes.slice(0, 3).map(waterType => (
                <View
                  key={waterType}
                  style={[
                    styles.waterTypeTag,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <ThemedText
                    type="caption"
                    style={{ color: theme.colors.text }}
                  >
                    {getWaterTypeName(waterType)}
                  </ThemedText>
                </View>
              ))}
              {set.waterTypes.length > 3 && (
                <View
                  style={[
                    styles.waterTypeTag,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <ThemedText
                    type="caption"
                    style={{ color: theme.colors.text }}
                  >
                    +{set.waterTypes.length - 3}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Stats */}
        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText
                type="bodySmall"
                style={{ color: theme.colors.primary, fontWeight: '600' }}
              >
                {stats.usageCount}
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: theme.colors.textSecondary }}
              >
                {t('equipment.stats.usage')}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText
                type="bodySmall"
                style={{ color: theme.colors.secondary, fontWeight: '600' }}
              >
                {Math.round(stats.successRate * 100)}%
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: theme.colors.textSecondary }}
              >
                {t('equipment.stats.success')}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText
                type="bodySmall"
                style={{ color: theme.colors.accent, fontWeight: '600' }}
              >
                {stats.catchCount}
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ color: theme.colors.textSecondary }}
              >
                {t('equipment.stats.catches')}
              </ThemedText>
            </View>
          </View>
        )}
      </Pressable>

      {/* Action Buttons */}
      <View style={styles.cardActions}>
        <Pressable
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={onPress}
        >
          <IconSymbol name="pencil" size={16} color={theme.colors.primary} />
          <ThemedText type="bodySmall" style={{ color: theme.colors.primary }}>
            {t('equipment.actions.edit')}
          </ThemedText>
        </Pressable>

        <Pressable
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={onDelete}
        >
          <IconSymbol name="trash" size={16} color={theme.colors.error} />
          <ThemedText type="bodySmall" style={{ color: theme.colors.error }}>
            {t('equipment.actions.delete')}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  equipmentList: {
    gap: 16,
  },
  equipmentCard: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  cardPressable: {
    flex: 1,
  },
  cardHeader: {
    gap: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  equipmentName: {
    fontWeight: '600',
    flex: 1,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  equipmentDetails: {
    gap: 8,
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waterTypesContainer: {
    marginTop: 8,
  },
  waterTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  waterTypeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
});
