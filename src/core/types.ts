// ============================================================================
// Data Types
// ============================================================================

export interface BaseDatum {
  icon?: string | ResourceConfig;
  label?: string;
  desc?: string;
  value?: number;
  illus?: string | ResourceConfig;
  attributes?: Record<string, object>;
  [key: string]: any;
}

export type ListDatum = BaseDatum;

export type SequenceDatum = BaseDatum;

export interface HierarchyDatum extends BaseDatum {
  children?: HierarchyDatum[];
}

export type CompareDatum = HierarchyDatum;

export interface RelationNodeDatum extends BaseDatum {
  id?: string;
  group?: string;
}

export interface RelationEdgeDatum extends BaseDatum {
  id?: string;
  from: string;
  to: string;
  direction?: 'forward' | 'both' | 'none';
  showArrow?: boolean;
  arrowType?: 'arrow' | 'triangle' | 'diamond';
  lineStyle?: 'solid' | 'dashed';
}

export interface StatisticsDatum extends BaseDatum {
  value: number;
  category?: string;
}

export type ItemDatum =
  | ListDatum
  | SequenceDatum
  | HierarchyDatum
  | CompareDatum
  | RelationNodeDatum
  | StatisticsDatum;

export interface BaseData {
  title?: string;
  desc?: string;
  items?: ItemDatum[];
  illus?: Record<string, string | ResourceConfig>;
  attributes?: Record<string, object>;
  [key: string]: any;
}

export interface ListData extends BaseData {
  items?: ListDatum[];
  lists?: ListDatum[];
}

export interface SequenceData extends BaseData {
  items?: SequenceDatum[];
  sequences?: SequenceDatum[];
  order?: 'asc' | 'desc';
}

export interface HierarchyData extends BaseData {
  items?: [HierarchyDatum];
  root?: HierarchyDatum;
}

export interface CompareData extends BaseData {
  items?: CompareDatum[];
  compares?: CompareDatum[];
}

export interface RelationData extends BaseData {
  items?: RelationNodeDatum[];
  nodes?: RelationNodeDatum[];
  relations?: RelationEdgeDatum[];
}

export interface StatisticsData extends BaseData {
  items?: StatisticsDatum[];
  values?: StatisticsDatum[];
}

export type Data =
  | ListData
  | SequenceData
  | HierarchyData
  | CompareData
  | RelationData
  | StatisticsData;

export type ParsedData = Data & {
  items: ItemDatum[];
};

// ============================================================================
// Attribute Types
// ============================================================================

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
  'font-style'?: NumericalValue;
  'font-variant'?: NumericalValue;
  'letter-spacing'?: NumericalValue;
  'line-height'?: NumericalValue;
  fill?: TextualValue;
  stroke?: TextualValue;
  'stroke-width'?: NumericalValue;
  'text-anchor'?: TextualValue;
  'dominant-baseline'?: TextualValue;
  'data-horizontal-align'?: TextHorizontalAlign;
  'data-vertical-align'?: TextVerticalAlign;
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

export type IllusAttributes = {
  x: NumericalValue;
  y: NumericalValue;
  width: NumericalValue;
  height: NumericalValue;
  'clip-path'?: TextualValue;
};

// ============================================================================
// Text Types
// ============================================================================

export type TextHorizontalAlign = 'LEFT' | 'CENTER' | 'RIGHT';
export type TextVerticalAlign = 'TOP' | 'MIDDLE' | 'BOTTOM';

// ============================================================================
// Padding Types
// ============================================================================

export type Padding = number | number[];

export type ParsedPadding = [number, number, number, number];

// ============================================================================
// Font Types
// ============================================================================

export type FontWeightName =
  | 'thin'
  | 'extralight'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black'
  | 'extrablack';

export interface Font {
  fontFamily: string;
  name: string;
  baseUrl: string;
  fontWeight: {
    [keys in FontWeightName]?: string;
  };
}

// ============================================================================
// Resource Types
// ============================================================================

export type ImageResource =
  | string
  | {
      resource: string;
      color?: string;
      clipContent?: boolean;
      preserveAspectRatio?: string;
    };

