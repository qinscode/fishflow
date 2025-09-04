import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { AchievementNotificationManager } from '@/components/ui/AchievementNotificationManager';
import { useColorScheme } from '@/hooks/useColorScheme';
import { initializeLanguage } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { generateUUID } from '@/lib/utils';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initialized = useRef(false);
  const setFish = useAppStore(state => state.setFish);
  const setAchievements = useAppStore(state => state.setAchievements);
  const setUserAchievements = useAppStore(state => state.setUserAchievements);
  const setCatches = useAppStore(state => state.setCatches);
  const setEquipmentSets = useAppStore(state => state.setEquipmentSets);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize data once at app root (skip on web due to SQLite issues)
  useEffect(() => {
    if (!initialized.current && loaded && Platform.OS !== 'web') {
      initialized.current = true;
      
      const initData = async () => {
        try {
          // Initialize language preference
          await initializeLanguage();
          
          const { loadFishData } = await import('@/lib/fishDataLoader');
          const { MOCK_ACHIEVEMENT_DATA, MOCK_EQUIPMENT_DATA } = await import('@/lib/mockData');
          const fishData = loadFishData();
          
          setFish(fishData);
          setAchievements(MOCK_ACHIEVEMENT_DATA);
          setUserAchievements([]);
          setEquipmentSets(MOCK_EQUIPMENT_DATA);
          
          // 初始化空的钓获记录，让用户从头开始体验成就系统
          setCatches([]);
          console.log('App data initialized successfully with JSON fish data and equipment data');
        } catch (error) {
          console.error('Failed to initialize app data:', error);
        }
      };
      
      initData();
    }
  }, [loaded, setFish, setAchievements, setUserAchievements, setCatches, setEquipmentSets]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="log" options={{ headerShown: false }} />
        <Stack.Screen name="logs" options={{ headerShown: false }} />
        <Stack.Screen name="logs/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="achievements" options={{ headerShown: false }} />
        <Stack.Screen name="achievement/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="fish/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="equipment/create" options={{ headerShown: false }} />
        <Stack.Screen name="equipment/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      <AchievementNotificationManager />
    </ThemeProvider>
  );
}
