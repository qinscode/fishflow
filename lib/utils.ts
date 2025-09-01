import { Fish, CatchRecord, FishRarity, WaterType, UserStats, PersonalBests } from './types';
import { RARITY_COLORS, MONTH_NAMES, SEASONS } from './constants';

// UUID生成器
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 日期格式化
export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    case 'long':
      return d.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
    case 'time':
      return d.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    default:
      return d.toLocaleDateString('zh-CN');
  }
}

// 相对时间格式化
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
  return `${Math.floor(diffDays / 365)}年前`;
}

// 数字格式化
export function formatNumber(num: number, decimals: number = 1): string {
  if (num === 0) return '0';
  if (num < 1000) return num.toFixed(decimals).replace(/\.0$/, '');
  if (num < 1000000) return (num / 1000).toFixed(decimals).replace(/\.0$/, '') + 'k';
  return (num / 1000000).toFixed(decimals).replace(/\.0$/, '') + 'M';
}

// 重量单位转换
export function convertWeight(weightKg: number, unit: 'kg' | 'lb'): number {
  if (unit === 'lb') {
    return weightKg * 2.20462;
  }
  return weightKg;
}

// 长度单位转换
export function convertLength(lengthCm: number, unit: 'cm' | 'inch'): number {
  if (unit === 'inch') {
    return lengthCm * 0.393701;
  }
  return lengthCm;
}

// 温度单位转换
export function convertTemperature(celsius: number, unit: 'celsius' | 'fahrenheit'): number {
  if (unit === 'fahrenheit') {
    return (celsius * 9/5) + 32;
  }
  return celsius;
}

// 格式化重量显示
export function formatWeight(weightKg: number, unit: 'kg' | 'lb' = 'kg'): string {
  const converted = convertWeight(weightKg, unit);
  const unitLabel = unit === 'kg' ? '千克' : '磅';
  return `${converted.toFixed(1)} ${unitLabel}`;
}

// 格式化长度显示
export function formatLength(lengthCm: number, unit: 'cm' | 'inch' = 'cm'): string {
  const converted = convertLength(lengthCm, unit);
  const unitLabel = unit === 'cm' ? '厘米' : '英寸';
  return `${converted.toFixed(1)} ${unitLabel}`;
}

// 获取稀有度颜色
export function getRarityColor(rarity: FishRarity): string {
  return RARITY_COLORS[rarity];
}

// 获取月份名称
export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] || '';
}

// 获取季节信息
export function getSeason(month: number) {
  for (const [key, season] of Object.entries(SEASONS)) {
    if (season.months.includes(month)) {
      return { key, ...season };
    }
  }
  return null;
}

// 检查鱼类是否已解锁
export function isFishUnlocked(fishId: string, catches: CatchRecord[]): boolean {
  return catches.some(catch => catch.fishId === fishId);
}

// 获取鱼类状态
export function getFishCardState(fish: Fish, catches: CatchRecord[]): 'locked' | 'unlocked' | 'new' {
  const fishCatches = catches.filter(catch => catch.fishId === fish.id);
  
  if (fishCatches.length === 0) {
    return 'locked';
  }
  
  // 检查是否是最近7天内解锁的
  const latestCatch = fishCatches.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  if (new Date(latestCatch.timestamp) > sevenDaysAgo && fishCatches.length === 1) {
    return 'new';
  }
  
  return 'unlocked';
}

