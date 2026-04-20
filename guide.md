# Monorepo Setup Guide

> Step-by-step guide to building a production-grade Node.js monorepo for TypeScript packages with full automation.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Initialize the repository](#2-initialize-the-repository)
3. [pnpm workspaces](#3-pnpm-workspaces)
4. [TypeScript](#4-typescript)
5. [Biome — linting & formatting](#5-biome--linting--formatting)
6. [Git hooks — Husky + commitlint](#6-git-hooks--husky--commitlint)
7. [Package build — tsdown](#7-package-build--tsdown)
8. [Testing — Vitest](#8-testing--vitest)
9. [Compatibility checks — publint + attw](#9-compatibility-checks--publint--attw)
10. [API documentation — TypeDoc](#10-api-documentation--typedoc)
11. [Documentation site — VitePress](#11-documentation-site--vitepress)
12. [Release automation — semantic-release](#12-release-automation--semantic-release)
13. [CI/CD — GitHub workflows](#13-cicd--github-workflows)
14. [Adding a new package](#14-adding-a-new-package)

---

## 1. Prerequisites

Before starting, ensure the following tools are available on your machine:

- **Node.js** ≥ 22 (LTS recommended)
- **pnpm** ≥ 9 — install via [Corepack](https://nodejs.org/api/corepack.html): `corepack enable && corepack prepare pnpm@latest --activate`
- **Git** ≥ 2.x

> **Why Corepack?** Corepack ships with Node.js and manages package manager versions without requiring a global install. It also enforces the `packageManager` field in `package.json`, which is how we prevent contributors from accidentally using npm or yarn.

---

## 2. Initialize the repository

```bash
git init
git branch -M main
```

Create the root `package.json`:

```json
{
  "name": "monorepo",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=22",
    "pnpm": ">=9"
  },
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "biome check .",
    "format": "biome format --write .",
    "docs:api": "typedoc",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs"
  }
}
```

Create `.npmrc` at the root to enforce strict engine checks and prevent accidental npm usage:

```ini
engine-strict=true
```

> **`engine-strict=true`** causes pnpm (and npm) to hard-fail if the running Node/pnpm version does not satisfy `engines`. Combined with `packageManager` and Corepack, this is the strongest available guardrail against wrong-toolchain installs.

Create a `.gitignore`:

```gitignore
node_modules/
dist/
.cache/
*.tsbuildinfo
coverage/
docs/.vitepress/dist/
docs/.vitepress/cache/
```

---

## 3. pnpm workspaces

Create `pnpm-workspace.yaml` at the root:

```yaml
packages:
  - "packages/*"
```

All packages live under `packages/`. Each sub-directory is an independent publishable package.

> **Why a flat `packages/*` layout vs nested scopes?** A flat layout keeps `pnpm -r` filters simple and avoids glob ambiguity in workspace tooling. If you need logical grouping, use package name scopes (e.g. `@myorg/ui`, `@myorg/utils`) rather than nested directories.

Create the `packages/` directory and a `.gitkeep` to track it:

```bash
mkdir packages && touch packages/.gitkeep
```

### Verifying workspace linking

When a package A depends on package B in the same monorepo, declare it as a workspace dependency:

```json
{
  "dependencies": {
    "@myorg/utils": "workspace:*"
  }
}
```

`pnpm install` will symlink B into A's `node_modules` automatically. The `workspace:*` protocol resolves to the exact local version at publish time.

---

## 4. TypeScript

Install TypeScript at the root (used by all packages):

```bash
pnpm add -Dw typescript
```

Create a root `tsconfig.base.json` that all packages extend:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "lib": ["ES2022"]
  }
}
```

Create a root `tsconfig.json` that references all packages (for editor support and project-wide type checking):

```json
{
  "files": [],
  "references": [
    { "path": "./packages/your-package" }
  ]
}
```

> **`verbatimModuleSyntax`** enforces that `import type` is used for type-only imports. This is essential for bundlers (like tsdown) that strip types without running `tsc` — it prevents runtime errors from type-only imports being emitted as real `require()` calls.

> **`module: "NodeNext"`** with `moduleResolution: "NodeNext"` is the correct setting for packages targeting Node.js. It requires explicit `.js` extensions on relative imports (e.g. `import { foo } from './foo.js'`) even in TypeScript source files, which aligns with ESM semantics.

---

## 5. Biome — linting & formatting

Biome replaces both ESLint and Prettier in a single, fast Rust-based tool.

```bash
pnpm add -Dw @biomejs/biome
pnpm biome init
```

Recommended `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "organizeImports": {
    "enabled": true
  },
  "files": {
    "ignore": ["dist/", "coverage/", "*.tsbuildinfo"]
  }
}
```

Add to `package.json` scripts (already listed in step 2):

```bash
pnpm lint     # check
pnpm format   # auto-fix formatting
```

> **Why Biome over ESLint + Prettier?** The two-tool combo has well-known friction: format-on-save fights with lint-on-save, plugin version conflicts, and slow cold starts on large repos. Biome is 10–100× faster and has a single config file. The tradeoff is a smaller plugin ecosystem — but for a greenfield repo, the recommended ruleset covers the vast majority of real issues.

---

## 6. Git hooks — Husky + commitlint

### Husky

```bash
pnpm add -Dw husky
pnpm exec husky init
```

This creates `.husky/` with a sample `pre-commit` hook.

### Lint-staged (pre-commit)

Run Biome only on staged files to keep pre-commit fast:

```bash
pnpm add -Dw lint-staged
```

`.husky/pre-commit`:
```sh
pnpm exec lint-staged
```

`package.json` (root):
```json
{
  "lint-staged": {
    "**/*.{ts,tsx,js,jsx,json}": ["biome check --write --no-bail"]
  }
}
```

### commitlint (pre-push or commit-msg)

```bash
pnpm add -Dw @commitlint/cli @commitlint/config-conventional
```

`commitlint.config.js`:
```js
export default { extends: ['@commitlint/config-conventional'] };
```

`.husky/commit-msg`:
```sh
pnpm exec commitlint --edit "$1"
```

> **Conventional commits format:** `type(scope): description` — e.g. `feat(utils): add debounce helper`. Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `test`, `ci`, `build`, `revert`. This format is the input contract for semantic-release's automatic versioning in step 12.

> **Why commitlint on commit-msg rather than pre-push?** Catching a bad commit message immediately (before it's in history) is far less disruptive than rejecting a push with multiple already-made commits. Fix it once, not five times.

---

## 7. Package build — tsdown

[tsdown](https://tsdown.dev) is a zero-config TypeScript package bundler built on Rolldown (the Rust-based Rollup successor). It produces both CJS and ESM outputs with proper `.d.ts` declaration files.

```bash
pnpm add -Dw tsdown
```

Each package gets its own `tsdown.config.ts`:

```ts
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
});
```

Each package's `package.json` should expose the built output correctly:

```json
{
  "name": "@myorg/my-package",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch"
  }
}
```

> **Why dual CJS+ESM output?** The Node.js ecosystem is still in transition. Many tools (Jest, older bundlers, some CLIs) require CJS. Publishing both formats ensures maximum compatibility without forcing consumers to change their setup.

> **tsdown vs tsup:** tsup (esbuild-based) is more battle-tested. tsdown is newer and Rolldown is still pre-1.0, so expect occasional rough edges. The upside is that tsdown will track Vite's bundler evolution and is likely the long-term standard. Either is a valid choice — just be aware of the maturity gap.

---

## 8. Testing — Vitest

```bash
pnpm add -Dw vitest @vitest/coverage-v8
```

Root `vitest.config.ts` (workspace mode):

```ts
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace(['packages/*/vitest.config.ts']);
```

Each package's `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/**/*.test.ts'],
    },
  },
});
```

Root scripts in `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

> **Why not Jest?** Vitest shares Vite's plugin ecosystem, has first-class TypeScript support without a separate transform step, and is significantly faster due to parallel execution and esbuild-based transforms. For a TypeScript-first monorepo, Vitest is the clear choice in 2025+.

> **`globals: false`** is intentional. Relying on implicit globals (`describe`, `it`, `expect`) makes test files ambiguous outside the test runner. Explicit imports (`import { describe, it, expect } from 'vitest'`) are better for IDE support and less surprising.

---

## 9. Compatibility checks — publint + attw

These two tools catch package distribution mistakes before publish.

```bash
pnpm add -Dw publint @arethetypeswrong/cli
```

Add to each package's `package.json`:

```json
{
  "scripts": {
    "check:publint": "publint",
    "check:attw": "attw --pack ."
  }
}
```

Run both in CI before publishing:

```bash
pnpm -r check:publint
pnpm -r check:attw
```

**What each tool checks:**

- **publint** — validates that `exports`, `main`, `module`, and `types` fields actually point to existing files, checks for common mistakes like missing CJS/ESM conditions.
- **attw (Are the Types Wrong?)** — verifies that TypeScript consumers using different module resolution strategies (`bundler`, `node16`, `nodenext`) all get correct types. Catches issues that publint misses.

> Running both is not redundant — they catch different classes of errors. Think of publint as runtime-distribution checks and attw as type-distribution checks.

---

## 10. API documentation — TypeDoc

TypeDoc generates API reference docs directly from TypeScript source and JSDoc comments.

```bash
pnpm add -Dw typedoc typedoc-plugin-markdown
```

`typedoc.json` at the root:

```json
{
  "entryPointStrategy": "packages",
  "entryPoints": ["packages/*"],
  "out": "docs/api",
  "plugin": ["typedoc-plugin-markdown"],
  "readme": "none",
  "githubPages": false
}
```

> **`entryPointStrategy: "packages"`** tells TypeDoc to discover each package's `package.json` and use its `main`/`types` entry. This is the correct mode for monorepos — avoid `entryPointStrategy: "expand"` which can produce confusing cross-package output.

> **`typedoc-plugin-markdown`** outputs `.md` files instead of standalone HTML, which VitePress (step 11) can consume directly. This avoids maintaining two separate documentation systems.

---

## 11. Documentation site — VitePress

VitePress hosts the project documentation and auto-generated API docs.

```bash
pnpm add -Dw vitepress
pnpm exec vitepress init  # follow prompts, target ./docs
```

Recommended structure:

```
docs/
  .vitepress/
    config.ts
  api/          ← TypeDoc output goes here
  guide/
    index.md
  index.md      ← homepage
```

`docs/.vitepress/config.ts` (minimal):

```ts
import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'My Monorepo',
  description: 'Package documentation',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: {
      '/api/': [{ text: 'API Reference', items: [] }],
    },
  },
});
```

> Generate API docs before building the site: `pnpm docs:api && pnpm docs:build`.

---

## 12. Release automation — semantic-release

semantic-release automates version bumps and CHANGELOG generation based on conventional commit messages.

```bash
pnpm add -Dw semantic-release \
  @semantic-release/changelog \
  @semantic-release/git \
  @semantic-release/github \
  @semantic-release/npm \
  semantic-release-monorepo
```

> **`semantic-release-monorepo`** is a critical addition. Without it, semantic-release treats the whole repo as a single package and can't determine which packages need bumping. This plugin makes semantic-release operate per-package by scoping commit analysis to paths changed.

Root `.releaserc.json`:

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", { "changelogFile": "CHANGELOG.md" }],
    "@semantic-release/npm",
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "package.json"],
      "message": "chore(release): ${nextRelease.version} [skip ci]"
    }],
    "@semantic-release/github"
  ]
}
```

Each package that should be published to npm should set `"private": false` and have a matching `.releaserc.json` (can extend the root).

**Commit → version mapping:**

| Commit type | Version bump |
|---|---|
| `fix:` | patch (0.0.x) |
| `feat:` | minor (0.x.0) |
| `feat!:` or `BREAKING CHANGE:` | major (x.0.0) |
| `chore:`, `docs:`, `test:` | no release |

> **semantic-release vs changesets:** changesets is an alternative that gives developers manual control over which packages get bumped (via `changeset` files checked into git). It's preferred when you want human curation over every release. semantic-release is fully automatic — better for teams that trust their commit discipline and want zero-friction releases. Given the conventional commit enforcement already in place (step 6), semantic-release is a natural fit here.

---

## 13. CI/CD — GitHub workflows

### Build & test (every PR)

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm test:coverage
      - run: pnpm -r check:publint
      - run: pnpm -r check:attw
```

