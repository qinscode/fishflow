import { Platform } from 'react-native';

import { useAppStore } from './store';
import type { 
  CatchRecord, 
  EquipmentSet, 
  EquipmentItem, 
  EquipmentStats,
  UserProfile,
  UserPreferences,
  UserAchievement
} from './types';

interface ExportData {
  version: string;
  exportDate: string;
  data: {
    catches: CatchRecord[];
    equipmentSets: EquipmentSet[];
    equipmentItems: EquipmentItem[];
    equipmentStats: EquipmentStats[];
    userProfile: UserProfile | null;
    userPreferences: UserPreferences;
    userAchievements: UserAchievement[];
  };
}

class DataExportImportService {
  private readonly EXPORT_VERSION = '1.0.0';
  private readonly FILE_NAME_PREFIX = 'fishflow_backup_';

  /**
   * Export all user data to JSON format
   */
  async exportData(): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const store = useAppStore.getState();
      
      const exportData: ExportData = {
        version: this.EXPORT_VERSION,
        exportDate: new Date().toISOString(),
        data: {
          catches: store.catches,
          equipmentSets: store.equipmentSets,
          equipmentItems: store.equipmentItems,
          equipmentStats: store.equipmentStats,
          userProfile: store.userProfile,
          userPreferences: store.userPreferences,
          userAchievements: store.userAchievements,
        },
      };

      const jsonData = JSON.stringify(exportData, null, 2);
      
      return { success: true, data: jsonData };
    } catch (error) {
      console.error('Export failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Export failed' 
      };
    }
  }

  /**
   * Import user data from JSON string
   */
  async importData(jsonData: string): Promise<{ success: boolean; importedCount?: number; error?: string }> {
    try {
      return await this.processImportData(jsonData);
    } catch (error) {
      console.error('Import failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Import failed' 
      };
    }
  }

  /**
   * Process and validate imported data
   */
  private async processImportData(jsonData: string): Promise<{ success: boolean; importedCount?: number; error?: string }> {
    try {
      const importData: ExportData = JSON.parse(jsonData);
      
      // Validate data structure
      if (!importData.version || !importData.data) {
        throw new Error('Invalid backup file format');
      }

      // Version compatibility check
      if (!this.isVersionCompatible(importData.version)) {
        throw new Error(`Incompatible backup version: ${importData.version}`);
      }

      // Get store actions
      const store = useAppStore.getState();
      let importedCount = 0;

      // Import data with validation
      if (importData.data.catches && Array.isArray(importData.data.catches)) {
        // Merge catches (avoid duplicates by ID)
        const existingCatchIds = new Set(store.catches.map(c => c.id));
        const newCatches = importData.data.catches.filter(c => !existingCatchIds.has(c.id));
        
        if (newCatches.length > 0) {
          store.setCatches([...store.catches, ...newCatches]);
          importedCount += newCatches.length;
        }
      }

      if (importData.data.equipmentSets && Array.isArray(importData.data.equipmentSets)) {
        // Merge equipment sets
        const existingSetIds = new Set(store.equipmentSets.map(es => es.id));
        const newSets = importData.data.equipmentSets.filter(es => !existingSetIds.has(es.id));
        
        if (newSets.length > 0) {
          store.setEquipmentSets([...store.equipmentSets, ...newSets]);
          importedCount += newSets.length;
        }
      }

      if (importData.data.userPreferences) {
        // Strip deprecated fields
        const { fishingStartDate: _deprecated, ...prefs } = importData.data
          .userPreferences as any;
        // Update preferences (merge with existing)
        store.updateUserPreferences(prefs);
        importedCount += 1;
      }

      if (importData.data.userProfile) {
        // Update profile
        store.updateUserProfile(importData.data.userProfile);
        importedCount += 1;
      }

      if (importData.data.userAchievements && Array.isArray(importData.data.userAchievements)) {
        // Merge achievements
        const existingAchievementIds = new Set(store.userAchievements.map(ua => ua.achievementId));
        const newAchievements = importData.data.userAchievements.filter(ua => !existingAchievementIds.has(ua.achievementId));
        
        if (newAchievements.length > 0) {
          store.setUserAchievements([...store.userAchievements, ...newAchievements]);
          importedCount += newAchievements.length;
        }
      }

      return { success: true, importedCount };
    } catch (error) {
      console.error('Data processing failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Data processing failed' 
      };
    }
  }

  /**
   * Check if backup version is compatible with current app version
   */
  private isVersionCompatible(backupVersion: string): boolean {
    // Simple version compatibility check
    const supportedVersions = ['1.0.0'];
    return supportedVersions.includes(backupVersion);
  }

  /**
   * Get export statistics
   */
  getExportStats(): { 
    catches: number; 
    equipmentSets: number; 
    achievements: number; 
    hasProfile: boolean 
  } {
    const store = useAppStore.getState();
    
    return {
      catches: store.catches.length,
      equipmentSets: store.equipmentSets.length,
      achievements: store.userAchievements.length,
      hasProfile: !!store.userProfile,
    };
  }

  /**
   * Clear all user data (for factory reset)
   */
  async clearAllData(): Promise<{ success: boolean; error?: string }> {
    try {
      const store = useAppStore.getState();
      
      // Clear all user data
      store.setCatches([]);
      store.setEquipmentSets([]);
      store.setEquipmentItems([]);
      store.setEquipmentStats([]);
      store.setUserAchievements([]);

      return { success: true };
    } catch (error) {
      console.error('Clear data failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Clear data failed' 
      };
    }
  }
}

export const dataExportImportService = new DataExportImportService();
