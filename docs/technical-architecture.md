# FishFlow 技术架构文档

## 📋 项目概述

FishFlow 是一个基于 Expo 的钓鱼日志和鱼类图鉴应用，采用游戏化设计，参考宝可梦图鉴风格。用户可以记录钓鱼日志、收集鱼类、获取成就，并查看统计数据。

## 🛠️ 技术栈

### 核心框架
- **Expo SDK 53.0** - React Native 开发平台
- **React Native 0.79.6** - 移动端框架
- **TypeScript 5.8** - 类型安全的 JavaScript
- **Expo Router 5.1** - 基于文件系统的路由

### 状态管理与数据
- **Zustand** - 轻量级状态管理
- **Expo SQLite** - 本地数据库
- **AsyncStorage** - 本地存储

### UI 与交互
- **React Native Reanimated 3** - 动画库
- **React Native Gesture Handler** - 手势处理
- **Lottie React Native** - 矢量动画
- **Expo Image** - 高性能图片组件
- **Expo Haptics** - 触觉反馈

### 媒体与权限
- **Expo Image Picker** - 图片选择
- **Expo Location** - 位置服务
- **Expo Camera** - 相机功能

### 表单与验证
- **React Hook Form** - 表单管理
- **Zod** - 运行时类型验证

## 🏗️ 项目架构

### 目录结构
```
fishflow/
├── app/                    # Expo Router 路由页面
│   ├── (tabs)/            # 底部导航页面
│   │   ├── index.tsx      # 主页
│   │   ├── fishdex.tsx    # 鱼类图鉴
│   │   ├── log.tsx        # 记录页面
│   │   ├── achievements.tsx # 成就页面
│   │   └── stats.tsx      # 统计页面
│   ├── fish/              # 鱼类相关页面
│   │   └── [id].tsx       # 鱼类详情
│   ├── modals/            # 模态页面
│   │   ├── log-catch.tsx  # 记录钓鱼
│   │   └── filter.tsx     # 筛选器
│   ├── _layout.tsx        # 根布局
│   └── +not-found.tsx     # 404页面
├── components/            # 组件库
│   ├── ui/               # 基础UI组件
│   │   ├── FishCard.tsx  # 鱼类卡片
│   │   ├── Badge.tsx     # 徽章组件
│   │   ├── ProgressBar.tsx # 进度条
│   │   ├── FilterChip.tsx # 筛选标签
│   │   └── IconSymbol.tsx # 图标组件
│   ├── screens/          # 页面专用组件
│   │   ├── Heatmap.tsx   # 热力图
│   │   ├── EmptyState.tsx # 空状态
│   │   └── UnlockAnimation.tsx # 解锁动画
│   ├── ThemedText.tsx    # 主题化文本
│   └── ThemedView.tsx    # 主题化视图
├── lib/                  # 核心逻辑
│   ├── store.ts          # Zustand 状态管理
│   ├── database.ts       # SQLite 数据库
│   ├── theme.ts          # 主题配置
│   ├── types.ts          # TypeScript 类型定义
│   ├── utils.ts          # 工具函数
│   └── constants.ts      # 常量配置
├── assets/               # 静态资源
│   ├── images/           # 图片资源
│   │   ├── fish/         # 鱼类图片
│   │   └── icons/        # 图标
│   ├── lottie/           # Lottie 动画
│   └── data/             # 静态数据
├── constants/            # 常量配置
│   └── Colors.ts         # 颜色配置
├── hooks/                # 自定义 Hooks
│   ├── useColorScheme.ts
│   └── useThemeColor.ts
└── docs/                 # 文档
    ├── add-on.md         # 功能扩展文档
    ├── ui.md             # UI设计文档
    └── technical-architecture.md # 本文档
```

## 📱 核心功能模块

### 1. 鱼类图鉴 (Fishdex)
- **网格布局**：2-3列响应式布局
- **卡片状态**：locked/hint/unlocked/new
- **搜索筛选**：按名称、稀有度、地区、季节筛选
- **排序**：按名称、稀有度、最近解锁排序
- **虚拟化**：支持大量数据的性能优化

