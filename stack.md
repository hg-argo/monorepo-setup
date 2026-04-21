# Tool Stack

A reference guide to every tool used in this monorepo — what it is, where it's configured, and why it was chosen.

---

## Package Manager

**pnpm v9.15.0** — [`pnpm-workspace.yaml`](pnpm-workspace.yaml), [`.npmrc`](.npmrc)

Manages packages in the `packages/*` workspace. `engine-strict=true` in `.npmrc` hard-fails if the Node or pnpm version doesn't match the `engines` field. `public-hoist-pattern[]=@hg-argo/*` is required so root-level tools (TypeDoc) can resolve scoped workspace packages without "cannot find module" errors.

**Corepack** — [`package.json`](package.json) (`packageManager` field)

Activates the pinned pnpm version automatically on `pnpm install`, preventing contributors from accidentally using npm or yarn.

---

## Language

**TypeScript v6.0.3** — [`tsconfig.base.json`](tsconfig.base.json), [`tsconfig.json`](tsconfig.json), per-package `tsconfig.json`

All packages extend `tsconfig.base.json`. Key choices:

| Option | Reason |
|---|---|
| `module: NodeNext` + `moduleResolution: NodeNext` | Correct for modern Node.js ESM packages; requires explicit `.js` extensions on relative imports |
| `composite: true` | Enables TypeScript project references for incremental cross-package builds |
| `verbatimModuleSyntax: true` | Enforces `import type` for type-only imports; prevents phantom `require()` calls when types are stripped |
| `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` | Maximum strictness |
| `isolatedModules: true` | Each file is independently transpilable (required by tsdown) |
| `declarationMap`, `sourceMap` | Full debugging support |

---

## Build

**tsdown v0.21.9** — [`packages/*/tsdown.config.ts`](packages/demo-core-lib/tsdown.config.ts)

Zero-config TypeScript bundler built on Rolldown (Rust-based Rollup successor). Each package runs two passes — ESM (`.js` / `.d.ts`) and CJS (`.cjs` / `.d.cts`) — producing dual-format output in `dist/`. Dual CJS+ESM is necessary because the Node.js ecosystem is still in transition and many tools still require CJS.

**tsx v4.21.0**

TypeScript script runner used for the `demo-game-lib` runnable demo (`pnpm demo`).

---

## Linting & Formatting

**Biome v2.4.12** — [`biome.json`](biome.json) (extends `@side-xp/biome-config`)

Single tool replacing both ESLint and Prettier. Enforces 2-space indentation, 120-char line width, LF line endings, single quotes, no semicolons, and trailing commas. Import organization is handled by Biome's `assist` feature. Biome is 10–100× faster than the ESLint+Prettier combo and eliminates format/lint-on-save conflicts and plugin version mismatches.

---

## Git Hooks

**Husky v9.1.7** — [`.husky/`](.husky/)

Installs git hooks automatically via the `"prepare": "husky"` script (runs on `pnpm install`). Active hooks:

- **pre-commit** → runs lint-staged
- **commit-msg** → runs commitlint

**lint-staged v16.4.0** — [`.lintstagedrc.json`](.lintstagedrc.json)

Runs `biome check --write` only on staged `ts/tsx/js/jsx/json/jsonc` files. Keeps pre-commit fast by avoiding a full-repo scan.

**commitlint v20.5.0** — [`.commitlintrc.json`](.commitlintrc.json)

Enforces Conventional Commits (`type(scope): description`) on every commit message. Runs at `commit-msg` time rather than pre-push so bad messages are caught immediately, before they accumulate in history. The conventional commit format is the input contract for semantic-release's automatic versioning.

---

## Testing

**Vitest v4.1.4** — [`vitest.workspace.ts`](vitest.workspace.ts), per-package `vitest.config.ts`

Replaces Jest. First-class TypeScript support without a separate transform step, and faster due to parallel execution and esbuild-based transforms. Coverage uses the `v8` provider with `json-summary` reporter (required by the GitHub Actions coverage comment action).

---

## Package Compatibility Checks

**publint v0.3.18** — `pnpm -r check:publint`

Validates that `exports`, `main`, `module`, and `types` fields in `package.json` actually resolve to existing files and follow CJS/ESM conventions.

**Are the Types Wrong? v0.18.2** — `pnpm -r check:attw`

Verifies that TypeScript consumers using `bundler`, `node16`, and `nodenext` module resolution all receive correct types. Catches type-distribution errors that publint misses. Both tools run in CI together; publint covers runtime-distribution issues, attw covers type-distribution issues.

