import type {
  Data,
  DesignOptions,
  ItemDatum,
  ParsedData,
  ParsedDesignsOptions,
  Padding,
  ParsedPadding,
  ThemeConfig,
} from './types';

// ============================================================================
// Options Types (re-exported)
// ============================================================================

export type { InfographicOptions, ParsedInfographicOptions, SVGOptions } from './types';

import type { InfographicOptions, ParsedInfographicOptions } from './types';

// ============================================================================
// Registry Imports (use real registries where available)
// ============================================================================

import { getItem as getRegisteredItem } from './designs/items';
import { getStructure as getRegisteredStructure } from './designs/structures';
import { generateThemeColors as generateThemeColorsRaw } from './themes';
import { getTheme as getRegisteredTheme } from './themes';
import { getPaletteColor as getRegisteredPaletteColor } from './designs/utils';
import { Title as DefaultTitle } from './designs/title/Title';
import { getTemplate } from './templates/registry';
import './templates'; // side-effect: registers all built-in templates

// ============================================================================
// Utility Functions
// ============================================================================

function parsePadding(padding: Padding): ParsedPadding {
  if (typeof padding === 'number') {
    return [padding, padding, padding, padding];
  }
  if (Array.isArray(padding)) {
    switch (padding.length) {
      case 1:
        return [padding[0], padding[0], padding[0], padding[0]];
      case 2:
        return [padding[0], padding[1], padding[0], padding[1]];
      case 3:
        return [padding[0], padding[1], padding[2], padding[1]];
      case 4:
        return [padding[0], padding[1], padding[2], padding[3]];
      default:
        return [0, 0, 0, 0];
    }
  }
  return [0, 0, 0, 0];
}

