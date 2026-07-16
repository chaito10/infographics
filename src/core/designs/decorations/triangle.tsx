import { Polygon, RectProps } from '../../jsx';

export const Triangle = ({
  width = 25,
  height = 25,
  colorPrimary = '#6699FF',
  rotation = 0,
  strokeWidth = 4,
  ...rest
}: RectProps & {
  colorPrimary: string;
  rotation?: number;
}) => {
  const points = [
    { x: width / 2, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];

  const centerX = width / 2;
  const centerY = height / 2;
  const transform = `rotate(${rotation} ${centerX} ${centerY})`;

  return (
    <Polygon
      {...rest}
      width={width}
      height={height}
      points={points}
      fill={colorPrimary}
      stroke={colorPrimary}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      transform={transform}
    />
  );
};
