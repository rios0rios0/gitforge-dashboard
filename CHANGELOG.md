# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.1] - 2026-04-27

### Changed

- refreshed `.github/copilot-instructions.md` to fix `npm` → `yarn` commands, replace outdated file tree with high-level architecture, and update platform/integration descriptions
- refreshed `CLAUDE.md` to document Azure DevOps support, encrypted auth, and new key files

## [0.2.0] - 2026-03-22

### Added

- added `ComplianceBadge` component with hover tooltip showing individual compliance check results
- added `ComplianceRepository` contract with GitHub GraphQL and Azure DevOps REST implementations
- added `IntegrationCard` reusable component for displaying integration connection status
- added ADO REST API client and repository/contributor implementations with batched parallel fetching
- added Azure DevOps support via Adapter Design Pattern (repositories, CI status, tags, contributors)
- added Badges column to repository table that checks each repo's `README.md` for required shields.io badges (Release, License, Build Status, SonarCloud Coverage, SonarCloud Quality Gate, OpenSSF Best Practices) with green/yellow status and click-to-popup details
- added Compliance column to repository table with color-coded status (green/yellow/red) based on pipeline existence, build policies, and branch protection
- added comprehensive test suite (23 new test files, 3 test doubles) covering infrastructure repositories, HTTP clients, hooks, components, pages, and factories
- added contributors metrics dashboard with SonarCloud integration and proportional metric distribution
- added individual disconnect for optional integrations (Sonar, WakaTime) without full logout
- added JUnit test reporter and coverage PR comment via shared pipeline integration
- added mapper tests for ADO repository and contributor mappers
- added optional SonarCloud token prompt on the login page with skip support
- added optional SonarQube job to shared GitHub Actions JavaScript pipeline
- added platform selector on the login page (GitHub or Azure DevOps)
- added service-layer tests for `GitHubContributorService` covering aggregation, distribution, and error scenarios
- added Settings page with per-integration token management for VCS, Sonar, and WakaTime
- added V8 coverage thresholds in `vite.config.ts` enforcing 80%+ statements/functions/lines and 75%+ branches
- added Web Crypto AES-GCM encryption layer for token storage in `localStorage`

### Changed

- changed approved PR counting to use only APPROVED review state instead of merged state fallback
- changed CI workflow to follow the standard `default.yaml` pattern with named workflow, permission comments, and `default` job name
- changed CI workflow to use the new `yarn.yaml` reusable workflow from `rios0rios0/pipelines` (replacing deprecated `javascript.yaml`)
- changed coverage thresholds from 80/80/75/80 to 90/90/77/90 (lines/functions/branches/statements) in `vite.config.ts`
- changed DI wiring to create repositories and services dynamically based on selected platform
- changed sortable table headers to use `<button>` with `aria-sort` for keyboard and screen-reader accessibility

### Fixed

- fixed `lastFetchedAt` and `isLoading` state in App to properly reflect navigation refresh status
- fixed `LoadingSkeleton` column count mismatch (13 vs 12 table headers)
- fixed `onRefetchRef` side effect during render phase by moving it to `useEffect`
- fixed `SonarCloudRepositoryImpl` and `NoOpSonarCloudRepository` method signatures to match interface contract
- fixed TypeScript circular type inference in contributor repository GraphQL pagination loop

## [0.1.0] - 2026-03-12

### Added

- added 5-layer Clean Architecture structure (Domain, Service, Infrastructure, Presentation, Main)
- added `CODE_OF_CONDUCT.md` (Contributor Covenant v2.0)
- added auto-refresh with configurable polling interval
- added branch protection rules, repository ruleset, and copilot environment on GitHub
- added CI pipeline with GitHub Actions and GitHub Pages deployment
- added dashboard with filterable, sortable repository grid
- added GitHub GraphQL API integration for bulk-fetching repository CI status, releases, and tags
- added initial project scaffolding with Vite, React, TypeScript, and TailwindCSS
- added MIT `LICENSE` file
- added PR template directory with default and bump templates
- added runtime PAT authentication with localStorage persistence

### Changed

- changed `README.md` to be illustrative with feature table, architecture tree, security section, and development guide
- changed CI pipeline reference from feature branch back to `@main` after upstream pipeline fix was merged

### Fixed

- fixed `hasWorkflows` incorrectly returning `true` for repos without a default branch ref
- fixed `refetch` type mismatch in `useRepositories` hook (was `void`, now `Promise<void>`)
- fixed CI pipeline failure caused by missing `@testing-library/dom` peer dependency and `@vitest/coverage-v8` for coverage
- fixed CI pipeline to use Yarn Berry (v4.12.0) via corepack after upstream pipeline fix, replacing the Yarn 1 workaround
- fixed Clean Architecture layer violation where service mapper imported from infrastructure
- fixed missing `aria-label` on search input in filter bar for screen reader accessibility
- fixed unnecessary `useMemo` wrapping a constant `null` in the app root component

