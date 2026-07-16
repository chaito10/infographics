import { jsx, renderSVG } from '../jsx';
import type { JSXNode } from '../jsx';
import { parseSyntax } from '../parser';
import type { SyntaxError } from '../parser';
import { parseOptions } from '../options';
import type {
  InfographicOptions,
  ParsedInfographicOptions,
} from '../types';
import { DEFAULT_OPTIONS } from './options';
import {
  cloneOptions,
  isCompleteParsedInfographicOptions,
  mergeOptions,
} from './utils';

interface SyntaxParseFeedback {
  options: Partial<InfographicOptions>;
  errors: SyntaxError[];
  warnings: SyntaxError[];
}

function parseSyntaxOptions(
  input: string | Partial<InfographicOptions>,
): SyntaxParseFeedback {
  if (typeof input === 'string') {
    const { options, errors, warnings } = parseSyntax(input);
    return { options, errors, warnings };
  }

  return {
    options: cloneOptions(input),
    errors: [],
    warnings: [],
  };
}

export class Infographic {
  rendered = false;

  private svgString: string | null = null;

  private initialOptions: Partial<InfographicOptions> = {};
  private options!: Partial<InfographicOptions>;
  private parsedOptions!: Partial<ParsedInfographicOptions>;

  constructor(options: string | Partial<InfographicOptions>) {
    this.setOptions(options, 'replace', true);
  }

  getOptions() {
    return this.options;
  }

  private setOptions(
    options: string | Partial<InfographicOptions>,
    mode: 'replace' | 'merge' = 'replace',
    isInitial = false,
  ) {
    const {
      options: parsedOptions,
      errors,
      warnings,
    } = parseSyntaxOptions(options);
    if (isInitial) {
      this.initialOptions = parsedOptions;
    }

    const base =
      mode === 'replace'
        ? mergeOptions(cloneOptions(this.initialOptions || {}), parsedOptions)
        : mergeOptions(
            this.options || cloneOptions(this.initialOptions || {}),
            parsedOptions,
          );

    this.options = base;
    this.parsedOptions = parseOptions(
      mergeOptions(DEFAULT_OPTIONS, this.options),
    );

    if (errors.length) {
      console.error('[Infographic] Syntax errors:', errors);
    }
    if (warnings.length) {
      console.warn('[Infographic] Syntax warnings:', warnings);
    }
  }

  /**
   * Render the infographic and return the SVG string.
   */
  render(options?: string | Partial<InfographicOptions>): string {
    if (options) {
      this.setOptions(options, 'replace');
    } else if (!this.options && this.initialOptions) {
      this.setOptions(this.initialOptions, 'replace');
    }
    return this.performRender();
  }

  /**
   * Update options (merged) and re-render.
   */
  update(options: string | Partial<InfographicOptions>): string {
    this.setOptions(options, 'merge');
    return this.performRender();
  }

  private performRender(): string {
    const parsedOptions = this.parsedOptions;
    if (!isCompleteParsedInfographicOptions(parsedOptions)) {
      throw new Error('Incomplete options: design and data are required');
    }

    this.svgString = this.compose(parsedOptions);
    this.rendered = true;
    return this.svgString;
  }

  /**
   * Render the infographic to an SVG string.
   * If already rendered, returns the cached result unless force is true.
   */
  renderToString(force = false): string {
    if (this.svgString && !force) return this.svgString;
    return this.render();
  }

  /**
   * Get the composed SVG template (without full data rendering).
   * Useful for previewing the template structure.
   */
  getSVGTemplate(): string | null {
    if (!this.parsedOptions) return null;
    if (!isCompleteParsedInfographicOptions(this.parsedOptions)) return null;
    return this.compose(this.parsedOptions);
  }

  /**
   * Compose the SVG template from design structures.
   * Returns the SVG string from JSX rendering.
   */
  private compose(parsedOptions: ParsedInfographicOptions): string {
    const { design, data } = parsedOptions;
    const { title, item, items, structure } = design;
    const { component: Structure, props: structureProps } = structure;
    const Title = title.component;
    const Item = item.component;
    const Items = items.map((it: any) => it.component);

    const element: JSXNode = jsx(Structure as any, {
      data,
      Title,
      Item,
      Items,
      options: parsedOptions,
      ...(structureProps || {}),
    });

    return renderSVG(element);
  }

  /**
   * Get the element types used in the current design.
   */
  getTypes() {
    const parsedOptions = this.parsedOptions;
    if (!isCompleteParsedInfographicOptions(parsedOptions)) {
      return null;
    }
    const design = parsedOptions.design;
    const structure = design.structure.composites || [];
    const itemsList = design.items.map((it: any) => it.composites || []);
    return { structure, items: itemsList };
  }

  /**
   * Get the raw SVG string (null if not rendered).
   */
  getSVGString(): string | null {
    return this.svgString;
  }

  /**
   * Clean up resources.
   */
  destroy() {
    this.svgString = null;
    this.rendered = false;
  }
}
