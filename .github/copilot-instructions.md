# GitHub Copilot Instructions: PokeDB

This repository contains **PokeDB**, a full-stack Pokémon database application consisting of a Go backend REST API, a React TypeScript frontend, and Kubernetes GitOps configurations.

For complete architectural patterns, database migration rules, testing strategies, and command references, always refer to [AGENTS.md](../AGENTS.md) and [ARCHITECTURE.md](../ARCHITECTURE.md).

---

## 1. Core Tech Stack & Structure

- **Backend (`/api`)**: Go 1.23+, Gin Web Framework, GORM ORM, PostgreSQL 15+, Swaggo.
- **Frontend (`/frontend`)**: React 18, TypeScript 5.5, Vite 5, Tailwind CSS 3.4, TanStack Query v5 (`@tanstack/react-query`), Storybook 8, Vitest (Playwright Chromium browser mode), MSW.
- **Infrastructure (`/k8s`)**: Kustomize base & overlays, ArgoCD GitOps applications.

---

## 2. Key Development Guidelines

### Go Backend (`/api`)
- **Go 1.23 Idioms**: Use `any` instead of `interface{}`, `errors.Is(err, target)` instead of `err == target`, stdlib `slices`/`maps` packages, integer range loops (`for i := range n`), and `context.WithCancelCause` / `WithTimeoutCause`.
- **Database Migrations (Split Migration)**:
  - `models.ConnectDatabase()` auto-migrates only `coreModels()` (Species, Pokemon, Types, Items, Moves, Locations, EvolutionTriggers).
  - Evolution tables (`EvolutionChain`, `EvolutionChainLink`, `EvolutionDetails`) are migrated exclusively via `models.MigrateAll()` during ingestion or test suites.
- **Dependency Injection**: Controllers in `controllers/` receive `*gorm.DB` via constructor injection (e.g., `NewPokemonHandler(db)`).
- **Swagger Documentation**: Document handler endpoints with Swaggo annotations; run `swag init` in `api/` to regenerate `docs/`.

### React Frontend (`/frontend`)
- **Server State**: Managed exclusively via **TanStack Query v5** (`src/query/hooks/`, `src/query/keyFactories.ts`). Caching defaults to 10-minute `staleTime` and no refetch on window focus (`src/query/queryClient.ts`).
- **Global UI State**: Managed via React Context in `src/context/` (`DarkModeContext`, `MoveTypeContext`), never Redux.
- **Typing & Styling**: Strict TypeScript (avoid `any`, use types from `src/models/`). Use Tailwind CSS utility classes; avoid inline styles.

---

## 3. Testing & Verification

- **Backend Tests**: Run against a real PostgreSQL 15+ database (no mocks).
  - Test runner script: `scripts/test-db.sh test` (from repo root).
  - Manual go test: `eval "$(scripts/test-db.sh env)" && cd api && go test -v ./...`
- **Frontend Tests**: Run with Vitest in Chromium browser mode via Playwright with MSW mocking.
  - Run once: `cd frontend && npx vitest run`
  - Single test file: `cd frontend && npx vitest run src/components/ui/tests/DarkModeButton.test.tsx`
- **Build Checks**:
  - Backend: `cd api && go build -v ./...`
  - Frontend: `cd frontend && npm run build` (runs `tsc -b && vite build`)
