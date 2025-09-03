#!/usr/bin/env node

/**
 * 自动生成鱼类图片映射文件
 *
 * 用法:
 * node scripts/generateImageMappings.js
 *
 * 这个脚本会：
 * 1. 扫描 assets/images/fish/ 目录
 * 2. 自动生成 lib/fishImagesMap.ts 文件
 * 3. 支持多种图片格式和命名规则
 */

/* eslint-env node */
/* eslint-disable no-undef */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  // 图片目录
  imageDir: path.join(__dirname, '../assets/images/fish'),
  // 输出文件
  outputFile: path.join(__dirname, '../lib/fishImagesMap.ts'),
  // 支持的图片格式
  supportedExtensions: ['.png', '.jpg', '.jpeg', '.webp'],
  // 图片类型后缀映射
  imageTypeSuffixes: {
    '': 'card', // 默认图片
    _hero: 'hero', // 详情页大图
    _silhouette: 'silhouette', // 剪影图
    _detail: 'detail', // 详细图
  },
};

/**
 * 扫描图片目录
 */
function scanImageDirectory(dirPath) {
  const images = {};

  try {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();

      // 检查是否为支持的图片格式
      if (!CONFIG.supportedExtensions.includes(ext)) {
        return;
      }

      const basename = path.basename(file, ext);
      const { fishId, imageType } = parseFileName(basename);

      if (fishId) {
        if (!images[fishId]) {
          images[fishId] = {};
        }
        images[fishId][imageType] = file;
      }
    });

    return images;
  } catch (error) {
    console.error('Error scanning image directory:', error);
    return {};
  }
}

/**
 * 解析文件名获取鱼类ID和图片类型
 */
function parseFileName(basename) {
  // 支持的命名格式：
  // 1.png -> fishId: '1', imageType: 'card'
  // 1_hero.png -> fishId: '1', imageType: 'hero'
  // fish_123_silhouette.png -> fishId: '123', imageType: 'silhouette'

  let fishId = null;
  let imageType = 'card';

  // 检查是否有类型后缀
  for (const [suffix, type] of Object.entries(CONFIG.imageTypeSuffixes)) {
    if (suffix && basename.endsWith(suffix)) {
      fishId = basename.replace(suffix, '');
      imageType = type;
      break;
    }
  }

  // 如果没有后缀，直接使用整个basename作为fishId
  if (!fishId) {
    fishId = basename;
  }

  // 清理fishId（移除fish_前缀等）
  fishId = fishId.replace(/^fish_/, '');

  // 验证fishId是否有效（数字或字母数字组合）
  if (!/^[a-zA-Z0-9_-]+$/.test(fishId)) {
    console.warn(`Invalid fish ID extracted from filename: ${basename}`);
    return { fishId: null, imageType: 'card' };
  }

  return { fishId, imageType };
}

/**
 * 生成TypeScript映射文件
 */
