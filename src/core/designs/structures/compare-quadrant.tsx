import type { ComponentType } from '../../jsx';
import { Group, Path, Rect } from '../../jsx';
import { ItemsGroup, ShapesGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import { getPaletteColor } from './types';
import type { BaseStructureProps } from './types';

export interface CompareQuadrantProps extends BaseStructureProps {
  gap?: number;
  quadrantSize?: number;
}

export const CompareQuadrant: ComponentType<CompareQuadrantProps> = (props) => {
  const { Title, Item, data, gap = 20, quadrantSize = 200, options } = props;
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  const itemElements: JSX.Element[] = [];
  const shapeElements: JSX.Element[] = [];

  const quadrants = [
    { x: 0, y: 0 },
    { x: quadrantSize + gap, y: 0 },
    { x: 0, y: quadrantSize + gap },
    { x: quadrantSize + gap, y: quadrantSize + gap },
  ];

  items.forEach((item, index) => {
    if (index >= 4) return;

    const indexes = [index];
    const quadrant = quadrants[index];
    const color = getPaletteColor(options, indexes);

    shapeElements.push(
      <Rect
        x={quadrant.x}
        y={quadrant.y}
        width={quadrantSize}
        height={quadrantSize}
        fill={color}
        data-element-type="shape"
      />,
    );

    itemElements.push(
      <Item
        indexes={indexes}
        datum={item}
        data={data}
        x={quadrant.x}
        y={quadrant.y}
        width={quadrantSize}
        height={quadrantSize}
        positionH="center"
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
        <ShapesGroup>{shapeElements}</ShapesGroup>
        <ItemsGroup>{itemElements}</ItemsGroup>
      </Group>
    </FlexLayout>
  );
};

registerStructure('compare-quadrant', {
  component: CompareQuadrant,
  composites: ['title', 'item'],
});
