# Developer & Agent Guide: PokeDB

This guide provides technical specifications, build processes, testing strategies, and development conventions for the PokeDB project.

---

## 1. System Architecture & Tech Stack

- **Backend (`/api`)**:
  - **Runtime & Language**: Go 1.23+ (`go.mod` specifies Go 1.23).
  - **Frameworks & Libraries**: Gin Web Framework (`github.com/gin-gonic/gin`), GORM (`gorm.io/gorm`, `gorm.io/driver/postgres`), Jobrunner (`github.com/bamzi/jobrunner`), Swaggo (`github.com/swaggo/gin-swagger`), Testify (`github.com/stretchr/testify`).
  - **Database**: PostgreSQL with GORM auto-migrations and seed dump support.
  - **External Ingestion**: PokeAPI ingestion jobs scheduled via Jobrunner (`api/jobs`).
- **Frontend (`/frontend`)**:
  - **Runtime & Build**: Node.js 18+ (tested with Node 23 & npm 10), Vite 5, TypeScript 5.5, Tailwind CSS 3.4.
  - **State & Data Fetching**: `@tanstack/react-query` v5, `axios-hooks`.
  - **UI & Testing Tools**: React 18, Storybook 8, Vitest 2.1 (Playwright Chromium browser mode), `@testing-library/react`, Mock Service Worker (MSW).
- **Deployment & Infra (`/k8s`)**:
  - Kubernetes manifests for PostgreSQL, API, Frontend, and ArgoCD applications.

---

## 2. Build & Configuration Instructions

### Prerequisites
- Go 1.23 or higher
- Node.js (v18+) & `npm`
- PostgreSQL instance running locally or in a container

### Environment Configuration
The backend reads environment variables from `.env`. The `models.ConnectDatabase()` loader checks `.env`, `../.env`, and `../../.env`.

Create `api/.env`:
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=admin
DB_NAME=pokedb
PORT=8080
INIT_JOBS=false
```

### Database Initialization
Two seeding methods are supported:
1. **Offline Dump (Fast / Recommended)**:
   ```bash
   # From project root
   psql -h localhost -U postgres -d pokedb -f api/seed/mock-dump.sql
   ```
2. **Live PokeAPI Ingestion**:
   Populate small sample dataset (~50 records per entity):
   ```bash
   cd api
   go test -v ./jobs -run TestRefreshDBSuite
   ```

### Backend Build & Execution
- **Compile all packages**:
  ```bash
  cd api
  go build -v ./...
  ```
- **Run API Server**:
  ```bash
  cd api
  go run main.go
  ```
  API is served at `http://localhost:8080` (Base path `/api/v1`).
- **Regenerate Swagger API Docs**:
  ```bash
  cd api
  swag init
  ```
  Swagger UI: `http://localhost:8080/swagger/index.html`.

### Frontend Build & Execution
- **Install dependencies**:
  ```bash
  cd frontend
  npm install
  ```
- **Start Development Server** (proxies `/api` to `http://localhost:8080`):
  ```bash
  cd frontend
  npm run dev
  ```
- **Production Build (Typecheck + Vite bundle)**:
  ```bash
  cd frontend
  npm run build
  ```
- **Run Storybook Component Explorer**:
  ```bash
  cd frontend
  npm run storybook
  ```

---

## 3. Testing Information

### Backend Testing (Go / Testify)
Backend tests consist of HTTP handler integration tests (`api/controllers`) and database ingestion job suites (`api/jobs`).

#### Running Tests
- **Run all backend tests**:
  ```bash
  cd api
  go test -v ./...
  ```
- **Run controller tests only**:
  ```bash
  cd api
  go test -v ./controllers
  ```
- **Run a specific test method**:
  ```bash
  cd api
  go test -v ./controllers -run TestPokemonSuite/TestPokemonHandler_ListPokemon_Basic
  ```

#### Writing New Backend Tests
Controller test suites utilize `github.com/stretchr/testify/suite` and initialize Gin routing against the test database connection:

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

type ExampleTestSuite struct {
	suite.Suite
	router *gin.Engine
}

func (s *ExampleTestSuite) SetupTest() {
	models.ConnectDatabase()
	s.router = routes.SetupRouter(models.DB)
}

func TestExampleSuite(t *testing.T) {
	suite.Run(t, new(ExampleTestSuite))
}

func (s *ExampleTestSuite) TestGetPokemonList() {
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

---

### Frontend Testing (Vitest / Playwright / Testing Library)
Frontend testing uses Vitest configured with Playwright browser mode (`browser: { enabled: true, name: 'chromium', provider: 'playwright' }`), MSW mock workers, and `@testing-library/react`.

#### Running Tests
- **Run all frontend tests in CI/headless mode**:
  ```bash
  cd frontend
  npx vitest run
  ```
- **Run tests in interactive watch mode**:
  ```bash
  cd frontend
  npm test
  ```
- **Run a specific test file**:
  ```bash
  cd frontend
  npx vitest run src/components/ui/tests/DarkModeButton.test.tsx
  ```
- **Run tests matching a test name regex**:
  ```bash
  cd frontend
  npx vitest run -t "DarkModeButton"
  ```
- **Run tests with coverage**:
  ```bash
  cd frontend
  npx vitest run --coverage
  ```

#### Writing New Frontend Tests
Test files are co-located in `tests/` subdirectories adjacent to the component under test (e.g. `src/components/ui/tests/<ComponentName>.test.tsx`).

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('SampleComponent', () => {
  it('renders correctly within the DOM', () => {
    render(<button type="button">Click Me</button>);
    const button = screen.getByRole('button', { name: /Click Me/i });
    expect(button).toBeInTheDocument();
  });
});
```

---

## 4. Development Standards & Conventions

### Go Modern Language Standards (Go 1.23)
- Use `any` instead of `interface{}`.
- Use `errors.Is(err, target)` instead of `err == target`.
- Prefer stdlib slice/map utilities:
  - `slices.Contains(slice, item)`
  - `slices.IndexFunc(slice, fn)`
  - `slices.Max(slice)` / `slices.Min(slice)`
  - `maps.Clone(map)` / `maps.Keys(map)`
- Use `for i := range n` instead of `for i := 0; i < n; i++`.
- Handle context timeouts and cancellation with `context.WithCancelCause` and `context.WithTimeoutCause`.

### Frontend Guidelines
- Strict TypeScript typing; avoid `any`.
- Keep components organized under `src/components/<domain>/`.
- Use Tailwind CSS utility classes; avoid inline styles.
- Manage server state with TanStack Query hooks; keep global UI state in React contexts (`src/context/`).
- Document re-usable UI components with Storybook stories in `stories/` folders.

### Observability & Admin Endpoints
- **Jobrunner Admin Dashboard**: `http://localhost:8080/jobrunner/html`
- **Jobrunner JSON Metrics**: `http://localhost:8080/jobrunner/json`
- **Swagger Documentation**: `http://localhost:8080/swagger/index.html`
