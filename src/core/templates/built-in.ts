import { registerTemplate } from './registry';
import type { TemplateOptions } from './types';

// ============================================================================
// Chart Pie Templates
// ============================================================================

const chartPieTemplates: Record<string, TemplateOptions> = {
  'chart-pie-plain-text': {
    design: {
      title: 'default',
      structure: {
        type: 'chart-pie',
      },
      items: [
        {
          type: 'plain-text',
        },
      ],
    },
  },
  'chart-pie-compact-card': {
    design: {
      title: 'default',
      structure: {
        type: 'chart-pie',
        avoidLabelOverlap: true,
      },
      items: [
        {
          type: 'compact-card',
        },
      ],
    },
  },
  'chart-pie-pill-badge': {
    design: {
      title: 'default',
      structure: {
        type: 'chart-pie',
        avoidLabelOverlap: true,
      },
      items: [
        {
          type: 'pill-badge',
        },
      ],
    },
  },
  'chart-pie-donut-plain-text': {
    design: {
      title: 'default',
      structure: {
        type: 'chart-pie',
        innerRadius: 90,
      },
      items: [
        {
          type: 'plain-text',
        },
      ],
    },
  },
  'chart-pie-donut-compact-card': {
    design: {
      title: 'default',
      structure: {
        type: 'chart-pie',
        innerRadius: 90,
        avoidLabelOverlap: true,
      },
      items: [
        {
          type: 'compact-card',
        },
      ],
    },
  },
  'chart-pie-donut-pill-badge': {
    design: {
      title: 'default',
      structure: {
        type: 'chart-pie',
        innerRadius: 90,
        avoidLabelOverlap: true,
      },
      items: [
        {
          type: 'pill-badge',
        },
      ],
    },
  },
};

// ============================================================================
// Compare Quadrant Templates
// ============================================================================

const compareQuadrantBaseTemplates: Record<string, TemplateOptions> = {
  'compare-quadrant-quarter-simple-card': {
    design: {
      title: 'default',
      structure: { type: 'quadrant' },
      items: [{ type: 'quarter-simple-card' }],
    },
  },
  'compare-quadrant-quarter-circular': {
    design: {
      title: 'default',
      structure: { type: 'quadrant' },
      items: [{ type: 'quarter-circular' }],
    },
  },
  'compare-quadrant-simple-illus': {
    design: {
      title: 'default',
      structure: { type: 'quadrant' },
      items: [{ type: 'simple-illus' }],
    },
  },
};

const warnedKeys = new Set<string>();
const compareQuadrantTemplates: Record<string, TemplateOptions> = {};

Object.entries(compareQuadrantBaseTemplates).forEach(([key, template]) => {
  compareQuadrantTemplates[key] = template;

  const oldKey = key.replace('compare-quadrant', 'quadrant');
  compareQuadrantTemplates[oldKey] = new Proxy(template, {
    get(target, prop, receiver) {
      if (!warnedKeys.has(oldKey)) {
        console.warn(
          `[Deprecated] "${oldKey}" has been deprecated, please use "${key}"`,
        );
        warnedKeys.add(oldKey);
      }
      return Reflect.get(target, prop, receiver);
    },
  });
});

// ============================================================================
// Hierarchy Tree Templates
// ============================================================================

interface HierarchyTreeProps {
  edgeType?: string;
  edgeStyle?: string;
  edgeColorMode?: string;
  edgeMarker?: string;
  markerSize?: number;
  edgeCornerRadius?: number;
  edgeDashPattern?: string;
  edgeOffset?: number;
  edgeOrigin?: string;
  edgeOriginPadding?: number;
  edgeWidth?: number;
  orientation?: string;
}

const treeStructures: Record<string, Partial<HierarchyTreeProps>> = {
  'tech-style': {
    edgeType: 'straight',
    edgeStyle: 'solid',
    edgeColorMode: 'gradient',
    edgeMarker: 'arrow',
    markerSize: 12,
    edgeCornerRadius: 5,
  },
  'dashed-line': {
    edgeStyle: 'dashed',
    edgeCornerRadius: 10,
    edgeDashPattern: '10,5',
    edgeColorMode: 'gradient',
    edgeMarker: 'dot',
    markerSize: 6,
    edgeOffset: 6,
  },
  'distributed-origin': {
    edgeOrigin: 'distributed',
    edgeOriginPadding: 30,
    edgeMarker: 'arrow',
    edgeCornerRadius: 10,
    markerSize: 12,
    edgeColorMode: 'gradient',
  },
  'curved-line': {
    edgeType: 'curved',
    edgeColorMode: 'gradient',
    edgeMarker: 'none',
  },
  'dashed-arrow': {
    edgeType: 'straight',
    edgeStyle: 'dashed',
    edgeDashPattern: '8,4',
    edgeMarker: 'arrow',
    markerSize: 10,
    edgeCornerRadius: 0,
  },
};

