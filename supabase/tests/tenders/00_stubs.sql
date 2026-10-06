do $$ begin create role authenticated; exception when duplicate_object then null; end $$;
do $$ begin create role anon; exception when duplicate_object then null; end $$;
create schema auth;
create table auth.users (id uuid primary key);
create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
create table public.plans (id text primary key, name text);
create table public.organizations (id uuid primary key default gen_random_uuid(), name text, plan_id text references public.plans(id), trade text default 'Maçonnerie', work_term text default 'chantier', trade_specialties text[] not null default '{}');
create table public.organization_roles (id uuid primary key default gen_random_uuid(), organization_id uuid, can_view_finances boolean default false, can_view_metre boolean default true);
create table public.organization_members (organization_id uuid, user_id uuid, role text, role_id uuid);
create table public.projects (id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id), name text, enabled_modules text[] default array['documents','photos','survey','metre']);
create table public.project_members (project_id uuid, user_id uuid);
create table public.files (id uuid primary key default gen_random_uuid(), organization_id uuid);
create table public.devis (id uuid primary key default gen_random_uuid());
create table public.metre_items (id uuid primary key default gen_random_uuid(), organization_id uuid, project_id uuid, reference text, description text not null, quantity numeric(12,2), unit text, sort_order int default 0, unit_price numeric(10,2) default 0, section text, created_at timestamptz default now());
create function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at := now(); return new; end $$;
create function public.is_org_member(org uuid) returns boolean language sql stable as $$ select exists(select 1 from public.organization_members where organization_id=org and user_id=auth.uid()) $$;
create function public.is_org_admin(org uuid) returns boolean language sql stable as $$ select exists(select 1 from public.organization_members where organization_id=org and user_id=auth.uid() and role in ('owner','admin')) $$;
create function public.has_project_access(proj_id uuid) returns boolean language sql stable as $$ select exists(select 1 from public.projects p where p.id=proj_id and public.is_org_admin(p.organization_id)) or not exists(select 1 from public.project_members where project_id=proj_id) or exists(select 1 from public.project_members where project_id=proj_id and user_id=auth.uid()) $$;
create function public.can_view_org_metre(org uuid) returns boolean language sql stable as $$ select public.is_org_admin(org) or exists(select 1 from public.organization_members m left join public.organization_roles r on r.id=m.role_id where m.organization_id=org and m.user_id=auth.uid() and (m.role_id is null or r.can_view_metre)) $$;
create function public.can_view_org_finances(org uuid) returns boolean language sql stable as $$ select public.is_org_admin(org) or exists(select 1 from public.organization_members m join public.organization_roles r on r.id=m.role_id where m.organization_id=org and m.user_id=auth.uid() and r.can_view_finances) $$;
insert into public.plans values ('solo','Essentiel'),('equipe','Équipe'),('pro','Entreprise'),('illimite','SM'),('custom','SM');
-- seed legacy data
insert into public.organizations (id,name,plan_id) values ('00000000-0000-0000-0000-00000000000a','Org A','pro'),('00000000-0000-0000-0000-00000000000b','Org B','solo');
insert into public.projects (id,organization_id,name) values ('00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-00000000000a','Chantier A'),('00000000-0000-0000-0000-0000000000b1','00000000-0000-0000-0000-00000000000b','Chantier B');
insert into public.metre_items (organization_id,project_id,reference,description,quantity,unit,sort_order,unit_price,section) values
 ('00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-0000000000a1','1.1','Béton fondations',12.5,'m3',1,280,'Gros œuvre'),
 ('00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-0000000000a1',null,'Coffrage',40,'m2',2,0,'Gros œuvre'),
 ('00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-0000000000a1',null,'Divers',1,'gl',3,500,null);
create table public.catalog_items (id uuid primary key default gen_random_uuid(), organization_id uuid not null, description text not null, description_key text not null, unit text not null default 'pce', unit_price numeric not null default 0, use_count integer not null default 1, last_used_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create unique index catalog_items_org_key on public.catalog_items (organization_id, description_key);
create table public.clients (id uuid primary key default gen_random_uuid(), organization_id uuid, name text);
create function public.can_create_org_projects(org uuid) returns boolean language sql stable as $$ select public.is_org_member(org) $$;
