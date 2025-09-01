import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Camera from 'expo-camera';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { FishCard } from '@/components/ui/FishCard';
import { useTheme } from '@/hooks/useThemeColor';
import { useAppStore, useFish } from '@/lib/store';
import { Fish, CatchRecord, WaterType } from '@/lib/types';
import { generateUUID } from '@/lib/utils';
import { WATER_TYPES, WEATHER_CONDITIONS } from '@/lib/constants';

interface CatchFormData {
  fishId: string;
  weight?: number;
  length?: number;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  waterType: WaterType;
  weather: string;
  temperature?: number;
  notes?: string;
  photos?: string[];
  bait?: string;
  method?: string;
}

export default function LogCatchScreen() {
  const theme = useTheme();
  const fish = useFish();
  const addCatch = useAppStore(state => state.addCatch);
  
  const [selectedFish, setSelectedFish] = useState<Fish | null>(null);
  const [showFishPicker, setShowFishPicker] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CatchFormData>({
    defaultValues: {
      waterType: 'lake',
      weather: 'sunny',
    },
  });

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (locationStatus === 'granted') {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      
      if (address[0]) {
        const locationString = [
          address[0].city,
          address[0].district,
          address[0].street,
        ].filter(Boolean).join(', ');
        
        setValue('location', locationString);
        setValue('coordinates', {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const handleFishSelect = (fish: Fish) => {
    setSelectedFish(fish);
    setValue('fishId', fish.id);
    setShowFishPicker(false);
    Haptics.selectionAsync();
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        // Add photo to form data
        const currentPhotos = watch('photos') || [];
        setValue('photos', [...currentPhotos, result.assets[0].uri]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('错误', '拍照失败，请重试');
    }
  };

  const handleSelectPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const currentPhotos = watch('photos') || [];
        setValue('photos', [...currentPhotos, result.assets[0].uri]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('错误', '选择图片失败，请重试');
    }
  };

  const onSubmit = async (data: CatchFormData) => {
    if (!selectedFish) {
      Alert.alert('错误', '请选择鱼类');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const catchRecord: Omit<CatchRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: 'user-001',
        fishId: data.fishId,
        timestamp: new Date().toISOString(),
        photos: data.photos || [],
        measurements: {
          lengthCm: data.length,
          weightKg: data.weight,
        },
        location: data.coordinates ? {
          latitude: data.coordinates.latitude,
          longitude: data.coordinates.longitude,
          accuracy: 5,
          address: data.location,
          waterType: data.waterType,
          privacy: 'exact' as const,
        } : undefined,
        equipment: {
          bait: data.bait,
        },
        conditions: {
          weather: data.weather,
          temperature: data.temperature,
        },
        notes: data.notes,
        isReleased: false,
        isPersonalBest: false,
        tags: [],
      };

      addCatch(catchRecord);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        '记录成功',
        `成功记录了一条${selectedFish.name}！`,
        [
          { text: '继续记录', onPress: () => reset() },
          { text: '查看图鉴', onPress: () => router.push('/fishdex') },
        ]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('错误', '记录失败，请重试');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFishPicker = () => (
    <Modal visible={showFishPicker} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ThemedView style={styles.modalHeader}>
          <Pressable onPress={() => setShowFishPicker(false)}>
            <ThemedText type="button" style={{ color: theme.colors.primary }}>
              取消
            </ThemedText>
          </Pressable>
          <ThemedText type="title">选择鱼类</ThemedText>
          <ThemedView style={{ width: 50 }} />
        </ThemedView>
        
        <ScrollView contentContainerStyle={styles.fishList}>
          {fish.map((fishItem) => (
            <Pressable
              key={fishItem.id}
              style={styles.fishItem}
              onPress={() => handleFishSelect(fishItem)}
            >
              <FishCard
                fish={fishItem}
                state="unlocked"
                size="small"
                showRarity={true}
              />
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <IconSymbol 
              name="chevron.left" 
              size={24} 
              color={theme.colors.text} 
            />
          </Pressable>
          <ThemedText type="h2">记录钓鱼</ThemedText>
          <ThemedView style={{ width: 24 }} />
        </ThemedView>

        {/* Fish Selection */}
        <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
          <ThemedText type="title" style={styles.sectionTitle}>
            选择鱼类 *
          </ThemedText>
          
          <Pressable
            style={[
              styles.fishSelector,
              { 
                borderColor: errors.fishId ? theme.colors.error : theme.colors.border,
                backgroundColor: selectedFish ? theme.colors.surface : theme.colors.card,
              }
            ]}
            onPress={() => setShowFishPicker(true)}
          >
            {selectedFish ? (
              <ThemedView style={styles.selectedFish}>
                <FishCard
                  fish={selectedFish}
                  state="unlocked"
                  size="small"
                  showRarity={true}
                />
                <IconSymbol 
                  name="chevron.right" 
                  size={16} 
                  color={theme.colors.textSecondary} 
                />
              </ThemedView>
            ) : (
              <ThemedView style={styles.fishPlaceholder}>
                <IconSymbol 
                  name="fish" 
                  size={32} 
                  color={theme.colors.textSecondary} 
                />
                <ThemedText 
                  type="body" 
                  style={{ color: theme.colors.textSecondary }}
                >
                  点击选择鱼类
                </ThemedText>
                <IconSymbol 
                  name="chevron.right" 
                  size={16} 
                  color={theme.colors.textSecondary} 
                />
              </ThemedView>
            )}
          </Pressable>
          
          {errors.fishId && (
            <ThemedText type="caption" style={{ color: theme.colors.error }}>
              请选择鱼类
            </ThemedText>
          )}
        </ThemedView>

        {/* Measurements */}
        <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
          <ThemedText type="title" style={styles.sectionTitle}>
            测量数据
          </ThemedText>
          
          <ThemedView style={styles.measurementRow}>
            <ThemedView style={styles.measurementField}>
              <ThemedText type="label" style={styles.fieldLabel}>
                重量 (kg)
              </ThemedText>
              <Controller
                control={control}
                name="weight"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, { 
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surface,
                    }]}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(parseFloat(text) || undefined)}
                    value={value?.toString() || ''}
                    placeholder="0.0"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </ThemedView>
            
            <ThemedView style={styles.measurementField}>
              <ThemedText type="label" style={styles.fieldLabel}>
                长度 (cm)
              </ThemedText>
              <Controller
                control={control}
                name="length"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, { 
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surface,
                    }]}
                    onBlur={onBlur}
                    onChangeText={(text) => onChange(parseFloat(text) || undefined)}
                    value={value?.toString() || ''}
                    placeholder="0.0"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Location */}
        <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
          <ThemedText type="title" style={styles.sectionTitle}>
            位置信息
          </ThemedText>
          
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { 
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value || ''}
                placeholder="输入钓鱼地点"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
              />
            )}
          />
          
          <Pressable
            style={[styles.locationButton, { backgroundColor: theme.colors.primary }]}
            onPress={getCurrentLocation}
          >
            <IconSymbol name="location.fill" size={16} color={theme.colors.surface} />
            <ThemedText type="button" style={{ color: theme.colors.surface }}>
              获取当前位置
            </ThemedText>
          </Pressable>
        </ThemedView>

        {/* Submit Button */}
        <Pressable
          style={[
            styles.submitButton,
            { 
              backgroundColor: theme.colors.primary,
              opacity: isSubmitting ? 0.7 : 1,
            },
            theme.shadows.md,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <ThemedText type="button" style={{ color: theme.colors.surface }}>
            {isSubmitting ? '记录中...' : '完成记录'}
          </ThemedText>
        </Pressable>
      </ScrollView>

      {renderFishPicker()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  section: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  fishSelector: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
  },
  selectedFish: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fishPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  measurementRow: {
    flexDirection: 'row',
    gap: 16,
  },
  measurementField: {
    flex: 1,
  },
  fieldLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  submitButton: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  fishList: {
    padding: 20,
    gap: 16,
  },
  fishItem: {
    borderRadius: 12,
  },
});