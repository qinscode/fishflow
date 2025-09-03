import { Fish, CatchRecord, FishRarity, EdibilityRating } from './types';

// UUID生成器
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 日期格式化
export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'time' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    case 'long':
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    case 'time':
      return d.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return d.toLocaleDateString('zh-CN');
  }
}

// 获取稀有度颜色
export function getRarityColor(rarity: FishRarity): string {
  const colors = {
    common: '#9AA0A6', // 普通 - 灰色
    unique: '#1DB954', // 优秀/精良 - 绿色
    rare: '#2F80ED', // 稀有 - 蓝色
    epic: '#8B5CF6', // 史诗 - 紫色
    legendary: '#F59E0B', // 传奇 - 橙色
    unknown: '#9CA3AF',
  };
  return colors[rarity];
}

// 根据星级数量获取颜色
export function getStarRatingColor(starCount: number): string {
  const colors = {
    1: '#9AA0A6', // 1星 - 灰色
    2: '#1DB954', // 2星 - 绿色
    3: '#2F80ED', // 3星 - 蓝色
    4: '#8B5CF6', // 4星 - 紫色
    5: '#F59E0B', // 5星 - 橙色
  };
  return colors[starCount as keyof typeof colors] || '#9AA0A6';
}

// 根据食用评级获取星星数量
export function getStarCountByEdibility(
  edibilityRating: string | null | undefined
): number {
  if (!edibilityRating) {
    return 1; // 默认1星
  }

  switch (edibilityRating.toLowerCase()) {
    case 'excellent':
      return 5; // 优秀 - 5星
    case 'good':
      return 4; // 良好 - 4星
    case 'fair':
      return 3; // 一般 - 3星
    case 'poor':
      return 2; // 较差 - 2星
    case 'variable':
      return 3; // 可变 - 3星（中等）
    case 'not_recommended':
    case 'not_edible':
    case 'no_take':
    case 'protected':
      return 1; // 不建议食用/不可食用/禁捕/保护 - 1星
    default:
      return 1; // 未知或其他情况 - 1星
  }
}

// 根据食用评级获取颜色
export function getColorByEdibility(
  edibilityRating: EdibilityRating | string | null | undefined
): string {
  if (!edibilityRating) {
    return '#9CA3AF'; // 默认颜色
  }

  // 从constants导入edibility颜色映射
  const EDIBILITY_COLORS: Record<string, string> = {
    excellent: '#10B981', // 绿色 - 优秀
    good: '#3B82F6', // 蓝色 - 良好
    fair: '#F59E0B', // 橙色 - 一般
    poor: '#EF4444', // 红色 - 较差
    variable: '#8B5CF6', // 紫色 - 可变
    not_recommended: '#6B7280', // 灰色 - 不推荐
    not_edible: '#6B7280', // 灰色 - 不可食用
    no_take: '#6B7280', // 灰色 - 禁捕
    protected: '#6B7280', // 灰色 - 保护物种
    default: '#9CA3AF', // 默认颜色
  };

  return (
    EDIBILITY_COLORS[edibilityRating.toLowerCase()] || EDIBILITY_COLORS.default
  );
}

// 检查鱼类是否已解锁
export function isFishUnlocked(
  fishId: string,
  catches: CatchRecord[]
): boolean {
  return catches.some(function (catchRecord) {
    return catchRecord.fishId === fishId;
  });
}

// 获取鱼类状态
export function getFishCardState(
  fish: Fish,
  catches: CatchRecord[]
): 'locked' | 'unlocked' | 'new' {
  const fishCatches = catches.filter(function (catchRecord) {
    return catchRecord.fishId === fish.id;
  });

  if (fishCatches.length === 0) {
    return 'locked';
  }

  // 检查是否是最近7天内解锁的
  const latestCatch = fishCatches.sort(function (a, b) {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  })[0];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  if (
    new Date(latestCatch.timestamp) > sevenDaysAgo &&
    fishCatches.length === 1
  ) {
    return 'new';
  }

  return 'unlocked';
}

// 排序鱼类
export function sortFish(
  fish: Fish[],
  sortBy: 'name' | 'edibility' | 'recent',
  catches: CatchRecord[] = []
): Fish[] {
  // If already empty or single item, no need to sort
  if (fish.length <= 1) {
    return fish;
  }

  // Create a copy only when we actually need to sort
  const sorted = [...fish];

  switch (sortBy) {
    case 'name':
      return sorted.sort(function (a, b) {
        return a.name.localeCompare(b.name, 'zh-CN');
      });

    case 'edibility':
      // Higher score means more edible
      const edibilityOrder: Record<string, number> = {
        excellent: 9,
        good: 8,
        fair: 7,
        poor: 6,
        variable: 5,
        not_recommended: 4,
        not_edible: 3,
        no_take: 2,
        protected: 1,
        unknown: 0,
      };
      return sorted.sort(function (a, b) {
        const aRating = a.edibility?.rating ?? 'unknown';
        const bRating = b.edibility?.rating ?? 'unknown';
        return (edibilityOrder[bRating] || 0) - (edibilityOrder[aRating] || 0);
      });

    case 'recent':
      const recentCatches = new Map();
      catches.forEach(function (catchRecord) {
        const timestamp = new Date(catchRecord.timestamp).getTime();
        if (
          !recentCatches.has(catchRecord.fishId) ||
          timestamp > recentCatches.get(catchRecord.fishId)
        ) {
          recentCatches.set(catchRecord.fishId, timestamp);
        }
      });

      return sorted.sort(function (a, b) {
        const aTime = recentCatches.get(a.id) || 0;
        const bTime = recentCatches.get(b.id) || 0;
        return bTime - aTime;
      });

    default:
      return fish; // Return original reference if no sorting needed
  }
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      func.apply(null, args);
    }, wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(function () {
        inThrottle = false;
      }, limit);
    }
  };
}
