import type { ParsedInfographicOptions } from '../../options';
import { createElement, getElementByRole } from '../../utils';

const BG_ROLE = 'background';

export function renderBackground(
  svg: SVGSVGElement,
  options: ParsedInfographicOptions,
): void {
  if (options.svg?.background === false) return;
  const {
    themeConfig: { colorBg: background },
  } = options;
  if (!background) return;
  const container = svg.parentElement;

  if (container) container.style.backgroundColor = background || 'none';
  const element = getElementByRole(svg, BG_ROLE);

  svg.style.backgroundColor = background;

  if (element) {
    element.setAttribute('fill', background);
  } else if (svg.viewBox?.baseVal) {
    const { x, y, width, height } = svg.viewBox.baseVal;

    const rect = createElement('rect', {
      x,
      y,
      width,
      height,
      fill: background,
      'data-element-type': BG_ROLE,
    });
    svg.prepend(rect);
  }
}
