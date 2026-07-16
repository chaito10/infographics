import type { ComponentType } from '../../jsx';
import { Group, Path } from '../../jsx';
import { ItemsGroup, ShapesGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import { getPaletteColor } from './types';
import type { BaseStructureProps } from './types';

export interface CompareHierarchyLeftRightProps extends BaseStructureProps {
  gap?: number;
  levelHeight?: number;
}

export const CompareHierarchyLeftRight: ComponentType<
  CompareHierarchyLeftRightProps
> = (props) => {
  const { Title, Item, data, gap = 150, levelHeight = 100, options } = props;
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  const leftItems = items.filter((_, index) => index % 2 === 0);
  const rightItems = items.filter((_, index) => index % 2 === 1);

  const itemElements: JSX.Element[] = [];
  const pathElements: JSX.Element[] = [];

  leftItems.forEach((item, index) => {
    const indexes = [index * 2];
    const x = 0;
    const y = index * levelHeight;

    const color = getPaletteColor(options, indexes);

    pathElements.push(
      <Path
        d={`M ${x} ${y} L ${x + 120} ${y} L ${x + 120} ${y + 60} L ${x} ${y + 60} Z`}
        fill={color}
        width={120}
        height={60}
        data-element-type="shape"
      />,
    );

    itemElements.push(
      <Item
        indexes={indexes}
        datum={item}
        data={data}
        x={x}
        y={y}
        width={120}
        height={60}
        positionH="center"
      />,
    );

    pathElements.push(
      <Path
        d={`M ${x + 120} ${y + 30} L ${x + 120 + gap / 2} ${y + 30}`}
        stroke="#666"
        strokeWidth={2}
        fill="none"
        width={gap / 2}
        height={0}
        data-element-type="shape"
      />,
    );
  });

  rightItems.forEach((item, index) => {
    const indexes = [index * 2 + 1];
    const x = 120 + gap;
    const y = index * levelHeight;

    const color = getPaletteColor(options, indexes);

    pathElements.push(
      <Path
        d={`M ${x} ${y} L ${x + 120} ${y} L ${x + 120} ${y + 60} L ${x} ${y + 60} Z`}
        fill={color}
        width={120}
        height={60}
        data-element-type="shape"
      />,
    );

    itemElements.push(
      <Item
        indexes={indexes}
        datum={item}
        data={data}
        x={x}
        y={y}
        width={120}
        height={60}
        positionH="center"
      />,
    );

    pathElements.push(
      <Path
        d={`M ${x - gap / 2} ${y + 30} L ${x} ${y + 30}`}
        stroke="#666"
        strokeWidth={2}
        fill="none"
        width={gap / 2}
        height={0}
        data-element-type="shape"
      />,
    );
  });

  return (
    <FlexLayout
      id="infographic-container"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      {titleContent}
      <Group>
        <ShapesGroup>{pathElements}</ShapesGroup>
        <ItemsGroup>{itemElements}</ItemsGroup>
      </Group>
    </FlexLayout>
  );
};

registerStructure('compare-hierarchy-left-right', {
  component: CompareHierarchyLeftRight,
  composites: ['title', 'item'],
});
