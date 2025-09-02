import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/lib/store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initialized = useRef(false);
  const setFish = useAppStore(state => state.setFish);
  const setAchievements = useAppStore(state => state.setAchievements);
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize data once at app root
  useEffect(() => {
    if (!initialized.current && loaded) {
      initialized.current = true;
      
      const initData = async () => {
        try {
          const { MOCK_FISH_DATA, MOCK_ACHIEVEMENT_DATA } = await import('@/lib/mockData');
          setFish(MOCK_FISH_DATA);
          setAchievements(MOCK_ACHIEVEMENT_DATA);
          console.log('App data initialized successfully');
        } catch (error) {
          console.error('Failed to initialize app data:', error);
        }
      };
      
      initData();
    }
  }, [loaded, setFish, setAchievements]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="log" options={{ headerShown: false }} />
        <Stack.Screen name="achievements" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
