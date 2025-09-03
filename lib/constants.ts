import {
  WaterType,
  FishRarity,
  AchievementCategory,
  EdibilityRating,
} from './types';

// 应用配置
export const APP_CONFIG = {
  name: 'FishFlow',
  version: '1.0.0',
  defaultLanguage: 'zh-CN',
  database: {
    name: 'fishflow.db',
    version: 1,
  },
  cache: {
    imageCacheDuration: 7 * 24 * 60 * 60 * 1000, // 7天
    dataCacheDuration: 24 * 60 * 60 * 1000, // 24小时
  },
  limits: {
    maxPhotosPerCatch: 5,
    maxCatchesPerDay: 50,
    maxNotesLength: 500,
  },
} as const;

// 稀有度配色方案
export const RARITY_COLORS: Record<FishRarity, string> = {
  common: '#6B7280', // 灰色
  unique: '#10B981', // 绿色
  rare: '#3B82F6', // 蓝色
  epic: '#8B5CF6', // 紫色
  legendary: '#F59E0B', // 金色
  unknown: '#9CA3AF', // 更淡的灰色
};

// 食用评级配色方案
export const EDIBILITY_COLORS: Record<EdibilityRating | 'default', string> = {
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

// 稀有度中文名称
export const RARITY_NAMES: Record<FishRarity, string> = {
  common: '常见',
  unique: '独特',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
  unknown: '未知',
};

// 水域类型配置
export const WATER_TYPES: Record<
  WaterType,
  { name: string; icon: string; color: string }
> = {
  river: { name: '河流', icon: 'water', color: '#2563EB' },
  lake: { name: '湖泊', icon: 'location', color: '#1D4ED8' },
  reservoir: { name: '水库', icon: 'location.fill', color: '#1E40AF' },
  pond: { name: '池塘', icon: 'drop', color: '#1E3A8A' },
  stream: { name: '溪流', icon: 'water', color: '#3730A3' },
  ocean: { name: '海洋', icon: 'water.waves', color: '#312E81' },
  estuary: { name: '河口', icon: 'water.waves', color: '#4C1D95' },
};

// 水域类型名称映射（简化版本）
export const WATER_TYPE_NAMES: Record<WaterType, string> = {
  river: '河流',
  lake: '湖泊',
  reservoir: '水库',
  pond: '池塘',
  stream: '溪流',
  ocean: '海洋',
  estuary: '河口',
} as const;

// 成就类别配置
export const ACHIEVEMENT_CATEGORIES: Record<
  AchievementCategory,
  { name: string; icon: string; color: string }
> = {
  species: { name: '物种收集', icon: 'fish.fill', color: '#10B981' },
  quantity: { name: '数量统计', icon: 'number', color: '#3B82F6' },
  size: { name: '尺寸记录', icon: 'ruler', color: '#F59E0B' },
  streak: { name: '连续记录', icon: 'flame.fill', color: '#EF4444' },
  location: { name: '地点探索', icon: 'location.fill', color: '#8B5CF6' },
  special: { name: '特殊成就', icon: 'star.fill', color: '#F97316' },
};

// 成就等级配色
export const ACHIEVEMENT_TIER_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
} as const;

// 月份名称
export const MONTH_NAMES = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
];

// 季节配置
export const SEASONS = {
  spring: { months: [3, 4, 5], name: '春季', color: '#10B981' },
  summer: { months: [6, 7, 8], name: '夏季', color: '#F59E0B' },
  autumn: { months: [9, 10, 11], name: '秋季', color: '#EF4444' },
  winter: { months: [12, 1, 2], name: '冬季', color: '#3B82F6' },
} as const;

