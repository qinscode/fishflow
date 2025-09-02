import { DEFAULT_ACHIEVEMENTS, DEFAULT_EQUIPMENT_SETS } from './constants';
import { Achievement, EquipmentSet } from './types';

// 导出成就数据 (保留用于初始化)
export const MOCK_ACHIEVEMENT_DATA: Achievement[] = [...DEFAULT_ACHIEVEMENTS];

// 导出装备数据 (用于初始化)
export const MOCK_EQUIPMENT_DATA: EquipmentSet[] = [...DEFAULT_EQUIPMENT_SETS] as EquipmentSet[];

// 鱼类数据已迁移到 fishDataLoader.ts 中从 JSON 文件加载
// MOCK_FISH_DATA 已删除，请使用 loadFishData() 从 fishDataLoader 导入