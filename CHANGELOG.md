# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- added Compliance column to repository table with color-coded status (green/yellow/red) based on pipeline existence, build policies, and branch protection
- added `ComplianceRepository` contract with GitHub GraphQL and Azure DevOps REST implementations
- added `ComplianceBadge` component with hover tooltip showing individual compliance check results
- added Settings page with per-integration token management for VCS, Sonar, and WakaTime
- added individual disconnect for optional integrations (Sonar, WakaTime) without full logout
- added Web Crypto AES-GCM encryption layer for token storage in `localStorage`
- added `IntegrationCard` reusable component for displaying integration connection status
- added contributors metrics dashboard with SonarCloud integration and proportional metric distribution
- added optional SonarCloud token prompt on the login page with skip support
- added Azure DevOps support via Adapter Design Pattern (repositories, CI status, tags, contributors)
- added platform selector on the login page (GitHub or Azure DevOps)
- added ADO REST API client and repository/contributor implementations with batched parallel fetching
- added service-layer tests for `GitHubContributorService` covering aggregation, distribution, and error scenarios
- added mapper tests for ADO repository and contributor mappers
- added comprehensive test suite (23 new test files, 3 test doubles) covering infrastructure repositories, HTTP clients, hooks, components, pages, and factories
- added V8 coverage thresholds in `vite.config.ts` enforcing 80%+ statements/functions/lines and 75%+ branches
- added JUnit test reporter and coverage PR comment via shared pipeline integration
- added optional SonarQube job to shared GitHub Actions JavaScript pipeline

### Changed

- changed coverage thresholds from 80/80/75/80 to 90/90/77/90 (lines/functions/branches/statements) in `vite.config.ts`

- changed DI wiring to create repositories and services dynamically based on selected platform
- changed approved PR counting to use only APPROVED review state instead of merged state fallback
- changed sortable table headers to use `<button>` with `aria-sort` for keyboard and screen-reader accessibility

### Fixed

- fixed `lastFetchedAt` and `isLoading` state in App to properly reflect navigation refresh status
- fixed `onRefetchRef` side effect during render phase by moving it to `useEffect`
- fixed `LoadingSkeleton` column count mismatch (13 vs 12 table headers)
- fixed `SonarCloudRepositoryImpl` and `NoOpSonarCloudRepository` method signatures to match interface contract
- fixed TypeScript circular type inference in contributor repository GraphQL pagination loop

## [0.1.0] - 2026-03-12

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

