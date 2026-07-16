import {
  cloneElement,
  createLayout,
  getElementBounds,
  getElementsBounds,
  Group,
  type GroupProps,
} from '../../jsx';

export interface AlignLayoutProps extends GroupProps {
  horizontal?: 'left' | 'center' | 'right';
  vertical?: 'top' | 'middle' | 'bottom';
}

export const AlignLayout = createLayout<AlignLayoutProps>(
  (children, { horizontal, vertical, ...props }) => {
    if (!children || children.length === 0) {
      return <Group {...props} />;
    }

    const childBounds = children.map((child) => getElementBounds(child));
    const childrenBounds = getElementsBounds(children);

    const containerX = props.x ?? childrenBounds.x;
    const containerY = props.y ?? childrenBounds.y;
    const containerWidth = props.width ?? childrenBounds.width;
    const containerHeight = props.height ?? childrenBounds.height;

    const positionedChildren = children.map((child, index) => {
      const bounds = childBounds[index];
      const childProps = { ...child.props };

      if (horizontal !== undefined) {
        switch (horizontal) {
          case 'left':
            childProps.x = -bounds.x;
            break;
          case 'center':
            childProps.x = (containerWidth - bounds.width) / 2 - bounds.x;
            break;
          case 'right':
            childProps.x = containerWidth - bounds.width - bounds.x;
            break;
        }
      } else if (childProps.x === undefined) {
        childProps.x = bounds.x - containerX;
      }

      if (vertical !== undefined) {
        switch (vertical) {
          case 'top':
            childProps.y = -bounds.y;
            break;
          case 'middle':
            childProps.y = (containerHeight - bounds.height) / 2 - bounds.y;
            break;
          case 'bottom':
            childProps.y = containerHeight - bounds.height - bounds.y;
            break;
        }
      } else if (childProps.y === undefined) {
        childProps.y = bounds.y - containerY;
      }

      return cloneElement(child, childProps);
    });

    const containerProps = {
      ...props,
      x: containerX,
      y: containerY,
      width: containerWidth,
      height: containerHeight,
    };

    return <Group {...containerProps}>{positionedChildren}</Group>;
  },
);
