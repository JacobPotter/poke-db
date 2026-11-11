# AI Agent & Developer Guide: PokeDB

This guide provides technical specifications, architecture overviews, build instructions, testing strategies, and development conventions for AI coding assistants (GitHub Copilot, Claude Code, Junie, Cursor, etc.) and human developers working in the **PokeDB** repository.

---

## 1. Repository Layout & Tech Stack

PokeDB is organized as two independent applications. Kubernetes deployment manifests and ArgoCD configurations are
maintained in the dedicated [`cluster-gitops`](https://github.com/JacobPotter/cluster-gitops) repository. There is no
root-level build tool; commands are run from `api/`, `frontend/`, or the repository root.

- **Backend (`/api`)**:
  - **Runtime & Language**: Go 1.23+ (`go.mod` specifies Go 1.23, module `github.com/JacobPotter/poke-db/api`).
  - **Frameworks & Libraries**: Gin Web Framework (`github.com/gin-gonic/gin`), GORM (`gorm.io/gorm`, `gorm.io/driver/postgres`), Swaggo (`github.com/swaggo/gin-swagger`), Testify (`github.com/stretchr/testify`).
  - **Database**: PostgreSQL 15+ with GORM auto-migrations and seed dump support.
  - **External Ingestion**: PokeAPI ingestion in `api/refresh`, run by the standalone `api/cmd/refresh-db` binary as a
    Kubernetes CronJob (`apps/poke-db/base/refresh-db-cronjob.yaml` in `cluster-gitops`) and an Argo CD PostSync seed
    hook (`-if-empty`).
- **Frontend (`/frontend`)**:
  - **Runtime & Build**: Node.js 18+ (tested with Node 23 & npm 10), Vite 5, TypeScript 5.5, Tailwind CSS 3.4.
  - **State & Data Fetching**: `@tanstack/react-query` v5, `axios-hooks`.
  - **UI & Testing Tools**: React 18, Storybook 8, Vitest 2.1 (Playwright Chromium browser mode), `@testing-library/react`, Mock Service Worker (MSW).
- **Deployment & Infra**:
  - Maintained in the separate [JacobPotter/cluster-gitops](https://github.com/JacobPotter/cluster-gitops) repository
    (Kustomize base & overlays, ArgoCD Application configurations, and promotion workflows).

---

## 2. Quick Commands Reference

### Backend (run from `api/`)

```bash
go build -v ./...                       # Compile all backend packages
go run main.go                          # Start API server on :8080 (base path /api/v1)
go run ./cmd/refresh-db                 # Ingest data from PokeAPI (set REFRESH_TEST_MODE=true for small sample)
swag init                               # Regenerate Swagger API docs (in docs/)
```

### Backend Testing

Tests connect to a real PostgreSQL 15+ database (nothing is mocked). `scripts/test-db.sh` manages a local test container on port 5433:

```bash
# Run tests using the test-db script from repo root
scripts/test-db.sh test                # Run all backend tests
scripts/test-db.sh test ./controllers  # Run controller tests only

# Or export DB environment variables to run go test directly
eval "$(scripts/test-db.sh env)"
cd api
go test -v ./...                                                    # Run all backend tests
go test -v ./controllers                                            # Run handler test suites
go test -v ./controllers -run TestPokemonSuite/TestPokemonHandler_ListPokemon_Basic # Specific test method
go test -v ./refresh -run TestRefreshDBSuite                        # PokeAPI refresh test (sample subset)
```

### Frontend (run from `frontend/`)

```bash
npm run dev            # Start Vite dev server on :5173 (proxies /api to localhost:8080)
npm run build          # Typecheck & build production bundle (tsc -b && vite build)
npm run lint           # Run ESLint
npm run storybook      # Start Storybook component explorer on :6006
npx vitest run         # Run unit and component tests once in headless Chromium
npx vitest run src/components/ui/tests/DarkModeButton.test.tsx     # Run single test file
npx vitest run -t "DarkModeButton"                                  # Run tests matching regex
```

> **Note on Vitest**: Vitest runs tests in real Chromium using Playwright browser mode. Ensure Playwright browsers are installed (`npx playwright install`) before running tests.

### Database Seeding

```bash
# Offline seed from repo root (fast & recommended)
psql -h localhost -U postgres -d pokedb -f api/seed/mock-dump.sql
```

---

## 3. Backend Architecture & Conventions

### Startup & Router Configuration
- `api/main.go` loads environment variables from `.env`, initializes database connection via `models.ConnectDatabase()`, builds the router with `routes.SetupRouter(models.DB)`, and registers Swagger (`/swagger/*any`) and CORS middleware.
- `routes/setup.go` establishes the `/api/v1` route group and delegates to feature-specific route packages (`routes/pokemonroutes`, `routes/typeroutes`, `routes/evolutionroutes`).
- **Constructor Injection**: Controllers in `controllers/` receive their `*gorm.DB` instance via constructor functions (e.g. `NewPokemonHandler(db)`), avoiding reliance on global state.

### Split Migration Architecture
Database migrations are split into two stages:
1. **Core Models (`models.ConnectDatabase()`)**: Executed on API server startup and integration test initialization. Runs `AutoMigrate` for `PokemonSpecies`, `Pokemon`, `MoveType`, `Item`, `Move`, `Location`, `Region`, and `EvolutionTrigger`.
2. **Evolution Graph Models (`models.MigrateAll()`)**: Creates `EvolutionChain`, `EvolutionChainLink`, and `EvolutionDetails`. `EvolutionDetails` requires a `NULLS NOT DISTINCT` unique index (PostgreSQL 15+). This migration is executed only during data ingestion by `refresh-db`, `refresh-db_test.go`, and the ArgoCD PostSync hook.

### Ingestion Subsystem (`api/refresh`)
`RefreshDB.Run()` ingests entities in strict dependency order:
1. Move types (`refreshTypes` — hard dependency; failure aborts the run)
2. Items (`refreshItems`)
3. Locations & regions (`refreshLocations`)
4. Pokémon & species (`refreshPokemon`)
5. Moves & type damage relations (`refreshMoves`)
6. Evolution triggers (`refreshEvolutionTriggers`)
7. Evolution chains & details (`refreshEvolutionChains`)

### Go Coding Standards (Go 1.23)
- Use `any` instead of `interface{}`.
- Use `errors.Is(err, target)` instead of `err == target`.
- Prefer stdlib slice/map packages: `slices.Contains`, `slices.IndexFunc`, `slices.Max`, `slices.Min`, `maps.Clone`, `maps.Keys`.
- Use integer range loops: `for i := range n`.
- Handle context cancellation with `context.WithCancelCause` and `context.WithTimeoutCause`.
- Document endpoints with Swaggo annotations on handlers and run `swag init` when modifying routes or response types.

---

## 4. Frontend Architecture & Conventions

### Data Flow & Server State
- Server state is managed exclusively via **TanStack Query v5**.
- `src/query/api/` contains raw Axios request functions.
- `src/query/hooks/` provides custom React hooks wrapping queries.
- `src/query/keyFactories.ts` centralizes query key definitions.
- Default caching in `src/query/queryClient.ts` uses `staleTime: 10 * 60 * 1000` (10 minutes) and `refetchOnWindowFocus: false`.
- `src/loaders/` contains route prefetching loaders.

### Global UI State & Components
- Global UI state lives in React Contexts under `src/context/` (`DarkModeContext`, `MoveTypeContext`), never in Redux.
- Component structure under `src/components/`:
  - `layout/` — Shell, navigation, footer.
  - `pages/` — Top-level views (`PokemonPage`, `TypesPage`, `EvolutionsPage`).
  - `pokemon/` — Domain components for Pokémon listing, details, and evolution summaries.
  - `moveTypes/` — Type charts and effectiveness summaries.
  - `ui/` — Base UI primitives, Pokédex frame, buttons, skeletons.
- Storybook stories are co-located in `stories/` folders adjacent to components.

### Frontend Coding Standards
- Strict TypeScript: do not use `any`; use shared models from `src/models/`.
- Styling: Use Tailwind CSS utility classes; avoid inline styles.

---

## 5. Request Flow Across Environments

- **Local Development**: Browser → Vite Dev Server (`:5173`) → Proxy `/api` → Go API Server (`:8080`).
- **Production (Kubernetes)**: Browser → Nginx (serves static SPA bundle) → `location /api/` proxies to `http://api:8080/`. The trailing slash on `proxy_pass` preserves route resolution under `/api/v1`.

---

## 6. Testing Patterns & Examples

### Backend Test Pattern (Testify Suite)
Backend handler tests run against a real PostgreSQL database instance:

```go
package controllers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/JacobPotter/poke-db/api/models"
	"github.com/JacobPotter/poke-db/api/routes"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/suite"
)

type PokemonTestSuite struct {
	suite.Suite
	router *gin.Engine
}

func (s *PokemonTestSuite) SetupTest() {
	models.ConnectDatabase()
	s.router = routes.SetupRouter(models.DB)
}

func TestPokemonSuite(t *testing.T) {
	suite.Run(t, new(PokemonTestSuite))
}

func (s *PokemonTestSuite) TestGetPokemonList() {
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/v1/pokemon?page=1&pageSize=5", nil)

	s.router.ServeHTTP(w, req)

	s.Equal(http.StatusOK, w.Code)
	var response models.ListPokemonResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	s.Require().NoError(err)
	s.NotEmpty(response.Pokemon)
}
```

### Frontend Test Pattern (Vitest + Testing Library + MSW)
Component tests run in Chromium with MSW intercepting API calls (`src/test/mocks/handlers.ts`):

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import DarkModeButton from '../DarkModeButton';
import { DarkModeProvider } from '../../../../context/DarkModeContext';

describe('DarkModeButton', () => {
  it('renders theme toggle button', () => {
    render(
      <DarkModeProvider>
        <DarkModeButton />
      </DarkModeProvider>
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
```

---

## 7. Related Documentation

- [Project Overview & Quickstart](README.md)
- [System Architecture](ARCHITECTURE.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Backend Development Guide](api/README.md)
- [Frontend Development Guide](frontend/README.md)
- [Kubernetes & GitOps Repository](https://github.com/JacobPotter/cluster-gitops)
