import type { ComponentType } from '../../jsx';
import { Ellipse, Group, Path } from '../../jsx';
import { ItemsGroup } from '../components';
import { FlexLayout } from '../layouts';
import { registerStructure } from './registry';
import { getPaletteColor } from './types';
import type { BaseStructureProps } from './types';

export interface SequenceCylinder3dProps extends BaseStructureProps {
  width?: number;
  gap?: number;
  cylinderHeight?: number;
}

export const SequenceCylinder3d: ComponentType<SequenceCylinder3dProps> = (
  props,
) => {
  const {
    Title,
    Item,
    data,
    width = 120,
    gap = 20,
    cylinderHeight = 60,
    options,
  } = props;
  const { title, desc, items = [] } = data;

  const titleContent = Title ? <Title title={title} desc={desc} /> : null;

  const itemElements: JSX.Element[] = [];
  const cylinderElements: JSX.Element[] = [];

  items.forEach((item, index) => {
    const indexes = [index];
    const x = index * (width + gap);
    const y = 0;

    const color = getPaletteColor(options, indexes);

    const ellipseHeight = 20;

    cylinderElements.push(
      <Rect
        x={x}
        y={y}
        width={width}
        height={cylinderHeight}
        fill={color}
        data-element-type="shape"
      />,
    );

    cylinderElements.push(
      <Ellipse
        x={x}
        y={y - ellipseHeight / 2}
        width={width}
        height={ellipseHeight}
        fill={color}
        data-element-type="shape"
      />,
    );

    cylinderElements.push(
      <Ellipse
        x={x}
        y={y + cylinderHeight - ellipseHeight / 2}
        width={width}
        height={ellipseHeight}
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
        width={width}
        height={cylinderHeight}
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
        <ItemsGroup>{cylinderElements}</ItemsGroup>
        <ItemsGroup>{itemElements}</ItemsGroup>
      </Group>
    </FlexLayout>
  );
};

registerStructure('sequence-cylinder3d', {
  component: SequenceCylinder3d,
  composites: ['title', 'item'],
});