### 2. 钓鱼记录 (Log)
- **分步表单**：相机→物种→尺寸→装备→位置→备注
- **图片处理**：拍照、选择、裁剪、压缩
- **数据验证**：实时表单验证和错误提示
- **草稿保存**：自动保存未完成的记录
- **隐私控制**：位置信息的精确度控制

### 3. 成就系统 (Achievements)
- **徽章墙**：网格展示各种成就徽章
- **进度跟踪**：实时显示成就完成进度
- **层级系统**：铜牌/银牌/金牌三个层级
- **解锁动画**：Lottie 动画庆祝解锁

### 4. 统计分析 (Stats)
- **热力图**：钓鱼频率的日历热力图
- **图表展示**：按物种、水域、月份的统计图表
- **个人记录**：最大鱼、最重鱼等个人最佳
- **数据导出**：统计数据的图片导出功能

## 🗄️ 数据模型

### 核心数据类型
```typescript
// 鱼类物种数据
interface Fish {
  id: string;                    // 唯一标识符
  name: string;                  // 中文名称
  scientificName?: string;       // 学名
  localNames?: string[];         // 地方俗名
  family: string;                // 科属
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  images: {
    card: string;                // 卡片图片
    hero?: string;               // 详情页大图
    silhouette?: string;         // 剪影图
  };
  characteristics: {
    minLengthCm: number;         // 最小长度
    maxLengthCm: number;         // 最大长度
    maxWeightKg: number;         // 最大重量
    lifespan?: number;           // 寿命
  };
  habitat: {
    waterTypes: WaterType[];     // 栖息水域类型
    regions: string[];           // 分布地区
    seasons: number[];           // 活跃季节(月份)
    depth?: string;              // 活动深度
  };
  regulations?: {
    minSizeCm?: number;          // 法定最小尺寸
    closedSeasons?: number[];    // 禁钓季节
    dailyLimit?: number;         // 日钓获限制
  };
  behavior: {
    feedingHabits: string[];     // 食性
    activeTime: 'day' | 'night' | 'both';
    difficulty: 1 | 2 | 3 | 4 | 5; // 钓获难度
  };
}

// 钓鱼记录
interface CatchRecord {
  id: string;
  fishId: string;                // 关联的鱼类ID
  userId: string;                // 用户ID
  timestamp: string;             // ISO时间戳
  photos: string[];              // 照片路径数组
  measurements: {
    lengthCm?: number;           // 长度
    weightKg?: number;           // 重量
    girthCm?: number;            // 围长
  };
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
    waterBodyName?: string;
    waterType: WaterType;
    privacy: 'exact' | 'fuzzy' | 'hidden';
  };
  equipment: {
    rod?: string;                // 钓竿
    reel?: string;               // 渔轮
    line?: string;               // 钓线
    hook?: string;               // 鱼钩
    bait?: string;               // 饵料
  };
  conditions: {
    weather?: string;            // 天气
    temperature?: number;        // 温度
    windSpeed?: number;          // 风速
    pressure?: number;           // 气压
  };
  notes?: string;                // 备注
  isReleased: boolean;           // 是否放生
  isPersonalBest: boolean;       // 是否个人记录
  tags: string[];                // 标签
  createdAt: string;
  updatedAt: string;
}

// 成就数据
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'species' | 'quantity' | 'size' | 'streak' | 'location' | 'special';
  tiers: {
    bronze: { requirement: number; reward?: string };
    silver: { requirement: number; reward?: string };
    gold: { requirement: number; reward?: string };
  };
  isHidden: boolean;             // 隐藏成就
}

// 用户成就进度
interface UserAchievement {
  achievementId: string;
  progress: number;
  tier: 'bronze' | 'silver' | 'gold' | null;
  unlockedAt?: string;
  isViewed: boolean;
}

// 水域类型
type WaterType = 'river' | 'lake' | 'reservoir' | 'pond' | 'stream' | 'ocean' | 'estuary';
```

