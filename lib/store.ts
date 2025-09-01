import { create } from 'zustand';
import { subscribeWithSelector, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Fish,
  CatchRecord,
  Achievement,
  UserAchievement,
  UserProfile,
  UserPreferences,
  UserStats,
  FishdexFilters,
  HeatmapData,
} from './types';
import { calculateUserStats } from './utils';
import { DEFAULT_ACHIEVEMENTS } from './constants';

// App 状态接口
interface AppState {
  // 数据状态
  fish: Fish[];
  catches: CatchRecord[];
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  
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
  lastSyncTimestamp: number;
}

// App 操作接口
interface AppActions {
  // 数据操作
  setFish: (fish: Fish[]) => void;
  addCatch: (catch: Omit<CatchRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCatch: (id: string, updates: Partial<CatchRecord>) => void;
  deleteCatch: (id: string) => void;
  setCatches: (catches: CatchRecord[]) => void;
  
  // 成就操作
  setAchievements: (achievements: Achievement[]) => void;
  updateUserAchievement: (achievementId: string, updates: Partial<UserAchievement>) => void;
  checkAchievements: () => void;
  
  // 用户操作
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  setUserPreferences: (preferences: UserPreferences) => void;
  updateUserPreferences: (updates: Partial<UserPreferences>) => void;
  
  // UI 操作
  setLoading: (loading: boolean) => void;
  setCurrentView: (view: string) => void;
  setFilters: (filters: Partial<FishdexFilters>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // 工具方法
  refreshStats: () => void;
  refreshUnlockedFish: () => void;
  initializeData: () => Promise<void>;
  resetApp: () => void;
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
    theme: 'auto',
    language: 'zh-CN',
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

// 创建持久化配置
const persistConfig = {
  name: 'fishflow-storage',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state: AppState) => ({
    // 只持久化需要的数据
    fish: state.fish,
    catches: state.catches,
    userAchievements: state.userAchievements,
    userProfile: state.userProfile,
    userPreferences: state.userPreferences,
    filters: state.filters,
    lastSyncTimestamp: state.lastSyncTimestamp,
  }),
};

// 创建 Zustand store
export const useAppStore = create<AppState & AppActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // 初始状态
        fish: [],
        catches: [],
        achievements: DEFAULT_ACHIEVEMENTS,
        userAchievements: [],
        userProfile: null,
        userPreferences: defaultUserPreferences,
        userStats: defaultUserStats,
        isLoading: false,
        currentView: 'home',
        filters: {},
        searchQuery: '',
        unlockedFishIds: new Set<string>(),
        lastSyncTimestamp: 0,

        // 数据操作
        setFish: (fish) => {
          set({ fish });
          get().refreshUnlockedFish();
          get().refreshStats();
        },

        addCatch: (catchData) => {
          const newCatch: CatchRecord = {
            ...catchData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            catches: [...state.catches, newCatch],
          }));

