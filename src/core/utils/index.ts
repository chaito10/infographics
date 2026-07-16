// ============================================================================
// SVG Utilities
// ============================================================================

import {
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
} from './color';

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
};

export type { RGB, HSL } from './color';

export function createElement<T extends SVGElement = SVGElement>(
  tagName: string,
  attributes: Record<string, any> = {},
) {
  const element = document.createElementNS(
    'http://www.w3.org/2000/svg',
    tagName,
  ) as T;

  setAttributes(element, attributes);

  return element;
}

export function parseSVG<T extends SVGElement = SVGSVGElement>(
  svg: string,
): T | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');

  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error('Invalid SVG string');
  }

  return doc.documentElement as unknown as T;
}

export function setAttributes(element: SVGElement, attrs: Record<string, any>) {
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, value);
    }
  });
}

export function getAttributes(
  element: SVGElement,
  attrs: readonly string[],
  ignoreEmpty = true,
) {
  return attrs.reduce(
    (acc, attr) => {
      const value = element.getAttribute(attr);
      if (
        !ignoreEmpty ||
        (value !== null && value !== '' && value !== undefined)
      ) {
        acc[attr] = value;
      }
      return acc;
    },
    {} as Record<string, string | null>,
  );
}

export function removeAttributes(element: SVGElement, attrs: string[]) {
  attrs.forEach((attr) => {
    element.removeAttribute(attr);
  });
}

export function traverse(
  node: SVGElement,
  callback: <T extends SVGElement = SVGElement>(child: T) => boolean | void,
) {
  if (callback(node as SVGElement) === false) return;

  const children = Array.from(node.children);
  children.forEach((child) => {
    traverse(child as SVGElement, callback);
  });
}

export function getOrCreateDefs(
  svg: SVGSVGElement,
  defsId: string = 'infographic-defs',
): SVGDefsElement {
  const selector = defsId ? `defs#${defsId}` : 'defs';
  const defs = svg.querySelector<SVGDefsElement>(selector);

  if (defs) return defs;
  const newDefs = createElement<SVGDefsElement>('defs');
  if (defsId) newDefs.id = defsId;
  svg.prepend(newDefs);
  return newDefs;
}

// ============================================================================
// ViewBox Utilities
// ============================================================================

export function getViewBox(svg: SVGSVGElement) {
  const viewBox = svg.getAttribute('viewBox');
  if (viewBox) {
    const [x, y, width, height] = viewBox.split(' ').map(Number);
    return { x, y, width, height };
  }
  const widthStr = svg.getAttribute('width');
  const heightStr = svg.getAttribute('height');
  const width = Number(widthStr) || 0;
  const height = Number(heightStr) || 0;
  return { x: 0, y: 0, width, height };
}

export function calculateZoomedViewBox(
  current: { x: number; y: number; width: number; height: number },
  factor: number,
  pivot: { x: number; y: number },
) {
  const newWidth = current.width * factor;
  const newHeight = current.height * factor;

  const newX = pivot.x - (pivot.x - current.x) * factor;
  const newY = pivot.y - (pivot.y - current.y) * factor;

  return { x: newX, y: newY, width: newWidth, height: newHeight };
}

export function viewBoxToString(box: {
  x: number;
  y: number;
  width: number;
  height: number;
}): string {
  return `${box.x} ${box.y} ${box.width} ${box.height}`;
}

// ============================================================================
// Padding Utilities
// ============================================================================

import type { Padding, ParsedPadding } from '../types';
import { isNode } from './is-node';

export function parsePadding(padding: Padding | undefined): ParsedPadding {
  if (!padding) return [0, 0, 0, 0];
  if (typeof padding === 'number') {
    return [padding, padding, padding, padding];
  }
  if (padding.length === 1) {
    return [padding[0], padding[0], padding[0], padding[0]];
  }
  if (padding.length === 2) {
    return [padding[0], padding[1], padding[0], padding[1]];
  }
  if (padding.length === 3) {
    return [padding[0], padding[1], padding[2], padding[1]];
  }
  if (padding.length === 4) {
    return [padding[0], padding[1], padding[2], padding[3]];
  }
  return [0, 0, 0, 0];
}