---

## API Documentation

**TypeDoc v0.28.19** — [`typedoc.json`](typedoc.json)

Generates documentation from TypeScript types. Uses `entryPointStrategy: "packages"` to discover each package's entry point automatically.

Plugins:
- `typedoc-plugin-markdown` — outputs `.md` files instead of standalone HTML so VitePress can consume them
- `typedoc-vitepress-theme` — generates `typedoc-sidebar.json` for automatic VitePress sidebar construction (no manual maintenance)

Output lands in `docs/api/` (gitignored, regenerated in CI).

---

## Documentation Site

**VitePress v1.6.4** — [`docs/.vitepress/config.ts`](docs/.vitepress/config.ts)

Static site generator for the documentation site deployed to GitHub Pages. `srcDir: '..'` serves markdown from the repo root so package docs can live next to their source code. URL rewrites map `docs/:path` and `packages/*/docs/:page` to clean URLs. The API sidebar is auto-generated from TypeDoc's `typedoc-sidebar.json`.

**Vite v8.0.9** — pinned at root in [`package.json`](package.json)

Pinned explicitly because VitePress depends on Vite 5 while Vitest 4 requires Vite 6+. Without a root-level pin, pnpm resolves Vitest's peer against Vite 5, which breaks Vitest at startup. Pinning Vite at root forces the correct version for Vitest; VitePress uses its own internal copy.

---

## Release Automation

**semantic-release v25.0.3** + **multi-semantic-release v3.1.0** — [`.releaserc.json`](.releaserc.json)

Fully automated versioning and publishing triggered on pushes to `main`. multi-semantic-release runs from the repo root and processes all packages in topological order (dependencies released before dependents), which the alternative `semantic-release-monorepo` does not guarantee.

Plugin pipeline per package:

1. `commit-analyzer` — determines version bump from conventional commits
2. `release-notes-generator` — generates release notes
3. `changelog` — writes/updates `CHANGELOG.md`
4. `npm` (`npmPublish: false`) — bumps `package.json` version
5. `exec` — runs `pnpm publish --no-git-checks --access public`
6. `git` — commits `CHANGELOG.md` and `package.json` (`[skip ci]`)
7. `github` — creates GitHub Releases

Tags use the format `${name}@${version}` (e.g. `@hg-argo/demo-core-lib@1.0.0`). Packages publish to GitHub Packages (`npm.pkg.github.com`).

---

## CI/CD

**GitHub Actions** — [`.github/workflows/`](.github/workflows/)

Three reusable workflows, orchestrated by [`ci.yml`](.github/workflows/ci.yml):

| Workflow | Triggers | Steps |
|---|---|---|
| [`_check.yml`](.github/workflows/_check.yml) | All pushes + PRs | install → lint → build → test (coverage) → publint → attw |
| [`_release.yml`](.github/workflows/_release.yml) | After check passes on `main` | multi-semantic-release |
| [`_docs.yml`](.github/workflows/_docs.yml) | After release on `main` | typedoc → vitepress build → deploy to GitHub Pages |

Coverage summaries are posted as PR comments via `davelosert/vitest-coverage-report-action@v2`.

---

## Packages

| Package | Version | Purpose | Depends on |
|---|---|---|---|
| [`@hg-argo/demo-core-lib`](packages/demo-core-lib/) | 1.0.0 | `Range` type and `random` utilities | — |
| [`@hg-argo/demo-game-lib`](packages/demo-game-lib/) | 1.0.1 | `GuessGame` state machine | `demo-core-lib` |

`demo-game-lib` exists primarily to demonstrate a cross-package dependency within the monorepo. It uses `demo-core-lib` for range math and random integer generation.

---

## Branching Strategy

Two-branch model:
- `main` — protected; releases trigger here
- `develop` — active development; merged to `main` via PR when ready to release

No `release/*` branches — semantic-release handles all versioning from commit history automatically.

---

## Intentional Omissions

| Tool | Replaced by / Reason |
|---|---|
| ESLint + Prettier | Biome |
| Jest | Vitest |
| Changesets | semantic-release + multi-semantic-release |
| Turborepo | Plain `pnpm -r` recursive commands (no task graph needed for this size) |
| webpack / rollup (direct) | tsdown (uses Rolldown internally) |
| `.nvmrc` / `.node-version` | `engines` field + `engine-strict=true` in `.npmrc` |
| Docker | Not needed — pure library packages with no runtime infra |
