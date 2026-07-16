import type { BaseItemProps } from '../items/types';

/**
 * Split component props from container props
 */
export function getItemProps<T extends BaseItemProps>(
  props: T,
  extKeys: string[] = [],
) {
  const restProps: Record<string, any> = { ...props };
  const extProps: T = {} as any;

  const keys = [
    'indexes',
    'data',
    'datum',
    'positionH',
    'positionV',
    'themeColors',
    'valueFormatter',
    ...extKeys,
  ];

  keys.forEach((key) => {
    if (key in restProps) {
      extProps[key as keyof T] = restProps[key];
      delete restProps[key];
    }
  });

  ['x', 'y', 'width', 'height'].forEach((key) => {
    if (key in props) {
      restProps[key] = props[key];
    }
  });

  return [extProps, restProps] as const;
}

export function getItemComponent(
  Items: any[],
  level?: number,
) {
  if (Items.length === 0) return () => null;
  if (level === undefined) return Items[0];
  return Items[level] ?? Items[0];
}
