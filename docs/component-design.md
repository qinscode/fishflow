# FishFlow 组件设计文档

## 📋 组件设计原则

### 设计理念
- **一致性**: 所有组件遵循统一的设计语言
- **可访问性**: 支持屏幕阅读器和无障碍访问
- **性能优先**: 优化渲染性能，支持大量数据
- **主题化**: 支持明暗主题切换
- **响应式**: 适配不同屏幕尺寸和方向

### 命名规范
- 组件名使用 PascalCase：`FishCard`, `ProgressBar`
- Props 使用 camelCase：`imageUri`, `onPress`
- 样式使用 camelCase：`cardContainer`, `imageWrapper`

## 🎨 基础 UI 组件

### 1. FishCard - 鱼类卡片组件

鱼类图鉴的核心展示组件，支持多种状态显示。

```typescript
interface FishCardProps {
  fish: Fish;
  state: 'locked' | 'hint' | 'unlocked' | 'new';
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  onLongPress?: () => void;
  showRarity?: boolean;
  showId?: boolean;
}

// 使用示例
<FishCard
  fish={fishData}
  state="unlocked"
  size="medium"
  onPress={() => router.push(`/fish/${fish.id}`)}
  showRarity={true}
  showId={true}
/>
```

**设计规格**:
- 宽高比: 1:1.2 (卡片式)
- 圆角: 12px
- 阴影: 轻微下沉效果
- 动画: 点击缩放 0.95x, 150ms

**状态处理**:
- `locked`: 灰色背景 + 剪影/模糊图片 + 锁定图标
- `hint`: 半透明效果 + "即将解锁"提示
- `unlocked`: 完整彩色显示
- `new`: 发光边框 + "NEW"标识

### 2. Badge - 成就徽章组件

用于显示各种成就和等级的徽章组件。

```typescript
interface BadgeProps {
  achievement: Achievement;
  tier: 'bronze' | 'silver' | 'gold' | null;
  size?: 'small' | 'medium' | 'large';
  isLocked?: boolean;
  progress?: number; // 0-1
  onPress?: () => void;
  showProgress?: boolean;
}

// 使用示例
<Badge
  achievement={achievementData}
  tier="gold"
  size="medium"
  progress={0.8}
  showProgress={true}
  onPress={() => showAchievementDetail(achievement.id)}
/>
```

**设计规格**:
- 形状: 圆形或盾牌形
- 颜色: 铜色 #CD7F32, 银色 #C0C0C0, 金色 #FFD700
- 尺寸: small(32px), medium(48px), large(64px)
- 动画: 解锁时的光芒效果

### 3. ProgressBar - 进度条组件

显示各种进度信息的通用组件。

```typescript
interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  backgroundColor?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  duration?: number;
}

// 使用示例
<ProgressBar
  progress={0.75}
  color="#4CAF50"
  height={8}
  showLabel={true}
  label="75%"
  animated={true}
/>
```

**样式变体**:
- 线性进度条: 标准矩形进度条
- 环形进度条: 圆环形进度显示
- 分段进度条: 多段式进度显示

### 4. FilterChip - 筛选标签组件

用于筛选和分类的标签组件。

```typescript
interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'filled' | 'outlined' | 'text';
  color?: string;
  icon?: string;
  count?: number;
  disabled?: boolean;
}

// 使用示例
<FilterChip
  label="淡水鱼"
  selected={true}
  onPress={() => toggleFilter('freshwater')}
  variant="filled"
  count={25}
/>
```

### 5. IconSymbol - 图标组件

统一的图标组件，支持SF Symbols。

```typescript
interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
  weight?: 'ultraLight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';
  style?: ViewStyle;
}

// 使用示例
<IconSymbol
  name="fish.fill"
  size={24}
  color="#007AFF"
  weight="medium"
/>
```

## 📱 页面专用组件

### 1. Heatmap - 钓鱼频率热力图

显示用户钓鱼活动频率的日历热力图。

