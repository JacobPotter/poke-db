# PokeDB System Architecture

This document provides a comprehensive technical overview of the **PokeDB** system architecture, data flow, database schema & migrations, external data ingestion, and GitOps CI/CD deployment model.

---

## 1. High-Level Architecture Overview

PokeDB is an online Pokédex application composed of a Go REST API, a React Single Page Application (SPA), a PostgreSQL relational database, and an ingestion subsystem that synchronizes data from PokeAPI.

```mermaid
graph TD
    subgraph External ["External Data Provider"]
        PokeAPI["PokeAPI (pokeapi.co)"]
    end

    subgraph DataIngestion ["Data Ingestion Subsystem"]
        CronJob["K8s CronJob (Nightly) / PostSync Seed Hook"]
        RefreshBinary["refresh-db binary (api/refresh)"]
        CronJob --> RefreshBinary
        PokeAPI -->|HTTP REST / Pagination| RefreshBinary
    end

    subgraph DatabaseLayer ["Database Layer"]
        Postgres[("PostgreSQL 15+ (GORM / Tables / Indexes)")]
        RefreshBinary -->|Models & Evolutions Ingestion| Postgres
    end

    subgraph BackendAPI ["Backend API (Go 1.23 / Gin)"]
        GinServer["Gin Web Framework (api/main.go)"]
        Routes["Route Handlers (pokemon, types, evolutions)"]
        GormORM["GORM ORM (AutoMigrate coreModels)"]
        
        GinServer --> Routes
        Routes --> GormORM
        GormORM <-->|SQL Queries / Connection Pool| Postgres
    end

    subgraph Clients ["Client Layer"]
        BrowserDev["Browser (Local Dev :5173)"]
        ViteDev["Vite Dev Server (Proxy /api -> :8080)"]
        BrowserProd["Browser (Production)"]
        NginxProd["Nginx Reverse Proxy & Static Host"]
        ReactApp["React 18 + TanStack Query SPA"]

        BrowserDev --> ViteDev --> ReactApp
        ViteDev -->|Proxy /api| GinServer
        
        BrowserProd --> NginxProd --> ReactApp
        NginxProd -->|Proxy /api -> http://api:8080| GinServer
    end
```

---

## 2. Request Lifecycle & Routing Across Environments

### Local Development Environment
In local development, the frontend runs via Vite's development server (`http://localhost:5173`) and the API runs on `http://localhost:8080`.
- The frontend sends API requests to `/api/v1/...`.
- Vite's proxy configuration in `frontend/vite.config.ts` intercepts `/api` and proxies the requests directly to `http://localhost:8080`.

```mermaid
sequenceDiagram
    autonumber
    actor User as Developer / Browser
    participant Vite as Vite Dev Server (:5173)
    participant API as Go Gin API (:8080)
    participant DB as PostgreSQL Database (:5432)

    User->>Vite: GET / (Load SPA)
    Vite-->>User: HTML + React + Tailwind JS/CSS
    User->>Vite: GET /api/v1/pokemon?page=1&pageSize=20
    Vite->>API: Proxy GET /api/v1/pokemon?page=1&pageSize=20
    API->>DB: GORM Query (pokemon_species, move_types)
    DB-->>API: Result rows
    API-->>Vite: JSON Response (models.ListPokemonResponse)
    Vite-->>User: 200 OK (Rendered by TanStack Query)
```

### Production Environment (Kubernetes & Nginx)
In production container environments:
- An Nginx web server serves the compiled React static assets (`/usr/share/nginx/html`).
- The `location /api` block in `frontend/nginx.conf` proxies backend requests to the internal Kubernetes API service (`http://api:8080`).
- The trailing slash on `proxy_pass http://api:8080;` preserves route resolution under `/api/v1`.
- Direct client-side page routing (e.g. `/pokemon/charizard`, `/types`) is supported via Nginx's `try_files $uri $uri/ /index.html;` fallback.

---

## 3. Database Architecture & Split Migration Strategy

PokeDB utilizes **PostgreSQL 15+** with **GORM**. The database schema is divided into core application models and complex evolution graph models.

### Split Migration Mechanism

To decouple API startup from heavy migration logic and ensure schema stability:

1. **API Server Core Migrations (`models.ConnectDatabase()`)**:
   When the API server starts or tests connect, `models.ConnectDatabase()` executes `AutoMigrate()` **only** on core models:
   - `PokemonSpecies`
   - `Pokemon`
   - `MoveType`
   - `Item`
   - `Move`
   - `Location`
   - `Region`
   - `EvolutionTrigger`

