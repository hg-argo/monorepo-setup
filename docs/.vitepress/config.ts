import { defineConfig } from 'vitepress'
import typedocSidebar from '../api/typedoc-sidebar.json'

export default defineConfig({
  base: '/monorepo-setup/',
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
      '/guide/': [
        { text: 'Guide', link: '/guide/' },
        { text: 'Setup instructions', link: '/guide/setup' },
        { text: 'Stack summary', link: '/guide/stack' },
      ],
      '/demo-core-lib/': [
        {
          text: '@hg-argo/demo-core-lib',
          items: [{ text: 'Overview', link: '/demo-core-lib/' }],
        },
      ],
      '/demo-game-lib/': [
        {
          text: '@hg-argo/demo-game-lib',
          items: [{ text: 'Overview', link: '/demo-game-lib/' }],
        },
      ],
      '/api/': typedocSidebar,
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/bear2b/monorepo-setup' }],
  },
})
