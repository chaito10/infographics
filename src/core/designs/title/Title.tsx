import { jsx, Text } from '../../jsx';

export function Title(props: any) {
  const { data, options } = props;
  const title = data?.title;
  if (!title) return null;

  const width = options?.width || 800;
  return jsx(Text as any, {
    x: 0,
    y: 0,
    width,
    height: 40,
    fontSize: 24,
    fontWeight: 'bold',
    fill: '#333',
    alignHorizontal: 'center',
    children: title,
  });
}