// 计算用户统计数据
export function calculateUserStats(catches: CatchRecord[], fish: Fish[]): UserStats {
  if (catches.length === 0) {
    return {
      totalCatches: 0,
      uniqueSpecies: 0,
      totalWeight: 0,
      totalLength: 0,
      longestStreak: 0,
      currentStreak: 0,
      favoriteWaterType: 'lake',
      mostActiveMonth: 1,
      personalBests: {
        largestByWeight: { fishId: '', catchId: '', weight: 0 },
        largestByLength: { fishId: '', catchId: '', length: 0 },
        rarest: { fishId: '', catchId: '', rarity: 'common' },
      },
    };
  }

  const uniqueSpecies = new Set(catches.map(c => c.fishId)).size;
  
  const totalWeight = catches.reduce((sum, catch) => 
    sum + (catch.measurements.weightKg || 0), 0);
    
  const totalLength = catches.reduce((sum, catch) => 
    sum + (catch.measurements.lengthCm || 0), 0);

  // 计算连击
  const streaks = calculateStreaks(catches);
  
  // 计算最喜欢的水域类型
  const waterTypeCount: Record<WaterType, number> = {
    river: 0, lake: 0, reservoir: 0, pond: 0, 
    stream: 0, ocean: 0, estuary: 0
  };
  
  catches.forEach(catch => {
    if (catch.location?.waterType) {
      waterTypeCount[catch.location.waterType]++;
    }
  });
  
  const favoriteWaterType = Object.entries(waterTypeCount)
    .sort(([,a], [,b]) => b - a)[0][0] as WaterType;

  // 计算最活跃月份
  const monthCount: Record<number, number> = {};
  catches.forEach(catch => {
    const month = new Date(catch.timestamp).getMonth() + 1;
    monthCount[month] = (monthCount[month] || 0) + 1;
  });
  
  const mostActiveMonth = Object.entries(monthCount)
    .sort(([,a], [,b]) => b - a)[0]?.[0] 
    ? parseInt(Object.entries(monthCount).sort(([,a], [,b]) => b - a)[0][0])
    : 1;

  // 计算个人最佳
  const personalBests = calculatePersonalBests(catches, fish);

  return {
    totalCatches: catches.length,
    uniqueSpecies,
    totalWeight,
    totalLength,
    longestStreak: streaks.longest,
    currentStreak: streaks.current,
    favoriteWaterType,
    mostActiveMonth,
    personalBests,
  };
}

