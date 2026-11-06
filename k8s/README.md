# Kubernetes & GitOps (ArgoCD) Deployment

This directory contains the Kubernetes manifests and ArgoCD configuration for PokeDB: one production environment, plus an on-demand preview environment for each labelled pull request.

---

## Architecture & Directory Structure

```
k8s/
├── base/
│   ├── api.yaml                    # API Deployment, Service, ConfigMap, Secret
│   ├── frontend.yaml               # Frontend Deployment and Service
│   ├── postgres.yaml               # Postgres PVC, Secret, ConfigMap, Deployment, Service
│   ├── refresh-db-cronjob.yaml     # Nightly PokeAPI -> Postgres refresh (CronJob)
│   ├── refresh-db-seed-hook.yaml   # Argo CD PostSync hook: seeds an empty database
│   └── kustomization.yaml
├── overlays/
│   ├── prod/
│   │   └── kustomization.yaml      # namespace: poke-db, image tags pinned by CI (sha-<short>)
│   └── preview/
│       └── kustomization.yaml      # no namespace/tags; set per PR by the ApplicationSet
└── apps/
    ├── argocd-prod.yaml            # ArgoCD Application for poke-db (production)
    └── argocd-preview-appset.yaml  # ApplicationSet: one preview env per PR labelled "preview"
```

### Release flow

1. Open a PR. CI builds and pushes `ghcr.io/jacobpotter/poke-db-{api,frontend}:pr-<N>`.
2. Add the **`preview`** label to the PR. Within about 5 minutes, ArgoCD creates `poke-db-pr-<N>` with its own Postgres, seeded by the PostSync hook.
3. Merge. CI pushes `sha-<short>` and `latest`. The `deploy-prod` job then commits the `sha-<short>` tag into `overlays/prod` (`[skip ci]`), and ArgoCD rolls it out.
4. When the PR is closed or unlabelled, the preview Application is deleted. Remove the leftover namespace with `kubectl delete ns poke-db-pr-<N>`.

Nothing deploys from `latest`; it is kept only for manual and local use.

---

## 1. GitHub Container Registry (GHCR) Visibility

- By default, GitHub may set newly created packages to **Private**.
- To let the cluster pull images anonymously, without `imagePullSecrets`:
  1. Go to your GitHub profile or repository -> **Packages**.
  2. For `poke-db-api` and `poke-db-frontend`: **Package settings** -> **Danger Zone** -> **Change package visibility** -> **Public**.

---

## 2. Deploying with ArgoCD

```bash
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
