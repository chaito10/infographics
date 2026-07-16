import type { ComponentType } from '../../jsx';
import { Group, Path } from '../../jsx';
import { ItemsGroup, ShapesGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import { getPaletteColor } from './types';
import type { BaseStructureProps } from './types';

export interface CompareHierarchyRowProps extends BaseStructureProps {
  gap?: number;
  levelHeight?: number;
}

export const CompareHierarchyRow: ComponentType<CompareHierarchyRowProps> = (
  props,
) => {
  const { Title, Item, data, gap = 200, levelHeight = 100, options } = props;
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  const itemElements: JSX.Element[] = [];
  const pathElements: JSX.Element[] = [];

  items.forEach((item, index) => {
    const indexes = [index];
    const x = index * gap;
    const y = 0;

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

    if (index < items.length - 1) {
      pathElements.push(
        <Path
          d={`M ${x + 120} ${y + 30} L ${x + gap} ${y + 30}`}
          stroke="#666"
          strokeWidth={2}
          fill="none"
          width={gap - 120}
          height={0}
          data-element-type="shape"
        />,
      );
    }
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

registerStructure('compare-hierarchy-row', {
  component: CompareHierarchyRow,
  composites: ['title', 'item'],
});
