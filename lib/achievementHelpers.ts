import { t } from './i18n';
import { Achievement } from './types';

/**
 * 获取成就的本地化名称
 * 优先使用翻译键，回退到原始名称
 */
export const getAchievementName = (achievement: Achievement): string => {
  const translationKey = `achievement.${achievement.id.replace(/-/g, '.')}.name` as any;
  return t(translationKey) !== translationKey ? t(translationKey) : achievement.name;
};

/**
 * 获取成就的本地化描述
 * 优先使用翻译键，回退到原始描述
 */
export const getAchievementDescription = (achievement: Achievement): string => {
  const translationKey = `achievement.${achievement.id.replace(/-/g, '.')}.description` as any;
  return t(translationKey) !== translationKey ? t(translationKey) : achievement.description;
};

/**
 * 安全地获取翻译文本，避免显示翻译键
 * 如果翻译不存在，返回回退值
 */
export const safeTranslate = (key: string, fallback: string): string => {
  const translated = t(key as any);
  return translated !== key ? translated : fallback;
};