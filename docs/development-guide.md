# FishFlow 开发指南

## 🚀 快速开始

### 环境要求
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0 或 **yarn**: >= 1.22.0
- **Expo CLI**: 最新版本
- **Git**: >= 2.20.0

### 项目设置

1. **克隆项目**
```bash
git clone https://github.com/your-org/fishflow.git
cd fishflow
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **安装额外依赖**
```bash
npx expo install expo-sqlite expo-image-picker expo-location expo-haptics
npm install zustand react-hook-form lottie-react-native @react-native-async-storage/async-storage react-native-flash-message
```

4. **启动开发服务器**
```bash
npm start
# 或
yarn start
```

5. **在设备上运行**
```bash
# iOS 模拟器
npm run ios

# Android 模拟器  
npm run android

# Web 浏览器
npm run web
```

## 📁 项目结构详解

```
fishflow/
├── app/                    # 📱 Expo Router 页面
│   ├── (tabs)/            # 🏠 Tab 导航页面
│   ├── fish/              # 🐟 鱼类相关页面
│   ├── modals/            # 📋 模态页面
│   ├── _layout.tsx        # 🎨 根布局
│   └── +not-found.tsx     # 🚫 404 页面
├── components/            # 🧩 可复用组件
│   ├── ui/               # 🎨 基础 UI 组件
│   ├── screens/          # 📱 页面专用组件
│   └── themed/           # 🌓 主题化组件
├── lib/                  # 📚 核心业务逻辑
│   ├── store.ts          # 🗄️  全局状态管理
│   ├── database.ts       # 💾 数据库操作
│   ├── types.ts          # 📝 类型定义
│   ├── utils.ts          # 🔧 工具函数
│   ├── constants.ts      # 📌 常量配置
│   └── services/         # 🛠️  业务服务
├── assets/               # 🎭 静态资源
│   ├── images/           # 🖼️  图片资源
│   ├── lottie/           # 🎬 动画文件
│   ├── data/             # 📊 静态数据
│   └── fonts/            # 🔤 字体文件
├── constants/            # 🎯 应用常量
├── hooks/                # 🎣 自定义 Hooks
└── docs/                 # 📖 项目文档
```

## 🔧 开发工具配置

### VS Code 扩展推荐
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss", 
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "expo.vscode-expo-tools",
    "ms-vscode.vscode-react-native"
  ]
}
```

### VS Code 设置
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "typescriptreact"
  }
}
```

### 代码规范配置

**.prettierrc**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 🎨 开发规范

### 1. 代码风格

**命名约定**:
- 组件: `PascalCase` (FishCard, ProgressBar)
- 文件: `PascalCase` (FishCard.tsx)
- 变量/函数: `camelCase` (fishData, handlePress)
- 常量: `UPPER_CASE` (API_BASE_URL)
- 类型接口: `PascalCase` (Fish, CatchRecord)

**导入顺序**:
```typescript
// 1. React 相关
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. 第三方库
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 3. 项目内部 - 绝对路径
import { FishCard } from '@/components/ui/FishCard';
import { useAppStore } from '@/lib/store';

// 4. 相对路径导入
import './LocalStyles.css';
```

### 2. TypeScript 使用

**类型定义位置**:
```typescript
// lib/types.ts - 全局类型
export interface Fish {
  id: string;
  name: string;
  // ...
}

// 组件内部类型
interface FishCardProps {
  fish: Fish;
  onPress?: () => void;
}

// 本地类型
type LocalState = {
  isLoading: boolean;
  error?: string;
};
```

**泛型使用**:
```typescript
// 好的泛型使用
function createApiHook<T>(endpoint: string) {
  return function useApiData(): ApiResult<T> {
    // ...
  };
}

// 避免 any 类型
const handleData = (data: unknown) => {
  if (typeof data === 'object' && data !== null) {
    // 类型守卫
  }
};
```

### 3. 组件开发规范

**函数组件模板**:
```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ComponentProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

