export type NumericalValue = number | string | undefined;
export type TextualValue = string | undefined;

export type BaseAttributes = {
  opacity?: NumericalValue;
  fill?: TextualValue;
  'fill-opacity'?: NumericalValue;
  stroke?: TextualValue;
  'stroke-opacity'?: NumericalValue;
};

export type IconAttributes = {
  id?: TextualValue;
  class?: TextualValue;
  x?: NumericalValue;
  y?: NumericalValue;
  width?: NumericalValue;
  height?: NumericalValue;
  href?: TextualValue;
  fill?: TextualValue;
  'fill-opacity'?: NumericalValue;
  opacity?: NumericalValue;
};

export type TextAttributes = {
  id?: TextualValue;
  class?: TextualValue;
  x?: NumericalValue;
  y?: NumericalValue;
  width?: NumericalValue;
  height?: NumericalValue;
  'font-family'?: TextualValue;
  'font-size'?: NumericalValue;
  'font-weight'?: NumericalValue;
  'font-style'?: TextualValue;
  'font-variant'?: TextualValue;
  'letter-spacing'?: NumericalValue;
  'line-height'?: NumericalValue;
  fill?: TextualValue;
  stroke?: TextualValue;
  'stroke-width'?: NumericalValue;
  'text-anchor'?: TextualValue;
  'dominant-baseline'?: TextualValue;
};

export type ShapeAttributes = {
  opacity?: NumericalValue;
  fill?: TextualValue;
  'fill-opacity'?: NumericalValue;
  'fill-rule'?: 'nonzero' | 'evenodd' | 'inherit' | undefined;
  stroke?: TextualValue;
  'stroke-width'?: NumericalValue;
  'stroke-linecap'?: TextualValue;
  'stroke-linejoin'?: TextualValue;
  'stroke-dasharray'?: NumericalValue;
  'stroke-dashoffset'?: NumericalValue;
  'stroke-opacity'?: NumericalValue;
};

export type Palette =
  | string
  | string[]
  | ((ratio: number, index: number, count: number) => string);

export type StylizeConfig =
  | { type: 'rough'; roughness?: number; bowing?: number; fillWeight?: number; hachureGap?: number }
  | { type: 'pattern'; pattern: string; backgroundColor?: string | null; foregroundColor?: string | null; scale?: number | null }
  | { type: 'linear-gradient'; colors?: string[] | { color: string; offset: string }[]; angle?: number }
  | { type: 'radial-gradient'; colors?: string[] | { color: string; offset: string }[] };

export type DynamicAttributes<T extends object> = {
  [key in keyof T]?:
    | T[key]
    | ((value: T[key], node: SVGElement) => T[key] | undefined);
};

export interface ThemeConfig {
  colorBg?: string;
  colorPrimary?: string;
  base?: {
    global?: DynamicAttributes<BaseAttributes>;
    shape?: ShapeAttributes;
    text?: TextAttributes;
  };
  palette?: Palette;
  title?: TextAttributes;
  desc?: TextAttributes;
  shape?: ShapeAttributes;
  item?: {
    icon?: DynamicAttributes<IconAttributes>;
    label?: DynamicAttributes<TextAttributes>;
    desc?: DynamicAttributes<TextAttributes>;
    value?: DynamicAttributes<TextAttributes>;
    shape?: DynamicAttributes<ShapeAttributes>;
  };
  stylize?: StylizeConfig | null;
  elements?: Record<string, ShapeAttributes | TextAttributes>;
}

export interface ThemeSeed {
  colorPrimary: string;
  colorBg?: string;
  isDarkMode?: boolean;
}

export interface ThemeColors {
  colorPrimary: string;
  colorPrimaryBg: string;
  colorPrimaryText: string;
  colorText: string;
  colorTextSecondary: string;
  colorWhite: string;
  colorBg: string;
  colorBgElevated: string;
  isDarkMode: boolean;
}
