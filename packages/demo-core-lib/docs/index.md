# @bear2b/demo-core-lib

Zero-dependency utilities for numeric ranges and random integers — the primitives on which `@bear2b/demo-game-lib` is built.

## Installation

::: code-group

```sh [pnpm]
pnpm add @bear2b/demo-core-lib
```

```sh [npm]
npm install @bear2b/demo-core-lib
```

:::

## `randomInt`

Returns a random integer between `min` and `max`, **inclusive on both ends**.

```ts
import { randomInt } from '@bear2b/demo-core-lib'

randomInt(1, 6)   // simulates a dice roll → 1, 2, 3, 4, 5, or 6
randomInt(0, 0)   // always 0
```

## `Range`

A plain interface representing a closed numeric interval `[min, max]`.

```ts
import type { Range } from '@bear2b/demo-core-lib'

const percentage: Range = { min: 0, max: 100 }
```

### `contains`

Returns `true` if a value falls within the range (inclusive).

```ts
import { contains } from '@bear2b/demo-core-lib'

contains({ min: 1, max: 10 }, 5)   // true
contains({ min: 1, max: 10 }, 0)   // false
contains({ min: 1, max: 10 }, 10)  // true
```

### `clamp`

Clamps a value so it never falls outside the range.

```ts
import { clamp } from '@bear2b/demo-core-lib'

clamp({ min: 0, max: 100 }, 120)  // 100
clamp({ min: 0, max: 100 }, -5)   // 0
clamp({ min: 0, max: 100 }, 42)   // 42
```

### `size`

Returns the number of integers in the range.

```ts
import { size } from '@bear2b/demo-core-lib'

size({ min: 1, max: 10 })   // 10
size({ min: 0, max: 0 })    // 1
size({ min: -5, max: 5 })   // 11
```

## API Reference

See the full [API Reference](/api/@bear2b/demo-core-lib/) for detailed type signatures.
