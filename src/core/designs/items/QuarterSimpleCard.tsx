import { ComponentType, Group, Path, getElementBounds } from '../../jsx';
import { ItemDesc, ItemIcon, ItemLabel } from '../components';
import { getItemProps } from '../utils';
import { registerItem } from './registry';
import type { BaseItemProps } from './types';

export interface QuarterSimpleCardProps extends BaseItemProps {
  width?: number;
  height?: number;
  iconSize?: number;
  padding?: number;
  borderRadius?: number;
}

export const QuarterSimpleCard: ComponentType<QuarterSimpleCardProps> = (
  props,
) => {
  const [
    {
      datum,
      indexes,
      width = 150,
      height = 150,
      iconSize = 30,
      padding = 20,
      borderRadius = 16,
      positionH = 'center',
      positionV = 'middle',
      themeColors,
    },
    restProps,
  ] = getItemProps(props, [
    'width',
    'height',
    'iconSize',
    'padding',
    'borderRadius',
  ]);

  const contentWidth = width - padding * 2;
  const contentX = padding;
  const contentY = padding;

  const iconX =
    positionH === 'flipped'
      ? width - padding - iconSize
      : positionH === 'center'
        ? (width - iconSize) / 2
        : contentX;

  const iconY = contentY;

  const labelY = iconY + iconSize + 8;
  const labelBounds = getElementBounds(
    <ItemLabel indexes={indexes} width={contentWidth}>
      {datum.label}
    </ItemLabel>,
  );

  const labelX =
    positionH === 'flipped'
      ? width - padding - contentWidth
      : positionH === 'center'
        ? padding
        : contentX;

  const descY = labelY + labelBounds.height + 4;
  const descX = labelX;

  const r = borderRadius;
  let cardPath = '';

  if (positionH === 'center' && positionV === 'middle') {
    cardPath = `
  M ${r} 0
  L ${width - r} 0
  Q ${width} 0 ${width} ${r}
  L ${width} ${height - r}
  Q ${width} ${height} ${width - r} ${height}
  L ${r} ${height}
  Q 0 ${height} 0 ${height - r}
  L 0 ${r}
  Q 0 0 ${r} 0
  Z
`;
  } else if (positionH === 'flipped' && positionV === 'flipped') {
    cardPath = `
  M ${r} 0
  L ${width - r} 0
  Q ${width} 0 ${width} ${r}
  L ${width} ${height - r}
  Q ${width} ${height} ${width - r} ${height}
  L ${r} ${height}
  Q 0 ${height} 0 ${height - r}
  L 0 0
  L ${r} 0
  Z
`;
  } else if (positionH === 'normal' && positionV === 'flipped') {
    cardPath = `
  M 0 0
  L ${width} 0
  L ${width} ${height - r}
  Q ${width} ${height} ${width - r} ${height}
  L ${r} ${height}
  Q 0 ${height} 0 ${height - r}
  L 0 ${r}
  Q 0 0 ${r} 0
  Z
`;
  } else if (positionH === 'flipped') {
    cardPath = `
  M ${r} 0
  L ${width - r} 0
  Q ${width} 0 ${width} ${r}
  L ${width} ${height - r}
  Q ${width} ${height} ${width - r} ${height}
  L 0 ${height}
  L 0 ${r}
  Q 0 0 ${r} 0
  Z
`;
  } else {
    cardPath = `
  M ${r} 0
  L ${width - r} 0
  Q ${width} 0 ${width} ${r}
  L ${width} ${height}
  L ${r} ${height}
  Q 0 ${height} 0 ${height - r}
  L 0 ${r}
  Q 0 0 ${r} 0
  Z
`;
  }

  return (
    <Group {...restProps}>
      <Path
        d={cardPath}
        x={0}
        y={0}
        width={width}
        height={height}
        fill={themeColors.colorPrimary}
        data-element-type="shape"
      />

      <ItemIcon
        indexes={indexes}
        x={iconX}
        y={iconY}
        size={iconSize}
        fill={themeColors.colorBg}
      />

      <ItemLabel
        indexes={indexes}
        x={labelX}
        y={labelY}
        width={contentWidth}
        fontSize={14}
        fontWeight="bold"
        fill={themeColors.colorBg}
        alignHorizontal={positionH === 'flipped' ? 'right' : 'left'}
      >
        {datum.label}
      </ItemLabel>

      {datum.desc && (
        <ItemDesc
          indexes={indexes}
          x={descX}
          y={descY}
          width={contentWidth}
          fontSize={11}
          wordWrap={true}
          fill={themeColors.colorBg}
          alignHorizontal={positionH === 'flipped' ? 'right' : 'left'}
        >
          {datum.desc}
        </ItemDesc>
      )}
    </Group>
  );
};

registerItem('quarter-simple-card', {
  component: QuarterSimpleCard,
  composites: ['icon', 'label', 'desc'],
});
