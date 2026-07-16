// ============================================================================
// JSX Runtime
// ============================================================================
export {
  jsx,
  jsxs,
  jsxDEV,
  Fragment,
  createFragment,
  createLayout,
  renderSVG,
} from './jsx';
export {
  cloneElement,
  getCombinedBounds,
  getElementBounds,
  getElementsBounds,
} from './jsx';
export { Defs, Ellipse, Group, Path, Polygon, Rect, Text } from './jsx';

// ============================================================================
// Themes
// ============================================================================
export { generateThemeColors } from './themes';
export { registerTheme, getTheme, getThemes } from './themes';

// ============================================================================
// Runtime
// ============================================================================
export { Infographic, DEFAULT_OPTIONS } from './runtime';
export {
  cloneOptions,
  mergeOptions,
  isCompleteParsedInfographicOptions,
} from './runtime';

// ============================================================================
// Options
// ============================================================================
export { parseOptions, parseData } from './options';

// ============================================================================
// Parser (Syntax)
// ============================================================================
export {
  parseSyntax,
  parseSyntaxToAst,
  mapWithSchema,
  parseRelationsNode,
  parseInlineKeyValue,
} from './parser';

// ============================================================================
// Templates
// ============================================================================
export {
  registerTemplate,
  getTemplate,
  getTemplates,
  resolveTemplateKey,
} from './templates';

// ============================================================================
// Renderer - Fonts
// ============================================================================
export {
  DEFAULT_FONT,
  getFont,
  getFonts,
  registerFont,
  setDefaultFont,
  getFontURLs,
  getWoff2BaseURL,
  loadFontUrls,
} from './renderer/fonts';

// ============================================================================
// Renderer - Palettes
// ============================================================================
export {
  registerPalette,
  getPalette,
  getPalettes,
} from './renderer/palettes/registry';

// ============================================================================
// Designs - Items (side-effect: registers all items)
// ============================================================================
import './designs/items';
export { registerItem, getItem, getItems } from './designs/items';

// ============================================================================
// Designs - Structures (side-effect: registers all structures)
// ============================================================================
import './designs/structures';
export { registerStructure, getStructure, getStructures } from './designs/structures';

// ============================================================================
// Resources
// ============================================================================
export {
  loadSVGResource,
  registerResourceLoader,
  loadResource,
  waitForSvgLoads,
  getResourceHref,
  getResourceId,
  parseResourceConfig,
} from './resources';

// ============================================================================
// Exporter
// ============================================================================
export { exportToSVG, exportToSVGString, exportToPNGString } from './exporter';

// ============================================================================
// SSR
// ============================================================================
export { renderToString } from './ssr';

// ============================================================================
// Utils
// ============================================================================
export { parseSVG, parsePadding, measureText, isNode } from './utils';
export { getDatumByIndexes, getItemIndexes } from './utils';
export { getTypes, uuid, getSimpleHash } from './utils';
export { decodeFontFamily, encodeFontFamily, splitFontFamily } from './utils';

// ============================================================================
// Type Exports
// ============================================================================

// Parser types
export type {
  SyntaxError,
  SyntaxParseResult,
  SyntaxNode,
  ValueNode,
  ObjectNode,
  ArrayNode,
} from './parser';

// Theme types
export type {
  ThemeConfig,
  ThemeColors,
  ThemeSeed,
  Palette as ThemePalette,
  StylizeConfig,
} from './themes';

// Template types
export type { TemplateOptions, ParsedTemplateOptions } from './templates';

// Exporter types
export type {
  ExportOptions,
  SVGExportOptions,
  PNGExportOptions,
} from './exporter';

// Resource types
export type { ResourceConfig, ResourceLoader } from './resources';

// Core types
export type {
  Data,
  ParsedData,
  ItemDatum,
  BaseDatum,
  ListDatum,
  SequenceDatum,
  HierarchyDatum,
  CompareDatum,
  RelationNodeDatum,
  RelationEdgeDatum,
  StatisticsDatum,
  ListData,
  SequenceData,
  HierarchyData,
  CompareData,
  RelationData,
  StatisticsData,
  Font,
  FontWeightName,
  ImageResource,
  TextHorizontalAlign,
  TextVerticalAlign,
  Padding,
  ParsedPadding,
  Bounds,
  Point,
  JSXElement,
  JSXNode,
  JSXElementConstructor,
  ComponentType,
  WithChildren,
  RenderableNode,
  RenderContext,
  SVGAttributes,
  SVGProps,
  TextProps,
  RectProps,
  EllipseProps,
  PathProps,
  PolygonProps,
  GroupProps,
  DefsProps,
  FragmentProps,
  BaseGeometryProps,
  InfographicOptions,
  ParsedInfographicOptions,
  UpdatableInfographicOptions,
  SVGOptions,
  DesignOptions,
  ParsedDesignsOptions,
  IEventEmitter,
} from './types';
