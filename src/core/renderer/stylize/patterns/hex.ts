import { createElement } from '../../../utils';

interface PatternStyle {
  scale?: number | null;
  backgroundColor?: string | null;
  foregroundColor?: string | null;
}

export const hex = ({
  scale = 0.3,
  backgroundColor,
  foregroundColor,
}: PatternStyle) => {
  const pattern = createElement('pattern', {
    id: 'pattern-hex',
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
    d: 'M10,0 L20,5 L20,15 L10,20 L0,15 L0,5 Z',
    fill: foregroundColor,
  });
  pattern.appendChild(rect);
  pattern.appendChild(path);
  return pattern;
};
