import type { InfographicOptions, ItemDatum } from '../types';

// ============================================================================
// Parser Types
// ============================================================================

export type SyntaxNode = ValueNode | ObjectNode | ArrayNode;

export interface ValueNode {
  kind: 'value';
  line: number;
  value: string;
}

export interface ObjectNode {
  kind: 'object';
  line: number;
  value?: string;
  entries: Record<string, SyntaxNode>;
}

export interface ArrayNode {
  kind: 'array';
  line: number;
  items: SyntaxNode[];
}

export type SyntaxErrorCode =
  | 'implicit_template'
  | 'unknown_key'
  | 'schema_mismatch'
  | 'invalid_value'
  | 'bad_indent'
  | 'bad_list'
  | 'bad_syntax';

export interface SyntaxError {
  path: string;
  line: number;
  code: SyntaxErrorCode;
  message: string;
  raw?: string;
}

export interface SyntaxParseResult {
  options: Partial<InfographicOptions>;
  errors: SyntaxError[];
  warnings: SyntaxError[];
  ast?: ObjectNode;
}

// ============================================================================
// Schema Types
// ============================================================================

export type SchemaNode =
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | EnumSchema
  | ArraySchema
  | ObjectSchema
  | UnionSchema
  | PaletteSchema
  | ColorSchema;

export interface StringSchema {
  kind: 'string';
}

export interface NumberSchema {
  kind: 'number';
}

export interface BooleanSchema {
  kind: 'boolean';
}

export interface EnumSchema {
  kind: 'enum';
  values: string[];
}

export interface ArraySchema {
  kind: 'array';
  item: SchemaNode;
  split?: 'space' | 'comma' | 'any';
}

export interface ObjectSchema {
  kind: 'object';
  fields: Record<string, SchemaNode>;
  allowUnknown?: boolean;
  shorthandKey?: string;
}

export interface UnionSchema {
  kind: 'union';
  variants: SchemaNode[];
}

export interface PaletteSchema {
  kind: 'palette';
}

export interface ColorSchema {
  kind: 'color';
  soft?: boolean;
}

// ============================================================================
// Schema Definitions
// ============================================================================

const string = (): SchemaNode => ({ kind: 'string' });
const number = (): SchemaNode => ({ kind: 'number' });
const enumOf = (values: string[]): SchemaNode => ({ kind: 'enum', values });
const color = (options: { soft?: boolean } = {}): SchemaNode => ({
  kind: 'color',
  soft: options.soft,
});
const array = (item: SchemaNode, split: 'space' | 'comma' | 'any' = 'any') => ({
  kind: 'array' as const,
  item,
  split,
});
const object = (
  fields: Record<string, SchemaNode>,
  options: { allowUnknown?: boolean; shorthandKey?: string } = {},
): ObjectSchema => ({
  kind: 'object',
  fields,
  allowUnknown: options.allowUnknown,
  shorthandKey: options.shorthandKey,
});
const union = (...variants: SchemaNode[]): SchemaNode => ({
  kind: 'union',
  variants,
});
const palette = (): SchemaNode => ({ kind: 'palette' });
const anyObject = (): ObjectSchema => object({}, { allowUnknown: true });

const nullableColorFields = {
  fill: color({ soft: true }),
  stroke: color({ soft: true }),
};

const textStyleSchema = object(nullableColorFields, { allowUnknown: true });
const shapeStyleSchema = object(nullableColorFields, { allowUnknown: true });

const itemDatumSchema: ObjectSchema = object({}, { allowUnknown: true });
itemDatumSchema.fields = {
  id: string(),
  label: string(),
  value: union(number(), string()),
  desc: string(),
  icon: union(string(), anyObject()),
  illus: union(string(), anyObject()),
  attributes: anyObject(),
  group: string(),
  category: string(),
  children: array(itemDatumSchema),
};

export const RelationSchema: ObjectSchema = object(
  {
    id: string(),
    from: string(),
    to: string(),
    label: string(),
    direction: enumOf(['forward', 'both', 'none']),
    showArrow: enumOf(['true', 'false']),
    arrowType: enumOf(['arrow', 'triangle', 'diamond']),
    lineStyle: enumOf(['solid', 'dashed']),
  },
  { allowUnknown: true },
);

export const ThemeSchema = object(
  {
    type: string(),
    colorBg: color(),
    colorPrimary: color(),
    palette: palette(),
    title: textStyleSchema,
    desc: textStyleSchema,
    shape: shapeStyleSchema,
    base: object({
      global: object({}, { allowUnknown: true }),
      shape: shapeStyleSchema,
      text: textStyleSchema,
    }),
    item: object({
      icon: object({}, { allowUnknown: true }),
      label: textStyleSchema,
      desc: textStyleSchema,
      value: textStyleSchema,
      shape: shapeStyleSchema,
    }),
    stylize: object(
      {
        type: enumOf(['rough', 'pattern']),
        roughness: number(),
        bowing: number(),
        fillWeight: number(),
        hachureGap: number(),
        pattern: string(),
        backgroundColor: color(),
        foregroundColor: color(),
        scale: number(),
      },
      { shorthandKey: 'type' },
    ),
    elements: object({}, { allowUnknown: true }),
  },
  { shorthandKey: 'type' },
);

const designNodeSchema = object(
  {},
  { allowUnknown: true, shorthandKey: 'type' },
);

export const DesignSchema = object({
  structure: designNodeSchema,
  item: designNodeSchema,
  items: array(designNodeSchema),
  title: designNodeSchema,
});

