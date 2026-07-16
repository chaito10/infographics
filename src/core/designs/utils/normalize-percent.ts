/**
 * Normalize percentage input
 *
 * Supports formats:
 * - "2%" or "2.5%" → 2 or 2.5
 * - 2 or 2.5 (number as percentage) → 2 or 2.5
 */
export function normalizePercent(value: number | string | undefined): number {
  if (value === undefined || value === null) return 0;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const numStr = trimmed.endsWith('%') ? trimmed.slice(0, -1) : trimmed;
    const num = parseFloat(numStr);
    return isNaN(num) ? 0 : num;
  }

  return value;
}
