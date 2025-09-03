import { router } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useThemeColor';
import { useTranslation } from '@/lib/i18n';
import { LocationData } from '@/lib/types';
import {
  australianWeatherService,
  AustralianEnvironmentData,
} from '@/lib/weatherService';

export default function LogScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  // Form state
  const [isSkunked, setIsSkunked] = useState(false);
  const [weatherData, setWeatherData] =
    useState<AustralianEnvironmentData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);

  const loadWeatherData = useCallback(async () => {
    setIsLoadingWeather(true);
    try {
      // Mock location data for demo (in production, get from GPS)
      const mockLocation: LocationData = {
        latitude: -33.8688,
        longitude: 151.2093,
        accuracy: 10,
        timestamp: Date.now(),
        address: 'Sydney Harbour, NSW, Australia',
      };

      setLocation(mockLocation);
      const envData =
        await australianWeatherService.getEnvironmentalData(mockLocation);
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
  }, [t]);

  // Load weather data when component mounts
  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  const handleFeatureNotReady = () => {
    Alert.alert(
      'Feature in Development',
      'Logging functionality is under development!'
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText type="h2">{t('log.title')}</ThemedText>
          <ThemedText type="body" style={{ color: theme.colors.textSecondary }}>
            {t('log.subtitle')}
          </ThemedText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Skunked Toggle */}
        <ThemedView type="card" style={[styles.card, theme.shadows.sm]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="fish" size={24} color={theme.colors.primary} />
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
              onPress={handleFeatureNotReady}
            >
              <ThemedText type="body" style={{ color: theme.colors.primary }}>
                {t('log.fish.search')}
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={theme.colors.primary}
              />
            </Pressable>
          )}
        </ThemedView>

        {/* Weather Information */}
        <ThemedView type="card" style={[styles.card, theme.shadows.sm]}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              name="cloud.sun"
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
                  <IconSymbol
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
                  <IconSymbol
                    name="wind"
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
                  <IconSymbol
                    name="water.waves"
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
                  <IconSymbol
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
            </View>
          ) : (
            <Pressable style={styles.retryButton} onPress={loadWeatherData}>
              <IconSymbol
                name="arrow.clockwise"
                size={20}
                color={theme.colors.primary}
              />
              <ThemedText type="body" style={{ color: theme.colors.primary }}>
                Retry Weather Data
              </ThemedText>
            </Pressable>
          )}
        </ThemedView>

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
            onPress={handleFeatureNotReady}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
});
