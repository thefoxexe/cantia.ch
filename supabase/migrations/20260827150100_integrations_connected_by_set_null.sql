-- integrations.connected_by references auth.users(id) but its FK constraint
-- was never renamed after the column was (still named
-- integrations_created_by_fkey and not caught by the previous migration's
-- attname filter until this was noticed). Same fix: ON DELETE SET NULL.
alter table public.integrations drop constraint integrations_created_by_fkey;
alter table public.integrations add constraint integrations_created_by_fkey foreign key (connected_by) references auth.users(id) on delete set null;
