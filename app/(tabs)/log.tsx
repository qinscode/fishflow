import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EmptyStates } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useThemeColor';

export default function LogScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ThemedView style={{ flex: 1, padding: 20 }}>
        <EmptyStates.NoFish
          title="记录钓鱼"
          description="开始记录你的钓鱼经历吧！"
          action={{
            label: "开始记录",
            onPress: () => router.push('/log'),
          }}
        />
      </ThemedView>
    </SafeAreaView>
  );
}