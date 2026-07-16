import { createElement } from '../../../utils';

interface PatternStyle {
  scale?: number | null;
  backgroundColor?: string | null;
  foregroundColor?: string | null;
}

export const square = ({
  scale = 0.3,
  backgroundColor,
  foregroundColor,
}: PatternStyle) => {
  const pattern = createElement('pattern', {
    id: 'pattern-square',
    width: '20',
    height: '20',
    patternTransform: `scale(${scale})`,
    patternUnits: 'userSpaceOnUse',
  });

  const rect = createElement('rect', {
    width: '100%',
    height: '100%',
    fill: backgroundColor,
  });
  const path = createElement('path', {
    d: 'M0,0 L20,0 L20,20 L0,20 Z',
    fill: foregroundColor,
  });
  pattern.appendChild(rect);
  pattern.appendChild(path);
  return pattern;
};
