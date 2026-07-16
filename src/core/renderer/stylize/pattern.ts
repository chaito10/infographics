import type { ParsedInfographicOptions } from '../../options';
import { getAttributes, getOrCreateDefs, hasColor } from '../../utils';
import { setAlpha } from '../../utils/color';
import { getSafetyId } from '../utils';
import * as builtInPatterns from './patterns';

type PatternConfig = Extract<
  ParsedInfographicOptions['themeConfig']['stylize'],
  { type: 'pattern' }
>;

interface PatternStyle {
  backgroundColor?: string | null;
  foregroundColor?: string | null;
  scale?: number | null;
}

type PatternGenerator = (style: PatternStyle) => SVGElement;

const PATTERNS = new Map<string, PatternGenerator>();

export function registerPattern(name: string, generator: PatternGenerator) {
  if (PATTERNS.has(name)) console.warn(`Pattern ${name} will be overwritten`);
  PATTERNS.set(name, generator);
}

for (const [name, generator] of Object.entries(builtInPatterns)) {
  registerPattern(name, generator as PatternGenerator);
}

export function applyPatternStyle(
  node: SVGElement,
  svg: SVGSVGElement,
  options: ParsedInfographicOptions,
) {
  const config = options.themeConfig.stylize;
  if (!config || config.type !== 'pattern') return;
  const { pattern, ...restConfig } = config;

  const generator = PATTERNS.get(pattern);
  if (!generator) {
    return console.warn(`Pattern ${pattern} not found`);
  }

  const { fill } = getAttributes(node, ['fill', 'stroke']);

  const color = fill;
  const style: PatternStyle = {
    backgroundColor: color ? setAlpha(color, 0.5) : color,
    foregroundColor: color,
    ...restConfig,
  };
  const id = getPatternId({ ...config, ...style });
  upsertPattern(svg, id, generator(style));

  if (hasColor(fill)) {
    node.setAttribute('fill', `url(#${id})`);
    if (!node.getAttribute('stroke') && fill) {
      node.setAttribute('stroke', fill);
    }
  }
}

function upsertPattern(svg: SVGSVGElement, id: string, pattern: SVGElement) {
  const defs = getOrCreateDefs(svg);
  pattern.setAttribute('id', id);

  const exist = defs.querySelector(`pattern#${id}`);

  if (exist) exist.replaceWith(pattern);
  else defs.appendChild(pattern);
}

function getPatternId(config: PatternConfig & PatternStyle) {
  const {
    pattern,
    foregroundColor = 'unset',
    backgroundColor = 'unset',
    scale = 'unset',
  } = config;
  return getSafetyId(
    `pattern-${pattern}-${foregroundColor}-${backgroundColor}-${scale}`,
  );
}
