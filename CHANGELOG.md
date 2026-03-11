# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-03-11

### Added

- added initial project scaffolding with Vite, React, TypeScript, and TailwindCSS
- added 5-layer Clean Architecture structure (Domain, Service, Infrastructure, Presentation, Main)
- added GitHub GraphQL API integration for bulk-fetching repository CI status, releases, and tags
- added runtime PAT authentication with localStorage persistence
- added dashboard with filterable, sortable repository grid
- added auto-refresh with configurable polling interval
- added CI pipeline with GitHub Actions and GitHub Pages deployment
- added MIT `LICENSE` file
- added `CODE_OF_CONDUCT.md` (Contributor Covenant v2.0)
- added PR template directory with default and bump templates
- added branch protection rules, repository ruleset, and copilot environment on GitHub

### Changed

- changed `README.md` to be illustrative with feature table, architecture tree, security section, and development guide
- changed CI pipeline reference from feature branch back to `@main` after upstream pipeline fix was merged

### Fixed

- fixed `hasWorkflows` incorrectly returning `true` for repos without a default branch ref
- fixed `refetch` type mismatch in `useRepositories` hook (was `void`, now `Promise<void>`)
- fixed Clean Architecture layer violation where service mapper imported from infrastructure
- fixed missing `aria-label` on search input in filter bar for screen reader accessibility
- fixed unnecessary `useMemo` wrapping a constant `null` in the app root component
- fixed CI pipeline failure caused by missing `@testing-library/dom` peer dependency and `@vitest/coverage-v8` for coverage
- fixed CI pipeline to use Yarn Berry (v4.12.0) via corepack after upstream pipeline fix, replacing the Yarn 1 workaround