### Release (on merge to main)

`.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
      packages: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0        # semantic-release needs full history
          persist-credentials: false
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          registry-url: https://registry.npmjs.org
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm dlx semantic-release-monorepo
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

> **`fetch-depth: 0`** is required — semantic-release walks commit history to determine what changed since the last release tag. A shallow clone will cause it to miss commits or fail entirely.

> **Private packages → GitHub Packages:** For packages that should go to GitHub Packages instead of npm, set `"publishConfig": { "registry": "https://npm.pkg.github.com" }` in that package's `package.json` and use `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` in the release job.

### Documentation deploy (GitHub Pages)

`.github/workflows/docs.yml`:

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm docs:api
      - run: pnpm docs:build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist
      - uses: actions/deploy-pages@v4
        id: deployment
```

---

## 14. Adding a new package

This is the routine checklist for adding a package to the monorepo once the above is in place.

1. **Scaffold** — create `packages/my-package/` with:
   - `package.json` (see step 7 template)
   - `tsconfig.json` extending root base
   - `tsdown.config.ts`
   - `vitest.config.ts`
   - `src/index.ts`

2. **Register in root `tsconfig.json`** — add `{ "path": "./packages/my-package" }` to `references`.

3. **Install dependencies** — run `pnpm install` from the root. Cross-package deps use `workspace:*`.