// 计算连击数据
export function calculateStreaks(catches: CatchRecord[]): { longest: number; current: number } {
  if (catches.length === 0) return { longest: 0, current: 0 };

  // 按日期分组
  const catchesByDate = catches
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .reduce((acc, catch) => {
      const date = formatDate(catch.timestamp, 'short');
      if (!acc[date]) acc[date] = [];
      acc[date].push(catch);
      return acc;
    }, {} as Record<string, CatchRecord[]>);

  const dates = Object.keys(catchesByDate).sort();
  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  // 计算当前连击
  const today = new Date();
  const lastCatchDate = new Date(dates[dates.length - 1]);
  const daysSinceLastCatch = Math.floor(
    (today.getTime() - lastCatchDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastCatch <= 1) {
    // 从最后一天往前计算当前连击
    currentStreak = 1;
    for (let i = dates.length - 2; i >= 0; i--) {
      const currDate = new Date(dates[i + 1]);
      const prevDate = new Date(dates[i]);
      const diffDays = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { longest: longestStreak, current: currentStreak };
}

// 计算个人最佳记录
export function calculatePersonalBests(catches: CatchRecord[], fish: Fish[]): PersonalBests {
  if (catches.length === 0) {
    return {
      largestByWeight: { fishId: '', catchId: '', weight: 0 },
      largestByLength: { fishId: '', catchId: '', length: 0 },
      rarest: { fishId: '', catchId: '', rarity: 'common' },
    };
  }

  // 最重的鱼
  const largestByWeight = catches
    .filter(c => c.measurements.weightKg && c.measurements.weightKg > 0)
    .sort((a, b) => (b.measurements.weightKg || 0) - (a.measurements.weightKg || 0))[0];

  // 最长的鱼
  const largestByLength = catches
    .filter(c => c.measurements.lengthCm && c.measurements.lengthCm > 0)
    .sort((a, b) => (b.measurements.lengthCm || 0) - (a.measurements.lengthCm || 0))[0];

  // 最稀有的鱼
  const rarityOrder: Record<FishRarity, number> = {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
  };

  const rarest = catches
    .map(catch => {
      const fishData = fish.find(f => f.id === catch.fishId);
      return { catch, rarity: fishData?.rarity || 'common' };
    })
    .sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity])[0];

  return {
    largestByWeight: largestByWeight ? {
      fishId: largestByWeight.fishId,
      catchId: largestByWeight.id,
      weight: largestByWeight.measurements.weightKg || 0,
    } : { fishId: '', catchId: '', weight: 0 },
    
    largestByLength: largestByLength ? {
      fishId: largestByLength.fishId,
      catchId: largestByLength.id,
      length: largestByLength.measurements.lengthCm || 0,
    } : { fishId: '', catchId: '', length: 0 },
    
    rarest: rarest ? {
      fishId: rarest.catch.fishId,
      catchId: rarest.catch.id,
      rarity: rarest.rarity,
    } : { fishId: '', catchId: '', rarity: 'common' },
  };
}

// 筛选鱼类
export function filterFish(fish: Fish[], filters: {
  searchQuery?: string;
  rarity?: FishRarity[];
  waterTypes?: WaterType[];
  regions?: string[];
  seasons?: number[];
  unlockedOnly?: boolean;
}, catches: CatchRecord[] = []): Fish[] {
  let filtered = [...fish];

  // 搜索查询
  if (filters.searchQuery?.trim()) {
    const query = filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(f => 
      f.name.toLowerCase().includes(query) ||
      f.scientificName?.toLowerCase().includes(query) ||
      f.family.toLowerCase().includes(query) ||
      f.localNames?.some(name => name.toLowerCase().includes(query))
    );
  }

  // 稀有度筛选
  if (filters.rarity?.length) {
    filtered = filtered.filter(f => filters.rarity!.includes(f.rarity));
  }

  // 水域类型筛选
  if (filters.waterTypes?.length) {
    filtered = filtered.filter(f => 
      f.habitat.waterTypes.some(wt => filters.waterTypes!.includes(wt))
    );
  }

  // 地区筛选
  if (filters.regions?.length) {
    filtered = filtered.filter(f => 
      f.habitat.regions.some(region => filters.regions!.includes(region))
    );
  }

  // 季节筛选
  if (filters.seasons?.length) {
    filtered = filtered.filter(f => 
      f.habitat.seasons.some(season => filters.seasons!.includes(season))
    );
  }

  // 仅已解锁
  if (filters.unlockedOnly) {
    const unlockedIds = new Set(catches.map(c => c.fishId));
    filtered = filtered.filter(f => unlockedIds.has(f.id));
  }

  return filtered;
}

// 排序鱼类
export function sortFish(fish: Fish[], sortBy: 'name' | 'rarity' | 'recent', catches: CatchRecord[] = []): Fish[] {
  const sorted = [...fish];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      
    case 'rarity':
      const rarityOrder: Record<FishRarity, number> = {
        legendary: 4,
        epic: 3,
        rare: 2,
        common: 1,
      };
      return sorted.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
      
    case 'recent':
      const recentCatches = new Map<string, number>();
      catches.forEach(catch => {
        const timestamp = new Date(catch.timestamp).getTime();
        if (!recentCatches.has(catch.fishId) || timestamp > recentCatches.get(catch.fishId)!) {
          recentCatches.set(catch.fishId, timestamp);
        }
      });
      
      return sorted.sort((a, b) => {
        const aTime = recentCatches.get(a.id) || 0;
        const bTime = recentCatches.get(b.id) || 0;
        return bTime - aTime;
      });
      
    default:
      return sorted;
  }
}

// 验证表单数据
export function validateCatchForm(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.photos?.length && !data.fishId && !data.customFishName) {
    errors.push('请至少提供照片或选择/输入鱼类');
  }

  if (data.measurements?.lengthCm && (data.measurements.lengthCm < 0 || data.measurements.lengthCm > 1000)) {
    errors.push('长度必须在0-1000厘米之间');
  }

  if (data.measurements?.weightKg && (data.measurements.weightKg < 0 || data.measurements.weightKg > 1000)) {
    errors.push('重量必须在0-1000千克之间');
  }

  if (data.notes && data.notes.length > 500) {
    errors.push('备注不能超过500字符');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 生成热力图数据
export function generateHeatmapData(catches: CatchRecord[], year: number): Record<string, number> {
  const heatmapData: Record<string, number> = {};
  
  catches
    .filter(catch => new Date(catch.timestamp).getFullYear() === year)
    .forEach(catch => {
      const date = formatDate(catch.timestamp, 'short');
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });

  return heatmapData;
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}