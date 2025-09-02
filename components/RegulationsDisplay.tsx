import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Badge } from '@/components/ui/Badge';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useThemeColor';
import { getRegionRegulations, isClosedSeason, validateFishSize } from '@/lib/australianFishData';
import { Fish, RegionalRegulations, AustralianState } from '@/lib/types';

interface RegulationsDisplayProps {
  fish: Fish;
  selectedState?: AustralianState;
  currentSize?: number; // 用户当前钓到的鱼的尺寸
}

const AUSTRALIAN_STATES = [
  { code: 'NSW', name: 'New South Wales' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'QLD', name: 'Queensland' },
  { code: 'WA', name: 'Western Australia' },
  { code: 'SA', name: 'South Australia' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'NT', name: 'Northern Territory' },
  { code: 'ACT', name: 'Australian Capital Territory' },
];

export const RegulationsDisplay: React.FC<RegulationsDisplayProps> = ({
  fish,
  selectedState = 'NSW',
  currentSize
}) => {
  const theme = useTheme();
  const [activeState, setActiveState] = useState<AustralianState>(selectedState);
  
  const regulations = getRegionRegulations(fish, activeState);
  const isClosed = isClosedSeason(fish, activeState);
  const sizeValidation = currentSize ? validateFishSize(fish, activeState, currentSize) : null;

  if (!regulations) {
    return (
      <ThemedView type="card" style={[styles.card, theme.shadows.md]}>
        <ThemedText type="title">法规信息</ThemedText>
        <ThemedText style={{ color: theme.colors.textSecondary }}>
          该地区暂无具体法规信息
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView type="card" style={[styles.card, theme.shadows.md]}>
      {/* 州选择器 */}
      <View style={styles.stateSelector}>
        <ThemedText type="title" style={styles.title}>
          钓鱼法规 - {AUSTRALIAN_STATES.find(s => s.code === activeState)?.name}
        </ThemedText>
        <View style={styles.stateTabs}>
          {AUSTRALIAN_STATES.filter(state => 
            fish.habitat.regions.includes(state.code)
          ).map(state => (
            <Pressable
              key={state.code}
              style={[
                styles.stateBadge,
                {
                  backgroundColor: activeState === state.code 
                    ? theme.colors.primary 
                    : theme.colors.card,
                }
              ]}
              onPress={() => setActiveState(state.code as AustralianState)}
            >
              <ThemedText
                style={{
                  color: activeState === state.code 
                    ? 'white' 
                    : theme.colors.text,
                  fontWeight: '600',
                }}
              >
                {state.code}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 当前状态警告 */}
      {isClosed && (
        <View style={[styles.warningBox, { backgroundColor: theme.colors.error + '20' }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={16} color={theme.colors.error} />
          <ThemedText style={[styles.warningText, { color: theme.colors.error }]}>
            当前为禁钓期
          </ThemedText>
        </View>
      )}

      {/* 尺寸验证结果 */}
      {sizeValidation && (
        <View style={[
          styles.validationBox, 
          { backgroundColor: sizeValidation.isLegal ? theme.colors.success + '20' : theme.colors.error + '20' }
        ]}>
          <IconSymbol 
            name={sizeValidation.isLegal ? "checkmark.circle.fill" : "xmark.circle.fill"}
            size={16} 
            color={sizeValidation.isLegal ? theme.colors.success : theme.colors.error} 
          />
          <ThemedText style={[
            styles.validationText,
            { color: sizeValidation.isLegal ? theme.colors.success : theme.colors.error }
          ]}>
            {sizeValidation.isLegal ? '符合法规要求' : sizeValidation.reason}
          </ThemedText>
        </View>
      )}

      {/* 法规详情 */}
      <View style={styles.regulationsGrid}>
        {/* 尺寸要求 */}
        <View style={styles.regulationItem}>
          <View style={styles.regulationHeader}>
            <IconSymbol name="ruler" size={16} color={theme.colors.primary} />
            <ThemedText type="subtitle" style={styles.regulationTitle}>
              尺寸要求
            </ThemedText>
          </View>
          <View style={styles.sizeRange}>
            {regulations.minSizeCm && (
              <View style={styles.sizeItem}>
                <ThemedText type="caption">最小</ThemedText>
                <ThemedText type="body" style={styles.sizeValue}>
                  {regulations.minSizeCm}cm
                </ThemedText>
              </View>
            )}
            {regulations.maxSizeCm && (
              <View style={styles.sizeItem}>
                <ThemedText type="caption">最大</ThemedText>
                <ThemedText type="body" style={styles.sizeValue}>
                  {regulations.maxSizeCm}cm
                </ThemedText>
              </View>
            )}
            {regulations.slotLimit && (
              <View style={styles.slotLimit}>
                <ThemedText type="caption">尺寸槽</ThemedText>
                <ThemedText type="body" style={styles.sizeValue}>
                  {regulations.slotLimit.minCm}-{regulations.slotLimit.maxCm}cm
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* 数量限制 */}
        <View style={styles.regulationItem}>
          <View style={styles.regulationHeader}>
            <IconSymbol name="number" size={16} color={theme.colors.secondary} />
            <ThemedText type="subtitle" style={styles.regulationTitle}>
              数量限制
            </ThemedText>
          </View>
          <View style={styles.limitsContainer}>
            {regulations.dailyLimit && (
              <View style={styles.limitItem}>
                <ThemedText type="caption">日限制</ThemedText>
                <ThemedText type="body">{regulations.dailyLimit} 条</ThemedText>
              </View>
            )}
            {regulations.possessionLimit && (
              <View style={styles.limitItem}>
                <ThemedText type="caption">持有限制</ThemedText>
                <ThemedText type="body">{regulations.possessionLimit} 条</ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* 禁钓期 */}
        {regulations.closedSeasons && regulations.closedSeasons.length > 0 && (
          <View style={styles.regulationItem}>
            <View style={styles.regulationHeader}>
              <IconSymbol name="calendar" size={16} color={theme.colors.warning} />
              <ThemedText type="subtitle" style={styles.regulationTitle}>
                禁钓期
              </ThemedText>
            </View>
            {regulations.closedSeasons.map((season, index) => (
              <View key={index} style={styles.closedSeason}>
                <ThemedText type="body">
                  {season.start} 至 {season.end}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 特殊规定 */}
      {regulations.specialRules && regulations.specialRules.length > 0 && (
        <View style={styles.specialRules}>
          <ThemedText type="subtitle" style={styles.specialRulesTitle}>
            特殊规定
          </ThemedText>
          {regulations.specialRules.map((rule, index) => (
            <View key={index} style={styles.ruleItem}>
              <IconSymbol name="info.circle" size={12} color={theme.colors.textSecondary} />
              <ThemedText type="caption" style={styles.ruleText}>
                {rule}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* 备注 */}
      {regulations.notes && (
        <View style={[styles.notesBox, { backgroundColor: theme.colors.surface }]}>
          <ThemedText type="caption" style={styles.notesText}>
            💡 {regulations.notes}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    marginVertical: 8,
  },
  stateSelector: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
    fontWeight: '700',
  },
  stateTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stateBadge: {
    minWidth: 45,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    fontWeight: '600',
  },
  validationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  validationText: {
    fontWeight: '600',
  },
  regulationsGrid: {
    gap: 20,
  },
  regulationItem: {
    gap: 12,
  },
  regulationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  regulationTitle: {
    fontWeight: '600',
  },
  sizeRange: {
    flexDirection: 'row',
    gap: 16,
  },
  sizeItem: {
    alignItems: 'center',
    gap: 4,
  },
  slotLimit: {
    alignItems: 'center',
    gap: 4,
  },
  sizeValue: {
    fontWeight: '700',
    fontSize: 18,
  },
  limitsContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  limitItem: {
    alignItems: 'center',
    gap: 4,
  },
  closedSeason: {
    paddingVertical: 4,
  },
  specialRules: {
    marginTop: 16,
    gap: 8,
  },
  specialRulesTitle: {
    fontWeight: '600',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 2,
  },
  ruleText: {
    flex: 1,
    lineHeight: 16,
  },
  notesBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  notesText: {
    fontStyle: 'italic',
  },
});

export default RegulationsDisplay;