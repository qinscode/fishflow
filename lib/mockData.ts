import { Fish, Achievement } from './types';
import { DEFAULT_ACHIEVEMENTS } from './constants';

// 模拟鱼类数据
export const MOCK_FISH_DATA: Fish[] = [
  {
    id: 'carp-common',
    name: '鲤鱼',
    scientificName: 'Cyprinus carpio',
    localNames: ['红鲤鱼', '鲤子', '拐子'],
    family: '鲤科',
    rarity: 'common',
    images: {
      card: 'https://example.com/fish/carp-common.jpg',
      hero: 'https://example.com/fish/carp-common-large.jpg',
      silhouette: 'https://example.com/fish/carp-silhouette.svg',
    },
    characteristics: {
      minLengthCm: 15,
      maxLengthCm: 120,
      maxWeightKg: 40,
      lifespan: 47,
    },
    habitat: {
      waterTypes: ['river', 'lake', 'pond'],
      regions: ['华北', '华东', '华南', '西南'],
      seasons: [3, 4, 5, 6, 7, 8, 9, 10],
    },
    regulations: {
      minSizeCm: 20,
      closedSeasons: [1, 2],
      dailyLimit: 5,
    },
    behavior: {
      feedingHabits: ['杂食性', '底栖觅食', '植物性饵料'],
      activeTime: 'day',
      difficulty: 2,
    },
  },
  {
    id: 'bass-largemouth',
    name: '大口黑鲈',
    scientificName: 'Micropterus salmoides',
    localNames: ['黑鲈', '加州鲈鱼'],
    family: '太阳鱼科',
    rarity: 'rare',
    images: {
      card: 'https://example.com/fish/bass-largemouth.jpg',
      hero: 'https://example.com/fish/bass-largemouth-large.jpg',
    },
    characteristics: {
      minLengthCm: 20,
      maxLengthCm: 75,
      maxWeightKg: 10,
      lifespan: 16,
    },
    habitat: {
      waterTypes: ['lake', 'reservoir'],
      regions: ['华南', '华东'],
      seasons: [4, 5, 6, 7, 8, 9, 10],
    },
    behavior: {
      feedingHabits: ['肉食性', '捕食小鱼', '攻击性强'],
      activeTime: 'both',
      difficulty: 4,
    },
  },
  {
    id: 'trout-rainbow',
    name: '虹鳟',
    scientificName: 'Oncorhynchus mykiss',
    localNames: ['彩虹鳟', '虹鳟鱼'],
    family: '鲑科',
    rarity: 'epic',
    images: {
      card: 'https://example.com/fish/trout-rainbow.jpg',
      hero: 'https://example.com/fish/trout-rainbow-large.jpg',
    },
    characteristics: {
      minLengthCm: 25,
      maxLengthCm: 76,
      maxWeightKg: 9,
      lifespan: 7,
    },
    habitat: {
      waterTypes: ['stream', 'river'],
      regions: ['东北', '西北', '西南'],
      seasons: [3, 4, 5, 9, 10, 11],
    },
    regulations: {
      minSizeCm: 30,
      dailyLimit: 3,
    },
    behavior: {
      feedingHabits: ['肉食性', '捕食昆虫', '小型鱼类'],
      activeTime: 'day',
      difficulty: 5,
    },
  },
  {
    id: 'catfish-giant',
    name: '大鲶鱼',
    scientificName: 'Silurus asotus',
    localNames: ['年鱼', '鲶巴郎'],
    family: '鲶科',
    rarity: 'legendary',
    images: {
      card: 'https://example.com/fish/catfish-giant.jpg',
      hero: 'https://example.com/fish/catfish-giant-large.jpg',
    },
    characteristics: {
      minLengthCm: 30,
      maxLengthCm: 150,
      maxWeightKg: 50,
      lifespan: 60,
    },
    habitat: {
      waterTypes: ['river', 'lake'],
      regions: ['华北', '华东', '华中', '东北'],
      seasons: [5, 6, 7, 8, 9],
    },
    behavior: {
      feedingHabits: ['肉食性', '夜间觅食', '吞噬猎物'],
      activeTime: 'night',
      difficulty: 5,
    },
  },
  {
    id: 'crucian-carp',
    name: '鲫鱼',
    scientificName: 'Carassius auratus',
    localNames: ['鲫瓜子', '月鲫仔', '土鲫'],
    family: '鲤科',
    rarity: 'common',
    images: {
      card: 'https://example.com/fish/crucian-carp.jpg',
      hero: 'https://example.com/fish/crucian-carp-large.jpg',
    },
    characteristics: {
      minLengthCm: 8,
      maxLengthCm: 45,
      maxWeightKg: 3,
      lifespan: 12,
    },
    habitat: {
      waterTypes: ['pond', 'lake', 'river'],
      regions: ['华北', '华东', '华南', '华中', '西南', '东北', '西北'],
      seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    behavior: {
      feedingHabits: ['杂食性', '底栖觅食', '植物碎屑'],
      activeTime: 'day',
      difficulty: 1,
    },
  },
  {
    id: 'mandarin-fish',
    name: '鳜鱼',
    scientificName: 'Siniperca chuatsi',
    localNames: ['桂鱼', '季花鱼', '花鲫鱼'],
    family: '鲈科',
    rarity: 'rare',
    images: {
      card: 'https://example.com/fish/mandarin-fish.jpg',
      hero: 'https://example.com/fish/mandarin-fish-large.jpg',
    },
    characteristics: {
      minLengthCm: 15,
      maxLengthCm: 60,
      maxWeightKg: 8,
      lifespan: 15,
    },
    habitat: {
      waterTypes: ['river', 'lake'],
      regions: ['华东', '华南', '华中'],
      seasons: [4, 5, 6, 7, 8, 9, 10],
    },
    behavior: {
      feedingHabits: ['肉食性', '捕食活鱼', '伏击型'],
      activeTime: 'both',
      difficulty: 4,
    },
  },
  {
    id: 'grass-carp',
    name: '草鱼',
    scientificName: 'Ctenopharyngodon idellus',
    localNames: ['白鲩', '草鲩', '草包'],
    family: '鲤科',
    rarity: 'common',
    images: {
      card: 'https://example.com/fish/grass-carp.jpg',
      hero: 'https://example.com/fish/grass-carp-large.jpg',
    },
    characteristics: {
      minLengthCm: 20,
      maxLengthCm: 140,
      maxWeightKg: 35,
      lifespan: 21,
    },
    habitat: {
      waterTypes: ['river', 'lake', 'reservoir'],
      regions: ['华东', '华南', '华中', '西南'],
      seasons: [4, 5, 6, 7, 8, 9, 10],
    },
    behavior: {
      feedingHabits: ['植食性', '水草为主', '藻类'],
      activeTime: 'day',
      difficulty: 3,
    },
  },
  {
    id: 'silver-carp',
    name: '鲢鱼',
    scientificName: 'Hypophthalmichthys molitrix',
    localNames: ['白鲢', '水鲢', '跳鲢'],
    family: '鲤科',
    rarity: 'common',
    images: {
      card: 'https://example.com/fish/silver-carp.jpg',
      hero: 'https://example.com/fish/silver-carp-large.jpg',
    },
    characteristics: {
      minLengthCm: 25,
      maxLengthCm: 100,
      maxWeightKg: 50,
      lifespan: 20,
    },
    habitat: {
      waterTypes: ['lake', 'reservoir', 'river'],
      regions: ['华东', '华南', '华中', '华北'],
      seasons: [5, 6, 7, 8, 9],
    },
    behavior: {
      feedingHabits: ['滤食性', '浮游植物', '藻类'],
      activeTime: 'day',
      difficulty: 2,
    },
  },
];

// 模拟成就数据（使用常量中的默认成就）
export const MOCK_ACHIEVEMENT_DATA: Achievement[] = [...DEFAULT_ACHIEVEMENTS];

// 生成模拟钓鱼记录的函数
export function generateMockCatchRecords(fishData: Fish[], count: number = 10) {
  const mockCatches = [];
  const userId = 'user-001';
  
  for (let i = 0; i < count; i++) {
    const randomFish = fishData[Math.floor(Math.random() * fishData.length)];
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
    
    const mockCatch = {
      id: `catch-${Date.now()}-${i}`,
      fishId: randomFish.id,
      userId,
      timestamp: randomDate.toISOString(),
      photos: [`photo-${i}.jpg`],
      measurements: {
        lengthCm: Math.round(randomFish.characteristics.minLengthCm + 
          Math.random() * (randomFish.characteristics.maxLengthCm - randomFish.characteristics.minLengthCm)),
        weightKg: Math.round((Math.random() * randomFish.characteristics.maxWeightKg + 0.1) * 10) / 10,
      },
      location: {
        latitude: 39.9042 + (Math.random() - 0.5) * 0.1,
        longitude: 116.4074 + (Math.random() - 0.5) * 0.1,
        accuracy: 10,
        waterBodyName: '示例水域',
        waterType: randomFish.habitat.waterTypes[0],
        privacy: 'fuzzy' as const,
      },
      equipment: {
        rod: '海竿',
        reel: '纺车轮',
        line: '尼龙线',
        hook: '伊势尼',
        bait: '蚯蚓',
      },
      conditions: {
        weather: '晴朗',
        temperature: 20 + Math.random() * 15,
      },
      notes: `第${i + 1}次钓鱼记录`,
      isReleased: Math.random() > 0.7,
      isPersonalBest: i === 0, // 第一条设为个人最佳
      tags: ['周末垂钓'],
      createdAt: randomDate.toISOString(),
      updatedAt: randomDate.toISOString(),
    };
    
    mockCatches.push(mockCatch);
  }
  
  return mockCatches;
}

// 初始化模拟数据的函数
export async function initializeMockData() {
  try {
    const { databaseService } = await import('./database');
    
    // 清空现有数据
    await databaseService.clearAllData();
    
    // 插入鱼类数据
    await databaseService.insertManyFish(MOCK_FISH_DATA);
    
    // 插入成就数据
    for (const achievement of MOCK_ACHIEVEMENT_DATA) {
      await databaseService.insertAchievement(achievement);
    }
    
    console.log('Mock data initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize mock data:', error);
    return false;
  }
}