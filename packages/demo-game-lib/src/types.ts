export type GuessResult = 'too-low' | 'too-high' | 'correct'
export type GameStatus = 'idle' | 'playing' | 'won' | 'lost'

export interface GameState {
  status: GameStatus
  attempts: number
  maxAttempts: number
  range: { min: number; max: number }
  /** Revealed only when status is `'won'` or `'lost'`. */
  secretNumber: number | null
}
