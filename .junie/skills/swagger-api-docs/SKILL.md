---
name: swagger-api-docs
description: Use when adding or modifying API endpoints, Swagger / OpenAPI annotations, or regenerating Swagger docs with Swaggo. Enforces Swaggo comment formats, router parameters, and documentation synchronization.
---
# Swagger API Documentation Protocol

## Context
- **Tool**: Swaggo (`github.com/swaggo/swag`, `github.com/swaggo/gin-swagger`)
- **Generated Output**: `../../../api/docs` (`docs.go`, `swagger.json`, `swagger.yaml`)
- **API Base Path**: `/api/v1`
- **Swagger UI**: Served at `http://localhost:8080/swagger/index.html`

---

## Execution Steps

### 1. General API-Level Annotations
Global API metadata is configured in `../../../api/main.go` doc comments:

```go
// @title PokeDB REST API
// @version 1.0
// @description REST API for PokeDB Pokemon and evolution data.
// @BasePath /api/v1
```

### 2. Controller Handler Annotations
Every HTTP controller in `../../../api/controllers` must be annotated with standard Swaggo tags above the handler function:

```go
// ListPokemon godoc
// @Summary List Pokemon
// @Description Fetch a paginated list of Pokemon with optional name and type filtering
// @Tags pokemon
// @Accept json
// @Produce json
// @Param page query int false "Page number (defaults to 1)"
// @Param pageSize query int false "Page size (defaults to 20, max 100)"
// @Param pokemonName query string false "Filter by pokemon name"
// @Param pokemonTypeId query string false "Filter by move type ID"
// @Success 200 {object} models.ListPokemonResponse
// @Failure 400 {object} map[string]string "Invalid query parameters"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /pokemon [get]
```

### 3. Annotation Guidelines

| Tag | Purpose | Example |
|-----|---------|---------|
| `@Summary` | Short single-line title | `@Summary Get Pokemon by ID` |
| `@Description` | Detailed explanation of endpoint behavior | `@Description Retrieve full Pokemon details including stats and types` |
| `@Tags` | Grouping tag in Swagger UI | `@Tags pokemon`, `@Tags move-types` |
| `@Param` | Query, path, or body parameter | `@Param id path int true "Pokemon ID"` |
| `@Success` | HTTP status and response struct type | `@Success 200 {object} models.Pokemon` |
| `@Failure` | Error HTTP status and response type | `@Failure 404 {object} map[string]string "Not Found"` |
| `@Router` | Path relative to `@BasePath` and HTTP method | `@Router /pokemon/{id} [get]` |

### 4. Regenerating Swagger Documentation
After adding or editing any handler annotations, response models in `../../../api/models`, or routes:

```bash
cd api
swag init
```

**Verification:**
1. Check that `../../../api/docs/docs.go`, `api/docs/swagger.json`, and `api/docs/swagger.yaml` are updated.
2. Ensure no parse errors or unresolved type warnings occur during `swag init`.
3. Verify interactive Swagger UI locally at `http://localhost:8080/swagger/index.html`.

---

## Key Constraints
- **Never hand-edit files in `../../../api/docs`**: `docs.go`, `swagger.json`, and `swagger.yaml` are auto-generated.
- **Route paths in `@Router` are relative to `@BasePath`**: Do not repeat `/api/v1` in `@Router` (e.g. use `@Router /pokemon [get]`, NOT `@Router /api/v1/pokemon [get]`).
- **Response types must match actual returned models**: Reference concrete structs from `models.*` rather than generic `interface{}` / `any`.
