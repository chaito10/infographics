import type { ComponentType } from '../../jsx';
import { Group } from '../../jsx';
import { ItemsGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import type { BaseStructureProps } from './types';

export interface SequenceTimelineProps extends BaseStructureProps {
  gap?: number;
  showLine?: boolean;
}

export const SequenceTimeline: ComponentType<SequenceTimelineProps> = (
  props,
) => {
  const { Title, Item, data, gap = 20, showLine = true } = props;
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  const itemElements: JSX.Element[] = [];

  items.forEach((item, index) => {
    const indexes = [index];
    itemElements.push(
      <Item
        indexes={indexes}
        datum={item}
        data={data}
        x={index * gap}
        y={0}
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
        {showLine && (
          <rect
            x={0}
            y={-2}
            width={Math.max(0, (items.length - 1) * gap)}
            height={4}
            fill="currentColor"
            opacity={0.3}
          />
        )}
        <ItemsGroup>{itemElements}</ItemsGroup>
      </Group>
    </FlexLayout>
  );
};

registerStructure('sequence-timeline', {
  component: SequenceTimeline,
  composites: ['title', 'item'],
});
