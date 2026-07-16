export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RenderContext {
  defs: Map<string, JSXElement>;
}

export type Point = { x: number; y: number };

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

export interface BaseGeometryProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  [key: `data-${string}`]: any;
  [key: string]: any;
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
