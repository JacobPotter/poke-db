---
name: k8s-argocd
description: Guidelines for Kubernetes and ArgoCD GitOps workflows, manifest-based modifications, ApplicationSet previews, and namespace safety. Cross-references k8s-gitops-deployment.
---

# Kubernetes & ArgoCD Local Development Protocol

## Context
- **Infrastructure**: Kubernetes Kustomize manifests (`../../../k8s/base`, `k8s/overlays/`)
- **Deployment Engine**: ArgoCD tracking the Git repository (`../../../k8s/apps`)
- **Environment**: Local cluster via Kind/Minikube or production/preview namespaces
- **Primary Reference**: See `../../../.claude` for comprehensive release flow and directory structure.

## Execution Steps

1. Infrastructure Modifications:
   - **NEVER** run `kubectl apply` directly for long-term application resources.
   - All changes to deployments, services, ingress, configmaps, or secrets must be made by modifying the manifests in the git repository tracking folder (`../../../k8s/base` or `k8s/overlays/`).

2. ArgoCD Compliance & Sync:
   - When modifying an ArgoCD Application manifest (`../../../k8s/apps/argocd-prod.yaml` or `argocd-preview-appset.yaml`), ensure target revisions and destination namespaces match cluster expectations.
   - Verify that remote HEAD references and branches in Application specs are reachable and valid.

3. Diagnostics with Kubernetes MCP & CLI:
   - Use Kubernetes MCP (`kubernetes` toolset) or `kubectl` with explicit namespace flags (`-n poke-db`, `-n poke-db-local`, `-n poke-db-pr-<N>`).
   - Check pod logs, rollout status, and PostSync seed hook status (`job/refresh-db-seed`).

4. Namespace & Context Safety:
   - Always append the target namespace explicitly to avoid reading or mutating the wrong cluster context.
   - If a namespace is stuck in `Terminating`, inspect hanging finalizers on custom resources or PVCs before attempting metadata patches.
