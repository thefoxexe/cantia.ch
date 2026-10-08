#!/usr/bin/env bash
# Cantia Accounting (fiduciaries) SQL tests on a local Postgres:
#   PGHOST=/var/tmp/pgtest PGPORT=5499 scripts/test-fiduciary-sql.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
python3 "$ROOT/scripts/build-fiduciary-test-stubs.py" >/dev/null
psql -U postgres -q -c "drop database if exists fiduciary_test" -c "create database fiduciary_test" >/dev/null
psql -U postgres -d fiduciary_test -q -v ON_ERROR_STOP=1 -f "$ROOT/supabase/tests/fiduciary/00_stubs.sql"
psql -U postgres -d fiduciary_test -q -v ON_ERROR_STOP=1 -f "$ROOT/supabase/migrations/20261008140000_fiduciary_pro.sql"
psql -U postgres -d fiduciary_test -q -v ON_ERROR_STOP=1 -f "$ROOT/supabase/migrations/20261009090000_fiduciary_ledger.sql"
for t in "$ROOT"/supabase/tests/fiduciary/[1-9]*.sql; do psql -U postgres -d fiduciary_test -f "$t"; done
