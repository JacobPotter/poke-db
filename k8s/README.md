# Kubernetes & GitOps (ArgoCD) Deployment

This directory contains the Kubernetes manifests and ArgoCD configuration for PokeDB: one production environment, plus an on-demand preview environment for each labelled pull request.

---

## Architecture & Directory Structure

```
k8s/
├── base/
│   ├── api.yaml                    # API Deployment, Service, ConfigMap, Secret
│   ├── frontend.yaml               # Frontend Deployment and Service
│   ├── httproute.yaml              # Envoy Gateway HTTPRoute to frontend
│   ├── postgres.yaml               # Postgres PVC, Secret, ConfigMap, Deployment, Service
│   ├── refresh-db-cronjob.yaml     # Nightly PokeAPI -> Postgres refresh (CronJob)
│   ├── refresh-db-seed-hook.yaml   # Argo CD PostSync hook: seeds an empty database
│   └── kustomization.yaml
├── overlays/
│   ├── local/
│   │   └── kustomization.yaml      # namespace: poke-db-local, imagePullPolicy: Never
│   ├── prod/
│   │   └── kustomization.yaml      # namespace: poke-db, image tags pinned by CI (sha-<short>)
│   └── preview/
│       └── kustomization.yaml      # no namespace/tags; set per PR by the ApplicationSet
└── apps/
    ├── argocd-notifications-cm.yaml           # Notification service, templates, triggers
    ├── argocd-notifications-secret.example.yaml # Example secret template for GitHub App credentials
    ├── argocd-prod.yaml                       # ArgoCD Application for poke-db (production)
    └── argocd-preview-appset.yaml             # ApplicationSet: one preview env per PR labelled "preview"
```

### Release & Image Promotion Flow

```
[Local Development]
   │
   ├─► `scripts/local-dev.sh up` (Local build + containerd sync + imagePullPolicy: Never)
   │
[Pull Request]
   │
   ├─► Push branch & open PR
   ├─► GitHub Actions CI (.github/workflows/ci.yml):
   │     ├─ Runs backend & frontend test suites
   │     └─ Publishes: ghcr.io/jacobpotter/poke-db-{api,frontend}:pr-<N>
   ├─► Add `preview` label to PR
   └─► ArgoCD ApplicationSet (k8s/apps/argocd-preview-appset.yaml):
         ├─ Deploys k8s/overlays/preview to namespace `poke-db-pr-<N>`
         ├─ Overrides image tags to `pr-<N>`
         └─ PostSync hook seeds database on first deployment
   │
[Production Deployment]
   │
   ├─► Merge PR to `main`
   ├─► GitHub Actions CI:
   │     ├─ Runs full test suite
   │     ├─ Publishes: ghcr.io/jacobpotter/poke-db-{api,frontend}:{latest,sha-<short>,<short>}
   │     └─ `deploy-prod` job:
   │           ├─ Uses GitHub App token to update `k8s/overlays/prod/kustomization.yaml`
   │           ├─ Pins images to `sha-<short>`
   │           └─ Commits and pushes `chore(deploy): prod -> sha-<short> [skip ci]` to `main`
   └─► ArgoCD Application (k8s/apps/argocd-prod.yaml):
         ├─ Detects commit on `main` branch
         ├─ Synchronizes `k8s/overlays/prod` to namespace `poke-db`
         └─ Rolls out updated pods running immutable `sha-<short>` container images
```

1. **Pull Request & Preview Environments**:
   - Opening or updating a PR triggers GitHub Actions CI (`.github/workflows/ci.yml`), which builds and publishes container images tagged with `:pr-<N>` to GHCR.
   - Adding the **`preview`** label to the PR instructs the ArgoCD ApplicationSet (`k8s/apps/argocd-preview-appset.yaml`) to instantiate a preview environment in namespace `poke-db-pr-<N>` with images `ghcr.io/jacobpotter/poke-db-{api,frontend}:pr-<N>`.
   - When the PR is closed or the `preview` label is removed, ArgoCD automatically cleans up the Application and its resources.
2. **Production Release**:
   - Merging changes to the `main` branch triggers CI to publish `:latest` and `:sha-<short>` tags.
   - The `deploy-prod` workflow job automatically updates the image tags in `k8s/overlays/prod/kustomization.yaml` to the new `sha-<short>` digest and commits back to `main`.
   - The ArgoCD production Application (`k8s/apps/argocd-prod.yaml`) syncs the updated overlay and deploys the new images to the `poke-db` namespace.
