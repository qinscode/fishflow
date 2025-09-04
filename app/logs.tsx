import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/useThemeColor';
import { useTranslation } from '@/lib/i18n';
import { useCatches, useFish } from '@/lib/store';
import { formatDate } from '@/lib/utils';

export default function LogsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const catches = useCatches();
  const fish = useFish();

  const records = useMemo(() => {
    return [...catches].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [catches]);

  if (records.length === 0) {
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
            <ThemedText type="h2">{t('logs.title')}</ThemedText>
            <ThemedText type="body" style={{ color: theme.colors.textSecondary }}>
              {t('logs.subtitle')}
            </ThemedText>
          </View>
        </View>
        <ThemedView style={styles.emptyContainer}>
          <EmptyState
            type="no-data"
            title={t('logs.empty.title')}
            description={t('logs.empty.description')}
            action={{
              label: t('logs.empty.action'),
              onPress: () => router.push('/log'),
            }}
          />
        </ThemedView>
      </SafeAreaView>
    );
  }

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
          <ThemedText type="h2">{t('logs.title')}</ThemedText>
          <ThemedText type="body" style={{ color: theme.colors.textSecondary }}>
            {t('logs.subtitle')}
          </ThemedText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {records.map(record => {
          const fishItem = fish.find(f => f.id === record.fishId);
          const title = record.isSkunked
            ? t('logs.item.skunked')
            : fishItem?.name || t('logs.item.unknown');
          return (
            <ThemedView key={record.id} type="card" style={[styles.card, theme.shadows.sm]}>
              <Pressable
                onPress={() => router.push(`/logs/${record.id}` as any)}
                style={styles.row}
              >
                <View style={[styles.icon, { backgroundColor: theme.colors.surface }]}>
                  <MaterialCommunityIcons
                    name={record.isSkunked ? 'emoticon-sad-outline' : 'fish'}
                    size={22}
                    color={record.isSkunked ? theme.colors.textSecondary : theme.colors.primary}
                  />
                </View>

                <View style={styles.content}>
                  <ThemedText type="body" style={styles.title}>
                    {title}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.colors.textSecondary }}>
                    {formatDate(record.timestamp)}
                    {record.measurements.lengthCm
                      ? ` · ${record.measurements.lengthCm}cm`
                      : ''}
                    {record.measurements.weightKg
                      ? ` · ${record.measurements.weightKg}kg`
                      : ''}
                  </ThemedText>
                </View>

                {(
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                )}
              </Pressable>
            </ThemedView>
          );
        })}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerLeft: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
});
