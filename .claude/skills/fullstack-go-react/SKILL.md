---
name: fullstack-go-react
description: Use when developing or refactoring full-stack features involving the Go backend (Gin/GORM) and React frontend (Vite/TanStack Query). Enforces schema-driven development, Go-to-TypeScript type synchronization, Swagger contracts, and tool integration via Postgres/Context7/Playwright MCP.
---
# Full-Stack Go & React Development Protocol

## Context
- **Backend**: Go 1.23+ with Gin Web Framework and GORM (`api/`)
- **Frontend**: React 18 + TypeScript 5.5 + Vite + Tailwind CSS + TanStack Query v5 (`frontend/`)
- **Database**: PostgreSQL 15+ (GORM auto-migration + offline SQL dump + PokeAPI ingestion)
- **API Spec**: Swagger / OpenAPI 2.0 via Swaggo (`api/docs/`)

---

## Execution Steps

### 1. Schema-Driven Engineering & Database Verification
When adding or modifying a feature:
1. **Design or update GORM models** in `api/models/`:
   - Define exact column types, foreign keys (`gorm:"foreignKey:..."`), and JSON tags (`json:"propertyName"`).
   - If model is needed by API runtime, add to `coreModels()` in `api/models/setup.go`. If populated only during refresh, add to `MigrateAll()`.
2. **Verify live schema with Postgres MCP**:
   - Use `postgres` MCP tool or `psql` to inspect table structure, constraints, and column nullability.
   - Verify sample data queries before writing complex GORM handler logic.

### 2. Go Backend Controller & Route Implementation
1. **Controller**:
   - Create constructor-injected handler in `api/controllers/<feature>.go` receiving `*gorm.DB`.
   - Add Swaggo annotations (`@Summary`, `@Tags`, `@Param`, `@Success`, `@Failure`, `@Router`).
   - Return structured JSON payloads matching response models in `api/models/`.
2. **Routes**:
   - Register endpoints in `api/routes/<feature>routes/routes.go` and mount under `/api/v1` in `api/routes/setup.go`.
3. **Regenerate Swagger**:
   - Run `cd api && swag init` to synchronize `api/docs/swagger.json`.

### 3. Type Handoff Protocol (Go → TypeScript)
1. **Create/Update TypeScript Interfaces** in `frontend/src/models/`:
   - Match Go struct JSON tags exactly (e.g., camelCase property names).
   - Ensure nullability aligns (e.g., optional `?` or `| null` for nullable database columns).
2. **Contract Verification**:
   - Check TypeScript models against Swagger docs (`api/docs/swagger.json` or `http://localhost:8080/swagger/index.html`).
   - Use IDE native symbol navigation to find all frontend references when altering shared field names.

### 4. Frontend Data Fetching & UI Integration
1. **API Client & Query Options**:
   - Add typed fetcher in `frontend/src/query/api/<feature>.ts`.
   - Add query key in `frontend/src/query/constants.ts` and key factory options in `frontend/src/query/keyFactories.ts`.
   - Create custom hook in `frontend/src/query/hooks/use<Feature>.ts`.
   - Consult **Context7 MCP** for TanStack Query v5 syntax (e.g. `queryOptions`, `gcTime` instead of `cacheTime`).
2. **UI Component & Styling**:
   - Place components in `frontend/src/components/<domain>/`.
   - Style with Tailwind CSS utility classes; avoid inline styles.
   - Global UI state belongs in React Context (`frontend/src/context/`), not TanStack Query.
3. **Visual Verification with Playwright MCP**:
   - Navigate to `http://localhost:5173` or Storybook `http://localhost:6006` via Playwright MCP to inspect DOM structure and visual states.

### 5. Error Handling & Status Codes
- **Go Backend**: Wrap errors cleanly (`fmt.Errorf("context: %w", err)`) and return consistent JSON payloads: `gin.H{"error": "Readable message"}` with standard HTTP codes (400, 404, 500).
- **React Frontend**: Handle query errors gracefully via TanStack Query `isError`/`error` properties and error boundaries.

### 6. End-to-End Verification
- Run backend tests: `cd api && go test -v ./controllers` (or `scripts/test-db.sh test`).
- Run frontend tests: `cd frontend && npx vitest run`.
- Run frontend typecheck/build: `cd frontend && npm run build`.

---

## Key Constraints
- **Strict Go 1.23 idioms**: Use `any`, `errors.Is`, `slices`/`maps` helpers.
- **No `any` in TypeScript**: Explicitly type all props, state, API responses, and loaders.
- **Do not edit `api/docs/` manually**: Always run `swag init`.
- **Proxy configuration**: In dev, Vite proxies `/api` to `http://localhost:8080`. In production, nginx proxies `/api/` to `http://api:8080/`.

