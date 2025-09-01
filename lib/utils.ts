import { Fish, CatchRecord, FishRarity } from './types';

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

// 获取稀有度颜色
export function getRarityColor(rarity: FishRarity): string {
  const colors = {
    common: '#6B7280',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
  };
  return colors[rarity];
}

// 检查鱼类是否已解锁
export function isFishUnlocked(fishId: string, catches: CatchRecord[]): boolean {
  return catches.some(function(catchRecord) {
    return catchRecord.fishId === fishId;
  });
}

// 获取鱼类状态
export function getFishCardState(fish: Fish, catches: CatchRecord[]): 'locked' | 'unlocked' | 'new' {
  const fishCatches = catches.filter(function(catchRecord) {
    return catchRecord.fishId === fish.id;
  });
  
  if (fishCatches.length === 0) {
    return 'locked';
  }
  
  // 检查是否是最近7天内解锁的
  const latestCatch = fishCatches.sort(function(a, b) {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  })[0];
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  if (new Date(latestCatch.timestamp) > sevenDaysAgo && fishCatches.length === 1) {
    return 'new';
  }
  
  return 'unlocked';
}

// 排序鱼类
export function sortFish(fish: Fish[], sortBy: 'name' | 'rarity' | 'recent', catches: CatchRecord[] = []): Fish[] {
  const sorted = [...fish];

  switch (sortBy) {
    case 'name':
      return sorted.sort(function(a, b) {
        return a.name.localeCompare(b.name, 'zh-CN');
      });
      
    case 'rarity':
      const rarityOrder = {
        legendary: 4,
        epic: 3,
        rare: 2,
        common: 1,
      };
      return sorted.sort(function(a, b) {
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      });
      
    case 'recent':
      const recentCatches = new Map();
      catches.forEach(function(catchRecord) {
        const timestamp = new Date(catchRecord.timestamp).getTime();
        if (!recentCatches.has(catchRecord.fishId) || timestamp > recentCatches.get(catchRecord.fishId)) {
          recentCatches.set(catchRecord.fishId, timestamp);
        }
      });
      
      return sorted.sort(function(a, b) {
        const aTime = recentCatches.get(a.id) || 0;
        const bTime = recentCatches.get(b.id) || 0;
        return bTime - aTime;
      });
      
    default:
      return sorted;
  }
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(function() {
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
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(function() {
        inThrottle = false;
      }, limit);
    }
  };
}