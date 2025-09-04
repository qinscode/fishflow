import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useThemeColor';
import { useTranslation } from '@/lib/i18n';
import { useAppStore, useEquipmentSets, useUserProfile, useFish } from '@/lib/store';
import { EquipmentSet, LocationData, Fish } from '@/lib/types';
import {
  australianWeatherService,
  AustralianEnvironmentData,
} from '@/lib/weatherService';


export default function LogScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ fishId?: string; fishName?: string }>();
  const addCatch = useAppStore(s => s.addCatch);
  const equipmentSets = useEquipmentSets();
  const userProfile = useUserProfile();
  const fishList = useFish();

  // Form state
  const [isSkunked, setIsSkunked] = useState(false);
  const [weatherData, setWeatherData] =
    useState<AustralianEnvironmentData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [lengthCm, setLengthCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(
    null
  );
  const [showEquipPicker, setShowEquipPicker] = useState(false);
  const [showFishPicker, setShowFishPicker] = useState(false);
  const [fishSearch, setFishSearch] = useState('');
  const [selectedFish, setSelectedFish] = useState<Fish | null>(null);

  // Initialize selected fish from route params if provided
  useEffect(() => {
    if (params.fishId && !selectedFish) {
      const found = fishList.find(f => f.id === params.fishId);
      if (found) setSelectedFish(found);
      else if (params.fishName) {
        // Fallback when fish list not ready yet
        setSelectedFish({
          // Minimal placeholder; will be corrected once fishList loads
          id: params.fishId,
          name: params.fishName,
          scientificName: undefined,
          localNames: [],
          family: '',
          rarity: 'common',
          images: { card: '' },
          characteristics: { minLengthCm: 0, maxLengthCm: 0, maxWeightKg: 0 },
          habitat: { waterTypes: [], regions: [], seasons: [] },
          behavior: { feedingHabits: [], activeTime: 'day', difficulty: 1 },
        } as Fish);
      }
    }
  }, [params.fishId, params.fishName, fishList, selectedFish]);

  const getCurrentLocation =
    useCallback(async (): Promise<LocationData | null> => {
      try {
        const { status } =
          await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return null;
        }
        const pos = await ExpoLocation.getCurrentPositionAsync({});
        const geos = await ExpoLocation.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        const address = geos[0]
          ? `${geos[0].name || ''} ${geos[0].city || ''} ${geos[0].region || ''}`.trim()
          : undefined;
        return {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy || 0,
          timestamp: Date.now(),
          address,
        };
      } catch (e) {
        return null;
      }
    }, []);

  const loadWeatherData = useCallback(async () => {
    setIsLoadingWeather(true);
    try {
      const loc = (await getCurrentLocation()) || null;
      if (loc) {setLocation(loc);}
      const envData = await australianWeatherService.getEnvironmentalData(
        loc || {
          latitude: -33.8688,
          longitude: 151.2093,
          accuracy: 10,
          timestamp: Date.now(),
          address: 'Unknown',
        }
      );
      setWeatherData(envData);
    } catch (error) {
      console.error('Failed to load weather data:', error);
      Alert.alert(
        t('log.weather.error'),
        'Please check your internet connection'
      );
    } finally {
      setIsLoadingWeather(false);
    }
  }, [getCurrentLocation, t]);

  // Load weather data when component mounts
  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  const handleSave = async () => {
    if (!selectedFish?.id) {
      Alert.alert(t('common.error'), 'Missing fish id');
      return;
    }
    try {
      const chosen: EquipmentSet | undefined = equipmentSets.find(
        e => e.id === selectedEquipmentId!
      );
      await addCatch({
        fishId: selectedFish.id,
        userId: userProfile?.id || 'guest',
        timestamp: new Date().toISOString(),
        photos: [],
        measurements: {
          lengthCm: lengthCm ? Number(lengthCm) : undefined,
          weightKg: weightKg ? Number(weightKg) : undefined,
        },
        location: location
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy,
              address: location.address,
              waterType: 'ocean',
              privacy: 'exact',
            }
          : undefined,
        equipment: chosen
          ? {
              rod: chosen.rod,
              reel: chosen.reel,
              line: chosen.line,
              hook: chosen.hook,
              bait: chosen.bait,
            }
          : {},
        conditions: weatherData
          ? {
              weather: weatherData.weather.conditions,
              temperature: weatherData.weather.temperature,
              windSpeed: weatherData.weather.windSpeed,
              pressure: weatherData.weather.pressure,
            }
          : {},
        notes: undefined,
        isReleased: false,
        isPersonalBest: false,
        tags: [],
      });
      Alert.alert(t('common.success'), t('log.saved'));
      router.back();
    } catch (e) {
      Alert.alert(t('common.error'), 'Failed to save catch');
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={theme.colors.text}
          />
        </Pressable>
        <View style={styles.headerLeft}>
          <ThemedText type="h2">{t('log.title')}</ThemedText>
          <ThemedText type="body" style={{ color: theme.colors.textSecondary }}>
            {t('log.subtitle')}
          </ThemedText>
          {selectedFish?.name && (
            <ThemedText
              type="bodySmall"
              style={{ color: theme.colors.primary, marginTop: 4 }}
            >
              {selectedFish.name}
            </ThemedText>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Skunked Toggle */}
        <ThemedView type="card" style={[styles.card, theme.shadows.sm]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="fish"
              size={24}
              color={theme.colors.primary}
            />
            <ThemedText type="subtitle">{t('log.fish.select')}</ThemedText>
          </View>

          <View style={styles.skunkedContainer}>
            <View style={styles.skunkedInfo}>
              <ThemedText type="body">{t('log.skunked')}</ThemedText>
              <ThemedText
                type="bodySmall"
                style={{ color: theme.colors.textSecondary }}
              >
                {t('log.skunked.description')}
              </ThemedText>
            </View>
            <Switch
              value={isSkunked}
              onValueChange={setIsSkunked}
              trackColor={{
                false: theme.colors.surface,
                true: theme.colors.primary + '40',
              }}
              thumbColor={
                isSkunked ? theme.colors.primary : theme.colors.textSecondary
              }
            />
          </View>

          {!isSkunked && (
            <Pressable
              style={styles.fishSelectButton}
              onPress={() => setShowFishPicker(true)}
            >
              <ThemedText type="body" style={{ color: theme.colors.primary }}>
                {t('log.fish.search')}
              </ThemedText>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.colors.primary}
              />
            </Pressable>
          )}
        </ThemedView>

        {/* Measurements */}
        {!isSkunked && (
          <ThemedView type="card" style={[styles.card, theme.shadows.sm]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('fish.detail.stats')}
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <ThemedText
                  type="bodySmall"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {t('fish.detail.length')} (cm)
                </ThemedText>
                <TextInput
                  value={lengthCm}
                  onChangeText={setLengthCm}
                  keyboardType="numeric"
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                  }}
                  placeholder="e.g. 45"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText
                  type="bodySmall"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {t('fish.detail.weight')} (kg)
                </ThemedText>
                <TextInput
                  value={weightKg}
                  onChangeText={setWeightKg}
                  keyboardType="numeric"
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                  }}
                  placeholder="e.g. 1.2"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>
          </ThemedView>
        )}

        {/* Weather Information */}
        <ThemedView type="card" style={[styles.card, theme.shadows.sm]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="weather-partly-cloudy"
              size={24}
              color={theme.colors.primary}
            />
            <ThemedText type="subtitle">
              {t('log.weather.conditions')}
            </ThemedText>
          </View>

          {isLoadingWeather ? (
            <View style={styles.loadingContainer}>
              <ThemedText
                type="body"
                style={{ color: theme.colors.textSecondary }}
              >
                {t('log.weather.loading')}
              </ThemedText>
            </View>
          ) : weatherData ? (
            <View style={styles.weatherInfo}>
              <View style={styles.weatherRow}>
                <View style={styles.weatherItem}>
                  <MaterialCommunityIcons
                    name="thermometer"
                    size={20}
                    color={theme.colors.secondary}
                  />
                  <ThemedText type="bodySmall">
                    {t('log.weather.temperature')}
                  </ThemedText>
                  <ThemedText type="body" style={{ fontWeight: '600' }}>
                    {weatherData.weather.temperature}°C
                  </ThemedText>
                </View>

                <View style={styles.weatherItem}>
                  <MaterialCommunityIcons
                    name="weather-windy"
                    size={20}
                    color={theme.colors.accent}
                  />
                  <ThemedText type="bodySmall">
                    {t('log.weather.wind')}
                  </ThemedText>
                  <ThemedText type="body" style={{ fontWeight: '600' }}>
                    {weatherData.weather.windSpeed} km/h
                  </ThemedText>
                </View>
              </View>

              <View style={styles.weatherRow}>
                <View style={styles.weatherItem}>
                  <MaterialCommunityIcons
                    name="waves"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <ThemedText type="bodySmall">
                    {t('log.weather.waves')}
                  </ThemedText>
                  <ThemedText type="body" style={{ fontWeight: '600' }}>
                    {weatherData.waves.height}m
                  </ThemedText>
                </View>

                <View style={styles.weatherItem}>
                  <MaterialCommunityIcons
                    name="gauge"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <ThemedText type="bodySmall">
                    {t('log.weather.pressure')}
                  </ThemedText>
                  <ThemedText type="body" style={{ fontWeight: '600' }}>
                    {weatherData.weather.pressure} hPa
                  </ThemedText>
                </View>
              </View>

              {location && (
                <View style={{ marginTop: 8, alignItems: 'center' }}>
                  <ThemedText
                    type="bodySmall"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {location.address ||
                      `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                  </ThemedText>
                </View>
              )}
            </View>
          ) : (
            <Pressable style={styles.retryButton} onPress={loadWeatherData}>
              <MaterialCommunityIcons
                name="refresh"
                size={20}
                color={theme.colors.primary}
              />
              <ThemedText type="body" style={{ color: theme.colors.primary }}>
                Retry Weather Data
              </ThemedText>
            </Pressable>
          )}
        </ThemedView>

        {/* Equipment Set */}
        <ThemedView type="card" style={[styles.card, theme.shadows.sm]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t('equipment.title')}
          </ThemedText>
          <Pressable
            style={styles.fishSelectButton}
            onPress={() => setShowEquipPicker(true)}
          >
            <ThemedText type="body" style={{ color: theme.colors.primary }}>
              {selectedEquipmentId
                ? equipmentSets.find(e => e.id === selectedEquipmentId)?.name
                : t('common.select')}
            </ThemedText>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={theme.colors.primary}
            />
          </Pressable>
        </ThemedView>

        {/* Equipment Picker Modal */}
        <Modal visible={showEquipPicker} transparent animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowEquipPicker(false)}
          >
            <ThemedView type="card" style={[styles.picker, theme.shadows.lg]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {t('equipment.title')}
              </ThemedText>
              {equipmentSets.map(set => (
                <Pressable
                  key={set.id}
                  style={[
                    styles.pickerItem,
                    selectedEquipmentId === set.id && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedEquipmentId(set.id);
                    setShowEquipPicker(false);
                  }}
                >
                  <ThemedText
                    type="body"
                    style={{
                      color:
                        selectedEquipmentId === set.id
                          ? theme.colors.primary
                          : theme.colors.text,
                    }}
                  >
                    {set.name}
                  </ThemedText>
                  {selectedEquipmentId === set.id && (
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </Pressable>
              ))}
            </ThemedView>
          </Pressable>
        </Modal>

        {/* Fish Picker Modal */}
        <Modal visible={showFishPicker} transparent animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowFishPicker(false)}
          >
            <ThemedView type="card" style={[styles.picker, theme.shadows.lg]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {t('fishdex.title')}
              </ThemedText>
              <TextInput
                value={fishSearch}
                onChangeText={setFishSearch}
                placeholder={t('fishdex.search')}
                placeholderTextColor={theme.colors.textSecondary}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                  marginBottom: 12,
                }}
              />
              <ScrollView style={{ maxHeight: 420 }}>
                {fishList
                  .filter(f => {
                    const q = fishSearch.trim().toLowerCase();
                    if (q.length === 0) return true;
                    const nameMatch = f.name.toLowerCase().includes(q);
                    const sciMatch = (f.scientificName || '')
                      .toLowerCase()
                      .includes(q);
                    const idMatch = f.id.toLowerCase().includes(q);
                    const aliasMatch = (f.localNames || [])
                      .some(alias => (alias || '').toLowerCase().includes(q));
                    return nameMatch || sciMatch || idMatch || aliasMatch;
                  })
                  .slice(0, 200)
                  .map(f => (
                    <Pressable
                      key={f.id}
                      style={[
                        styles.pickerItem,
                        selectedFish?.id === f.id && styles.pickerItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedFish(f);
                        setShowFishPicker(false);
                      }}
                    >
                      <ThemedText
                        type="body"
                        style={{
                          color:
                            selectedFish?.id === f.id
                              ? theme.colors.primary
                              : theme.colors.text,
                        }}
                      >
                        {f.name}
                      </ThemedText>
                      {selectedFish?.id === f.id && (
                        <MaterialCommunityIcons
                          name="check"
                          size={20}
                          color={theme.colors.primary}
                        />
                      )}
                    </Pressable>
                  ))}
              </ScrollView>
            </ThemedView>
          </Pressable>
        </Modal>

        <View style={styles.actionButtons}>
          <Pressable
            style={[
              styles.cancelButton,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => router.back()}
          >
            <ThemedText type="body" style={{ color: theme.colors.text }}>
              {t('log.cancel')}
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.saveButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleSave}
          >
            <ThemedText
              type="body"
              style={{ color: 'white', fontWeight: '600' }}
            >
              {t('log.save')}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  headerLeft: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100, // Extra padding for tab bar
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  skunkedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  skunkedInfo: {
    flex: 1,
  },
  fishSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    marginTop: 12,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  weatherInfo: {
    gap: 16,
  },
  weatherRow: {
    flexDirection: 'row',
    gap: 16,
  },
  weatherItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 8,
    gap: 4,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  saveButton: {
    flex: 2,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
  },
  picker: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
});