function generateMappingFile(images, outputPath) {
  const fishIds = Object.keys(images).sort((a, b) => {
    // 数字ID排序
    const aNum = parseInt(a);
    const bNum = parseInt(b);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    // 字符串排序
    return a.localeCompare(b);
  });

  // 生成文件头
  const header = `// 自动生成的鱼类图片映射文件
// 请勿手动编辑此文件，运行 'npm run generate-images' 重新生成
// 生成时间: ${new Date().toISOString()}

import { ImageSourcePropType } from 'react-native';

// 图片类型定义
export type FishImageType = 'card' | 'hero' | 'silhouette' | 'detail';

// 鱼类图片映射接口
export interface FishImageMap {
  [fishId: string]: {
    card?: ImageSourcePropType;
    hero?: ImageSourcePropType;
    silhouette?: ImageSourcePropType;
    detail?: ImageSourcePropType;
  };
}

`;

  // 生成主映射对象
  let mappingContent = 'export const FISH_IMAGES_MAP: FishImageMap = {\n';

  fishIds.forEach(fishId => {
    const fishImages = images[fishId];
    mappingContent += `  '${fishId}': {\n`;

    Object.entries(fishImages).forEach(([imageType, filename]) => {
      mappingContent += `    ${imageType}: require('@/assets/images/fish/${filename}'),\n`;
    });

    mappingContent += '  },\n';
  });

  mappingContent += '};\n\n';

  // 生成兼容性映射（向后兼容）
  let legacyMapping = '// 向后兼容的简单映射（仅card类型）\n';
  legacyMapping +=
    'export const FISH_IMAGES: Record<string, ImageSourcePropType> = {\n';

  fishIds.forEach(fishId => {
    const fishImages = images[fishId];
    if (fishImages.card) {
      legacyMapping += `  '${fishId}': require('@/assets/images/fish/${fishImages.card}'),\n`;
    }
  });

  legacyMapping += '};\n\n';

  // 生成工具函数
  const utilityFunctions = `// 工具函数
export function getFishImage(
  fishId: string, 
  imageType: FishImageType = 'card'
): ImageSourcePropType | null {
  const fishImages = FISH_IMAGES_MAP[fishId];
  if (!fishImages) {
    console.warn(\`No images found for fish ID: \${fishId}\`);
    return null;
  }
  
  const image = fishImages[imageType];
  if (!image) {
    // 尝试fallback到card类型
    const fallback = fishImages.card;
    if (fallback && imageType !== 'card') {
      console.warn(\`Image type '\${imageType}' not found for fish \${fishId}, using card image\`);
      return fallback;
    }
    return null;
  }
  
  return image;
}

export function hasFishImage(
  fishId: string, 
  imageType: FishImageType = 'card'
): boolean {
  const fishImages = FISH_IMAGES_MAP[fishId];
  return !!(fishImages && fishImages[imageType]);
}

export function getAllFishIds(): string[] {
  return Object.keys(FISH_IMAGES_MAP);
}

export function getFishImageTypes(fishId: string): FishImageType[] {
  const fishImages = FISH_IMAGES_MAP[fishId];
  if (!fishImages) return [];
  
  return Object.keys(fishImages) as FishImageType[];
}

// 统计信息
export const FISH_IMAGES_STATS = {
  totalFish: ${fishIds.length},
  totalImages: ${Object.values(images).reduce((sum, fishImages) => sum + Object.keys(fishImages).length, 0)},
  generatedAt: '${new Date().toISOString()}'
};
`;

  // 组合完整内容
  const fullContent =
    header + mappingContent + legacyMapping + utilityFunctions;

  // 写入文件
  try {
    fs.writeFileSync(outputPath, fullContent, 'utf8');
    console.log(`✅ Successfully generated image mapping file: ${outputPath}`);
    console.log(`📊 Statistics:`);
    console.log(`   - Fish count: ${fishIds.length}`);
    console.log(
      `   - Total images: ${Object.values(images).reduce((sum, fishImages) => sum + Object.keys(fishImages).length, 0)}`
    );

    // 显示每种类型的图片数量
    const typeStats = {};
    Object.values(images).forEach(fishImages => {
      Object.keys(fishImages).forEach(type => {
        typeStats[type] = (typeStats[type] || 0) + 1;
      });
    });
    console.log(`   - By type:`, typeStats);
  } catch (error) {
    console.error('❌ Error writing mapping file:', error);
  }
}

/**
 * 验证图片文件
 */
function validateImages(images) {
  const issues = [];

  Object.entries(images).forEach(([fishId, fishImages]) => {
    // 检查是否至少有一张card图片
    if (!fishImages.card) {
      issues.push(`Fish ${fishId} missing card image`);
    }

    // 检查文件是否实际存在
    Object.entries(fishImages).forEach(([type, filename]) => {
      const filePath = path.join(CONFIG.imageDir, filename);
      if (!fs.existsSync(filePath)) {
        issues.push(
          `Image file not found: ${filename} for fish ${fishId} (${type})`
        );
      }
    });
  });

  if (issues.length > 0) {
    console.warn('⚠️  Validation issues found:');
    issues.forEach(issue => console.warn(`   - ${issue}`));
  } else {
    console.log('✅ All images validated successfully');
  }

  return issues.length === 0;
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 Scanning fish images directory...');
  console.log(`📁 Directory: ${CONFIG.imageDir}`);

  // 检查目录是否存在
  if (!fs.existsSync(CONFIG.imageDir)) {
    console.error(`❌ Image directory not found: ${CONFIG.imageDir}`);
    process.exit(1);
  }

  // 扫描图片
  const images = scanImageDirectory(CONFIG.imageDir);

  if (Object.keys(images).length === 0) {
    console.error('❌ No valid fish images found');
    process.exit(1);
  }

  // 验证图片
  validateImages(images);

  // 生成映射文件
  console.log('📝 Generating mapping file...');
  generateMappingFile(images, CONFIG.outputFile);

  console.log('🎉 Image mapping generation completed!');
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  scanImageDirectory,
  generateMappingFile,
  parseFileName,
  validateImages,
};