export function setSVGPadding(svg: SVGSVGElement, padding: ParsedPadding) {
  if (isNode) {
    setSVGPaddingInNode(svg, padding);
  } else {
    if (svg.isConnected) {
      setSVGPaddingInBrowser(svg, padding);
    } else {
      try {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node === svg || node.contains(svg)) {
                waitForLayout(svg, () => {
                  setSVGPaddingInBrowser(svg, padding);
                });

                observer.disconnect();
              }
            });
          });
        });

        observer.observe(document, {
          childList: true,
          subtree: true,
        });
      } catch {
        setSVGPaddingInNode(svg, padding);
      }
    }
  }
}

function setSVGPaddingInNode(svg: SVGSVGElement, padding: ParsedPadding) {
  const viewBox = getViewBox(svg);
  const [top, right, bottom, left] = padding;

  setAttributes(svg, {
    viewBox: `${viewBox.x - left} ${viewBox.y - top} ${
      viewBox.width + left + right
    } ${viewBox.height + top + bottom}`,
  });
}

export function getBoundViewBox(
  svg: SVGSVGElement,
  padding: ParsedPadding,
): string {
  const bbox = svg.getBBox();
  const clientRect = svg.getBoundingClientRect();
  const scaleX = clientRect.width > 0 ? bbox.width / clientRect.width : 1;
  const scaleY = clientRect.height > 0 ? bbox.height / clientRect.height : 1;

  const [topPx, rightPx, bottomPx, leftPx] = padding;
  const topSvg = topPx * scaleY;
  const rightSvg = rightPx * scaleX;
  const bottomSvg = bottomPx * scaleY;
  const leftSvg = leftPx * scaleX;

  const newX = bbox.x - leftSvg;
  const newY = bbox.y - topSvg;
  const newWidth = bbox.width + leftSvg + rightSvg;
  const newHeight = bbox.height + topSvg + bottomSvg;

  return `${newX} ${newY} ${newWidth} ${newHeight}`;
}

function setSVGPaddingInBrowser(svg: SVGSVGElement, padding: ParsedPadding) {
  const viewBox = getBoundViewBox(svg, padding);
  setAttributes(svg, {
    viewBox,
  });
}

function waitForLayout(element: SVGSVGElement, callback: () => void) {
  requestAnimationFrame(() => {
    const check = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        callback();
      } else {
        requestAnimationFrame(check);
      }
    };
    check();
  });
}

// ============================================================================
// Color Utilities
// ============================================================================

export function hasColor(fill?: string | null): boolean {
  if (!fill) return false;
  const normalizedFill = fill.trim().toLowerCase();
  if (
    normalizedFill === 'none' ||
    normalizedFill === 'transparent' ||
    normalizedFill === ''
  ) {
    return false;
  }
  return true;
}

// ============================================================================
// Element Role Utilities
// ============================================================================

export function setElementRole(
  element: SVGElement | HTMLElement,
  role: string,
) {
  element.setAttribute('data-element-type', role);
}

export function getElementByRole(
  element: SVGElement | HTMLElement,
  role: string,
) {
  return element.querySelector(`[data-element-type="${role}"]`);
}

// ============================================================================
// Common Attributes
// ============================================================================

export function getCommonAttrs<T extends Record<string, any>>(attrs: T[]) {
  return Object.keys(attrs[0]).reduce((acc, key) => {
    const k = key as keyof T;
    if (attrs.every((attr) => attr[k] === attrs[0][k])) {
      acc[k] = attrs[0][k];
    }
    return acc;
  }, {} as T);
}

// ============================================================================
// UUID
// ============================================================================

export function uuid() {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================================================
// Hash
// ============================================================================

export function getSimpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString();
}

// ============================================================================
// Fetch with Cache
// ============================================================================

import flru from 'flru';

type FetchFunction = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

interface CachedResponseEntry {
  body: ArrayBuffer;
  init: ResponseInit;
}

const nativeFetch: FetchFunction = globalThis.fetch;

const CACHE_MAX_ENTRIES = 1024;

const responseCache = flru<CachedResponseEntry>(CACHE_MAX_ENTRIES);
const pendingRequests = new Map<string, Promise<CachedResponseEntry>>();

