import type { ComponentType, JSXElement } from '../../jsx';

export interface StructureOptions {
  themeConfig: {
    colorBg?: string;
    colorPrimary?: string;
    colorSecondary?: string;
  };
}

export interface BaseStructureProps {
  data: {
    title?: string;
    desc?: string;
    items?: any[];
    relations?: any[];
  };
  options: StructureOptions;
  Title?: ComponentType<{ title?: string; desc?: string }>;
  Item?: ComponentType<{
    indexes: number[];
    datum: any;
    data: any;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    positionH?: 'normal' | 'center' | 'flipped';
    positionV?: 'normal' | 'middle' | 'flipped';
    themeColors?: any;
  }>;
}

export interface Structure {
  component: ComponentType<BaseStructureProps>;
  composites: string[];
}

const STRUCTURE_REGISTRY = new Map<string, Structure>();

export function registerStructure(type: string, structure: Structure) {
  STRUCTURE_REGISTRY.set(type, structure);
}

export function getStructure(type: string): Structure | undefined {
  return STRUCTURE_REGISTRY.get(type);
}

export function getStructures(): string[] {
  return Array.from(STRUCTURE_REGISTRY.keys());
}

export function getPaletteColor(
  options: StructureOptions,
  indexes: number[],
): string {
  const palette = [
    options.themeConfig?.colorPrimary || '#4A90E2',
    options.themeConfig?.colorSecondary || '#7ED321',
    '#F5A623',
    '#BD10E0',
    '#50E3C2',
    '#B8E986',
    '#9B9B9B',
    '#D0021B',
  ];
  const index = indexes[0] % palette.length;
  return palette[index];
}