2. **Evolution Tables & Full Migration (`models.MigrateAll()`)**:
   The evolution subsystem represents multi-branch evolution trees:
   - `EvolutionChain`
   - `EvolutionChainLink`
   - `EvolutionDetails`

   > **PostgreSQL 15+ Requirement**: `EvolutionDetails` utilizes a unique index with `NULLS NOT DISTINCT` to support flexible branching criteria while enforcing uniqueness across nullable fields.

   `models.MigrateAll()` is invoked exclusively by:
   - The standalone `refresh-db` binary (`api/cmd/refresh-db`)
   - The refresh test suite (`api/refresh/refresh-db_test.go`)
   - The ArgoCD PostSync hook (`base/refresh-db-seed-hook.yaml` in `poke-db-gitops`)

```mermaid
classDiagram
    class PokemonSpecies {
        +uint ID
        +string Name
        +int Order
        +int GenderRate
        +int CaptureRate
        +int BaseHappiness
        +bool IsBaby
        +bool IsLegendary
        +bool IsMythical
        +uint EvolutionChainID
    }

    class Pokemon {
        +uint ID
        +string Name
        +int Height
        +int Weight
        +int BaseExperience
        +uint SpeciesID
        +MoveType[] Types
        +Move[] Moves
    }

    class MoveType {
        +uint ID
        +string Name
        +DamageRelation DoubleDamageTo
        +DamageRelation HalfDamageTo
        +DamageRelation NoDamageTo
    }

    class Move {
        +uint ID
        +string Name
        +int Accuracy
        +int Power
        +int PP
        +uint TypeID
    }

    class EvolutionChain {
        +uint ID
        +EvolutionChainLink BabyTriggerItem
    }

    class EvolutionChainLink {
        +uint ID
        +uint EvolutionChainID
        +uint SpeciesID
        +uint ParentLinkID
        +bool IsBaby
    }

    class EvolutionDetails {
        +uint ID
        +uint EvolutionChainLinkID
        +uint TriggerID
        +int MinLevel
        +uint ItemID
        +uint HeldItemID
        +string TimeOfDay
        +int MinHappiness
    }

    PokemonSpecies "1" <-- "1..*" Pokemon : has variations
    PokemonSpecies "*" --> "1" EvolutionChain : belongs to
    EvolutionChain "1" --> "1..*" EvolutionChainLink : contains links
    EvolutionChainLink "1" --> "0..*" EvolutionDetails : triggered by
    Pokemon "*" --> "*" MoveType : typed as
    Move "*" --> "1" MoveType : belongs to
```

---

## 4. Ingestion Subsystem (`api/refresh`)

The data ingestion engine fetches relational entity data from PokeAPI and transforms it into PostgreSQL records.

### Execution Dependency Order

Because relational foreign keys and associations must be established accurately, `RefreshDB.Run()` executes ingestion in strict dependency order:

```mermaid
flowchart TD
    Start([Run Ingestion]) --> Step1[1. Types: refreshTypes]
    Step1 -->|Hard Dependency - Errors Abort| Step2[2. Items: refreshItems]
    Step2 --> Step3[3. Locations & Regions: refreshLocations]
    Step3 --> Step4[4. Pokemon & Species: refreshPokemon]
    Step4 --> Step5[5. Moves & Damage Relations: refreshMoves]
    Step5 --> Step6[6. Evolution Triggers: refreshEvolutionTriggers]
    Step6 --> Step7[7. Evolution Chains & Links: refreshEvolutionChains]
    Step7 --> Complete([Ingestion Complete])
```

1. **Move Types (`refreshTypes`)**: Critical foundational dependency. If this step fails, the entire ingestion job aborts.
2. **Items (`refreshItems`)**: Evolution and held items.
3. **Locations & Regions (`refreshLocations`)**: Regional encounter areas.
4. **Pokemon & Species (`refreshPokemon`)**: Pokémon stats, base forms, types, and species data.
5. **Moves (`refreshMoves`)**: Move associations and type damage multipliers.
6. **Evolution Triggers (`refreshEvolutionTriggers`)**: Trigger mechanisms (level-up, trade, use-item, etc.).
7. **Evolution Chains (`refreshEvolutionChains`)**: Recursive evolution trees, branching links, and exact detail constraints.

---

## 5. Frontend Architecture & State Management

The frontend is built with React 18, TypeScript, Tailwind CSS, and TanStack Query.

