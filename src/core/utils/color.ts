// ============================================================================
// Color Utilities
// ============================================================================

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

const HEX_REGEX = /^#?([a-f\d]{3,4}|[a-f\d]{6}|[a-f\d]{8})$/i;

export function parseHex(hex: string): RGB | null {
  const match = hex.match(HEX_REGEX);
  if (!match) return null;

  let hexStr = match[1];
  if (hexStr.length === 3 || hexStr.length === 4) {
    hexStr =
      hexStr[0] +
      hexStr[0] +
      hexStr[1] +
      hexStr[1] +
      hexStr[2] +
      hexStr[2];
  }

  const r = parseInt(hexStr.slice(0, 2), 16);
  const g = parseInt(hexStr.slice(2, 4), 16);
  const b = parseInt(hexStr.slice(4, 6), 16);

  return { r, g, b };
}

export function toHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function isValidColor(color: string): boolean {
  if (!color) return false;
  if (color === 'none' || color === 'transparent') return true;
  return HEX_REGEX.test(color) || /^rgba?\(|^hsla?\(/.test(color);
}

export function isDark(color: string): boolean {
  const rgb = parseHex(color);
  if (!rgb) return false;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance < 0.5;
}

export function lighten(color: string, amount: number): string {
  const hsl = toHsl(color);
  hsl.l = Math.min(100, hsl.l + amount);
  return fromHsl(hsl.h, hsl.s, hsl.l);
}

export function darken(color: string, amount: number): string {
  const hsl = toHsl(color);
  hsl.l = Math.max(0, hsl.l - amount);
  return fromHsl(hsl.h, hsl.s, hsl.l);
}

export function setAlpha(color: string, alpha: number): string {
  const rgb = parseHex(color);
  if (!rgb) return color;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function toRgba(color: string, alpha: number = 1): string {
  const rgb = parseHex(color);
  if (!rgb) return color;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function toHsl(color: string): HSL {
  const rgb = parseHex(color);
  if (!rgb) return { h: 0, s: 0, l: 0 };

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function fromHsl(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return toHex(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  );
}

export function mix(
  color1: string,
  color2: string,
  weight: number,
): string {
  const rgb1 = parseHex(color1);
  const rgb2 = parseHex(color2);
  if (!rgb1 || !rgb2) return color1;

  const w = weight / 100;
  const r = Math.round(rgb1.r * (1 - w) + rgb2.r * w);
  const g = Math.round(rgb1.g * (1 - w) + rgb2.g * w);
  const b = Math.round(rgb1.b * (1 - w) + rgb2.b * w);

  return toHex(r, g, b);
}