function buildHeadersKey(request: Request) {
  const entries = Array.from(request.headers.entries());
  if (entries.length === 0) return '';

  entries.sort(([nameA], [nameB]) =>
    nameA.toLowerCase().localeCompare(nameB.toLowerCase()),
  );

  return entries
    .map(([name, value]) => `${name.toLowerCase()}:${value}`)
    .join('|');
}

function buildCacheKey(request: Request) {
  const headersKey = buildHeadersKey(request);
  return headersKey
    ? `${request.method}:${request.url}:${headersKey}`
    : `${request.method}:${request.url}`;
}

function buildResponse(entry: CachedResponseEntry) {
  return new Response(entry.body.slice(0), entry.init);
}

async function fetchAndCache(request: Request, key: string) {
  try {
    const response = await nativeFetch(request);
    const body = await response.arrayBuffer();
    const entry: CachedResponseEntry = {
      body,
      init: {
        status: response.status,
        statusText: response.statusText,
        headers: Array.from(response.headers.entries()),
      },
    };

    if (response.ok) {
      responseCache.set(key, entry);
    }

    return entry;
  } finally {
    pendingRequests.delete(key);
  }
}

export async function fetchWithCache(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const request = new Request(input, init);
  if (request.method !== 'GET') {
    return nativeFetch(request);
  }

  const key = buildCacheKey(request);

  if (responseCache.has(key)) {
    return buildResponse(responseCache.get(key)!);
  }

  let pending = pendingRequests.get(key);
  if (!pending) {
    pending = fetchAndCache(request, key);
    pendingRequests.set(key, pending);
  }

  const entry = await pending;
  return buildResponse(entry);
}

// ============================================================================
// Font Utilities
// ============================================================================

import type { FontWeightName } from '../types';

const GENERIC_FONT_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  '-apple-system',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'emoji',
  'math',
  'fangsong',
]);

export function splitFontFamily(font: string): string[] {
  const families: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;

  const push = () => {
    const value = current.trim();
    if (value) families.push(value);
    current = '';
  };

  for (let i = 0; i < font.length; i += 1) {
    const char = font[i];
    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === ',') {
      push();
      continue;
    }

    current += char;
  }

  push();
  return families;
}

function stripWrappingQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function isWrappedInQuotes(value: string) {
  const trimmed = value.trim();
  return (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  );
}

function needsQuoting(value: string) {
  return /^\d/.test(value) || /\s/.test(value);
}

function encodeSingleFontFamily(font: string) {
  const trimmed = font.trim();
  if (!trimmed) return trimmed;
  if (isWrappedInQuotes(trimmed)) return trimmed;
  if (GENERIC_FONT_FAMILIES.has(trimmed.toLowerCase())) return trimmed;
  if (!needsQuoting(trimmed)) return trimmed;

  const quote = trimmed.includes('"') && !trimmed.includes("'") ? "'" : '"';
  return `${quote}${trimmed}${quote}`;
}

export function decodeFontFamily(font: string) {
  const families = splitFontFamily(font);
  if (!families.length) return '';
  if (families.length === 1) return stripWrappingQuotes(families[0]);
  return families.map((family) => stripWrappingQuotes(family)).join(', ');
}

export function encodeFontFamily(font: string) {
  const families = splitFontFamily(font);
  if (!families.length) return font.trim();
  return families.map((family) => encodeSingleFontFamily(family)).join(', ');
}

const FontWeightNameMap: Record<string, FontWeightName> = {
  '100': 'thin',
  hairline: 'thin',
  thin: 'thin',
  '200': 'extralight',
  ultralight: 'extralight',
  extralight: 'extralight',
  '300': 'light',
  light: 'light',
  '400': 'regular',
  normal: 'regular',
  regular: 'regular',
  '500': 'medium',
  medium: 'medium',
  '600': 'semibold',
  demibold: 'semibold',
  semibold: 'semibold',
  '700': 'bold',
  bold: 'bold',
  '800': 'extrabold',
  ultrabold: 'extrabold',
  extrabold: 'extrabold',
  '900': 'black',
  heavy: 'black',
  black: 'black',
  '950': 'extrablack',
  ultrablack: 'extrablack',
  extrablack: 'extrablack',
};

export function normalizeFontWeightName(
  fontWeight: string | number,
): FontWeightName {
  const key = String(fontWeight).toLowerCase();
  return FontWeightNameMap[key] || 'regular';
}

// ============================================================================
// Join Utility
// ============================================================================

