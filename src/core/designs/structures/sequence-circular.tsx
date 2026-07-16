import type { ComponentType } from '../../jsx';
import { Ellipse, Group } from '../../jsx';
import { ItemsGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import { getPaletteColor } from './types';
import type { BaseStructureProps } from './types';

export interface SequenceCircularProps extends BaseStructureProps {
  radius?: number;
  gap?: number;
}

export const SequenceCircular: ComponentType<SequenceCircularProps> = (
  props,
) => {
  const { Title, Item, data, radius = 200, gap = 20, options } = props;
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  const itemElements: JSX.Element[] = [];
  const circleElements: JSX.Element[] = [];

  const centerX = radius + 100;
  const centerY = radius + 100;

  items.forEach((item, index) => {
    const indexes = [index];
    const angle = (index / items.length) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle) - 30;
    const y = centerY + radius * Math.sin(angle) - 30;

    const color = getPaletteColor(options, indexes);

    circleElements.push(
      <Ellipse
        x={x}
        y={y}
        width={60}
        height={60}
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
        width={60}
        height={60}
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
        <ItemsGroup>{circleElements}</ItemsGroup>
        <ItemsGroup>{itemElements}</ItemsGroup>
      </Group>
    </FlexLayout>
  );
};

registerStructure('sequence-circular', {
  component: SequenceCircular,
  composites: ['title', 'item'],
});
