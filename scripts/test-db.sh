#!/usr/bin/env bash
# Manage the local Kubernetes test database and run backend tests.
#   scripts/test-db.sh up                 start, seed, and port-forward postgres
#   scripts/test-db.sh down               stop and delete test database
#   scripts/test-db.sh env                print DB_* exports: eval "$(scripts/test-db.sh env)"
#   scripts/test-db.sh test [pkgs...]     start DB, then go test (default ./...)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAMESPACE="poke-db-local"
PORT="5433"

export_env() {
  export DB_HOST=localhost DB_PORT="${PORT}" DB_USER=postgres DB_PASSWORD=postgres DB_NAME=postgres
}

ensure_up() {
  echo "==> Ensuring namespace '${NAMESPACE}' exists..."
  kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

  echo "==> Applying Postgres deployment..."
  kubectl apply -f "$ROOT/k8s/base/postgres.yaml" -n "${NAMESPACE}"

  echo "==> Waiting for Postgres deployment to be ready..."
  kubectl rollout status deployment/postgres -n "${NAMESPACE}" --timeout=120s

  local pod
  pod="$(kubectl get pod -n "${NAMESPACE}" -l app=postgres -o jsonpath='{.items[0].metadata.name}')"
  echo "==> Found Postgres pod: ${pod}"

  echo "==> Waiting for Postgres to accept connections..."
  kubectl exec -i -n "${NAMESPACE}" "${pod}" -c postgres -- sh -c \
    'until pg_isready -U postgres -d postgres; do sleep 1; done'

  # Seed database if not yet initialized
  local table_count
  table_count="$(kubectl exec -i -n "${NAMESPACE}" "${pod}" -c postgres -- \
    psql -U postgres -d postgres -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" | tr -d '[:space:]' || echo "0")"

  if [ "${table_count}" -eq 0 ]; then
    echo "==> Seeding database..."
    kubectl exec -i -n "${NAMESPACE}" "${pod}" -c postgres -- \
      psql -U postgres -d postgres < "$ROOT/api/seed/00-reset-schema.sql"
    kubectl exec -i -n "${NAMESPACE}" "${pod}" -c postgres -- \
      psql -U postgres -d postgres < "$ROOT/api/seed/mock-dump.sql"
    echo "==> Database seeded successfully."
  else
    echo "==> Database already seeded (${table_count} tables)."
  fi

  # Start port-forward in background if not already listening
  if ! nc -z -w 1 127.0.0.1 "${PORT}" 2>/dev/null && ! nc -z -w 1 localhost "${PORT}" 2>/dev/null; then
    echo "==> Starting port-forward on port ${PORT}..."
    local log_file="/tmp/pokedb-test-db-pf.log"
    nohup kubectl port-forward --address 0.0.0.0 -n "${NAMESPACE}" svc/postgres "${PORT}:5432" >"${log_file}" 2>&1 &
    local pf_pid=$!
    disown "${pf_pid}" 2>/dev/null || true

    # Wait until the port actually accepts connections (up to 15 s)
    local waited=0
    while ! nc -z -w 1 127.0.0.1 "${PORT}" 2>/dev/null && ! nc -z -w 1 localhost "${PORT}" 2>/dev/null; do
      if ! kill -0 "${pf_pid}" 2>/dev/null; then
        echo "Error: Port-forward process exited unexpectedly. Log output:" >&2
        cat "${log_file}" >&2 2>/dev/null || true
        return 1
      fi
      sleep 1
      waited=$((waited + 1))
      if [ "${waited}" -ge 15 ]; then
        echo "Error: Port-forward did not become ready on port ${PORT} after ${waited}s. Log output:" >&2
        cat "${log_file}" >&2 2>/dev/null || true
        kill "${pf_pid}" 2>/dev/null || true
        return 1
      fi
    done
    echo "==> Port-forward started (PID ${pf_pid}, ready after ${waited}s)."
  else
    echo "==> Port-forward already running on port ${PORT}."
  fi
}

down() {
  echo "==> Stopping port-forward on port ${PORT}..."
  pkill -f "kubectl port-forward.*${PORT}:5432" 2>/dev/null || true
  echo "==> Deleting Postgres resources in namespace '${NAMESPACE}'..."
  kubectl delete -f "$ROOT/k8s/base/postgres.yaml" -n "${NAMESPACE}" --ignore-not-found
  echo "==> Done."
}

case "${1:-}" in
  up)   ensure_up ;;
  down) down ;;
  env)  echo "export DB_HOST=localhost DB_PORT=${PORT} DB_USER=postgres DB_PASSWORD=postgres DB_NAME=postgres" ;;
  test)
    shift
    ensure_up
    export_env
    echo "==> Running tests in $ROOT/api..."
    cd "$ROOT/api"
    go test -count=1 -v "${@:-./...}"
    ;;
  *) sed -n '2,6p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
