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

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/lib/store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initialized = useRef(false);
  const setFish = useAppStore(state => state.setFish);
  const setAchievements = useAppStore(state => state.setAchievements);
  const setUserAchievements = useAppStore(state => state.setUserAchievements);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize data once at app root (skip on web due to SQLite issues)
  useEffect(() => {
    if (!initialized.current && loaded && Platform.OS !== 'web') {
      initialized.current = true;
      
      const initData = async () => {
        try {
          const { loadFishData } = await import('@/lib/fishDataLoader');
          const { MOCK_ACHIEVEMENT_DATA } = await import('@/lib/mockData');
          setFish(loadFishData());
          setAchievements(MOCK_ACHIEVEMENT_DATA);
          // Initialize empty user achievements for now
          setUserAchievements([]);
          console.log('App data initialized successfully with JSON fish data');
        } catch (error) {
          console.error('Failed to initialize app data:', error);
        }
      };
      
      initData();
    }
  }, [loaded, setFish, setAchievements, setUserAchievements]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="log" options={{ headerShown: false }} />
        <Stack.Screen name="achievements" options={{ headerShown: false }} />
        <Stack.Screen name="fish/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
