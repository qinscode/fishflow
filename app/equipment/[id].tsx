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
import { WATER_TYPE_NAMES, EQUIPMENT_TYPES } from '@/lib/constants';
import { useAppStore, useEquipmentSets } from '@/lib/store';
import { EquipmentSet, WaterType } from '@/lib/types';

export default function EditEquipmentScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateEquipmentSet, deleteEquipmentSet } = useAppStore();
  const equipmentSets = useEquipmentSets();

  const existingSet = equipmentSets.find(set => set.id === id);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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
  const [showEquipmentPicker, setShowEquipmentPicker] = useState(false);
  const [showWaterTypePicker, setShowWaterTypePicker] = useState(false);
  const [showTargetFishPicker, setShowTargetFishPicker] = useState(false);
  const [currentPickerType, setCurrentPickerType] = useState<
    keyof typeof EQUIPMENT_TYPES | ''
  >('');

  // Input states
  const [newAccessory, setNewAccessory] = useState('');
  const [newTargetFish, setNewTargetFish] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (!existingSet) {
      Alert.alert('错误', '装备组合不存在', [
        { text: '确定', onPress: () => router.back() },
      ]);
      return;
    }

    setFormData({
      name: existingSet.name,
      description: existingSet.description || '',
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
  }, [existingSet]);

  const handleSelectEquipment = (
    type: keyof typeof EQUIPMENT_TYPES,
    item: string
  ) => {
    setFormData(prev => ({ ...prev, [type]: item }));
    setShowEquipmentPicker(false);
    setCurrentPickerType('');
  };

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
      Alert.alert('提示', '请输入装备组合名称');
      return false;
    }
    if (!formData.rod.trim()) {
      Alert.alert('提示', '请选择钓竿');
      return false;
    }
    if (!formData.reel.trim()) {
      Alert.alert('提示', '请选择渔轮');
      return false;
    }
    if (!formData.line.trim()) {
      Alert.alert('提示', '请选择钓线');
      return false;
    }
    if (!formData.hook.trim()) {
      Alert.alert('提示', '请选择鱼钩');
      return false;
    }
    if (!formData.bait.trim()) {
      Alert.alert('提示', '请选择饵料');
      return false;
    }
    if (formData.waterTypes.length === 0) {
      Alert.alert('提示', '请至少选择一种适用水域类型');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    try {
      updateEquipmentSet(id, formData);
      Alert.alert('成功', '装备组合已更新', [
        { text: '确定', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '确认删除',
      `确定要删除装备组合「${existingSet?.name}」吗？此操作无法撤销。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            try {
              deleteEquipmentSet(id);
              Alert.alert('成功', '装备组合已删除', [
                { text: '确定', onPress: () => router.back() },
              ]);
            } catch (error) {
              Alert.alert('错误', '删除失败，请重试');
            }
          },
        },
      ]
    );
  };

  const commonTargetFish = [
    '鲫鱼',
    '鲤鱼',
    '草鱼',
    '鳊鱼',
    '青鱼',
    '鲢鱼',
    '鳙鱼',
    '黑鱼',
    '鲈鱼',
    '鳜鱼',
    '黄颡鱼',
    '鲶鱼',
    '罗非鱼',
    '带鱼',
    '黄花鱼',
  ];

  const commonTags = [
    '新手友好',
    '经济实惠',
    '野钓',
    '抛投',
    '海钓',
    '矶钓',
    '路亚',
    '夜钓',
  ];

  if (!existingSet) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ThemedView style={styles.errorContainer}>
          <ThemedText type="title">装备组合不存在</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={theme.colors.text} />
        </Pressable>
        <ThemedText type="title">编辑装备组合</ThemedText>
        <View style={styles.headerActions}>
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <IconSymbol name="trash" size={20} color={theme.colors.error} />
          </Pressable>
          <Pressable onPress={handleSave}>
            <ThemedText
              type="bodySmall"
              style={{ color: theme.colors.primary, fontWeight: '600' }}
            >
              保存
            </ThemedText>
          </Pressable>
        </View>
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
              基本信息
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText
              type="bodySmall"
              style={[styles.label, { color: theme.colors.textSecondary }]}
            >
              装备名称 *
            </ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.colors.surface },
              ]}
              placeholder="例如：湖泊休闲组合"
              value={formData.name}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, name: text }))
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText
              type="bodySmall"
              style={[styles.label, { color: theme.colors.textSecondary }]}
            >
              描述
            </ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.colors.surface },
              ]}
              placeholder="简单描述这套装备的用途和特点"
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
              <View>
                <ThemedText type="body">设为默认装备</ThemedText>
                <ThemedText
                  type="bodySmall"
                  style={{ color: theme.colors.textSecondary, marginTop: 2 }}
                >
                  在记录钓获时优先显示
                </ThemedText>
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
              装备配置
            </ThemedText>
          </View>

          {Object.entries(EQUIPMENT_TYPES).map(([type, items]) => (
            <View key={type} style={styles.inputGroup}>
              <ThemedText
                type="bodySmall"
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                {type === 'rods'
                  ? '钓竿'
                  : type === 'reels'
                    ? '渔轮'
                    : type === 'lines'
                      ? '钓线'
                      : type === 'hooks'
                        ? '鱼钩'
                        : type === 'baits'
                          ? '饵料'
                          : type}{' '}
                *
              </ThemedText>

              <Pressable
                style={[
                  styles.picker,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => {
                  setCurrentPickerType(type as keyof typeof EQUIPMENT_TYPES);
                  setShowEquipmentPicker(true);
                }}
              >
                <ThemedText
                  type="body"
                  style={{
                    color: formData[type.slice(0, -1) as keyof typeof formData]
                      ? theme.colors.text
                      : theme.colors.textSecondary,
                  }}
                >
                  {(formData[
                    type.slice(0, -1) as keyof typeof formData
                  ] as string) ||
                    `选择${type === 'rods' ? '钓竿' : type === 'reels' ? '渔轮' : type === 'lines' ? '钓线' : type === 'hooks' ? '鱼钩' : type === 'baits' ? '饵料' : type}`}
                </ThemedText>
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </Pressable>
            </View>
          ))}
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
              配件附件
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.addItemRow}>
              <TextInput
                style={[
                  styles.addItemInput,
                  { backgroundColor: theme.colors.surface },
                ]}
                placeholder="添加配件（抄网、鱼护等）"
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
              适用水域 *
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
                  {name}
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
              目标鱼种
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <Pressable
              style={[styles.picker, { backgroundColor: theme.colors.surface }]}
              onPress={() => setShowTargetFishPicker(true)}
            >
              <ThemedText type="body" style={{ color: theme.colors.text }}>
                添加目标鱼种
              </ThemedText>
              <IconSymbol name="plus" size={16} color={theme.colors.primary} />
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
              标签
            </ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.addItemRow}>
              <TextInput
                style={[
                  styles.addItemInput,
                  { backgroundColor: theme.colors.surface },
                ]}
                placeholder="添加标签"
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
            <ThemedText
              type="bodySmall"
              style={{ color: theme.colors.textSecondary, marginBottom: 8 }}
            >
              常用标签：
            </ThemedText>
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

      {/* Equipment Picker Modal */}
      <Modal visible={showEquipmentPicker} animationType="slide">
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowEquipmentPicker(false)}>
              <ThemedText type="body" style={{ color: theme.colors.primary }}>
                取消
              </ThemedText>
            </Pressable>
            <ThemedText type="title">
              选择
              {currentPickerType === 'rods'
                ? '钓竿'
                : currentPickerType === 'reels'
                  ? '渔轮'
                  : currentPickerType === 'lines'
                    ? '钓线'
                    : currentPickerType === 'hooks'
                      ? '鱼钩'
                      : currentPickerType === 'baits'
                        ? '饵料'
                        : '装备'}
            </ThemedText>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {currentPickerType &&
              EQUIPMENT_TYPES[currentPickerType]?.map(item => (
                <Pressable
                  key={item}
                  style={styles.modalOption}
                  onPress={() => handleSelectEquipment(currentPickerType, item)}
                >
                  <ThemedText type="body">{item}</ThemedText>
                </Pressable>
              ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
                取消
              </ThemedText>
            </Pressable>
            <ThemedText type="title">选择目标鱼种</ThemedText>
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
                  placeholder="输入鱼种名称"
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
              常见鱼种：
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deleteButton: {
    padding: 8,
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
    fontWeight: '500',
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
