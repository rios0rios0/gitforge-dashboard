# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A client-side-only TypeScript + React dashboard deployed on GitHub Pages. It displays CI workflow status, releases, tags, compliance checks, and contributor metrics across repositories from GitHub (GraphQL API) and Azure DevOps (REST API). Integrates with SonarCloud and WakaTime for additional metrics. No backend server — runs entirely in the browser.

## Commands

```bash
corepack enable        # Enable Yarn Berry via corepack (first time only)
yarn install           # Install dependencies
yarn dev               # Start dev server with hot reload
yarn build             # Type-check and build for production
make lint              # Run ESLint via pipeline scripts
make test              # Run Vitest via pipeline scripts
make sast              # Run full SAST suite (CodeQL, Semgrep, Trivy, Hadolint, Gitleaks)
```

**Never run `eslint`, `vitest`, or SAST tools directly.** Always use `make` targets which invoke the [rios0rios0/pipelines](https://github.com/rios0rios0/pipelines) scripts.

## Architecture

5-Layer Frontend Clean Architecture. Dependencies always point inward toward Domain.

```
src/domain/           → Entities, contracts (ports), pure filter/sort functions
src/service/          → Business logic, platform-specific mappers (GitHub GraphQL + ADO REST)
src/infrastructure/   → GitHub GraphQL & ADO REST clients, Web Crypto AES-GCM encrypted auth
src/presentation/     → React components, hooks, pages (dashboard, contributors, settings)
src/main/             → DI wiring via factories, platform-aware app entry point
```

### Key Files

| File | Purpose |
|------|---------|
| `src/domain/entities/dashboard_filter.ts` | Filter/sort logic (pure functions, no side effects) |
| `src/domain/entities/compliance_status.ts` | Compliance check entity and color computation logic |
| `src/domain/entities/platform.ts` | Platform abstraction (GitHub / Azure DevOps) |
| `src/infrastructure/repositories/github_compliance_repository.ts` | GitHub compliance checks via GraphQL (workflow file + branch protection) |
| `src/infrastructure/repositories/ado_compliance_repository.ts` | ADO compliance checks via REST (build definitions + policy configurations) |
| `src/infrastructure/repositories/github_graphql_repository_repository.ts` | Core GraphQL query that bulk-fetches repos + CI + releases + tags |
| `src/infrastructure/http/ado_rest_client.ts` | Azure DevOps REST API client |
| `src/infrastructure/services/encrypted_authentication_service.ts` | Web Crypto AES-GCM encrypted token storage |
| `src/service/mappers/graphql_repository_mapper.ts` | Maps raw GraphQL response to domain entities |
| `src/presentation/hooks/use_repositories.ts` | Central data fetching hook with loading/error states |
| `src/main/app.tsx` | Root component with auth check and DI wiring |

### Conventions

- **snake_case** for all file names
- **No `any`** — use `unknown` with type narrowing
- **BDD tests** with `// given`, `// when`, `// then` blocks
- **Stubs over Mocks** — test doubles in `test/doubles/`
- **Builders** for test data — `test/builders/repository_builder.ts`

## Testing

A comprehensive test suite covers domain logic, service layer, infrastructure, and presentation components. All tests use Vitest + Testing Library.

Coverage thresholds enforced at 90%+ lines/functions/statements and 77%+ branches. CI posts a coverage PR comment, test result annotations, and uploads the HTML coverage report as an artifact.

```bash
make test              # Full suite (ALWAYS use this)
yarn test              # Quick check during development
yarn test:watch        # Watch mode for TDD
```

## Deployment

Deployed to GitHub Pages via `.github/workflows/default.yaml`. CI runs `rios0rios0/pipelines/.github/workflows/yarn.yaml`, then builds and deploys to Pages on push to `main`.
