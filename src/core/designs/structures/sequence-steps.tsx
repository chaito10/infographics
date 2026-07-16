import type { ComponentType } from '../../jsx';
import { Group } from '../../jsx';
import { ItemsGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import type { BaseStructureProps } from './types';

export interface SequenceStepsProps extends BaseStructureProps {
  gap?: number;
  verticalGap?: number;
}

export const SequenceSteps: ComponentType<SequenceStepsProps> = (props) => {
  const { Title, Item, data, gap = 20, verticalGap = 20 } = props;
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
        y={index * verticalGap}
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

registerStructure('sequence-steps', {
  component: SequenceSteps,
  composites: ['title', 'item'],
});
