import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Monorepo Demo',
  description: 'Demo monorepo for Node.js TypeScript packages',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: {
      '/guide/': [{ text: 'Introduction', link: '/guide/' }],
      '/api/': [{ text: 'API Reference', link: '/api/' }],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/bear2b/monorepo-setup' }],
  },
})
