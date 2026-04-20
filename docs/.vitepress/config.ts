import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Monorepo Demo',
  description: 'Demo monorepo for Node.js TypeScript packages',
  themeConfig: {
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: {
      '/guide/': [{ text: 'Introduction', link: '/guide/' }],
      '/api/': [
        {
          text: 'demo-core-lib',
          link: '/api/@bear2b/demo-core-lib/',
          items: [
            { text: 'Range', link: '/api/@bear2b/demo-core-lib/interfaces/Range' },
            { text: 'clamp()', link: '/api/@bear2b/demo-core-lib/functions/clamp' },
            { text: 'contains()', link: '/api/@bear2b/demo-core-lib/functions/contains' },
            { text: 'randomInt()', link: '/api/@bear2b/demo-core-lib/functions/randomInt' },
            { text: 'size()', link: '/api/@bear2b/demo-core-lib/functions/size' },
          ],
        },
        {
          text: 'demo-game-lib',
          link: '/api/@bear2b/demo-game-lib/',
          items: [
            { text: 'GuessGame', link: '/api/@bear2b/demo-game-lib/classes/GuessGame' },
            { text: 'GuessGameOptions', link: '/api/@bear2b/demo-game-lib/interfaces/GuessGameOptions' },
            { text: 'GameState', link: '/api/@bear2b/demo-game-lib/interfaces/GameState' },
            { text: 'GameStatus', link: '/api/@bear2b/demo-game-lib/type-aliases/GameStatus' },
            { text: 'GuessResult', link: '/api/@bear2b/demo-game-lib/type-aliases/GuessResult' },
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/bear2b/monorepo-setup' }],
  },
})