// 天气条件
export const WEATHER_CONDITIONS = [
  { id: 'sunny', name: '晴朗', icon: 'sun.max.fill' },
  { id: 'cloudy', name: '多云', icon: 'cloud.fill' },
  { id: 'overcast', name: '阴天', icon: 'cloud.drizzle.fill' },
  { id: 'rainy', name: '下雨', icon: 'cloud.rain.fill' },
  { id: 'stormy', name: '暴雨', icon: 'cloud.bolt.rain.fill' },
  { id: 'foggy', name: '有雾', icon: 'cloud.fog.fill' },
  { id: 'windy', name: '大风', icon: 'wind' },
] as const;

// 钓具类型
export const EQUIPMENT_TYPES = {
  rods: [
    '手竿',
    '海竿',
    '路亚竿',
    '飞钓竿',
    '矶竿',
    '筏竿',
    '前打竿',
    '鲫鱼竿',
    '鲤鱼竿',
  ],
  reels: ['纺车轮', '水滴轮', '鼓式轮', '飞钓轮', '前打轮', '筏钓轮', '海钓轮'],
  lines: [
    '尼龙线',
    '碳素线',
    'PE编织线',
    '大力马线',
    '钢丝线',
    '前导线',
    '子线',
  ],
  hooks: [
    '伊势尼',
    '新关东',
    '袖钩',
    '朝天钩',
    '三角钩',
    '倒刺钩',
    '无倒刺钩',
    '圆形钩',
  ],
  baits: [
    '蚯蚓',
    '红虫',
    '玉米',
    '麦子',
    '蚕豆',
    '面包虫',
    '小虾',
    '泥鳅',
    '商品饵',
    '路亚',
    '铅头钩',
    '软虫',
    '硬饵',
  ],
} as const;

// 钓鱼难度等级名称 - 使用翻译键替代硬编码文本
export const DIFFICULTY_NAMES: Record<number, string> = {
  1: 'difficulty.1',
  2: 'difficulty.2',
  3: 'difficulty.3',
  4: 'difficulty.4',
  5: 'difficulty.5',
} as const;