## 🎨 设计系统

### 主题配置
```typescript
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: {
    xs: number;    // 4
    sm: number;    // 8
    md: number;    // 16
    lg: number;    // 24
    xl: number;    // 32
    xxl: number;   // 48
  };
  borderRadius: {
    sm: number;    // 4
    md: number;    // 8
    lg: number;    // 12
    xl: number;    // 16
    full: number;  // 9999
  };
  typography: {
    h1: TextStyle;
    h2: TextStyle;
    h3: TextStyle;
    body: TextStyle;
    caption: TextStyle;
  };
}
```

### 稀有度配色方案
```typescript
const rarityColors = {
  common: '#6B7280',    // 灰色
  rare: '#3B82F6',      // 蓝色  
  epic: '#8B5CF6',      // 紫色
  legendary: '#F59E0B', // 金色
};
```

## 🔄 状态管理架构

### Zustand Store 结构
```typescript
interface AppStore {
  // 用户数据
  user: {
    profile: UserProfile;
    preferences: UserPreferences;
    stats: UserStats;
  };
  
  // 鱼类数据
  fish: {
    species: Fish[];
    catches: CatchRecord[];
    unlockedSet: Set<string>;
  };
  
  // 成就数据
  achievements: {
    definitions: Achievement[];
    userProgress: UserAchievement[];
  };
  
  // UI状态
  ui: {
    currentTheme: 'light' | 'dark';
    fishdexFilters: FishdexFilters;
    isLoading: boolean;
    activeModal?: string;
  };
  
  // Actions
  actions: {
    // 鱼类相关
    loadFishData: () => Promise<void>;
    addCatchRecord: (record: Omit<CatchRecord, 'id'>) => Promise<void>;
    updateCatchRecord: (id: string, updates: Partial<CatchRecord>) => Promise<void>;
    deleteCatchRecord: (id: string) => Promise<void>;
    
    // 成就相关
    checkAchievements: () => Promise<void>;
    markAchievementViewed: (achievementId: string) => void;
    
    // 筛选和搜索
    updateFishdexFilters: (filters: Partial<FishdexFilters>) => void;
    searchFish: (query: string) => Fish[];
    
    // 统计数据
    getStatistics: () => UserStats;
    getPersonalBests: () => PersonalBests;
  };
}
```

## 📊 性能优化策略

### 1. 列表虚拟化
- 使用 `FlashList` 替代 `FlatList` 处理大量数据
- 实现图片懒加载和预加载机制
- 优化卡片渲染性能

### 2. 图片优化
- 使用 `expo-image` 进行图片缓存
- 实现多尺寸图片响应式加载
- 压缩用户上传的图片

### 3. 数据缓存
- SQLite 数据库查询优化
- 关键数据的内存缓存
- 异步数据加载和预取

### 4. 动画性能
- 使用 `react-native-reanimated` 的 UI 线程动画
- 避免在动画期间的复杂计算
- 合理使用 Lottie 动画

## 🔒 数据安全与隐私

### 1. 位置隐私
- 三级位置精度控制：精确/模糊/隐藏
- 敏感位置自动模糊处理
- 用户可随时修改历史位置信息

### 2. 数据加密
- 敏感数据本地加密存储
- 图片文件加密保存
- 用户偏好设置加密

### 3. 数据备份
- 本地数据库定期备份
- 支持数据导出和导入
- 云端同步（可选）

## 🚀 部署与发布

### 1. 构建配置
- 生产环境优化配置
- 代码分割和 Tree Shaking
- 资源压缩和优化

### 2. 平台适配
- iOS 和 Android 原生功能适配
- Web 端功能降级处理
- 不同屏幕尺寸适配

### 3. 发布流程
- 自动化测试集成
- 版本管理和发布标签
- 应用商店发布流程

---

**文档版本**: 1.0  
**最后更新**: 2024-09-01  
**维护者**: FishFlow 开发团队