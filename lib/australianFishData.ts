import { Fish, RegionalRegulations } from './types';

// 澳洲鱼类数据示例 - 展示多州法规差异
export const AUSTRALIAN_FISH_DATA: Fish[] = [
  {
    id: 'snapper-pink',
    name: 'Pink Snapper',
    scientificName: 'Chrysophrys auratus',
    localNames: ['Snapper', 'Pinkies', 'Squire'],
    family: 'Sparidae',
    rarity: 'common',
    images: {
      card: 'https://example.com/fish/pink-snapper.jpg',
      hero: 'https://example.com/fish/pink-snapper-large.jpg',
    },
    characteristics: {
      minLengthCm: 15,
      maxLengthCm: 130,
      maxWeightKg: 20,
      lifespan: 40,
    },
    habitat: {
      waterTypes: ['ocean'],
      regions: ['NSW', 'VIC', 'SA', 'WA'],
      seasons: [9, 10, 11, 12, 1, 2, 3, 4], // Sept-April peak
    },
    // 各州不同的法规要求
    regulations: [
      {
        region: 'NSW',
        minSizeCm: 30,
        dailyLimit: 10,
        possessionLimit: 20,
        requiresLicense: true,
        specialRules: [
          'Closed waters in Port Hacking',
          'Spearfishing permitted with restrictions'
        ],
        notes: 'Bag limit applies to all snapper species combined'
      },
      {
        region: 'VIC',
        minSizeCm: 28,
        dailyLimit: 5,
        possessionLimit: 10,
        closedSeasons: [
          { start: '10-01', end: '11-30' } // October-November closure
        ],
        requiresLicense: true,
        specialRules: [
          'Closed to fishing in some Marine National Parks',
          'Different limits in inland waters'
        ]
      },
      {
        region: 'SA',
        minSizeCm: 38,
        maxSizeCm: 70, // 上限保护大鱼繁殖
        dailyLimit: 2,
        possessionLimit: 4,
        requiresLicense: true,
        specialRules: [
          'Larger minimum size to protect breeding stock',
          'Maximum size limit to protect large breeders'
        ],
        notes: 'Strictest regulations due to stock concerns'
      },
      {
        region: 'WA',
        minSizeCm: 41,
        dailyLimit: 4,
        possessionLimit: 8,
        closedSeasons: [
          { start: '10-15', end: '12-31' } // Mid Oct-Dec closure
        ],
        requiresLicense: true,
        specialRules: [
          'Demersal scalefish suite rules apply',
          'Different limits for recreational vs charter boats'
        ]
      }
    ],
    behavior: {
      feedingHabits: ['Carnivorous', 'Crustaceans', 'Small fish', 'Mollusks'],
      activeTime: 'day',
      difficulty: 3,
    },
  },
  
  {
    id: 'flathead-dusky',
    name: 'Dusky Flathead',
    scientificName: 'Platycephalus fuscus',
    localNames: ['Flathead', 'Lizard'],
    family: 'Platycephalidae',
    rarity: 'common',
    images: {
      card: 'https://example.com/fish/dusky-flathead.jpg',
      hero: 'https://example.com/fish/dusky-flathead-large.jpg',
    },
    characteristics: {
      minLengthCm: 20,
      maxLengthCm: 120,
      maxWeightKg: 15,
      lifespan: 25,
    },
    habitat: {
      waterTypes: ['ocean', 'estuary'],
      regions: ['NSW', 'QLD', 'VIC'],
      seasons: [1, 2, 3, 4, 10, 11, 12], // Summer peak
    },
    regulations: [
      {
        region: 'NSW',
        minSizeCm: 33,
        maxSizeCm: 70,
        dailyLimit: 10,
        possessionLimit: 20,
        requiresLicense: true,
        specialRules: [
          'Maximum size limit protects large breeding females',
          'Closed to commercial netting in some areas'
        ]
      },
      {
        region: 'QLD',
        minSizeCm: 40,
        maxSizeCm: 75,
        dailyLimit: 5,
        possessionLimit: 10,
        requiresLicense: true,
        slotLimit: { minCm: 40, maxCm: 75 },
        notes: 'Slot limit strictly enforced'
      },
      {
        region: 'VIC',
        minSizeCm: 30,
        dailyLimit: 10,
        possessionLimit: 20,
        closedSeasons: [
          { start: '09-01', end: '11-30' } // Spring closure for spawning
        ],
        requiresLicense: true,
        specialRules: [
          'Closed season during spawning period',
          'Different limits in Port Phillip Bay'
        ]
      }
    ],
    behavior: {
      feedingHabits: ['Ambush predator', 'Small fish', 'Prawns', 'Crabs'],
      activeTime: 'both',
      difficulty: 2,
    },
  },

  {
    id: 'barramundi',
    name: 'Barramundi',
    scientificName: 'Lates calcarifer',
    localNames: ['Barra', 'Giant Perch', 'Palmer'],
    family: 'Latidae',
    rarity: 'rare',
    images: {
      card: 'https://example.com/fish/barramundi.jpg',
      hero: 'https://example.com/fish/barramundi-large.jpg',
    },
    characteristics: {
      minLengthCm: 30,
      maxLengthCm: 200,
      maxWeightKg: 60,
      lifespan: 30,
    },
    habitat: {
      waterTypes: ['ocean', 'estuary', 'river'],
      regions: ['QLD', 'NT', 'WA'],
      seasons: [10, 11, 12, 1, 2, 3], // Wet season peak
    },
    regulations: [
      {
        region: 'QLD',
        minSizeCm: 58,
        maxSizeCm: 120,
        dailyLimit: 5,
        possessionLimit: 10,
        closedSeasons: [
          { start: '11-01', end: '02-01' } // Spawning closure
        ],
        requiresLicense: true,
        specialRules: [
          'Closed season in all Queensland waters during spawning',
          'Different limits for impoundments vs coastal waters',
          'Catch and release encouraged outside slot'
        ],
        notes: 'Icon species with strict management'
      },
      {
        region: 'NT',
        minSizeCm: 55,
        maxSizeCm: 120,
        dailyLimit: 5,
        possessionLimit: 10,
        closedSeasons: [
          { start: '10-01', end: '01-31' } // Extended closure
        ],
        requiresLicense: true,
        specialRules: [
          'Longer closed season than QLD',
          'Special permits required for guided fishing',
          'Indigenous fishing rights apply'
        ]
      },
      {
        region: 'WA',
        minSizeCm: 60,
        maxSizeCm: 120,
        dailyLimit: 2,
        possessionLimit: 4,
        closedSeasons: [
          { start: '10-01', end: '01-31' }
        ],
        requiresLicense: true,
        specialRules: [
          'Lower bag limit than eastern states',
          'Kimberley region has additional restrictions',
          'Some areas permanently closed'
        ],
        notes: 'Most restrictive limits due to smaller population'
      }
    ],
    behavior: {
      feedingHabits: ['Predatory', 'Fish', 'Crustaceans', 'Surface feeding'],
      activeTime: 'both',
      difficulty: 5,
    },
  }
];