export const DataSchema = object({
  title: string(),
  desc: string(),
  items: array(itemDatumSchema),
  lists: array(itemDatumSchema),
  sequences: array(itemDatumSchema),
  root: itemDatumSchema,
  compares: array(itemDatumSchema),
  nodes: array(itemDatumSchema),
  relations: array(RelationSchema),
  values: array(itemDatumSchema),
  order: enumOf(['asc', 'desc']),
  illus: anyObject(),
  attributes: anyObject(),
});

export const TemplateSchema = object(
  {
    type: string(),
  },
  { shorthandKey: 'type' },
);

export const RootSchema = object({
  template: TemplateSchema,
  design: DesignSchema,
  data: DataSchema,
  theme: ThemeSchema,
  width: union(number(), string()),
  height: union(number(), string()),
});

// ============================================================================
// Syntax Parser
// ============================================================================

interface StackFrame {
  indent: number;
  node: ObjectNode | ArrayNode;
  parent?: ObjectNode | ArrayNode | null;
  key?: string | null;
}

interface ParseResult {
  ast: ObjectNode;
  errors: SyntaxError[];
}

function isWhitespace(char: string) {
  return char === ' ' || char === '\t';
}

function getIndentInfo(line: string) {
  let indent = 0;
  let index = 0;
  while (index < line.length) {
    const char = line[index];
    if (char === ' ') {
      indent += 1;
      index += 1;
      continue;
    }
    if (char === '\t') {
      indent += 2;
      index += 1;
      continue;
    }
    break;
  }
  return { indent, content: line.slice(index) };
}

function stripComments(content: string) {
  return content.trimEnd();
}

function isCommentLine(content: string) {
  const trimmed = content.trimStart();
  return trimmed.startsWith('#') || trimmed.startsWith('//');
}

