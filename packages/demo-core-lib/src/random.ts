/**
 * Returns a random integer between `min` and `max`, inclusive on both ends.
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
