---
name: k8s-gitops-deployment
description: Use when working with Kubernetes manifests, ArgoCD applications, Kustomize overlays, preview environments, or the CI-driven GitOps deployment flow in poke-db-gitops. Covers creating previews, troubleshooting sync failures, managing overlays, and understanding the release pipeline.
---
# Kubernetes GitOps Deployment Protocol

## Context
- **Repository**: [`JacobPotter/poke-db-gitops`](https://github.com/JacobPotter/poke-db-gitops) contains all Kubernetes manifests, ArgoCD configuration, and promotion workflows.
- **Structure**: Kustomize base (`base/`) + overlays (`overlays/{prod,preview}`).
- **Deployment Engine**: ArgoCD Application for production (`apps/argocd-prod.yaml`), ApplicationSet for per-PR previews (`apps/argocd-preview-appset.yaml`).
- **Namespaces**: Production = `poke-db`, Preview = `poke-db-pr-<N>`.
- **Registry**: GHCR — `ghcr.io/jacobpotter/poke-db-api` and `ghcr.io/jacobpotter/poke-db-frontend`.
- **Promotion Pipeline**: Cross-repo `repository_dispatch` event (`promote-prod`) emitted by `poke-db` CI triggers `.github/workflows/promote.yml` in `poke-db-gitops`.
- **SSH Session Requirement**: An SSH session is required to run all commands. The agent should be able to create an SSH session before executing any commands and can prompt the user to enter credentials if needed for the connection.

---

## Directory Structure (`poke-db-gitops`)

```
poke-db-gitops/
├── .github/
│   └── workflows/
│       └── promote.yml               # Automated production promotion via repository_dispatch
├── base/
│   ├── api.yaml                      # API Deployment, Service, ConfigMap, Secret
│   ├── frontend.yaml                 # Frontend Deployment and Service (nginx)
│   ├── httproute.yaml                # Envoy Gateway HTTPRoute
│   ├── postgres.yaml                 # Postgres PVC, Secret, ConfigMap, Deployment, Service
│   ├── refresh-db-cronjob.yaml       # Nightly PokeAPI refresh (CronJob)
│   ├── refresh-db-seed-hook.yaml     # ArgoCD PostSync hook: seeds empty databases
│   └── kustomization.yaml
├── overlays/
│   ├── prod/kustomization.yaml       # namespace: poke-db, image tags pinned by CI (sha-<short>)
│   └── preview/kustomization.yaml    # namespace/tags set per-PR by ApplicationSet
└── apps/
    ├── argocd-notifications-cm.yaml           # Notification triggers and templates
    ├── argocd-notifications-secret.example.yaml # Example secret for GitHub App credentials
    ├── argocd-prod.yaml                       # ArgoCD Application (production)
    └── argocd-preview-appset.yaml             # ApplicationSet: one preview per PR labelled "preview"
```

---

## Execution Steps

### 0. SSH Session Requirement

- **SSH session required**: An SSH session is required to run all commands in this skill (e.g., `kubectl`, `argocd`).
- **Agent SSH capability**: The agent should be able to create and establish an SSH session before executing any commands.
- **Credential prompting**: The agent can prompt the user to enter credentials if needed for the connection.

### 1. Manifest Modifications — Always Edit Git-Tracked Files

- **NEVER** run `kubectl apply` directly on the cluster for application resources.
- All changes to Deployments, Services, ConfigMaps, Secrets, CronJobs, or Jobs must be made by editing manifests in `poke-db-gitops` under `base/` or `overlays/`.
- Base manifests (`base/`) define the default resources. Overlays patch or replace values per environment.
- When adding a new resource (e.g., a HorizontalPodAutoscaler), create it in `base/` and add it to `base/kustomization.yaml`.

### 2. Kustomize Overlay Conventions

- **`overlays/prod`**: Namespace `poke-db`. Image tags are pinned to `sha-<short>` and committed by the `promote.yml` workflow upon `repository_dispatch`. **Do not manually edit image tags here** — the promotion workflow updates them.
- **`overlays/preview`**: Minimal overlay; namespace and image tags are set per-PR by the ApplicationSet template in `apps/argocd-preview-appset.yaml`.

### 3. ArgoCD Production Application

- `apps/argocd-prod.yaml` in `poke-db-gitops` deploys `overlays/prod` into namespace `poke-db`.
- Sync policy: `automated` with `prune: true` and `selfHeal: true`.
- Source: `repoURL: https://github.com/JacobPotter/poke-db-gitops.git`, `targetRevision: main`, `path: overlays/prod`.
- ArgoCD reconciles automatically when `promote.yml` commits new image tags to `overlays/prod`.

### 4. Preview Environments (Per-PR)

- `apps/argocd-preview-appset.yaml` creates one ArgoCD Application per open PR in `JacobPotter/poke-db` labelled `preview`.
- Each preview gets:
  - Namespace: `poke-db-pr-<N>`
  - Images: `ghcr.io/jacobpotter/poke-db-{api,frontend}:pr-<N>`
  - Source: `poke-db-gitops` `overlays/preview`
  - Own Postgres instance (seeded by the PostSync hook)
- To create a preview: add the `preview` label to the PR in `poke-db`. ArgoCD creates the environment within ~5 minutes.
- To delete a preview: remove the `preview` label or close the PR. Then manually clean up: `kubectl delete ns poke-db-pr-<N>`.

### 5. Release Flow

1. **PR opened in `poke-db`**: CI builds and pushes `:pr-<N>` images to GHCR.
2. **`preview` label added**: ArgoCD ApplicationSet creates `poke-db-pr-<N>` namespace with its own stack using `poke-db-gitops` manifests.
3. **PR merged to `main`**: `poke-db` CI pushes `:sha-<short>` and `:latest` tags, then triggers `repository_dispatch` (`promote-prod`) to `poke-db-gitops`.
4. **GitOps promotion workflow**: `promote.yml` in `poke-db-gitops` updates `overlays/prod/kustomization.yaml` with the `sha-<short>` tags and commits to `main`.
5. **ArgoCD syncs**: Production automatically rolls out the new images.

**Nothing deploys from `:latest`** — it is kept only for manual and local use.

### 6. Database Refresh in Kubernetes

- **Seed hook**: `refresh-db-seed` Job (ArgoCD PostSync) runs `/app/refresh-db -if-empty`. It checks if `move_types` table has rows; if so, it skips. This is a no-op on routine syncs.
- **Nightly CronJob**: `refresh-db` runs at 00:00 UTC with `concurrencyPolicy: Forbid`.
- **Manual trigger**:
  ```bash
  kubectl create job --from=cronjob/refresh-db refresh-db-manual -n poke-db
  ```

### 7. ArgoCD GitHub Notifications

- Notifications post commit status checks (`pending`, `success`, `failure`) to PRs and branch commits.
- Configured in `apps/argocd-notifications-cm.yaml` with triggers for sync-running, sync-succeeded, sync-failed, and health-degraded.
- Requires a GitHub App with **Commit statuses: Read and write** permission.
- Secret `argocd-notifications-secret` in the `argocd` namespace holds the GitHub App credentials.

### 8. Diagnostics & Verification via Kubernetes MCP and CLI

An SSH session is required to execute all CLI commands. Ensure an SSH session is created before executing commands. Leverage the Kubernetes MCP server (`kubernetes` toolset) or `kubectl` for real-time cluster inspection:

```bash
# Production status & logs
kubectl get all -n poke-db
kubectl rollout status deployment/api -n poke-db
kubectl logs -n poke-db -l app=api -f
kubectl logs -n poke-db job/refresh-db-seed

# ArgoCD Application status
argocd app get poke-db-prod
argocd app sync poke-db-prod
argocd appset get poke-db-previews
argocd app list | grep poke-db-pr-

# Notifications controller
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-notifications-controller -f
```

**Using Kubernetes MCP:**
- Read pod logs and container restart reasons for failed deployments or PostSync seed jobs.
- Inspect live manifests and diff applied cluster state against Kustomize overlays in `poke-db-gitops`.
- Inspect ArgoCD Application status conditions (`Synced`, `Healthy`, `Degraded`, `Progressing`).

### 9. Namespace Safety & Finalizer Management

- Always specify the target namespace explicitly (`-n poke-db`, `-n poke-db-pr-<N>`) in all commands and MCP queries to avoid modifying or reading the wrong environment.
- If an ephemeral preview namespace (e.g. `poke-db-pr-<N>`) is stuck in `Terminating`, check for hanging finalizers on custom resources or PVCs before attempting raw metadata patching.

---

## Key Constraints

- **SSH session required for all commands** — An SSH session is required to run all commands. The agent should be able to create an SSH session before running any commands (`kubectl`, `argocd`, scripts) and can prompt the user to enter credentials if needed for the connection.
- **Never manually edit `overlays/prod/kustomization.yaml` image tags** — the `promote.yml` workflow manages them.
- **Never use `:latest` for production** — only `sha-<short>` tags are deployed.
- **Base images in `base/` use `:latest`** — overlays override them with specific tags.
- **The refresh binary is bundled in the API image** — both `poke-api` and `refresh-db` are built in the same Dockerfile (`api/Dockerfile`).
- **Postgres has no readiness probe** — the seed hook uses an init container to wait for connectivity.
