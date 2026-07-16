import { isDark, lighten, darken } from '../../utils/color';
import { createElement, getOrCreateDefs, hasColor } from '../../utils';
import type { StylizeConfig } from '../../themes/types';
import { getSafetyId } from '../utils';

type GradientConfig = Extract<StylizeConfig, { type: 'linear-gradient' | 'radial-gradient' }>;

export function applyGradientStyle(
  node: SVGElement,
  svg: SVGSVGElement,
  config: GradientConfig,
  attr: 'fill' | 'stroke',
) {
  const currentColor = node.getAttribute(attr)!;

  const actualConfig = inferGradientConfig(currentColor, config);

  const { type, colors = [] } = actualConfig;

  const size = colors.length - 1;
  const stops = colors.map((color, index) => {
    if (typeof color === 'string') {
      return createElement('stop', {
        offset: `${index / size}`,
        'stop-color': color,
      });
    } else {
      return createElement('stop', {
        offset: `${color.offset}`,
        'stop-color': color.color,
      });
    }
  });

  const id = getGradientId(actualConfig);

  if (type === 'linear-gradient') {
    const { angle = 0 } = actualConfig;
    const [[x1, y1], [x2, y2]] = angleToUnitVector(angle);
    const linearGradient = createElement('linearGradient', {
      id,
      x1,
      y1,
      x2,
      y2,
    });
    stops.forEach((stop) => linearGradient.appendChild(stop));

    upsertGradient(svg, id, linearGradient);
  } else if (type === 'radial-gradient') {
    const radialGradient = createElement('radialGradient', {
      id,
    });
    stops.forEach((stop) => radialGradient.appendChild(stop));

    upsertGradient(svg, id, radialGradient);
  }

  const fill = node.getAttribute('fill');
  const stroke = node.getAttribute('stroke');

  if (hasColor(fill)) node.setAttribute('fill', `url(#${id})`);
  if (hasColor(stroke)) node.setAttribute('stroke', `url(#${id})`);
}

function upsertGradient(svg: SVGSVGElement, id: string, gradient: SVGElement) {
  const defs = getOrCreateDefs(svg);
  gradient.setAttribute('id', id);

  const exist = defs.querySelector(`#${id}`);

  if (exist) exist.replaceWith(gradient);
  else defs.appendChild(gradient);
}

function inferGradientConfig(
  currentColor: string,
  config: GradientConfig,
): GradientConfig {
  if (config.colors?.length || !currentColor) return config;

  const inferConfig = { ...config };

  inferConfig.colors = isDark(currentColor)
    ? [currentColor, lighten(currentColor, 20)]
    : [darken(currentColor, 20), currentColor];

  if (!('angle' in config) && inferConfig.type === 'linear-gradient') {
    inferConfig.angle = 225;
  }

  return inferConfig;
}

function getGradientId(config: GradientConfig) {
  const { type, colors = [] } = config;

  const colorId = getSafetyId(
    colors
      .map((color) => {
        if (typeof color === 'string') return color;
        return `${color.color}_${color.offset}`;
      })
      .join('-'),
  );

  if (type === 'linear-gradient') {
    const { angle = 0 } = config;
    return `${type}-${colorId}-${angle}`;
  }

  return `${type}-${colorId}`;
}

/**
 * Convert angle to unit vectors (screen coordinate system).
 * 0 degrees = positive x-axis, 90 degrees = positive y-axis.
 * Returns x1,y1,x2,y2 for <linearGradient>.
 */
function angleToUnitVector(
  angle: number,
): [[number, number], [number, number]] {
  const radians = (Math.PI / 180) * angle;
  const x = Math.cos(radians);
  const y = Math.sin(radians);

  return [
    [0.5 - x / 2, 0.5 - y / 2],
    [0.5 + x / 2, 0.5 + y / 2],
  ];
}
