import { ComponentType, Group, Rect, getElementBounds } from '../../jsx';
import { ItemDesc, ItemLabel } from '../components';
import { getItemProps } from '../utils';
import { registerItem } from './registry';
import type { BaseItemProps } from './types';

export interface UnderlineTextProps extends BaseItemProps {
  width?: number;
  gap?: number;
}

const underlineWidth = 80;
const underlineHeight = 3;

export const UnderlineText: ComponentType<UnderlineTextProps> = (props) => {
  const [
    { datum, indexes, width = 200, gap = 4, positionH = 'center', themeColors },
    restProps,
  ] = getItemProps(props, ['width', 'height', 'gap']);

  const labelBounds = getElementBounds(
    <ItemLabel indexes={indexes} fontSize={18} fontWeight="bold" width={width}>
      {datum.label}
    </ItemLabel>,
  );

  const descBounds = datum.desc
    ? getElementBounds(
        <ItemDesc indexes={indexes} width={width} wordWrap={true}>
          {datum.desc}
        </ItemDesc>,
      )
    : { width: 0, height: 0 };

  const contentHeight =
    labelBounds.height +
    gap +
    underlineHeight +
    (datum.desc ? gap * 2 + descBounds.height : 0);

  const titleX = 0;
  const titleY = 0;

  const alignHorizontal =
    positionH === 'center'
      ? 'center'
      : positionH === 'flipped'
        ? 'right'
        : 'left';

  const underlineX =
    positionH === 'center'
      ? (width - underlineWidth) / 2
      : positionH === 'flipped'
        ? width - underlineWidth
        : 0;
  const underlineY = titleY + labelBounds.height + gap;

  const descX = 0;
  const descY = underlineY + underlineHeight + gap * 2;

  return (
    <Group width={width} height={contentHeight} {...restProps}>
      {datum.label && (
        <ItemLabel
          indexes={indexes}
          x={titleX}
          y={titleY}
          width={width}
          alignHorizontal={alignHorizontal}
          fill={themeColors.colorPrimary}
          fontSize={18}
          fontWeight="bold"
        >
          {datum.label}
        </ItemLabel>
      )}

      {datum.label && (
        <Rect
          x={underlineX}
          y={underlineY}
          width={underlineWidth}
          height={underlineHeight}
          fill={themeColors.colorPrimary}
          data-element-type="shape"
        />
      )}

      {datum.desc && (
        <ItemDesc
          indexes={indexes}
          width={width}
          x={descX}
          y={descY}
          alignHorizontal={alignHorizontal}
          wordWrap={true}
          fill={themeColors.colorText}
        >
          {datum.desc}
        </ItemDesc>
      )}
    </Group>
  );
};

registerItem('underline-text', {
  component: UnderlineText,
  composites: ['label', 'desc'],
});