```typescript
interface HeatmapProps {
  data: HeatmapData[];
  startDate: Date;
  endDate: Date;
  onCellPress?: (date: Date, count: number) => void;
  colorScheme?: 'green' | 'blue' | 'custom';
  showLabels?: boolean;
}

interface HeatmapData {
  date: string; // YYYY-MM-DD
  count: number;
  catches?: CatchRecord[];
}

// 使用示例
<Heatmap
  data={heatmapData}
  startDate={startOfYear}
  endDate={endOfYear}
  onCellPress={(date, count) => showDayDetail(date)}
  colorScheme="green"
  showLabels={true}
/>
```

**设计规格**:
- 网格布局: 7x52 (一年的周数)
- 颜色渐变: 5个等级的颜色深度
- 交互: 点击显示详情,长按显示工具提示

### 2. EmptyState - 空状态组件

处理各种空数据情况的通用组件。

```typescript
interface EmptyStateProps {
  type: 'no-data' | 'no-results' | 'error' | 'loading';
  title: string;
  description?: string;
  illustration?: string | React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
  lottieAnimation?: string;
}

// 使用示例
<EmptyState
  type="no-data"
  title="还没有记录任何钓鱼"
  description="开始记录你的第一次钓鱼之旅吧！"
  action={{
    label: "记录钓鱼",
    onPress: () => router.push('/log')
  }}
  lottieAnimation="fishing-empty"
/>
```

### 3. UnlockAnimation - 解锁动画组件

新物种解锁时的庆祝动画。

```typescript
interface UnlockAnimationProps {
  fish: Fish;
  visible: boolean;
  onComplete: () => void;
  animationType?: 'confetti' | 'sparkle' | 'splash';
}

// 使用示例
<UnlockAnimation
  fish={newFish}
  visible={showUnlockAnimation}
  onComplete={() => setShowUnlockAnimation(false)}
  animationType="confetti"
/>
```

**动画序列**:
1. 背景模糊进入 (200ms)
2. 鱼类卡片从小到大出现 (300ms)
3. 庆祝动画播放 (1200ms)
4. "新物种解锁!"文字动画 (400ms)
5. 整体退出动画 (300ms)

## 🔧 复合组件

### 1. FishdexGrid - 鱼类网格组件

鱼类图鉴页面的主要网格布局组件。

```typescript
interface FishdexGridProps {
  fish: Fish[];
  catches: CatchRecord[];
  filters: FishdexFilters;
  searchQuery: string;
  onFishPress: (fish: Fish) => void;
  onFilterPress: () => void;
  numColumns?: number;
  showUnlockedOnly?: boolean;
}

// 使用示例
<FishdexGrid
  fish={fishData}
  catches={catchData}
  filters={currentFilters}
  searchQuery={searchText}
  onFishPress={handleFishPress}
  onFilterPress={openFilterModal}
  numColumns={2}
  showUnlockedOnly={showUnlockedFilter}
/>
```

### 2. CatchLogForm - 钓鱼记录表单

分步骤的钓鱼记录表单组件。

```typescript
interface CatchLogFormProps {
  onSubmit: (data: CatchFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CatchFormData>;
  autoSaveDraft?: boolean;
}

interface CatchFormData {
  photos: string[];
  fishId?: string;
  customFishName?: string;
  measurements: {
    lengthCm?: number;
    weightKg?: number;
  };
  location?: LocationData;
  equipment: EquipmentData;
  notes?: string;
  isReleased: boolean;
}

// 使用示例
<CatchLogForm
  onSubmit={handleSubmitCatch}
  onCancel={() => router.back()}
  autoSaveDraft={true}
/>
```

**表单步骤**:
1. 拍照/选择图片
2. 选择或输入鱼类
3. 测量数据输入
4. 装备信息选择
5. 位置和备注
6. 确认提交

### 3. AchievementPanel - 成就面板

显示成就进度和解锁状态的面板组件。

