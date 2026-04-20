import { type Range, randomInt } from '@bear2b/demo-core-lib'
import type { GameState, GameStatus, GuessResult } from './types.js'

export interface GuessGameOptions {
  range?: Range
  maxAttempts?: number
  /** Override the random function — useful for deterministic tests. */
  randomFn?: (min: number, max: number) => number
}

/**
 * Pure game state machine for a guess-the-number game.
 * Contains no I/O — wire it to any UI by calling `start()`, `guess()`, and `getState()`.
 */
export class GuessGame {
  private secretNumber: number | null = null
  private attempts = 0
  private status: GameStatus = 'idle'
  private readonly range: Range
  private readonly maxAttempts: number
  private readonly randomFn: (min: number, max: number) => number

  constructor(options: GuessGameOptions = {}) {
    this.range = options.range ?? { min: 1, max: 100 }
    this.maxAttempts = options.maxAttempts ?? 10
    this.randomFn = options.randomFn ?? randomInt
  }

  /** Picks the secret number and resets progress. */
  start(): void {
    this.secretNumber = this.randomFn(this.range.min, this.range.max)
    this.attempts = 0
    this.status = 'playing'
  }

  /** Submits a guess. Throws if the game is not in progress. */
  guess(n: number): GuessResult {
    if (this.status !== 'playing' || this.secretNumber === null) {
      throw new Error('Game is not in progress — call start() first.')
    }

    this.attempts++

    if (n === this.secretNumber) {
      this.status = 'won'
      return 'correct'
    }

    if (this.attempts >= this.maxAttempts) {
      this.status = 'lost'
    }

    return n < this.secretNumber ? 'too-low' : 'too-high'
  }

  /** Returns a snapshot of the current game state. The secret number is hidden while playing. */
  getState(): Readonly<GameState> {
    const isOver = this.status === 'won' || this.status === 'lost'
    return {
      status: this.status,
      attempts: this.attempts,
      maxAttempts: this.maxAttempts,
      range: { ...this.range },
      secretNumber: isOver ? this.secretNumber : null,
    }
  }

  /** Resets the game back to `idle` without picking a new secret. */
  reset(): void {
    this.secretNumber = null
    this.attempts = 0
    this.status = 'idle'
  }
}
