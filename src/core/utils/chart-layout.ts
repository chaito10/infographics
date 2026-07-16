// Minimal d3-like utilities for chart layouts

export function scaleLinear(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const domainSpan = d1 - d0 || 1;
  const rangeSpan = r1 - r0;
  const scale = (value: number) => r0 + ((value - d0) / domainSpan) * rangeSpan;
  scale.domain = () => domain;
  scale.range = () => range;
  scale.copy = () => scaleLinear(domain, range);
  return scale;
}

export function scaleBand(domain: string[], range: [number, number], padding = 0.1) {
  const [r0, r1] = range;
  const n = domain.length;
  const step = (r1 - r0) / (n + padding * (n - 1) + padding);
  const bandwidth = step * (1 - padding);
  const map = new Map<string, number>();
  domain.forEach((d, i) => {
    map.set(d, r0 + step * padding + i * (step + bandwidth * padding / (1 - padding)));
  });
  const scale = (value: string) => map.get(value) || 0;
  scale.domain = () => domain;
  scale.range = () => range;
  scale.bandwidth = () => bandwidth;
  return scale;
}

export function pie() {
  const sort = null;
  const fn = (data: any[]) => {
    const total = data.reduce((s, d) => s + (d.value || 1), 0);
    let angle = -Math.PI / 2;
    return data.map((d) => {
      const value = d.value || 1;
      const startAngle = angle;
      const endAngle = angle + (value / total) * 2 * Math.PI;
      angle = endAngle;
      return { ...d, startAngle, endAngle, value, padAngle: 0 };
    });
  };
  return fn;
}

export function arc() {
  return (d: { startAngle: number; endAngle: number; innerRadius?: number; outerRadius?: number }) => {
    const { startAngle, endAngle, innerRadius = 0, outerRadius = 100 } = d;
    const midAngle = (startAngle + endAngle) / 2;
    const midRadius = (innerRadius + outerRadius) / 2;
    const x = Math.cos(midAngle) * midRadius;
    const y = Math.sin(midAngle) * midRadius;
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    if (innerRadius > 0) {
      const ix1 = Math.cos(startAngle) * innerRadius;
      const iy1 = Math.sin(startAngle) * innerRadius;
      const ix2 = Math.cos(endAngle) * innerRadius;
      const iy2 = Math.sin(endAngle) * innerRadius;
      const ox1 = Math.cos(startAngle) * outerRadius;
      const oy1 = Math.sin(startAngle) * outerRadius;
      const ox2 = Math.cos(endAngle) * outerRadius;
      const oy2 = Math.sin(endAngle) * outerRadius;
      return `M ${ox1} ${oy1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    }
    const x1 = Math.cos(startAngle) * outerRadius;
    const y1 = Math.sin(startAngle) * outerRadius;
    const x2 = Math.cos(endAngle) * outerRadius;
    const y2 = Math.sin(endAngle) * outerRadius;
    return `M 0 0 L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };
}

// Simple tree layout
export function treeLayout(root: any, width: number, height: number) {
  const nodes: any[] = [];
  function assign(node: any, x0: number, x1: number, y: number) {
    const cx = (x0 + x1) / 2;
    nodes.push({ ...node, x: cx, y, data: node });
    if (node.children) {
      const childWidth = (x1 - x0) / node.children.length;
      node.children.forEach((child: any, i: number) => {
        assign(child, x0 + i * childWidth, x0 + (i + 1) * childWidth, y + height);
      });
    }
  }
  assign(root, 0, width, 0);
  return nodes;
}

// Simple force simulation for network layout
export function forceSimulation(nodes: any[], edges: any[], width: number, height: number, iterations = 50) {
  // Place nodes in a circle
  const n = nodes.length;
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 3;

  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / n;
    node.x = cx + r * Math.cos(angle);
    node.y = cy + r * Math.sin(angle);
  });

  // Simple iterative relaxation
  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between nodes
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 1000 / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[i].x -= fx;
        nodes[i].y -= fy;
        nodes[j].x += fx;
        nodes[j].y += fy;
      }
    }
    // Attraction along edges
    for (const edge of edges) {
      const source = nodes.find((n) => n.id === edge.source || n.id === edge.from);
      const target = nodes.find((n) => n.id === edge.target || n.id === edge.to);
      if (!source || !target) continue;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 100) * 0.01;
      source.x += (dx / dist) * force;
      source.y += (dy / dist) * force;
      target.x -= (dx / dist) * force;
      target.y -= (dy / dist) * force;
    }
    // Center gravity
    for (const node of nodes) {
      node.x += (cx - node.x) * 0.01;
      node.y += (cy - node.y) * 0.01;
      node.x = Math.max(50, Math.min(width - 50, node.x));
      node.y = Math.max(50, Math.min(height - 50, node.y));
    }
  }

  return { nodes, edges };
}
