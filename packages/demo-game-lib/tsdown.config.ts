import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  },
  {
    entry: ['src/index.ts'],
    format: ['cjs'],
    dts: true,
    outExtensions: () => ({ js: '.cjs', dts: '.d.cts' }),
  },
])
