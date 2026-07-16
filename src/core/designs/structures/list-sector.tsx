import { ElementTypeEnum } from '../components/constants';
import type { ComponentType, JSXElement } from '../../jsx';
import { Ellipse, getElementBounds, Group, Path, Text } from '../../jsx';
import { BtnAdd, BtnRemove, BtnsGroup, ItemsGroup } from '../components';
import { getThemeColors } from '../utils';
import { registerStructure } from './registry';
import { getPaletteColor } from './types';
import type { BaseStructureProps } from './types';

export interface ListSectorProps extends BaseStructureProps {
  outerRadius?: number;
  innerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  gapAngle?: number;
}

export const ListSector: ComponentType<ListSectorProps> = (props) => {
  const {
    Item,
    data,
    outerRadius = 250,
    innerRadius = 120,
    startAngle = -90,
    endAngle = 270,
    gapAngle = 1,
    options,
  } = props;
  const { title, items = [] } = data;

  const themeColors = getThemeColors(options.themeConfig);

  const btnBounds = getElementBounds(<BtnAdd indexes={[0]} />);

  const btnElements: JSXElement[] = [];
  const itemElements: JSXElement[] = [];
  const sectorElements: JSXElement[] = [];

  const centerX = outerRadius + 100;
  const centerY = outerRadius + 100;

  const totalAngle = endAngle - startAngle;
  const isFullCircle = Math.abs(totalAngle - 360) < 0.01;
  const totalGapAngle =
    items.length > 0
      ? gapAngle * (isFullCircle ? items.length : items.length - 1)
      : 0;
  const totalUsableAngle = totalAngle - totalGapAngle;
  const anglePerSector = items.length > 0 ? totalUsableAngle / items.length : 0;

  items.forEach((item, index) => {
    const indexes = [index];
    const currentStartAngle = startAngle + (anglePerSector + gapAngle) * index;
    const currentEndAngle = currentStartAngle + anglePerSector;

    const gapArcLength = (gapAngle * Math.PI * outerRadius) / 180;
    const innerGapAngle = (gapArcLength / innerRadius) * (180 / Math.PI);
    const outerGapAngle = gapAngle;

    const outerStartAngleRad =
      ((currentStartAngle + outerGapAngle / 2) * Math.PI) / 180;
    const outerEndAngleRad =
      ((currentEndAngle - outerGapAngle / 2) * Math.PI) / 180;

    const innerStartAngleRad =
      ((currentStartAngle + innerGapAngle / 2) * Math.PI) / 180;
    const innerEndAngleRad =
      ((currentEndAngle - innerGapAngle / 2) * Math.PI) / 180;

    const outerStartX = centerX + outerRadius * Math.cos(outerStartAngleRad);
    const outerStartY = centerY + outerRadius * Math.sin(outerStartAngleRad);
    const outerEndX = centerX + outerRadius * Math.cos(outerEndAngleRad);
    const outerEndY = centerY + outerRadius * Math.sin(outerEndAngleRad);

    const innerStartX = centerX + innerRadius * Math.cos(innerStartAngleRad);
    const innerStartY = centerY + innerRadius * Math.sin(innerStartAngleRad);
    const innerEndX = centerX + innerRadius * Math.cos(innerEndAngleRad);
    const innerEndY = centerY + innerRadius * Math.sin(innerEndAngleRad);

    const largeArcFlag = anglePerSector > 180 ? 1 : 0;

    const arcPath = `
      M ${outerStartX} ${outerStartY}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}
      L ${innerEndX} ${innerEndY}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
      Z
    `.trim();

    const color = getPaletteColor(options, indexes);

    sectorElements.push(
      <Path
        id="shape-sector"
        d={arcPath}
        fill={color}
        width={outerRadius * 2 + 200}
        height={outerRadius * 2 + 200}
        data-element-type="shape"
      />,
    );

    const midAngle = currentStartAngle + anglePerSector / 2;
    const midAngleRad = (midAngle * Math.PI) / 180;

    const midRadius = (outerRadius + innerRadius) / 2;

    const arcThickness = outerRadius - innerRadius;
    const midAngleRadian = (anglePerSector * Math.PI) / 180;
    const arcLength = midRadius * midAngleRadian;

    const maxWidth = Math.min(arcLength * 0.8, arcThickness * 0.9);
    const maxHeight = Math.min(arcThickness * 0.9, arcLength * 0.8);

    const itemBounds = getElementBounds(
      <Item
        indexes={[0]}
        data={data}
        datum={items[0]}
        positionH="center"
        width={maxWidth}
        height={maxHeight}
      />,
    );

    const itemX =
      centerX + midRadius * Math.cos(midAngleRad) - itemBounds.width / 2;
    const itemY =
      centerY + midRadius * Math.sin(midAngleRad) - itemBounds.height / 2;

    itemElements.push(
      <Item
        indexes={indexes}
        datum={item}
        data={data}
        x={itemX}
        y={itemY}
        positionH="center"
        width={maxWidth}
        height={maxHeight}
        themeColors={{
          ...getThemeColors({
            colorBg: getPaletteColor(options, indexes),
            colorPrimary: options.themeConfig?.colorBg || 'white',
          }),
        }}
      />,
    );

    const btnRemoveRadius = outerRadius + 10;
    const btnRemoveX =
      centerX + btnRemoveRadius * Math.cos(midAngleRad) - btnBounds.width / 2;
    const btnRemoveY =
      centerY + btnRemoveRadius * Math.sin(midAngleRad) - btnBounds.height / 2;

    btnElements.push(
      <BtnRemove indexes={indexes} x={btnRemoveX} y={btnRemoveY} />,
    );

    if (isFullCircle || index < items.length - 1) {
      const gapMidAngle = currentEndAngle + gapAngle / 2;
      const gapMidAngleRad = (gapMidAngle * Math.PI) / 180;
      const btnAddRadius = midRadius;
      const btnAddX =
        centerX + btnAddRadius * Math.cos(gapMidAngleRad) - btnBounds.width / 2;
      const btnAddY =
        centerY +
        btnAddRadius * Math.sin(gapMidAngleRad) -
        btnBounds.height / 2;

      btnElements.push(
        <BtnAdd indexes={[index + 1]} x={btnAddX} y={btnAddY} />,
      );
    }
  });

  if (items.length > 0) {
    const firstGapMidAngle = startAngle - gapAngle / 2;
    const firstGapMidAngleRad = (firstGapMidAngle * Math.PI) / 180;
    const midRadius = (outerRadius + innerRadius) / 2;
    const btnAddX =
      centerX + midRadius * Math.cos(firstGapMidAngleRad) - btnBounds.width / 2;
    const btnAddY =
      centerY +
      midRadius * Math.sin(firstGapMidAngleRad) -
      btnBounds.height / 2;

    btnElements.push(<BtnAdd indexes={[0]} x={btnAddX} y={btnAddY} />);
  }

  const centerRadius = innerRadius * 0.9;

  let titleCenterX = centerX;
  let titleCenterY = centerY;
  let titleWidth = centerRadius * 1.4;
  let titleHeight = centerRadius * 1.4;

  if (!isFullCircle) {
    const midAngle = (startAngle + endAngle) / 2;
    const midAngleRad = (midAngle * Math.PI) / 180;
    const titleRadius = centerRadius * 0.5;
    titleCenterX = centerX + titleRadius * Math.cos(midAngleRad);
    titleCenterY = centerY + titleRadius * Math.sin(midAngleRad);

    const arcLength = (totalAngle * Math.PI * titleRadius) / 180;
    titleWidth = Math.min(arcLength * 0.8, centerRadius * 1.4);
    titleHeight = Math.min(titleRadius * 1.5, centerRadius * 1.4);
  }

  let centerSectorPath = '';
  if (!isFullCircle) {
    const centerStartAngleRad = (startAngle * Math.PI) / 180;
    const centerEndAngleRad = (endAngle * Math.PI) / 180;

    const centerStartX = centerX + centerRadius * Math.cos(centerStartAngleRad);
    const centerStartY = centerY + centerRadius * Math.sin(centerStartAngleRad);
    const centerEndX = centerX + centerRadius * Math.cos(centerEndAngleRad);
    const centerEndY = centerY + centerRadius * Math.sin(centerEndAngleRad);

    const centerLargeArcFlag = totalAngle > 180 ? 1 : 0;

    centerSectorPath = `
      M ${centerX} ${centerY}
      L ${centerStartX} ${centerStartY}
      A ${centerRadius} ${centerRadius} 0 ${centerLargeArcFlag} 1 ${centerEndX} ${centerEndY}
      Z
    `.trim();
  }

  return (
    <Group id="infographic-container">
      <Group>{sectorElements}</Group>
      {isFullCircle ? (
        <Ellipse
          id="shape-center-circle"
          x={centerX - centerRadius}
          y={centerY - centerRadius}
          width={centerRadius * 2}
          height={centerRadius * 2}
          fill={themeColors.colorPrimaryBg}
          fillOpacity={0.5}
          data-element-type="shape"
        />
      ) : (
        <Path
          id="shape-center-sector"
          d={centerSectorPath}
          fill={themeColors.colorPrimaryBg}
          fillOpacity={0.5}
          width={outerRadius * 2 + 200}
          height={outerRadius * 2 + 200}
          data-element-type="shape"
        />
      )}
      <Text
        x={titleCenterX - titleWidth / 2}
        y={titleCenterY - titleHeight / 2}
        width={titleWidth}
        height={titleHeight}
        alignHorizontal="center"
        alignVertical="middle"
        fontSize={24}
        fontWeight="bold"
        fill={themeColors.colorText}
        data-element-type={ElementTypeEnum.Title}
      >
        {title}
      </Text>
      <ItemsGroup>{itemElements}</ItemsGroup>
      <BtnsGroup>{btnElements}</BtnsGroup>
    </Group>
  );
};

registerStructure('list-sector', {
  component: ListSector,
  composites: ['title', 'item'],
});
