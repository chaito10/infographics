import type { Font } from '../../types';
import {
  decodeFontFamily,
  encodeFontFamily,
  splitFontFamily,
} from '../../utils';

const FONT_REGISTRY: Map<string, Font> = new Map();

export let DEFAULT_FONT = 'Alibaba PuHuiTi';

export function getFont(font: string) {
  const families = splitFontFamily(font);
  for (const family of families) {
    const fontObj = FONT_REGISTRY.get(decodeFontFamily(family));
    if (fontObj) return fontObj;
  }
  return null;
}

export function getFonts() {
  return Array.from(FONT_REGISTRY.values());
}

export function setDefaultFont(font: string) {
  DEFAULT_FONT = encodeFontFamily(font);
}

/**
 * Register a custom font.
 * @param font - Font configuration
 * @returns The registered font configuration
 */
export function registerFont(font: Font): Font {
  const f = { ...font };
  FONT_REGISTRY.set(f.fontFamily, f);
  f.fontFamily = encodeFontFamily(f.fontFamily);
  return f;
}

export function unregisterFont(font: string) {
  const fontObj = getFont(font);
  if (!fontObj) return null;
  FONT_REGISTRY.delete(decodeFontFamily(fontObj.fontFamily));
  return fontObj;
}
