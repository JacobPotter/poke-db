---
name: k8s-argocd
description: Guidelines for Kubernetes and ArgoCD local development, including manifest-based workflows, ArgoCD compliance, and namespace safety.
---

# Kubernetes & ArgoCD Local Development Protocol

## Context
- Infrastructure: Kubernetes manifests (or Helm/Kustomize)
- Deployment Engine: ArgoCD tracking a Git repository
- Environment: Local cluster running via `kind` / `minikube`

## Execution Steps

1. Infrastructure Modifications:
   - NEVER suggest running `kubectl apply` directly for long-term application resources.
   - All changes to deployments, services, ingress, configmaps, or secrets must be made by modifying the manifests in the git repository tracking folder (e.g., `./k8s/` or `./charts/`).

2. ArgoCD Compliance:
   - When modifying an ArgoCD Application manifest, ensure target revisions and destination namespaces match local cluster expectations.
   - If a Git branch change is required in the ArgoCD application spec, verify that the remote HEAD reference is valid and cleanly reachable. Do not leave the Application spec in an unresolvable state.

3. Namespace & Context Safety:
   - Before executing any read-only `kubectl` inspection commands (`kubectl logs`, `kubectl get pods`), explicitly append the target namespace or specify the local context to avoid polluting or reading the wrong environment.
   - If a namespace stuck in `Terminating` is encountered, check for hanging finalizers on custom resources before attempting raw metadata patching.