const treeItems: string[] = [
  'capsule-item',
  'rounded-rect-node',
  'compact-card',
  'badge-card',
  'ribbon-card',
];

const hierarchyTreeTemplates: Record<string, TemplateOptions> = {};

const structureName = 'hierarchy-tree';
const orientationConfigs: Array<{
  key: string;
  orientation?: string;
}> = [
  { key: '' },
  { key: 'bt', orientation: 'bottom-top' },
  { key: 'lr', orientation: 'left-right' },
  { key: 'rl', orientation: 'right-left' },
];

const createTemplateName = (
  oriKey: string,
  name: string,
  item: string,
): string => {
  return oriKey
    ? `${structureName}-${oriKey}-${name}-${item}`
    : `${structureName}-${name}-${item}`;
};

for (const item of treeItems) {
  for (const [name, structureProps] of Object.entries(treeStructures)) {
    for (const { key, orientation } of orientationConfigs) {
      const templateName = createTemplateName(key, name, item);
      hierarchyTreeTemplates[templateName] = {
        design: {
          structure: {
            type: 'hierarchy-tree',
            ...(orientation ? { orientation } : {}),
            ...structureProps,
          },
          item: {
            type: item,
          },
        },
      };
    }
  }
}

// ============================================================================
// Hierarchy Mindmap Templates
// ============================================================================

interface HierarchyMindmapProps {
  edgeType?: string;
  edgeColorMode?: string;
  edgeWidth?: number;
  colorMode?: string;
  levelGap?: number;
  nodeGap?: number;
  edgeAlign?: string | number;
}

const MINDMAP_BRANCH_GRADIENT: Partial<HierarchyMindmapProps> = {
  edgeType: 'curved',
  edgeColorMode: 'gradient',
  edgeWidth: 2,
  colorMode: 'branch',
  levelGap: 80,
  nodeGap: 18,
};

const MINDMAP_LEVEL_GRADIENT: Partial<HierarchyMindmapProps> = {
  edgeType: 'curved',
  edgeWidth: 2,
  edgeColorMode: 'gradient',
  colorMode: 'level',
  levelGap: 80,
  nodeGap: 18,
};

const LINED_PALETTE = {
  type: 'lined-text',
  usePaletteColor: true,
  showUnderline: true,
  underlineThickness: 2,
};

const CAPSULE = {
  type: 'capsule-item',
};

const CIRCULAR_PROGRESS = {
  type: 'circular-progress',
};

const ROUNDED_RECT_NODE = {
  type: 'rounded-rect-node',
  positionH: 'center',
} as const;

const COMPACT_CARD = {
  type: 'compact-card',
};

const createMindmapStructure = (
  gradient: Partial<HierarchyMindmapProps>,
  edgeAlign?: HierarchyMindmapProps['edgeAlign'],
): Partial<HierarchyMindmapProps> & { type: string } => ({
  type: 'hierarchy-mindmap',
  ...(edgeAlign !== undefined ? { edgeAlign } : {}),
  ...gradient,
});

const createMindmapTemplate = (
  key: string,
  gradient: Partial<HierarchyMindmapProps>,
  item: Record<string, any>,
  edgeAlign?: HierarchyMindmapProps['edgeAlign'],
): [string, TemplateOptions] => [
  key,
  {
    design: {
      structure: createMindmapStructure(gradient, edgeAlign),
      item,
    },
  },
];

const hierarchyMindmapTemplates: Record<string, TemplateOptions> =
  Object.fromEntries([
    createMindmapTemplate(
      'hierarchy-mindmap-branch-gradient-lined-palette',
      MINDMAP_BRANCH_GRADIENT,
      LINED_PALETTE,
      'bottom',
    ),
    createMindmapTemplate(
      'hierarchy-mindmap-level-gradient-lined-palette',
      MINDMAP_LEVEL_GRADIENT,
      LINED_PALETTE,
      'bottom',
    ),
    createMindmapTemplate(
      'hierarchy-mindmap-branch-gradient-capsule-item',
      MINDMAP_BRANCH_GRADIENT,
      CAPSULE,
    ),
    createMindmapTemplate(
      'hierarchy-mindmap-level-gradient-capsule-item',
      MINDMAP_LEVEL_GRADIENT,
      CAPSULE,
    ),
    createMindmapTemplate(
      'hierarchy-mindmap-branch-gradient-circle-progress',
      MINDMAP_BRANCH_GRADIENT,
      CIRCULAR_PROGRESS,
      0.4,
    ),
    createMindmapTemplate(
      'hierarchy-mindmap-level-gradient-circle-progress',
      MINDMAP_LEVEL_GRADIENT,
      CIRCULAR_PROGRESS,
      0.4,
    ),
    createMindmapTemplate(
      'hierarchy-mindmap-branch-gradient-rounded-rect',
      MINDMAP_BRANCH_GRADIENT,
      ROUNDED_RECT_NODE,
    ),
    createMindmapTemplate(
      'hierarchy-mindmap-level-gradient-rounded-rect',
      MINDMAP_LEVEL_GRADIENT,
      ROUNDED_RECT_NODE,
    ),
    createMindmapTemplate(
      'hierarchy-mindmap-branch-gradient-compact-card',
      MINDMAP_BRANCH_GRADIENT,
      COMPACT_CARD,
    ),
    createMindmapTemplate(
      'hierarchy-mindmap-level-gradient-compact-card',
      MINDMAP_LEVEL_GRADIENT,
      COMPACT_CARD,
    ),
  ]);

