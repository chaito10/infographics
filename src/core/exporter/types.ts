export interface SVGExportOptions {
  type: 'svg';
  /**
   * Whether to remove the background (SVG background style + background rect)
   * @default false
   */
  removeBackground?: boolean;
  /**
   * Whether to embed remote resources into the SVG
   * @default true
   */
  embedResources?: boolean;
  /**
   * Whether to remove id dependencies (inline <use> and defs references)
   * @default false
   */
  removeIds?: boolean;
}

export interface PNGExportOptions {
  type: 'png';
  /**
   * Whether to remove the background (SVG background style + background rect)
   * @default false
   */
  removeBackground?: boolean;
  /**
   * Device pixel ratio, defaults to globalThis.devicePixelRatio
   * @default globalThis.devicePixelRatio || 2
   */
  dpr?: number;
}

export type ExportOptions = SVGExportOptions | PNGExportOptions;
