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
import { useAppStore, useEquipmentSets } from '@/lib/store';
import { EquipmentSet, WaterType } from '@/lib/types';
import { WATER_TYPE_NAMES } from '@/lib/constants';

export default function CreateEquipmentScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { addEquipmentSet, updateEquipmentSet } = useAppStore();
  const equipmentSets = useEquipmentSets();
  
  const isEditing = !!id;
  const existingSet = isEditing ? equipmentSets.find(set => set.id === id) : null;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'wrench.and.screwdriver.fill', // 默认图标
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
        icon: 'wrench.and.screwdriver.fill', // 默认图标，后续可以扩展
        rod: existingSet.rod,
        reel: existingSet.reel,
        line: existingSet.line,
        hook: existingSet.hook,
        bait: existingSet.bait,
        accessories: [...existingSet.accessories || []],
        waterTypes: [...existingSet.waterTypes],
        targetFish: [...existingSet.targetFish || []],
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
        : [...prev.waterTypes, waterType]
    }));
  };

  const handleAddAccessory = () => {
    if (newAccessory.trim() && !formData.accessories.includes(newAccessory.trim())) {
      setFormData(prev => ({
        ...prev,
        accessories: [...prev.accessories, newAccessory.trim()]
      }));
      setNewAccessory('');
    }
  };

  const handleRemoveAccessory = (accessory: string) => {
    setFormData(prev => ({
      ...prev,
      accessories: prev.accessories.filter(a => a !== accessory)
    }));
  };

  const handleAddTargetFish = () => {
    if (newTargetFish.trim() && !formData.targetFish.includes(newTargetFish.trim())) {
      setFormData(prev => ({
        ...prev,
        targetFish: [...prev.targetFish, newTargetFish.trim()]
      }));
      setNewTargetFish('');
      setShowTargetFishPicker(false);
    }
  };

  const handleRemoveTargetFish = (fish: string) => {
    setFormData(prev => ({
      ...prev,
      targetFish: prev.targetFish.filter(f => f !== fish)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
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
    if (!validateForm()) return;

    try {
      if (isEditing && id) {
        updateEquipmentSet(id, formData);
        Alert.alert('成功', '装备组合已更新', [
          { text: '确定', onPress: () => router.back() }
        ]);
      } else {
        addEquipmentSet(formData);
        Alert.alert('成功', '装备组合已创建', [
          { text: '确定', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  const commonTargetFish = [
    '鲫鱼', '鲤鱼', '草鱼', '鳊鱼', '青鱼', '鲢鱼', '鳙鱼', '黑鱼', 
    '鲈鱼', '鳜鱼', '黄颡鱼', '鲶鱼', '罗非鱼', '带鱼', '黄花鱼'
  ];

  const commonTags = ['新手友好', '经济实惠', '野钓', '抛投', '海钓', '矶钓', '路亚', '夜钓'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={theme.colors.text} />
        </Pressable>
        <ThemedText type="title">
          {isEditing ? '编辑装备组合' : '创建装备组合'}
        </ThemedText>
        <Pressable onPress={handleSave}>
          <ThemedText type="bodySmall" style={{ color: theme.colors.primary, fontWeight: '600' }}>
            保存
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Basic Info */}
        <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
          <View style={styles.sectionHeaderRow}>
            <IconSymbol name="info.circle" size={20} color={theme.colors.primary} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              基本信息
            </ThemedText>
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <IconSymbol name="textformat" size={16} color={theme.colors.textSecondary} />
              <ThemedText type="bodySmall" style={[styles.label, { color: theme.colors.textSecondary }]}>
                装备名称 *
              </ThemedText>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
              placeholder="例如：湖泊休闲组合"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <IconSymbol name="doc.text" size={16} color={theme.colors.textSecondary} />
              <ThemedText type="bodySmall" style={[styles.label, { color: theme.colors.textSecondary }]}>
                描述
              </ThemedText>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
              placeholder="简单描述这套装备的用途和特点"
              multiline
              numberOfLines={3}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Pressable 
              style={styles.toggleRow}
              onPress={() => setFormData(prev => ({ ...prev, isDefault: !prev.isDefault }))}
            >
              <View style={styles.toggleInfo}>
                <IconSymbol name="star" size={16} color={theme.colors.textSecondary} />
                <View style={styles.toggleText}>
                  <ThemedText type="body">设为默认装备</ThemedText>
                  <ThemedText type="bodySmall" style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
                    在记录钓获时优先显示
                  </ThemedText>
                </View>
              </View>
              <View style={[
                styles.toggle,
                { backgroundColor: formData.isDefault ? theme.colors.primary : theme.colors.surface }
              ]}>
                <View style={[
                  styles.toggleThumb,
                  { 
                    backgroundColor: theme.colors.background,
                    transform: [{ translateX: formData.isDefault ? 20 : 2 }]
                  }
                ]} />
              </View>
            </Pressable>
          </View>
        </ThemedView>

        {/* Equipment Selection */}
        <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
          <View style={styles.sectionHeaderRow}>
            <IconSymbol name="wrench.and.screwdriver" size={20} color={theme.colors.primary} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              装备配置
            </ThemedText>
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <IconSymbol name="line.3.horizontal" size={16} color={theme.colors.textSecondary} />
              <ThemedText type="bodySmall" style={[styles.label, { color: theme.colors.textSecondary }]}>
                钓竿 *
              </ThemedText>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
              placeholder="例如：手竿 4.5米 或 海竿 3.6米"
              value={formData.rod}
              onChangeText={(text) => setFormData(prev => ({ ...prev, rod: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <IconSymbol name="circle" size={16} color={theme.colors.textSecondary} />
              <ThemedText type="bodySmall" style={[styles.label, { color: theme.colors.textSecondary }]}>
                渔轮 *
              </ThemedText>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
              placeholder="例如：纺车轮 2000型 或 水滴轮"
              value={formData.reel}
              onChangeText={(text) => setFormData(prev => ({ ...prev, reel: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <IconSymbol name="link" size={16} color={theme.colors.textSecondary} />
              <ThemedText type="bodySmall" style={[styles.label, { color: theme.colors.textSecondary }]}>
                钓线 *
              </ThemedText>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
              placeholder="例如：尼龙线 2.0号 或 PE线 1.5号"
              value={formData.line}
              onChangeText={(text) => setFormData(prev => ({ ...prev, line: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <IconSymbol name="staple" size={16} color={theme.colors.textSecondary} />
              <ThemedText type="bodySmall" style={[styles.label, { color: theme.colors.textSecondary }]}>
                鱼钩 *
              </ThemedText>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
              placeholder="例如：袖钩 5号 或 新关东 1号"
              value={formData.hook}
              onChangeText={(text) => setFormData(prev => ({ ...prev, hook: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <IconSymbol name="leaf" size={16} color={theme.colors.textSecondary} />
              <ThemedText type="bodySmall" style={[styles.label, { color: theme.colors.textSecondary }]}>
                饵料 *
              </ThemedText>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.colors.surface }]}
              placeholder="例如：蚯蚓 或 玉米 或 商品饵"
              value={formData.bait}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bait: text }))}
            />
          </View>
        </ThemedView>

        {/* Accessories */}
        <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
          <View style={styles.sectionHeaderRow}>
            <IconSymbol name="backpack" size={20} color={theme.colors.primary} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              配件附件
            </ThemedText>
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.addItemRow}>
              <TextInput
                style={[styles.addItemInput, { backgroundColor: theme.colors.surface }]}
                placeholder="添加配件（抄网、鱼护等）"
                value={newAccessory}
                onChangeText={setNewAccessory}
                onSubmitEditing={handleAddAccessory}
              />
              <Pressable style={styles.addButton} onPress={handleAddAccessory}>
                <IconSymbol name="plus" size={20} color={theme.colors.primary} />
              </Pressable>
            </View>
          </View>

          {formData.accessories.length > 0 && (
            <View style={styles.tagContainer}>
              {formData.accessories.map((accessory, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: theme.colors.surface }]}>
                  <ThemedText type="bodySmall">{accessory}</ThemedText>
                  <Pressable onPress={() => handleRemoveAccessory(accessory)}>
                    <IconSymbol name="xmark" size={12} color={theme.colors.textSecondary} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ThemedView>

        {/* Water Types */}
        <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
          <View style={styles.sectionHeaderRow}>
            <IconSymbol name="water.waves" size={20} color={theme.colors.primary} />
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
                    backgroundColor: formData.waterTypes.includes(type as WaterType) 
                      ? theme.colors.primary 
                      : theme.colors.surface,
                    borderColor: formData.waterTypes.includes(type as WaterType)
                      ? theme.colors.primary
                      : theme.colors.border,
                  }
                ]}
                onPress={() => handleToggleWaterType(type as WaterType)}
              >
                <ThemedText 
                  type="bodySmall" 
                  style={{ 
                    color: formData.waterTypes.includes(type as WaterType) 
                      ? 'white' 
                      : theme.colors.text 
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
              <View style={styles.pickerContent}>
                <IconSymbol name="plus" size={16} color={theme.colors.primary} />
                <ThemedText type="body" style={{ color: theme.colors.text, marginLeft: 8 }}>
                  添加目标鱼种
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          {formData.targetFish.length > 0 && (
            <View style={styles.tagContainer}>
              {formData.targetFish.map((fish, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: theme.colors.secondary, opacity: 0.1 }]}>
                  <ThemedText type="bodySmall" style={{ color: theme.colors.secondary }}>{fish}</ThemedText>
                  <Pressable onPress={() => handleRemoveTargetFish(fish)}>
                    <IconSymbol name="xmark" size={12} color={theme.colors.secondary} />
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
                style={[styles.addItemInput, { backgroundColor: theme.colors.surface }]}
                placeholder="添加标签"
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={handleAddTag}
              />
              <Pressable style={styles.addButton} onPress={handleAddTag}>
                <IconSymbol name="plus" size={20} color={theme.colors.primary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.commonTagsContainer}>
            <View style={styles.labelRow}>
              <IconSymbol name="star" size={14} color={theme.colors.textSecondary} />
              <ThemedText type="bodySmall" style={{ color: theme.colors.textSecondary, marginBottom: 8 }}>
                常用标签：
              </ThemedText>
            </View>
            <View style={styles.tagContainer}>
              {commonTags.filter(tag => !formData.tags.includes(tag)).map((tag) => (
                <Pressable
                  key={tag}
                  style={[styles.tag, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }]}
                  onPress={() => setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))}
                >
                  <ThemedText type="bodySmall" style={{ color: theme.colors.textSecondary }}>{tag}</ThemedText>
                  <IconSymbol name="plus" size={12} color={theme.colors.textSecondary} />
                </Pressable>
              ))}
            </View>
          </View>

          {formData.tags.length > 0 && (
            <View style={styles.tagContainer}>
              {formData.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: theme.colors.accent, opacity: 0.1 }]}>
                  <ThemedText type="bodySmall" style={{ color: theme.colors.accent }}>{tag}</ThemedText>
                  <Pressable onPress={() => handleRemoveTag(tag)}>
                    <IconSymbol name="xmark" size={12} color={theme.colors.accent} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ThemedView>
      </ScrollView>

      {/* Target Fish Picker Modal */}
      <Modal visible={showTargetFishPicker} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowTargetFishPicker(false)}>
              <ThemedText type="body" style={{ color: theme.colors.primary }}>取消</ThemedText>
            </Pressable>
            <ThemedText type="title">选择目标鱼种</ThemedText>
            <View style={{ width: 40 }} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <View style={styles.addItemRow}>
                <TextInput
                  style={[styles.addItemInput, { backgroundColor: theme.colors.surface }]}
                  placeholder="输入鱼种名称"
                  value={newTargetFish}
                  onChangeText={setNewTargetFish}
                  onSubmitEditing={handleAddTargetFish}
                  autoFocus
                />
                <Pressable style={styles.addButton} onPress={handleAddTargetFish}>
                  <IconSymbol name="plus" size={20} color={theme.colors.primary} />
                </Pressable>
              </View>
            </View>

            <ThemedText type="bodySmall" style={{ color: theme.colors.textSecondary, marginBottom: 16 }}>
              常见鱼种：
            </ThemedText>
            
            {commonTargetFish.filter(fish => !formData.targetFish.includes(fish)).map((fish) => (
              <Pressable
                key={fish}
                style={styles.modalOption}
                onPress={() => {
                  setFormData(prev => ({
                    ...prev,
                    targetFish: [...prev.targetFish, fish]
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