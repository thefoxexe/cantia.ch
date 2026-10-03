-- « Envoyer au fiduciaire »: a company sends a document (invoice, receipt,
-- payslip, closing file, any upload) to a fiduciary that has ACTIVE access
-- to it on Cantia. The fiduciary sees it in its documents (acc_documents,
-- kind 'shared'), can download the file, and gets an email.
create table if not exists public.fiduciary_shared_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  kind text not null default 'document' check (kind in ('invoice', 'expense', 'payslip', 'salary_certificate', 'vat', 'closing', 'bank', 'document')),
  title text not null check (char_length(title) between 1 and 300),
  -- A file of THIS company only (paths start with the organization id).
  file_path text check (file_path is null or split_part(file_path, '/', 1) = organization_id::text),
  amount_chf numeric(14, 2),
  doc_date date,
  message text check (message is null or char_length(message) <= 2000),
  source_table text check (source_table is null or char_length(source_table) <= 60),
  source_id uuid,
  sent_by uuid references auth.users(id) on delete set null default auth.uid(),
  seen_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists fiduciary_shared_documents_firm_idx on public.fiduciary_shared_documents (firm_id, created_at desc);
create index if not exists fiduciary_shared_documents_org_idx on public.fiduciary_shared_documents (organization_id, created_at desc);

alter table public.fiduciary_shared_documents enable row level security;

drop policy if exists "members send to their active fiduciary" on public.fiduciary_shared_documents;
create policy "members send to their active fiduciary" on public.fiduciary_shared_documents
  for insert with check (
    public.is_org_member(organization_id)
    and exists (select 1 from public.fiduciary_client_access a where a.organization_id = fiduciary_shared_documents.organization_id and a.firm_id = fiduciary_shared_documents.firm_id and a.status = 'ACTIVE')
  );
drop policy if exists "members see what their company sent" on public.fiduciary_shared_documents;
create policy "members see what their company sent" on public.fiduciary_shared_documents
  for select using (public.is_org_member(organization_id));
drop policy if exists "fiduciaries see what they received" on public.fiduciary_shared_documents;
create policy "fiduciaries see what they received" on public.fiduciary_shared_documents
  for select using (firm_id = public.my_fiduciary_firm_id() and organization_id in (select public.fiduciary_org_ids(null)));
drop policy if exists "fiduciaries mark received documents as seen" on public.fiduciary_shared_documents;
create policy "fiduciaries mark received documents as seen" on public.fiduciary_shared_documents
  for update using (firm_id = public.my_fiduciary_firm_id() and organization_id in (select public.fiduciary_org_ids(null)));
drop policy if exists "admins withdraw sent documents" on public.fiduciary_shared_documents;
create policy "admins withdraw sent documents" on public.fiduciary_shared_documents
  for delete using (public.is_org_admin(organization_id) or sent_by = auth.uid());

grant select, insert, delete on public.fiduciary_shared_documents to authenticated;
grant update (seen_at) on public.fiduciary_shared_documents to authenticated;

-- The fiduciary may download the files it was sent.
drop policy if exists "fiduciaries download shared files" on storage.objects;
create policy "fiduciaries download shared files" on storage.objects
  for select using (
    bucket_id = 'opus-storage'
    and exists (
      select 1 from public.fiduciary_shared_documents d
      where d.file_path = objects.name
        and d.firm_id = public.my_fiduciary_firm_id()
        and d.organization_id in (select public.fiduciary_org_ids(null))
    )
  );

-- Email to every member of the firm (accounting-mailer, kind document_shared).
create or replace function public.trg_fiduciary_document_shared()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_firm public.fiduciary_firms;
  v_org text;
begin
  select * into v_firm from public.fiduciary_firms where id = NEW.firm_id;
  select name into v_org from public.organizations where id = NEW.organization_id;
  insert into public.fiduciary_email_outbox (kind, to_email, locale, payload)
  select 'document_shared', m.email, coalesce(v_firm.locale, 'fr'),
         jsonb_build_object('firm_name', v_firm.name, 'organization_name', v_org, 'organization_id', NEW.organization_id, 'title', NEW.title, 'details', NEW.message)
  from public.fiduciary_members m
  where m.firm_id = NEW.firm_id and m.email is not null
    and (m.all_clients or exists (select 1 from public.fiduciary_member_clients s where s.firm_id = m.firm_id and s.user_id = m.user_id and s.organization_id = NEW.organization_id));
  return NEW;
end;
$$;

drop trigger if exists fiduciary_document_shared on public.fiduciary_shared_documents;
create trigger fiduciary_document_shared after insert on public.fiduciary_shared_documents
  for each row execute function public.trg_fiduciary_document_shared();

-- Documents of the fiduciary platform: + what clients sent (kind 'shared').
create or replace function public.acc_documents(p_org uuid default null, p_from date default null, p_to date default null, p_kind text default null)
returns table(id uuid, kind text, organization_id uuid, organization_name text, title text, file_path text, doc_date date, amount_chf numeric, created_at timestamptz)
language sql
stable security definer
set search_path to 'public'
as $function$
  select * from (
    select f.id as id, 'invoice'::text as kind, f.organization_id as organization_id, o.name as organization_name,
           coalesce(f.number, '—') || ' · ' || f.client_name as title,
           f.pdf_path as file_path, f.created_at::date as doc_date, public.acc_facture_total(f.id) as amount_chf, f.created_at as created_at
    from public.factures f join public.organizations o on o.id = f.organization_id
    where f.organization_id in (select public.fiduciary_org_ids('VIEW_INVOICES'))
      and f.status::text not in ('draft')
      and (p_org is null or f.organization_id = p_org)
      and (p_kind is null or p_kind = 'invoice')
    union all
    select att.id, 'receipt', e.organization_id, o.name, att.file_name, att.file_path, e.entry_date, null::numeric, att.created_at
    from public.accounting_attachments att
    join public.accounting_entries e on e.id = att.entry_id
    join public.organizations o on o.id = e.organization_id
    where e.organization_id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS'))
      and (p_org is null or e.organization_id = p_org)
      and (p_kind is null or p_kind = 'receipt')
    union all
    select d.id, 'shared', d.organization_id, o.name, 'Envoyé : ' || d.title || coalesce(' — ' || d.message, ''), d.file_path, coalesce(d.doc_date, d.created_at::date), d.amount_chf, d.created_at
    from public.fiduciary_shared_documents d
    join public.organizations o on o.id = d.organization_id
    where d.firm_id = public.my_fiduciary_firm_id()
      and d.organization_id in (select public.fiduciary_org_ids(null))
      and (p_org is null or d.organization_id = p_org)
      and (p_kind is null or p_kind = 'shared')
  ) d
  where (p_from is null or d.doc_date >= p_from) and (p_to is null or d.doc_date <= p_to)
  order by d.created_at desc nulls last
  limit 500;
$function$;