```mermaid
graph TD
    subgraph UIComponents ["UI Component Hierarchy (src/components/)"]
        Layout["Layout & Navbar (layout/)"]
        Pages["Page Views (pages/): PokemonPage, TypesPage, EvolutionsPage"]
        PokemonDomain["Pokemon Components (pokemon/): List, Details, EvolutionSummary"]
        MoveTypeDomain["Type Components (moveTypes/): TypesChart, TypesSummary"]
        UIPrimitives["UI Primitives (ui/): Pokedex, DarkModeButton, Skeletons"]
    end

    subgraph StateManagement ["State & Data Management"]
        ReactContext["React Contexts (src/context/): DarkModeContext, MoveTypeContext"]
        TanStackQuery["TanStack Query Hooks (src/query/hooks/)"]
        QueryClient["QueryClient (10-minute staleTime, no window refetch)"]
        KeyFactories["Query Key Factories (src/query/keyFactories.ts)"]
        APIClient["API Layer (src/query/api/): Axios Fetchers"]
    end

    Pages --> PokemonDomain
    Pages --> MoveTypeDomain
    Layout --> UIPrimitives
    PokemonDomain --> TanStackQuery
    MoveTypeDomain --> TanStackQuery
    UIPrimitives --> ReactContext
    TanStackQuery --> KeyFactories
    TanStackQuery --> QueryClient
    TanStackQuery --> APIClient
```

### Caching Strategy
- **Query Cache (`src/query/queryClient.ts`)**: Configured with a default `staleTime` of 10 minutes (`1000 * 60 * 10`) and `gcTime` of 15 minutes.
- **Window Focus Refetching**: Disabled (`refetchOnWindowFocus: false`) to avoid redundant requests against static data.
- **Loaders**: `src/loaders/` provides prefetching routines for Pokémon detail and evolution chain screens.

---

## 6. CI/CD & GitOps Promotion Model

PokeDB uses GitHub Actions in this repository for continuous integration and container image publishing, combined with a dedicated GitOps repository ([`poke-db-gitops`](https://github.com/JacobPotter/poke-db-gitops)) and ArgoCD for deployments.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant GH as GitHub (JacobPotter/poke-db)
    participant CI as GitHub Actions CI
    participant GHCR as GitHub Container Registry (ghcr.io)
    participant GitOps as GitOps Repo (poke-db-gitops)
    participant Argo as ArgoCD Controller
    participant K8s as Kubernetes Cluster

    Dev->>GH: Push commit to PR #123
    GH->>CI: Trigger CI Workflow (.github/workflows/ci.yml)
    CI->>CI: Run Go tests, Vitest browser tests, Lint, Typecheck
    CI->>GHCR: Push images :pr-123
    
    opt PR has "preview" label
        Dev->>GH: Add label "preview"
        Argo->>GH: ApplicationSet detects label "preview" on PR #123
        Argo->>GitOps: Fetch overlays/preview
        Argo->>K8s: Deploy to namespace poke-db-pr-123 (images :pr-123)
        K8s->>K8s: PostSync hook seeds DB if empty
        Argo->>GH: Post commit status check (continuous-delivery/poke-db-pr-123)
    end

    Dev->>GH: Merge PR #123 to main
    GH->>CI: Trigger CI on main branch
    CI->>GHCR: Push images :latest and :sha-abc1234
    CI->>GitOps: repository_dispatch (promote-prod)
    GitOps->>GitOps: promote.yml updates overlays/prod/kustomization.yaml
    Argo->>GitOps: Detects commit on main
    Argo->>K8s: Sync overlays/prod to namespace poke-db
    Argo->>GH: Post commit status check (continuous-delivery/poke-db-prod)
```

### Production Release Pipeline
1. Pull requests run backend and frontend test suites and publish preview container images (`ghcr.io/jacobpotter/poke-db-api:pr-<N>` and `ghcr.io/jacobpotter/poke-db-frontend:pr-<N>`).
2. When merged to `main`, CI tags images with `:latest` and `:sha-<short>`.
3. The `deploy-prod` GitHub Actions job sends a `repository_dispatch` event (`promote-prod`) with image tags and commit metadata to `JacobPotter/poke-db-gitops`.
4. The promotion workflow in `poke-db-gitops` updates `overlays/prod/kustomization.yaml` with the new short SHA tag and commits the change.
5. ArgoCD detects the change on `poke-db-gitops` `main`, synchronizes manifests, and performs a rolling update of the `poke-db` production namespace.
6. ArgoCD notifications report sync status and pod health back to GitHub commit statuses.

---

## Related Documentation

- [Project Overview & Quickstart](README.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Backend Development Guide](api/README.md)
- [Frontend Development Guide](frontend/README.md)
- [Kubernetes & GitOps Repository](https://github.com/JacobPotter/poke-db-gitops)
