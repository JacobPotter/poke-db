#!/usr/bin/env bash
# Manage the local test database (compose.test.yaml) and run backend tests.
#   scripts/test-db.sh up                 start (and seed on first run)
#   scripts/test-db.sh down               stop and delete data
#   scripts/test-db.sh env                print DB_* exports: eval "$(scripts/test-db.sh env)"
#   scripts/test-db.sh test [pkgs...]     start, then go test (default ./...)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/compose.test.yaml")

export_env() {
  export DB_HOST=localhost DB_PORT=5433 DB_USER=postgres DB_PASSWORD=postgres DB_NAME=postgres
}

case "${1:-}" in
  up)   "${COMPOSE[@]}" up -d --wait ;;
  down) "${COMPOSE[@]}" down -v ;;
  env)  echo "export DB_HOST=localhost DB_PORT=5433 DB_USER=postgres DB_PASSWORD=postgres DB_NAME=postgres" ;;
  test)
    shift
    "${COMPOSE[@]}" up -d --wait
    export_env
    cd "$ROOT/api"
    go test -count=1 -v "${@:-./...}"
    ;;
  *) sed -n '2,6p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
