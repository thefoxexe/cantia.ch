-- Prerequisite for "Supprimer mon compte" (delete-account edge function):
-- attribution columns (created_by, changed_by, ...) reference auth.users(id)
-- with no ON DELETE clause, which defaults to RESTRICT — deleting a user
-- who ever created a devis/project/report/etc. would fail outright. These
-- are audit-trail columns, not ownership columns (true ownership columns
-- like payroll_time_entries.user_id or notifications.user_id already cascade
-- correctly and are untouched here) — historical rows should simply lose
-- the attribution, not block account deletion or vanish themselves.
-- subcontractors.created_by and admin_audit_logs.admin_user_id already do
-- this; this migration brings every other such column in line.
do $$
declare
  r record;
begin
  for r in
    select
      con.conname,
      con.conrelid::regclass::text as table_name,
      att.attname as column_name,
      att.attnotnull as is_not_null
    from pg_constraint con
    join pg_attribute att
      on att.attrelid = con.conrelid
     and att.attnum = con.conkey[1]
    where con.contype = 'f'
      and con.confrelid = 'auth.users'::regclass
      and array_length(con.conkey, 1) = 1
      and att.attname in ('created_by', 'changed_by', 'decided_by', 'uploaded_by', 'used_by', 'updated_by', 'admin_user_id', 'connected_by')
      and con.confdeltype <> 'n'
  loop
    if r.is_not_null then
      execute format('alter table %s alter column %I drop not null', r.table_name, r.column_name);
    end if;
    execute format('alter table %s drop constraint %I', r.table_name, r.conname);
    execute format(
      'alter table %s add constraint %I foreign key (%I) references auth.users(id) on delete set null',
      r.table_name, r.conname, r.column_name
    );
  end loop;
end $$;
