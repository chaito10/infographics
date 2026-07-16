import type { ComponentType } from '../../jsx';
import { Group, Rect } from '../../jsx';
import { ItemsGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import { getPaletteColor } from './types';
import type { BaseStructureProps } from './types';

export interface SequenceStairsProps extends BaseStructureProps {
  stepWidth?: number;
  stepHeight?: number;
  gap?: number;
}

export const SequenceStairs: ComponentType<SequenceStairsProps> = (props) => {
  const {
    Title,
    Item,
    data,
    stepWidth = 150,
    stepHeight = 80,
    gap = 10,
    options,
  } = props;
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  const itemElements: JSX.Element[] = [];
  const rectElements: JSX.Element[] = [];

  items.forEach((item, index) => {
    const indexes = [index];
    const x = index * (stepWidth + gap);
    const y = -index * stepHeight;

    const color = getPaletteColor(options, indexes);

    rectElements.push(
      <Rect
        x={x}
        y={y}
        width={stepWidth}
        height={stepHeight}
        fill={color}
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
        width={stepWidth}
        height={stepHeight}
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
        <ItemsGroup>{rectElements}</ItemsGroup>
        <ItemsGroup>{itemElements}</ItemsGroup>
      </Group>
    </FlexLayout>
  );
};

registerStructure('sequence-stairs', {
  component: SequenceStairs,
  composites: ['title', 'item'],
});
