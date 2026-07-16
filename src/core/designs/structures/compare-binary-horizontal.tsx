import type { ComponentType } from '../../jsx';
import { Group, Path } from '../../jsx';
import { ItemsGroup, ShapesGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import { getPaletteColor } from './types';
import type { BaseStructureProps } from './types';

export interface CompareBinaryHorizontalProps extends BaseStructureProps {
  gap?: number;
  dividerWidth?: number;
}

export const CompareBinaryHorizontal: ComponentType<
  CompareBinaryHorizontalProps
> = (props) => {
  const {
    Title,
    Item,
    data,
    gap = 40,
    dividerWidth = 4,
    options,
  } = props;
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  const leftItems = items.filter((_, index) => index % 2 === 0);
  const rightItems = items.filter((_, index) => index % 2 === 1);

  const itemElements: JSX.Element[] = [];
  const shapeElements: JSX.Element[] = [];

  leftItems.forEach((item, index) => {
    const indexes = [index * 2];
    const color = getPaletteColor(options, indexes);

    shapeElements.push(
      <Path
        d={`M 0 ${index * 100} L 200 ${index * 100} L 200 ${(index + 1) * 100} L 0 ${(index + 1) * 100} Z`}
        fill={color}
        width={200}
        height={100}
        data-element-type="shape"
      />,
    );

    itemElements.push(
      <Item
        indexes={indexes}
        datum={item}
        data={data}
        x={0}
        y={index * 100}
        width={200}
        height={100}
        positionH="center"
      />,
    );
  });

  rightItems.forEach((item, index) => {
    const indexes = [index * 2 + 1];
    const color = getPaletteColor(options, indexes);

    shapeElements.push(
      <Path
        d={`M 0 ${index * 100} L 200 ${index * 100} L 200 ${(index + 1) * 100} L 0 ${(index + 1) * 100} Z`}
        fill={color}
        width={200}
        height={100}
        data-element-type="shape"
      />,
    );

    itemElements.push(
      <Item
        indexes={indexes}
        datum={item}
        data={data}
        x={200 + gap}
        y={index * 100}
        width={200}
        height={100}
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
        <ShapesGroup>{shapeElements}</ShapesGroup>
        <ItemsGroup>{itemElements}</ItemsGroup>
        <rect
          x={200 + gap / 2 - dividerWidth / 2}
          y={0}
          width={dividerWidth}
          height={Math.max(leftItems.length, rightItems.length) * 100}
          fill="#666"
          data-element-type="shape"
        />
      </Group>
    </FlexLayout>
  );
};

registerStructure('compare-binary-horizontal', {
  component: CompareBinaryHorizontal,
  composites: ['title', 'item'],
});
