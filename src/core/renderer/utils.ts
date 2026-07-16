import type { DynamicAttributes } from '../themes/types';

export function parseDynamicAttributes<T extends object>(
  node: SVGElement,
  attributes: DynamicAttributes<T>,
): T {
  const attrs = Object.entries(attributes).reduce((acc, [key, value]) => {
    if (typeof value === 'function') {
      const staticValue = value(node.getAttribute(key), node);
      if (staticValue !== undefined && staticValue !== null)
        acc[key as keyof T] = staticValue;
    } else {
      Object.assign(acc, { [key]: value });
    }
    return acc;
  }, {} as T);

  return attrs;
}

export function getSafetyId(id: string) {
  return id.replace(/#|%|\.| |\/|\(|\)/g, '').replace(/,/g, '-');
}
