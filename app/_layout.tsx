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
import { generateUUID } from '@/lib/utils';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initialized = useRef(false);
  const setFish = useAppStore(state => state.setFish);
  const setAchievements = useAppStore(state => state.setAchievements);
  const setUserAchievements = useAppStore(state => state.setUserAchievements);
  const setCatches = useAppStore(state => state.setCatches);
  
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
          const fishData = loadFishData();
          
          setFish(fishData);
          setAchievements(MOCK_ACHIEVEMENT_DATA);
          setUserAchievements([]);
          
          // 添加一些测试钓鱼记录，这样部分鱼类会显示为已解锁
          const mockCatches = [
            {
              id: generateUUID(),
              fishId: '1',
              userId: 'test-user',
              timestamp: new Date().toISOString(),
              photos: [],
              measurements: { lengthCm: 45, weightKg: 2.5 },
              equipment: { rod: '测试鱼竿', bait: '测试饵料' },
              conditions: {},
              notes: '测试记录',
              isReleased: false,
              isPersonalBest: false,
              tags: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: generateUUID(),
              fishId: '2',
              userId: 'test-user',
              timestamp: new Date().toISOString(),
              photos: [],
              measurements: { lengthCm: 30, weightKg: 1.2 },
              equipment: { rod: '测试鱼竿', bait: '测试饵料' },
              conditions: {},
              notes: '测试记录2',
              isReleased: true,
              isPersonalBest: false,
              tags: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
          
          setCatches(mockCatches);
          console.log('App data initialized successfully with JSON fish data and mock catches');
        } catch (error) {
          console.error('Failed to initialize app data:', error);
        }
      };
      
      initData();
    }
  }, [loaded, setFish, setAchievements, setUserAchievements, setCatches]);

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
