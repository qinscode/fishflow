import { View, type ViewProps } from 'react-native';

import { useThemeColor, useTheme } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'surface' | 'card';
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme();
  const themeColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background'
  );

  const getBackgroundColor = () => {
    if (lightColor || darkColor) {
      return themeColor;
    }

    switch (type) {
      case 'surface':
        return theme.colors.surface;
      case 'card':
        return theme.colors.card;
      default:
        return theme.colors.background;
    }
  };

  const backgroundColor = getBackgroundColor();

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
