import type { InfographicOptions, ParsedInfographicOptions } from '../types';

export type TemplateOptions = Omit<
  Partial<InfographicOptions>,
  'container' | 'template' | 'data'
>;

export type ParsedTemplateOptions = Omit<
  Partial<ParsedInfographicOptions>,
  'container' | 'template' | 'data'
>;
