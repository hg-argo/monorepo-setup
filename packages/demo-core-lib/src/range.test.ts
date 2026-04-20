import { describe, expect, it } from 'vitest'
import { clamp, contains, size } from './range.js'

describe('contains', () => {
  it('returns true for values within the range', () => {
    expect(contains({ min: 1, max: 10 }, 1)).toBe(true)
    expect(contains({ min: 1, max: 10 }, 5)).toBe(true)
    expect(contains({ min: 1, max: 10 }, 10)).toBe(true)
  })

  it('returns false for values outside the range', () => {
    expect(contains({ min: 1, max: 10 }, 0)).toBe(false)
    expect(contains({ min: 1, max: 10 }, 11)).toBe(false)
  })
})

describe('clamp', () => {
  it('returns the value unchanged when within range', () => {
    expect(clamp({ min: 1, max: 10 }, 5)).toBe(5)
  })

  it('clamps to min when below', () => {
    expect(clamp({ min: 1, max: 10 }, -5)).toBe(1)
  })

  it('clamps to max when above', () => {
    expect(clamp({ min: 1, max: 10 }, 20)).toBe(10)
  })
})

describe('size', () => {
  it('returns the count of integers in the range', () => {
    expect(size({ min: 1, max: 10 })).toBe(10)
    expect(size({ min: 0, max: 0 })).toBe(1)
    expect(size({ min: -5, max: 5 })).toBe(11)
  })
})
