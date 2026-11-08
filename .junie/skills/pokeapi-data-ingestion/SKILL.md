---
name: pokeapi-data-ingestion
description: Use when working with the PokeAPI data ingestion pipeline in api/refresh. Covers the refresh step ordering, error handling, adding new entity types, debugging partial failures, and understanding seed modes (sample vs full, -if-empty flag).
---
# PokeAPI Data Ingestion Protocol

## Context
- **Package**: `../../../api/refresh` — ingests data from PokeAPI into PostgreSQL.
- **Entry point**: `../../../api/cmd/refresh-db` — standalone binary, not part of the API server.
- **Runtime**: Runs as a Kubernetes CronJob (nightly) and as an ArgoCD PostSync hook (initial seed).
- **API client**: `github.com/JacobPotter/pokeapi-go` — Go client for PokeAPI.
- **Database**: PostgreSQL 15+ (evolution tables require `NULLS NOT DISTINCT`).

---

## Execution Steps

### 1. Refresh Pipeline — Step Ordering and Dependencies

The refresh pipeline runs steps in strict dependency order in `RefreshDB.Run()`:

```
1. refreshTypes()          → ERROR ABORTS THE RUN (hard dependency)
2. refreshItems()          → errors logged, does not abort
3. refreshLocations()      → errors logged, does not abort
4. refreshPokemon()        → errors logged, does not abort
5. refreshMoves()          → errors logged, does not abort
6. refreshEvolutionTriggers() → errors logged, does not abort
7. refreshEvolutionsChains()  → errors logged, does not abort
```

**Why types must succeed first**: Damage type relationships (e.g., `double_damage_to`) reference `MoveType` IDs. All other steps depend on types being populated.

**All other steps are best-effort**: They log errors but do not return them to `Run()`, allowing the pipeline to continue even if one entity type fails.

### 2. Seed Modes — Sample vs Full

The refresh pipeline supports two modes controlled by the `REFRESH_TEST_MODE` environment variable:

| Mode | Variable | Records | Use Case |
|------|----------|---------|----------|
| **Sample** | `REFRESH_TEST_MODE=true` | ~50 per entity | Local development, testing |
| **Full** | Not set | ~1,500 Pokémon + all associations | Production, full data |

**Commands:**
```bash
# Sample seed via test suite
cd api
go test -v ./refresh -run TestRefreshDBSuite

# Full seed via test suite (slow — makes extensive API calls)
cd api
FULL_SEED_TEST=true go test -v -timeout 30m ./refresh -run TestRefreshDBSuite

# Sample seed via direct command
cd api
REFRESH_TEST_MODE=true go run ./cmd/refresh-db

# Full seed via direct command
cd api
go run ./cmd/refresh-db
```

### 3. The `-if-empty` Flag

The `-if-empty` flag (used by the ArgoCD PostSync hook) makes the refresh a no-op when data already exists:

```go
if *ifEmpty {
    var count int64
    if err := models.DB.Model(&models.MoveType{}).Count(&count).Error; err != nil {
        log.Fatalf("refresh-db: checking existing data: %v", err)
    }
    if count > 0 {
        log.Printf("refresh-db: already seeded (%d move types), skipping", count)
        return
    }
}
```

**Behavior**: Checks if the `move_types` table has any rows. If yes, skips the entire refresh. This makes routine ArgoCD syncs cheap — the PostSync hook runs on every sync but does nothing once seeded.

### 4. Refresh in Kubernetes

Two K8s resources handle data ingestion:

| Resource | Manifest | Schedule | Command |
|----------|----------|----------|---------|
| **CronJob** | `../../../k8s/base/refresh-db-cronjob.yaml` | 00:00 UTC daily | `/app/refresh-db` |
| **PostSync Hook** | `../../../k8s/base/refresh-db-seed-hook.yaml` | After every ArgoCD sync | `/app/refresh-db -if-empty` |

**Both use the API image** — the Dockerfile (`../../../api/Dockerfile`) builds both `poke-api` and `refresh-db` binaries into the same image.

**Manual trigger:**
```bash
kubectl create job --from=cronjob/refresh-db refresh-db-manual -n poke-db
```

### 5. Adding a New Entity Type to the Ingestion Pipeline

**When adding a new entity type (e.g., `Abilities`):**

1. **Create the model** in `../../../api/models` with appropriate GORM tags.
2. **Add to migrations**:
   - If needed by the API server: add to `coreModels()` in `../../../api/models/setup.go`.
   - If only populated by refresh: add to `MigrateAll()` in `../../../api/models/setup.go`.
