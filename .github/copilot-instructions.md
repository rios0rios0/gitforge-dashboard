# gitforge-dashboard

gitforge-dashboard is a client-side-only TypeScript + React dashboard deployed on GitHub Pages. It displays CI workflow status, releases, and tags across all of a GitHub user's repositories. It uses the GitHub GraphQL API for efficient bulk data fetching and runs entirely in the browser — no backend server required.

Always reference these instructions first and fall back to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Test

- Install dependencies: `npm install`
- Run dev server: `npm run dev`
- Build for production: `npm run build`
- Run tests: `make test` -- NEVER run `vitest` directly.
- Run linting: `make lint` -- NEVER run `eslint` directly.
- Run security analysis: `make sast` -- NEVER run `gitleaks`, `semgrep`, `trivy`, `hadolint`, or `codeql` directly.

### Linting, Testing, and SAST with Makefile

This project uses the [rios0rios0/pipelines](https://github.com/rios0rios0/pipelines) repository for shared CI/CD scripts. The `Makefile` imports these scripts via `SCRIPTS_DIR`. Always use `make` targets:

```bash
make lint    # ESLint via pipeline scripts
make test    # Vitest via pipeline scripts
make sast    # CodeQL, Semgrep, Trivy, Hadolint, Gitleaks
```

## Architecture

The project follows **5-Layer Frontend Clean Architecture** with dependencies always pointing inward toward the Domain layer.

### Repository Structure

```
gitforge-dashboard/
├── src/
│   ├── domain/                    # Layer 1: Entities and Contracts (ports)
│   │   ├── entities/
│   │   │   ├── dashboard_filter.ts    # Filter/sort criteria + pure filter/sort functions
│   │   │   ├── release.ts             # Release entity interface
│   │   │   ├── repository.ts          # Core aggregate: repo + CI + release + tag
│   │   │   ├── tag.ts                 # Tag entity interface
│   │   │   └── workflow_status.ts     # CIState type + WorkflowStatus interface
│   │   ├── repositories/
│   │   │   └── repository_repository.ts   # Contract: listAll(token, username) -> Repository[]
│   │   └── services/
│   │       ├── authentication_service.ts  # Contract: get/set/clear token and username
│   │       └── dashboard_service.ts       # Contract: listRepositories(token, username) -> Repository[]
│   ├── service/                   # Layer 2: Business Logic
│   │   ├── github_dashboard_service.ts    # Implements DashboardService, delegates to RepositoryRepository
│   │   └── mappers/
│   │       └── graphql_repository_mapper.ts   # Maps GraphQL API response nodes to domain Repository entities
│   ├── infrastructure/            # Layer 3: External Integrations
│   │   ├── http/
│   │   │   └── graphql_client.ts          # Generic GitHub GraphQL API client (fetch-based, auth header)
│   │   ├── repositories/
│   │   │   └── github_graphql_repository_repository.ts   # GraphQL implementation of RepositoryRepository
│   │   └── services/
│   │       └── local_storage_authentication_service.ts    # localStorage implementation of AuthenticationService
│   ├── presentation/              # Layer 4: React Components and Hooks
│   │   ├── components/
│   │   │   ├── auth_gate.tsx              # Login form with PAT input + security notice
│   │   │   ├── dashboard_header.tsx       # Title, user info, refresh controls, logout
│   │   │   ├── filter_bar.tsx             # Search, CI/release/language filters, sort controls
│   │   │   ├── release_info.tsx           # Release tag name + relative date display
│   │   │   ├── repository_card.tsx        # Single repo card: CI badge + release + tag + language
│   │   │   ├── repository_grid.tsx        # Responsive grid of repository cards + loading skeleton
│   │   │   ├── status_badge.tsx           # CI state color-coded badge (green/red/yellow/gray)
│   │   │   └── tag_info.tsx               # Tag display (shown when no release exists)
│   │   ├── hooks/
│   │   │   ├── use_authentication.ts      # Auth state: token, username, login, logout
│   │   │   ├── use_auto_refresh.ts        # Configurable polling interval (1/5/15 min or off)
│   │   │   ├── use_filters.ts             # Filter/sort state + computed filtered/sorted repositories
│   │   │   └── use_repositories.ts        # Data fetching: repositories, loading, error, refetch
│   │   └── pages/
│   │       ├── dashboard_page.tsx         # Main dashboard: header + filters + repository grid
│   │       └── login_page.tsx             # Auth gate wrapper
│   └── main/                      # Layer 5: DI Wiring and App Entry
│       ├── app.tsx                        # Root component: auth check, route to login or dashboard
│       ├── main.tsx                       # React DOM entry point
│       └── factories/
│           ├── repository_factory.ts      # Creates RepositoryRepository instances
│           └── service_factory.ts         # Creates AuthenticationService and DashboardService instances
├── test/
│   ├── builders/
│   │   └── repository_builder.ts          # Builder pattern for constructing Repository test data
│   ├── doubles/
│   │   └── stub_repository_repository.ts  # Stub implementation of RepositoryRepository
│   ├── domain/entities/
│   │   └── dashboard_filter.test.ts       # Filter/sort logic tests (15 tests)
│   ├── service/
│   │   ├── github_dashboard_service.test.ts           # Service delegation tests (2 tests)
│   │   └── mappers/
│   │       └── graphql_repository_mapper.test.ts      # Mapper correctness tests (6 tests)
│   ├── infrastructure/services/
│   │   └── local_storage_authentication_service.test.ts   # localStorage auth tests (4 tests)
│   └── presentation/components/
│       ├── repository_card.test.tsx        # Card rendering tests (7 tests)
│       └── status_badge.test.tsx           # Badge state tests (5 tests)
├── .github/workflows/default.yaml     # CI (rios0rios0/pipelines) + GitHub Pages deploy
├── Makefile                           # Imports pipeline scripts (lint, test, sast)
├── index.html                         # Vite entry point
├── vite.config.ts                     # Vite + TailwindCSS + Vitest config
├── tsconfig.json                      # TypeScript project references
├── tsconfig.app.json                  # App TypeScript config (strict mode)
└── tsconfig.node.json                 # Node TypeScript config (vite.config.ts)
```

### Layer Responsibilities

| Layer              | Directory              | Responsibility                                                                    |
|--------------------|------------------------|-----------------------------------------------------------------------------------|
| **Domain**         | `src/domain/`          | Entity interfaces, service/repository contracts, pure filter/sort functions       |
| **Service**        | `src/service/`         | Business logic orchestration, GraphQL-to-entity mapping                           |
| **Infrastructure** | `src/infrastructure/`  | GitHub GraphQL API client, localStorage auth, HTTP transport                      |
| **Presentation**   | `src/presentation/`    | React components, hooks, pages — no direct API calls                              |
| **Main**           | `src/main/`            | DI wiring via factories, React DOM entry, app root component                      |

### Key Design Decisions

- **GraphQL over REST**: A single GraphQL query fetches CI status + latest release + latest tag for up to 100 repos. REST would require 150+ individual requests for the same data.
- **Client-side only**: No backend server. The PAT is entered at runtime and stored in `localStorage`. The app calls GitHub's API directly from the browser (CORS is supported by `api.github.com`).
- **No external state management**: State is managed locally in React hooks (`useState`, `useEffect`). No Redux, Zustand, or similar libraries.
- **snake_case file names**: All source files use `snake_case` per the JavaScript/TypeScript conventions.

### GitHub GraphQL API

The core query fetches repository data with CI status via `statusCheckRollup`, latest release via `latestRelease`, and latest tag via `refs(refPrefix: "refs/tags/")`. Pagination is handled via cursor-based `pageInfo`.

## Testing

### Standards

- All tests follow **BDD** structure with `// given`, `// when`, `// then` comment blocks.
- Test descriptions use `"should ... when ..."` format.
- Tests use **Stubs** and **In-memory doubles** over Mocks.
- Test data is constructed via **Builders** (`test/builders/repository_builder.ts`).

### Test Files

| File                                                          | Tests                                                    |
|---------------------------------------------------------------|----------------------------------------------------------|
| `test/domain/entities/dashboard_filter.test.ts`               | Filter by search, CI status, release, language, archived, forks; sort by name, updatedAt, ciStatus |
| `test/service/github_dashboard_service.test.ts`               | Service delegation, error propagation                    |
| `test/service/mappers/graphql_repository_mapper.test.ts`      | Full mapping, null defaultBranchRef, null release, null tags, null language |
| `test/infrastructure/services/local_storage_authentication_service.test.ts` | Token storage, retrieval, clearing |
| `test/presentation/components/status_badge.test.tsx`          | Badge rendering for each CI state                        |
| `test/presentation/components/repository_card.test.tsx`       | Card rendering for various repository states             |

### Running Tests

```bash
make test             # Full test suite via pipeline scripts (ALWAYS use this)
npm run test          # Quick test check during development (acceptable)
npm run test:watch    # Watch mode for TDD
```

## Validation

### After Making Changes

1. `npm run build` -- must compile and build with zero errors
2. `make lint` -- must report 0 issues
3. `make test` -- all tests must pass
4. `make sast` -- should report no new findings

### Pre-commit

- Always run `make lint` before committing (CI will fail otherwise).
- Always run `make test` to ensure no regressions.
- Always run `make sast` to catch security issues.

## Build and Test Timing Expectations

- **Type check** (`tsc -b`): <3 seconds.
- **Tests** (`vitest run`): <2 seconds.
- **Build** (`tsc -b && vite build`): <3 seconds.
- **Lint**: ~2-3 seconds.
- **SAST**: ~1-3 minutes.

## Common Development Commands

```bash
# Full validation cycle
npm run build && make lint && make test

# Quick test cycle during development
npm run test

# Full security + quality gate
make lint && make test && make sast

# Dev server with hot reload
npm run dev
```
