import { ComponentType, Defs, Ellipse, Group, Rect } from '../../jsx';
import { ItemDesc, ItemIcon, ItemLabel, ItemValue } from '../components';
import { FlexLayout } from '../layouts';
import { darken, getItemProps } from '../utils';
import { registerItem } from './registry';
import type { BaseItemProps } from './types';

export interface BadgeCardProps extends BaseItemProps {
  width?: number;
  height?: number;
  iconSize?: number;
  badgeSize?: number;
  gap?: number;
}

export const BadgeCard: ComponentType<BadgeCardProps> = (props) => {
  const [
    {
      datum,
      indexes,
      width = 200,
      height = 80,
      iconSize = 24,
      badgeSize = 32,
      gap = 8,
      positionH = 'normal',
      themeColors,
      valueFormatter,
    },
    restProps,
  ] = getItemProps(props, ['width', 'height', 'iconSize', 'badgeSize', 'gap']);
  const value = datum.value;
  const hasValue = value !== undefined;
  const hasDesc = !!datum.desc;
  const hasIcon = !!datum.icon;
  const gradientId = `${themeColors.colorPrimary}-badge`;

  const badgeX = positionH === 'flipped' ? width - gap - badgeSize : gap;
  const contentStartX = hasIcon
    ? positionH === 'flipped'
      ? gap
      : badgeSize + 2 * gap
    : gap;
  const fullWidth = width - gap * 2;
  const contentWidth = hasIcon ? width - badgeSize - 3 * gap : fullWidth;

  const descY = gap + 14 + 18 + 8;
  const contentAreaHeight = descY - gap;

  const badgeY = !hasDesc ? (height - badgeSize) / 2 : gap;
  const contentY = !hasValue && !hasDesc ? (height - 14) / 2 : gap;

  const textAlign =
    !hasIcon && positionH === 'center'
      ? 'center'
      : positionH === 'flipped'
        ? 'right'
        : 'left';

  return (
    <Group {...restProps} width={width} height={height}>
      <Defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={themeColors.colorPrimary} />
          <stop offset="100%" stopColor={darken(themeColors.colorPrimary, 20)} />
        </radialGradient>
      </Defs>

      <Rect
        data-element-type="shape"
        x={0}
        y={0}
        width={width}
        height={height}
        fill={themeColors.colorPrimaryBg}
        rx={8}
        ry={8}
      />

      {hasIcon && (
        <>
          <Ellipse
            x={badgeX}
            y={badgeY}
            width={badgeSize}
            height={badgeSize}
            fill={`url(#${gradientId})`}
          />

          <ItemIcon
            indexes={indexes}
            x={badgeX + (badgeSize - iconSize) / 2}
            y={badgeY + (badgeSize - iconSize) / 2}
            size={iconSize}
            fill={themeColors.colorWhite}
          />
        </>
      )}

      <FlexLayout
        flexDirection="column"
        x={contentStartX}
        y={contentY}
        width={contentWidth}
        height={!hasValue && !hasDesc ? undefined : contentAreaHeight}
        alignItems="center"
        justifyContent="center"
      >
        <ItemLabel
          indexes={indexes}
          width={contentWidth}
          alignHorizontal={textAlign}
          alignVertical="middle"
          fontSize={14}
          fill={themeColors.colorText}
        >
          {datum.label}
        </ItemLabel>

        {hasValue && (
          <ItemValue
            indexes={indexes}
            width={contentWidth}
            alignHorizontal={positionH === 'flipped' ? 'right' : 'left'}
            alignVertical="middle"
            fontSize={18}
            lineHeight={1}
            fontWeight="bold"
            fill={themeColors.colorPrimary}
            value={value}
            formatter={valueFormatter}
          />
        )}
      </FlexLayout>

      {hasDesc && (
        <ItemDesc
          indexes={indexes}
          x={gap}
          y={descY}
          width={fullWidth}
          alignHorizontal={textAlign}
          fontSize={11}
          fill={themeColors.colorTextSecondary}
          lineNumber={2}
          lineHeight={1.2}
          wordWrap={true}
        >
          {datum.desc}
        </ItemDesc>
      )}
    </Group>
  );
};

registerItem('badge-card', {
  component: BadgeCard,
  composites: ['icon', 'label', 'value', 'desc'],
});
