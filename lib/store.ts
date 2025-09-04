import { create } from 'zustand';
import { databaseService } from './database';

import {
  Fish,
  CatchRecord,
  Achievement,
  UserAchievement,
  UserProfile,
  UserPreferences,
  UserStats,
  FishdexFilters,
  EquipmentSet,
  EquipmentItem,
  EquipmentStats,
} from './types';

// 简化的App状态接口
interface AppState {
  // 数据状态
  fish: Fish[];
  catches: CatchRecord[];
  achievements: Achievement[];
  userAchievements: UserAchievement[];

  // 装备数据
  equipmentSets: EquipmentSet[];
  equipmentItems: EquipmentItem[];
  equipmentStats: EquipmentStats[];

  // 用户数据
  userProfile: UserProfile | null;
  userPreferences: UserPreferences;
  userStats: UserStats;

  // UI 状态
  isLoading: boolean;
  currentView: string;
  filters: FishdexFilters;
  searchQuery: string;

  // 缓存数据
  unlockedFishIds: Set<string>;
}

// App 操作接口
interface AppActions {
  // 数据操作
  setFish: (fish: Fish[]) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setUserAchievements: (userAchievements: UserAchievement[]) => void;
  addCatch: (
    catchData: Omit<CatchRecord, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  setCatches: (catches: CatchRecord[]) => void;

  // 装备操作
  setEquipmentSets: (equipmentSets: EquipmentSet[]) => void;
  addEquipmentSet: (equipmentSet: Omit<EquipmentSet, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEquipmentSet: (id: string, updates: Partial<EquipmentSet>) => void;
  deleteEquipmentSet: (id: string) => void;
  setEquipmentItems: (equipmentItems: EquipmentItem[]) => void;
  setEquipmentStats: (equipmentStats: EquipmentStats[]) => void;

  // 用户偏好操作
  updateUserPreferences: (updates: Partial<UserPreferences>) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // UI 操作
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<FishdexFilters>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;

  // 初始化
  initializeData: () => Promise<void>;
}

// 默认用户偏好设置
const defaultUserPreferences: UserPreferences = {
  units: {
    length: 'cm',
    weight: 'kg',
    temperature: 'celsius',
  },
  privacy: {
    defaultLocationPrivacy: 'fuzzy',
    shareAchievements: true,
    shareStats: true,
  },
  notifications: {
    achievements: true,
    reminders: true,
    weather: true,
  },
  appearance: {
    theme: 'system',
    language: 'en',
    rpgFrames: false,
  },
};

// 默认用户统计
const defaultUserStats: UserStats = {
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

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 创建 Zustand store
export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // 初始状态
  fish: [],
  catches: [],
  achievements: [],
  userAchievements: [],
  equipmentSets: [],
  equipmentItems: [],
  equipmentStats: [],
  userProfile: null,
  userPreferences: defaultUserPreferences,
  userStats: defaultUserStats,
  isLoading: false,
  currentView: 'home',
  filters: {},
  searchQuery: '',
  unlockedFishIds: new Set<string>(),

  // 数据操作
  setFish: fish => {
    // Reset cache when fish data changes
    cachedFilteredFish = [];
    lastFilterState = '';
    set({ fish });
  },

  setAchievements: achievements => {
    // Reset caches when achievements data changes
    cachedAchievementStats = { totalCount: 0, unlockedCount: 0, progressPercent: 0 };
    lastAchievementStatsState = '';
    set({ achievements });
  },

  setUserAchievements: userAchievements => {
    // Reset caches when user achievements data changes
    cachedAchievementStats = { totalCount: 0, unlockedCount: 0, progressPercent: 0 };
    lastAchievementStatsState = '';
    set({ userAchievements });
  },

  addCatch: catchData => {
    const newCatch: CatchRecord = {
      ...catchData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Reset cache when adding new catch
    cachedFilteredFish = [];
    lastFilterState = '';
    cachedUserStats = defaultUserStats;
    lastUserStatsState = '';

    set(state => {
      const updatedCatches = [...state.catches, newCatch];
      const unlockedIds = new Set(
        updatedCatches
          .filter(c => !c.isSkunked && c.fishId)
          .map(c => c.fishId)
      );
      return {
        catches: updatedCatches,
        unlockedFishIds: unlockedIds,
      };
    });
  },

  setCatches: catches => {
    // Reset cache when catches data changes
    cachedFilteredFish = [];
    lastFilterState = '';
    cachedUserStats = defaultUserStats;
    lastUserStatsState = '';
    set(state => {
      const unlockedIds = new Set(
        catches.filter(c => !c.isSkunked && c.fishId).map(c => c.fishId)
      );
      return {
        catches,
        unlockedFishIds: unlockedIds,
      };
    });
  },

  // 装备操作
  setEquipmentSets: equipmentSets => {
    set({ equipmentSets });
  },

  addEquipmentSet: equipmentData => {
    const newEquipmentSet: EquipmentSet = {
      ...equipmentData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set(state => ({
      equipmentSets: [...state.equipmentSets, newEquipmentSet],
    }));
  },

  updateEquipmentSet: (id, updates) => {
    set(state => ({
      equipmentSets: state.equipmentSets.map(set =>
        set.id === id
          ? { ...set, ...updates, updatedAt: new Date().toISOString() }
          : set
      ),
    }));
  },

  deleteEquipmentSet: id => {
    set(state => ({
      equipmentSets: state.equipmentSets.filter(set => set.id !== id),
      equipmentStats: state.equipmentStats.filter(stat => stat.equipmentSetId !== id),
    }));
  },

  setEquipmentItems: equipmentItems => {
    set({ equipmentItems });
  },

  setEquipmentStats: equipmentStats => {
    set({ equipmentStats });
  },

  // 用户偏好操作
  updateUserPreferences: updates => {
    // Omit deprecated keys like fishingStartDate
    const { fishingStartDate, ...rest } = updates as any;
    set(state => ({
      userPreferences: { ...state.userPreferences, ...rest },
    }));
  },

  updateUserProfile: updates => {
    set(state => ({
      userProfile: state.userProfile 
        ? { ...state.userProfile, ...updates }
        : null,
    }));
  },

  // UI 操作
  setLoading: isLoading => {
    set({ isLoading });
  },

  setFilters: newFilters => {
    // Reset cache when filters change
    cachedFilteredFish = [];
    lastFilterState = '';
    set(state => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  setSearchQuery: searchQuery => {
    // Reset cache when search query changes
    cachedFilteredFish = [];
    lastFilterState = '';
    set({ searchQuery });
  },

  clearFilters: () => {
    // Reset cache when clearing filters
    cachedFilteredFish = [];
    lastFilterState = '';
    set({
      filters: {},
      searchQuery: '',
    });
  },

  // 初始化数据
  initializeData: async () => {
    const state = get();
    state.setLoading(true);

    try {
      // 这里可以从数据库或API加载数据
      console.log('Initializing data...');

      // One-time cleanup: remove deprecated fishingStartDate from preferences
      const prefs: any = get().userPreferences;
      if (prefs && Object.prototype.hasOwnProperty.call(prefs, 'fishingStartDate')) {
        const { fishingStartDate: _deprecated, ...cleaned } = prefs;
        set({ userPreferences: cleaned });
        try {
          await databaseService.updateUserPreferences(cleaned);
        } catch (e) {
          console.warn('Failed to persist cleaned preferences:', e);
        }
      }
    } catch (error) {
      console.error('Failed to initialize data:', error);
    } finally {
      state.setLoading(false);
    }
  },
}));

// 选择器hooks
export const useFish = () => useAppStore(state => state.fish);
export const useCatches = () => useAppStore(state => state.catches);
export const useAchievements = () => useAppStore(state => state.achievements);
export const useUserAchievements = () =>
  useAppStore(state => state.userAchievements);
export const useEquipmentSets = () => useAppStore(state => state.equipmentSets);
export const useEquipmentItems = () => useAppStore(state => state.equipmentItems);
export const useEquipmentStats = () => useAppStore(state => state.equipmentStats);
export const useUserProfile = () => useAppStore(state => state.userProfile);
export const useUserPreferences = () =>
  useAppStore(state => state.userPreferences);
// 缓存变量用于用户统计选择器
let cachedUserStats: UserStats = defaultUserStats;
let lastUserStatsState: string = '';

// 动态计算用户统计数据的选择器
export const useUserStats = () => {
  return useAppStore(state => {
    const { catches, fish } = state;
    
    // Create hash for current state
    const currentStatsState = JSON.stringify({
      catchesLength: catches.length,
      catchesData: catches.map(c => ({ 
        fishId: c.fishId, 
        timestamp: c.timestamp,
        weight: c.measurements?.weightKg || 0,
        length: c.measurements?.lengthCm || 0
      })),
    });

    // Return cached result if state hasn't changed
    if (currentStatsState === lastUserStatsState) {
      return cachedUserStats;
    }

    // Update cache state
    lastUserStatsState = currentStatsState;
    
    // Compute start date: earliest catch date if any
    let startDate: Date | null = null;
    if (catches.length > 0) {
      const earliest = catches.reduce((min, c) =>
        new Date(c.timestamp) < min ? new Date(c.timestamp) : min,
      new Date(catches[0].timestamp));
      startDate = earliest;
    }

    // If still no start date and no catches, keep defaults
    if (!startDate) {
      cachedUserStats = defaultUserStats;
      return cachedUserStats;
    }

    // 计算总钓获数（包含空军）
    const totalCatches = catches.length;
    
    // 计算独特鱼种数
    const uniqueSpeciesIds = new Set(
      catches.filter(c => !c.isSkunked && c.fishId).map(c => c.fishId)
    );
    const uniqueSpecies = uniqueSpeciesIds.size;
    
    // 计算开始钓鱼的天数：优先使用用户设置的开始日期
    const startOfFirstDay = new Date(startDate.toDateString()).getTime();
    const startOfToday = new Date(new Date().toDateString()).getTime();
    const daysSinceFirstCatch = Math.max(
      1,
      Math.floor((startOfToday - startOfFirstDay) / (1000 * 60 * 60 * 24)) + 1
    );
    
    // 计算总重量和总长度
    let totalWeight = 0;
    let totalLength = 0;
    catches.forEach(catchRecord => {
      if (catchRecord.measurements) {
        if (catchRecord.measurements.weightKg) {
          totalWeight += catchRecord.measurements.weightKg;
        }
        if (catchRecord.measurements.lengthCm) {
          totalLength += catchRecord.measurements.lengthCm;
        }
      }
    });

    cachedUserStats = {
      totalCatches,
      uniqueSpecies,
      totalWeight: Math.round(totalWeight * 100) / 100, // 保留两位小数
      totalLength: Math.round(totalLength * 100) / 100, // 保留两位小数
      longestStreak: 0, // 暂时保持为0，可以后续实现
      currentStreak: daysSinceFirstCatch, // 改为开始钓鱼的天数
      favoriteWaterType: 'lake', // 暂时保持默认值
      mostActiveMonth: 1, // 暂时保持默认值
      personalBests: {
        largestByWeight: { fishId: '', catchId: '', weight: 0 },
        largestByLength: { fishId: '', catchId: '', length: 0 },
        rarest: { fishId: '', catchId: '', rarity: 'common' },
      },
    };

    return cachedUserStats;
  });
};
export const useIsLoading = () => useAppStore(state => state.isLoading);
export const useCurrentView = () => useAppStore(state => state.currentView);
export const useFilters = () => useAppStore(state => state.filters);
export const useSearchQuery = () => useAppStore(state => state.searchQuery);
export const useUnlockedFishIds = () =>
  useAppStore(state => state.unlockedFishIds);

// 导出单例实例的缓存选择器，确保引用稳定性
let cachedFilteredFish: Fish[] = [];
let lastFilterState: string = '';

// 计算选择器
export const useFilteredFish = () => {
  return useAppStore(state => {
    const { fish, filters, searchQuery, catches } = state;

    // Return early if no fish data
    if (!fish.length) {
      cachedFilteredFish = [];
      return cachedFilteredFish;
    }

    // Create a stable hash of the filter state to detect changes
    const currentFilterState = JSON.stringify({
      searchQuery: searchQuery.trim(),
      rarity: filters.rarity || [],
      waterTypes: filters.waterTypes || [],
      unlockedOnly: filters.unlockedOnly || false,
      fishLength: fish.length, // Track if fish data changed
      catchesLength: catches.length, // Track if catches changed
    });

    // If filter state hasn't changed, return cached result
    if (currentFilterState === lastFilterState && cachedFilteredFish !== null) {
      return cachedFilteredFish;
    }

    // Update the filter state cache
    lastFilterState = currentFilterState;

    // Check if any filtering is needed
    const hasFilters = Boolean(
      searchQuery.trim() ||
      (filters.rarity && filters.rarity.length > 0) ||
      (filters.waterTypes && filters.waterTypes.length > 0) ||
      filters.unlockedOnly
    );

    // If no filters, return original array reference and cache it
    if (!hasFilters) {
      cachedFilteredFish = fish;
      return cachedFilteredFish;
    }

    let filtered = fish;

    // 搜索查询
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        f =>
          f.name.toLowerCase().includes(query) ||
          (f.scientificName &&
            f.scientificName.toLowerCase().includes(query)) ||
          f.family.toLowerCase().includes(query)
      );
    }

    // 稀有度筛选
    if (filters.rarity && filters.rarity.length > 0) {
      filtered = filtered.filter(f => filters.rarity!.includes(f.rarity));
    }

    // 水域类型筛选
    if (filters.waterTypes && filters.waterTypes.length > 0) {
      filtered = filtered.filter(f =>
        f.habitat.waterTypes.some(wt => filters.waterTypes!.includes(wt))
      );
    }

    // 仅已解锁
    if (filters.unlockedOnly) {
      const unlockedIds = new Set(
        catches.filter(c => !c.isSkunked && c.fishId).map(c => c.fishId)
      );
      filtered = filtered.filter(f => unlockedIds.has(f.id));
    }

    // Cache and return the filtered result
    cachedFilteredFish = filtered;
    return cachedFilteredFish;
  });
};

// 缓存变量用于成就统计选择器
let cachedAchievementStats: { totalCount: number; unlockedCount: number; progressPercent: number } = { totalCount: 0, unlockedCount: 0, progressPercent: 0 };
let lastAchievementStatsState: string = '';

// 统计选择器
export const useAchievementStats = () => {
  return useAppStore(state => {
    const { achievements, userAchievements } = state;

    // Create hash for current state
    const currentStatsState = JSON.stringify({
      achievementsLength: achievements.length,
      userAchievementsLength: userAchievements.length,
      unlockedTiers: userAchievements.map(ua => ua.tier !== null ? 1 : 0),
    });

    // Return cached result if state hasn't changed
    if (currentStatsState === lastAchievementStatsState) {
      return cachedAchievementStats;
    }

    // Update cache state
    lastAchievementStatsState = currentStatsState;

    const totalCount = achievements.length;
    const unlockedCount = userAchievements.filter(
      ua => ua.tier !== null
    ).length;
    const progressPercent =
      totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    cachedAchievementStats = {
      totalCount,
      unlockedCount,
      progressPercent,
    };

    return cachedAchievementStats;
  });
};
