import type { ThemeColors, ThemeSeed } from './types';

interface RGB {
  r: number;
  g: number;
  b: number;
  a?: number;
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const len = h.length;
  if (len === 8) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: parseInt(h.slice(6, 8), 16) / 255,
    };
  }
  if (len === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    clamp(r).toString(16).padStart(2, '0') +
    clamp(g).toString(16).padStart(2, '0') +
    clamp(b).toString(16).padStart(2, '0')
  );
}

function rgbaToHex(r: number, g: number, b: number, a: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const alpha = Math.max(0, Math.min(255, Math.round(a * 255)));
  return (
    '#' +
    clamp(r).toString(16).padStart(2, '0') +
    clamp(g).toString(16).padStart(2, '0') +
    clamp(b).toString(16).padStart(2, '0') +
    alpha.toString(16).padStart(2, '0')
  );
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return { h, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return rgbToHex(r * 255, g * 255, b * 255);
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function mixWithWhite(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

function mixWithBlack(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

export const generateThemeColors = ({
  colorPrimary,
  colorBg = '#ffffff',
  isDarkMode = false,
}: ThemeSeed): ThemeColors => {
  const colorPrimaryBg = generatePrimaryBg(colorPrimary, isDarkMode);
  const colorText = generateTextColor(colorBg, isDarkMode);
  const colorTextSecondary = generateSecondaryTextColor(colorText);
  const colorPrimaryText = generatePrimaryTextColor(colorPrimaryBg, isDarkMode);
  const colorBgElevated = generateElevatedBg(colorBg, isDarkMode);

  return {
    colorPrimary,
    colorPrimaryBg,
    colorPrimaryText,
    colorText,
    colorTextSecondary,
    colorWhite: '#ffffff',
    colorBg,
    colorBgElevated,
    isDarkMode,
  };
};

function generatePrimaryBg(primaryColor: string, isDarkMode: boolean): string {
  const { r, g, b } = hexToRgb(primaryColor);
  const alpha = isDarkMode ? 0.2 : 0.1;
  return rgbaToHex(r, g, b, alpha);
}

function generateTextColor(bgColor: string, isDarkMode: boolean): string {
  if (isDarkMode) return '#ffffff';
  const contrast = contrastRatio('#262626', bgColor);
  return contrast >= 7 ? '#262626' : '#000000';
}

function generateSecondaryTextColor(colorText: string): string {
  const { h, s, l } = hexToHsl(colorText);
  return hslToHex(h, s, Math.min(1, l + 0.2));
}

function generatePrimaryTextColor(colorPrimaryBg: string, isDarkMode: boolean): string {
  const darkContrast = contrastRatio('#262626', colorPrimaryBg);
  const lightContrast = contrastRatio('#ffffff', colorPrimaryBg);

  if (lightContrast >= 3.0) return '#ffffff';
  if (darkContrast >= 4.5) return '#262626';
  return '#ffffff';
}

function generateElevatedBg(bgColor: string, isDarkMode: boolean): string {
  if (isDarkMode) {
    return mixWithWhite(bgColor, 0.08);
  }
  const { l } = hexToHsl(bgColor);
  if (l > 0.95) return '#ffffff';
  return mixWithWhite(bgColor, 0.04);
}
