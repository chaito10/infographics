import type { ParsedInfographicOptions } from '../../types';
import { generateThemeColors } from '../../themes';

export {
  parseHex,
  toHex,
  isValidColor,
  isDark,
  lighten,
  darken,
  setAlpha,
  toRgba,
  toHsl,
  fromHsl,
  mix,
} from '../../utils/color';

export type { RGB, HSL } from '../../utils/color';

const DEFAULT_COLOR = '#FF356A';

function isDarkColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

export function getColorPrimary(options: ParsedInfographicOptions) {
  return options?.themeConfig?.colorPrimary || DEFAULT_COLOR;
}

export function getPaletteColors(options: ParsedInfographicOptions): string[] {
  const { themeConfig = {}, data } = options;
  const { colorPrimary, palette } = themeConfig;

  if (!palette || palette.length === 0) {
    return Array(data?.items?.length || 1).fill(colorPrimary || DEFAULT_COLOR);
  }

  return data.items.map(
    (_, i) =>
      getPaletteColor(palette, [i], data.items.length) || DEFAULT_COLOR,
  );
}

export function getPaletteColor(
  palette: any,
  indexes: number[],
  totalCount?: number,
): string | undefined {
  if (!palette) return undefined;

  if (typeof palette === 'function') {
    const depth = indexes.length;
    const ratio = depth > 0 ? indexes[depth - 1] / Math.max(1, (totalCount || 1) - 1) : 0;
    return palette(ratio, indexes[indexes.length - 1] || 0, totalCount || 1);
  }

  if (Array.isArray(palette)) {
    if (palette.length === 0) return undefined;
    const idx = indexes[indexes.length - 1] || 0;
    return palette[idx % palette.length];
  }

  if (typeof palette === 'string') {
    return palette;
  }

  return undefined;
}

export function getThemeColors(
  colors: {
    colorPrimary?: string;
    colorBg?: string;
  },
  options?: ParsedInfographicOptions,
) {
  const {
    colorBg = options?.themeConfig?.colorBg || 'white',
    colorPrimary = options ? getColorPrimary(options) : 'black',
  } = colors;
  return generateThemeColors({
    colorPrimary: colorPrimary,
    isDarkMode: isDarkColor(colorBg),
    colorBg: colorBg,
  });
}
