function parseHex(color: string): [number, number, number] {
  const hex = color.replace('#', '');
  return [
    parseInt(hex.substr(0, 2), 16),
    parseInt(hex.substr(2, 2), 16),
    parseInt(hex.substr(4, 2), 16),
  ];
}

function parseRgb(
  color: string,
): [number, number, number, number] | null {
  const m = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
  );
  if (m) return [+m[1], +m[2], +m[3], m[4] !== undefined ? +m[4] : 1];
  return null;
}

function parse(color: string): [number, number, number, number] {
  if (color.startsWith('#')) {
    const [r, g, b] = parseHex(color);
    return [r, g, b, 1];
  }
  const rgb = parseRgb(color);
  if (rgb) return rgb;
  return [0, 0, 0, 1];
}

function clamp(v: number) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function toHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

function lighten(color: string, amount: number): string {
  const [r, g, b] = parse(color);
  const f = amount / 100;
  return toHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f);
}

function darken(color: string, amount: number): string {
  const [r, g, b] = parse(color);
  const f = 1 - amount / 100;
  return toHex(r * f, g * f, b * f);
}

function mixColors(
  color1: string,
  color2: string,
  amount: number,
): string {
  const [r1, g1, b1] = parse(color1);
  const [r2, g2, b2] = parse(color2);
  const f = amount / 100;
  return toHex(r1 + (r2 - r1) * f, g1 + (g2 - g1) * f, b1 + (b2 - b1) * f);
}

interface TinycolorInstance {
  lighten(amount: number): TinycolorInstance;
  darken(amount: number): TinycolorInstance;
  setAlpha(alpha: number): { toRgbString(): string };
  toRgbString(): string;
  toHexString(): string;
  toString(): string;
  clone(): TinycolorInstance;
}

function createInstance(color: string): TinycolorInstance {
  let [r, g, b, a] = parse(color);

  const toRgbStr = () =>
    a < 1
      ? `rgba(${clamp(r)}, ${clamp(g)}, ${clamp(b)}, ${a})`
      : `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;

  return {
    lighten(amount) {
      return createInstance(lighten(color, amount));
    },
    darken(amount) {
      return createInstance(darken(color, amount));
    },
    setAlpha(alpha) {
      a = alpha;
      return { toRgbString: toRgbStr };
    },
    toRgbString: toRgbStr,
    toHexString: () => toHex(r, g, b),
    toString: () => toHex(r, g, b),
    clone() {
      return createInstance(toHex(r, g, b));
    },
  };
}

export function tinycolor(color: string): TinycolorInstance {
  return createInstance(color);
}

tinycolor.mix = (color1: string, color2: string, amount: number) =>
  createInstance(mixColors(color1, color2, amount));
