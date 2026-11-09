#!/usr/bin/env bash
# Manage the local test database via Docker Compose and run backend tests.
#   scripts/test-db.sh up                 start test database container
#   scripts/test-db.sh down               stop and remove test database container
#   scripts/test-db.sh env                print DB_* exports: eval "$(scripts/test-db.sh env)"
#   scripts/test-db.sh test [pkgs...]     start DB, then go test (default ./...)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="5433"

export_env() {
  export DB_HOST=localhost DB_PORT="${PORT}" DB_USER=postgres DB_PASSWORD=postgres DB_NAME=postgres
}

ensure_up() {
  echo "==> Starting test database via Docker Compose..."
  docker compose -f "$ROOT/compose.test.yaml" up -d --wait
  echo "==> Test database ready on port ${PORT}."
}

down() {
  echo "==> Stopping test database container..."
  docker compose -f "$ROOT/compose.test.yaml" down
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