export function Component({ 
  title, 
  onPress, 
  disabled = false 
}: ComponentProps) {
  const textColor = useThemeColor({}, 'text');
  
  return (
    <Pressable
      style={[styles.container, { opacity: disabled ? 0.5 : 1 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.title, { color: textColor }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

**性能优化要点**:
```typescript
// 使用 React.memo 优化重渲染
export const FishCard = React.memo<FishCardProps>(({ fish, onPress }) => {
  // ...
});

// 使用 useCallback 缓存函数
const handlePress = useCallback(() => {
  onPress?.(fish.id);
}, [fish.id, onPress]);

// 使用 useMemo 缓存计算结果
const rarityColor = useMemo(() => {
  return getRarityColor(fish.rarity);
}, [fish.rarity]);
```

## 🗄️ 状态管理指南

### Zustand Store 结构

```typescript
// lib/store.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface AppState {
  // 数据状态
  fish: Fish[];
  catches: CatchRecord[];
  achievements: Achievement[];
  
  // UI 状态
  isLoading: boolean;
  currentView: string;
  
  // 用户偏好
  theme: 'light' | 'dark' | 'auto';
  filters: FishdexFilters;
}

interface AppActions {
  // 数据操作
  loadFishData: () => Promise<void>;
  addCatch: (catch: CatchRecord) => Promise<void>;
  
  // UI 操作
  setLoading: (loading: boolean) => void;
  setTheme: (theme: AppState['theme']) => void;
  
  // 筛选和搜索
  updateFilters: (filters: Partial<FishdexFilters>) => void;
}

export const useAppStore = create<AppState & AppActions>()(
  subscribeWithSelector((set, get) => ({
    // 初始状态
    fish: [],
    catches: [],
    achievements: [],
    isLoading: false,
    currentView: 'fishdex',
    theme: 'auto',
    filters: {},
    
    // Actions
    loadFishData: async () => {
      set({ isLoading: true });
      try {
        const fish = await DatabaseService.getAllFish();
        set({ fish });
      } finally {
        set({ isLoading: false });
      }
    },
    
    addCatch: async (catchRecord) => {
      const newCatch = await DatabaseService.addCatch(catchRecord);
      set((state) => ({
        catches: [...state.catches, newCatch]
      }));
      
      // 检查成就
      get().checkAchievements();
    },
    
    setTheme: (theme) => set({ theme }),
    setLoading: (isLoading) => set({ isLoading }),
    
    updateFilters: (newFilters) => 
      set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),
  }))
);

// Store 订阅和选择器
export const useFish = () => useAppStore((state) => state.fish);
export const useCatches = () => useAppStore((state) => state.catches);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
```

### 页面级状态管理
```typescript
// 页面组件中使用
function FishdexScreen() {
  const fish = useFish();
  const loadFishData = useAppStore((state) => state.loadFishData);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 组件挂载时加载数据
  useEffect(() => {
    loadFishData();
  }, [loadFishData]);
  
  // 搜索逻辑
  const filteredFish = useMemo(() => {
    return fish.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [fish, searchQuery]);
  
  return (
    <View>
      {/* 组件内容 */}
    </View>
  );
}
```

## 💾 数据库操作指南

### SQLite 数据库设置
```typescript
// lib/database.ts
import * as SQLite from 'expo-sqlite';

export class DatabaseService {
  private static instance: SQLite.SQLiteDatabase;
  
  static async init() {
    if (!this.instance) {
      this.instance = await SQLite.openDatabaseAsync('fishflow.db');
      await this.createTables();
    }
    return this.instance;
  }
  
  private static async createTables() {
    const db = this.instance;
    
    // 创建鱼类表
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fish (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        scientific_name TEXT,
        family TEXT,
        rarity TEXT NOT NULL,
        image_url TEXT,
        data JSON,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 创建钓鱼记录表
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS catches (
        id TEXT PRIMARY KEY,
        fish_id TEXT,
        user_id TEXT,
        photos JSON,
        length_cm REAL,
        weight_kg REAL,
        location JSON,
        equipment JSON,
        notes TEXT,
        is_released INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fish_id) REFERENCES fish (id)
      );
    `);
    
    // 创建成就表
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        achievement_id TEXT,
        progress INTEGER DEFAULT 0,
        tier TEXT,
        unlocked_at TEXT,
        is_viewed INTEGER DEFAULT 0,
        PRIMARY KEY (achievement_id)
      );
    `);
  }
  
  // 鱼类数据操作
  static async getAllFish(): Promise<Fish[]> {
    const db = await this.init();
    const result = await db.getAllAsync(
      'SELECT * FROM fish ORDER BY name'
    );
    return result.map(row => ({
      ...row,
      data: JSON.parse(row.data || '{}'),
    }));
  }
  
  static async addCatch(catch: Omit<CatchRecord, 'id'>): Promise<CatchRecord> {
    const db = await this.init();
    const id = generateUUID();
    
    await db.runAsync(
      `INSERT INTO catches (
        id, fish_id, user_id, photos, length_cm, weight_kg,
        location, equipment, notes, is_released
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        catch.fishId,
        catch.userId,
        JSON.stringify(catch.photos),
        catch.measurements.lengthCm,
        catch.measurements.weightKg,
        JSON.stringify(catch.location),
        JSON.stringify(catch.equipment),
        catch.notes,
        catch.isReleased ? 1 : 0,
      ]
    );
    
    return { ...catch, id };
  }
}
```

### 数据同步策略
```typescript
// lib/services/sync-service.ts
export class SyncService {
  static async syncToCloud() {
    const db = await DatabaseService.init();
    
    // 获取本地未同步的数据
    const unsyncedCatches = await db.getAllAsync(
      'SELECT * FROM catches WHERE synced = 0'
    );
    
    // 批量上传到云端
    for (const catch of unsyncedCatches) {
      try {
        await this.uploadCatch(catch);
        await db.runAsync(
          'UPDATE catches SET synced = 1 WHERE id = ?',
          [catch.id]
        );
      } catch (error) {
        console.error('Sync failed for catch:', catch.id, error);
      }
    }
  }
  
