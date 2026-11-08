---
name: k8s-gitops-deployment
description: Use when working with Kubernetes manifests, ArgoCD applications, Kustomize overlays, preview environments, or the CI-driven GitOps deployment flow. Covers creating previews, troubleshooting sync failures, managing overlays, and understanding the release pipeline.
---
# Kubernetes GitOps Deployment Protocol

## Context
- **Repository**: `../../../k8s` contains all Kubernetes manifests and ArgoCD configuration.
- **Structure**: Kustomize base (`../../../k8s/base`) + overlays (`k8s/overlays/{local,prod,preview}`).
- **Deployment Engine**: ArgoCD Application for production (`../../../k8s/apps/argocd-prod.yaml`), ApplicationSet for per-PR previews (`k8s/apps/argocd-preview-appset.yaml`).
- **Namespaces**: Production = `poke-db`, Local = `poke-db-local`, Preview = `poke-db-pr-<N>`.
- **Registry**: GHCR — `ghcr.io/jacobpotter/poke-db-api` and `ghcr.io/jacobpotter/poke-db-frontend`.

---

## Directory Structure

```
k8s/
├── base/
│   ├── api.yaml                    # API Deployment, Service, ConfigMap, Secret
│   ├── frontend.yaml               # Frontend Deployment and Service (nginx)
│   ├── postgres.yaml               # Postgres PVC, Secret, ConfigMap, Deployment, Service
│   ├── refresh-db-cronjob.yaml     # Nightly PokeAPI refresh (CronJob)
│   ├── refresh-db-seed-hook.yaml   # ArgoCD PostSync hook: seeds empty databases
│   └── kustomization.yaml
├── overlays/
│   ├── local/kustomization.yaml    # namespace: poke-db-local, imagePullPolicy: IfNotPresent
│   ├── prod/kustomization.yaml     # namespace: poke-db, image tags pinned by CI (sha-<short>)
│   └── preview/kustomization.yaml  # namespace/tags set per-PR by ApplicationSet
└── apps/
    ├── argocd-notifications-cm.yaml           # Notification triggers and templates
    ├── argocd-notifications-secret.example.yaml # Example secret for GitHub App credentials
    ├── argocd-prod.yaml                       # ArgoCD Application (production)
    └── argocd-preview-appset.yaml             # ApplicationSet: one preview per PR labelled "preview"
```

---

## Execution Steps

### 1. Manifest Modifications — Always Edit Git-Tracked Files

- **NEVER** run `kubectl apply` directly on the cluster for application resources.
- All changes to Deployments, Services, ConfigMaps, Secrets, CronJobs, or Jobs must be made by editing the manifests under `../../../k8s/base` or `k8s/overlays/`.
- Base manifests (`../../../k8s/base`) define the default resources. Overlays patch or replace values per environment.
- When adding a new resource (e.g., a HorizontalPodAutoscaler), create it in `../../../k8s/base` and add it to `k8s/base/kustomization.yaml`.

### 2. Kustomize Overlay Conventions

- **`overlays/local`**: Used by `../../../scripts/local-dev.sh`. Patches `imagePullPolicy` to `IfNotPresent` for all Deployments, Jobs, and CronJobs. Namespace is `poke-db-local`.
- **`overlays/prod`**: Namespace `poke-db`. Image tags are pinned to `sha-<short>` and committed by the CI `deploy-prod` job. **Do not manually edit image tags here** — the CI workflow updates them.
- **`overlays/preview`**: Minimal overlay; namespace and image tags are set per-PR by the ApplicationSet template.

### 3. ArgoCD Production Application

- `../../../k8s/apps/argocd-prod.yaml` deploys `k8s/overlays/prod` into namespace `poke-db`.
- Sync policy: `automated` with `prune: true` and `selfHeal: true`.
- Source: `targetRevision: main`, path `../../../k8s/overlays/prod`.
- ArgoCD reconciles automatically when CI commits new image tags to `overlays/prod`.

### 4. Preview Environments (Per-PR)

- `../../../k8s/apps/argocd-preview-appset.yaml` creates one ArgoCD Application per open PR labelled `preview`.
- Each preview gets:
  - Namespace: `poke-db-pr-<N>`
  - Images: `ghcr.io/jacobpotter/poke-db-{api,frontend}:pr-<N>`
  - Source revision: the PR's `head_sha`
  - Own Postgres instance (seeded by the PostSync hook)
- To create a preview: add the `preview` label to the PR. ArgoCD creates the environment within ~5 minutes.
- To delete a preview: remove the `preview` label or close the PR. Then manually clean up: `kubectl delete ns poke-db-pr-<N>`.

### 5. Release Flow

1. **PR opened**: CI builds and pushes `:pr-<N>` images to GHCR.
2. **`preview` label added**: ArgoCD ApplicationSet creates `poke-db-pr-<N>` namespace with its own stack.
3. **PR merged to `main`**: CI pushes `:sha-<short>` and `:latest` tags. The `deploy-prod` job commits the `sha-<short>` tag into `../../../k8s/overlays/prod/kustomization.yaml` with `[skip ci]`.
4. **ArgoCD syncs**: Production automatically rolls out the new images.

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
- Configured in `../../../k8s/apps/argocd-notifications-cm.yaml` with triggers for sync-running, sync-succeeded, sync-failed, and health-degraded.
- Requires a GitHub App with **Commit statuses: Read and write** permission.
- Secret `argocd-notifications-secret` in the `argocd` namespace holds the GitHub App credentials.

### 8. Diagnostics & Verification via Kubernetes MCP and CLI

Leverage the Kubernetes MCP server (`kubernetes` toolset) or `kubectl` for real-time cluster inspection:

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
- Inspect live manifests and diff applied cluster state against Kustomize overlays in `../../../k8s/overlays`.
- Inspect ArgoCD Application status conditions (`Synced`, `Healthy`, `Degraded`, `Progressing`).

### 9. Namespace Safety & Finalizer Management

- Always specify the target namespace explicitly (`-n poke-db`, `-n poke-db-local`, `-n poke-db-pr-<N>`) in all commands and MCP queries to avoid modifying or reading the wrong environment.
- If an ephemeral preview namespace (e.g. `poke-db-pr-<N>`) is stuck in `Terminating`, check for hanging finalizers on custom resources or PVCs before attempting raw metadata patching.

### 10. Local Kubernetes Development

Use `../../../scripts/local-dev.sh` for local cluster development:
```bash
scripts/local-dev.sh up             # Build images, deploy, seed
scripts/local-dev.sh port-forward   # Forward ports (3000, 8080, 5432)
scripts/local-dev.sh down           # Tear down
```

---

## Key Constraints

- **Never manually edit `../../../k8s/overlays/prod/kustomization.yaml` image tags** — the CI `deploy-prod` job manages them.
- **Never use `:latest` for production** — only `sha-<short>` tags are deployed.
- **Base images in `../../../k8s/base` use `:latest`** — overlays override them with specific tags.
- **The refresh binary is bundled in the API image** — both `poke-api` and `refresh-db` are built in the same Dockerfile (`../../../api/Dockerfile`).
- **Postgres has no readiness probe** — the seed hook uses an init container to wait for connectivity.