// 默认成就定义
export const DEFAULT_ACHIEVEMENTS = [
  {
    id: 'first-catch',
    name: '初次垂钓',
    description: '记录你的第一次钓鱼',
    category: 'special' as AchievementCategory,
    icon: 'fish.fill',
    tiers: {
      bronze: { requirement: 1, reward: '解锁图鉴功能' },
      silver: { requirement: 1, reward: undefined },
      gold: { requirement: 1, reward: undefined },
    },
    isHidden: false,
  },
  {
    id: 'species-collector',
    name: '物种收集家',
    description: '解锁不同种类的鱼',
    category: 'species' as AchievementCategory,
    icon: 'fish.fill',
    tiers: {
      bronze: { requirement: 5, reward: '铜牌收集家' },
      silver: { requirement: 15, reward: '银牌收集家' },
      gold: { requirement: 30, reward: '金牌收集家' },
    },
    isHidden: false,
  },
  {
    id: 'quantity-master',
    name: '钓鱼达人',
    description: '记录大量钓鱼次数',
    category: 'quantity' as AchievementCategory,
    icon: 'number',
    tiers: {
      bronze: { requirement: 10, reward: '新手钓手' },
      silver: { requirement: 50, reward: '资深钓手' },
      gold: { requirement: 100, reward: '钓鱼大师' },
    },
    isHidden: false,
  },
  {
    id: 'size-hunter',
    name: '大鱼猎手',
    description: '钓到指定重量的大鱼',
    category: 'size' as AchievementCategory,
    icon: 'ruler',
    tiers: {
      bronze: { requirement: 1, reward: '第一条大鱼' }, // 1kg
      silver: { requirement: 3, reward: '大鱼克星' }, // 3kg
      gold: { requirement: 5, reward: '巨鱼传说' }, // 5kg
    },
    isHidden: false,
  },
  {
    id: 'streak-keeper',
    name: '连钓记录',
    description: '保持连续钓鱼的天数',
    category: 'streak' as AchievementCategory,
    icon: 'flame.fill',
    tiers: {
      bronze: { requirement: 3, reward: '三日连击' },
      silver: { requirement: 7, reward: '一周坚持' },
      gold: { requirement: 30, reward: '月度钓王' },
    },
    isHidden: false,
  },
  {
    id: 'explorer',
    name: '水域探索者',
    description: '在不同类型的水域钓鱼',
    category: 'location' as AchievementCategory,
    icon: 'location.fill',
    tiers: {
      bronze: { requirement: 2, reward: '初级探索' },
      silver: { requirement: 4, reward: '高级探索' },
      gold: { requirement: 6, reward: '探索大师' },
    },
    isHidden: false,
  },
  // 新增有趣成就
  {
    id: 'air-force',
    name: '空军部队',
    description: '连续出钓但空手而归的次数',
    category: 'special' as AchievementCategory,
    icon: 'wind',
    tiers: {
      bronze: { requirement: 3, reward: '初级空军' },
      silver: { requirement: 7, reward: '资深空军' },
      gold: { requirement: 15, reward: '空军司令' },
    },
    isHidden: false,
  },
  {
    id: 'early-bird',
    name: '早起的鸟儿',
    description: '在早上6点前开始钓鱼',
    category: 'special' as AchievementCategory,
    icon: 'sun.min.fill',
    tiers: {
      bronze: { requirement: 5, reward: '晨间钓手' },
      silver: { requirement: 15, reward: '黎明战士' },
      gold: { requirement: 30, reward: '日出之子' },
    },
    isHidden: false,
  },
  {
    id: 'night-owl',
    name: '夜猫子',
    description: '在晚上10点后还在钓鱼',
    category: 'special' as AchievementCategory,
    icon: 'moon.stars.fill',
    tiers: {
      bronze: { requirement: 5, reward: '夜钓新手' },
      silver: { requirement: 15, reward: '夜行者' },
      gold: { requirement: 30, reward: '月光钓神' },
    },
    isHidden: false,
  },
  {
    id: 'weather-warrior',
    name: '风雨无阻',
    description: '在恶劣天气下钓鱼',
    category: 'special' as AchievementCategory,
    icon: 'cloud.bolt.rain.fill',
    tiers: {
      bronze: { requirement: 3, reward: '勇敢钓手' },
      silver: { requirement: 10, reward: '铁血战士' },
      gold: { requirement: 20, reward: '风雨之王' },
    },
    isHidden: false,
  },
  {
    id: 'small-fish-specialist',
    name: '小鱼专家',
    description: '专门钓小于10cm的鱼',
    category: 'special' as AchievementCategory,
    icon: 'fish',
    tiers: {
      bronze: { requirement: 10, reward: '小鱼克星' },
      silver: { requirement: 25, reward: '迷你大师' },
      gold: { requirement: 50, reward: '袖珍之王' },
    },
    isHidden: false,
  },
  {
    id: 'catch-and-release',
    name: '保护主义者',
    description: '放生鱼类的数量',
    category: 'special' as AchievementCategory,
    icon: 'heart.fill',
    tiers: {
      bronze: { requirement: 10, reward: '爱心钓手' },
      silver: { requirement: 30, reward: '环保卫士' },
      gold: { requirement: 100, reward: '鱼类守护神' },
    },
    isHidden: false,
  },
  {
    id: 'lucky-fisherman',
    name: '欧皇本皇',
    description: '钓到传说级稀有鱼类',
    category: 'species' as AchievementCategory,
    icon: 'sparkles',
    tiers: {
      bronze: { requirement: 1, reward: '初尝甜头' },
      silver: { requirement: 3, reward: '运气爆棚' },
      gold: { requirement: 5, reward: '真正欧皇' },
    },
    isHidden: false,
  },
  {
    id: 'multi-species',
    name: '一网打尽',
    description: '同一天钓到不同种类的鱼',
    category: 'species' as AchievementCategory,
    icon: 'arrow.3.trianglepath',
    tiers: {
      bronze: { requirement: 3, reward: '多样猎手' },
      silver: { requirement: 5, reward: '全能钓手' },
      gold: { requirement: 8, reward: '物种收割机' },
    },
    isHidden: false,
  },
  {
    id: 'equipment-hoarder',
    name: '装备党',
    description: '记录时使用不同种类的装备',
    category: 'special' as AchievementCategory,
    icon: 'wrench.and.screwdriver.fill',
    tiers: {
      bronze: { requirement: 5, reward: '装备爱好者' },
      silver: { requirement: 15, reward: '装备收藏家' },
      gold: { requirement: 30, reward: '装备狂魔' },
    },
    isHidden: false,
  },
  {
    id: 'photo-enthusiast',
    name: '摄影达人',
    description: '为钓鱼记录拍摄大量照片',
    category: 'special' as AchievementCategory,
    icon: 'camera.fill',
    tiers: {
      bronze: { requirement: 20, reward: '摄影新手' },
      silver: { requirement: 50, reward: '镜头大师' },
      gold: { requirement: 100, reward: '钓鱼摄影师' },
    },
    isHidden: false,
  },
  {
    id: 'season-master',
    name: '四季钓翁',
    description: '在一年四季都有钓鱼记录',
    category: 'special' as AchievementCategory,
    icon: 'calendar',
    tiers: {
      bronze: { requirement: 2, reward: '跨季钓手' },
      silver: { requirement: 3, reward: '三季勇士' },
      gold: { requirement: 4, reward: '全年无休' },
    },
    isHidden: false,
  },
  {
    id: 'persistent-angler',
    name: '坚持不懈',
    description: '单次钓鱼时长超过指定小时',
    category: 'special' as AchievementCategory,
    icon: 'timer',
    tiers: {
      bronze: { requirement: 4, reward: '耐心钓手' }, // 4小时
      silver: { requirement: 8, reward: '持久战士' }, // 8小时
      gold: { requirement: 12, reward: '马拉松钓神' }, // 12小时
    },
    isHidden: false,
  },
] as const;

