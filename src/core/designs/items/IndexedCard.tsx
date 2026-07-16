import { ComponentType, getElementBounds, Group } from '../../jsx';
import { Rect, Text } from '../../jsx';
import { ItemDesc, ItemLabel } from '../components';
import { darken, getItemProps, mix } from '../utils';
import { registerItem } from './registry';
import type { BaseItemProps } from './types';

export interface IndexedCardProps extends BaseItemProps {
  width?: number;
  borderRadius?: number;
  padding?: number;
  separatorHeight?: number;
  indexFontSize?: number;
  labelFontSize?: number;
  gap?: number;
}

export const IndexedCard: ComponentType<IndexedCardProps> = (props) => {
  const [
    {
      datum,
      indexes,
      width = 200,
      borderRadius = 12,
      padding = 16,
      separatorHeight = 2,
      indexFontSize = 20,
      labelFontSize = 16,
      gap = 8,
      themeColors,
    },
    restProps,
  ] = getItemProps(props, [
    'width',
    'height',
    'borderRadius',
    'padding',
    'separatorHeight',
    'indexFontSize',
    'labelFontSize',
    'gap',
  ]);

  const indexNumber = indexes[0] + 1;
  const indexStr = String(indexNumber).padStart(2, '0');
  const showLabel = datum.label !== undefined;
  const showDesc = datum.desc !== undefined;

  const separatorColor = mix(themeColors.colorPrimary, themeColors.colorWhite, 40);
  const cardBgColor = themeColors.colorBgElevated || themeColors.colorWhite;

  const contentWidth = width - 2 * padding;

  const indexBounds = getElementBounds(
    <Text fontSize={indexFontSize} fontWeight="bold">
      {indexStr}
    </Text>,
  );

  const labelAvailableWidth = contentWidth - indexBounds.width - gap;
  const labelBounds = showLabel
    ? getElementBounds(
        <ItemLabel
          indexes={indexes}
          width={labelAvailableWidth}
          fontSize={labelFontSize}
          fontWeight="bold"
          x={indexFontSize}
        >
          {datum.label}
        </ItemLabel>,
      )
    : { width: 0, height: 0 };

  const descBounds = showDesc
    ? getElementBounds(
        <ItemDesc
          indexes={indexes}
          width={contentWidth}
          fontSize={14}
          lineHeight={1.5}
          wordWrap={true}
        >
          {datum.desc}
        </ItemDesc>,
      )
    : { width: 0, height: 0 };

  const titleRowHeight = Math.max(indexBounds.height, labelBounds.height);
  const contentHeight =
    padding * 2 +
    titleRowHeight +
    (showLabel || showDesc ? gap : 0) +
    separatorHeight +
    (showDesc ? gap : 0) +
    descBounds.height;

  return (
    <Group {...restProps} width={width} height={contentHeight}>
      <Rect
        x={0}
        y={0}
        width={width}
        height={contentHeight}
        rx={borderRadius}
        ry={borderRadius}
        fill={cardBgColor}
        stroke={darken(cardBgColor, 5)}
        strokeWidth={0.5}
        data-element-type="shape"
      />

      <Group x={padding} y={padding}>
        <Group x={0} y={0}>
          <Text
            x={0}
            y={0}
            fontSize={indexFontSize}
            fontWeight="bold"
            fill={themeColors.colorPrimary}
            alignVertical="top"
          >
            {indexStr}
          </Text>

          {showLabel && (
            <ItemLabel
              indexes={indexes}
              x={indexFontSize + gap}
              y={0}
              width={labelAvailableWidth}
              fontSize={labelFontSize}
              fontWeight="bold"
              fill={themeColors.colorTextSecondary}
              alignVertical="top"
            >
              {datum.label}
            </ItemLabel>
          )}
        </Group>

        <Rect
          x={0}
          y={titleRowHeight + gap}
          width={contentWidth}
          height={separatorHeight}
          fill={separatorColor}
          data-element-type="shape"
        />

        {showDesc && (
          <ItemDesc
            indexes={indexes}
            x={0}
            y={titleRowHeight + gap + separatorHeight + gap}
            width={contentWidth}
            fontSize={14}
            lineHeight={1.5}
            wordWrap={true}
            fill={themeColors.colorTextSecondary}
          >
            {datum.desc}
          </ItemDesc>
        )}
      </Group>
    </Group>
  );
};

registerItem('indexed-card', {
  component: IndexedCard,
  composites: ['label', 'desc'],
});
