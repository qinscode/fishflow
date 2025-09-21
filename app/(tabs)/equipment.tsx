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
  const hexToRgba = (hex: string, alpha: number) => {
    const sanitized = hex.replace('#', '');
    if (sanitized.length !== 6) {
      return hex;
    }
    const numeric = parseInt(sanitized, 16);
    const r = (numeric >> 16) & 255;
    const g = (numeric >> 8) & 255;
    const b = numeric & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
  };

  const withThemeAlpha = (hex: string, lightAlpha = 0.14, darkAlpha = 0.28) =>
    hexToRgba(hex, theme.name === 'light' ? lightAlpha : darkAlpha);

  const fieldPalette = {
    rod: theme.colors.primary,
    reel: theme.colors.secondary,
    line: theme.colors.info,
    hook: theme.colors.warning,
    bait: theme.colors.accent,
    accessories: theme.colors.success,
  } as const;

  const infoFields = [
    {
      key: 'rod',
      icon: 'line.3.horizontal',
      label: t('equipment.form.rod'),
      value: set.rod,
    },
    {
      key: 'reel',
      icon: 'circle.grid.3x3.fill',
      label: t('equipment.form.reel'),
      value: set.reel,
    },
    {
      key: 'line',
      icon: 'link',
      label: t('equipment.form.line'),
      value: set.line,
    },
    {
      key: 'hook',
      icon: 'paperclip',
      label: t('equipment.form.hook'),
      value: set.hook,
    },
    {
      key: 'bait',
      icon: 'fish',
      label: t('equipment.form.bait'),
      value: set.bait,
    },
  ]
    .filter(item => item.value)
    .map(field => {
      const color =
        fieldPalette[field.key as keyof typeof fieldPalette] ||
        theme.colors.primary;
      return {
        ...field,
        iconColor: color,
        iconBackground: withThemeAlpha(color),
      };
    });

  const accessories = (set.accessories ?? []).filter(Boolean);
  if (accessories.length > 0) {
    const color = fieldPalette.accessories;
    infoFields.push({
      key: 'accessories',
      icon: 'wrench.adjustable',
      label: t('equipment.form.accessories'),
      value:
        accessories.length <= 2
          ? accessories.join(' • ')
          : `${accessories.slice(0, 2).join(' • ')} +${
              accessories.length - 2
            }`,
      iconColor: color,
      iconBackground: withThemeAlpha(color),
    });
  }

  const tags = (set.tags ?? []).filter(Boolean);
  const targetFish = (set.targetFish ?? []).filter(Boolean);

  const iconBackground = withThemeAlpha(theme.colors.primary);
  const defaultIconBackground = withThemeAlpha(
    theme.colors.secondary,
    0.18,
    0.32
  );
  const editButtonBackground = withThemeAlpha(theme.colors.primary, 0.12, 0.24);
  const deleteButtonBackground = withThemeAlpha(theme.colors.error, 0.14, 0.28);
  const infoCardBackground =
    theme.name === 'light'
      ? 'rgba(248, 250, 252, 0.88)'
      : 'rgba(255, 255, 255, 0.06)';
  const chipBackground = withThemeAlpha(theme.colors.primary, 0.08, 0.16);
  const statBgUsage = withThemeAlpha(theme.colors.primary, 0.12, 0.24);
  const statBgSuccess = withThemeAlpha(theme.colors.success, 0.12, 0.24);
  const statBgCatch = withThemeAlpha(theme.colors.accent, 0.12, 0.24);

  return (
    <ThemedView type="card" style={[styles.equipmentCard, theme.shadows.md]}>
      <Pressable style={styles.cardPressable} onPress={onPress}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.headerLeft}>
            <View
              style={[styles.iconBadge, { backgroundColor: iconBackground }]}
            >
              <IconSymbol
                name={(set.icon as any) || 'backpack.fill'}
                size={20}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.headerText}>
              <ThemedText
                type="subtitle"
                style={styles.equipmentName}
                numberOfLines={1}
              >
                {set.name}
              </ThemedText>

              {set.description ? (
                <ThemedText
                  type="bodySmall"
                  numberOfLines={2}
                  style={{ color: theme.colors.textSecondary }}
                >
                  {set.description}
                </ThemedText>
              ) : null}

              {tags.length > 0 && (
                <View style={styles.tagRow}>
                  {tags.slice(0, 2).map(tag => (
                    <View
                      key={tag}
                      style={[
                        styles.smallTag,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.borderLight,
                        },
                      ]}
                    >
                      <ThemedText
                        type="caption"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {tag}
                      </ThemedText>
                    </View>
                  ))}
                  {tags.length > 2 && (
                    <View
                      style={[
                        styles.smallTag,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.borderLight,
                        },
                      ]}
                    >
                      <ThemedText
                        type="caption"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        +{tags.length - 2}
                      </ThemedText>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          <View style={styles.headerRight}>
            {set.isDefault ? (
              <View
                style={[
                  styles.defaultIcon,
                  { backgroundColor: defaultIconBackground },
                ]}
              >
                <IconSymbol
                  name="star.fill"
                  size={16}
                  color={theme.colors.secondary}
                />
              </View>
            ) : null}

            <View style={styles.headerActions}>
              <Pressable
                hitSlop={12}
                style={[
                  styles.iconAction,
                  { backgroundColor: editButtonBackground },
                ]}
                onPress={event => {
                  event.stopPropagation();
                  onPress();
                }}
              >
                <IconSymbol
                  name="pencil"
                  size={16}
                  color={theme.colors.primary}
                />
              </Pressable>
              <Pressable
                hitSlop={12}
                style={[
                  styles.iconAction,
                  { backgroundColor: deleteButtonBackground },
                ]}
                onPress={event => {
                  event.stopPropagation();
                  onDelete();
                }}
              >
                <IconSymbol
                  name="trash"
                  size={16}
                  color={theme.colors.error}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {infoFields.length > 0 && (
          <View style={styles.infoGrid}>
            {infoFields.map(field => (
              <View
                key={field.key}
                style={[
                  styles.infoCard,
                  {
                    borderColor: theme.colors.borderLight,
                    backgroundColor: infoCardBackground,
                  },
                ]}
              >
                <View style={styles.infoLabelRow}>
                  <View
                    style={[
                      styles.infoIcon,
                      { backgroundColor: field.iconBackground as string },
                    ]}
                  >
                    <IconSymbol
                      name={field.icon as any}
                      size={14}
                      color={field.iconColor as string}
                    />
                  </View>
                  <ThemedText
                    type="caption"
                    style={{
                      color: theme.colors.textSecondary,
                      fontWeight: '600',
                      letterSpacing: 0.3,
                    }}
                  >
                    {field.label}
                  </ThemedText>
                </View>
                <ThemedText
                  type="bodySmall"
                  style={{ color: theme.colors.text }}
                  numberOfLines={2}
                >
                  {field.value}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {(set.waterTypes.length > 0 || targetFish.length > 0 || accessories.length > 0) && (
          <View style={styles.metaSection}>
            {set.waterTypes.length > 0 && (
              <View style={styles.metaBlock}>
                <ThemedText
                  type="caption"
                  style={{ color: theme.colors.textSecondary, fontWeight: '600' }}
                >
                  {t('equipment.form.water.types.label')}
                </ThemedText>
                <View style={styles.waterTypes}>
                  {set.waterTypes.slice(0, 4).map(waterType => (
                    <View
                      key={waterType}
                      style={[
                        styles.waterTypeTag,
                        { backgroundColor: chipBackground },
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
                  {set.waterTypes.length > 4 && (
                    <View
                      style={[
                        styles.waterTypeTag,
                        { backgroundColor: chipBackground },
                      ]}
                    >
                      <ThemedText
                        type="caption"
                        style={{ color: theme.colors.text }}
                      >
                        +{set.waterTypes.length - 4}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            )}

            {targetFish.length > 0 && (
              <View style={styles.metaBlock}>
                <ThemedText
                  type="caption"
                  style={{ color: theme.colors.textSecondary, fontWeight: '600' }}
                >
                  {t('equipment.form.target.fish')}
                </ThemedText>
                <View style={styles.waterTypes}>
                  {targetFish.slice(0, 3).map(fish => (
                    <View
                      key={fish}
                      style={[
                        styles.waterTypeTag,
                        { backgroundColor: theme.colors.surface },
                      ]}
                    >
                      <ThemedText
                        type="caption"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {fish}
                      </ThemedText>
                    </View>
                  ))}
                  {targetFish.length > 3 && (
                    <View
                      style={[
                        styles.waterTypeTag,
                        { backgroundColor: theme.colors.surface },
                      ]}
                    >
                      <ThemedText
                        type="caption"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        +{targetFish.length - 3}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            )}

            {accessories.length > 0 && (
              <View style={styles.metaBlock}>
                <ThemedText
                  type="caption"
                  style={{ color: theme.colors.textSecondary, fontWeight: '600' }}
                >
                  {t('equipment.form.accessories')}
                </ThemedText>
                <ThemedText
                  type="bodySmall"
                  style={{ color: theme.colors.text }}
                  numberOfLines={2}
                >
                  {infoFields.find(field => field.key === 'accessories')?.value}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {stats && (
          <View style={styles.statsPills}>
            <View style={[styles.statPill, { backgroundColor: statBgUsage }]}>
              <IconSymbol
                name="clock.arrow.2.circlepath"
                size={14}
                color={theme.colors.primary}
              />
              <View>
                <ThemedText
                  type="caption"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {t('equipment.stats.usage')}
                </ThemedText>
                <ThemedText
                  type="bodySmall"
                  style={[styles.statValue, { color: theme.colors.primary }]}
                >
                  {stats.usageCount}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.statPill, { backgroundColor: statBgSuccess }]}>
              <IconSymbol
                name="checkmark.seal.fill"
                size={14}
                color={theme.colors.secondary}
              />
              <View>
                <ThemedText
                  type="caption"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {t('equipment.stats.success')}
                </ThemedText>
                <ThemedText
                  type="bodySmall"
                  style={[styles.statValue, { color: theme.colors.secondary }]}
                >
                  {Math.round(stats.successRate * 100)}%
                </ThemedText>
              </View>
            </View>

            <View style={[styles.statPill, { backgroundColor: statBgCatch }]}>
              <IconSymbol
                name="fish.fill"
                size={14}
                color={theme.colors.accent}
              />
              <View>
                <ThemedText
                  type="caption"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {t('equipment.stats.catches')}
                </ThemedText>
                <ThemedText
                  type="bodySmall"
                  style={[styles.statValue, { color: theme.colors.accent }]}
                >
                  {stats.catchCount}
                </ThemedText>
              </View>
            </View>
          </View>
        )}
      </Pressable>
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
    borderRadius: 20,
    padding: 20,
  },
  cardPressable: {
    flex: 1,
    gap: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 8,
  },
  equipmentName: {
    fontWeight: '600',
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  smallTag: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 10,
  },
  defaultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 8,
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 140,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaSection: {
    gap: 12,
  },
  metaBlock: {
    gap: 8,
  },
  waterTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  waterTypeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statsPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statValue: {
    fontWeight: '600',
  },
});
