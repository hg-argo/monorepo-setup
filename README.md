# Monorepo Setup

This project is a monorepo for building Node packages that can have cross-dependencies to each other.

The repository is used as a demo for setting everything up, and have a detailed workflow for building such project from scratch. [You can find this guide here](./guide.md).

## The objective

The objective is to have a top-tier setup, with proper tooling, automations and checks to make sure the packages can be built and deployed safely.

Here is a list of the expected features:

- Proper language and engine (TypeScript + pnpm)
- Enforce expected engine (force user to use pnpm and prevent/reject npm usage when possible)
- Local code linting and formatting (Biome)
- Local package linking (pnpm workspaces)
- Git hooks for pre-commit & pre-push checks (Husky)
- Enforce conventional commits notation (commitlint)
- Package build flow (tsdown)
- Compatibility checks (publint + attw)
- Ability to run tests per package, or run all of them, with optional code coverage (Vitest + V8)
- Automatic API documentation generation (TypeDoc)
- Deploy proper documentation pages and API docs to GitHub Pages (VitePress + CI workflow)
- Automatic CHANGELOG generation & package version bump (`semantic-release`)
- Proper GitHub workflows to build & deploy the packages, targetting GitHub Packages for the private ones, and NPM for the public ones
- Keep the addition of a new package in the monorepo as trivial as possible