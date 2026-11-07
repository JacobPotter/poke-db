#!/usr/bin/env bash
# Local Kubernetes development script for PokeDB.
# Usage:
#   scripts/local-dev.sh up             Build images, deploy to local k8s, wait for readiness & seed
#   scripts/local-dev.sh build          Build container images locally
#   scripts/local-dev.sh deploy         Apply Kustomize local overlay
#   scripts/local-dev.sh seed           Seed Postgres using api/seed/mock-dump.sql
#   scripts/local-dev.sh port-forward   Port-forward Frontend (3000), API (8080), and Postgres (5432)
#   scripts/local-dev.sh down           Tear down the local k8s environment
#   scripts/local-dev.sh status         Show rollout and pod status
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAMESPACE="poke-db-local"
API_IMAGE="ghcr.io/jacobpotter/poke-db-api:latest"
FRONTEND_IMAGE="ghcr.io/jacobpotter/poke-db-frontend:latest"

build_images() {
  echo "==> Building API image (${API_IMAGE}) from local code..."
  docker build -t "${API_IMAGE}" "$ROOT/api"

  echo "==> Building Frontend image (${FRONTEND_IMAGE}) from local code..."
  docker build -t "${FRONTEND_IMAGE}" "$ROOT/frontend"

  # If Kind or Minikube is used, load images into the cluster
  if command -v kind >/dev/null 2>&1 && kind get clusters 2>/dev/null | grep -q .; then
    local kind_cluster
    kind_cluster="${KIND_CLUSTER_NAME:-$(kind get clusters 2>/dev/null | head -n1)}"
    echo "==> Loading images into Kind cluster '${kind_cluster}'..."
    kind load docker-image "${API_IMAGE}" --name "${kind_cluster}"
    kind load docker-image "${FRONTEND_IMAGE}" --name "${kind_cluster}"
  elif command -v minikube >/dev/null 2>&1 && minikube status >/dev/null 2>&1; then
    echo "==> Loading images into Minikube cluster..."
    minikube image load "${API_IMAGE}"
    minikube image load "${FRONTEND_IMAGE}"
  fi
}

deploy_k8s() {
  echo "==> Ensuring namespace '${NAMESPACE}' exists..."
  kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

  echo "==> Applying Kustomize local overlay..."
  kubectl apply -k "$ROOT/k8s/overlays/local"

  # Restart deployments if already present so newly loaded local images are picked up
  echo "==> Triggering rollout restart for local deployments..."
  kubectl rollout restart deployment/api deployment/frontend -n "${NAMESPACE}" 2>/dev/null || true

  echo "==> Waiting for Postgres deployment to be ready..."
  kubectl rollout status deployment/postgres -n "${NAMESPACE}" --timeout=120s

  echo "==> Waiting for API deployment to be ready..."
  kubectl rollout status deployment/api -n "${NAMESPACE}" --timeout=120s

  echo "==> Waiting for Frontend deployment to be ready..."
  kubectl rollout status deployment/frontend -n "${NAMESPACE}" --timeout=120s
}

seed_db() {
  echo "==> Checking and seeding database with mock dump..."
  local pod
  pod="$(kubectl get pod -n "${NAMESPACE}" -l app=postgres -o jsonpath='{.items[0].metadata.name}')"

  if [ -z "${pod}" ]; then
    echo "Error: Postgres pod not found in namespace ${NAMESPACE}" >&2
    exit 1
  fi

  # Wait for postgres to accept connections
  kubectl exec -i -n "${NAMESPACE}" "${pod}" -c postgres -- sh -c \
    'until pg_isready -U postgres -d postgres; do sleep 1; done'

  echo "==> Applying seed data..."
  kubectl exec -i -n "${NAMESPACE}" "${pod}" -c postgres -- \
    psql -U postgres -d postgres < "$ROOT/api/seed/00-reset-schema.sql"
  kubectl exec -i -n "${NAMESPACE}" "${pod}" -c postgres -- \
    psql -U postgres -d postgres < "$ROOT/api/seed/mock-dump.sql"

  echo "==> Database seeded successfully."
}

port_forward() {
  echo "==> Starting port forwards (Ctrl+C to stop)..."
  echo "  - Frontend: http://localhost:3000"
  echo "  - API:      http://localhost:8080"
  echo "  - Postgres: localhost:5432"

  # Run port forwards in background and trap exit
  trap 'kill $(jobs -p) 2>/dev/null || true' EXIT

  kubectl port-forward -n "${NAMESPACE}" svc/frontend 3000:80 &
  kubectl port-forward -n "${NAMESPACE}" svc/api 8080:8080 &
  kubectl port-forward -n "${NAMESPACE}" svc/postgres 5432:5432 &

  wait
}

down_k8s() {
  echo "==> Deleting resources in namespace '${NAMESPACE}'..."
  kubectl delete -k "$ROOT/k8s/overlays/local" --ignore-not-found
  kubectl delete namespace "${NAMESPACE}" --ignore-not-found
}

status_k8s() {
  echo "==> Resources in namespace '${NAMESPACE}':"
  kubectl get all -n "${NAMESPACE}"
}

case "${1:-up}" in
  up)
    build_images
    deploy_k8s
    seed_db
    echo ""
    echo "PokeDB is up and running in namespace '${NAMESPACE}'."
    echo "Run '$0 port-forward' to access the application."
    ;;
  build)
    build_images
    ;;
  deploy)
    deploy_k8s
    ;;
  seed)
    seed_db
    ;;
  port-forward)
    port_forward
    ;;
  down)
    down_k8s
    ;;
  status)
    status_k8s
    ;;
  *)
    sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'
    exit 1
    ;;
esac
