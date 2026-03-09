# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- added initial project scaffolding with Vite, React, TypeScript, and TailwindCSS
- added 5-layer Clean Architecture structure (Domain, Service, Infrastructure, Presentation, Main)
- added GitHub GraphQL API integration for bulk-fetching repository CI status, releases, and tags
- added runtime PAT authentication with localStorage persistence
- added dashboard with filterable, sortable repository grid
- added auto-refresh with configurable polling interval
- added CI pipeline with GitHub Actions and GitHub Pages deployment
