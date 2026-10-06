-- Métrés & Soumissions — phase B: import of a soumission in two steps.
--
-- UPLOAD → EXTRACTION → ANALYSE → BROUILLON → VALIDATION → IMPORT FINAL
--
-- The browser extracts and parses the PDF (pdf.js + lib/tenders/parser);
-- the draft lives in tender_import_jobs.draft until the user validates it.
-- import_tender_draft() then creates the whole métré in one transaction,
-- re-checking access and every value server-side: the client never decides
-- the organization, and a malformed draft is refused, not half-imported.
-- The original PDF stays an untouched row of public.files.

create table public.tender_import_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  tender_id uuid references public.tenders(id) on delete set null,
  file_id uuid references public.files(id) on delete set null,
  file_name text,
  page_count integer,
  sha256 text,
  status text not null default 'uploaded' check (status in (
    'uploaded', 'extracting', 'parsing', 'resolving', 'needs_user_input', 'ready_for_review', 'imported', 'failed'
  )),
  step text,
  progress numeric(4, 3) check (progress is null or (progress >= 0 and progress <= 1)),
  parser_version text,
  ai_model_version text,
  classification text check (classification is null or classification in ('CAN', 'CUSTOM', 'UNKNOWN')),
  stats jsonb not null default '{}'::jsonb,
  -- ParseResult (lib/tenders/parser/types.ts) incl. questions and answers.
  draft jsonb,
  error text,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.tender_import_jobs (project_id, created_at desc);
create trigger tender_import_jobs_set_updated_at before update on public.tender_import_jobs for each row execute function public.set_updated_at();
create trigger tender_import_jobs_derive_org before insert or update of project_id, organization_id on public.tender_import_jobs
for each row execute function public.tenders_derive_org();

alter table public.tender_import_jobs enable row level security;
create policy "import job readers" on public.tender_import_jobs for select using (
  public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_metre(organization_id)
);
create policy "import job creators" on public.tender_import_jobs for insert with check (
  public.is_org_member(organization_id) and public.has_project_access(project_id)
  and public.can_view_org_metre(organization_id) and public.org_has_tenders(organization_id)
);
create policy "import job editors" on public.tender_import_jobs for update using (
  public.is_org_member(organization_id) and public.has_project_access(project_id)
  and public.can_view_org_metre(organization_id) and public.org_has_tenders(organization_id)
);
create policy "import job deleters" on public.tender_import_jobs for delete using (
  public.is_org_member(organization_id) and public.has_project_access(project_id) and public.can_view_org_metre(organization_id)
);

