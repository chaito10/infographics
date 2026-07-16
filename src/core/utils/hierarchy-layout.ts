// Simple mindmap layout replacement for @antv/hierarchy

export interface HierarchyNode {
  id: string;
  data: any;
  depth: number;
  height: number;
  x: number;
  y: number;
  width: number;
  height_: number;
  parent?: HierarchyNode;
  children: HierarchyNode[];
}

export interface HierarchyDatum {
  id?: string;
  children?: HierarchyDatum[];
  [key: string]: any;
}

interface LayoutConfig {
  width?: number;
  height?: number;
  nodesep?: number;
  ranksep?: number;
}

function buildTree(data: HierarchyDatum, depth = 0, parent?: HierarchyNode): HierarchyNode {
  const children = (data.children || []).map((child) => buildTree(child, depth + 1));
  const node: HierarchyNode = {
    id: data.id || `n-${depth}-${Math.random().toString(36).slice(2, 6)}`,
    data,
    depth,
    height: children.length ? 1 + Math.max(...children.map((c) => c.height)) : 1,
    x: 0,
    y: 0,
    width: 120,
    height_: 40,
    parent,
    children,
  };
  children.forEach((c) => (c.parent = node));
  return node;
}

function layoutSubtree(node: HierarchyNode, config: LayoutConfig): { width: number; height: number } {
  const { nodesep = 10, ranksep = 60 } = config;

  if (node.children.length === 0) {
    return { width: node.width, height: node.height_ };
  }

  let totalChildHeight = 0;
  const childSizes: Array<{ width: number; height: number }> = [];

  node.children.forEach((child, i) => {
    const size = layoutSubtree(child, config);
    childSizes.push(size);
    totalChildHeight += size.height;
    if (i > 0) totalChildHeight += nodesep;
  });

  const subtreeWidth = node.width + ranksep + Math.max(...childSizes.map((s) => s.width));
  const subtreeHeight = Math.max(node.height_, totalChildHeight);

  // Position children vertically centered
  let y = (subtreeHeight - totalChildHeight) / 2;
  node.children.forEach((child, i) => {
    const size = childSizes[i];
    child.x = node.x + node.width + ranksep;
    child.y = y;
    y += size.height + nodesep;
  });

  return { width: subtreeWidth, height: subtreeHeight };
}

function centerParent(node: HierarchyNode): void {
  if (node.children.length > 0) {
    const firstY = node.children[0].y;
    const lastY = node.children[node.children.length - 1].y;
    node.y = (firstY + lastY) / 2;
  }
  node.children.forEach(centerParent);
}

export function mindmap(data: HierarchyDatum, config: LayoutConfig = {}): HierarchyNode {
  const root = buildTree(data);
  layoutSubtree(root, config);
  centerParent(root);
  return root;
}

export function hierarchy(data: HierarchyDatum): HierarchyNode {
  return buildTree(data);
}
