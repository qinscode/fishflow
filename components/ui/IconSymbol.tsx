import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
type IoniconsIconName = ComponentProps<typeof Ionicons>['name'];

type IconMapping = Record<string, {
  type: 'material' | 'ionicons';
  name: MaterialIconName | IoniconsIconName;
}>;

/**
 * SF Symbols to Material Icons/Ionicons mappings for FishFlow app.
 */
const MAPPING: IconMapping = {
  // Fish and Marine Life
  'fish.fill': { type: 'ionicons', name: 'fish' },
  'fish': { type: 'ionicons', name: 'fish-outline' },
  
  // Navigation
  'house.fill': { type: 'ionicons', name: 'home' },
  'house': { type: 'ionicons', name: 'home-outline' },
  'book.fill': { type: 'ionicons', name: 'book' },
  'book': { type: 'ionicons', name: 'book-outline' },
  'plus.circle.fill': { type: 'ionicons', name: 'add-circle' },
  'plus.circle': { type: 'ionicons', name: 'add-circle-outline' },
  'trophy.fill': { type: 'ionicons', name: 'trophy' },
  'trophy': { type: 'ionicons', name: 'trophy-outline' },
  'chart.bar.fill': { type: 'ionicons', name: 'bar-chart' },
  'chart.bar': { type: 'ionicons', name: 'bar-chart-outline' },
  
  // Functions
  'camera.fill': { type: 'ionicons', name: 'camera' },
  'camera': { type: 'ionicons', name: 'camera-outline' },
  'location.fill': { type: 'ionicons', name: 'location' },
  'location': { type: 'ionicons', name: 'location-outline' },
  'magnifyingglass': { type: 'ionicons', name: 'search' },
  'line.3.horizontal.decrease': { type: 'ionicons', name: 'filter' },
  'arrow.up.arrow.down': { type: 'material', name: 'sort' },
  
  // Status
  'lock.fill': { type: 'ionicons', name: 'lock-closed' },
  'lock.open.fill': { type: 'ionicons', name: 'lock-open' },
  'sparkles': { type: 'ionicons', name: 'sparkles' },
  'star.fill': { type: 'ionicons', name: 'star' },
  'star': { type: 'ionicons', name: 'star-outline' },
  'heart.fill': { type: 'ionicons', name: 'heart' },
  'heart': { type: 'ionicons', name: 'heart-outline' },
  
  // Weather
  'sun.max.fill': { type: 'ionicons', name: 'sunny' },
  'cloud.fill': { type: 'ionicons', name: 'cloudy' },
  'cloud.drizzle.fill': { type: 'ionicons', name: 'rainy' },
  'cloud.rain.fill': { type: 'ionicons', name: 'rainy' },
  'cloud.bolt.rain.fill': { type: 'ionicons', name: 'thunderstorm' },
  'cloud.fog.fill': { type: 'material', name: 'fog' },
  'wind': { type: 'material', name: 'air' },
  
  // Tools and Measurements
  'ruler': { type: 'material', name: 'straighten' },
  'scalemass.fill': { type: 'material', name: 'scale' },
  'timer': { type: 'ionicons', name: 'timer' },
  'calendar': { type: 'ionicons', name: 'calendar' },
  
  // Water and Environment
  'water': { type: 'ionicons', name: 'water' },
  'water.waves': { type: 'material', name: 'waves' },
  'drop': { type: 'ionicons', name: 'water' },
  'flame.fill': { type: 'ionicons', name: 'flame' },
  
  // Settings and Actions
  'gearshape.fill': { type: 'ionicons', name: 'settings' },
  'person.fill': { type: 'ionicons', name: 'person' },
  'eye.slash.fill': { type: 'ionicons', name: 'eye-off' },
  'square.and.arrow.up': { type: 'ionicons', name: 'share' },
  'chevron.right': { type: 'ionicons', name: 'chevron-forward' },
  'chevron.left': { type: 'ionicons', name: 'chevron-back' },
  
  // Numbers and Text
  'number': { type: 'material', name: 'numbers' },
  'textformat': { type: 'material', name: 'text-fields' },
  
  // Misc
  'checkmark.circle.fill': { type: 'ionicons', name: 'checkmark-circle' },
  'xmark.circle.fill': { type: 'ionicons', name: 'close-circle' },
  'exclamationmark.triangle.fill': { type: 'ionicons', name: 'warning' },
  'info.circle.fill': { type: 'ionicons', name: 'information-circle' },
};

/**
 * An icon component that uses Material Icons and Ionicons for consistent cross-platform icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: keyof typeof MAPPING;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconConfig = MAPPING[name];
  
  if (!iconConfig) {
    console.warn(`IconSymbol: No mapping found for "${name}"`);
    return null;
  }

  if (iconConfig.type === 'ionicons') {
    return (
      <Ionicons
        name={iconConfig.name as IoniconsIconName}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  return (
    <MaterialIcons
      name={iconConfig.name as MaterialIconName}
      size={size}
      color={color}
      style={style}
    />
  );
}

export { MAPPING };