-- Safe numeric cast for values coming from the draft.
create or replace function public.tender_num(v jsonb)
returns numeric language sql immutable as $$
  select case when jsonb_typeof(v) = 'number' then (v #>> '{}')::numeric else null end;
$$;

create or replace function public.import_tender_draft(p_job uuid, p_name text, p_kind text default 'soumission')
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  job public.tender_import_jobs;
  d jsonb;
  t_id uuid;
  doc_id uuid;
  key_map jsonb := '{}'::jsonb;
  n jsonb;
  node_id uuid;
  pos_id uuid;
  b jsonb;
  i integer := 0;
  j integer;
  with_prices boolean;
  ntype text;
  meta jsonb;
  answers jsonb;
  unit_answer text;
begin
  select * into job from public.tender_import_jobs where id = p_job for update;
  if job.id is null
     or not public.is_org_member(job.organization_id)
     or not public.has_project_access(job.project_id)
     or not public.can_view_org_metre(job.organization_id)
     or not public.org_has_tenders(job.organization_id) then
    raise exception 'Accès refusé';
  end if;
  if job.status = 'imported' then
    raise exception 'Cette soumission a déjà été importée';
  end if;
  d := job.draft;
  if d is null or jsonb_typeof(d -> 'nodes') <> 'array' then
    raise exception 'Brouillon invalide';
  end if;
  if jsonb_array_length(d -> 'nodes') > 20000 then
    raise exception 'Document trop volumineux (plus de 20 000 lignes)';
  end if;
  if p_kind not in ('soumission', 'interne', 'variante', 'complementaire') then
    raise exception 'Type de métré invalide';
  end if;
  with_prices := public.can_view_org_finances(job.organization_id);
  meta := coalesce(d -> 'meta', '{}'::jsonb);
  answers := coalesce(d -> 'answers', '{}'::jsonb);

  insert into public.tenders (project_id, name, number, kind, status, classification_type, cfc_code, cfc_label, language, source_type, metadata)
  values (
    job.project_id,
    left(coalesce(nullif(trim(p_name), ''), job.file_name, 'Soumission'), 200),
    left(meta ->> 'tenderNumber', 60),
    p_kind,
    'in_progress',
    case when d ->> 'classification' in ('CAN', 'CUSTOM', 'UNKNOWN') then d ->> 'classification' else 'UNKNOWN' end,
    left(meta ->> 'cfcCode', 20),
    left(meta ->> 'cfcLabel', 200),
    case when meta ->> 'language' in ('fr', 'de', 'it') then meta ->> 'language' else 'fr' end,
    'pdf',
    jsonb_strip_nulls(jsonb_build_object(
      'project', meta ->> 'project', 'owner', meta ->> 'owner', 'architect', meta ->> 'architect', 'engineer', meta ->> 'engineer',
      'date', meta ->> 'date', 'document_vat_rate', meta -> 'documentVatRate', 'zone_codes', meta -> 'zoneCodes', 'chapters', meta -> 'chapters'
    ))
  )
  returning id into t_id;

  insert into public.tender_documents (tender_id, file_id, role, file_name, page_count, sha256, parser_version, ai_model_version, detected, imported_at)
  values (t_id, job.file_id, 'soumission', job.file_name, job.page_count, job.sha256, coalesce(d ->> 'parserVersion', job.parser_version), job.ai_model_version,
    jsonb_build_object('meta', meta, 'stats', d -> 'stats', 'classification_confidence', d -> 'classificationConfidence'), now())
  returning id into doc_id;

  -- Nodes come parent-first (the parser creates a parent before its children).
  for n in select value from jsonb_array_elements(d -> 'nodes') loop
    i := i + 1;
    ntype := n ->> 'nodeType';
    if ntype is null or ntype not in ('contract', 'chapter', 'section', 'subsection', 'article', 'subarticle', 'billable_position',
      'carry_forward', 'subtotal', 'chapter_total', 'financial_adjustment', 'note', 'other') then
      raise exception 'Type de ligne invalide : %', coalesce(ntype, '∅');
    end if;
    if coalesce(n ->> 'deleted', 'false') = 'true' then
      continue;
    end if;
    node_id := gen_random_uuid();
    insert into public.tender_nodes (id, tender_id, parent_id, node_type, sort_order, depth, raw_number, position_path, display_reference,
      classification_type, cfc_code, can_chapter, can_version, can_language, is_reserved, title, description, raw_text,
      source_document_id, source_page, source_bbox, confidence, needs_review)
    values (
      node_id, t_id, (key_map ->> (n ->> 'parentKey'))::uuid, ntype, i * 100, least(coalesce((n ->> 'depth')::int, 0), 30),
      left(n ->> 'rawNumber', 60), left(n ->> 'positionPath', 120), left(n ->> 'displayReference', 160),
      case when d ->> 'classification' in ('CAN', 'CUSTOM', 'UNKNOWN') then d ->> 'classification' else null end,
      left(n ->> 'cfcCode', 20), left(n ->> 'canChapter', 10), left(n ->> 'canVersion', 40), left(n ->> 'canLanguage', 5),
      coalesce((n ->> 'isReserved')::boolean, false),
      n ->> 'title', n ->> 'description', n ->> 'rawText',
      doc_id, (n ->> 'page')::int, case when jsonb_typeof(n -> 'bbox') = 'object' then n -> 'bbox' else null end,
      case n ->> 'certainty' when 'certain' then 0.98 when 'probable' then 0.75 when 'uncertain' then 0.5 else null end,
      coalesce(n ->> 'certainty', 'certain') <> 'certain' and coalesce(n ->> 'validated', 'false') <> 'true'
    );
    key_map := key_map || jsonb_build_object(n ->> 'key', node_id);

    if ntype = 'billable_position' then
      unit_answer := coalesce(n ->> 'unitOverride', answers ->> ('unit:' || coalesce(n ->> 'rawUnit', 'none')));
      insert into public.tender_positions (tender_id, node_id, raw_unit, unit, quantity_original, quantity_selected_source, status)
      values (t_id, node_id, left(n ->> 'rawUnit', 40), left(coalesce(unit_answer, n ->> 'unit'), 40), public.tender_num(n -> 'quantity'), 'original',
        case when coalesce(n ->> 'certainty', 'certain') = 'certain' or coalesce(n ->> 'validated', 'false') = 'true' then 'imported' else 'to_review' end)
      returning id into pos_id;

      j := 0;
      for b in select value from jsonb_array_elements(coalesce(n -> 'breakdowns', '[]'::jsonb)) loop
        j := j + 1;
        continue when coalesce(b ->> 'code', '') = '';
        insert into public.position_breakdowns (tender_id, position_id, code, unit, quantity_original, sort_order, source_page, source_bbox, confidence)
        values (t_id, pos_id, left(b ->> 'code', 40), left(coalesce(b ->> 'unit', n ->> 'rawUnit'), 40), public.tender_num(b -> 'quantity'), j,
          (b ->> 'page')::int, case when jsonb_typeof(b -> 'bbox') = 'object' then b -> 'bbox' else null end, 0.98);
      end loop;

      if with_prices and (public.tender_num(n -> 'documentUnitPrice') is not null or public.tender_num(n -> 'documentAmount') is not null) then
        insert into public.tender_position_prices (position_id, tender_id, unit_price, price_source, document_unit_price, document_amount)
        values (pos_id, t_id, public.tender_num(n -> 'documentUnitPrice'),
          case when public.tender_num(n -> 'documentUnitPrice') is not null then 'document' else null end,
          public.tender_num(n -> 'documentUnitPrice'), public.tender_num(n -> 'documentAmount'));
      end if;
    end if;
  end loop;

  -- Zone meanings answered during the import (per tender, never global).
  insert into public.tender_zone_labels (tender_id, code, label, source)
  select t_id, left(substr(key, 6), 40), left(value #>> '{}', 200), 'user'
  from jsonb_each(answers)
  where key like 'zone:%' and coalesce(value #>> '{}', '') <> ''
  on conflict (tender_id, code) do nothing;

  update public.tender_import_jobs set status = 'imported', tender_id = t_id, step = null, progress = 1 where id = p_job;
  return t_id;
end;
$$;
grant execute on function public.import_tender_draft(uuid, text, text) to authenticated;