// 工具函数：获取特定地区的法规
export function getRegionRegulations(fish: Fish, region: string): RegionalRegulations | null {
  if (!fish.regulations) {return null;}
  return fish.regulations.find(reg => reg.region === region) || null;
}

// 工具函数：检查当前是否为禁钓期
export function isClosedSeason(fish: Fish, region: string, date = new Date()): boolean {
  const regulations = getRegionRegulations(fish, region);
  if (!regulations?.closedSeasons) {return false;}

  const currentDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
  return regulations.closedSeasons.some(season => {
    const start = season.start;
    const end = season.end;
    
    // 处理跨年的情况（如 10-01 到 02-28）
    if (start > end) {
      return currentDate >= start || currentDate <= end;
    }
    return currentDate >= start && currentDate <= end;
  });
}

// 工具函数：验证鱼的尺寸是否符合法规
export function validateFishSize(fish: Fish, region: string, sizeCm: number): {
  isLegal: boolean;
  reason?: string;
} {
  const regulations = getRegionRegulations(fish, region);
  if (!regulations) {return { isLegal: true };}

  // 检查最小尺寸
  if (regulations.minSizeCm && sizeCm < regulations.minSizeCm) {
    return {
      isLegal: false,
      reason: `Under minimum size (${regulations.minSizeCm}cm required)`
    };
  }

  // 检查最大尺寸
  if (regulations.maxSizeCm && sizeCm > regulations.maxSizeCm) {
    return {
      isLegal: false,
      reason: `Over maximum size (${regulations.maxSizeCm}cm limit)`
    };
  }

  // 检查尺寸槽限制
  if (regulations.slotLimit) {
    const { minCm, maxCm } = regulations.slotLimit;
    if (sizeCm < minCm || sizeCm > maxCm) {
      return {
        isLegal: false,
        reason: `Outside slot limit (${minCm}cm - ${maxCm}cm)`
      };
    }
  }

  return { isLegal: true };
}