import { themes, ThemeName } from '@/lib/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof themes.light.colors
) {
  const scheme = useColorScheme() ?? 'light';
  const colorFromProps = props[scheme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return themes[scheme].colors[colorName];
  }
}

export function useTheme() {
  const scheme = useColorScheme() ?? 'light';
  return themes[scheme];
}
