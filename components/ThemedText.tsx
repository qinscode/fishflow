import { Text, type TextProps } from 'react-native';
import { useThemeColor, useTheme } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'subtitle' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label' | 'button' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const getTypeStyle = () => {
    switch (type) {
      case 'h1':
        return theme.typography.h1;
      case 'h2':
        return theme.typography.h2;
      case 'h3':
        return theme.typography.h3;
      case 'title':
        return theme.typography.title;
      case 'subtitle':
        return theme.typography.subtitle;
      case 'body':
        return theme.typography.body;
      case 'bodySmall':
        return theme.typography.bodySmall;
      case 'caption':
        return theme.typography.caption;
      case 'label':
        return theme.typography.label;
      case 'button':
        return theme.typography.button;
      case 'link':
        return { ...theme.typography.body, color: theme.colors.primary };
      default:
        return theme.typography.body;
    }
  };

  return (
    <Text
      style={[
        { color },
        getTypeStyle(),
        style,
      ]}
      {...rest}
    />
  );
}