function isCodeFenceLine(content: string) {
  return /^```[\w-]*\s*$/.test(content.trim());
}

function looksLikeRelationExpression(text: string) {
  return /[<>=o.x-]{2,}/.test(text);
}

function parseKeyValue(raw: string) {
  const text = raw.trim();
  if (!text) return null;
  const match = text.match(/^([^:\s=]+)\s*[:=]\s*(.*)$/);
  if (match) {
    return { key: match[1], value: match[2].trim() };
  }
  const matchSpace = text.match(/^([^\s]+)\s+(.*)$/);
  if (matchSpace) {
    return { key: matchSpace[1], value: matchSpace[2].trim() };
  }
  return { key: text, value: undefined };
}

interface AssignEntryResult {
  parent: ObjectNode;
  key: string;
}

function isUnsafeObjectKey(key: string) {
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
}

function assignObjectEntry(
  parent: ObjectNode,
  rawKey: string,
  node: ObjectNode,
  line: number,
  errors: SyntaxError[],
): AssignEntryResult | null {
  if (!rawKey.includes('.')) {
    if (isUnsafeObjectKey(rawKey)) {
      errors.push({
        path: rawKey,
        line,
        code: 'bad_syntax',
        message: `Invalid key part: ${rawKey}`,
        raw: rawKey,
      });
      return null;
    }
    parent.entries[rawKey] = node;
    return { parent, key: rawKey };
  }

  const parts = rawKey.split('.');
  if (parts.some((part) => !part)) {
    errors.push({
      path: rawKey,
      line,
      code: 'bad_syntax',
      message: 'Invalid dotted key path.',
      raw: rawKey,
    });
    return null;
  }

  let current = parent;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    if (isUnsafeObjectKey(part)) {
      errors.push({
        path: rawKey,
        line,
        code: 'bad_syntax',
        message: `Invalid key part in dotted path: ${part}`,
        raw: rawKey,
      });
      return null;
    }
    const existing = current.entries[part];
    if (!existing) {
      const container = createObjectNode(line);
      current.entries[part] = container;
      current = container;
      continue;
    }
    if (existing.kind !== 'object') {
      errors.push({
        path: parts.slice(0, index + 1).join('.'),
        line,
        code: 'bad_syntax',
        message: 'Cannot assign dotted key under a list value.',
        raw: rawKey,
      });
      return null;
    }
    current = existing;
  }

  const finalKey = parts[parts.length - 1];
  if (isUnsafeObjectKey(finalKey)) {
    errors.push({
      path: rawKey,
      line,
      code: 'bad_syntax',
      message: `Invalid key part in dotted path: ${finalKey}`,
      raw: rawKey,
    });
    return null;
  }
  current.entries[finalKey] = node;
  return { parent: current, key: finalKey };
}

function createObjectNode(line: number, value?: string): ObjectNode {
  return { kind: 'object', line, value, entries: {} };
}

function createArrayNode(line: number): ArrayNode {
  return { kind: 'array', line, items: [] };
}

export function parseSyntaxToAst(input: string): ParseResult {
  const errors: SyntaxError[] = [];
  const root: ObjectNode = createObjectNode(0);
  const stack: StackFrame[] = [
    { indent: -1, node: root, parent: null, key: null },
  ];

  const lines = input.split(/\r?\n/);
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (!line.trim()) return;
    const { indent, content } = getIndentInfo(line);
    if (isCommentLine(content) || isCodeFenceLine(content)) return;
    const stripped = stripComments(content);
    if (!stripped.trim()) return;

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parentFrame = stack[stack.length - 1];
    let parentNode = parentFrame.node;

    const trimmed = stripped.trim();
    if (
      trimmed.startsWith('-') &&
      (trimmed.length === 1 || isWhitespace(trimmed[1]))
    ) {
      if (parentNode.kind !== 'array') {
        if (
          parentNode.kind === 'object' &&
          Object.keys(parentNode.entries).length === 0 &&
          parentNode.value === undefined &&
          parentFrame.parent &&
          parentFrame.key
        ) {
          const arrayNode = createArrayNode(parentNode.line);
          if (parentFrame.parent.kind === 'object') {
            parentFrame.parent.entries[parentFrame.key] = arrayNode;
          } else if (parentFrame.parent.kind === 'array') {
            const indexInParent = parentFrame.parent.items.indexOf(parentNode);
            if (indexInParent >= 0)
              parentFrame.parent.items[indexInParent] = arrayNode;
          }
          parentFrame.node = arrayNode;
          parentNode = arrayNode;
        } else {
          errors.push({
            path: '',
            line: lineNumber,
            code: 'bad_list',
            message: 'List item is not under an array container.',
            raw: trimmed,
          });
          return;
        }
      }

      const itemContent = trimmed.slice(1).trim();
      const itemNode = createObjectNode(lineNumber, itemContent || undefined);
      parentNode.items.push(itemNode);
      stack.push({
        indent,
        node: itemNode,
        parent: parentNode,
      });
      return;
    }

    if (
      parentFrame.key === 'relations' &&
      !trimmed.startsWith('-') &&
      looksLikeRelationExpression(trimmed)
    ) {
      if (parentNode.kind !== 'array') {
        if (
          parentNode.kind === 'object' &&
          Object.keys(parentNode.entries).length === 0 &&
          parentNode.value === undefined &&
          parentFrame.parent &&
          parentFrame.key
        ) {
          const arrayNode = createArrayNode(parentNode.line);
          if (parentFrame.parent.kind === 'object') {
            parentFrame.parent.entries[parentFrame.key] = arrayNode;
          } else if (parentFrame.parent.kind === 'array') {
            const indexInParent = parentFrame.parent.items.indexOf(parentNode);
            if (indexInParent >= 0)
              parentFrame.parent.items[indexInParent] = arrayNode;
          }
          parentFrame.node = arrayNode;
          parentNode = arrayNode;
        } else {
          errors.push({
            path: '',
            line: lineNumber,
            code: 'bad_list',
            message: 'List item is not under an array container.',
            raw: trimmed,
          });
          return;
        }
      }

      const itemNode = createObjectNode(lineNumber, trimmed);
      parentNode.items.push(itemNode);
      stack.push({
        indent,
        node: itemNode,
        parent: parentNode,
      });
      return;
    }

    const parsed = parseKeyValue(trimmed);
    if (!parsed) {
      errors.push({
        path: '',
        line: lineNumber,
        code: 'bad_syntax',
        message: 'Invalid syntax line.',
        raw: trimmed,
      });
      return;
    }

    if (parentNode.kind !== 'object') {
      errors.push({
        path: '',
        line: lineNumber,
        code: 'bad_syntax',
        message: 'Key-value pair is not under an object container.',
        raw: trimmed,
      });
      return;
    }

    const node = createObjectNode(lineNumber, parsed.value);
    const assigned = assignObjectEntry(
      parentNode,
      parsed.key,
      node,
      lineNumber,
      errors,
    );
    if (!assigned) return;
    stack.push({
      indent,
      node,
      parent: assigned.parent,
      key: assigned.key,
    });
  });

  return { ast: root, errors };
}

export function parseInlineKeyValue(value: string) {
  return parseKeyValue(value);
}

// ============================================================================
// Schema Mapper
// ============================================================================

const HEX_COLOR_PATTERN =
  /^(#[0-9a-f]{8}|#[0-9a-f]{6}|#[0-9a-f]{4}|#[0-9a-f]{3})/i;
const FUNCTION_COLOR_PATTERN = /^((?:rgb|rgba|hsl|hsla)\([^)]*\))/i;

function normalizeBooleanLiteral(value: string) {
  const trimmed = value.trim();
  if (/^true$/i.test(trimmed)) return 'true';
  if (/^false$/i.test(trimmed)) return 'false';
  return undefined;
}

function parseScalar(value: string) {
  const trimmed = value.trim();
  const normalizedBoolean = normalizeBooleanLiteral(trimmed);
  if (normalizedBoolean === 'true') return true;
  if (normalizedBoolean === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return parseFloat(trimmed);
  return trimmed;
}

function readScalar(node: SyntaxNode): string | undefined {
  if (node.kind === 'value') return node.value;
  if (node.kind === 'object') return node.value;
  return undefined;
}

function addError(
  errors: SyntaxError[],
  node: SyntaxNode,
  path: string,
  code: SyntaxError['code'],
  message: string,
  raw?: string,
) {
  errors.push({
    path,
    line: node.line,
    code,
    message,
    raw,
  });
}

function splitArrayValue(
  value: string,
  split: 'space' | 'comma' | 'any' = 'any',
) {
  let text = value.trim();
  if (text.startsWith('[') && text.endsWith(']')) {
    text = text.slice(1, -1).trim();
  }
  if (!text) return [];
  let parts: string[];
  if (split === 'comma') {
    parts = text.split(',');
  } else if (split === 'space') {
    parts = text.split(/\s+/);
  } else {
    parts = text.split(/[,\s]+/);
  }
  const normalized: string[] = [];
  for (const part of parts) {
    const trimmedPart = part.trim();
    if (!trimmedPart) continue;
    if (trimmedPart === '#' || trimmedPart === '//') break;
    normalized.push(trimmedPart);
  }
  return normalized;
}

function stripColorComments(value: string) {
  let trimmed = value.trim();
  const hashIndex = trimmed.search(/\s+#(?![0-9a-f])/i);
  if (hashIndex >= 0) {
    trimmed = trimmed.slice(0, hashIndex).trimEnd();
  }
  const slashIndex = trimmed.indexOf('//');
  if (slashIndex >= 0) {
    trimmed = trimmed.slice(0, slashIndex).trimEnd();
  }
  return trimmed;
}

function normalizeExplicitColor(value: string) {
  const trimmed = stripColorComments(value);
  if (!trimmed) return undefined;
  const hexMatch = trimmed.match(HEX_COLOR_PATTERN);
  if (hexMatch && hexMatch[0].length === trimmed.length) {
    return trimmed;
  }
  const funcMatch = trimmed.match(FUNCTION_COLOR_PATTERN);
  if (funcMatch && funcMatch[1].length === trimmed.length) {
    return trimmed;
  }
  // Simple color name validation fallback
  const colorNames = [
    'red', 'green', 'blue', 'white', 'black', 'yellow', 'cyan', 'magenta',
    'gray', 'grey', 'orange', 'pink', 'purple', 'brown', 'navy', 'teal',
    'olive', 'maroon', 'lime', 'aqua', 'fuchsia', 'silver',
  ];
  if (colorNames.includes(trimmed.toLowerCase())) return trimmed;
  return undefined;
}

function mapColor(
  node: SyntaxNode,
  path: string,
  errors: SyntaxError[],
  options: { soft?: boolean } = {},
) {
  const value = readScalar(node);
  if (value === undefined) {
    addError(errors, node, path, 'schema_mismatch', 'Expected color value.');
    return undefined;
  }
  const normalized = normalizeExplicitColor(value);
  if (!normalized) {
    if (!options.soft) {
      addError(
        errors,
        node,
        path,
        'invalid_value',
        'Invalid color value.',
        value,
      );
    }
    return undefined;
  }
  return normalized;
}

function shouldTreatPaletteStringAsArray(
  trimmed: string,
  parts: string[],
): boolean {
  if (parts.length > 1) return true;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return true;
  return normalizeExplicitColor(trimmed) !== undefined;
}

function mapUnknown(node: SyntaxNode): any {
  if (node.kind === 'array') {
    return node.items.map((item) => mapUnknown(item));
  }
  if (node.kind === 'value') return parseScalar(node.value);
  const hasEntries = Object.keys(node.entries).length > 0;
  if (!hasEntries && node.value !== undefined) {
    return parseScalar(node.value);
  }
  const result: Record<string, any> = {};
  if (node.value !== undefined) {
    result.value = parseScalar(node.value);
  }
  Object.entries(node.entries).forEach(([key, child]) => {
    result[key] = mapUnknown(child);
  });
  return result;
}

function mapUnion(
  node: SyntaxNode,
  schema: UnionSchema,
  path: string,
  errors: SyntaxError[],
) {
  let bestValue: any = undefined;
  let bestErrors: SyntaxError[] | null = null;
  for (const variant of schema.variants) {
    const variantErrors: SyntaxError[] = [];
    const value = mapWithSchema(node, variant, path, variantErrors);
    if (bestErrors === null || variantErrors.length < bestErrors.length) {
      bestErrors = variantErrors;
      bestValue = value;
    }
  }
  if (bestErrors) errors.push(...bestErrors);
  return bestValue;
}

export function mapWithSchema(
  node: SyntaxNode,
  schema: SchemaNode,
  path: string,
  errors: SyntaxError[],
): any {
  switch (schema.kind) {
    case 'union':
      return mapUnion(node, schema, path, errors);
    case 'string': {
      const value = readScalar(node);
      if (value === undefined) {
        addError(
          errors,
          node,
          path,
          'schema_mismatch',
          'Expected string value.',
        );
        return undefined;
      }
      return value;
    }
    case 'number': {
      const value = readScalar(node);
      if (value === undefined) {
        addError(
          errors,
          node,
          path,
          'schema_mismatch',
          'Expected number value.',
        );
        return undefined;
      }
      const trimmed = value.trim();
      const match = trimmed.match(/^(-?\d+(\.\d+)?)(?:\s*(#|\/\/).*)?$/);
      if (!match) {
        addError(
          errors,
          node,
          path,
          'invalid_value',
          'Invalid number value.',
          value,
        );
        return undefined;
      }
      return parseFloat(match[1]);
    }
    case 'boolean': {
      const value = readScalar(node);
      if (value === undefined) {
        addError(
          errors,
          node,
          path,
          'schema_mismatch',
          'Expected boolean value.',
        );
        return undefined;
      }
      const normalizedBoolean = normalizeBooleanLiteral(value);
      if (!normalizedBoolean) {
        addError(
          errors,
          node,
          path,
          'invalid_value',
          'Invalid boolean value.',
          value,
        );
        return undefined;
      }
      return normalizedBoolean === 'true';
    }
    case 'enum': {
      const value = readScalar(node);
      if (value === undefined) {
        addError(errors, node, path, 'schema_mismatch', 'Expected enum value.');
        return undefined;
      }
      const normalizedBoolean = normalizeBooleanLiteral(value);
      const enumValue =
        normalizedBoolean && schema.values.includes(normalizedBoolean)
          ? normalizedBoolean
          : value;
      if (!schema.values.includes(enumValue)) {
        addError(
          errors,
          node,
          path,
          'invalid_value',
          'Invalid enum value.',
          value,
        );
        return undefined;
      }
      return enumValue;
    }
    case 'array': {
      if (node.kind === 'array') {
        return node.items
          .map((item, index) =>
            mapWithSchema(item, schema.item, `${path}[${index}]`, errors),
          )
          .filter((value) => value !== undefined);
      }
      if (node.kind === 'object' && Object.keys(node.entries).length > 0) {
        addError(
          errors,
          node,
          path,
          'schema_mismatch',
          'Expected array value.',
        );
        return undefined;
      }
      const scalar = readScalar(node);
      if (scalar === undefined) {
        addError(
          errors,
          node,
          path,
          'schema_mismatch',
          'Expected array value.',
        );
        return undefined;
      }
      const trimmed = scalar.trim();
      if (trimmed.startsWith('[') && !trimmed.endsWith(']')) {
        return undefined;
      }
      const parts = splitArrayValue(scalar, schema.split);
      return parts
        .map((part, index) =>
          mapWithSchema(
            createValueNode(part, node.line),
            schema.item,
            `${path}[${index}]`,
            errors,
          ),
        )
        .filter((value) => value !== undefined);
    }
    case 'palette': {
      if (node.kind === 'array') {
        const values = mapWithSchema(
          node,
          { kind: 'array', item: { kind: 'color' }, split: 'any' },
          path,
          errors,
        );
        return Array.isArray(values) && values.length > 0 ? values : undefined;
      }
      if (node.kind === 'object' && Object.keys(node.entries).length > 0) {
        addError(
          errors,
          node,
          path,
          'schema_mismatch',
          'Expected palette value.',
        );
        return undefined;
      }
      const scalar = readScalar(node);
      if (scalar === undefined) {
        addError(
          errors,
          node,
          path,
          'schema_mismatch',
          'Expected palette value.',
        );
        return undefined;
      }
      const trimmed = scalar.trim();
      if (trimmed.startsWith('[') && !trimmed.endsWith(']')) {
        return undefined;
      }
      const directColor = normalizeExplicitColor(trimmed);
      if (directColor) {
        return [directColor];
      }
      const parts = splitArrayValue(scalar, 'any');
      if (shouldTreatPaletteStringAsArray(trimmed, parts)) {
        const values = parts
          .map((part, index) =>
            mapColor(
              createValueNode(part, node.line),
              `${path}[${index}]`,
              errors,
            ),
          )
          .filter((value): value is string => value !== undefined);
        return values.length > 0 ? values : undefined;
      }
      return scalar;
    }
    case 'color': {
      return mapColor(node, path, errors, { soft: schema.soft });
    }
    case 'object': {
      if (node.kind === 'array') {
        addError(
          errors,
          node,
          path,
          'schema_mismatch',
          'Expected object value.',
        );
        return undefined;
      }
      const result: Record<string, any> = {};
      if (node.kind === 'value') {
        if (schema.shorthandKey) {
          result[schema.shorthandKey] = node.value;
          return result;
        }
        const inline = parseInlineKeyValue(node.value);
        if (inline?.value !== undefined) {
          if (schema.fields[inline.key]) {
            const value = mapWithSchema(
              createValueNode(inline.value, node.line),
              schema.fields[inline.key],
              `${path}.${inline.key}`,
              errors,
            );
            if (value !== undefined) result[inline.key] = value;
            return result;
          }
          if (schema.allowUnknown) {
            result[inline.key] = parseScalar(inline.value);
            return result;
          }
          addError(
            errors,
            node,
            `${path}.${inline.key}`,
            'unknown_key',
            'Unknown key in object.',
            inline.key,
          );
          return result;
        }
        if (schema.allowUnknown) {
          result.value = parseScalar(node.value);
          return result;
        }
        addError(errors, node, path, 'invalid_value', 'Expected object value.');
        return undefined;
      }

      if (node.value !== undefined) {
        if (schema.shorthandKey && result[schema.shorthandKey] === undefined) {
          result[schema.shorthandKey] = node.value;
        } else {
          const inline = parseInlineKeyValue(node.value);
          if (inline?.value !== undefined) {
            if (schema.fields[inline.key]) {
              const value = mapWithSchema(
                createValueNode(inline.value, node.line),
                schema.fields[inline.key],
                `${path}.${inline.key}`,
                errors,
              );
              if (value !== undefined && result[inline.key] === undefined) {
                result[inline.key] = value;
              }
            } else if (schema.allowUnknown) {
              result[inline.key] = parseScalar(inline.value);
            } else {
              addError(
                errors,
                node,
                `${path}.${inline.key}`,
                'unknown_key',
                'Unknown key in object.',
                inline.key,
              );
            }
          } else if (schema.allowUnknown) {
            result.value = parseScalar(node.value);
          }
        }
      }

      Object.entries(node.entries).forEach(([key, child]) => {
        const fieldSchema = schema.fields[key];
        if (!fieldSchema) {
          if (schema.allowUnknown) {
            result[key] = mapUnknown(child);
            return;
          }
          addError(
            errors,
            child,
            `${path}.${key}`,
            'unknown_key',
            'Unknown key in object.',
            key,
          );
          return;
        }
        const value = mapWithSchema(
          child,
          fieldSchema,
          `${path}.${key}`,
          errors,
        );
        if (value !== undefined) result[key] = value;
      });
      return result;
    }
    default:
      return undefined;
  }
}

function createValueNode(value: string, line: number): ValueNode {
  return { kind: 'value', line, value };
}

export function mapUnknownToObject(node: SyntaxNode) {
  return mapUnknown(node);
}

// ============================================================================
// Relations Parser
// ============================================================================

import type { RelationEdgeDatum } from '../types';

const RELATION_TOKEN = /(?:[<>o.x-]{2,}|[<>=]{2,})/;
const ARROW_TOKEN = /(?:[<>o.x-]{2,}|[<>=]{2,})/g;

interface ParsedNode {
  id: string;
  label?: string;
}

interface ParsedEdge {
  label?: string;
  direction: 'forward' | 'both' | 'none';
  reverse: boolean;
  nextIndex: number;
}

function normalizeLabel(text: string) {
  let label = text.trim();
  if (!label) return '';
  const first = label[0];
  const last = label[label.length - 1];
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    label = label.slice(1, -1);
  }
  label = label
    .replace(/\\(["'])/g, '$1')
    .replace(/(&quot;|&#quot;|#quot;)/g, '"')
    .replace(/(&apos;|&#39;|#apos;)/g, "'");
  return label.trim();
}

function stripEdgeLabelPrefix(text: string) {
  const trimmed = text
    .trim()
    .replace(/^[-=.ox]+/, '')
    .trim();
  return normalizeLabel(trimmed);
}

function skipSpaces(text: string, index: number) {
  let cursor = index;
  while (cursor < text.length && /\s/.test(text[cursor])) {
    cursor += 1;
  }
  return cursor;
}

function readNode(text: string, startIndex: number) {
  let index = skipSpaces(text, startIndex);
  if (index >= text.length) return null;
  const idStart = index;
  while (index < text.length) {
    const char = text[index];
    if (
      /\s/.test(char) ||
      char === '[' ||
      char === '(' ||
      char === '@' ||
      char === '|' ||
      char === '<' ||
      char === '>'
    ) {
      break;
    }
    if (
      char === '-' &&
      (text[index + 1] === '-' ||
        text[index + 1] === '>' ||
        text[index + 1] === '<')
    ) {
      break;
    }
    index += 1;
  }
  if (index === idStart) return null;
  const id = text.slice(idStart, index).trim();
  if (!id) return null;

  if (text.startsWith('@{', index)) {
    const braceEnd = text.indexOf('}', index + 2);
    if (braceEnd !== -1) {
      index = braceEnd + 1;
    }
  }

  index = skipSpaces(text, index);
  let label: string | undefined;
  if (text[index] === '[') {
    const end = text.indexOf(']', index + 1);
    if (end !== -1) {
      label = normalizeLabel(text.slice(index + 1, end));
      index = end + 1;
    }
  } else if (text[index] === '(') {
    const end = text.indexOf(')', index + 1);
    if (end !== -1) {
      let content = text.slice(index + 1, end).trim();
      if (content.startsWith('[') && content.endsWith(']')) {
        content = content.slice(1, -1).trim();
      }
      label = normalizeLabel(content);
      index = end + 1;
    }
  }

  return {
    node: { id, label } as ParsedNode,
    nextIndex: index,
  };
}

function readEdge(text: string, startIndex: number): ParsedEdge | null {
  ARROW_TOKEN.lastIndex = startIndex;
  const match = ARROW_TOKEN.exec(text);
  if (!match) return null;
  const arrowToken = match[0];
  const arrowStart = match.index;
  const arrowEnd = arrowStart + arrowToken.length;
  const labelPrefix = stripEdgeLabelPrefix(text.slice(startIndex, arrowStart));
  let label = labelPrefix || undefined;
  let directionToken = arrowToken;
  let index = arrowEnd;

  // Detect split bidirectional arrow pattern: <- label ->
  {
    const leftHasLeft = directionToken.includes('<');
    const leftHasRight = directionToken.includes('>');
    if (leftHasLeft && !leftHasRight) {
      const lookahead = new RegExp(ARROW_TOKEN.source, 'g');
      lookahead.lastIndex = arrowEnd;
      const rightMatch = lookahead.exec(text);
      if (
        rightMatch &&
        rightMatch[0].includes('>') &&
        !rightMatch[0].includes('<')
      ) {
        const middleText = text.slice(arrowEnd, rightMatch.index).trim();
        if (middleText) {
          const splitLabel = normalizeLabel(middleText);
          return {
            label: splitLabel || label,
            direction: 'both',
            reverse: false,
            nextIndex: rightMatch.index + rightMatch[0].length,
          };
        }
      }
    }
  }

  index = skipSpaces(text, index);
  if (text[index] === '|') {
    const pipeEnd = text.indexOf('|', index + 1);
    if (pipeEnd !== -1) {
      const pipeLabel = normalizeLabel(text.slice(index + 1, pipeEnd));
      label = pipeLabel || label;
      index = pipeEnd + 1;
      const afterLabel = skipSpaces(text, index);
      ARROW_TOKEN.lastIndex = afterLabel;
      const tail = ARROW_TOKEN.exec(text);
      if (tail && tail.index === afterLabel) {
        directionToken += tail[0];
        index = tail.index + tail[0].length;
      } else {
        index = afterLabel;
      }
    }
  }

  const hasLeft = directionToken.includes('<');
  const hasRight = directionToken.includes('>');
  const markerMatch = directionToken.match(/[xo]/gi) || [];
  const markerLeft = /^[xo]/i.test(directionToken);
  const markerRight = /[xo]$/i.test(directionToken);
  let direction: ParsedEdge['direction'] = 'none';
  let reverse = false;
  if (
    (hasLeft && hasRight) ||
    (hasLeft && markerRight) ||
    (hasRight && markerLeft) ||
    (markerLeft && markerRight)
  ) {
    direction = 'both';
  } else if (hasLeft || hasRight || markerMatch.length > 0) {
    direction = 'forward';
    reverse = hasLeft && !hasRight;
  }

  return { label, direction, reverse, nextIndex: index };
}

function parseRelationLine(text: string) {
  const relations: RelationEdgeDatum[] = [];
  const nodes: ParsedNode[] = [];
  const nodeMap = new Map<string, ParsedNode>();
  let index = 0;
  const first = readNode(text, index);
  if (!first) return { relations, nodes };
  let current = first.node;
  if (!nodeMap.has(current.id)) {
    nodeMap.set(current.id, current);
    nodes.push(current);
  }
  index = first.nextIndex;

  while (index < text.length) {
    const edge = readEdge(text, index);
    if (!edge) break;
    index = edge.nextIndex;
    const nextNode = readNode(text, index);
    if (!nextNode) break;
    index = nextNode.nextIndex;

    let from = current.id;
    let to = nextNode.node.id;
    const direction = edge.direction;
    if (edge.reverse) {
      from = nextNode.node.id;
      to = current.id;
    }

    const relation: RelationEdgeDatum = {
      from,
      to,
    };
    if (edge.label) relation.label = edge.label;
    if (direction === 'both') relation.direction = 'both';
    if (direction === 'none') relation.direction = 'none';
    relations.push(relation);

    if (!nodeMap.has(current.id)) {
      nodeMap.set(current.id, current);
      nodes.push(current);
    }
    if (!nodeMap.has(nextNode.node.id)) {
      nodeMap.set(nextNode.node.id, nextNode.node);
      nodes.push(nextNode.node);
    }
    current = nextNode.node;
  }

  return { relations, nodes };
}

function ensureItemLabel(
  items: Map<string, ItemDatum>,
  list: ItemDatum[],
  id: string,
  label?: string,
) {
  if (!id) return;
  const existing = items.get(id);
  if (existing) {
    if (!existing.label && label) existing.label = label;
    return;
  }
  const item: ItemDatum = { id, label: label || id };
  items.set(id, item);
  list.push(item);
}

function parseExplicitRelation(
  node: SyntaxNode,
  path: string,
  errors: SyntaxError[],
) {
  const value = mapWithSchema(node, RelationSchema, path, errors);
  if (!value || typeof value !== 'object') return null;
  if (typeof value.from !== 'string' || typeof value.to !== 'string') {
    return null;
  }
  return value as RelationEdgeDatum;
}

export function parseRelationsNode(
  node: SyntaxNode,
  errors: SyntaxError[],
  path: string,
) {
  const relations: RelationEdgeDatum[] = [];
  const items: ItemDatum[] = [];
  const itemMap = new Map<string, ItemDatum>();

  const parseLine = (line: string) => {
    if (!RELATION_TOKEN.test(line)) return;
    const parsed = parseRelationLine(line);
    parsed.nodes.forEach((nodeItem) => {
      ensureItemLabel(itemMap, items, nodeItem.id, nodeItem.label);
    });
    relations.push(...parsed.relations);
  };

  if (node.kind === 'array') {
    node.items.forEach((item, index) => {
      if (
        item.kind === 'object' &&
        item.value &&
        Object.keys(item.entries).length === 0 &&
        RELATION_TOKEN.test(item.value)
      ) {
        parseLine(item.value);
        return;
      }
      const relation = parseExplicitRelation(item, `${path}[${index}]`, errors);
      if (relation) {
        relations.push(relation);
      }
    });
  } else if (node.kind === 'object' && node.value) {
    parseLine(node.value);
  }

  return { relations, items };
}

// ============================================================================
// Main Parse Function
// ============================================================================

const ALLOWED_ROOT_KEYS = new Set([
  'infographic',
  'template',
  'design',
  'data',
  'theme',
  'width',
  'height',
]);

function normalizeItems(items: ItemDatum[]) {
  const seen = new Set<string>();
  const normalized: ItemDatum[] = [];
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index];
    const id = item.id ?? item.label;
    if (!id) {
      normalized.push(item);
      continue;
    }
    if (seen.has(id)) continue;
    seen.add(id);
    if (!item.id) item.id = id;
    normalized.push(item);
  }
  return normalized.reverse();
}

function assignMissingNodeIds(items: ItemDatum[]) {
  items.forEach((item) => {
    if (!item.id && item.label) {
      item.id = item.label;
    }
  });
}

function resolveTemplate(
  node: SyntaxNode | undefined,
  errors: SyntaxParseResult['errors'],
) {
  if (!node) return undefined;
  const mapped = mapWithSchema(node, TemplateSchema, 'template', errors);
  if (!mapped) return undefined;
  if (typeof mapped === 'string') return mapped;
  if (typeof mapped === 'object' && typeof mapped.type === 'string') {
    return mapped.type;
  }
  return undefined;
}

function inferTemplateFromBareFirstLine(
  entries: Record<string, SyntaxNode>,
  warnings: SyntaxParseResult['warnings'],
) {
  if ('infographic' in entries || 'template' in entries) {
    return undefined;
  }

  const [firstEntry] = Object.entries(entries);
  if (!firstEntry) return undefined;

  const [key, node] = firstEntry;
  if (ALLOWED_ROOT_KEYS.has(key) || node.kind !== 'object') {
    return undefined;
  }
  if (node.value !== undefined || Object.keys(node.entries).length > 0) {
    return undefined;
  }

  warnings.push({
    path: 'template',
    line: node.line,
    code: 'implicit_template',
    message:
      'Inferred template from a bare first line. Prefix it with "infographic" or "template" to make the syntax explicit.',
    raw: key,
  });

  return {
    template: key,
    inferredKey: key,
  };
}

export function parseSyntax(input: string): SyntaxParseResult {
  const { ast, errors } = parseSyntaxToAst(input);
  const warnings: SyntaxParseResult['warnings'] = [];
  const options: Partial<InfographicOptions> = {};

  const mergedEntries = { ...ast.entries };
  const inferredTemplate = inferTemplateFromBareFirstLine(
    ast.entries,
    warnings,
  );
  if (inferredTemplate) {
    delete mergedEntries[inferredTemplate.inferredKey];
  }

  const infographicNode = ast.entries.infographic;
  let templateFromInfographic: string | undefined;
  if (infographicNode && infographicNode.kind === 'object') {
    if (infographicNode.value) templateFromInfographic = infographicNode.value;
    Object.entries(infographicNode.entries).forEach(([key, value]) => {
      if (!(key in mergedEntries)) mergedEntries[key] = value;
    });
  }

  Object.keys(mergedEntries).forEach((key) => {
    if (!ALLOWED_ROOT_KEYS.has(key)) {
      errors.push({
        path: key,
        line: (mergedEntries[key] as SyntaxNode).line,
        code: 'unknown_key',
        message: 'Unknown top-level key.',
        raw: key,
      });
    }
  });

  const templateNode = mergedEntries.template as SyntaxNode | undefined;
  const templateValue = resolveTemplate(templateNode, errors);
  if (templateValue) options.template = templateValue;
  if (!options.template && templateFromInfographic) {
    options.template = templateFromInfographic;
  }
  if (!options.template && inferredTemplate) {
    options.template = inferredTemplate.template;
  }

  const designNode = mergedEntries.design as SyntaxNode | undefined;
  if (designNode) {
    const design = mapWithSchema(designNode, DesignSchema, 'design', errors);
    if (design) options.design = design;
  }

  const dataNode = mergedEntries.data as SyntaxNode | undefined;
  if (dataNode) {
    let relationsNode: SyntaxNode | undefined;
    let dataNodeForMapping = dataNode;
    if (dataNode.kind === 'object') {
      const { relations, ...rest } = dataNode.entries;
      relationsNode = relations;
      dataNodeForMapping = { ...dataNode, entries: rest };
    }
    const data = mapWithSchema(dataNodeForMapping, DataSchema, 'data', errors);
    if (data) options.data = data;
    if (relationsNode) {
      const parsed = parseRelationsNode(
        relationsNode,
        errors,
        'data.relations',
      );
      if (parsed.relations.length > 0 || parsed.items.length > 0) {
        const current = (options.data ?? {}) as Record<string, any>;

        if (Array.isArray(current.items)) {
          assignMissingNodeIds(current.items as ItemDatum[]);
        }
        if (Array.isArray(current.nodes)) {
          assignMissingNodeIds(current.nodes as ItemDatum[]);
        }

        const dataKeys = Object.keys(
          (DataSchema as ObjectSchema).fields,
        ).filter((key) => key !== 'items' && key !== 'relations');
        let hasStructuredData = false;

        for (const key of dataKeys) {
          if (Array.isArray(current[key]) && current[key].length > 0) {
            hasStructuredData = true;
            break;
          }
        }

        if (
          !hasStructuredData &&
          Array.isArray(current.items) &&
          current.items.length > 0 &&
          current.items.some(
            (item: any) =>
              Array.isArray(item.children) && item.children.length > 0,
          )
        ) {
          hasStructuredData = true;
        }

        if (!hasStructuredData) {
          const existingItems = Array.isArray(current.items)
            ? (current.items as ItemDatum[])
            : [];

          const normalizedItems = normalizeItems(existingItems);
          const itemMap = new Map<string, ItemDatum>();
          normalizedItems.forEach((item) => {
            if (item.id) itemMap.set(item.id, item);
          });
          parsed.items.forEach((item) => {
            const existing = itemMap.get(item.id as string);
            if (existing) {
              if (!existing.label && item.label) existing.label = item.label;
            } else {
              normalizedItems.push(item);
              itemMap.set(item.id as string, item);
            }
          });
          current.items = normalizedItems;
        }

        current.relations = parsed.relations;
        options.data = current as any;
      }
    }
  }

  const themeNode = mergedEntries.theme as SyntaxNode | undefined;
  if (themeNode) {
    const theme = mapWithSchema(themeNode, ThemeSchema, 'theme', errors);
    if (theme && typeof theme === 'object') {
      const { type, ...rest } = theme as Record<string, any>;
      if (typeof type === 'string' && type) options.theme = type;
      if (Object.keys(rest).length > 0) {
        options.themeConfig = rest;
      }
    }
  }

  const widthNode = mergedEntries.width as SyntaxNode | undefined;
  if (widthNode) {
    const width = mapWithSchema(
      widthNode,
      RootSchema.fields.width,
      'width',
      errors,
    );
    if (width !== undefined) options.width = width;
  }

  const heightNode = mergedEntries.height as SyntaxNode | undefined;
  if (heightNode) {
    const height = mapWithSchema(
      heightNode,
      RootSchema.fields.height,
      'height',
      errors,
    );
    if (height !== undefined) options.height = height;
  }

  return {
    options,
    errors,
    warnings,
    ast,
  };
}