// ============================================================================
// Hierarchy Structure Templates
// ============================================================================

const hierarchyStructureTemplates: Record<string, TemplateOptions> = {
  'hierarchy-structure': {
    design: {
      title: 'default',
      structure: {
        type: 'hierarchy-structure',
      },
      item: 'simple',
    },
  },
  'hierarchy-structure-mirror': {
    design: {
      title: 'default',
      structure: {
        type: 'hierarchy-structure',
        layerLabelPosition: 'right',
      },
      item: 'simple',
    },
  },
};

// ============================================================================
// List Zigzag Templates
// ============================================================================

const listZigzagTemplates: Record<string, TemplateOptions> = {
  'list-zigzag-up-compact-card': {
    design: {
      title: 'default',
      structure: {
        type: 'list-zigzag-up',
      },
      items: [
        {
          type: 'compact-card',
        },
      ],
    },
    themeConfig: {
      colorPrimary: '#17CA2C',
    },
  },
  'list-zigzag-up-simple': {
    design: {
      title: 'default',
      structure: {
        type: 'list-zigzag-up',
      },
      items: [
        {
          type: 'simple',
          usePaletteColor: true,
        },
      ],
    },
    themeConfig: {
      colorPrimary: '#17CA2C',
    },
  },
  'list-zigzag-down-compact-card': {
    design: {
      title: 'default',
      structure: {
        type: 'list-zigzag-down',
      },
      items: [
        {
          type: 'compact-card',
        },
      ],
    },
    themeConfig: {
      colorPrimary: '#17CA2C',
    },
  },
  'list-zigzag-down-simple': {
    design: {
      title: 'default',
      structure: {
        type: 'list-zigzag-down',
      },
      items: [
        {
          type: 'simple',
          usePaletteColor: true,
        },
      ],
    },
    themeConfig: {
      colorPrimary: '#17CA2C',
    },
  },
};

// ============================================================================
// Relation Dagre Flow Templates
// ============================================================================

const dagreItems = {
  'simple-circle-node': {
    type: 'simple-circle-node',
  },
  'badge-card': {
    type: 'badge-card',
  },
  capsule: {
    type: 'capsule-item',
  },
  'compact-card': {
    type: 'compact-card',
  },
} as const;

const dagreBaseStructureAttrs = {
  type: 'relation-dagre-flow',
  edgeColorMode: 'gradient',
  showArrow: true,
  arrowType: 'triangle',
  colorMode: 'node',
} as const;

const dagreStructures = {
  tb: {
    ...dagreBaseStructureAttrs,
    rankdir: 'TB',
    edgeRouting: 'orth',
  },
  lr: {
    ...dagreBaseStructureAttrs,
    rankdir: 'LR',
    edgeRouting: 'orth',
  },
  'tb-animated': {
    ...dagreBaseStructureAttrs,
    rankdir: 'TB',
    edgeCornerRadius: 12,
    edgeRouting: 'orth',
    edgeAnimation: 'ant-line',
    edgeDashPattern: '8,4',
    edgeAnimationSpeed: 1,
  },
  'lr-animated': {
    ...dagreBaseStructureAttrs,
    rankdir: 'LR',
    edgeCornerRadius: 12,
    edgeRouting: 'orth',
    edgeAnimation: 'ant-line',
    edgeDashPattern: '8,4',
    edgeAnimationSpeed: 1,
  },
};

const relationDagreFlowTemplates: Record<string, TemplateOptions> = {};

const dagreOmit = ['lr-capsule', 'tb-capsule'];
Object.entries(dagreStructures).forEach(([strKey, strAttrs]) => {
  Object.entries(dagreItems).forEach(([itemKey, itemAttrs]) => {
    const appendix = `${strKey}-${itemKey}`;
    if (dagreOmit.includes(appendix)) return;
    const templateKey = `relation-dagre-flow-${appendix}`;
    relationDagreFlowTemplates[templateKey] = {
      design: {
        title: 'default',
        structure: strAttrs,
        item: itemAttrs,
      },
    };
  });
});

// ============================================================================
// Sequence Interaction Templates
// ============================================================================

