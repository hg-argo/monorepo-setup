# @hg-argo/demo-game-lib

A headless guess-the-number game engine built on top of `@hg-argo/demo-core-lib`. Contains no I/O — wire it to any UI (console, web, CLI) by calling `start()`, `guess()`, and `getState()`.

## Installation

::: code-group

```sh [pnpm]
pnpm add @hg-argo/demo-game-lib
```

```sh [npm]
npm install @hg-argo/demo-game-lib
```

:::

## Quick start

```ts
import { GuessGame } from '@hg-argo/demo-game-lib'

const game = new GuessGame({ range: { min: 1, max: 100 }, maxAttempts: 10 })

game.start()

let result = game.guess(50)   // 'too-low' | 'too-high' | 'correct'
console.log(result)

console.log(game.getState())
// {
//   status: 'playing',
//   attempts: 1,
//   maxAttempts: 10,
//   range: { min: 1, max: 100 },
//   secretNumber: null   // hidden while playing
// }
```

## `GuessGame`

The main game class. Accepts an optional `GuessGameOptions` object.

```ts
import { GuessGame } from '@hg-argo/demo-game-lib'

const game = new GuessGame()          // defaults: range 1–100, 10 attempts
const custom = new GuessGame({
  range: { min: 1, max: 50 },
  maxAttempts: 5,
})
```

### `GuessGameOptions`

| Property | Type | Default | Description |
|---|---|---|---|
| `range` | `Range` | `{ min: 1, max: 100 }` | The inclusive range the secret number is drawn from |
| `maxAttempts` | `number` | `10` | Maximum number of guesses before the game is lost |
| `randomFn` | `(min, max) => number` | `randomInt` | Override the random function — useful for deterministic tests |

### `start()`

Picks a secret number and resets progress. Must be called before `guess()`.

```ts
game.start()
```

### `guess(n)`

Submits a guess. Returns a `GuessResult` indicating the outcome.

```ts
game.start()

game.guess(30)   // 'too-low'
game.guess(80)   // 'too-high'
game.guess(55)   // 'correct'
```

Throws an error if called when the game is not in progress.

### `getState()`

Returns a read-only snapshot of the current game state.

```ts
const state = game.getState()
// {
//   status: 'playing' | 'idle' | 'won' | 'lost',
//   attempts: number,
//   maxAttempts: number,
//   range: { min: number, max: number },
//   secretNumber: number | null   // revealed only when won or lost
// }
```

### `reset()`

Resets the game back to `idle` without picking a new secret. Call `start()` again to begin a new round.

```ts
game.reset()
console.log(game.getState().status)   // 'idle'
```

## Types

### `GameStatus`

```ts
type GameStatus = 'idle' | 'playing' | 'won' | 'lost'
```

### `GuessResult`

```ts
type GuessResult = 'too-low' | 'too-high' | 'correct'
```

### `GameState`

```ts
interface GameState {
  status: GameStatus
  attempts: number
  maxAttempts: number
  range: { min: number; max: number }
  secretNumber: number | null
}
```

## Example: deterministic testing

Pass a custom `randomFn` to control the secret number in tests:

```ts
import { GuessGame } from '@hg-argo/demo-game-lib'
import { expect, test } from 'vitest'

test('wins on correct guess', () => {
  const game = new GuessGame({ randomFn: () => 42 })
  game.start()

  expect(game.guess(10)).toBe('too-low')
  expect(game.guess(42)).toBe('correct')
  expect(game.getState().status).toBe('won')
})
```

## API Reference

See the full [API Reference](/api/@hg-argo/demo-game-lib/) for detailed type signatures.
