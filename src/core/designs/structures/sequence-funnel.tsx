import type { ComponentType } from '../../jsx';
import { Group, Path } from '../../jsx';
import { ItemsGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import { getPaletteColor } from './types';
import type { BaseStructureProps } from './types';

export interface SequenceFunnelProps extends BaseStructureProps {
  gap?: number;
  neckWidth?: number;
}

export const SequenceFunnel: ComponentType<SequenceFunnelProps> = (props) => {
  const { Title, Item, data, gap = 10, neckWidth = 50, options } = props;
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  const itemElements: JSX.Element[] = [];
  const pathElements: JSX.Element[] = [];

  const baseWidth = 300;
  const baseHeight = 80;
  const totalHeight = items.length * (baseHeight + gap);

  items.forEach((item, index) => {
    const indexes = [index];
    const progress = index / Math.max(1, items.length - 1);
    const currentWidth = baseWidth - (baseWidth - neckWidth) * progress;
    const x = (baseWidth - currentWidth) / 2;
    const y = index * (baseHeight + gap);

    const color = getPaletteColor(options, indexes);

    pathElements.push(
      <Path
        d={`M ${x} ${y} L ${x + currentWidth} ${y} L ${x + currentWidth} ${y + baseHeight} L ${x} ${y + baseHeight} Z`}
        fill={color}
        width={currentWidth}
        height={baseHeight}
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
        width={currentWidth}
        height={baseHeight}
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

registerStructure('sequence-funnel', {
  component: SequenceFunnel,
  composites: ['title', 'item'],
});
