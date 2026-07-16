import type { ComponentType } from '../../jsx';
import { Group, Path } from '../../jsx';
import { ItemsGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import { getPaletteColor } from './types';
import type { BaseStructureProps } from './types';

export interface SequenceInteractionProps extends BaseStructureProps {
  gap?: number;
  connectorLength?: number;
}

export const SequenceInteraction: ComponentType<SequenceInteractionProps> = (
  props,
) => {
  const {
    Title,
    Item,
    data,
    gap = 200,
    connectorLength = 100,
    options,
  } = props;
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  const itemElements: JSX.Element[] = [];
  const pathElements: JSX.Element[] = [];

  items.forEach((item, index) => {
    const indexes = [index];
    const x = index * gap;
    const y = 0;

    const color = getPaletteColor(options, indexes);

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
      const nextX = (index + 1) * gap;
      const midX = x + gap / 2;

      pathElements.push(
        <Path
          d={`M ${x + 60} ${y + 30} L ${nextX} ${y + 30}`}
          stroke={color}
          strokeWidth={3}
          fill="none"
          width={gap - 120}
          height={0}
          data-element-type="shape"
        />,
      );

      pathElements.push(
        <Path
          d={`M ${midX} ${y + 20} L ${midX + 10} ${y + 30} L ${midX} ${y + 40}`}
          stroke={color}
          strokeWidth={2}
          fill="none"
          width={10}
          height={20}
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
        <ItemsGroup>{pathElements}</ItemsGroup>
        <ItemsGroup>{itemElements}</ItemsGroup>
      </Group>
    </FlexLayout>
  );
};

registerStructure('sequence-interaction', {
  component: SequenceInteraction,
  composites: ['title', 'item'],
});
