import { describe, expect, it } from 'vitest'
import { GuessGame } from './game.js'

const fixed = (secret: number) => (_min: number, _max: number) => secret

describe('GuessGame', () => {
  describe('start', () => {
    it('sets status to playing', () => {
      const game = new GuessGame({ randomFn: fixed(42) })
      game.start()
      expect(game.getState().status).toBe('playing')
    })

    it('resets attempts to zero', () => {
      const game = new GuessGame({ randomFn: fixed(42) })
      game.start()
      game.guess(1)
      game.start()
      expect(game.getState().attempts).toBe(0)
    })
  })

  describe('guess', () => {
    it('throws when the game has not been started', () => {
      const game = new GuessGame()
      expect(() => game.guess(5)).toThrow()
    })

    it('returns too-low when the guess is below the secret', () => {
      const game = new GuessGame({ randomFn: fixed(50) })
      game.start()
      expect(game.guess(30)).toBe('too-low')
    })

    it('returns too-high when the guess is above the secret', () => {
      const game = new GuessGame({ randomFn: fixed(50) })
      game.start()
      expect(game.guess(70)).toBe('too-high')
    })

    it('returns correct and sets status to won', () => {
      const game = new GuessGame({ randomFn: fixed(50) })
      game.start()
      expect(game.guess(50)).toBe('correct')
      expect(game.getState().status).toBe('won')
    })

    it('sets status to lost after exhausting all attempts', () => {
      const game = new GuessGame({ maxAttempts: 3, randomFn: fixed(50) })
      game.start()
      game.guess(1)
      game.guess(1)
      game.guess(1)
      expect(game.getState().status).toBe('lost')
    })

    it('increments attempts on each guess', () => {
      const game = new GuessGame({ randomFn: fixed(50) })
      game.start()
      game.guess(1)
      game.guess(2)
      expect(game.getState().attempts).toBe(2)
    })
  })

  describe('getState', () => {
    it('hides the secret number while playing', () => {
      const game = new GuessGame({ randomFn: fixed(42) })
      game.start()
      expect(game.getState().secretNumber).toBeNull()
    })

    it('reveals the secret number when the game is won', () => {
      const game = new GuessGame({ randomFn: fixed(42) })
      game.start()
      game.guess(42)
      expect(game.getState().secretNumber).toBe(42)
    })

    it('reveals the secret number when the game is lost', () => {
      const game = new GuessGame({ maxAttempts: 1, randomFn: fixed(42) })
      game.start()
      game.guess(1)
      expect(game.getState().secretNumber).toBe(42)
    })
  })

  describe('reset', () => {
    it('sets status back to idle', () => {
      const game = new GuessGame({ randomFn: fixed(42) })
      game.start()
      game.reset()
      expect(game.getState().status).toBe('idle')
    })

    it('hides the secret number after reset', () => {
      const game = new GuessGame({ randomFn: fixed(42) })
      game.start()
      game.guess(42)
      game.reset()
      expect(game.getState().secretNumber).toBeNull()
    })
  })
})
