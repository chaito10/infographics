export type HierarchyColorMode =
  | 'level'
  | 'branch'
  | 'node'
  | 'node-flat'
  | 'group';

export interface HierarchyNode {
  depth: number;
  originalIndexes: number[];
  flatIndex?: number;
}

export function getHierarchyColorIndexes(
  node: HierarchyNode,
  mode: HierarchyColorMode,
): number[] {
  const { depth, originalIndexes, flatIndex } = node;

  switch (mode) {
    case 'level':
      return [depth];

    case 'branch':
      if (depth === 0) {
        return [0];
      } else if (depth === 1) {
        return [originalIndexes[1] + 1];
      } else {
        return [originalIndexes[1] + 1];
      }

    case 'node':
      return originalIndexes;

    case 'node-flat':
      if (flatIndex !== undefined) {
        return [flatIndex];
      }
      console.warn(
        'node-flat mode requires flatIndex in HierarchyNode, falling back to originalIndexes',
      );
      return originalIndexes;

    default:
      return [0];
  }
}

export function extractHierarchyNode(d3Node: any): HierarchyNode {
  return {
    depth: d3Node.depth,
    originalIndexes: d3Node.data._originalIndex || [],
  };
}