// 默认装备组合（空数组，用户自行创建）
export const DEFAULT_EQUIPMENT_SETS = [] as const;

// 图标映射
export const ICON_MAPPING = {
  // 鱼类相关
  fish: 'fish.fill',
  fishOutline: 'fish',

  // 导航
  home: 'house.fill',
  fishdex: 'book.fill',
  log: 'plus.circle.fill',
  achievements: 'trophy.fill',
  stats: 'chart.bar.fill',

  // 功能
  camera: 'camera.fill',
  location: 'location.fill',
  search: 'magnifyingglass',
  filter: 'line.3.horizontal.decrease',
  sort: 'arrow.up.arrow.down',

  // 状态
  locked: 'lock.fill',
  unlocked: 'lock.open.fill',
  new: 'sparkles',
  star: 'star.fill',
  heart: 'heart.fill',

  // 天气
  sun: 'sun.max.fill',
  cloud: 'cloud.fill',
  rain: 'cloud.rain.fill',
  wind: 'wind',

  // 工具
  ruler: 'ruler',
  scale: 'scalemass.fill',
  timer: 'timer',
  calendar: 'calendar',

  // 设置
  settings: 'gearshape.fill',
  profile: 'person.fill',
  privacy: 'eye.slash.fill',
  export: 'square.and.arrow.up',
} as const;

// 响应式断点
export const BREAKPOINTS = {
  sm: 375, // 小屏手机
  md: 414, // 大屏手机
  lg: 768, // 平板竖屏
  xl: 1024, // 平板横屏
} as const;

// 动画时长
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  unlock: 1200,
} as const;

// 触觉反馈类型
export const HAPTIC_TYPES = {
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'success',
  warning: 'warning',
  error: 'error',
} as const;