```typescript
interface AchievementPanelProps {
  achievements: Achievement[];
  userProgress: UserAchievement[];
  onAchievementPress: (achievement: Achievement) => void;
  showProgress?: boolean;
  groupBy?: 'category' | 'status' | 'none';
}

// 使用示例
<AchievementPanel
  achievements={achievementData}
  userProgress={userAchievementData}
  onAchievementPress={showAchievementDetail}
  showProgress={true}
  groupBy="category"
/>
```

## 🎨 主题化组件

### ThemedText - 主题化文本组件

```typescript
interface ThemedTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
}

// 使用示例
<ThemedText type="title" lightColor="#000" darkColor="#FFF">
  鱼类图鉴
</ThemedText>
```

### ThemedView - 主题化视图组件

```typescript
interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
}

// 使用示例
<ThemedView lightColor="#F5F5F5" darkColor="#1A1A1A">
  {children}
</ThemedView>
```

## 📏 响应式设计

### 断点系统
```typescript
const breakpoints = {
  sm: 375,  // 小屏手机
  md: 414,  // 大屏手机
  lg: 768,  // 平板竖屏
  xl: 1024, // 平板横屏
};

// 使用示例
const numColumns = useBreakpoint({
  sm: 2,
  lg: 3,
  xl: 4,
});
```

### 响应式 Hook
```typescript
function useBreakpoint<T>(values: Record<string, T>): T {
  const { width } = useWindowDimensions();
  
  const sortedBreakpoints = Object.entries(breakpoints)
    .sort(([,a], [,b]) => b - a);
  
  for (const [key, breakpoint] of sortedBreakpoints) {
    if (width >= breakpoint && values[key] !== undefined) {
      return values[key];
    }
  }
  
  return values[Object.keys(values)[0]];
}
```

## 🔍 可访问性支持

### 通用可访问性属性
```typescript
interface AccessibilityProps {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  testID?: string;
}

// 在组件中的应用
<FishCard
  fish={fish}
  state="unlocked"
  accessibilityLabel={`${fish.name}, 已解锁`}
  accessibilityHint="点击查看详细信息"
  accessibilityRole="button"
  testID={`fish-card-${fish.id}`}
/>
```

### 对比度要求
- 普通文本: 至少 4.5:1
- 大文本(18px+): 至少 3:1  
- 图标和图形: 至少 3:1

### 触摸目标
- 最小触摸区域: 44×44 pt
- 交互元素间距: 至少 8pt

## 🧪 组件测试

### 单元测试示例
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { FishCard } from '../FishCard';

describe('FishCard', () => {
  const mockFish = {
    id: 'carp-1',
    name: '鲤鱼',
    rarity: 'common',
    images: { card: 'carp.jpg' }
  };

  it('renders unlocked fish correctly', () => {
    const { getByText, getByTestId } = render(
      <FishCard fish={mockFish} state="unlocked" />
    );
    
    expect(getByText('鲤鱼')).toBeTruthy();
    expect(getByTestId('fish-image')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <FishCard fish={mockFish} state="unlocked" onPress={onPress} />
    );
    
    fireEvent.press(getByTestId('fish-card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

## 📦 组件导出

### index.ts 导出文件
```typescript
// UI Components
export { FishCard } from './ui/FishCard';
export { Badge } from './ui/Badge';
export { ProgressBar } from './ui/ProgressBar';
export { FilterChip } from './ui/FilterChip';
export { IconSymbol } from './ui/IconSymbol';

// Screen Components
export { Heatmap } from './screens/Heatmap';
export { EmptyState } from './screens/EmptyState';
export { UnlockAnimation } from './screens/UnlockAnimation';

// Composite Components
export { FishdexGrid } from './FishdexGrid';
export { CatchLogForm } from './CatchLogForm';
export { AchievementPanel } from './AchievementPanel';

// Themed Components
export { ThemedText } from './ThemedText';
export { ThemedView } from './ThemedView';

// Types
export type { FishCardProps } from './ui/FishCard';
export type { BadgeProps } from './ui/Badge';
export type { ProgressBarProps } from './ui/ProgressBar';
```

---

**文档版本**: 1.0  
**最后更新**: 2024-09-01  
**维护者**: FishFlow 开发团队