import { DEFAULT_ACHIEVEMENTS } from './constants';
import { Achievement } from './types';

// 导出成就数据 (保留用于初始化)
export const MOCK_ACHIEVEMENT_DATA: Achievement[] = [...DEFAULT_ACHIEVEMENTS];

// 鱼类数据已迁移到 fishDataLoader.ts 中从 JSON 文件加载
// MOCK_FISH_DATA 已删除，请使用 loadFishData() 从 fishDataLoader 导入