const interactionItems = {
  'badge-card': {
    type: 'badge-card',
    width: 160,
    height: 60,
  },
  'compact-card': {
    type: 'compact-card',
    width: 180,
    height: 60,
  },
  'capsule-item': {
    type: 'capsule-item',
    width: 150,
    height: 60,
  },
  'rounded-rect-node': {
    type: 'rounded-rect-node',
    width: 140,
    height: 60,
  },
} as const;

const interactionBaseStructureAttrs = {
  type: 'sequence-interaction',
  showLaneHeader: true,
  arrowType: 'triangle',
} as const;

const interactionArrowStyles = {
  default: {},
  dashed: {
    edgeStyle: 'dashed',
  },
  animated: {
    edgeStyle: 'dashed',
    animated: true,
  },
} as const;

const interactionStructures = {
  default: {
    ...interactionBaseStructureAttrs,
    showLifeline: true,
    nodeGap: 40,
  },
  compact: {
    ...interactionBaseStructureAttrs,
    showLifeline: true,
    nodeGap: 20,
  },
  wide: {
    ...interactionBaseStructureAttrs,
    showLifeline: true,
    nodeGap: 60,
  },
} as const;

const sequenceInteractionTemplates: Record<string, TemplateOptions> = {};

const interactionOmit: string[] = [];

Object.entries(interactionStructures).forEach(([strKey, strAttrs]) => {
  Object.entries(interactionArrowStyles).forEach(([arrowKey, arrowAttrs]) => {
    Object.entries(interactionItems).forEach(([itemKey, itemAttrs]) => {
      const parts = [strKey];
      if (arrowKey !== 'default') {
        parts.push(arrowKey);
      }
      parts.push(itemKey);

      const appendix = parts.join('-');
      if (interactionOmit.includes(appendix)) return;

      const templateKey = `sequence-interaction-${appendix}`;

      sequenceInteractionTemplates[templateKey] = {
        design: {
          title: 'default',
          structure: {
            ...strAttrs,
            ...arrowAttrs,
          },
          item: itemAttrs,
        },
      };
    });
  });
});

// ============================================================================
// Sequence Stairs Templates
// ============================================================================

const sequenceStairsTemplates: Record<string, TemplateOptions> = {
  'sequence-stairs-front-pill-badge': {
    design: {
      title: 'default',
      structure: {
        type: 'sequence-stairs-front',
      },
      items: [
        {
          type: 'pill-badge',
        },
      ],
    },
  },
  'sequence-stairs-front-compact-card': {
    design: {
      title: 'default',
      structure: {
        type: 'sequence-stairs-front',
      },
      items: [
        {
          type: 'compact-card',
        },
      ],
    },
  },
  'sequence-stairs-front-simple': {
    design: {
      title: 'default',
      structure: {
        type: 'sequence-stairs-front',
      },
      items: [
        {
          type: 'simple',
          usePaletteColor: true,
        },
      ],
    },
  },
};

// ============================================================================
// Word Cloud Templates
// ============================================================================

const wordCloudTemplates: Record<string, TemplateOptions> = {
  'chart-wordcloud-rotate': {
    design: {
      structure: {
        type: 'chart-wordcloud',
      },
      item: 'simple',
    },
  },
  'chart-wordcloud': {
    design: {
      structure: {
        type: 'chart-wordcloud',
        enableRotate: false,
      },
      item: 'simple',
    },
  },
};

// ============================================================================
// Built-In Templates (inline definitions)
// ============================================================================

