import { describe, expect, it } from 'vitest'
import { randomInt } from './random.js'

describe('randomInt', () => {
  it('returns a value within the given range', () => {
    for (let i = 0; i < 200; i++) {
      const result = randomInt(1, 10)
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(10)
    }
  })

  it('always returns an integer', () => {
    for (let i = 0; i < 50; i++) {
      expect(Number.isInteger(randomInt(0, 100))).toBe(true)
    }
  })

  it('returns min when min equals max', () => {
    expect(randomInt(5, 5)).toBe(5)
  })
})
