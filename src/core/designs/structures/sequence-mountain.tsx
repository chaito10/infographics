import type { ComponentType } from '../../jsx';
import { Group, Path } from '../../jsx';
import { ItemsGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import { getPaletteColor } from './types';
import type { BaseStructureProps } from './types';

export interface SequenceMountainProps extends BaseStructureProps {
  gap?: number;
  baseHeight?: number;
}

export const SequenceMountain: ComponentType<SequenceMountainProps> = (
  props,
) => {
  const { Title, Item, data, gap = 20, baseHeight = 100, options } = props;
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  const itemElements: JSX.Element[] = [];
  const pathElements: JSX.Element[] = [];

  const totalWidth = items.length * gap;

  items.forEach((item, index) => {
    const indexes = [index];
    const x = index * gap;
    const height = baseHeight + (items.length - index) * 20;

    const color = getPaletteColor(options, indexes);

    pathElements.push(
      <Path
        d={`M ${x} ${0} L ${x + gap} ${0} L ${x + gap / 2} ${-height} Z`}
        fill={color}
        width={gap}
        height={height}
        data-element-type="shape"
      />,
    );

    itemElements.push(
      <Item
        indexes={indexes}
        datum={item}
        data={data}
        x={x}
        y={-height - 30}
        width={gap}
        height={30}
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

registerStructure('sequence-mountain', {
  component: SequenceMountain,
  composites: ['title', 'item'],
});
