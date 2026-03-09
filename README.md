<h1 align="center">gitforge-dashboard</h1>
<p align="center">
    <a href="https://github.com/rios0rios0/gitforge-dashboard/releases/latest">
        <img src="https://img.shields.io/github/release/rios0rios0/gitforge-dashboard.svg?style=for-the-badge&logo=github" alt="Latest Release"/></a>
    <a href="https://github.com/rios0rios0/gitforge-dashboard/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/rios0rios0/gitforge-dashboard.svg?style=for-the-badge&logo=github" alt="License"/></a>
    <a href="https://github.com/rios0rios0/gitforge-dashboard/actions/workflows/default.yaml">
        <img src="https://img.shields.io/github/actions/workflow/status/rios0rios0/gitforge-dashboard/default.yaml?branch=main&style=for-the-badge&logo=github" alt="Build Status"/></a>
</p>

A client-side React + TypeScript dashboard deployed on GitHub Pages that displays CI workflow status, releases, and tags across all of a GitHub user's repositories. No backend server — runs entirely in the browser.

<!-- TODO: add screenshot at .docs/dashboard.png -->
<!-- <p align="center"><img src=".docs/dashboard.png" alt="Dashboard screenshot" width="900"/></p> -->

## Quick Start

1. Visit **[rios0rios0.github.io/gitforge-dashboard](https://rios0rios0.github.io/gitforge-dashboard/)**
2. Enter your GitHub **username** and a [fine-grained Personal Access Token](https://github.com/settings/tokens?type=beta) with the **Metadata (read-only)** permission
3. The dashboard loads all your repositories and displays their CI, release, and tag status

> Your token is stored **only** in your browser's `localStorage` and is sent exclusively to `api.github.com`. It is never transmitted to any other server.

## Features

| Feature | Description |
|---------|-------------|
| **CI Status** | Green / red / yellow / gray badges showing the aggregated status of each repository's default branch |
| **Releases & Tags** | Latest release with relative date and pre-release indicator, or latest tag when no release exists |
| **Search & Filter** | Filter by name, CI status (passing / failing / no CI), release presence, language, archived and fork toggles |
| **Sorting** | Sort by name, last updated, CI status, or release date — ascending or descending |
| **Auto-refresh** | Configurable polling interval: 1 min, 5 min, 15 min, or off |
| **Responsive** | Adapts from 1 column on mobile to 3 columns on desktop |

## How It Works

The dashboard uses a single **GitHub GraphQL API** query to bulk-fetch up to 100 repositories per request, including:

- Default branch CI status (`statusCheckRollup`)
- Latest release metadata
- Most recent tag

Pagination handles users with more than 100 repositories. All data processing (filtering, sorting, mapping) happens client-side with zero server dependencies.

## Security & Privacy

- **No backend** — the app is a static site served from GitHub Pages
- **Token storage** — your PAT is stored in `localStorage` and never leaves your browser except for GitHub API calls
- **Minimal permissions** — only the **Metadata (read-only)** scope is required
- **Open source** — audit the code yourself

## Architecture

5-layer [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) where dependencies always point inward toward the Domain layer.

```
src/
├── domain/           # Entities, contracts (ports), pure filter/sort functions
│   ├── entities/     #   Repository, Release, Tag, WorkflowStatus, DashboardFilter
│   ├── repositories/ #   RepositoryRepository contract
│   └── services/     #   DashboardService, AuthenticationService contracts
├── service/          # Business logic, GraphQL-to-entity mappers
│   └── mappers/      #   GraphQLRepositoryNode → Repository mapping
├── infrastructure/   # GitHub GraphQL API client, localStorage auth
│   ├── http/         #   Fetch-based GraphQL client with error handling
│   ├── repositories/ #   GitHubGraphQLRepositoryRepository
│   └── services/     #   LocalStorageAuthenticationService
├── presentation/     # React components, hooks, pages
│   ├── components/   #   FilterBar, RepositoryCard, StatusBadge, etc.
│   ├── hooks/        #   useRepositories, useFilters, useAutoRefresh, useAuthentication
│   └── pages/        #   DashboardPage, LoginPage
└── main/             # DI wiring via factories, app entry point
    └── factories/    #   ServiceFactory, RepositoryFactory
```

## Development

```bash
corepack enable        # Enable Yarn Berry via corepack (first time only)
yarn install           # Install dependencies
yarn dev               # Start dev server with hot reload
yarn build             # Type-check and build for production
yarn test              # Run tests
yarn test:watch        # Watch mode for TDD
```

Quality gates (always use `make` targets — never run tools directly):

```bash
make lint              # Run ESLint via pipeline scripts
make test              # Run Vitest with coverage via pipeline scripts
make sast              # Run full SAST suite (CodeQL, Semgrep, Trivy, Hadolint, Gitleaks)
```

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
