// Simple DagreLayout replacement for directed graph layout
// Positions nodes in a hierarchical top-to-bottom layout

export interface DagreNode {
  id: string;
  [key: string]: any;
}

export interface DagreEdge {
  source: string;
  target: string;
  [key: string]: any;
}

export interface DagreLayoutOptions {
  nodes?: DagreNode[];
  edges?: DagreEdge[];
  rankdir?: 'TB' | 'BT' | 'LR' | 'RL';
  nodesep?: number;
  ranksep?: number;
  align?: string;
  begin?: [number, number];
}

export interface LayoutResult {
  nodes: Array<DagreNode & { x: number; y: number }>;
  edges: DagreEdge[];
}

export class DagreLayout {
  private options: DagreLayoutOptions;

  constructor(options: DagreLayoutOptions = {}) {
    this.options = options;
  }

  layout(data?: { nodes: DagreNode[]; edges: DagreEdge[] }): LayoutResult {
    const { nodes = [], edges = [] } = data || this.options;
    const {
      rankdir = 'TB',
      nodesep = 50,
      ranksep = 60,
      begin = [0, 0],
    } = this.options;

    // Build adjacency
    const children = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    nodes.forEach((n) => {
      children.set(n.id, []);
      inDegree.set(n.id, 0);
    });
    edges.forEach((e) => {
      children.get(e.source)?.push(e.target);
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    });

    // Topological sort (Kahn's)
    const queue: string[] = [];
    inDegree.forEach((deg, id) => {
      if (deg === 0) queue.push(id);
    });

    const ranks = new Map<string, number>();
    const order: string[] = [];
    while (queue.length > 0) {
      const node = queue.shift()!;
      order.push(node);
      const currentRank = ranks.get(node) || 0;
      for (const child of children.get(node) || []) {
        const newRank = currentRank + 1;
        ranks.set(child, Math.max(ranks.get(child) || 0, newRank));
        const deg = (inDegree.get(child) || 1) - 1;
        inDegree.set(child, deg);
        if (deg === 0) queue.push(child);
      }
    }

    // Assign positions
    const rankNodes = new Map<number, string[]>();
    order.forEach((id) => {
      const r = ranks.get(id) || 0;
      if (!rankNodes.has(r)) rankNodes.set(r, []);
      rankNodes.get(r)!.push(id);
    });

    const nodeWidth = 120;
    const nodeHeight = 40;
    const positioned = new Map<string, { x: number; y: number }>();

    const isHorizontal = rankdir === 'LR' || rankdir === 'RL';

    rankNodes.forEach((nodeIds, rank) => {
      const totalWidth = nodeIds.length * nodeWidth + (nodeIds.length - 1) * nodesep;
      nodeIds.forEach((id, i) => {
        const x = i * (nodeWidth + nodesep) - totalWidth / 2 + nodeWidth / 2;
        const y = rank * (nodeHeight + ranksep);
        positioned.set(id, isHorizontal ? { x: y, y: x } : { x, y });
      });
    });

    const resultNodes = nodes.map((n) => {
      const pos = positioned.get(n.id) || { x: 0, y: 0 };
      return { ...n, x: pos.x + begin[0], y: pos.y + begin[1] };
    });

    return { nodes: resultNodes, edges: [...edges] };
  }
}