export type ResourceSource = 'inline' | 'remote' | 'search' | 'custom';

export type ResourceFormat = 'svg' | 'image' | 'json' | 'binary' | string;

export type ResourceEncoding = 'raw' | 'data-uri' | 'base64' | string;

export type ResourceScene = 'icon' | 'illus';

export interface ResourceConfig {
  source: ResourceSource;
  format?: ResourceFormat;
  encoding?: ResourceEncoding;
  data: string;
  scene?: ResourceScene;
  [key: string]: any;
}

export type Resource = SVGSymbolElement;

export type ResourceLoader = (
  config: ResourceConfig,
) => Promise<Resource | null>;

// ============================================================================
// Event Types
// ============================================================================

export interface IEventEmitter {
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  emit(event: string | symbol, ...args: any[]): boolean;
  off(event: string | symbol, listener: (...args: any[]) => void): this;
  removeAllListeners(event?: string | symbol): this;
}

// ============================================================================
// Geometry Types
// ============================================================================

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Point = { x: number; y: number };

// ============================================================================
// JSX Types
// ============================================================================

export interface JSXElement {
  type: string | symbol | ((props?: any) => JSXNode);
  props: Record<string, any>;
  key?: string | null;
}

export type JSXNode =
  | JSXElement
  | string
  | number
  | boolean
  | null
  | undefined
  | JSXNode[];

export type RenderableNode = JSXElement | string | number;

export type JSXElementConstructor<P = {}> = (props: P) => JSXNode;

export type ComponentType<P = {}> = JSXElementConstructor<WithChildren<P>>;

export type WithChildren<T = {}> = T & {
  children?: JSXNode;
};

// ============================================================================
// SVG Attributes Types
// ============================================================================

interface DOMAttributes<T> {
  children?: JSXNode;
  __ignore?: T;
}

