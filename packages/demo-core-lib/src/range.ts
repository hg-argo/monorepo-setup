/** A closed numeric interval [min, max]. */
export interface Range {
  min: number
  max: number
}

/** Returns `true` if `value` is within the range, inclusive. */
export function contains(range: Range, value: number): boolean {
  return value >= range.min && value <= range.max
}

/** Clamps `value` to the range. */
export function clamp(range: Range, value: number): number {
  return Math.max(range.min, Math.min(range.max, value))
}

/** Returns the number of integers in the range. */
export function size(range: Range): number {
  return range.max - range.min + 1
}