  static async downloadLatestData() {
    // 从云端获取最新数据
    const latestFish = await ApiService.getLatestFish();
    
    // 更新本地数据库
    const db = await DatabaseService.init();
    for (const fish of latestFish) {
      await db.runAsync(
        `INSERT OR REPLACE INTO fish (id, name, data) 
         VALUES (?, ?, ?)`,
        [fish.id, fish.name, JSON.stringify(fish)]
      );
    }
  }
}
```

## 🎨 UI 开发指南

### 主题系统使用
```typescript
// 在组件中使用主题
import { useThemeColor } from '@/hooks/useThemeColor';

function MyComponent() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'tint');
  
  return (
    <View style={{ backgroundColor }}>
      <Text style={{ color: textColor }}>内容</Text>
    </View>
  );
}
```

### 响应式设计
```typescript
// hooks/useResponsive.ts
import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  
  return {
    isSmall: width < 375,
    isMedium: width >= 375 && width < 768,
    isLarge: width >= 768,
    isTablet: width >= 768,
    isLandscape: width > height,
    
    // 动态列数
    gridColumns: width >= 768 ? 3 : 2,
    
    // 动态字体大小
    fontSize: {
      small: width < 375 ? 12 : 14,
      body: width < 375 ? 14 : 16,
      title: width < 375 ? 18 : 20,
    },
  };
}

// 在组件中使用
function FishdexGrid() {
  const { gridColumns, isTablet } = useResponsive();
  
  return (
    <FlatList
      numColumns={gridColumns}
      ItemSeparatorComponent={() => 
        <View style={{ height: isTablet ? 16 : 12 }} />
      }
      // ...
    />
  );
}
```

### 动画开发
```typescript
// 使用 Reanimated 创建动画
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

function AnimatedFishCard({ fish, onPress }) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 150 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {/* 卡片内容 */}
      </Pressable>
    </Animated.View>
  );
}
```

## 🧪 测试指南

### 单元测试
```typescript
// __tests__/components/FishCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FishCard } from '@/components/ui/FishCard';

const mockFish: Fish = {
  id: 'test-fish',
  name: '测试鱼',
  rarity: 'common',
  images: { card: 'test.jpg' },
  // ... 其他属性
};

