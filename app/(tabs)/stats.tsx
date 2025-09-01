import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { EmptyStates } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useThemeColor';

export default function StatsScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ThemedView style={{ flex: 1, padding: 20 }}>
        <EmptyStates.NoStats />
      </ThemedView>
    </SafeAreaView>
  );
}