          get().refreshUnlockedFish();
          get().refreshStats();
          get().checkAchievements();
        },

        updateCatch: (id, updates) => {
          set((state) => ({
            catches: state.catches.map((catch) =>
              catch.id === id
                ? { ...catch, ...updates, updatedAt: new Date().toISOString() }
                : catch
            ),
          }));

          get().refreshStats();
        },

        deleteCatch: (id) => {
          set((state) => ({
            catches: state.catches.filter((catch) => catch.id !== id),
          }));

          get().refreshUnlockedFish();
          get().refreshStats();
        },

        setCatches: (catches) => {
          set({ catches });
          get().refreshUnlockedFish();
          get().refreshStats();
          get().checkAchievements();
        },

        // 成就操作
        setAchievements: (achievements) => {
          set({ achievements });
        },

        updateUserAchievement: (achievementId, updates) => {
          set((state) => {
            const existingIndex = state.userAchievements.findIndex(
              (ua) => ua.achievementId === achievementId
            );

            if (existingIndex >= 0) {
              const updated = [...state.userAchievements];
              updated[existingIndex] = { ...updated[existingIndex], ...updates };
              return { userAchievements: updated };
            } else {
              const newUserAchievement: UserAchievement = {
                achievementId,
                progress: 0,
                tier: null,
                isViewed: false,
                ...updates,
              };
              return {
                userAchievements: [...state.userAchievements, newUserAchievement],
              };
            }
          });
        },

        checkAchievements: () => {
          const state = get();
          const { catches, fish, achievements, userAchievements } = state;

          achievements.forEach((achievement) => {
            let progress = 0;
            let newTier: 'bronze' | 'silver' | 'gold' | null = null;

            // 根据成就类型计算进度
            switch (achievement.category) {
              case 'species':
                progress = new Set(catches.map((c) => c.fishId)).size;
                break;

              case 'quantity':
                progress = catches.length;
                break;

              case 'size':
                const heaviestCatch = Math.max(
                  ...catches.map((c) => c.measurements.weightKg || 0)
                );
                progress = heaviestCatch;
                break;

              case 'streak':
                progress = state.userStats.longestStreak;
                break;

              case 'location':
                const uniqueWaterTypes = new Set(
                  catches.map((c) => c.location?.waterType).filter(Boolean)
                ).size;
                progress = uniqueWaterTypes;
                break;

              case 'special':
                if (achievement.id === 'first-catch') {
                  progress = catches.length > 0 ? 1 : 0;
                }
                break;
            }

            // 确定等级
            if (progress >= achievement.tiers.gold.requirement) {
              newTier = 'gold';
            } else if (progress >= achievement.tiers.silver.requirement) {
              newTier = 'silver';
            } else if (progress >= achievement.tiers.bronze.requirement) {
              newTier = 'bronze';
            }

            // 更新用户成就
            const existingAchievement = userAchievements.find(
              (ua) => ua.achievementId === achievement.id
            );

            const shouldUpdate =
              !existingAchievement ||
              existingAchievement.progress !== progress ||
              existingAchievement.tier !== newTier;

            if (shouldUpdate) {
              const wasLocked = !existingAchievement || !existingAchievement.tier;
              const isNowUnlocked = newTier !== null;

              get().updateUserAchievement(achievement.id, {
                progress,
                tier: newTier,
                unlockedAt: wasLocked && isNowUnlocked ? new Date().toISOString() : existingAchievement?.unlockedAt,
                isViewed: wasLocked && isNowUnlocked ? false : existingAchievement?.isViewed || false,
              });
            }
          });
        },

        // 用户操作
        setUserProfile: (profile) => {
          set({ userProfile: profile });
        },

        updateUserProfile: (updates) => {
          set((state) => ({
            userProfile: state.userProfile
              ? { ...state.userProfile, ...updates }
              : null,
          }));
        },

        setUserPreferences: (preferences) => {
          set({ userPreferences: preferences });
        },

        updateUserPreferences: (updates) => {
          set((state) => ({
            userPreferences: { ...state.userPreferences, ...updates },
          }));
        },

        // UI 操作
        setLoading: (isLoading) => {
          set({ isLoading });
        },

        setCurrentView: (currentView) => {
          set({ currentView });
        },

        setFilters: (newFilters) => {
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
          }));
        },

        setSearchQuery: (searchQuery) => {
          set({ searchQuery });
        },

        clearFilters: () => {
          set({
            filters: {},
            searchQuery: '',
          });
        },

        // 工具方法
        refreshStats: () => {
          const { catches, fish } = get();
          const stats = calculateUserStats(catches, fish);
          set({ userStats: stats });
        },

        refreshUnlockedFish: () => {
          const { catches } = get();
          const unlockedIds = new Set(catches.map((c) => c.fishId));
          set({ unlockedFishIds: unlockedIds });
        },

        initializeData: async () => {
          const state = get();
          state.setLoading(true);

          try {
            // 这里可以从数据库或API加载数据
            // 暂时使用空数组作为默认值
            
            state.refreshUnlockedFish();
            state.refreshStats();
            state.checkAchievements();

            set({ lastSyncTimestamp: Date.now() });
          } catch (error) {
            console.error('Failed to initialize data:', error);
          } finally {
            state.setLoading(false);
          }
        },

        resetApp: () => {
          set({
            fish: [],
            catches: [],
            achievements: DEFAULT_ACHIEVEMENTS,
            userAchievements: [],
            userProfile: null,
            userPreferences: defaultUserPreferences,
            userStats: defaultUserStats,
            filters: {},
            searchQuery: '',
            unlockedFishIds: new Set<string>(),
            lastSyncTimestamp: 0,
          });
        },
      }),
      persistConfig
    )
  )
);

// 选择器hooks
export const useFish = () => useAppStore((state) => state.fish);
export const useCatches = () => useAppStore((state) => state.catches);
export const useAchievements = () => useAppStore((state) => state.achievements);
export const useUserAchievements = () => useAppStore((state) => state.userAchievements);
export const useUserProfile = () => useAppStore((state) => state.userProfile);
export const useUserPreferences = () => useAppStore((state) => state.userPreferences);
export const useUserStats = () => useAppStore((state) => state.userStats);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useCurrentView = () => useAppStore((state) => state.currentView);
export const useFilters = () => useAppStore((state) => state.filters);
export const useSearchQuery = () => useAppStore((state) => state.searchQuery);
export const useUnlockedFishIds = () => useAppStore((state) => state.unlockedFishIds);

// 计算选择器
export const useFilteredFish = () => {
  return useAppStore((state) => {
    const { fish, filters, searchQuery, catches } = state;
    
    let filtered = [...fish];

    // 搜索查询
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(query) ||
        f.scientificName?.toLowerCase().includes(query) ||
        f.family.toLowerCase().includes(query)
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
  });
};

// 统计选择器
export const useAchievementStats = () => {
  return useAppStore((state) => {
    const { achievements, userAchievements } = state;
    
    const totalCount = achievements.length;
    const unlockedCount = userAchievements.filter(ua => ua.tier !== null).length;
    const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    return {
      totalCount,
      unlockedCount,
      progressPercent,
    };
  });
};