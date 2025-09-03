// 鱼类图片资源映射 - 重新导出自动生成的映射
// 为了向后兼容，保留此文件并重新导出自动生成的映射

import {
  FISH_IMAGES,
  getFishImage as getGeneratedFishImage,
  hasFishImage as hasGeneratedFishImage,
} from './fishImagesMap';

// 向后兼容的导出
export const fishImages = FISH_IMAGES;

// 获取鱼类图片资源
export function getFishImage(fishId: string): any {
  return getGeneratedFishImage(fishId, 'card');
}

// 检查鱼类图片是否存在
export function hasFishImage(fishId: string): boolean {
  return hasGeneratedFishImage(fishId, 'card');
}
