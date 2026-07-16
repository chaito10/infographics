import type { ComponentType } from '../../jsx';
import { Group, Path } from '../../jsx';
import { ItemsGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import { getPaletteColor } from './types';
import type { BaseStructureProps } from './types';

export interface SequenceZigzagProps extends BaseStructureProps {
  gap?: number;
  zigzagHeight?: number;
}

export const SequenceZigzag: ComponentType<SequenceZigzagProps> = (props) => {
  const { Title, Item, data, gap = 200, zigzagHeight = 100, options } = props;
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  const itemElements: JSX.Element[] = [];
  const pathElements: JSX.Element[] = [];

  const totalWidth = (items.length - 1) * gap;

  let pathD = `M 0 0`;
  items.forEach((_, index) => {
    if (index > 0) {
      const x = index * gap;
      const y = index % 2 === 0 ? 0 : zigzagHeight;
      pathD += ` L ${x} ${y}`;
    }
  });

  pathElements.push(
    <Path
      d={pathD}
      stroke="#666"
      strokeWidth={4}
      fill="none"
      width={totalWidth}
      height={zigzagHeight}
      data-element-type="shape"
    />,
  );

  items.forEach((item, index) => {
    const indexes = [index];
    const x = index * gap;
    const y = index % 2 === 0 ? 0 : zigzagHeight;

    const color = getPaletteColor(options, indexes);

    pathElements.push(
      <circle
        cx={x}
        cy={y}
        r={20}
        fill={color}
        data-element-type="shape"
      />,
    );

    const yOffset = index % 2 === 0 ? -60 : 40;

    itemElements.push(
      <Item
        indexes={indexes}
        datum={item}
        data={data}
        x={x - 30}
        y={y + yOffset}
        width={60}
        height={40}
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

registerStructure('sequence-zigzag', {
  component: SequenceZigzag,
  composites: ['title', 'item'],
});
