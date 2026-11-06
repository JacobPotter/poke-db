# Kubernetes & GitOps (ArgoCD) Deployment

This directory contains the Kubernetes manifests and ArgoCD application configurations for deploying PokeDB across isolated staging and production environments on a Kubernetes / Kind cluster.

---

## Architecture & Directory Structure

```
k8s/
├── base/
│   ├── api.yaml                 # Namespace-agnostic API Deployment and Service
│   ├── frontend.yaml            # Namespace-agnostic Frontend Deployment and Service
│   ├── postgres.yaml            # Namespace-agnostic Postgres PVC, Secret, ConfigMap, Deployment, Service
│   └── kustomization.yaml       # Base Kustomize resource list
├── overlays/
│   ├── staging/
│   │   └── kustomization.yaml   # Staging overlay (namespace: poke-db-staging, tag: :staging)
│   └── prod/
│       └── kustomization.yaml   # Production overlay (namespace: poke-db, tag: :latest)
└── apps/
    ├── argocd-staging.yaml      # ArgoCD Application for poke-db-staging
    └── argocd-prod.yaml         # ArgoCD Application for poke-db (production)
```

---

## 1. GitHub Container Registry (GHCR) Visibility

When GitHub Actions builds and pushes container images to GHCR:
- Staging images: `ghcr.io/jacobpotter/poke-db-api:staging` and `ghcr.io/jacobpotter/poke-db-frontend:staging` (built on PRs targeting `main`).
- Production images: `ghcr.io/jacobpotter/poke-db-api:latest` and `ghcr.io/jacobpotter/poke-db-frontend:latest` (built on merge/push to `main`).
- By default, GitHub may set newly created packages to **Private**.
- To allow the Kind cluster to pull images anonymously without creating and configuring `imagePullSecrets`:
  1. Navigate to your GitHub profile or repository -> **Packages**.
  2. Select `poke-db-api` -> **Package settings** -> **Danger Zone** -> **Change package visibility** -> Select **Public**.
  3. Select `poke-db-frontend` -> **Package settings** -> **Danger Zone** -> **Change package visibility** -> Select **Public**.

---

## 2. Deploying with ArgoCD

Apply the ArgoCD Application manifests to your cluster's `argocd` namespace:

```bash
# Deploy both staging and production ArgoCD applications
kubectl apply -f k8s/apps/argocd-staging.yaml
kubectl apply -f k8s/apps/argocd-prod.yaml
```

ArgoCD will automatically create the `poke-db-staging` and `poke-db` namespaces, track the `main` branch, and reconcile changes automatically.

---

## 3. Manual Deployment (Direct kubectl / Kustomize)

To deploy or preview manifests manually without ArgoCD:

```bash
# Preview rendered manifests
kubectl kustomize k8s/overlays/staging
kubectl kustomize k8s/overlays/prod

# Apply directly to cluster
kubectl apply -k k8s/overlays/staging
kubectl apply -k k8s/overlays/prod
```

---

## 4. Verification & Diagnostics

### Check Pod and Workload Health

```bash
# Check resources in staging
kubectl get all -n poke-db-staging
kubectl rollout status deployment/api -n poke-db-staging
kubectl rollout status deployment/frontend -n poke-db-staging
kubectl rollout status deployment/postgres -n poke-db-staging

# Check resources in production
kubectl get all -n poke-db
kubectl rollout status deployment/api -n poke-db
kubectl rollout status deployment/frontend -n poke-db
kubectl rollout status deployment/postgres -n poke-db

# View container logs
kubectl logs -n poke-db-staging -l app=api -f
kubectl logs -n poke-db -l app=api -f
```

### Check ArgoCD Application Status

```bash
# Check ArgoCD application status via CLI
argocd app get poke-db-staging
argocd app get poke-db-prod

# Manually trigger synchronization
argocd app sync poke-db-staging
argocd app sync poke-db-prod
```
