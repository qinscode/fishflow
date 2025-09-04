import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useThemeColor';
import { WATER_TYPE_NAMES } from '@/lib/constants';
import { useTranslation } from '@/lib/i18n';
import { useAppStore, useEquipmentSets } from '@/lib/store';
import { EquipmentSet, WaterType } from '@/lib/types';

export default function CreateEquipmentScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { addEquipmentSet, updateEquipmentSet } = useAppStore();
  const equipmentSets = useEquipmentSets();

  // Helper function to get water type names with translations
  const getWaterTypeName = (waterType: string) => {
    return (
      t(`water.${waterType}` as any) ||
      WATER_TYPE_NAMES[waterType as keyof typeof WATER_TYPE_NAMES] ||
      waterType
    );
  };

  const isEditing = !!id;
  const existingSet = isEditing
    ? equipmentSets.find(set => set.id === id)
    : null;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'wrench.and.screwdriver.fill', // Default icon
    rod: '',
    reel: '',
    line: '',
    hook: '',
    bait: '',
    accessories: [] as string[],
    waterTypes: [] as WaterType[],
    targetFish: [] as string[],
    tags: [] as string[],
    isDefault: false,
  });

  // Modal states
  const [showTargetFishPicker, setShowTargetFishPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Input states
  const [newAccessory, setNewAccessory] = useState('');
  const [newTargetFish, setNewTargetFish] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (existingSet) {
      setFormData({
        name: existingSet.name,
        description: existingSet.description || '',
        icon: 'wrench.and.screwdriver.fill', // Default icon, can be expanded later
        rod: existingSet.rod,
        reel: existingSet.reel,
        line: existingSet.line,
        hook: existingSet.hook,
        bait: existingSet.bait,
        accessories: [...(existingSet.accessories || [])],
        waterTypes: [...existingSet.waterTypes],
        targetFish: [...(existingSet.targetFish || [])],
        tags: [...existingSet.tags],
        isDefault: existingSet.isDefault,
      });
    }
  }, [existingSet]);

  const handleToggleWaterType = (waterType: WaterType) => {
    setFormData(prev => ({
      ...prev,
      waterTypes: prev.waterTypes.includes(waterType)
        ? prev.waterTypes.filter(wt => wt !== waterType)
        : [...prev.waterTypes, waterType],
    }));
  };

  const handleAddAccessory = () => {
    if (
      newAccessory.trim() &&
      !formData.accessories.includes(newAccessory.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        accessories: [...prev.accessories, newAccessory.trim()],
      }));
      setNewAccessory('');
    }
  };

  const handleRemoveAccessory = (accessory: string) => {
    setFormData(prev => ({
      ...prev,
      accessories: prev.accessories.filter(a => a !== accessory),
    }));
  };

  const handleAddTargetFish = () => {
    if (
      newTargetFish.trim() &&
      !formData.targetFish.includes(newTargetFish.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        targetFish: [...prev.targetFish, newTargetFish.trim()],
      }));
      setNewTargetFish('');
      setShowTargetFishPicker(false);
    }
  };

  const handleRemoveTargetFish = (fish: string) => {
    setFormData(prev => ({
      ...prev,
      targetFish: prev.targetFish.filter(f => f !== fish),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert(t('common.notice'), t('equipment.validation.name.required'));
      return false;
    }
    if (!formData.rod.trim()) {
      Alert.alert(t('common.notice'), t('equipment.validation.rod.required'));
      return false;
    }
    if (!formData.reel.trim()) {
      Alert.alert(t('common.notice'), t('equipment.validation.reel.required'));
      return false;
    }
    if (!formData.line.trim()) {
      Alert.alert(t('common.notice'), t('equipment.validation.line.required'));
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && id) {
        updateEquipmentSet(id, formData);
        Alert.alert(t('common.success'), t('equipment.update.success'), [
          { text: t('common.ok'), onPress: () => router.back() },
        ]);
      } else {
        addEquipmentSet(formData);
        Alert.alert(t('common.success'), t('equipment.create.success'), [
          { text: t('common.ok'), onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('equipment.save.failed'));
    }
  };

  const commonTargetFish = [
    t('fish.crucian.carp'),
    t('fish.common.carp'),
    t('fish.grass.carp'),
    t('fish.bream'),
    t('fish.black.carp'),
    t('fish.silver.carp'),
    t('fish.bighead.carp'),
    t('fish.snakehead'),
    t('fish.bass'),
    t('fish.mandarin.fish'),
    t('fish.yellow.catfish'),
    t('fish.catfish'),
    t('fish.tilapia'),
    t('fish.ribbon.fish'),
    t('fish.yellow.croaker'),
  ];

  const commonTags = [
    t('tag.beginner.friendly'),
    t('tag.economical'),
    t('tag.wild.fishing'),
    t('tag.casting'),
    t('tag.sea.fishing'),
    t('tag.rock.fishing'),
    t('tag.lure.fishing'),
    t('tag.night.fishing'),
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={theme.colors.text} />
        </Pressable>
        <ThemedText type="title">
          {isEditing ? t('equipment.edit.title') : t('equipment.create.title')}
        </ThemedText>
        <Pressable onPress={handleSave}>
          <ThemedText
            type="bodySmall"
            style={{ color: theme.colors.primary, fontWeight: '600' }}
          >
            {t('common.save')}
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Info */}
        <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
          <View style={styles.sectionHeaderRow}>
            <IconSymbol
              name="info.circle"
              size={20}
              color={theme.colors.primary}
            />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('equipment.basic.info')}
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <IconSymbol
                name="textformat"
                size={14}
                color={theme.colors.textSecondary}
              />
              <ThemedText
                type="bodySmall"
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                {t('equipment.form.name')} *
              </ThemedText>
            </View>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.colors.surface },
              ]}
              placeholder={t('equipment.form.name.placeholder')}
              value={formData.name}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, name: text }))
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <IconSymbol
                name="doc.text"
                size={14}
                color={theme.colors.textSecondary}
              />
              <ThemedText
                type="bodySmall"
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                {t('equipment.form.description')}
              </ThemedText>
            </View>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.colors.surface },
              ]}
              placeholder={t('equipment.form.description.placeholder')}
              multiline
              numberOfLines={3}
              value={formData.description}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, description: text }))
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Pressable
              style={styles.toggleRow}
              onPress={() =>
                setFormData(prev => ({ ...prev, isDefault: !prev.isDefault }))
              }
            >
              <View style={styles.toggleInfo}>
                <IconSymbol
                  name="star"
                  size={16}
                  color={theme.colors.textSecondary}
                />
                <View style={styles.toggleText}>
                  <ThemedText type="body">
                    {t('equipment.form.set.default')}
                  </ThemedText>
                  <ThemedText
                    type="bodySmall"
                    style={{ color: theme.colors.textSecondary, marginTop: 2 }}
                  >
                    {t('equipment.form.set.default.description')}
                  </ThemedText>
                </View>
              </View>
              <View
                style={[
                  styles.toggle,
                  {
                    backgroundColor: formData.isDefault
                      ? theme.colors.primary
                      : theme.colors.surface,
                  },
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: theme.colors.background,
                      transform: [{ translateX: formData.isDefault ? 20 : 2 }],
                    },
                  ]}
                />
              </View>
            </Pressable>
          </View>
        </ThemedView>

        {/* Equipment Selection */}
        <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
          <View style={styles.sectionHeaderRow}>
            <IconSymbol
              name="wrench.and.screwdriver"
              size={20}
              color={theme.colors.primary}
            />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('equipment.config')}
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <IconSymbol
                name="line.3.horizontal"
                size={14}
                color={theme.colors.textSecondary}
              />
              <ThemedText
                type="bodySmall"
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                {t('equipment.form.rod')} *
              </ThemedText>
            </View>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.colors.surface },
              ]}
              placeholder={t('equipment.form.rod.placeholder')}
              value={formData.rod}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, rod: text }))
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <IconSymbol
                name="circle"
                size={14}
                color={theme.colors.textSecondary}
              />
              <ThemedText
                type="bodySmall"
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                {t('equipment.form.reel')} *
              </ThemedText>
            </View>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.colors.surface },
              ]}
              placeholder={t('equipment.form.reel.placeholder')}
              value={formData.reel}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, reel: text }))
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <IconSymbol
                name="link"
                size={14}
                color={theme.colors.textSecondary}
              />
              <ThemedText
                type="bodySmall"
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                {t('equipment.form.line')} *
              </ThemedText>
            </View>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.colors.surface },
              ]}
              placeholder={t('equipment.form.line.placeholder')}
              value={formData.line}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, line: text }))
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <IconSymbol
                name="staple"
                size={14}
                color={theme.colors.textSecondary}
              />
              <ThemedText
                type="bodySmall"
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                {t('equipment.form.hook')}
              </ThemedText>
            </View>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.colors.surface },
              ]}
              placeholder={t('equipment.form.hook.placeholder')}
              value={formData.hook}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, hook: text }))
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <IconSymbol
                name="leaf"
                size={14}
                color={theme.colors.textSecondary}
              />
              <ThemedText
                type="bodySmall"
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                {t('equipment.form.bait')}
              </ThemedText>
            </View>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.colors.surface },
              ]}
              placeholder={t('equipment.form.bait.placeholder')}
              value={formData.bait}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, bait: text }))
              }
            />
          </View>
        </ThemedView>

        {/* Accessories */}
        <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
          <View style={styles.sectionHeaderRow}>
            <IconSymbol
              name="backpack"
              size={20}
              color={theme.colors.primary}
            />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('equipment.form.accessories')}
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.addItemRow}>
              <TextInput
                style={[
                  styles.addItemInput,
                  { backgroundColor: theme.colors.surface },
                ]}
                placeholder={t('equipment.form.accessories.placeholder')}
                value={newAccessory}
                onChangeText={setNewAccessory}
                onSubmitEditing={handleAddAccessory}
              />
              <Pressable style={styles.addButton} onPress={handleAddAccessory}>
                <IconSymbol
                  name="plus"
                  size={20}
                  color={theme.colors.primary}
                />
              </Pressable>
            </View>
          </View>

          {formData.accessories.length > 0 && (
            <View style={styles.tagContainer}>
              {formData.accessories.map((accessory, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <ThemedText type="bodySmall">{accessory}</ThemedText>
                  <Pressable onPress={() => handleRemoveAccessory(accessory)}>
                    <IconSymbol
                      name="xmark"
                      size={12}
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ThemedView>

        {/* Water Types */}
        <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
          <View style={styles.sectionHeaderRow}>
            <IconSymbol
              name="water.waves"
              size={20}
              color={theme.colors.primary}
            />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('equipment.form.water.types.label')}
            </ThemedText>
          </View>

          <View style={styles.waterTypeGrid}>
            {Object.entries(WATER_TYPE_NAMES).map(([type, name]) => (
              <Pressable
                key={type}
                style={[
                  styles.waterTypeItem,
                  {
                    backgroundColor: formData.waterTypes.includes(
                      type as WaterType
                    )
                      ? theme.colors.primary
                      : theme.colors.surface,
                    borderColor: formData.waterTypes.includes(type as WaterType)
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
                onPress={() => handleToggleWaterType(type as WaterType)}
              >
                <ThemedText
                  type="bodySmall"
                  style={{
                    color: formData.waterTypes.includes(type as WaterType)
                      ? 'white'
                      : theme.colors.text,
                  }}
                >
                  {getWaterTypeName(type)}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </ThemedView>

        {/* Target Fish */}
        <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
          <View style={styles.sectionHeaderRow}>
            <IconSymbol name="fish" size={20} color={theme.colors.primary} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('equipment.form.target.fish')}
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <Pressable
              style={[styles.picker, { backgroundColor: theme.colors.surface }]}
              onPress={() => setShowTargetFishPicker(true)}
            >
              <View style={styles.pickerContent}>
                <IconSymbol
                  name="plus"
                  size={16}
                  color={theme.colors.primary}
                />
                <ThemedText
                  type="body"
                  style={{ color: theme.colors.text, marginLeft: 8 }}
                >
                  {t('equipment.form.target.fish.add')}
                </ThemedText>
              </View>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={theme.colors.textSecondary}
              />
            </Pressable>
          </View>

          {formData.targetFish.length > 0 && (
            <View style={styles.tagContainer}>
              {formData.targetFish.map((fish, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: theme.colors.secondary, opacity: 0.1 },
                  ]}
                >
                  <ThemedText
                    type="bodySmall"
                    style={{ color: theme.colors.secondary }}
                  >
                    {fish}
                  </ThemedText>
                  <Pressable onPress={() => handleRemoveTargetFish(fish)}>
                    <IconSymbol
                      name="xmark"
                      size={12}
                      color={theme.colors.secondary}
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ThemedView>

        {/* Tags */}
        <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
          <View style={styles.sectionHeaderRow}>
            <IconSymbol name="tag" size={20} color={theme.colors.primary} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('equipment.form.tags.label')}
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.addItemRow}>
              <TextInput
                style={[
                  styles.addItemInput,
                  { backgroundColor: theme.colors.surface },
                ]}
                placeholder={t('equipment.form.tags.add.placeholder')}
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={handleAddTag}
              />
              <Pressable style={styles.addButton} onPress={handleAddTag}>
                <IconSymbol
                  name="plus"
                  size={20}
                  color={theme.colors.primary}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.commonTagsContainer}>
            <View style={styles.labelRow}>
              <IconSymbol
                name="star"
                size={14}
                color={theme.colors.textSecondary}
              />
              <ThemedText
                type="bodySmall"
                style={{ color: theme.colors.textSecondary, marginBottom: 8 }}
              >
                {t('equipment.form.tags.common')}
              </ThemedText>
            </View>
            <View style={styles.tagContainer}>
              {commonTags
                .filter(tag => !formData.tags.includes(tag))
                .map(tag => (
                  <Pressable
                    key={tag}
                    style={[
                      styles.tag,
                      {
                        backgroundColor: theme.colors.surface,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() =>
                      setFormData(prev => ({
                        ...prev,
                        tags: [...prev.tags, tag],
                      }))
                    }
                  >
                    <ThemedText
                      type="bodySmall"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {tag}
                    </ThemedText>
                    <IconSymbol
                      name="plus"
                      size={12}
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>
                ))}
            </View>
          </View>

          {formData.tags.length > 0 && (
            <View style={styles.tagContainer}>
              {formData.tags.map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: theme.colors.accent, opacity: 0.1 },
                  ]}
                >
                  <ThemedText
                    type="bodySmall"
                    style={{ color: theme.colors.accent }}
                  >
                    {tag}
                  </ThemedText>
                  <Pressable onPress={() => handleRemoveTag(tag)}>
                    <IconSymbol
                      name="xmark"
                      size={12}
                      color={theme.colors.accent}
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ThemedView>
      </ScrollView>

      {/* Target Fish Picker Modal */}
      <Modal visible={showTargetFishPicker} animationType="slide">
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowTargetFishPicker(false)}>
              <ThemedText type="body" style={{ color: theme.colors.primary }}>
                {t('common.cancel')}
              </ThemedText>
            </Pressable>
            <ThemedText type="title">
              {t('equipment.form.target.fish.select')}
            </ThemedText>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <View style={styles.addItemRow}>
                <TextInput
                  style={[
                    styles.addItemInput,
                    { backgroundColor: theme.colors.surface },
                  ]}
                  placeholder={t('equipment.form.target.fish.placeholder')}
                  value={newTargetFish}
                  onChangeText={setNewTargetFish}
                  onSubmitEditing={handleAddTargetFish}
                  autoFocus
                />
                <Pressable
                  style={styles.addButton}
                  onPress={handleAddTargetFish}
                >
                  <IconSymbol
                    name="plus"
                    size={20}
                    color={theme.colors.primary}
                  />
                </Pressable>
              </View>
            </View>

            <ThemedText
              type="bodySmall"
              style={{ color: theme.colors.textSecondary, marginBottom: 16 }}
            >
              {t('equipment.form.target.fish.common')}
            </ThemedText>

            {commonTargetFish
              .filter(fish => !formData.targetFish.includes(fish))
              .map(fish => (
                <Pressable
                  key={fish}
                  style={styles.modalOption}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      targetFish: [...prev.targetFish, fish],
                    }));
                    setShowTargetFishPicker(false);
                  }}
                >
                  <ThemedText type="body">{fish}</ThemedText>
                </Pressable>
              ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
    paddingBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '500',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  textInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minHeight: 48,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  toggleText: {
    flex: 1,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  addItemRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  addItemInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  waterTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  waterTypeItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  commonTagsContainer: {
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});
