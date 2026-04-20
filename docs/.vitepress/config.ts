import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Monorepo Demo',
  description: 'Demo monorepo for Node.js TypeScript packages',

  // Serve markdown from the repo root so package docs live next to their code.
  srcDir: '..',
  srcExclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '*.md', // exclude root-level README.md, guide.md, etc.
  ],

  // Map source paths (relative to srcDir) to clean URL paths.
  rewrites: {
    'docs/:path(.*)': ':path',
    'packages/demo-core-lib/docs/:page': 'demo-core-lib/:page',
    'packages/demo-game-lib/docs/:page': 'demo-game-lib/:page',
  },

  themeConfig: {
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Guide', link: '/guide/' },
      {
        text: 'Packages',
        items: [
          { text: 'demo-core-lib', link: '/demo-core-lib/' },
          { text: 'demo-game-lib', link: '/demo-game-lib/' },
        ],
      },
      { text: 'API Reference', link: '/api/' },
    ],
    sidebar: {
      '/guide/': [{ text: 'Introduction', link: '/guide/' }],
      '/demo-core-lib/': [
        {
          text: '@bear2b/demo-core-lib',
          items: [{ text: 'Overview', link: '/demo-core-lib/' }],
        },
      ],
      '/demo-game-lib/': [
        {
          text: '@bear2b/demo-game-lib',
          items: [{ text: 'Overview', link: '/demo-game-lib/' }],
        },
      ],
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