4. **Verify** — run `pnpm build && pnpm test && pnpm -r check:publint && pnpm -r check:attw`.

5. **Publish config** — set `"private": false` (or `"publishConfig"` for GitHub Packages) if the package should be published.

> The goal is that steps 1–3 are the only manual steps. Everything else (linting, testing, publishing) is handled automatically by the tooling configured above.

---

## Summary of tool choices

| Concern | Tool | Key reason |
|---|---|---|
| Package manager | pnpm | Best-in-class workspace support, strict by default |
| Language | TypeScript | Required for type-safe packages |
| Lint + format | Biome | Single tool, 10–100× faster than ESLint + Prettier |
| Git hooks | Husky | Widely supported, integrates with lint-staged |
| Commit convention | commitlint | Input contract for semantic-release |
| Build | tsdown | Modern Rolldown-based bundler, zero config |
| Tests | Vitest | TypeScript-native, fast, workspace-aware |
| Compat checks | publint + attw | Complementary — catch runtime vs type dist errors |
| API docs | TypeDoc | TypeScript-first, markdown output for VitePress |
| Docs site | VitePress | Vite-native, fast, integrates with TypeDoc output |
| Releases | semantic-release | Fully automated versioning from commit history |
| CI | GitHub Actions | Native GitHub integration |
