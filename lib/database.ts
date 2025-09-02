import * as SQLite from 'expo-sqlite';

import { 
  Fish, 
  CatchRecord, 
  Achievement, 
  UserAchievement, 
  UserProfile,
  UserPreferences,
} from './types';
import { generateUUID } from './utils';

// 数据库实例
let database: SQLite.SQLiteDatabase | null = null;

// 数据库配置
const DB_NAME = 'fishflow.db';
const DB_VERSION = 1;

// 数据库服务类
export class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLite.SQLiteDatabase | null = null;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // 初始化数据库
  async init(): Promise<SQLite.SQLiteDatabase> {
    if (this.db) {
      return this.db;
    }

    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTables();
      database = this.db;
      console.log('Database initialized successfully');
      return this.db;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  // 创建数据表
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const tables = [
      // 鱼类表
      `CREATE TABLE IF NOT EXISTS fish (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        scientific_name TEXT,
        local_names TEXT,
        family TEXT NOT NULL,
        rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
        images TEXT NOT NULL,
        characteristics TEXT NOT NULL,
        habitat TEXT NOT NULL,
        regulations TEXT,
        behavior TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // 钓鱼记录表
      `CREATE TABLE IF NOT EXISTS catch_records (
        id TEXT PRIMARY KEY,
        fish_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        photos TEXT NOT NULL,
        measurements TEXT,
        location TEXT,
        equipment TEXT NOT NULL,
        conditions TEXT,
        notes TEXT,
        is_released INTEGER DEFAULT 0,
        is_personal_best INTEGER DEFAULT 0,
        tags TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fish_id) REFERENCES fish (id)
      )`,

      // 成就表
      `CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('species', 'quantity', 'size', 'streak', 'location', 'special')),
        tiers TEXT NOT NULL,
        is_hidden INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // 用户成就进度表
      `CREATE TABLE IF NOT EXISTS user_achievements (
        achievement_id TEXT,
        progress REAL DEFAULT 0,
        tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold')),
        unlocked_at TEXT,
        is_viewed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (achievement_id),
        FOREIGN KEY (achievement_id) REFERENCES achievements (id)
      )`,

      // 用户资料表
      `CREATE TABLE IF NOT EXISTS user_profile (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT,
        email TEXT,
        join_date TEXT NOT NULL,
        location TEXT,
        bio TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // 用户偏好设置表
      `CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY DEFAULT 'default',
        units TEXT NOT NULL,
        privacy TEXT NOT NULL,
        notifications TEXT NOT NULL,
        appearance TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    // 创建索引
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_catch_records_fish_id ON catch_records (fish_id)',
      'CREATE INDEX IF NOT EXISTS idx_catch_records_timestamp ON catch_records (timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_catch_records_user_id ON catch_records (user_id)',
      'CREATE INDEX IF NOT EXISTS idx_fish_rarity ON fish (rarity)',
      'CREATE INDEX IF NOT EXISTS idx_fish_family ON fish (family)',
    ];

    try {
      // 执行建表语句
      for (const sql of tables) {
        await this.db.execAsync(sql);
      }

      // 创建索引
      for (const sql of indexes) {
        await this.db.execAsync(sql);
      }

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  // === 鱼类数据操作 ===

  async getAllFish(): Promise<Fish[]> {
    const db = await this.init();
    try {
      const rows = await db.getAllAsync<any>('SELECT * FROM fish ORDER BY name');
      return rows.map(this.parseFishFromRow);
    } catch (error) {
      console.error('Error fetching fish:', error);
      return [];
    }
  }

  async getFishById(id: string): Promise<Fish | null> {
    const db = await this.init();
    try {
      const row = await db.getFirstAsync<any>('SELECT * FROM fish WHERE id = ?', [id]);
      return row ? this.parseFishFromRow(row) : null;
    } catch (error) {
      console.error('Error fetching fish by id:', error);
      return null;
    }
  }

  async insertFish(fish: Fish): Promise<void> {
    const db = await this.init();
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO fish (
          id, name, scientific_name, local_names, family, rarity,
          images, characteristics, habitat, regulations, behavior,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          fish.id,
          fish.name,
          fish.scientificName || null,
          JSON.stringify(fish.localNames || []),
          fish.family,
          fish.rarity,
          JSON.stringify(fish.images),
          JSON.stringify(fish.characteristics),
          JSON.stringify(fish.habitat),
          JSON.stringify(fish.regulations || {}),
          JSON.stringify(fish.behavior),
        ]
      );
    } catch (error) {
      console.error('Error inserting fish:', error);
      throw error;
    }
  }

  async insertManyFish(fishArray: Fish[]): Promise<void> {
    const db = await this.init();
    try {
      await db.withTransactionAsync(async () => {
        for (const fish of fishArray) {
          await this.insertFish(fish);
        }
      });
    } catch (error) {
      console.error('Error inserting multiple fish:', error);
      throw error;
    }
  }

  // === 钓鱼记录操作 ===

  async getAllCatches(): Promise<CatchRecord[]> {
    const db = await this.init();
    try {
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM catch_records ORDER BY timestamp DESC'
      );
      return rows.map(this.parseCatchFromRow);
    } catch (error) {
      console.error('Error fetching catches:', error);
      return [];
    }
  }

  async getCatchById(id: string): Promise<CatchRecord | null> {
    const db = await this.init();
    try {
      const row = await db.getFirstAsync<any>(
        'SELECT * FROM catch_records WHERE id = ?',
        [id]
      );
      return row ? this.parseCatchFromRow(row) : null;
    } catch (error) {
      console.error('Error fetching catch by id:', error);
      return null;
    }
  }

  async insertCatch(catchRecord: CatchRecord): Promise<void> {
    const db = await this.init();
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO catch_records (
          id, fish_id, user_id, timestamp, photos, measurements,
          location, equipment, conditions, notes, is_released,
          is_personal_best, tags, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          catchRecord.id,
          catchRecord.fishId,
          catchRecord.userId,
          catchRecord.timestamp,
          JSON.stringify(catchRecord.photos),
          JSON.stringify(catchRecord.measurements),
          JSON.stringify(catchRecord.location || {}),
          JSON.stringify(catchRecord.equipment),
          JSON.stringify(catchRecord.conditions || {}),
          catchRecord.notes || null,
          catchRecord.isReleased ? 1 : 0,
          catchRecord.isPersonalBest ? 1 : 0,
          JSON.stringify(catchRecord.tags),
        ]
      );
    } catch (error) {
      console.error('Error inserting catch:', error);
      throw error;
    }
  }

  async updateCatch(id: string, updates: Partial<CatchRecord>): Promise<void> {
    const db = await this.init();
    try {
      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (key === 'id' || key === 'createdAt') {
          return; // Skip immutable fields
        }

        const dbKey = this.camelToSnake(key);
        
        if (typeof value === 'object' && value !== null) {
          fields.push(`${dbKey} = ?`);
          values.push(JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          fields.push(`${dbKey} = ?`);
          values.push(value ? 1 : 0);
        } else {
          fields.push(`${dbKey} = ?`);
          values.push(value);
        }
      });

      if (fields.length === 0) {
        return;
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const sql = `UPDATE catch_records SET ${fields.join(', ')} WHERE id = ?`;
      await db.runAsync(sql, values);
    } catch (error) {
      console.error('Error updating catch:', error);
      throw error;
    }
  }

  async deleteCatch(id: string): Promise<void> {
    const db = await this.init();
    try {
      await db.runAsync('DELETE FROM catch_records WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting catch:', error);
      throw error;
    }
  }

  // === 成就相关操作 ===

  async getAllAchievements(): Promise<Achievement[]> {
    const db = await this.init();
    try {
      const rows = await db.getAllAsync<any>('SELECT * FROM achievements');
      return rows.map(this.parseAchievementFromRow);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  async insertAchievement(achievement: Achievement): Promise<void> {
    const db = await this.init();
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO achievements (
          id, name, description, icon, category, tiers, is_hidden
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          achievement.id,
          achievement.name,
          achievement.description,
          achievement.icon,
          achievement.category,
          JSON.stringify(achievement.tiers),
          achievement.isHidden ? 1 : 0,
        ]
      );
    } catch (error) {
      console.error('Error inserting achievement:', error);
      throw error;
    }
  }

  async getAllUserAchievements(): Promise<UserAchievement[]> {
    const db = await this.init();
    try {
      const rows = await db.getAllAsync<any>('SELECT * FROM user_achievements');
      return rows.map(this.parseUserAchievementFromRow);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
  }

  async updateUserAchievement(userAchievement: UserAchievement): Promise<void> {
    const db = await this.init();
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO user_achievements (
          achievement_id, progress, tier, unlocked_at, is_viewed, updated_at
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          userAchievement.achievementId,
          userAchievement.progress,
          userAchievement.tier,
          userAchievement.unlockedAt || null,
          userAchievement.isViewed ? 1 : 0,
        ]
      );
    } catch (error) {
      console.error('Error updating user achievement:', error);
      throw error;
    }
  }

  // === 用户数据操作 ===

  async getUserProfile(): Promise<UserProfile | null> {
    const db = await this.init();
    try {
      const row = await db.getFirstAsync<any>('SELECT * FROM user_profile LIMIT 1');
      return row ? this.parseUserProfileFromRow(row) : null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateUserProfile(profile: UserProfile): Promise<void> {
    const db = await this.init();
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO user_profile (
          id, name, avatar, email, join_date, location, bio, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          profile.id,
          profile.name,
          profile.avatar || null,
          profile.email || null,
          profile.joinDate,
          profile.location || null,
          profile.bio || null,
        ]
      );
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async getUserPreferences(): Promise<UserPreferences | null> {
    const db = await this.init();
    try {
      const row = await db.getFirstAsync<any>('SELECT * FROM user_preferences LIMIT 1');
      return row ? this.parseUserPreferencesFromRow(row) : null;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  async updateUserPreferences(preferences: UserPreferences): Promise<void> {
    const db = await this.init();
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO user_preferences (
          id, units, privacy, notifications, appearance, updated_at
        ) VALUES ('default', ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          JSON.stringify(preferences.units),
          JSON.stringify(preferences.privacy),
          JSON.stringify(preferences.notifications),
          JSON.stringify(preferences.appearance),
        ]
      );
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // === 工具方法 ===

  async clearAllData(): Promise<void> {
    const db = await this.init();
    try {
      await db.withTransactionAsync(async () => {
        await db.execAsync('DELETE FROM catch_records');
        await db.execAsync('DELETE FROM user_achievements');
        await db.execAsync('DELETE FROM user_profile');
        await db.execAsync('DELETE FROM user_preferences');
        await db.execAsync('DELETE FROM fish');
        await db.execAsync('DELETE FROM achievements');
      });
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  async getTableInfo(tableName: string): Promise<any[]> {
    const db = await this.init();
    try {
      return await db.getAllAsync(`PRAGMA table_info(${tableName})`);
    } catch (error) {
      console.error(`Error getting table info for ${tableName}:`, error);
      return [];
    }
  }

  // === 私有解析方法 ===

  private parseFishFromRow(row: any): Fish {
    return {
      id: row.id,
      name: row.name,
      scientificName: row.scientific_name,
      localNames: JSON.parse(row.local_names || '[]'),
      family: row.family,
      rarity: row.rarity,
      images: JSON.parse(row.images),
      characteristics: JSON.parse(row.characteristics),
      habitat: JSON.parse(row.habitat),
      regulations: JSON.parse(row.regulations || '{}'),
      behavior: JSON.parse(row.behavior),
    };
  }

  private parseCatchFromRow(row: any): CatchRecord {
    return {
      id: row.id,
      fishId: row.fish_id,
      userId: row.user_id,
      timestamp: row.timestamp,
      photos: JSON.parse(row.photos),
      measurements: JSON.parse(row.measurements || '{}'),
      location: JSON.parse(row.location || 'null'),
      equipment: JSON.parse(row.equipment),
      conditions: JSON.parse(row.conditions || '{}'),
      notes: row.notes,
      isReleased: Boolean(row.is_released),
      isPersonalBest: Boolean(row.is_personal_best),
      tags: JSON.parse(row.tags || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private parseAchievementFromRow(row: any): Achievement {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      category: row.category,
      tiers: JSON.parse(row.tiers),
      isHidden: Boolean(row.is_hidden),
    };
  }

  private parseUserAchievementFromRow(row: any): UserAchievement {
    return {
      achievementId: row.achievement_id,
      progress: row.progress,
      tier: row.tier,
      unlockedAt: row.unlocked_at,
      isViewed: Boolean(row.is_viewed),
    };
  }

  private parseUserProfileFromRow(row: any): UserProfile {
    return {
      id: row.id,
      name: row.name,
      avatar: row.avatar,
      email: row.email,
      joinDate: row.join_date,
      location: row.location,
      bio: row.bio,
    };
  }

  private parseUserPreferencesFromRow(row: any): UserPreferences {
    return {
      units: JSON.parse(row.units),
      privacy: JSON.parse(row.privacy),
      notifications: JSON.parse(row.notifications),
      appearance: JSON.parse(row.appearance),
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

// 导出单例实例
export const databaseService = DatabaseService.getInstance();

// 便捷方法导出
export const initDatabase = () => databaseService.init();
export const clearDatabase = () => databaseService.clearAllData();