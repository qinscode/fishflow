import { TextStyle } from 'react-native';

export interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
}

export interface Spacing {
  xs: number;    // 4
  sm: number;    // 8
  md: number;    // 16
  lg: number;    // 24
  xl: number;    // 32
  xxl: number;   // 48
}

export interface BorderRadius {
  xs: number;    // 2
  sm: number;    // 4
  md: number;    // 8
  lg: number;    // 12
  xl: number;    // 16
  xxl: number;   // 20
  full: number;  // 9999
}

export interface Typography {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  title: TextStyle;
  subtitle: TextStyle;
  body: TextStyle;
  bodySmall: TextStyle;
  caption: TextStyle;
  label: TextStyle;
  button: TextStyle;
}

export interface Theme {
  name: string;
  colors: Colors;
  spacing: Spacing;
  borderRadius: BorderRadius;
  typography: Typography;
  shadows: {
    sm: object;
    md: object;
    lg: object;
  };
}

// 浅色主题
export const lightTheme: Theme = {
  name: 'light',
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    accent: '#FF9500',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1C1C1E',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    tint: '#007AFF',
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#007AFF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 38,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 30,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 26,
      letterSpacing: -0.2,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 22,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 22,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    label: {
      fontSize: 11,
      fontWeight: '500',
      lineHeight: 15,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    } as TextStyle,
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

// 深色主题
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    accent: '#FF9F0A',
    background: '#000000',
    surface: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textDisabled: '#6B7280',
    border: '#3A3A3C',
    borderLight: '#2C2C2E',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    tint: '#0A84FF',
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#0A84FF',
  },
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  typography: lightTheme.typography,
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

// 主题映射
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ThemeName = keyof typeof themes;