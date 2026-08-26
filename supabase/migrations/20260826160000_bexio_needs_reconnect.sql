-- Cantia is about to request the contact_edit scope (needed to push clients
-- created in Cantia into Bexio as contacts) — existing connections were only
-- granted contact_show (read), so they can't do that yet. This flag lets the
-- UI tell an already-connected org it needs to reconnect once to pick up the
-- new permission; bexio-oauth-callback clears it whenever a connect/reconnect
-- actually grants contact_edit.
alter table public.integrations add column needs_reconnect boolean not null default false;
update public.integrations set needs_reconnect = true where provider = 'bexio' and status = 'connected';