3. **Create the refresh function** in `api/refresh/refresh-<entity>.go`:
   ```go
   func (r RefreshDB) refreshAbilities() error {
       abilities, err := pokeapi.Resource("ability", 0, 100)
       // ... fetch, transform, upsert
   }
   ```
4. **Register in `Run()`** in `../../../api/refresh/refresh-db.go`:
   - Place it after its dependencies and before its dependents.
   - Decide whether errors should abort the run (only types should).
5. **Add API endpoint** if the entity should be queryable:
   - Create controller in `../../../api/controllers`.
   - Create routes in `api/routes/<entity>routes/`.
   - Register in `../../../api/routes/setup.go`.
6. **Add frontend integration** if applicable:
   - Raw API function in `../../../frontend/src/query/api`.
   - Query key and options in `../../../frontend/src/query`.
   - Custom hook in `../../../frontend/src/query/hooks`.

### 6. Debugging and Database Verification via Postgres MCP

Use the PostgreSQL MCP server (`postgres` toolset) or `psql` to verify data ingestion status and database integrity:

**Key verification queries:**
```sql
-- Check entity counts after ingestion
SELECT 'move_types' AS table_name, count(*) FROM move_types
UNION ALL
SELECT 'items', count(*) FROM items
UNION ALL
SELECT 'locations', count(*) FROM locations
UNION ALL
SELECT 'pokemon_species', count(*) FROM pokemon_species
UNION ALL
SELECT 'moves', count(*) FROM moves
UNION ALL
SELECT 'evolution_chains', count(*) FROM evolution_chains;

-- Verify PostgreSQL 15+ NULLS NOT DISTINCT index on evolution_details
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'evolution_details' AND indexname LIKE '%nulls_not_distinct%';

-- Verify foreign key relations and damage relations
SELECT count(*) FROM move_types WHERE double_damage_to IS NOT NULL AND array_length(double_damage_to, 1) > 0;
```

**Common issues:**

| Symptom | Likely Cause |
|---------|--------------|
| Types fail to ingest | PokeAPI rate limiting or network error |
| Evolution chains fail | PostgreSQL < 15 (missing `NULLS NOT DISTINCT`) |
| Damage relations are empty | Types not yet populated when relations are linked |
| Partial data after refresh | Non-types step failed silently (check logs) |

**Debugging commands:**
```bash
# Check CronJob logs
kubectl logs -n poke-db job/refresh-db-seed
kubectl logs -n poke-db -l app=refresh-db --tail=100

# Check database state via kubectl
kubectl exec -it -n poke-db -l app=postgres -- psql -U postgres -d postgres -c "SELECT count(*) FROM move_types;"
kubectl exec -it -n poke-db -l app=postgres -- psql -U postgres -d postgres -c "SELECT count(*) FROM pokemon_species;"

# Run refresh locally with sample data
cd api
REFRESH_TEST_MODE=true go run ./cmd/refresh-db
```

### 7. Refresh Test Suite

The test suite (`../../../api/refresh/refresh-db_test.go`) runs the full pipeline against a real database:

```bash
# Run refresh tests (sample mode)
cd api
go test -v ./refresh -run TestRefreshDBSuite

# Run refresh tests (full mode — slow)
cd api
FULL_SEED_TEST=true go test -v -timeout 30m ./refresh -run TestRefreshDBSuite
```

The test suite uses `REFRESH_TEST_MODE=true` by default, fetching ~50 records per entity.

### 8. Offline Seed Alternative

For fast local setup without network calls, use the SQL dump:

```bash
# From repo root
psql -h localhost -U postgres -d pokedb -f api/seed/mock-dump.sql
```

This is the recommended method for local development — it's instant and doesn't depend on PokeAPI availability.

---

## Key Constraints

- **Types failure aborts the entire run** — all other steps are best-effort.
- **Step order matters** — types must run before any step that references them.
- **`-if-empty` checks `move_types` table** — if rows exist, the entire refresh is skipped.
- **Both binaries are in the API image** — `poke-api` and `refresh-db` share the same Docker image.
- **PostgreSQL 15+ is required** — evolution details use `NULLS NOT DISTINCT` unique index.
- **PokeAPI has no official rate limit documentation** — the full seed makes extensive sequential calls and may take 10-15 minutes.
- **The API server does not ingest data** — ingestion is exclusively the refresh binary's responsibility.
