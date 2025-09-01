import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';
import { BREAKPOINTS } from '../lib/constants';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  gridColumns: number;
  fontSize: {
    small: number;
    body: number;
    title: number;
    h3: number;
    h2: number;
    h1: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  
  return useMemo(() => {
    const isLandscape = width > height;
    const isSmall = width < BREAKPOINTS.sm;
    const isMedium = width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg;
    const isLarge = width >= BREAKPOINTS.lg;
    const isTablet = width >= BREAKPOINTS.lg;
    
    // 响应式网格列数
    const gridColumns = isTablet ? 3 : 2;
    
    // 响应式字体大小
    const fontScale = isSmall ? 0.9 : isTablet ? 1.1 : 1;
    const fontSize = {
      small: Math.round(12 * fontScale),
      body: Math.round(16 * fontScale),
      title: Math.round(18 * fontScale),
      h3: Math.round(20 * fontScale),
      h2: Math.round(24 * fontScale),
      h1: Math.round(32 * fontScale),
    };
    
    // 响应式间距
    const spacingScale = isTablet ? 1.2 : 1;
    const spacing = {
      xs: Math.round(4 * spacingScale),
      sm: Math.round(8 * spacingScale),
      md: Math.round(16 * spacingScale),
      lg: Math.round(24 * spacingScale),
      xl: Math.round(32 * spacingScale),
    };
    
    return {
      width,
      height,
      isSmall,
      isMedium,
      isLarge,
      isTablet,
      isLandscape,
      gridColumns,
      fontSize,
      spacing,
    };
  }, [width, height]);
}

// 断点Hook
export function useBreakpoint<T>(values: {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default?: T;
}): T | undefined {
  const { width } = useWindowDimensions();
  
  return useMemo(() => {
    if (width >= BREAKPOINTS.xl && values.xl !== undefined) {
      return values.xl;
    }
    if (width >= BREAKPOINTS.lg && values.lg !== undefined) {
      return values.lg;
    }
    if (width >= BREAKPOINTS.md && values.md !== undefined) {
      return values.md;
    }
    if (width >= BREAKPOINTS.sm && values.sm !== undefined) {
      return values.sm;
    }
    return values.default;
  }, [width, values]);
}