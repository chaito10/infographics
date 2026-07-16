import type { ComponentType } from '../../jsx';
import { Group } from '../../jsx';
import { ItemsGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import type { BaseStructureProps } from './types';

export interface SequenceSnakeProps extends BaseStructureProps {
  gap?: number;
  rowHeight?: number;
  columns?: number;
}

export const SequenceSnake: ComponentType<SequenceSnakeProps> = (props) => {
  const { Title, Item, data, gap = 20, rowHeight = 150, columns = 3 } = props;
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  const itemElements: JSX.Element[] = [];

  items.forEach((item, index) => {
    const indexes = [index];
    const row = Math.floor(index / columns);
    const col = index % columns;
    const isReversed = row % 2 === 1;
    const actualCol = isReversed ? columns - 1 - col : col;

    itemElements.push(
      <Item
        indexes={indexes}
        datum={item}
        data={data}
        x={actualCol * gap}
        y={row * rowHeight}
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
        <ItemsGroup>{itemElements}</ItemsGroup>
      </Group>
    </FlexLayout>
  );
};

registerStructure('sequence-snake', {
  component: SequenceSnake,
  composites: ['title', 'item'],
});
