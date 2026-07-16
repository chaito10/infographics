import type { ParsedInfographicOptions } from '../../options';
import { getAttributes, hasColor, setAttributes } from '../../utils';
import {
  applyGradientStyle,
  applyPatternStyle,
} from '../stylize';
import { parseDynamicAttributes } from '../utils';

export function renderShape(
  svg: SVGSVGElement,
  node: SVGElement,
  options: ParsedInfographicOptions,
): SVGElement | null {
  const { themeConfig } = options;
  const attrs = Object.assign({}, themeConfig.base?.shape, themeConfig.shape);
  const parsedAttrs = parseDynamicAttributes(node, attrs);

  setAttributes(node, parsedAttrs);
  stylizeShape(node, svg, options);

  return node;
}

export function renderStaticShape(
  node: SVGElement,
  options: ParsedInfographicOptions,
) {
  setAttributes(node, options.themeConfig.base?.shape || {});
}

function stylizeShape(
  node: SVGElement,
  svg: SVGSVGElement,
  options: ParsedInfographicOptions,
) {
  const config = options.themeConfig.stylize;

  if (!config) return;
  const { type } = config;

  if (!type) return;

  if (type === 'pattern') {
    applyPatternStyle(node, svg, options);
    return;
  }
  if (type === 'linear-gradient' || type === 'radial-gradient') {
    const { fill, stroke } = getAttributes(node, ['fill', 'stroke']);

    if (hasColor(fill)) {
      applyGradientStyle(node, svg, config, 'fill');
    }
    if (hasColor(stroke)) {
      applyGradientStyle(node, svg, config, 'stroke');
    }
  }
}