describe('FishCard', () => {
  it('renders fish name correctly', () => {
    const { getByText } = render(
      <FishCard fish={mockFish} state="unlocked" />
    );
    
    expect(getByText('测试鱼')).toBeTruthy();
  });
  
  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <FishCard 
        fish={mockFish} 
        state="unlocked" 
        onPress={onPressMock}
        testID="fish-card"
      />
    );
    
    fireEvent.press(getByTestId('fish-card'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
  
  it('shows locked state correctly', () => {
    const { getByTestId } = render(
      <FishCard fish={mockFish} state="locked" />
    );
    
    expect(getByTestId('locked-overlay')).toBeTruthy();
  });
});
```

### 集成测试
```typescript
// __tests__/screens/FishdexScreen.test.tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { FishdexScreen } from '@/app/(tabs)/fishdex';

// Mock 数据和服务
jest.mock('@/lib/store', () => ({
  useAppStore: () => ({
    fish: mockFishData,
    loadFishData: jest.fn(),
  }),
}));

describe('FishdexScreen', () => {
  it('displays fish grid correctly', async () => {
    const { getByTestId, getAllByTestId } = render(<FishdexScreen />);
    
    await waitFor(() => {
      expect(getByTestId('fishdex-grid')).toBeTruthy();
      expect(getAllByTestId(/fish-card-/)).toHaveLength(mockFishData.length);
    });
  });
});
```

### E2E 测试 (Detox)
```typescript
// e2e/fishdex.e2e.js
describe('Fishdex Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should navigate to fish detail', async () => {
    // 点击鱼类图鉴 tab
    await element(by.text('图鉴')).tap();
    
    // 点击第一个鱼类卡片
    await element(by.id('fish-card-0')).tap();
    
    // 验证进入详情页
    await expect(element(by.id('fish-detail-screen'))).toBeVisible();
    
    // 验证鱼类名称显示
    await expect(element(by.id('fish-name'))).toBeVisible();
  });
});
```

## 🚀 部署和发布

### 构建配置
```javascript
// app.config.js
export default {
  expo: {
    name: 'FishFlow',
    slug: 'fishflow',
    version: '1.0.0',
    
    // 构建配置
    android: {
      package: 'com.fishflow.app',
      versionCode: 1,
    },
    ios: {
      bundleIdentifier: 'com.fishflow.app',
      buildNumber: '1',
    },
    
    // 插件配置
    plugins: [
      'expo-router',
      'expo-sqlite',
      'expo-image-picker',
      'expo-location',
    ],
    
    // 权限配置
    permissions: [
      'CAMERA',
      'CAMERA_ROLL',
      'LOCATION',
    ],
  },
};
```

### 发布流程
```bash
# 1. 构建预览版本
npx eas build --profile preview --platform all

# 2. 内部测试
npx eas submit --profile preview

# 3. 生产构建
npx eas build --profile production --platform all

# 4. 应用商店发布
npx eas submit --profile production
```

### 版本管理
```json
{
  "scripts": {
    "version:patch": "npm version patch",
    "version:minor": "npm version minor", 
    "version:major": "npm version major",
    "release": "npm run version:patch && git push --tags"
  }
}
```

## 🐛 调试指南

### 开发者工具
- **Flipper**: React Native 调试工具
- **React DevTools**: 组件状态检查
- **Remote Debugger**: Chrome 开发者工具

### 常见问题解决

1. **Metro 缓存问题**
```bash
npx expo start --clear
```

2. **依赖冲突**
```bash
rm -rf node_modules package-lock.json
npm install
```

3. **iOS 模拟器问题**
```bash
npx expo run:ios --device
```

4. **Android 构建失败**
```bash
cd android && ./gradlew clean
cd .. && npx expo run:android
```

## 📖 学习资源

### 官方文档
- [Expo 文档](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native 文档](https://reactnative.dev/)

### 推荐学习路径
1. React Native 基础
2. Expo 生态系统
3. 状态管理 (Zustand)
4. 动画 (Reanimated)
5. 测试 (Jest + Testing Library)

---

**文档版本**: 1.0  
**最后更新**: 2024-09-01  
**维护者**: FishFlow 开发团队