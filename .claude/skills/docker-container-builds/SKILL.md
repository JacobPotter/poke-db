---
name: docker-container-builds
description: Use when working with Docker images, the CI build-and-push workflow, image tagging strategy, or loading images into local clusters (Kind/Minikube). Covers the API and frontend Dockerfiles, GHCR publishing, and PR-specific image tags.
---
# Docker Container Builds Protocol

## Context
- **API image**: `api/Dockerfile` — multi-stage Go build → Debian slim runtime.
- **Frontend image**: `frontend/Dockerfile` — multi-stage Node build → nginx runtime.
- **Registry**: GitHub Container Registry (GHCR) — `ghcr.io/jacobpotter/poke-db-{api,frontend}`.
- **Tagging**: `:pr-<N>` on PRs, `:sha-<short>` and `:latest` on merge to `main`.

---

## Execution Steps

### 1. API Dockerfile — Multi-Stage Build

**File**: `api/Dockerfile`

```dockerfile
# Stage 1: Build
FROM golang:1.23-bookworm AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -buildvcs=false -o poke-api ./main.go \
    && go build -buildvcs=false -o refresh-db ./cmd/refresh-db

# Stage 2: Runtime
FROM debian:bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/poke-api /app/poke-api
COPY --from=builder /app/refresh-db /app/refresh-db
EXPOSE 8080
CMD ["/app/poke-api"]
```

**Key points:**
- **Two binaries in one image**: Both `poke-api` (the API server) and `refresh-db` (the ingestion job) are built and bundled.
- **`-buildvcs=false`**: Disables VCS info in the binary to avoid build issues in CI.
- **Runtime image**: `debian:bookworm-slim` with only `ca-certificates` (for HTTPS calls to PokeAPI from the refresh job).
- **Default CMD**: Runs the API server. The refresh job is invoked via Kubernetes CronJob/Job with an overridden command.

### 2. Frontend Dockerfile — Multi-Stage Build

**File**: `frontend/Dockerfile`

```dockerfile
# Stage 1: Build
FROM node:18-bookworm AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Key points:**
- **Build stage**: `node:18-bookworm` runs `npm ci` and `npm run build` (which includes `tsc -b` typecheck).
- **Runtime**: `nginx:1.27-alpine` serves the static files.
- **nginx.conf**: Custom config (`frontend/nginx.conf`) — `location /api/` proxies to `http://api:8080/`. The trailing slash strips the `/api/` prefix so Go routes resolve under `/api/v1`.

### 3. CI Image Tagging Strategy

**Workflow**: `.github/workflows/_publish-image.yml` (called from `ci.yml`)

| Event | Tags Pushed | Used By |
|-------|-------------|---------|
| **Pull Request** | `:pr-<N>` | Preview environments (ApplicationSet) |
| **Push to main** | `:sha-<short>`, `:latest` | Production (`sha-<short>`), local/manual (`latest`) |

**Tag format:**
- `:pr-42` — built from PR #42 head commit.
- `:sha-b6a6a6b` — built from commit `b6a6a6b...` on main (7-character short SHA).
- `:latest` — always points to the last main build.

**Important**: Production never deploys from `:latest`. The `deploy-prod` CI job commits the `:sha-<short>` tag into `k8s/overlays/prod/kustomization.yaml`, and ArgoCD deploys from that committed overlay.

### 4. CI Pipeline Flow

```
PR or push to main
  → changes (path filter)
    → backend tests (if api/ changed)
    → frontend tests (if frontend/ changed)
  → publish (both images always)
    → deploy-prod (push to main only)
      → commits sha-<short> to k8s/overlays/prod
      → ArgoCD syncs production
```

**Reusable workflows**: Job bodies are in `_*.yml` files (e.g., `_publish-image.yml`, `_deploy-prod.yml`). `ci.yml` only defines the job graph and triggers.

### 5. Local Image Building

**Using `scripts/local-dev.sh`:**
```bash
scripts/local-dev.sh up    # Builds images, deploys to local K8s, seeds DB
scripts/local-dev.sh build # Builds images only
```

The script:
1. Builds both images with `docker build -t ghcr.io/jacobpotter/poke-db-{api,frontend}:latest`.
2. Detects Kind or Minikube and loads images into the cluster:
   - **Kind**: `kind load docker-image <image>`
   - **Minikube**: `minikube image load <image>`
3. Applies `k8s/overlays/local` (patches `imagePullPolicy: IfNotPresent`).
4. Seeds the database with `api/seed/mock-dump.sql`.

**Manual build commands:**
```bash
# Build API image
docker build -t ghcr.io/jacobpotter/poke-db-api:latest ./api

# Build Frontend image
docker build -t ghcr.io/jacobpotter/poke-db-frontend:latest ./frontend

# Load into Kind
kind load docker-image ghcr.io/jacobpotter/poke-db-api:latest
kind load docker-image ghcr.io/jacobpotter/poke-db-frontend:latest
```

### 6. GHCR Visibility

- GHCR packages must be set to **Public** for the cluster to pull images without `imagePullSecrets`.
- To change visibility: GitHub → Packages → `poke-db-api` / `poke-db-frontend` → Package settings → Change visibility → Public.
- If packages are private, you must configure `imagePullSecrets` in the K8s manifests.

### 7. Modifying Dockerfiles

**When modifying the API Dockerfile:**
- Keep both binaries (`poke-api` and `refresh-db`) in the build.
- The runtime image only needs `ca-certificates` for HTTPS.
- Use `-buildvcs=false` to avoid VCS-related build failures.

**When modifying the Frontend Dockerfile:**
- `npm run build` includes typechecking — if types are broken, the Docker build fails.
- The nginx config (`frontend/nginx.conf`) must proxy `/api/` to the Go API.
- Keep the nginx version pinned (currently `1.27-alpine`).

### 8. Image Size Considerations

| Image | Base | Approximate Size |
|-------|------|-----------------|
| API | `debian:bookworm-slim` + Go binary | ~50-80 MB |
| Frontend | `nginx:1.27-alpine` + dist | ~30-50 MB |

The multi-stage builds ensure only the compiled artifacts are in the final image, not the build toolchain.

---

## Key Constraints

- **Both binaries in the API image** — `poke-api` and `refresh-db` share the same image.
- **Production uses `sha-<short>` tags only** — never `:latest`.
- **`:latest` is for local/manual use** — committed by CI but not deployed to prod.
- **GHCR packages must be public** — or configure `imagePullSecrets`.
- **Frontend build includes typecheck** — `npm run build` runs `tsc -b` first.
- **nginx proxy_pass trailing slash** — strips `/api/` prefix so Go routes resolve correctly.
- **`-buildvcs=false` is required** — prevents VCS info build failures in CI.