export interface SVGAttributes<T> extends DOMAttributes<T> {
  suppressHydrationWarning?: boolean | undefined;
  className?: string | undefined;
  color?: string | undefined;
  height?: number | string | undefined;
  id?: string | undefined;
  lang?: string | undefined;
  max?: number | string | undefined;
  media?: string | undefined;
  method?: string | undefined;
  min?: number | string | undefined;
  name?: string | undefined;
  style?: Record<string, string | number> | undefined;
  target?: string | undefined;
  type?: string | undefined;
  width?: number | string | undefined;
  tabIndex?: number | undefined;
  accentHeight?: number | string | undefined;
  accumulate?: 'none' | 'sum' | undefined;
  additive?: 'replace' | 'sum' | undefined;
  alignmentBaseline?:
    | 'auto'
    | 'baseline'
    | 'before-edge'
    | 'text-before-edge'
    | 'middle'
    | 'central'
    | 'after-edge'
    | 'text-after-edge'
    | 'ideographic'
    | 'alphabetic'
    | 'hanging'
    | 'mathematical'
    | 'inherit'
    | undefined;
  allowReorder?: 'no' | 'yes' | undefined;
  alphabetic?: number | string | undefined;
  amplitude?: number | string | undefined;
  arabicForm?: 'initial' | 'medial' | 'terminal' | 'isolated' | undefined;
  ascent?: number | string | undefined;
  attributeName?: string | undefined;
  attributeType?: string | undefined;
  azimuth?: number | string | undefined;
  baseFrequency?: number | string | undefined;
  baselineShift?: number | string | undefined;
  baseProfile?: number | string | undefined;
  bbox?: number | string | undefined;
  begin?: number | string | undefined;
  bias?: number | string | undefined;
  by?: number | string | undefined;
  calcMode?: number | string | undefined;
  capHeight?: number | string | undefined;
  clip?: number | string | undefined;
  clipPath?: string | undefined;
  clipPathUnits?: number | string | undefined;
  clipRule?: number | string | undefined;
  colorInterpolation?: number | string | undefined;
  colorInterpolationFilters?:
    | 'auto'
    | 'sRGB'
    | 'linearRGB'
    | 'inherit'
    | undefined;
  colorProfile?: number | string | undefined;
  colorRendering?: number | string | undefined;
  contentScriptType?: number | string | undefined;
  contentStyleType?: number | string | undefined;
  cursor?: number | string | undefined;
  cx?: number | string | undefined;
  cy?: number | string | undefined;
  d?: string | undefined;
  decelerate?: number | string | undefined;
  descent?: number | string | undefined;
  diffuseConstant?: number | string | undefined;
  direction?: number | string | undefined;
  display?: number | string | undefined;
  divisor?: number | string | undefined;
  dominantBaseline?:
    | 'auto'
    | 'use-script'
    | 'no-change'
    | 'reset-size'
    | 'ideographic'
    | 'alphabetic'
    | 'hanging'
    | 'mathematical'
    | 'central'
    | 'middle'
    | 'text-after-edge'
    | 'text-before-edge'
    | 'inherit'
    | undefined;
  dur?: number | string | undefined;
  dx?: number | string | undefined;
  dy?: number | string | undefined;
  edgeMode?: number | string | undefined;
  elevation?: number | string | undefined;
  enableBackground?: number | string | undefined;
  end?: number | string | undefined;
  exponent?: number | string | undefined;
  fill?: string | undefined;
  fillOpacity?: number | string | undefined;
  fillRule?: 'nonzero' | 'evenodd' | 'inherit' | undefined;
  filter?: string | undefined;
  filterRes?: number | string | undefined;
  filterUnits?: number | string | undefined;
  floodColor?: number | string | undefined;
  floodOpacity?: number | string | undefined;
  fontFamily?: string | undefined;
  fontSize?: number | string | undefined;
  fontSizeAdjust?: number | string | undefined;
  fontStretch?: number | string | undefined;
  fontStyle?: number | string | undefined;
  fontVariant?: number | string | undefined;
  fontWeight?: number | string | undefined;
  format?: number | string | undefined;
  fr?: number | string | undefined;
  from?: number | string | undefined;
  fx?: number | string | undefined;
  fy?: number | string | undefined;
  g1?: number | string | undefined;
  g2?: number | string | undefined;
  glyphName?: number | string | undefined;
  glyphOrientationHorizontal?: number | string | undefined;
  glyphOrientationVertical?: number | string | undefined;
  glyphRef?: number | string | undefined;
  gradientTransform?: string | undefined;
  gradientUnits?: string | undefined;
  hanging?: number | string | undefined;
  horizAdvX?: number | string | undefined;
  horizOriginX?: number | string | undefined;
  href?: string | undefined;
  ideographic?: number | string | undefined;
  imageRendering?: number | string | undefined;
  in2?: number | string | undefined;
  in?: string | undefined;
  intercept?: number | string | undefined;
  k1?: number | string | undefined;
  k2?: number | string | undefined;
  k3?: number | string | undefined;
  k4?: number | string | undefined;
  k?: number | string | undefined;
  kernelMatrix?: number | string | undefined;
  kernelUnitLength?: number | string | undefined;
  kerning?: number | string | undefined;
  keyPoints?: number | string | undefined;
  keySplines?: number | string | undefined;
  keyTimes?: number | string | undefined;
  lengthAdjust?: number | string | undefined;
  letterSpacing?: number | string | undefined;
  lightingColor?: number | string | undefined;
  limitingConeAngle?: number | string | undefined;
  local?: number | string | undefined;
  markerEnd?: string | undefined;
  markerHeight?: number | string | undefined;
  markerMid?: string | undefined;
  markerStart?: string | undefined;
  markerUnits?: number | string | undefined;
  markerWidth?: number | string | undefined;
  mask?: string | undefined;
  maskContentUnits?: number | string | undefined;
  maskUnits?: number | string | undefined;
  mathematical?: number | string | undefined;
  mode?: number | string | undefined;
  numOctaves?: number | string | undefined;
  offset?: number | string | undefined;
  opacity?: number | string | undefined;
  operator?: number | string | undefined;
  order?: number | string | undefined;
  orient?: number | string | undefined;
  orientation?: number | string | undefined;
  origin?: number | string | undefined;
  overflow?: number | string | undefined;
  overlinePosition?: number | string | undefined;
  overlineThickness?: number | string | undefined;
  paintOrder?: number | string | undefined;
  panose1?: number | string | undefined;
  path?: string | undefined;
  pathLength?: number | string | undefined;
  patternContentUnits?: string | undefined;
  patternTransform?: number | string | undefined;
  patternUnits?: string | undefined;
  pointerEvents?: number | string | undefined;
  points?: string | undefined;
  pointsAtX?: number | string | undefined;
  pointsAtY?: number | string | undefined;
  pointsAtZ?: number | string | undefined;
  preserveAspectRatio?: string | undefined;
  primitiveUnits?: number | string | undefined;
  r?: number | string | undefined;
  radius?: number | string | undefined;
  refX?: number | string | undefined;
  refY?: number | string | undefined;
  renderingIntent?: number | string | undefined;
  repeatCount?: number | string | undefined;
  repeatDur?: number | string | undefined;
  requiredExtensions?: number | string | undefined;
  requiredFeatures?: number | string | undefined;
  restart?: number | string | undefined;
  result?: string | undefined;
  rotate?: number | string | undefined;
  rx?: number | string | undefined;
  ry?: number | string | undefined;
  scale?: number | string | undefined;
  seed?: number | string | undefined;
  shapeRendering?: number | string | undefined;
  slope?: number | string | undefined;
  spacing?: number | string | undefined;
  specularConstant?: number | string | undefined;
  specularExponent?: number | string | undefined;
  speed?: number | string | undefined;
  spreadMethod?: string | undefined;
  startOffset?: number | string | undefined;
  stdDeviation?: number | string | undefined;
  stemh?: number | string | undefined;
  stemv?: number | string | undefined;
  stitchTiles?: number | string | undefined;
  stopColor?: string | undefined;
  stopOpacity?: number | string | undefined;
  strikethroughPosition?: number | string | undefined;
  strikethroughThickness?: number | string | undefined;
  string?: number | string | undefined;
  stroke?: string | undefined;
  strokeDasharray?: string | number | undefined;
  strokeDashoffset?: string | number | undefined;
  strokeLinecap?: 'butt' | 'round' | 'square' | 'inherit' | undefined;
  strokeLinejoin?: 'miter' | 'round' | 'bevel' | 'inherit' | undefined;
  strokeMiterlimit?: number | string | undefined;
  strokeOpacity?: number | string | undefined;
  strokeWidth?: number | string | undefined;
  surfaceScale?: number | string | undefined;
  systemLanguage?: number | string | undefined;
  tableValues?: number | string | undefined;
  targetX?: number | string | undefined;
  targetY?: number | string | undefined;
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit' | undefined;
  textDecoration?: number | string | undefined;
  textLength?: number | string | undefined;
  textRendering?: number | string | undefined;
  to?: number | string | undefined;
  transform?: string | undefined;
  u1?: number | string | undefined;
  u2?: number | string | undefined;
  underlinePosition?: number | string | undefined;
  underlineThickness?: number | string | undefined;
  unicode?: number | string | undefined;
  unicodeBidi?: number | string | undefined;
  unicodeRange?: number | string | undefined;
  unitsPerEm?: number | string | undefined;
  vAlphabetic?: number | string | undefined;
  values?: string | undefined;
  vectorEffect?: number | string | undefined;
  version?: number | string | undefined;
  vertAdvY?: number | string | undefined;
  vertOriginX?: number | string | undefined;
  vertOriginY?: number | string | undefined;
  vHanging?: number | string | undefined;
  vIdeographic?: number | string | undefined;
  viewBox?: string | undefined;
  viewTarget?: number | string | undefined;
  visibility?: number | string | undefined;
  vMathematical?: number | string | undefined;
  widths?: number | string | undefined;
  wordSpacing?: number | string | undefined;
  writingMode?: number | string | undefined;
  x1?: number | string | undefined;
  x2?: number | string | undefined;
  x?: number | string | undefined;
  xChannelSelector?: string | undefined;
  xHeight?: number | string | undefined;
  xlinkActuate?: string | undefined;
  xlinkArcrole?: string | undefined;
  xlinkHref?: string | undefined;
  xlinkRole?: string | undefined;
  xlinkShow?: string | undefined;
  xlinkTitle?: string | undefined;
  xlinkType?: string | undefined;
  xmlBase?: string | undefined;
  xmlLang?: string | undefined;
  xmlns?: string | undefined;
  xmlnsXlink?: string | undefined;
  xmlSpace?: string | undefined;
  y1?: number | string | undefined;
  y2?: number | string | undefined;
  y?: number | string | undefined;
  yChannelSelector?: string | undefined;
  z?: number | string | undefined;
  zoomAndPan?: string | undefined;
}