const BUILT_IN_TEMPLATES: Record<string, TemplateOptions> = {
  'compare-hierarchy-left-right-circle-node-pill-badge': {
    design: {
      structure: {
        type: 'compare-hierarchy-left-right',
        decoration: 'split-line',
        surround: false,
        groupGap: -20,
      },
      title: 'default',
      items: [{ type: 'circle-node', width: 240 }, 'pill-badge'],
    },
    themeConfig: {},
  },
  'compare-hierarchy-left-right-circle-node-plain-text': {
    design: {
      title: 'default',
      structure: {
        type: 'compare-hierarchy-left-right',
        decoration: 'dot-line',
        flipLeaf: true,
        groupGap: -10,
      },
      items: [{ type: 'circle-node', width: 180 }, { type: 'plain-text' }],
    },
  },
  'list-pyramid-rounded-rect-node': {
    design: {
      title: 'default',
      structure: {
        type: 'list-pyramid',
      },
      items: [{ type: 'rounded-rect-node' }],
    },
  },
  'list-pyramid-badge-card': {
    design: {
      title: 'default',
      structure: { type: 'list-pyramid' },
      items: [{ type: 'badge-card' }],
    },
  },
  'list-pyramid-compact-card': {
    design: {
      title: 'default',
      structure: { type: 'list-pyramid' },
      items: [{ type: 'compact-card' }],
    },
  },
  'list-column-done-list': {
    design: {
      title: 'default',
      structure: { type: 'list-column' },
      items: [{ type: 'done-list' }],
    },
  },
  'list-column-vertical-icon-arrow': {
    design: {
      title: 'default',
      structure: { type: 'list-column', gap: -5, zigzag: true },
      items: [{ type: 'vertical-icon-arrow' }],
    },
  },
  'list-grid-badge-card': {
    design: {
      title: 'default',
      structure: { type: 'list-grid' },
      items: [{ type: 'badge-card' }],
    },
  },
  'list-grid-candy-card-lite': {
    design: {
      title: 'default',
      structure: { type: 'list-grid' },
      items: [{ type: 'candy-card-lite' }],
    },
  },
  'chart-column-simple': {
    design: {
      title: 'default',
      structure: { type: 'chart-column' },
      items: [{ type: 'simple', showIcon: false, usePaletteColor: true }],
    },
  },
  'list-grid-circular-progress': {
    design: {
      title: 'default',
      structure: { type: 'list-grid' },
      items: [{ type: 'circular-progress' }],
    },
  },
  'list-grid-compact-card': {
    design: {
      title: 'default',
      structure: { type: 'list-grid' },
      items: [{ type: 'compact-card' }],
    },
  },
  'list-grid-done-list': {
    design: {
      title: 'default',
      structure: { type: 'list-grid' },
      items: [{ type: 'done-list' }],
    },
  },
  'list-grid-horizontal-icon-arrow': {
    design: {
      title: 'default',
      structure: { type: 'list-grid', gap: 0, zigzag: true },
      items: [{ type: 'horizontal-icon-arrow' }],
    },
  },
  'list-grid-progress-card': {
    design: {
      title: 'default',
      structure: { type: 'list-grid' },
      items: [{ type: 'progress-card' }],
    },
  },
  'list-grid-ribbon-card': {
    design: {
      title: 'default',
      structure: { type: 'list-grid' },
      items: [{ type: 'ribbon-card' }],
    },
  },
  'list-grid-simple': {
    design: {
      title: 'default',
      structure: { type: 'list-grid' },
      items: [{ type: 'simple' }],
    },
  },
  'list-row-circular-progress': {
    design: {
      title: 'default',
      structure: { type: 'list-row' },
      items: [{ type: 'circular-progress' }],
    },
  },
  'list-row-horizontal-icon-arrow': {
    design: {
      title: 'default',
      structure: { type: 'list-row', gap: 0, zigzag: true },
      items: [{ type: 'horizontal-icon-arrow' }],
    },
  },
  'relation-circle-circular-progress': {
    design: {
      title: 'default',
      structure: { type: 'relation-circle' },
      items: [{ type: 'circular-progress' }],
    },
  },
  'relation-circle-icon-badge': {
    design: {
      title: 'default',
      structure: { type: 'relation-circle' },
      items: [{ type: 'icon-badge' }],
    },
  },
  'relation-network-icon-badge': {
    design: {
      title: 'default',
      structure: { type: 'relation-network' },
      items: [{ type: 'icon-badge' }],
    },
  },
  'relation-network-simple-circle-node': {
    design: {
      title: 'default',
      structure: { type: 'relation-network' },
      items: [{ type: 'simple-circle-node' }],
    },
  },
  'sequence-steps-badge-card': {
    design: {
      title: 'default',
      structure: { type: 'sequence-steps' },
      items: [{ type: 'badge-card' }],
    },
  },
  'sequence-steps-simple': {
    design: {
      title: 'default',
      structure: { type: 'sequence-steps', gap: 10 },
      items: [{ type: 'simple' }],
    },
  },
  'sequence-timeline-done-list': {
    design: {
      title: 'default',
      structure: { type: 'sequence-timeline' },
      items: [{ type: 'done-list' }],
    },
  },
  'sequence-timeline-plain-text': {
    design: {
      title: 'default',
      structure: { type: 'sequence-timeline', showStepLabels: false },
      items: [{ type: 'plain-text' }],
    },
  },
  'sequence-timeline-rounded-rect-node': {
    design: {
      title: 'default',
      structure: { type: 'sequence-timeline' },
      items: [{ type: 'rounded-rect-node' }],
    },
  },
  'sequence-ascending-steps': {
    design: {
      title: 'default',
      structure: { type: 'sequence-ascending-steps', vGap: -46, hGap: -20 },
      items: [{ type: 'l-corner-card' }],
    },
  },
  'sequence-timeline-simple': {
    design: {
      title: 'default',
      structure: { type: 'sequence-timeline', gap: 20, showStepLabels: false },
      items: [{ type: 'simple', positionV: 'middle' }],
    },
  },
  'sequence-cylinders-3d-simple': {
    design: {
      title: 'default',
      structure: { type: 'sequence-cylinders-3d', gapY: 20 },
      items: [{ type: 'simple', showIcon: false, usePaletteColor: true }],
    },
  },
  'list-column-simple-vertical-arrow': {
    design: {
      title: 'default',
      structure: { type: 'list-column', gap: 0, zigzag: true },
      items: [{ type: 'simple-vertical-arrow' }],
    },
  },
  'list-row-simple-horizontal-arrow': {
    design: {
      title: 'default',
      structure: { type: 'list-row', gap: 0, zigzag: true },
      items: [{ type: 'simple-horizontal-arrow' }],
    },
  },
  'compare-swot': {
    design: {
      title: 'default',
      structure: {
        type: 'compare-hierarchy-row',
        itemGap: 32,
        itemPadding: 40,
        showColumnBackground: true,
        columnBackgroundAlpha: 0.08,
      },
      items: [
        { type: 'letter-card', showBottomShade: false },
        {
          type: 'plain-text',
          formatter: (text: string) => `● ${text}`,
          usePaletteColor: true,
        },
      ],
    },
  },
  'compare-hierarchy-row-letter-card-compact-card': {
    design: {
      title: 'default',
      structure: { type: 'compare-hierarchy-row' },
      items: [{ type: 'letter-card' }, { type: 'compact-card' }],
    },
  },
  'compare-hierarchy-row-letter-card-rounded-rect-node': {
    design: {
      title: 'default',
      structure: { type: 'compare-hierarchy-row' },
      items: [{ type: 'letter-card' }, { type: 'rounded-rect-node' }],
    },
  },
  'sequence-snake-steps-compact-card': {
    design: {
      title: 'default',
      structure: { type: 'sequence-snake-steps' },
      items: [{ type: 'compact-card' }],
    },
  },
  'sequence-snake-steps-pill-badge': {
    design: {
      title: 'default',
      structure: { type: 'sequence-snake-steps' },
      items: [{ type: 'pill-badge' }],
    },
  },
  'sequence-snake-steps-simple': {
    design: {
      title: 'default',
      structure: { type: 'sequence-snake-steps' },
      items: [{ type: 'simple' }],
    },
  },
  'sequence-color-snake-steps-horizontal-icon-line': {
    design: {
      title: 'default',
      structure: { type: 'sequence-color-snake-steps' },
      items: [{ type: 'horizontal-icon-line' }],
    },
  },
  'sequence-pyramid-simple': {
    design: {
      title: 'default',
      structure: { type: 'sequence-pyramid' },
      items: [{ type: 'simple', showIcon: false, usePaletteColor: true }],
    },
    themeConfig: {
      colorPrimary: '#1677ff',
    },
  },
  'sequence-funnel-simple': {
    design: {
      title: 'default',
      structure: { type: 'sequence-funnel' },
      items: [{ type: 'simple', showIcon: false, usePaletteColor: true }],
    },
    themeConfig: {
      palette: '#1677ff',
    },
  },
  'list-row-horizontal-icon-line': {
    design: {
      title: 'default',
      structure: { type: 'list-row', gap: 0, zigzag: true },
      items: [{ type: 'horizontal-icon-line' }],
    },
  },
  'list-sector-simple': {
    design: {
      title: 'default',
      structure: { type: 'list-sector' },
      items: [{ type: 'simple' }],
    },
  },
  'list-sector-plain-text': {
    design: {
      title: 'default',
      structure: { type: 'list-sector' },
      items: [{ type: 'plain-text' }],
    },
  },
  'list-sector-half-plain-text': {
    design: {
      title: 'default',
      structure: { type: 'list-sector', startAngle: -180, endAngle: 0 },
      items: [{ type: 'plain-text' }],
    },
  },
  'list-waterfall-badge-card': {
    design: {
      title: 'default',
      structure: { type: 'list-waterfall' },
      items: [{ type: 'badge-card' }],
    },
  },
  'list-waterfall-compact-card': {
    design: {
      title: 'default',
      structure: { type: 'list-waterfall' },
      items: [{ type: 'compact-card' }],
    },
  },
  'sequence-roadmap-vertical-plain-text': {
    design: {
      title: 'default',
      structure: { type: 'sequence-roadmap-vertical' },
      items: [{ type: 'plain-text' }],
    },
  },
  'sequence-roadmap-vertical-simple': {
    design: {
      title: 'default',
      structure: { type: 'sequence-roadmap-vertical' },
      items: [{ type: 'simple', showIcon: false }],
    },
  },
  'sequence-roadmap-vertical-badge-card': {
    design: {
      title: 'default',
      structure: { type: 'sequence-roadmap-vertical' },
      items: [{ type: 'badge-card' }],
    },
  },
  'sequence-roadmap-vertical-pill-badge': {
    design: {
      title: 'default',
      structure: { type: 'sequence-roadmap-vertical' },
      items: [{ type: 'pill-badge' }],
    },
  },
  'sequence-roadmap-vertical-quarter-circular': {
    design: {
      title: 'default',
      structure: { type: 'sequence-roadmap-vertical' },
      items: [{ type: 'quarter-circular' }],
    },
  },
  'sequence-roadmap-vertical-quarter-simple-card': {
    design: {
      title: 'default',
      structure: { type: 'sequence-roadmap-vertical', flipped: true },
      items: [{ type: 'quarter-simple-card' }],
    },
  },
  'sequence-horizontal-zigzag-simple-illus': {
    design: {
      title: 'default',
      structure: { type: 'sequence-horizontal-zigzag' },
      items: [{ type: 'simple-illus' }],
    },
  },
  'sequence-horizontal-zigzag-horizontal-icon-line': {
    design: {
      title: 'default',
      structure: { type: 'sequence-horizontal-zigzag' },
      items: [{ type: 'horizontal-icon-line' }],
    },
  },
  'sequence-horizontal-zigzag-plain-text': {
    design: {
      title: 'default',
      structure: { type: 'sequence-horizontal-zigzag' },
      items: [{ type: 'plain-text' }],
    },
  },
  'sequence-horizontal-zigzag-simple-horizontal-arrow': {
    design: {
      title: 'default',
      structure: { type: 'sequence-horizontal-zigzag' },
      items: [{ type: 'simple-horizontal-arrow' }],
    },
  },
  'sequence-horizontal-zigzag-simple': {
    design: {
      title: 'default',
      structure: { type: 'sequence-horizontal-zigzag' },
      items: [{ type: 'simple' }],
    },
  },
  'list-row-simple-illus': {
    design: {
      title: 'default',
      structure: { type: 'list-row' },
      items: [{ type: 'simple-illus' }],
    },
  },
  'sequence-color-snake-steps-simple-illus': {
    design: {
      title: 'default',
      structure: { type: 'sequence-color-snake-steps' },
      items: [{ type: 'simple-illus' }],
    },
  },
  'sequence-snake-steps-simple-illus': {
    design: {
      title: 'default',
      structure: { type: 'sequence-snake-steps' },
      items: [{ type: 'simple-illus' }],
    },
  },
  'sequence-steps-simple-illus': {
    design: {
      title: 'default',
      structure: { type: 'sequence-steps' },
      items: [{ type: 'simple-illus' }],
    },
  },
  'sequence-timeline-simple-illus': {
    design: {
      title: 'default',
      structure: { type: 'sequence-timeline' },
      items: [{ type: 'simple-illus', usePaletteColor: true }],
    },
  },
  'sequence-zigzag-steps-underline-text': {
    design: {
      title: 'default',
      structure: { type: 'sequence-zigzag-steps' },
      items: [{ type: 'underline-text' }],
    },
  },
  'sequence-horizontal-zigzag-underline-text': {
    design: {
      title: 'default',
      structure: { type: 'sequence-horizontal-zigzag' },
      items: [{ type: 'underline-text' }],
    },
  },
  'sequence-roadmap-vertical-underline-text': {
    design: {
      title: 'default',
      structure: { type: 'sequence-roadmap-vertical' },
      items: [{ type: 'underline-text' }],
    },
  },
  'sequence-snake-steps-underline-text': {
    design: {
      title: 'default',
      structure: { type: 'sequence-snake-steps' },
      items: [{ type: 'underline-text' }],
    },
  },
  'sequence-circle-arrows-indexed-card': {
    design: {
      title: 'default',
      structure: { type: 'sequence-circle-arrows' },
      items: [{ type: 'indexed-card' }],
    },
  },
  'sequence-zigzag-pucks-3d-simple': {
    design: {
      title: 'default',
      structure: { type: 'sequence-zigzag-pucks-3d' },
      items: [{ type: 'simple', showIcon: false, usePaletteColor: true }],
    },
  },
  'sequence-zigzag-pucks-3d-underline-text': {
    design: {
      title: 'default',
      structure: { type: 'sequence-zigzag-pucks-3d' },
      items: [{ type: 'underline-text' }],
    },
  },
  'sequence-zigzag-pucks-3d-indexed-card': {
    design: {
      title: 'default',
      structure: { type: 'sequence-zigzag-pucks-3d' },
      items: [{ type: 'indexed-card' }],
    },
  },
  'sequence-ascending-stairs-3d-simple': {
    design: {
      title: 'default',
      structure: { type: 'sequence-ascending-stairs-3d' },
      items: [{ type: 'simple', showIcon: false, usePaletteColor: true }],
    },
  },
  'sequence-ascending-stairs-3d-underline-text': {
    design: {
      title: 'default',
      structure: { type: 'sequence-ascending-stairs-3d' },
      items: [{ type: 'underline-text' }],
    },
  },
  'sequence-circular-underline-text': {
    design: {
      title: 'default',
      structure: { type: 'sequence-circular' },
      items: [{ type: 'underline-text' }],
    },
  },
  'sequence-circular-simple': {
    design: {
      title: 'default',
      structure: { type: 'sequence-circular' },
      items: [{ type: 'simple', showIcon: false, usePaletteColor: true }],
    },
  },
  'sequence-filter-mesh-underline-text': {
    design: {
      title: 'default',
      structure: { type: 'sequence-filter-mesh' },
      items: [{ type: 'underline-text' }],
    },
  },
  'sequence-filter-mesh-simple': {
    design: {
      title: 'default',
      structure: { type: 'sequence-filter-mesh' },
      items: [{ type: 'simple', showIcon: false, usePaletteColor: true }],
    },
  },
  'sequence-mountain-underline-text': {
    design: {
      title: 'default',
      structure: { type: 'sequence-mountain' },
      items: [{ type: 'underline-text' }],
    },
  },
  'compare-binary-horizontal-simple-fold': {
    design: {
      title: 'default',
      structure: {
        type: 'compare-binary-horizontal',
        dividerType: 'pros-cons-fold',
      },
      items: [{ type: 'simple', iconType: 'circle', iconSize: 40 }],
    },
  },
  'compare-binary-horizontal-underline-text-fold': {
    design: {
      title: 'default',
      structure: {
        type: 'compare-binary-horizontal',
        dividerType: 'pros-cons-fold',
      },
      items: [{ type: 'underline-text' }],
    },
  },
  'compare-binary-horizontal-badge-card-fold': {
    design: {
      title: 'default',
      structure: {
        type: 'compare-binary-horizontal',
        dividerType: 'pros-cons-fold',
      },
      items: [{ type: 'badge-card' }],
    },
  },
  'compare-binary-horizontal-compact-card-fold': {
    design: {
      title: 'default',
      structure: {
        type: 'compare-binary-horizontal',
        dividerType: 'pros-cons-fold',
      },
      items: [{ type: 'compact-card' }],
    },
  },
  'compare-binary-horizontal-simple-arrow': {
    design: {
      title: 'default',
      structure: {
        type: 'compare-binary-horizontal',
        dividerType: 'pros-cons-arrow',
      },
      items: [{ type: 'simple', iconType: 'circle', iconSize: 40 }],
    },
  },
  'compare-binary-horizontal-underline-text-arrow': {
    design: {
      title: 'default',
      structure: {
        type: 'compare-binary-horizontal',
        dividerType: 'pros-cons-arrow',
      },
      items: [{ type: 'underline-text' }],
    },
  },
  'compare-binary-horizontal-badge-card-arrow': {
    design: {
      title: 'default',
      structure: {
        type: 'compare-binary-horizontal',
        dividerType: 'pros-cons-arrow',
      },
      items: [{ type: 'badge-card' }],
    },
  },
  'compare-binary-horizontal-compact-card-arrow': {
    design: {
      title: 'default',
      structure: {
        type: 'compare-binary-horizontal',
        dividerType: 'pros-cons-arrow',
      },
      items: [{ type: 'compact-card' }],
    },
  },
  'compare-binary-horizontal-simple-vs': {
    design: {
      title: 'default',
      structure: {
        type: 'compare-binary-horizontal',
        dividerType: 'vs',
      },
      items: [{ type: 'simple', iconType: 'circle', iconSize: 40 }],
    },
  },
  'compare-binary-horizontal-underline-text-vs': {
    design: {
      title: 'default',
      structure: {
        type: 'compare-binary-horizontal',
        dividerType: 'vs',
      },
      items: [{ type: 'underline-text' }],
    },
  },
  'compare-binary-horizontal-badge-card-vs': {
    design: {
      title: 'default',
      structure: {
        type: 'compare-binary-horizontal',
        dividerType: 'vs',
      },
      items: [{ type: 'badge-card' }],
    },
  },
  'compare-binary-horizontal-compact-card-vs': {
    design: {
      title: 'default',
      structure: {
        type: 'compare-binary-horizontal',
        dividerType: 'vs',
      },
      items: [{ type: 'compact-card' }],
    },
  },
  'chart-bar-plain-text': {
    design: {
      title: 'default',
      structure: {
        type: 'chart-bar',
      },
      items: [
        {
          type: 'plain-text',
          positionH: 'flipped',
        },
      ],
    },
  },
  'chart-line-plain-text': {
    design: {
      title: 'default',
      structure: {
        type: 'chart-line',
      },
      items: [
        {
          type: 'plain-text',
          lineNumber: 2,
        },
      ],
    },
  },
  ...chartPieTemplates,
  ...compareQuadrantTemplates,
  ...hierarchyTreeTemplates,
  ...hierarchyMindmapTemplates,
  ...sequenceStairsTemplates,
  ...wordCloudTemplates,
  ...listZigzagTemplates,
  ...relationDagreFlowTemplates,
  ...sequenceInteractionTemplates,
  ...hierarchyStructureTemplates,
};

Object.entries(BUILT_IN_TEMPLATES).forEach(([name, options]) => {
  registerTemplate(name, options);
});
