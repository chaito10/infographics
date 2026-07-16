import type {
  DefsProps,
  EllipseProps,
  GroupProps,
  PathProps,
  PolygonProps,
  RectProps,
  SVGProps,
  TextProps,
} from './src/core/jsx/types';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      SVG: SVGProps;
      Defs: DefsProps;
      Group: GroupProps;
      Rect: RectProps;
      Ellipse: EllipseProps;
      Text: TextProps;
      Path: PathProps;
      Polygon: PolygonProps;

      svg: Record<string, any>;
      g: Record<string, any>;
      rect: Record<string, any>;
      ellipse: Record<string, any>;
      text: Record<string, any>;
      path: Record<string, any>;
      polygon: Record<string, any>;
      polyline: Record<string, any>;
      circle: Record<string, any>;
      line: Record<string, any>;
      image: Record<string, any>;
      use: Record<string, any>;
      defs: Record<string, any>;
      clipPath: Record<string, any>;
      mask: Record<string, any>;
      pattern: Record<string, any>;
      filter: Record<string, any>;
      linearGradient: Record<string, any>;
      radialGradient: Record<string, any>;
      stop: Record<string, any>;
      animate: Record<string, any>;
      animateMotion: Record<string, any>;
      animateTransform: Record<string, any>;
      title: Record<string, any>;
      desc: Record<string, any>;
    }
  }
}
