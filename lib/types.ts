// FishFlow - 核心数据类型定义

// 水域类型
export type WaterType = 'river' | 'lake' | 'reservoir' | 'pond' | 'stream' | 'ocean' | 'estuary';

// 鱼类稀有度
export type FishRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'unknown';

// 鱼类卡片状态
export type FishCardState = 'locked' | 'hint' | 'unlocked' | 'new';

// 澳洲各州类型
export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'NT' | 'ACT';

// 地区法规接口
export interface RegionalRegulations {
  region: string;                  // 地区名称 (如 'NSW', 'VIC' 等)
  minSizeCm?: number;             // 最小尺寸
  maxSizeCm?: number;             // 最大尺寸（某些州有上限）
  closedSeasons?: {               // 禁钓季节
    start: string;                // MM-DD 格式
    end: string;
  }[];
  dailyLimit?: number;            // 日钓获限制
  possessionLimit?: number;       // 持有限制
  slotLimit?: {                   // 尺寸槽限制
    minCm: number;
    maxCm: number;
  };
  specialRules?: string[];        // 特殊规定
  requiresLicense?: boolean;      // 是否需要许可证
  notes?: string;                 // 备注
}

// 鱼类物种数据
export interface Fish {
  id: string; // 唯一标识符
  name: string;                  // 中文名称
  scientificName?: string;       // 学名
  localNames?: string[];         // 地方俗名
  family: string;                // 科属
  rarity: FishRarity;
  images: {
    card: string;                // 卡片图片
    hero?: string;               // 详情页大图
    silhouette?: string;         // 剪影图
  };
  characteristics: {
    minLengthCm: number;         // 最小长度
    maxLengthCm: number;         // 最大长度
    maxWeightKg: number;         // 最大重量
    lifespan?: number;           // 寿命
  };
  habitat: {
    waterTypes: WaterType[];     // 栖息水域类型
    regions: string[];           // 分布地区
    seasons: number[];           // 活跃季节(月份)
    depth?: string;              // 活动深度
  };
  regulations?: RegionalRegulations[]; // 各地区法规数组
  behavior: {
    feedingHabits: string[];     // 食性
    activeTime: 'day' | 'night' | 'both';
    difficulty: 1 | 2 | 3 | 4 | 5; // 钓获难度
  };
}

// 钓鱼记录
export interface CatchRecord {
  id: string;
  fishId: string;                // 关联的鱼类ID
  userId: string;                // 用户ID
  timestamp: string;             // ISO时间戳
  photos: string[];              // 照片路径数组
  measurements: {
    lengthCm?: number;           // 长度
    weightKg?: number;           // 重量
    girthCm?: number;            // 围长
  };
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
    waterBodyName?: string;
    waterType: WaterType;
    privacy: 'exact' | 'fuzzy' | 'hidden';
  };
  equipment: {
    rod?: string;                // 钓竿
    reel?: string;               // 渔轮
    line?: string;               // 钓线
    hook?: string;               // 鱼钩
    bait?: string;               // 饵料
  };
  conditions: {
    weather?: string;            // 天气
    temperature?: number;        // 温度
    windSpeed?: number;          // 风速
    pressure?: number;           // 气压
  };
  notes?: string;                // 备注
  isReleased: boolean;           // 是否放生
  isPersonalBest: boolean;       // 是否个人记录
  tags: string[];                // 标签
  createdAt: string;
  updatedAt: string;
}

// 成就类别
export type AchievementCategory = 'species' | 'quantity' | 'size' | 'streak' | 'location' | 'special';

// 成就等级
export type AchievementTier = 'bronze' | 'silver' | 'gold';

// 成就数据
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tiers: {
    bronze: { requirement: number; reward?: string };
    silver: { requirement: number; reward?: string };
    gold: { requirement: number; reward?: string };
  };
  isHidden: boolean;             // 隐藏成就
}

// 用户成就进度
export interface UserAchievement {
  achievementId: string;
  progress: number;
  tier: AchievementTier | null;
  unlockedAt?: string;
  isViewed: boolean;
}

// 用户资料
export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  joinDate: string;
  location?: string;
  bio?: string;
}

// 用户偏好设置
export interface UserPreferences {
  units: {
    length: 'cm' | 'inch';
    weight: 'kg' | 'lb';
    temperature: 'celsius' | 'fahrenheit';
  };
  privacy: {
    defaultLocationPrivacy: 'exact' | 'fuzzy' | 'hidden';
    shareAchievements: boolean;
    shareStats: boolean;
  };
  notifications: {
    achievements: boolean;
    reminders: boolean;
    weather: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
}

// 用户统计
export interface UserStats {
  totalCatches: number;
  uniqueSpecies: number;
  totalWeight: number;
  totalLength: number;
  longestStreak: number;
  currentStreak: number;
  favoriteWaterType: WaterType;
  mostActiveMonth: number;
  personalBests: PersonalBests;
}

// 个人最佳记录
export interface PersonalBests {
  largestByWeight: {
    fishId: string;
    catchId: string;
    weight: number;
  };
  largestByLength: {
    fishId: string;
    catchId: string;
    length: number;
  };
  rarest: {
    fishId: string;
    catchId: string;
    rarity: FishRarity;
  };
}

// 图鉴筛选器
export interface FishdexFilters {
  rarity?: FishRarity[];
  waterTypes?: WaterType[];
  regions?: string[];
  seasons?: number[];
  unlockedOnly?: boolean;
  searchQuery?: string;
}

// 热力图数据
export interface HeatmapData {
  date: string; // YYYY-MM-DD
  count: number;
  catches?: CatchRecord[];
}

// 表单数据类型
export interface CatchFormData {
  photos: string[];
  fishId?: string;
  customFishName?: string;
  measurements: {
    lengthCm?: number;
    weightKg?: number;
    girthCm?: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    waterBodyName?: string;
    waterType: WaterType;
    privacy: 'exact' | 'fuzzy' | 'hidden';
  };
  equipment: {
    rod?: string;
    reel?: string;
    line?: string;
    hook?: string;
    bait?: string;
  };
  conditions: {
    weather?: string;
    temperature?: number;
    windSpeed?: number;
    pressure?: number;
  };
  notes?: string;
  isReleased: boolean;
  tags: string[];
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 设备信息
export interface DeviceInfo {
  width: number;
  height: number;
  isTablet: boolean;
  isLandscape: boolean;
}

// 位置信息
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  timestamp: number;
}

// 天气信息
export interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  conditions: string;
  icon: string;
}

// 导出的工具类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];