function merge(target: Record<string, any>, ...sources: any[]): Record<string, any> {
  for (const source of sources) {
    if (!source) continue;
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        merge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

function isNonNullableParsedDesignsOptions(
  value: any,
): value is ParsedDesignsOptions {
  return value !== null && value !== undefined && typeof value === 'object';
}

function isDarkColor(color: string): boolean {
  const hex = color.replace('#', '');
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  }
  if (hex.length >= 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  }
  return false;
}

// ============================================================================
// Design Parsing
// ============================================================================

function normalizeWithType<T extends { type: string }>(obj: string | T): T {
  if (typeof obj === 'string') return { type: obj } as T;
  if (!('type' in obj)) throw new Error('Type is required');
  return obj as T;
}

function getStructure(type: string): any {
  // Direct match first
  let s = getRegisteredStructure(type);
  if (s) return s;
  // Prefix match: "list-row-simple-horizontal-arrow" -> try "list-row", "list-row-simple", etc.
  const parts = type.split('-');
  for (let i = parts.length - 1; i >= 1; i--) {
    const key = parts.slice(0, i).join('-');
    s = getRegisteredStructure(key);
    if (s) return s;
  }
  return null;
}

function getItem(type: string): any {
  return getRegisteredItem(type);
}

function Title(props: any): any {
  return DefaultTitle(props);
}

function generateThemeColors(options: {
  colorPrimary: string;
  isDarkMode: boolean;
  colorBg: string;
}): Record<string, any> {
  return generateThemeColorsRaw(options);
}

function getPaletteColor(
  palette: any,
  index: number,
  total: number | undefined,
): string | undefined {
  return getRegisteredPaletteColor(palette, [index], total);
}

// ============================================================================
// Options Parser
// ============================================================================

function parseDesign(
  config: DesignOptions,
  options: Partial<InfographicOptions>,
): NullableParsedDesignsOptions {
  const { structure, title, item, items } = config || {};
  const defaultItem = parseDesignItem(item || items?.[0], options);
  return {
    structure: parseDesignStructure(structure),
    title: parseDesignTitle(title, options),
    item: defaultItem,
    items: !items
      ? [defaultItem]
      : items.map((item) => parseDesignItem(item, options)),
  };
}

type NullableParsedDesignsOptions = {
  [K in keyof ParsedDesignsOptions]: ParsedDesignsOptions[K] | null;
};

function parseDesignStructure(
  config: DesignOptions['structure'],
): ParsedDesignsOptions['structure'] | null {
  if (!config) return null;
  const { type, ...userProps } = normalizeWithType(config);
  const structure = getStructure(type);
  if (!structure) return null;
  const { component } = structure;
  return {
    ...structure,
    component: (props: any) => component({ ...props, ...userProps }),
  };
}

function parseDesignTitle(
  config: DesignOptions['title'],
  options: Partial<InfographicOptions>,
): ParsedDesignsOptions['title'] {
  if (!config) return { component: null };
  const { type, ...userProps } = normalizeWithType(config);

  const { themeConfig } = options;
  const background = themeConfig?.colorBg || '#fff';
  const themeColors = generateColors(background, background);
  return {
    component: (props: any) =>
      Title({ ...props, themeColors, ...userProps }),
  };
}

function parseDesignItem(
  config: DesignOptions['item'],
  options: Partial<InfographicOptions>,
): ParsedDesignsOptions['item'] | null {
  if (!config) return null;
  const { type, ...userProps } = normalizeWithType(config);
  const item = getItem(type);
  if (!item) return null;
  const { component, options: itemOptions } = item;
  return {
    ...item,
    component: (props: any) => {
      const { indexes } = props;
      const { data, themeConfig } = options;
      const background = themeConfig?.colorBg || '#fff';

      const {
        themeColors = generateColors(
          getPaletteColor(themeConfig?.palette, indexes, data?.items?.length) ||
            themeConfig?.colorPrimary ||
            '#FF356A',
          background,
        ),
        ...restProps
      } = props;

      return component({
        themeColors,
        ...restProps,
        ...userProps,
      });
    },
    options: itemOptions,
  };
}

function generateColors(colorPrimary: string, background: string = '#fff') {
  return generateThemeColors({
    colorPrimary,
    isDarkMode: isDarkColor(background),
    colorBg: background,
  });
}

function parseTheme(
  theme: string | undefined,
  themeConfig: ThemeConfig = {},
): ThemeConfig {
  const base = theme ? (getRegisteredTheme(theme) as any as ThemeConfig) || {} : {};
  const parsedThemeConfig = merge({}, base, themeConfig) as ThemeConfig;
  parsedThemeConfig.palette = themeConfig.palette || base.palette;
  parsedThemeConfig.stylize = themeConfig.stylize ?? base.stylize;

  if (!parsedThemeConfig.colorPrimary) {
    parsedThemeConfig.colorPrimary = '#FF356A';
  }
  if (!parsedThemeConfig.palette) {
    parsedThemeConfig.palette = [parsedThemeConfig.colorPrimary];
  }
  return parsedThemeConfig;
}

// ============================================================================
// Public API
// ============================================================================

export function parseData(
  data?: Data,
  template?: string,
): ParsedData | undefined {
  if (!data) return undefined;
  if (Array.isArray(data.items) && data.items.length) return data as ParsedData;

  const { lists, sequences, compares, nodes, values, root } =
    data as ParsedData;
  const getPreferredData = (): ItemDatum[] | null => {
    if (!template) return null;
    const DATA_MAP: Record<string, ItemDatum[]> = {
      list: lists,
      sequence: sequences,
      compare: compares,
      relation: nodes,
      chart: values,
      hierarchy: root ? [root] : [],
    };
    const prefix = template.split('-')[0];
    const arr = DATA_MAP[prefix];
    return arr?.length ? arr : null;
  };
  const getPolyfillData = (): ItemDatum[] => {
    if (lists?.length) return lists;
    if (sequences?.length) return sequences;
    if (compares?.length) return compares;
    if (nodes?.length) return nodes;
    if (values?.length) return values;
    if (root) return [root];
    if (data.items?.length) return data.items;
    return [];
  };

  let items = getPreferredData() || getPolyfillData();

  if (items === sequences && data.order === 'desc') {
    items = [...items].reverse();
  }

  return { ...data, items } as ParsedData;
}

export function parseOptions(
  options: Partial<InfographicOptions>,
): Partial<ParsedInfographicOptions> {
  const {
    container = '#container',
    padding = 0,
    template,
    design,
    theme,
    themeConfig,
    data,
    ...restOptions
  } = options;

  let parsedContainer: Element | ShadowRoot | null = null;
  if (typeof container === 'string') {
    if (typeof document !== 'undefined') {
      parsedContainer = document.querySelector(container);
    }
    if (!parsedContainer && typeof document !== 'undefined') {
      parsedContainer = document.createElement('div');
    }
    if (!parsedContainer) {
      parsedContainer = { querySelector: () => null } as any;
    }
  } else {
    parsedContainer = container as Element | ShadowRoot;
  }

  const templateOptions: any | undefined = template ? getTemplate(template) : undefined;
  const mergedThemeConfig = merge(
    {},
    templateOptions?.themeConfig,
    themeConfig,
  );
  const resolvedThemeConfig =
    theme || themeConfig || templateOptions?.themeConfig
      ? parseTheme(theme, mergedThemeConfig)
      : undefined;

  const parsed: Partial<ParsedInfographicOptions> = {
    container: parsedContainer as Element | ShadowRoot,
    padding: parsePadding(padding),
  };

  if (templateOptions) {
    const { design: templateDesign, ...restTemplateOptions } = templateOptions;
    Object.assign(parsed, restTemplateOptions);
  }

  Object.assign(parsed, restOptions);

  const parsedData = parseData(data, template);
  if (parsedData) parsed.data = parsedData;

  if (template) parsed.template = template;
  if (templateOptions?.design || design) {
    const designOptions = {
      ...(resolvedThemeConfig
        ? { ...options, themeConfig: resolvedThemeConfig }
        : options),
      data: parsedData || data,
    };
    const parsedDesign = parseDesign(
      { ...templateOptions?.design, ...design },
      designOptions,
    );

    if (isNonNullableParsedDesignsOptions(parsedDesign)) {
      parsed.design = parsedDesign;
    }
  }
  if (theme) parsed.theme = theme;
  if (resolvedThemeConfig) {
    parsed.themeConfig = resolvedThemeConfig;
  }
  return parsed;
}
