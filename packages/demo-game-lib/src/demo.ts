import { createInterface } from 'node:readline'
import { GuessGame } from './game.js'

const game = new GuessGame({ range: { min: 1, max: 100 }, maxAttempts: 7 })
game.start()

const { range, maxAttempts } = game.getState()

console.log('')
console.log(`  Guess the number between ${range.min} and ${range.max}.`)
console.log(`  You have ${maxAttempts} attempts.`)
console.log('')

const rl = createInterface({ input: process.stdin, output: process.stdout })

function prompt(): void {
  const state = game.getState()
  const attemptLabel = `${state.attempts + 1}/${maxAttempts}`

  rl.question(`  Attempt ${attemptLabel} > `, (input) => {
    const n = parseInt(input.trim(), 10)

    if (isNaN(n)) {
      console.log('  Please enter a valid number.\n')
      prompt()
      return
    }

    const result = game.guess(n)
    const next = game.getState()

    if (result === 'correct') {
      console.log(`\n  Correct! You found the number in ${next.attempts} attempt${next.attempts > 1 ? 's' : ''}.\n`)
      rl.close()
      return
    }

    if (next.status === 'lost') {
      console.log(`\n  Game over. The number was ${next.secretNumber}.\n`)
      rl.close()
      return
    }

    const hint = result === 'too-low' ? 'Too low.' : 'Too high.'
    const left = next.maxAttempts - next.attempts
    console.log(`  ${hint} (${left} attempt${left > 1 ? 's' : ''} left)\n`)
    prompt()
  })
}

prompt()
