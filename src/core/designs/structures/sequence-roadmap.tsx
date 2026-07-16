import type { ComponentType } from '../../jsx';
import { Group, Path, Rect } from '../../jsx';
import { ItemsGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import { getPaletteColor } from './types';
import type { BaseStructureProps } from './types';

export interface SequenceRoadmapProps extends BaseStructureProps {
  gap?: number;
  roadWidth?: number;
}

export const SequenceRoadmap: ComponentType<SequenceRoadmapProps> = (props) => {
  const { Title, Item, data, gap = 200, roadWidth = 60, options } = props;
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  const itemElements: JSX.Element[] = [];
  const pathElements: JSX.Element[] = [];

  const roadHeight = 12;
  const totalWidth = (items.length - 1) * gap;

  pathElements.push(
    <Rect
      x={0}
      y={-roadHeight / 2}
      width={totalWidth}
      height={roadHeight}
      fill="#666"
      data-element-type="shape"
    />,
  );

  items.forEach((item, index) => {
    const indexes = [index];
    const x = index * gap;

    const color = getPaletteColor(options, indexes);

    pathElements.push(
      <circle
        cx={x}
        cy={0}
        r={roadWidth / 2}
        fill={color}
        data-element-type="shape"
      />,
    );

    const yOffset = index % 2 === 0 ? -roadWidth - 20 : 20;

    itemElements.push(
      <Item
        indexes={indexes}
        datum={item}
        data={data}
        x={x - roadWidth / 2}
        y={yOffset}
        width={roadWidth}
        height={roadWidth}
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
        <ItemsGroup>{pathElements}</ItemsGroup>
        <ItemsGroup>{itemElements}</ItemsGroup>
      </Group>
    </FlexLayout>
  );
};

registerStructure('sequence-roadmap', {
  component: SequenceRoadmap,
  composites: ['title', 'item'],
});