export function join(...paths: string[]): string {
  return paths
    .map((path) => path.replace(/^\/+|\/+$/g, ''))
    .filter((path) => path.trim().length > 0)
    .join('/');
}

// ============================================================================
// Item Utilities
// ============================================================================

const DEFAULT_SEPARATOR = ',';

export const getIndexesFromItemKey = (
  key: string,
  separator: string = DEFAULT_SEPARATOR,
): number[] => {
  return key.split(separator).map((value) => parseInt(value, 10));
};

export const getItemIndexes = (indexesStr: string): number[] => {
  return getIndexesFromItemKey(indexesStr);
};

// ============================================================================
// Is Node
// ============================================================================

export const isNode: boolean = !!(
  typeof process !== 'undefined' &&
  process.versions &&
  process.versions.node
);

// ============================================================================
// Measure Text (stub for server-side)
// ============================================================================

export function measureText(
  text: string = '',
  attrs: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string | number;
    lineHeight?: number | string;
    width?: number;
    height?: number;
  } = {},
): { width: number; height: number } {
  if (attrs.width && attrs.height) {
    return { width: attrs.width, height: attrs.height };
  }
  if (!text) {
    return { width: 0, height: 0 };
  }

  const {
    fontFamily = 'Alibaba PuHuiTi',
    fontSize = 14,
    fontWeight = 'normal',
    lineHeight = 1.4,
  } = attrs;

  // Server-side stub: approximate character width
  const charWidth = fontSize * 0.6;
  const lines = text.split(/\r?\n/);
  const maxLineLength = Math.max(...lines.map((l) => l.length));
  const width = maxLineLength * charWidth;

  const lineHeightPx =
    typeof lineHeight === 'string'
      ? parseFloat(lineHeight) || fontSize * 1.4
      : lineHeight > 4
        ? lineHeight
        : lineHeight * fontSize;
  const height = lineHeightPx * Math.max(lines.length, 1);

  return {
    width: Math.ceil(width * 1.015),
    height: Math.ceil(height * 1.015),
  };
}

// ============================================================================
// Text Element Utilities
// ============================================================================

export function createTextElement(
  textContent: string,
  attributes: Record<string, any> = {},
) {
  const entity = document.createElement('span');
  entity.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  const foreignObject = createElement<SVGForeignObjectElement>(
    'foreignObject',
    { overflow: 'visible' },
  );
  foreignObject.appendChild(entity);

  entity.textContent = textContent;

  const { id, x, y, width, height, ...restAttrs } = attributes;
  const textAttrs: Record<string, any> = {};
  if (id) textAttrs.id = id;
  if (x !== undefined) textAttrs.x = String(x);
  if (y !== undefined) textAttrs.y = String(y);
  if (width !== undefined) textAttrs.width = String(width);
  if (height !== undefined) textAttrs.height = String(height);
  setAttributes(foreignObject, textAttrs);

  // Apply text styling
  const style = entity.style;
  if (restAttrs.fill) style.color = restAttrs.fill;
  if (restAttrs['font-size'])
    style.fontSize = `${restAttrs['font-size']}px`;
  if (restAttrs['font-weight'])
    style.fontWeight = String(restAttrs['font-weight']);
  if (restAttrs['font-family'])
    style.fontFamily = encodeFontFamily(restAttrs['font-family']);
  if (restAttrs['line-height'])
    style.lineHeight = String(restAttrs['line-height']);
  if (restAttrs['letter-spacing'])
    style.letterSpacing = `${restAttrs['letter-spacing']}px`;

  return foreignObject;
}

// ============================================================================
// Icon Element Utilities
// ============================================================================

import { getResourceHref, ResourceConfig } from '../resources';

const ICON_RESOURCE_CACHE = new WeakMap<IconElement, string | ResourceConfig>();

type IconElement = SVGUseElement | SVGElement;

export function createIconElement(
  value: string | ResourceConfig,
  attrs: Record<string, any> = {},
): SVGUseElement {
  const icon = createElement<SVGUseElement>('use', {
    ...attrs,
    href: getResourceHref(value),
  });

  ICON_RESOURCE_CACHE.set(icon, value);

  return icon;
}

// ============================================================================
// Data Utilities
// ============================================================================

import type { ItemDatum } from '../types';

