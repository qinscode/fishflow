import { WaterType, FishRarity, AchievementCategory } from './types';

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
    dataCacheDuration: 24 * 60 * 60 * 1000,      // 24小时
  },
  limits: {
    maxPhotosPerCatch: 5,
    maxCatchesPerDay: 50,
    maxNotesLength: 500,
  },
} as const;

// 稀有度配色方案
export const RARITY_COLORS: Record<FishRarity, string> = {
  common: '#6B7280',    // 灰色
  rare: '#3B82F6',      // 蓝色  
  epic: '#8B5CF6',      // 紫色
  legendary: '#F59E0B', // 金色
  unknown: '#9CA3AF',   // 更淡的灰色
};

// 稀有度中文名称
export const RARITY_NAMES: Record<FishRarity, string> = {
  common: '常见',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
  unknown: '未知',
};

// 水域类型配置
export const WATER_TYPES: Record<WaterType, { name: string; icon: string; color: string }> = {
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
export const ACHIEVEMENT_CATEGORIES: Record<AchievementCategory, { name: string; icon: string; color: string }> = {
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
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
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
    '手竿', '海竿', '路亚竿', '飞钓竿', '矶竿',
    '筏竿', '前打竿', '鲫鱼竿', '鲤鱼竿'
  ],
  reels: [
    '纺车轮', '水滴轮', '鼓式轮', '飞钓轮',
    '前打轮', '筏钓轮', '海钓轮'
  ],
  lines: [
    '尼龙线', '碳素线', 'PE编织线', '大力马线',
    '钢丝线', '前导线', '子线'
  ],
  hooks: [
    '伊势尼', '新关东', '袖钩', '朝天钩',
    '三角钩', '倒刺钩', '无倒刺钩', '圆形钩'
  ],
  baits: [
    '蚯蚓', '红虫', '玉米', '麦子', '蚕豆',
    '面包虫', '小虾', '泥鳅', '商品饵',
    '路亚', '铅头钩', '软虫', '硬饵'
  ],
} as const;

// 钓鱼难度等级名称
export const DIFFICULTY_NAMES: Record<number, string> = {
  1: '简单',
  2: '容易', 
  3: '普通',
  4: '困难',
  5: '专家',
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
      silver: { requirement: 3, reward: '大鱼克星' },   // 3kg
      gold: { requirement: 5, reward: '巨鱼传说' },     // 5kg
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
] as const;

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
  sm: 375,  // 小屏手机
  md: 414,  // 大屏手机
  lg: 768,  // 平板竖屏
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