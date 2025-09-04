import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Alert, 
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeInView, SlideInView } from '@/components/animations';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useThemeColor';
import { dataExportImportService } from '@/lib/dataExportImportService';
import {
  useTranslation,
  setLanguage,
  getCurrentLanguage,
  Language,
} from '@/lib/i18n';
import { useAppStore } from '@/lib/store';

export default function SettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const updateUserPreferences = useAppStore(
    state => state.updateUserPreferences
  );
  const userPreferences = useAppStore(state => state.userPreferences);

  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  // Removed fishing start date state
  const [versionTapCount, setVersionTapCount] = useState(0);
  const [showRpgFramesOption, setShowRpgFramesOption] = useState(false);

  const handleLanguageChange = async (language: Language) => {
    await setLanguage(language);
    if (language !== 'system') {
      updateUserPreferences({
        appearance: { ...userPreferences.appearance, language },
      });
    }
    setShowLanguagePicker(false);
  };

  const handleThemeChange = (themeValue: 'light' | 'dark' | 'system') => {
    updateUserPreferences({
      appearance: { ...userPreferences.appearance, theme: themeValue },
    });
    setShowThemePicker(false);
  };

  // Removed fishing start date handler

  const handleNotificationToggle = (
    type: 'achievements' | 'reminders' | 'weather'
  ) => {
    updateUserPreferences({
      notifications: {
        ...userPreferences.notifications,
        [type]: !userPreferences.notifications[type],
      },
    });
  };

  const handlePrivacyToggle = (type: 'shareAchievements' | 'shareStats') => {
    updateUserPreferences({
      privacy: {
        ...userPreferences.privacy,
        [type]: !userPreferences.privacy[type],
      },
    });
  };

  const handleRpgFramesToggle = () => {
    updateUserPreferences({
      appearance: {
        ...userPreferences.appearance,
        rpgFrames: !userPreferences.appearance.rpgFrames,
      },
    });
  };

  const handleVersionTap = () => {
    const newCount = versionTapCount + 1;
    setVersionTapCount(newCount);
    
    if (newCount >= 5 && !showRpgFramesOption) {
      setShowRpgFramesOption(true);
      Alert.alert('🎨', 'Developer options unlocked!');
    }
    
    // 添加成就测试功能
    if (newCount >= 10) {
      // 连续点击10次触发成就测试
      testAchievementUnlock();
      setVersionTapCount(0);
    }
    
    // Reset counter after 3 seconds of inactivity
    setTimeout(() => {
      if (versionTapCount === newCount) {
        setVersionTapCount(0);
      }
    }, 3000);
  };

  const testAchievementUnlock = async () => {
    try {
      const { showAchievementNotification } = await import('@/components/ui/AchievementNotificationManager');
      // 测试第一个成就解锁
      showAchievementNotification('first-catch', 'bronze', false);
      
      // 延迟显示第二个成就
      setTimeout(() => {
        showAchievementNotification('species-collector', 'silver', true, 'bronze');
      }, 2000);
      
      Alert.alert('🏆', 'Achievement test notifications triggered!');
    } catch (error) {
      console.error('Achievement test failed:', error);
    }
  };

  const handleClearData = () => {
    Alert.alert(t('settings.data.clear'), t('settings.data.clear.warning'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          const result = await dataExportImportService.clearAllData();
          if (result.success) {
            Alert.alert(t('common.success'), 'All data has been cleared');
          } else {
            Alert.alert(
              t('common.error'),
              result.error || 'Failed to clear data'
            );
          }
        },
      },
    ]);
  };

  const handleExportData = async () => {
    try {
      const result = await dataExportImportService.exportData();
      if (result.success && result.data) {
        // For demo purposes, we'll show the data in an alert
        // In a real app, you'd save this to a file or share it
        const stats = dataExportImportService.getExportStats();
        Alert.alert(
          'Export Successful',
          `Exported ${stats.catches} catches, ${stats.equipmentSets} equipment sets, and ${stats.achievements} achievements.\n\nData size: ${(result.data.length / 1024).toFixed(1)} KB`,
          [
            {
              text: 'Copy to Clipboard',
              onPress: () => {
                // In a real app, copy to clipboard
                console.log('Export data:', result.data);
              },
            },
            { text: 'OK' },
          ]
        );
      } else {
        Alert.alert(t('common.error'), result.error || 'Export failed');
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Export failed');
    }
  };

  const handleImportData = () => {
    Alert.prompt(
      'Import Data',
      'Paste your FishFlow backup data (JSON format):',
      async jsonData => {
        if (!jsonData?.trim()) {
          return;
        }

        try {
          const result = await dataExportImportService.importData(jsonData);
          if (result.success) {
            Alert.alert(
              t('common.success'),
              `Successfully imported ${result.importedCount || 0} items`
            );
          } else {
            Alert.alert(t('common.error'), result.error || 'Import failed');
          }
        } catch (error) {
          Alert.alert(t('common.error'), 'Import failed');
        }
      }
    );
  };

  const getLanguageDisplayName = (lang: Language) => {
    return lang === 'zh' ? '中文' : 'English';
  };

  const getThemeDisplayName = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return t('settings.theme.light');
      case 'dark':
        return t('settings.theme.dark');
      case 'system':
        return t('settings.theme.system');
      default:
        return t('settings.theme.system');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return t('common.add');
    }
    const date = new Date(dateString);
    return date.toLocaleDateString(
      getCurrentLanguage() === 'zh' ? 'zh-CN' : 'en-US'
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <FadeInView delay={0}>
        <ThemedView style={styles.header}>
          <View>
            <ThemedText type="h2" style={styles.title}>
              {t('settings.title')}
            </ThemedText>
            <ThemedText
              type="body"
              style={{ color: theme.colors.textSecondary }}
            >
              {t('settings.subtitle')}
            </ThemedText>
          </View>
        </ThemedView>
      </FadeInView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Fishing Settings removed */}

        {/* Appearance Settings */}
        <SlideInView direction="up" delay={300}>
          <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('settings.language')}
            </ThemedText>

            <Pressable
              style={styles.settingItem}
              onPress={() => setShowLanguagePicker(true)}
            >
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="earth"
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.settingText}>
                  <ThemedText type="body">{t('settings.language')}</ThemedText>
                  <ThemedText
                    type="bodySmall"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {t('settings.language.subtitle')}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.settingRight}>
                <ThemedText
                  type="bodySmall"
                  style={{ color: theme.colors.primary }}
                >
                  {getLanguageDisplayName(userPreferences.appearance.language)}
                </ThemedText>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </View>
            </Pressable>

            <Pressable
              style={styles.settingItem}
              onPress={() => setShowThemePicker(true)}
            >
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="palette"
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.settingText}>
                  <ThemedText type="body">{t('settings.theme')}</ThemedText>
                  <ThemedText
                    type="bodySmall"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {t('settings.theme.subtitle')}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.settingRight}>
                <ThemedText
                  type="bodySmall"
                  style={{ color: theme.colors.primary }}
                >
                  {getThemeDisplayName(userPreferences.appearance.theme)}
                </ThemedText>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </View>
            </Pressable>

            {showRpgFramesOption && (
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <MaterialCommunityIcons
                    name="image-frame"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <View style={styles.settingText}>
                    <ThemedText type="body">{t('settings.rpg.frames')}</ThemedText>
                    <ThemedText
                      type="bodySmall"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {t('settings.rpg.frames.subtitle')}
                    </ThemedText>
                  </View>
                </View>
                <Switch
                  value={userPreferences.appearance.rpgFrames}
                  onValueChange={handleRpgFramesToggle}
                  trackColor={{
                    false: theme.colors.surface,
                    true: theme.colors.primary + '40',
                  }}
                  thumbColor={
                    userPreferences.appearance.rpgFrames
                      ? theme.colors.primary
                      : theme.colors.textSecondary
                  }
                />
              </View>
            )}
          </ThemedView>
        </SlideInView>

        {/* Notification Settings */}
        <SlideInView direction="up" delay={400}>
          <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('settings.notifications')}
            </ThemedText>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="trophy"
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.settingText}>
                  <ThemedText type="body">
                    {t('settings.notifications.achievements')}
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={userPreferences.notifications.achievements}
                onValueChange={() => handleNotificationToggle('achievements')}
                trackColor={{
                  false: theme.colors.surface,
                  true: theme.colors.primary + '40',
                }}
                thumbColor={
                  userPreferences.notifications.achievements
                    ? theme.colors.primary
                    : theme.colors.textSecondary
                }
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.settingText}>
                  <ThemedText type="body">
                    {t('settings.notifications.reminders')}
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={userPreferences.notifications.reminders}
                onValueChange={() => handleNotificationToggle('reminders')}
                trackColor={{
                  false: theme.colors.surface,
                  true: theme.colors.primary + '40',
                }}
                thumbColor={
                  userPreferences.notifications.reminders
                    ? theme.colors.primary
                    : theme.colors.textSecondary
                }
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="weather-partly-cloudy"
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.settingText}>
                  <ThemedText type="body">
                    {t('settings.notifications.weather')}
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={userPreferences.notifications.weather}
                onValueChange={() => handleNotificationToggle('weather')}
                trackColor={{
                  false: theme.colors.surface,
                  true: theme.colors.primary + '40',
                }}
                thumbColor={
                  userPreferences.notifications.weather
                    ? theme.colors.primary
                    : theme.colors.textSecondary
                }
              />
            </View>
          </ThemedView>
        </SlideInView>

        {/* Privacy Settings */}
        <SlideInView direction="up" delay={500}>
          <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('settings.privacy')}
            </ThemedText>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="trophy"
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.settingText}>
                  <ThemedText type="body">
                    {t('settings.privacy.share.achievements')}
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={userPreferences.privacy.shareAchievements}
                onValueChange={() => handlePrivacyToggle('shareAchievements')}
                trackColor={{
                  false: theme.colors.surface,
                  true: theme.colors.primary + '40',
                }}
                thumbColor={
                  userPreferences.privacy.shareAchievements
                    ? theme.colors.primary
                    : theme.colors.textSecondary
                }
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="chart-bar"
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.settingText}>
                  <ThemedText type="body">
                    {t('settings.privacy.share.stats')}
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={userPreferences.privacy.shareStats}
                onValueChange={() => handlePrivacyToggle('shareStats')}
                trackColor={{
                  false: theme.colors.surface,
                  true: theme.colors.primary + '40',
                }}
                thumbColor={
                  userPreferences.privacy.shareStats
                    ? theme.colors.primary
                    : theme.colors.textSecondary
                }
              />
            </View>
          </ThemedView>
        </SlideInView>

        {/* Data Management */}
        <SlideInView direction="up" delay={600}>
          <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('settings.data')}
            </ThemedText>

            <Pressable style={styles.settingItem} onPress={handleExportData}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="export-variant"
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.settingText}>
                  <ThemedText type="body">
                    {t('settings.data.export')}
                  </ThemedText>
                  <ThemedText
                    type="bodySmall"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Export fishing records and equipment
                  </ThemedText>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={theme.colors.textSecondary}
              />
            </Pressable>

            <Pressable style={styles.settingItem} onPress={handleImportData}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="import"
                  size={20}
                  color={theme.colors.secondary}
                />
                <View style={styles.settingText}>
                  <ThemedText type="body">
                    {t('settings.data.import')}
                  </ThemedText>
                  <ThemedText
                    type="bodySmall"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Import backup data
                  </ThemedText>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={theme.colors.textSecondary}
              />
            </Pressable>

            <Pressable style={styles.settingItem} onPress={handleClearData}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={20}
                  color={theme.colors.error}
                />
                <View style={styles.settingText}>
                  <ThemedText type="body" style={{ color: theme.colors.error }}>
                    {t('settings.data.clear')}
                  </ThemedText>
                  <ThemedText
                    type="bodySmall"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Clear all fishing records and data
                  </ThemedText>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={theme.colors.textSecondary}
              />
            </Pressable>
          </ThemedView>
        </SlideInView>

        {/* About */}
        <SlideInView direction="up" delay={700}>
          <ThemedView type="card" style={[styles.section, theme.shadows.sm]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('settings.about')}
            </ThemedText>

            <Pressable style={styles.settingItem} onPress={handleVersionTap}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.settingText}>
                  <ThemedText type="body">
                    {t('settings.about.version')}
                  </ThemedText>
                </View>
              </View>
              <ThemedText
                type="bodySmall"
                style={{ color: theme.colors.textSecondary }}
              >
                1.0.0
              </ThemedText>
            </Pressable>
          </ThemedView>
        </SlideInView>
      </ScrollView>

      {/* Language Picker Modal */}
      <Modal
        visible={showLanguagePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLanguagePicker(false)}
        >
          <ThemedView type="card" style={[styles.picker, theme.shadows.lg]}>
            <ThemedText type="subtitle" style={styles.pickerTitle}>
              {t('settings.language')}
            </ThemedText>

            <Pressable
              style={[
                styles.pickerItem,
                userPreferences.appearance.language === 'zh' &&
                  styles.pickerItemSelected,
              ]}
              onPress={() => handleLanguageChange('zh')}
            >
              <ThemedText
                type="body"
                style={{
                  color:
                    userPreferences.appearance.language === 'zh'
                      ? theme.colors.primary
                      : theme.colors.text,
                }}
              >
                中文
              </ThemedText>
              {userPreferences.appearance.language === 'zh' && (
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color={theme.colors.primary}
                />
              )}
            </Pressable>

            <Pressable
              style={[
                styles.pickerItem,
                userPreferences.appearance.language === 'en' &&
                  styles.pickerItemSelected,
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <ThemedText
                type="body"
                style={{
                  color:
                    userPreferences.appearance.language === 'en'
                      ? theme.colors.primary
                      : theme.colors.text,
                }}
              >
                English
              </ThemedText>
              {userPreferences.appearance.language === 'en' && (
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color={theme.colors.primary}
                />
              )}
            </Pressable>
          </ThemedView>
        </Pressable>
      </Modal>

      {/* Theme Picker Modal */}
      <Modal
        visible={showThemePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowThemePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowThemePicker(false)}
        >
          <ThemedView type="card" style={[styles.picker, theme.shadows.lg]}>
            <ThemedText type="subtitle" style={styles.pickerTitle}>
              {t('settings.theme')}
            </ThemedText>

            {(['light', 'dark', 'system'] as const).map(themeOption => (
              <Pressable
                key={themeOption}
                style={[
                  styles.pickerItem,
                  userPreferences.appearance.theme === themeOption &&
                    styles.pickerItemSelected,
                ]}
                onPress={() => handleThemeChange(themeOption)}
              >
                <ThemedText
                  type="body"
                  style={{
                    color:
                      userPreferences.appearance.theme === themeOption
                        ? theme.colors.primary
                        : theme.colors.text,
                  }}
                >
                  {getThemeDisplayName(themeOption)}
                </ThemedText>
                {userPreferences.appearance.theme === themeOption && (
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

      {/* Date Picker Modal removed */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    marginBottom: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    minHeight: 48,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  picker: {
    width: '100%',
    maxWidth: 300,
    padding: 20,
    borderRadius: 16,
  },
  pickerTitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  // Removed date picker styles
});
