import {
  ComponentType,
  Defs,
  Ellipse,
  getElementBounds,
  Group,
  Rect,
} from '../../jsx';
import { ItemDesc, ItemIconCircle, ItemLabel } from '../components';
import { DropShadow } from '../defs';
import { getItemProps } from '../utils';
import { registerItem } from './registry';
import type { BaseItemProps } from './types';

export interface CapsuleItemProps extends BaseItemProps {
  width?: number;
  height?: number;
  gap?: number;
  iconPadding?: number;
}

export const CapsuleItem: ComponentType<CapsuleItemProps> = (props) => {
  const [
    {
      datum,
      indexes,
      width = 300,
      height = 80,
      gap = 12,
      positionH = 'normal',
      iconPadding = height / 10,
      themeColors,
    },
    restProps,
  ] = getItemProps(props, ['width', 'height', 'gap', 'iconPadding']);

  const borderRadius = height / 2;
  const iconSize = height - iconPadding * 2;

  const isFlipped = positionH === 'flipped';
  const hasIcon = !!datum.icon;

  const textWidth = hasIcon ? width - height - gap : width - gap * 2;
  const textX = hasIcon ? (isFlipped ? gap : height) : gap;
  const textAlign = hasIcon ? (isFlipped ? 'right' : 'left') : 'center';

  const labelProps = {
    indexes,
    width: textWidth,
    alignHorizontal: textAlign,
    alignVertical: 'middle',
    fontSize: 16,
    fontWeight: '600',
    fill: themeColors.colorWhite,
  } as const;
  const labelBounds = getElementBounds(
    <ItemLabel {...labelProps}>{datum.label}</ItemLabel>,
  );

  const descProps = {
    indexes,
    width: textWidth,
    alignHorizontal: textAlign,
    alignVertical: 'top',
    fontSize: 12,
    lineNumber: 1,
    fill: themeColors.colorWhite,
  } as const;
  const descBounds = getElementBounds(
    datum.desc ? <ItemDesc {...descProps}>{datum.desc}</ItemDesc> : null,
  );

  const textGap = 4;
  const totalTextHeight = labelBounds.height + textGap + descBounds.height;
  const textStartY = (height - totalTextHeight) / 2;
  const labelY = textStartY;
  const descY = labelY + labelBounds.height + textGap;

  const iconX = isFlipped ? width - height + iconPadding : iconPadding;
  const iconY = iconPadding;

  return (
    <Group {...restProps}>
      <Defs>
        <DropShadow />
      </Defs>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={themeColors.colorPrimary}
        rx={borderRadius}
        ry={borderRadius}
        data-element-type="shape"
      />

      {datum.icon && (
        <>
          <Ellipse
            x={iconX}
            y={iconY}
            width={iconSize}
            height={iconSize}
            fillOpacity={0.5}
            fill={themeColors.colorBg}
            filter="url(#drop-shadow)"
          />
          <ItemIconCircle
            indexes={indexes}
            x={iconX}
            y={iconY}
            size={iconSize}
            fill={themeColors.colorBg}
            colorBg={themeColors.colorPrimary}
          />
        </>
      )}

      {datum.label && (
        <ItemLabel x={textX} y={labelY} {...labelProps}>
          {datum.label}
        </ItemLabel>
      )}

      {datum.desc && (
        <ItemDesc x={textX} y={descY} {...descProps}>
          {datum.desc}
        </ItemDesc>
      )}
    </Group>
  );
};

registerItem('capsule-item', {
  component: CapsuleItem,
  composites: ['icon', 'label', 'desc'],
});
