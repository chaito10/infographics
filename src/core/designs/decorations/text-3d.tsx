import type { ComponentType } from '../../jsx';
import { Group } from '../../jsx';

export interface Text3dProps {
  text: string | number;
  x?: number;
  y?: number;
  fontSize?: number;
  fontWeight?: string | number;
  fill?: string;
  textAnchor?: 'start' | 'middle' | 'end';
  dominantBaseline?:
    | 'auto'
    | 'middle'
    | 'hanging'
    | 'alphabetic'
    | 'ideographic'
    | 'mathematical'
    | 'central'
    | 'text-before-edge'
    | 'text-after-edge'
    | 'inherit'
    | 'use-script'
    | 'no-change'
    | 'reset-size';
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  midShadowOffsetX?: number;
  midShadowOffsetY?: number;
  deepShadowOpacity?: number;
  midShadowOpacity?: number;
}

export const Text3d: ComponentType<Text3dProps> = ({
  text,
  x = 0,
  y = 0,
  fontSize = 56,
  fontWeight = 'bold',
  fill = '#FFFFFF',
  textAnchor = 'middle',
  dominantBaseline = 'middle',
  shadowOffsetX = 2,
  shadowOffsetY = 4,
  midShadowOffsetX = 1,
  midShadowOffsetY = 2,
  deepShadowOpacity = 0.3,
  midShadowOpacity = 0.5,
}) => {
  return (
    <Group>
      <text
        x={x}
        y={y}
        fontSize={fontSize}
        fontWeight={fontWeight}
        fill={fill}
        fillOpacity={deepShadowOpacity}
        textAnchor={textAnchor}
        dominantBaseline={dominantBaseline}
        transform={`translate(${shadowOffsetX}, ${shadowOffsetY})`}
      >
        {text}
      </text>
      <text
        x={x}
        y={y}
        fontSize={fontSize}
        fontWeight={fontWeight}
        fill={fill}
        fillOpacity={midShadowOpacity}
        textAnchor={textAnchor}
        dominantBaseline={dominantBaseline}
        transform={`translate(${midShadowOffsetX}, ${midShadowOffsetY})`}
      >
        {text}
      </text>
      <text
        x={x}
        y={y}
        fontSize={fontSize}
        fontWeight={fontWeight}
        fill={fill}
        textAnchor={textAnchor}
        dominantBaseline={dominantBaseline}
      >
        {text}
      </text>
    </Group>
  );
};
