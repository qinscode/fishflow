import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useTheme } from '@/hooks/useThemeColor';
import { useTranslation } from '@/lib/i18n';
import {
  HomeIcon,
  BookOpenIcon,
  TrophyIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from 'react-native-heroicons/outline';

export default function TabLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.tint,
        tabBarInactiveTintColor: theme.colors.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ color }) => (
            <HomeIcon size={28} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="fishdex"
        options={{
          title: t('nav.fishdex'),
          tabBarIcon: ({ color }) => (
            <BookOpenIcon size={28} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: t('nav.achievements'),
          tabBarIcon: ({ color }) => (
            <TrophyIcon size={28} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t('nav.stats'),
          tabBarIcon: ({ color }) => (
            <ChartBarIcon size={28} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('nav.settings'),
          tabBarIcon: ({ color }) => (
            <Cog6ToothIcon size={28} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="equipment"
        options={{
          href: null, // Hide this tab from the tab bar
        }}
      />
    </Tabs>
  );
}