3. **Deploying Routing Fixes to Remote Environments**:
   - To deploy the frontend routing and Nginx proxy fixes to preview or production clusters:
     1. Commit the changes and push the branch to GitHub.
     2. Open a Pull Request and apply the `preview` label to test in an ephemeral preview environment.
     3. Once validated, merge the PR into `main` to trigger automated production tagging and ArgoCD rollout.

---

## 1. GitHub Container Registry (GHCR) Visibility

- By default, GitHub may set newly created packages to **Private**.
- To let the cluster pull images anonymously, without `imagePullSecrets`:
  1. Go to your GitHub profile or repository -> **Packages**.
  2. For `poke-db-api` and `poke-db-frontend`: **Package settings** -> **Danger Zone** -> **Change package visibility** -> **Public**.

---

## 2. Deploying with ArgoCD

```bash
kubectl apply -f k8s/apps/argocd-notifications-cm.yaml
kubectl apply -f k8s/apps/argocd-prod.yaml
kubectl apply -f k8s/apps/argocd-preview-appset.yaml
```

The PR generator calls the GitHub API. Configure `tokenRef` in the ApplicationSet to avoid rate limits; it's required if the repo is private.

### Database refresh

- **Seed**: the `refresh-db-seed` PostSync hook runs `/app/refresh-db -if-empty` after every sync, and does nothing if the database already has data.
- **Nightly**: the `refresh-db` CronJob does a full refresh at 00:00 UTC.
- **Manual run**:
  ```bash
  kubectl create job --from=cronjob/refresh-db refresh-db-manual -n poke-db
  ```

---

## 3. Manual Deployment (Direct kubectl / Kustomize)

```bash
kubectl kustomize k8s/overlays/prod      # preview rendered manifests
kubectl apply -k k8s/overlays/prod
```

---

## 4. Verification & Diagnostics

```bash
kubectl get all -n poke-db
kubectl rollout status deployment/api -n poke-db
kubectl logs -n poke-db -l app=api -f
kubectl logs -n poke-db job/refresh-db-seed
kubectl get cronjob,jobs -n poke-db

argocd app get poke-db-prod
argocd app sync poke-db-prod
argocd appset get poke-db-previews
argocd app list | grep poke-db-pr-
```

---

## 5. Argo CD GitHub Notifications

Argo CD notifications are integrated with GitHub to post commit status checks (`pending`, `success`, `failure`) directly to PRs and branch commits under the `continuous-delivery/<app-name>` context.

### GitHub App Configuration & Permissions
1. Create a GitHub App (or use an existing deployment bot App) in your GitHub organization / account.
2. Grant the following **Repository permissions**:
   - **Commit statuses**: `Read and write` (to post synchronization and health state status checks)
   - **Metadata**: `Read-only` (default required permission)
3. Generate and download a private key (`.pem`) for the App.
4. Install the App on the `JacobPotter/poke-db` repository and note the **App ID** and **Installation ID**.

### Secret Configuration
Create the `argocd-notifications-secret` in the `argocd` namespace with the GitHub App credentials:

```bash
kubectl create secret generic argocd-notifications-secret \
  -n argocd \
  --from-literal=github-app-id="<GITHUB_APP_ID>" \
  --from-literal=github-installation-id="<GITHUB_INSTALLATION_ID>" \
  --from-file=github-privateKey=/path/to/private-key.pem
```

Alternatively, apply a populated copy of `k8s/apps/argocd-notifications-secret.example.yaml`.

### Notification Triggers & Commit Status States
- **`pending`**: Emitted when sync is initiated (`app.status.operationState.phase in ['Running']`).
- **`success`**: Emitted when sync succeeds and resources are healthy (`app.status.operationState.phase in ['Succeeded'] and app.status.health.status == 'Healthy'`).
- **`failure`**: Emitted when sync fails or resource health is degraded (`phase in ['Error', 'Failed']` or `health.status == 'Degraded'`).

### Verification & Diagnostics
```bash
# Check notification controller logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-notifications-controller -f

# Verify notifications ConfigMap
kubectl get cm argocd-notifications-cm -n argocd -o yaml

# Inspect GitHub commit status checks via GitHub CLI
gh api repos/JacobPotter/poke-db/commits/<commit-sha>/statuses
```

---

## Related Documentation

- [Project Overview & Quickstart](../README.md)
- [System Architecture](../ARCHITECTURE.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Backend Development Guide](../api/README.md)
- [Frontend Development Guide](../frontend/README.md)