// ============================================================================
// JSX Element Props
// ============================================================================

export interface BaseGeometryProps extends Omit<
  SVGAttributes<SVGElement>,
  'children'
> {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  [key: `data-${string}`]: any;
}

export interface FragmentProps {
  children?: JSXNode;
}

export interface SVGProps extends BaseGeometryProps {
  children?: JSXNode;
}

export interface DefsProps {
  children?: JSXNode;
}

export interface GroupProps extends BaseGeometryProps {
  children?: JSXNode;
}

export interface RectProps extends BaseGeometryProps {
  children?: JSXNode;
}

export interface EllipseProps extends BaseGeometryProps {
  children?: JSXNode;
}

export interface TextProps extends BaseGeometryProps {
  lineHeight?: number;
  wordWrap?: boolean;
  alignHorizontal?: 'left' | 'center' | 'right';
  alignVertical?: 'top' | 'middle' | 'bottom';
  backgroundColor?: string;
  backgroundOpacity?: number;
  backgroundRadius?: number;
  children?: string | number | JSXNode;
}

export interface PathProps extends BaseGeometryProps {
  children?: JSXNode;
}

export interface PolygonProps extends Omit<BaseGeometryProps, 'points'> {
  points?: Point[];
  children?: JSXNode;
}

export interface RenderContext {
  defs: Map<string, JSXElement>;
}

