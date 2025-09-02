import fishData from '../data/fish_data_completed.json';

import { getFishImage } from './fishImages';
import { Fish, FishRarity } from './types';

// 稀有度映射
const rarityMapping: Record<string, FishRarity> = {
  'common': 'common',
  'rare': 'rare',
  'epic': 'epic',
  'legendary': 'legendary',
  'unknown': 'unknown',
  'uncommon': 'unknown', // 不匹配的稀有度使用 unknown
};

// 转换原始数据为应用所需的 Fish 接口格式
function transformFishData(rawData: any[]): Fish[] {
  return rawData.map((rawFish: any) => {
    // 处理稀有度映射
    const mappedRarity = rarityMapping[rawFish.rarity] || 'unknown';
    
    // 处理图片路径 - 使用图片映射获取静态资源
    const fishId = rawFish.id;
    const fishImage = getFishImage(fishId);
    const images = {
      card: fishImage,
      hero: fishImage,
      silhouette: fishImage,
    };

    // 转换数据结构以匹配 Fish 接口
    const fish: Fish = {
      id: rawFish.id,
      name: rawFish.name,
      scientificName: rawFish.scientificName,
      localNames: rawFish.localNames || [],
      family: rawFish.family,
      rarity: mappedRarity,
      images: images,
      characteristics: {
        minLengthCm: rawFish.characteristics?.minLengthCm || 10,
        maxLengthCm: rawFish.characteristics?.maxLengthCm || 50,
        maxWeightKg: rawFish.characteristics?.maxWeightKg || 5,
        lifespan: rawFish.characteristics?.lifespan,
      },
      habitat: {
        waterTypes: rawFish.habitat?.waterTypes || ['lake'],
        regions: rawFish.habitat?.regions || [],
        seasons: rawFish.habitat?.seasons || [1,2,3,4,5,6,7,8,9,10,11,12],
        depth: rawFish.habitat?.depth,
      },
      regulations: rawFish.regulations || [],
      behavior: {
        feedingHabits: rawFish.behavior?.feedingHabits || ['omnivore'],
        activeTime: rawFish.behavior?.activeTime || 'both',
        difficulty: rawFish.behavior?.difficulty || 3,
      },
    };

    return fish;
  });
}

// 导出加载的鱼类数据
export const FISH_DATA: Fish[] = transformFishData(fishData);

// 导出加载函数供其他地方使用
export function loadFishData(): Fish[] {
  return FISH_DATA;
}

// 根据 ID 获取特定鱼类
export function getFishById(id: string): Fish | undefined {
  return FISH_DATA.find(fish => fish.id === id);
}

// 获取鱼类数量
export function getFishCount(): number {
  return FISH_DATA.length;
}

// 按稀有度分组
export function getFishByRarity(rarity: FishRarity): Fish[] {
  return FISH_DATA.filter(fish => fish.rarity === rarity);
}