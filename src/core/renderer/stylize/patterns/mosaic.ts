import { createElement } from '../../../utils';

interface PatternStyle {
  scale?: number | null;
  backgroundColor?: string | null;
  foregroundColor?: string | null;
}

export const mosaic = ({
  scale = 1,
  backgroundColor = '#ffffff',
  foregroundColor = '#000000',
}: PatternStyle) => {
  const patternSize = 20;
  const tileSize = 5;
  const rows = patternSize / tileSize;
  const cols = patternSize / tileSize;

  const pattern = createElement('pattern', {
    id: 'pattern-mosaic',
    width: patternSize,
    height: patternSize,
    patternUnits: 'userSpaceOnUse',
    patternTransform: `scale(${scale})`,
  });

  const background = createElement('rect', {
    width: '100%',
    height: '100%',
    fill: backgroundColor,
  });
  pattern.appendChild(background);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if ((x + y) % 2 === 0) {
        const rect = createElement('rect', {
          x: x * tileSize,
          y: y * tileSize,
          width: tileSize,
          height: tileSize,
          fill: foregroundColor,
        });
        pattern.appendChild(rect);
      }
    }
  }

  return pattern;
};