// ============================================================================
// Options Types
// ============================================================================

export interface SVGOptions {
  style?: Record<string, string | number>;
  attributes?: Record<string, string | number | boolean>;
  id?: string;
  className?: string;
  background?: boolean;
}

export interface InfographicOptions {
  container?: string | Element | ShadowRoot;
  width?: number | string;
  height?: number | string;
  padding?: Padding;
  template?: string;
  design?: DesignOptions;
  data: Data;
  theme?: string;
  themeConfig?: ThemeConfig;
  svg?: SVGOptions;
  editable?: boolean;
  plugins?: IPlugin[];
  interactions?: IInteraction[];
  elements?: ElementProps[];
}

export interface ParsedInfographicOptions {
  container: Element | ShadowRoot;
  width?: number | string;
  height?: number | string;
  padding?: Padding;
  viewBox?: string;
  template?: string;
  design: ParsedDesignsOptions;
  data: ParsedData;
  theme?: string;
  themeConfig: ThemeConfig;
  svg?: SVGOptions;
  editable?: boolean;
  plugins?: IPlugin[];
  interactions?: IInteraction[];
  shapes?: ElementProps[];
}

export type UpdatableInfographicOptions = Partial<
  Omit<ParsedInfographicOptions, 'container'>
>;

// ============================================================================
// Placeholder Types (from external modules)
// ============================================================================

// These types are referenced but come from external modules.
// We define minimal placeholders here to keep the module self-contained.

export interface DesignOptions {
  structure?: string | { type: string; [key: string]: any };
  title?: string | { type: string; [key: string]: any };
  item?: string | { type: string; [key: string]: any };
  items?: Array<string | { type: string; [key: string]: any }>;
  [key: string]: any;
}

export interface ParsedDesignsOptions {
  structure: any | null;
  title: any;
  item: any;
  items: any[];
  [key: string]: any;
}

export interface ThemeConfig {
  type?: string;
  colorBg?: string;
  colorPrimary?: string;
  palette?: string[];
  stylize?: any;
  title?: any;
  desc?: any;
  shape?: any;
  base?: any;
  item?: any;
  elements?: any;
  [key: string]: any;
}

export interface IPlugin {
  name: string;
  [key: string]: any;
}

export interface IInteraction {
  [key: string]: any;
}

export interface ElementProps {
  [key: string]: any;
}
