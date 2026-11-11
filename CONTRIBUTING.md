# Contributing to PokeDB

Thank you for your interest in contributing to **PokeDB**! Whether you are fixing a bug, adding new features, improving documentation, or creating new tests, we welcome your contributions.

Please review this guide before submitting your pull request.

---

## Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all contributors. Please treat everyone with respect, kindness, and empathy. Harassment, discrimination, or abusive behavior of any kind will not be tolerated.

---

## Development & Branching Workflow

1. **Fork or Clone**:
   Clone the repository and create your feature branch from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/your-feature-name
   ```
2. **Branch Naming Conventions**:
   - `feat/<description>` — New features or capabilities
   - `fix/<description>` — Bug fixes
   - `docs/<description>` — Documentation updates
   - `refactor/<description>` — Code refactoring without behavior changes
   - `test/<description>` — Test additions or improvements
   - `chore/<description>` — Build, CI, dependencies, or tooling updates

3. **Conventional Commits**:
   We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
   - `feat: add pokemon stat radar chart`
   - `fix: correct evolution chain trigger condition check`
   - `docs: update backend API route reference in README`
   - `test: add unit tests for MoveTypeContext`
   - `chore: bump Go and Node dependencies`

---

## Pre-PR Validation Checklist

Before opening a pull request, ensure all validation checks pass locally:

### 1. Backend API (`/api`)
```bash
cd api

# 1. Compile all packages
go build -v ./...

# 2. Run backend test suite (requires PostgreSQL or scripts/test-db.sh)
go test -v ./...

# 3. If you changed API controller route annotations or models, regenerate Swagger docs:
swag init
```

### 2. Frontend Application (`/frontend`)
```bash
cd frontend

# 1. Run linter
npm run lint

# 2. Typecheck and build production bundle
npm run build

# 3. Run frontend unit and component tests (Vitest with Playwright Chromium browser)
npx vitest run
```

---

## Pull Request & Review Process

1. **Open a PR**: Push your branch to GitHub and open a pull request targeting the `main` branch.
2. **CI Automation**: GitHub Actions (`.github/workflows/ci.yml`) will automatically run backend tests, frontend tests, linting, and build validation. It will also build and push container images to GitHub Container Registry (GHCR) tagged with `:pr-<N>`.
3. **Ephemeral Preview Environments (`preview` label)**:
   - If your changes need visual verification or end-to-end testing in a Kubernetes environment, add the **`preview`** label to your PR.
   - The ArgoCD ApplicationSet in [`cluster-gitops`](https://github.com/JacobPotter/cluster-gitops) will automatically
     spin up an isolated preview environment in namespace `poke-db-pr-<N>` deploying your PR's container images.
   - Removing the `preview` label or closing the PR automatically destroys the preview environment.
4. **Code Review**: Address any feedback or requested changes from reviewers.
5. **Merge**: Once approved and all CI checks pass, your PR will be merged into `main`. The `deploy-prod` pipeline will
   dispatch a promotion event to `cluster-gitops` to update `apps/poke-db/overlays/prod/kustomization.yaml` and trigger
   production rollout via ArgoCD.

---

## Related Documentation

- [Project Overview & Quickstart](README.md)
- [System Architecture](ARCHITECTURE.md)
- [Backend Development Guide](api/README.md)
- [Frontend Development Guide](frontend/README.md)
- [Kubernetes & GitOps Repository](https://github.com/JacobPotter/cluster-gitops)
