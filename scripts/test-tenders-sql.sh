#!/usr/bin/env bash
# Runs the tender migrations against a throwaway local Postgres 16 with
# stubs of the existing schema, then the RLS scenarios
# (supabase/tests/tenders/). Usage: PGHOST=/socket/dir PGPORT=5499 scripts/test-tenders-sql.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
psql -U postgres -q -c "drop database if exists tenders_test" -c "create database tenders_test"
psql -U postgres -d tenders_test -q -v ON_ERROR_STOP=1 -f "$ROOT/supabase/tests/tenders/00_stubs.sql"
for m in "$ROOT"/supabase/migrations/202610*_tenders_*.sql "$ROOT"/supabase/migrations/202610*_site_schedules*.sql "$ROOT"/supabase/migrations/202610*_project_folders.sql; do
  psql -U postgres -d tenders_test -q -v ON_ERROR_STOP=1 -f "$m"
done
for t in "$ROOT"/supabase/tests/tenders/[1-9]*.sql; do psql -U postgres -d tenders_test -f "$t"; done
