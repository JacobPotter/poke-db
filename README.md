# PokeDB

**PokeDB** is a full-stack online Pokédex web application. It features a modern, responsive Single Page Application frontend built with React 18, TypeScript, and Tailwind CSS, backed by a RESTful API written in Go 1.23 with Gin, GORM, and PostgreSQL 15+. Data is sourced and synchronized from [PokeAPI](https://pokeapi.co/) via scheduled batch ingestion jobs.

For the live version, visit [Poke-DB](https://poke-db.webwizardssoftware.com).

<img width="1512" alt="PokeDB Screenshot" src="https://github.com/user-attachments/assets/a7ec3b94-6fbd-462e-abbc-25a3302e8834">

---

## Architecture & Documentation Map

PokeDB is divided into several focused subsystems with dedicated technical documentation:

| Subsystem | Description | Guide Link |
|---|---|---|
| **System Architecture** | High-level topology, Mermaid diagrams, database split migrations, and request flow | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **Backend API** | Go 1.23 REST API (Gin + GORM + PostgreSQL), endpoints, testing & seeding | [api/README.md](api/README.md) |
| **Frontend Client** | React 18 SPA (TypeScript + Tailwind CSS + TanStack Query + Storybook) | [frontend/README.md](frontend/README.md) |
| **Kubernetes & GitOps** | Kustomize overlays, ArgoCD deployments, preview environments, notifications | [poke-db-gitops repository](https://github.com/JacobPotter/poke-db-gitops) |
| **Contributing** | Branching workflow, Conventional Commits, and pre-PR validation checklist | [CONTRIBUTING.md](CONTRIBUTING.md) |
| **AI Agent & Developer Guide** | Technical specifications, command reference, architecture patterns, and conventions for AI assistants (GitHub Copilot, Claude, Junie, Cursor) | [AGENTS.md](AGENTS.md) |

---

## Prerequisites

Ensure you have the following installed locally:
- **[Go](https://go.dev/)** (v1.23 or later)
- **[Node.js](https://nodejs.org/)** (v18 or later) & `npm`
- **[PostgreSQL](https://www.postgresql.org/)** (v15+ running locally or in a container)
- **[Docker](https://www.docker.com/)** (optional, for Docker Compose and local containers)

---

## Quickstart Options

### Option 1: Docker Compose Full Stack (Fastest All-in-One)
Run the entire stack (PostgreSQL with pre-seeded data, backend API, and frontend client) with a single command:

```bash
docker compose up --build
```

- **Frontend Client**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080` (Base: `/api/v1`)
- **Swagger Documentation**: `http://localhost:8080/swagger/index.html`
- **PostgreSQL Database**: `localhost:5432` (`user: postgres`, `password: postgres`, `db: pokedb`)

To run in detached mode or tear down:
```bash
docker compose up -d --build
docker compose down
```

---

### Option 2: Local Development (Go + Node)

#### 1. Database Setup
Create a PostgreSQL 15+ database (e.g. `pokedb`):
```sql
CREATE DATABASE pokedb;
```

#### 2. Seed Database
Restore the offline mock database dump file (`api/seed/mock-dump.sql`) to immediately populate tables, sequences, and seed data without making external network calls:

```bash
# Run from repository root
psql -h localhost -U postgres -d pokedb -f api/seed/mock-dump.sql
```

#### 3. Backend API Server
1. Navigate to the `api` directory:
   ```bash
   cd api
   ```
2. Create a `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=pokedb
   PORT=8080
   # DB_PORT=5432 (optional)
   ```
3. Run the API server (core migrations run automatically):
   ```bash
   go run main.go
   ```
   The API will start at `http://localhost:8080`.

#### 4. Frontend Client
1. Navigate to the `frontend` directory in a new terminal:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`. Requests to `/api` are automatically proxied to `http://localhost:8080`.

---

## Database Seeding & Data Refresh

There are two methods to populate the database:

### 1. Offline SQL Dump (Instant & Recommended)
```bash
psql -h localhost -U postgres -d pokedb -f api/seed/mock-dump.sql
```

### 2. Live PokeAPI Ingestion (`api/refresh`)
The standalone ingestion command (`api/cmd/refresh-db`) fetches live data directly from PokeAPI.

- **Quick sample subset (~50 records per entity)**:
  ```bash
  cd api
  go test -v ./refresh -run TestRefreshDBSuite
  ```
- **Full database ingestion (~1,500 Pokémon, long timeout)**:
  ```bash
  cd api
  FULL_SEED_TEST=true go test -v -timeout 30m ./refresh -run TestRefreshDBSuite
  ```
- **Direct CLI binary execution**:
  ```bash
  cd api
  REFRESH_TEST_MODE=true go run ./cmd/refresh-db
  ```

---

## Testing & Quality Assurance

### Backend API Tests (Go / Testify)
Use the automated test container script (manages an ephemeral PostgreSQL test DB on port 5433):

```bash
# Start test database and run all backend tests
scripts/test-db.sh test

# Run a specific package or test
scripts/test-db.sh test ./controllers/...

# Export DB_* environment variables into your shell
eval "$(scripts/test-db.sh env)"

# Stop and remove test database container
scripts/test-db.sh down
```

Or run directly with `api/.env` pointing to a running PostgreSQL 15+ database:
```bash
cd api
go test -v ./...
```

### Frontend Tests (Vitest + Playwright + MSW)
Frontend tests execute in a real headless Chromium browser via Playwright and MSW API mocking:

```bash
cd frontend

# Run test suite once (CI / headless mode)
npx vitest run

# Run tests in interactive watch mode
npm test

# Run a specific test file
npx vitest run src/components/ui/tests/DarkModeButton.test.tsx

# Run linter & typecheck
npm run lint
npm run build
```

---

## Developer Tooling & UI Explorers

- **Swagger API Documentation**: `http://localhost:8080/swagger/index.html` (Regenerate with `cd api && swag init`)
- **Storybook UI Component Explorer**:
  ```bash
  cd frontend
  npm run storybook
  ```
  Accessible at `http://localhost:6006`.

---

## Deployment & Infrastructure (Kubernetes & ArgoCD)

PokeDB uses a dedicated GitOps repository ([`poke-db-gitops`](https://github.com/JacobPotter/poke-db-gitops)) for declarative Kubernetes deployment and ArgoCD management:

- **Continuous Integration**: GitHub Actions (`.github/workflows/ci.yml`) runs tests and publishes container images to GitHub Container Registry (`ghcr.io/jacobpotter/poke-db-api` and `ghcr.io/jacobpotter/poke-db-frontend`).
- **Production GitOps Promotion**: On merge to `main`, CI triggers a `repository_dispatch` event (`promote-prod`) to `poke-db-gitops`, which updates `overlays/prod/kustomization.yaml` with the new `:sha-<short>` image tags and triggers ArgoCD rollout.
- **Ephemeral Preview Environments**: Applying the `preview` label on any pull request causes the ArgoCD ApplicationSet in `poke-db-gitops` to spin up an isolated `poke-db-pr-<N>` preview environment.
- **GitOps Repository**: See [JacobPotter/poke-db-gitops](https://github.com/JacobPotter/poke-db-gitops) for Kustomize overlays, ArgoCD manifests, and promotion workflows.

---

## Contributing

Please review [CONTRIBUTING.md](CONTRIBUTING.md) for our code of conduct, branching strategy, Conventional Commit guidelines, and pre-PR checklist.