export function getDatumByIndexes(
  data: ItemDatum[] | { items: ItemDatum[] },
  indexes: number[],
): ItemDatum {
  if (indexes.length === 0) return {} as ItemDatum;
  const base = Array.isArray(data) ? data[indexes[0]] : data.items[indexes[0]];
  if (indexes.length === 1) return base;

  const path = indexes
    .slice(1)
    .map((i) => `children[${i}]`)
    .join('.');

  // Simple lodash-like get
  let result: any = base;
  for (const segment of path.split('.')) {
    const match = segment.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      result = result?.[match[1]]?.[Number(match[2])];
    } else {
      result = result?.[segment];
    }
  }

  return result || ({} as ItemDatum);
}

// ============================================================================
// Style Injection
// ============================================================================

type StyleTarget = Document | ShadowRoot | Node | null | undefined;

function resolveStyleRoot(target?: StyleTarget): Document | ShadowRoot {
  if (!target) return document;
  if (target instanceof Document || target instanceof ShadowRoot) return target;
  if (!target.isConnected) return document;

  const root = target.getRootNode();
  return root instanceof ShadowRoot ? root : document;
}

function hasStyle(root: Document | ShadowRoot, id: string) {
  if (root instanceof Document) return Boolean(root.getElementById(id));
  return Boolean(root.querySelector(`#${id}`));
}

export function injectStyleOnce(
  id: string,
  styles: string,
  target?: StyleTarget,
) {
  const root = resolveStyleRoot(target);
  if (hasStyle(root, id)) return;

  const doc = root instanceof Document ? root : (root.ownerDocument ?? document);
  const style = doc.createElement('style');
  style.id = id;
  style.textContent = styles;

  if (root instanceof Document) {
    root.head.appendChild(style);
  } else {
    root.appendChild(style);
  }
}

// ============================================================================
// Path Helper Types
// ============================================================================

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type StopType =
  | string
  | number
  | boolean
  | symbol
  | undefined
  | null
  | ((...args: any[]) => any)
  | Array<any>;

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never;

type ValidKey<T> = keyof {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : K]: any;
};

export type Path<T, D extends number = 3> = [D] extends [never]
  ? never
  : T extends StopType
    ? never
    : {
        [K in ValidKey<T>]-?: K extends string | number
          ? K | Join<K, Path<NonNullable<T[K]>, Prev[D]>>
          : never;
      }[ValidKey<T>];

// ============================================================================
// Get Types (TypeScript type string generator)
// ============================================================================

export function getTypes(
  composites: { structure: string[]; items: string[][] },
  commentsMap: Record<string, string> = {
    title: 'Infographic title',
    desc: 'Infographic description',
    items: 'Infographic content items',
    label: 'Item label text',
    value: 'Item numeric value',
    icon: 'Item icon',
    illus: 'Item illustration',
    children: 'Child items (hierarchical)',
  },
): string {
  const { structure, items } = composites;

  const lines: string[] = [];
  const indent = (level: number) => '  '.repeat(level);

  function fieldLine(name: string, type: string, level: number) {
    const comment = commentsMap[name];
    return comment
      ? `${indent(level)}/** ${comment} */\n${indent(level)}${name}: ${type};`
      : `${indent(level)}${name}: ${type};`;
  }

  function buildItemType(level: number, indentLevel: number): string {
    const fields = items[level];
    const fieldLines: string[] = [];

    for (const field of fields) {
      const type = field === 'value' ? 'number' : 'string';
      fieldLines.push(fieldLine(field, type, indentLevel + 1));
    }

    if (items[level + 1]) {
      fieldLines.push(
        fieldLine(
          'children',
          `Array<${buildItemType(level + 1, indentLevel + 1)}>`,
          indentLevel + 1,
        ),
      );
    }

    return `{\n${fieldLines.join('\n')}\n${indent(indentLevel)}}`;
  }

  lines.push('type InfographicType = {');

  if (structure.includes('title')) {
    lines.push(fieldLine('title', 'string', 1));
    lines.push(fieldLine('desc', 'string', 1));
  }

  if (structure.includes('item') && items.length > 0) {
    lines.push(fieldLine('items', `Array<${buildItemType(0, 1)}>`, 1));
  }

  lines.push('}');

  return lines.join('\n');
}
