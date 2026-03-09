<h1 align="center">gitforge-dashboard</h1>
<p align="center">
    <a href="https://github.com/rios0rios0/gitforge-dashboard/releases/latest">
        <img src="https://img.shields.io/github/release/rios0rios0/gitforge-dashboard.svg?style=for-the-badge&logo=github" alt="Latest Release"/></a>
    <a href="https://github.com/rios0rios0/gitforge-dashboard/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/rios0rios0/gitforge-dashboard.svg?style=for-the-badge&logo=github" alt="License"/></a>
    <a href="https://github.com/rios0rios0/gitforge-dashboard/actions/workflows/default.yaml">
        <img src="https://img.shields.io/github/actions/workflow/status/rios0rios0/gitforge-dashboard/default.yaml?branch=main&style=for-the-badge&logo=github" alt="Build Status"/></a>
</p>

A client-side dashboard deployed on GitHub Pages that displays CI workflow status, releases, and tags across all of a GitHub user's repositories.

## Features

- **CI Status**: green/red/yellow/gray badges showing the aggregated CI status of each repository's default branch
- **Releases & Tags**: latest release version with relative date, or latest tag when no release exists
- **Filtering**: search by name, filter by CI status (passing/failing/no CI), release presence, language, archived/fork toggles
- **Sorting**: by name, last updated, CI status, or release date
- **Auto-refresh**: configurable polling interval (1 min, 5 min, 15 min, or off)
- **Responsive**: adapts from 1 column on mobile to 3 columns on desktop

## Usage

1. Visit [rios0rios0.github.io/gitforge-dashboard/](https://rios0rios0.github.io/gitforge-dashboard/)
2. Enter your GitHub username and a [fine-grained Personal Access Token](https://github.com/settings/tokens?type=beta) with **Metadata (read-only)** permission
3. Your token is stored locally in the browser and never sent anywhere except GitHub's API

## Architecture

```
src/
├── domain/           # entities, contracts (ports)
├── service/          # business logic, mappers
├── infrastructure/   # GitHub API clients, localStorage
├── presentation/     # React components, hooks, pages
└── main/             # DI wiring, factories, app entry
```

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

See [LICENSE](LICENSE) file for details.
