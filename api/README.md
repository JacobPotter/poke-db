# PokeDB Backend API

The **PokeDB API** is a high-performance RESTful API written in Go 1.23 using the [Gin Web Framework](https://github.com/gin-gonic/gin) and [GORM](https://gorm.io/) with PostgreSQL 15+. It provides structured endpoints for retrieving Pokémon, move types, moves, locations, and multi-branch evolution chains.

---

## 1. Architecture & Package Structure

The backend follows clean dependency injection principles: handlers receive database connections via constructor arguments rather than accessing global variables directly.

```
api/
├── cmd/
│   └── refresh-db/        # Standalone binary for PokeAPI data ingestion
│       └── main.go
├── controllers/           # HTTP handlers & Testify integration test suites
│   ├── evolution.go
│   ├── pokemon.go
│   ├── pokemon_test.go
│   ├── type.go
│   └── type_test.go
├── docs/                  # Swagger generated documentation (swag init)
│   ├── docs.go
│   ├── swagger.json
│   └── swagger.yaml
├── mocks/                 # Test mock fixtures and helpers
├── models/                # GORM database models & connection setup
│   ├── evolution.go
│   ├── item.go
│   ├── location.go
│   ├── move.go
│   ├── paginate.go
│   ├── pokemon.go
│   ├── setup.go
│   └── type.go
├── refresh/               # PokeAPI data ingestion logic and tests
│   ├── refresh-db.go
│   ├── refresh-evolutions.go
│   ├── refresh-items.go
│   ├── refresh-locations.go
│   ├── refresh-moves.go
│   ├── refresh-pokemon.go
│   └── refresh-types.go
├── routes/                # Gin router setup & route registration
│   ├── evolutionroutes/
│   ├── pokemonroutes/
│   ├── typeroutes/
│   └── setup.go
├── seed/                  # Offline pre-seeded database dump
│   └── mock-dump.sql
├── main.go                # API server entrypoint & Swagger annotations
└── go.mod                 # Go 1.23 module definition
```

---

## 2. Environment Configuration

The API automatically searches for `.env` files in `.env`, `../.env`, and `../../.env`.

Create `api/.env`:
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=pokedb
PORT=8080
# DB_PORT=5432  (optional, defaults to 5432)
```

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | PostgreSQL hostname / IP | `localhost` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | None |
| `DB_NAME` | PostgreSQL database name | `pokedb` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `PORT` | API server listening port | `8080` |

---

## 3. Database Migrations (Two-Phase Model)

PokeDB splits database migrations into two distinct tiers:

1. **Core Application Migrations (`models.ConnectDatabase()`)**:
   Runs automatically on API server startup and standard controller test execution. It auto-migrates core models:
   - `PokemonSpecies`, `Pokemon`, `MoveType`, `Item`, `Move`, `Location`, `Region`, `EvolutionTrigger`.

2. **Full Schema & Evolution Migrations (`models.MigrateAll(db)`)**:
   Required for evolution graph tables:
   - `EvolutionChain`, `EvolutionChainLink`, `EvolutionDetails`.
   - `EvolutionDetails` utilizes a `NULLS NOT DISTINCT` unique index, requiring **PostgreSQL 15+**.
   - Invoked exclusively during offline dump restoration, the standalone ingestion binary (`cmd/refresh-db`), and refresh test suites.

---

## 4. Seeding & Ingestion

### Option A: Offline SQL Dump (Instant & Recommended)
Populate tables and sequences immediately without making network calls:

- **From repository root**:
  ```bash
  psql -h localhost -U postgres -d pokedb -f api/seed/mock-dump.sql
  ```
- **From `api/` directory**:
  ```bash
  psql -h localhost -U postgres -d pokedb -f seed/mock-dump.sql
  ```

### Option B: Live PokeAPI Ingestion (`api/refresh`)
The ingestion engine fetches live records from [PokeAPI](https://pokeapi.co/) in strict dependency order:
`Types -> Items -> Locations -> Pokemon -> Moves -> Evolution Triggers -> Evolution Chains`.

- **Quick sample subset (~50 records per entity)**:
  ```bash
  cd api
  go test -v ./refresh -run TestRefreshDBSuite
  ```
- **Run standalone binary in sample test mode**:
  ```bash
  cd api
  REFRESH_TEST_MODE=true go run ./cmd/refresh-db
  ```
- **Run standalone binary with `-if-empty` flag** (skips if data exists):
  ```bash
  cd api
  go run ./cmd/refresh-db -if-empty
  ```
- **Full live database seed (~1,500 Pokémon, extended timeout)**:
  ```bash
  cd api
  FULL_SEED_TEST=true go test -v -timeout 30m ./refresh -run TestRefreshDBSuite
  ```

---

## 5. Running the API Server

```bash
cd api

# Compile all packages
go build -v ./...

# Run development server (serves on :8080 by default)
go run main.go
```

Base API route: `http://localhost:8080/api/v1`

---

## 6. Swagger API Documentation

API endpoint annotations are maintained in `main.go` and controller files.

To regenerate Swagger documentation:
```bash
cd api
swag init
```

- **Swagger UI**: `http://localhost:8080/swagger/index.html`
- Generated files live in `api/docs/` (`docs.go`, `swagger.json`, `swagger.yaml`).

---

## 7. Testing Guide

Backend tests require a real PostgreSQL instance; nothing is mocked at the database layer.

### Automated Test Database (Recommended)
Use `scripts/test-db.sh` from the repository root to launch and seed an isolated PostgreSQL test container on port 5433:

```bash
# Run all backend tests against test container
scripts/test-db.sh test

# Run a specific package
scripts/test-db.sh test ./controllers/...

# Export DB_* environment variables into current shell
eval "$(scripts/test-db.sh env)"

# Tear down test database container
scripts/test-db.sh down
```

### Manual Test Execution (Against Local DB)
With `api/.env` pointing to your local PostgreSQL 15+ instance:

```bash
cd api

# Run all tests
go test -v ./...

# Run controller handler integration tests
go test -v ./controllers

# Run a single test method
go test -v ./controllers -run TestPokemonSuite/TestPokemonHandler_ListPokemon_Basic
```

### Writing Controller Integration Tests
Controller suites use `github.com/stretchr/testify/suite` and initialize Gin routing against the test database:

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

## 8. Go 1.23 Standards & Conventions

- Use `any` instead of `interface{}`.
- Use `errors.Is(err, target)` instead of direct equality `err == target`.
- Prefer standard library slice and map utilities (`slices.Contains`, `slices.IndexFunc`, `slices.Max`, `slices.Min`, `maps.Clone`, `maps.Keys`).
- Use range over integer syntax: `for i := range n`.
- Manage context cancellations and timeouts with `context.WithCancelCause` and `context.WithTimeoutCause`.

---

## Related Documentation

- [Project Overview & Quickstart](../README.md)
- [System Architecture](../ARCHITECTURE.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Frontend Development Guide](../frontend/README.md)
- [Kubernetes & GitOps Repository](https://github.com/JacobPotter/poke-db-gitops)
