-- Cantia Accounting: the books of a client that is not on Cantia, kept by
-- its fiduciary (on top of 20261008140000_fiduciary_pro.sql).
--
-- The firm opens the ledger of an external client (Swiss SME chart of
-- accounts in the client's language, or its own chart imported), enters
-- the entries by hand or imports them (Banana, Abacus, Winbiz, CSV), and
-- gets the journal, the general ledger, the trial balance, the balance
-- sheet, the income statement, a VAT summary and the indicators, like for a
-- Cantia client.
--
-- Same rules as before: every write through a function that checks the
-- firm, nothing is ever removed. A posted entry changed in an open period
-- is kept as 'replaced' (the new version takes its number); a draft thrown
-- away is kept as 'discarded'; a locked period (ledger_locked_until) can
-- only be corrected by a reversal dated after it.

alter table public.fiduciary_external_clients
  add column if not exists ledger_started_at timestamptz,
  add column if not exists ledger_locked_until date;

create table if not exists public.fiduciary_ext_accounts (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  external_client_id uuid not null references public.fiduciary_external_clients(id) on delete cascade,
  code text not null check (code ~ '^[0-9A-Za-z.]{1,12}$'),
  label text not null check (length(trim(label)) between 1 and 120),
  type text not null check (type in ('actif', 'passif', 'produit', 'charge')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (external_client_id, code)
);

create table if not exists public.fiduciary_ext_entries (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid not null references public.fiduciary_firms(id) on delete cascade,
  external_client_id uuid not null references public.fiduciary_external_clients(id) on delete cascade,
  entry_number integer,
  entry_date date not null check (entry_date between date '1990-01-01' and date '2100-12-31'),
  label text not null check (length(trim(label)) between 1 and 200),
  reference text check (reference is null or length(reference) <= 60),
  status text not null default 'draft' check (status in ('draft', 'posted', 'replaced', 'discarded')),
  source text not null default 'manual' check (source in ('manual', 'import', 'opening', 'reversal')),
  replaces_entry_id uuid references public.fiduciary_ext_entries(id) on delete set null,
  reverses_entry_id uuid references public.fiduciary_ext_entries(id) on delete set null,
  reversed_by_entry_id uuid references public.fiduciary_ext_entries(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  posted_at timestamptz,
  posted_by uuid references auth.users(id) on delete set null
);
create index if not exists fiduciary_ext_entries_client on public.fiduciary_ext_entries (external_client_id, status, entry_date);
create unique index if not exists fiduciary_ext_entries_number on public.fiduciary_ext_entries (external_client_id, entry_number) where status = 'posted';

create table if not exists public.fiduciary_ext_entry_lines (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.fiduciary_ext_entries(id) on delete cascade,
  account_id uuid not null references public.fiduciary_ext_accounts(id),
  debit numeric(14, 2) not null default 0 check (debit >= 0),
  credit numeric(14, 2) not null default 0 check (credit >= 0),
  label text check (label is null or length(label) <= 200),
  vat_code text check (vat_code is null or length(vat_code) <= 12),
  sort_order integer not null default 0,
  check ((debit > 0 and credit = 0) or (credit > 0 and debit = 0))
);
create index if not exists fiduciary_ext_entry_lines_entry on public.fiduciary_ext_entry_lines (entry_id);
create index if not exists fiduciary_ext_entry_lines_account on public.fiduciary_ext_entry_lines (account_id);

alter table public.fiduciary_ext_accounts enable row level security;
alter table public.fiduciary_ext_entries enable row level security;
alter table public.fiduciary_ext_entry_lines enable row level security;

create policy "firm reads its client accounts" on public.fiduciary_ext_accounts
  for select using (firm_id = public.my_fiduciary_firm_id());
create policy "firm reads its client entries" on public.fiduciary_ext_entries
  for select using (firm_id = public.my_fiduciary_firm_id());
create policy "firm reads its client entry lines" on public.fiduciary_ext_entry_lines
  for select using (exists (select 1 from public.fiduciary_ext_entries e where e.id = entry_id and e.firm_id = public.my_fiduciary_firm_id()));

grant select on public.fiduciary_ext_accounts, public.fiduciary_ext_entries, public.fiduciary_ext_entry_lines to authenticated;

-- ---------------------------------------------------------------------------
-- Helpers

-- First day of the fiscal year containing p_date (fiscal_year_end 'MM-DD').
create or replace function public.fiduciary_ext_fy_start(p_ext uuid, p_date date)
returns date
language plpgsql stable security definer set search_path = public as $$
declare
  v_end text;
  v_m int;
  v_d int;
  v_e date;
begin
  select fiscal_year_end into v_end from public.fiduciary_external_clients where id = p_ext;
  v_m := split_part(coalesce(v_end, '12-31'), '-', 1)::int;
  v_d := split_part(coalesce(v_end, '12-31'), '-', 2)::int;
  v_e := least(make_date(extract(year from p_date)::int, v_m, 1) + make_interval(days => v_d - 1),
               (make_date(extract(year from p_date)::int, v_m, 1) + interval '1 month' - interval '1 day')::date);
  if v_e >= p_date then
    v_e := least(make_date(extract(year from p_date)::int - 1, v_m, 1) + make_interval(days => v_d - 1),
                 (make_date(extract(year from p_date)::int - 1, v_m, 1) + interval '1 month' - interval '1 day')::date);
  end if;
  return v_e + 1;
end;
$$;
revoke execute on function public.fiduciary_ext_fy_start(uuid, date) from public, anon, authenticated;

-- Type of an account from its class (Swiss SME chart).
create or replace function public.fiduciary_ext_type_of(p_code text)
returns text
language sql immutable as $$
  select case left(p_code, 1)
    when '1' then 'actif' when '2' then 'passif' when '3' then 'produit' when '7' then 'produit' when '9' then 'actif'
    else 'charge' end;
$$;

-- The ledger may be written: the client belongs to the firm, the ledger is
-- open and the date is after the locked period.
create or replace function public.fiduciary_ext_assert_open(p_ext uuid, p_date date)
returns uuid
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_ext(p_ext);
  v_c public.fiduciary_external_clients%rowtype;
begin
  select * into v_c from public.fiduciary_external_clients where id = p_ext;
  if v_c.ledger_started_at is null then raise exception 'Ouvrez d''abord la comptabilité de ce mandant'; end if;
  if p_date is null then raise exception 'Date manquante'; end if;
  if v_c.ledger_locked_until is not null and p_date <= v_c.ledger_locked_until then
    raise exception 'Période clôturée jusqu''au % : passez une extourne datée après', to_char(v_c.ledger_locked_until, 'DD.MM.YYYY');
  end if;
  return v_firm;
end;
$$;
revoke execute on function public.fiduciary_ext_assert_open(uuid, date) from public, anon, authenticated;

-- Lines [{account_code, debit, credit, label, vat_code, account_label}]:
-- at least two, each on one side, balanced, on active accounts of the
-- client (created when p_create, typed from their class).
create or replace function public.fiduciary_ext_resolve_lines(p_ext uuid, p_firm uuid, p_lines jsonb, p_create boolean)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_line jsonb;
  v_out jsonb := '[]'::jsonb;
  v_debit numeric := 0;
  v_credit numeric := 0;
  v_d numeric;
  v_c numeric;
  v_code text;
  v_acc public.fiduciary_ext_accounts%rowtype;
begin
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) < 2 or jsonb_array_length(p_lines) > 200 then
    raise exception 'Une écriture compte au moins deux lignes';
  end if;
  for v_line in select * from jsonb_array_elements(p_lines) loop
    v_code := trim(coalesce(v_line ->> 'account_code', ''));
    v_d := round(coalesce(nullif(replace(v_line ->> 'debit', '''', ''), '')::numeric, 0), 2);
    v_c := round(coalesce(nullif(replace(v_line ->> 'credit', '''', ''), '')::numeric, 0), 2);
    if v_d < 0 then v_c := v_c - v_d; v_d := 0; end if;
    if v_c < 0 then v_d := v_d - v_c; v_c := 0; end if;
    if v_d = 0 and v_c = 0 then continue; end if;
    if v_d > 0 and v_c > 0 then raise exception 'Chaque ligne a un montant au débit ou au crédit'; end if;
    if v_code = '' then raise exception 'Compte manquant'; end if;
    select * into v_acc from public.fiduciary_ext_accounts where external_client_id = p_ext and code = v_code;
    if v_acc.id is null then
      if not p_create or v_code !~ '^[0-9A-Za-z.]{1,12}$' then raise exception 'Compte % inconnu', v_code; end if;
      insert into public.fiduciary_ext_accounts (firm_id, external_client_id, code, label, type)
      values (p_firm, p_ext, v_code, left(coalesce(nullif(trim(v_line ->> 'account_label'), ''), 'Compte ' || v_code), 120), public.fiduciary_ext_type_of(v_code))
      returning * into v_acc;
    elsif not v_acc.is_active then
      raise exception 'Le compte % est désactivé', v_code;
    end if;
    v_debit := v_debit + v_d;
    v_credit := v_credit + v_c;
    v_out := v_out || jsonb_build_array(jsonb_build_object(
      'account_id', v_acc.id, 'debit', v_d, 'credit', v_c,
      'label', nullif(left(trim(coalesce(v_line ->> 'label', '')), 200), ''),
      'vat_code', nullif(left(trim(coalesce(v_line ->> 'vat_code', '')), 12), '')
    ));
  end loop;
  if jsonb_array_length(v_out) < 2 then raise exception 'Une écriture compte au moins deux lignes'; end if;
  if v_debit <> v_credit then raise exception 'Écriture déséquilibrée : débit % ≠ crédit %', v_debit, v_credit; end if;
  return v_out;
end;
$$;
revoke execute on function public.fiduciary_ext_resolve_lines(uuid, uuid, jsonb, boolean) from public, anon, authenticated;

create or replace function public.fiduciary_ext_insert_entry(
  p_ext uuid, p_firm uuid, p_date date, p_label text, p_reference text, p_lines jsonb, p_source text, p_post boolean,
  p_number integer default null, p_replaces uuid default null, p_reverses uuid default null
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_line jsonb;
  v_i int := 0;
  v_number int := p_number;
begin
  if p_post and v_number is null then
    perform 1 from public.fiduciary_external_clients where id = p_ext for update;
    select coalesce(max(entry_number), 0) + 1 into v_number from public.fiduciary_ext_entries where external_client_id = p_ext and entry_number is not null;
  end if;
  insert into public.fiduciary_ext_entries (firm_id, external_client_id, entry_number, entry_date, label, reference, status, source, replaces_entry_id, reverses_entry_id, posted_at, posted_by)
  values (p_firm, p_ext, case when p_post then v_number end, p_date, left(trim(p_label), 200), nullif(left(trim(coalesce(p_reference, '')), 60), ''),
          case when p_post then 'posted' else 'draft' end, p_source, p_replaces, p_reverses,
          case when p_post then now() end, case when p_post then auth.uid() end)
  returning id into v_id;
  for v_line in select * from jsonb_array_elements(p_lines) loop
    v_i := v_i + 1;
    insert into public.fiduciary_ext_entry_lines (entry_id, account_id, debit, credit, label, vat_code, sort_order)
    values (v_id, (v_line ->> 'account_id')::uuid, (v_line ->> 'debit')::numeric, (v_line ->> 'credit')::numeric, v_line ->> 'label', v_line ->> 'vat_code', v_i);
  end loop;
  return v_id;
end;
$$;
revoke execute on function public.fiduciary_ext_insert_entry(uuid, uuid, date, text, text, jsonb, text, boolean, integer, uuid, uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Opening the ledger: Swiss SME chart of accounts in the client's language.

create or replace function public.acc_ext_ledger_init(p_ext uuid, p_seed boolean default true)
returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_ext(p_ext);
  v_locale text;
  v_count int;
begin
  select locale into v_locale from public.fiduciary_external_clients where id = p_ext;
  update public.fiduciary_external_clients set ledger_started_at = coalesce(ledger_started_at, now()), updated_at = now() where id = p_ext;
  if p_seed then
    insert into public.fiduciary_ext_accounts (firm_id, external_client_id, code, label, type)
    select v_firm, p_ext, x.code, case v_locale when 'de' then x.de when 'it' then x.it else x.fr end, x.type
    from (values
      ('1000', 'actif', 'Caisse', 'Kasse', 'Cassa'),
      ('1020', 'actif', 'Banque', 'Bank', 'Banca'),
      ('1060', 'actif', 'Titres', 'Wertschriften', 'Titoli'),
      ('1100', 'actif', 'Créances clients (débiteurs)', 'Forderungen aus Lieferungen und Leistungen', 'Crediti verso clienti'),
      ('1109', 'actif', 'Ducroire', 'Delkredere', 'Delcredere'),
      ('1140', 'actif', 'Avances et prêts', 'Vorschüsse und Darlehen', 'Anticipi e prestiti'),
      ('1170', 'actif', 'Impôt préalable TVA (matériel, prestations)', 'Vorsteuer MWST Material, Waren, Dienstleistungen', 'Imposta precedente IVA (materiale, prestazioni)'),
      ('1171', 'actif', 'Impôt préalable TVA (investissements, autres charges)', 'Vorsteuer MWST Investitionen, übriger Betriebsaufwand', 'Imposta precedente IVA (investimenti, altri costi)'),
      ('1176', 'actif', 'Impôt anticipé à récupérer', 'Verrechnungssteuer', 'Imposta preventiva da recuperare'),
      ('1200', 'actif', 'Stocks de marchandises', 'Handelswaren', 'Merci'),
      ('1280', 'actif', 'Travaux en cours', 'Nicht fakturierte Dienstleistungen', 'Lavori in corso'),
      ('1300', 'actif', 'Charges payées d''avance', 'Bezahlter Aufwand des Folgejahres', 'Costi pagati in anticipo'),
      ('1301', 'actif', 'Produits à recevoir', 'Noch nicht erhaltener Ertrag', 'Ricavi da incassare'),
      ('1440', 'actif', 'Prêts à long terme', 'Darlehen (Aktiv)', 'Prestiti a lungo termine'),
      ('1480', 'actif', 'Participations', 'Beteiligungen', 'Partecipazioni'),
      ('1500', 'actif', 'Machines et appareils', 'Maschinen und Apparate', 'Macchine e apparecchi'),
      ('1510', 'actif', 'Mobilier et installations', 'Mobiliar und Einrichtungen', 'Mobilio e installazioni'),
      ('1520', 'actif', 'Machines de bureau, informatique', 'Büromaschinen, Informatik', 'Macchine d''ufficio, informatica'),
      ('1530', 'actif', 'Véhicules', 'Fahrzeuge', 'Veicoli'),
      ('1540', 'actif', 'Outillage', 'Werkzeuge', 'Attrezzi'),
      ('1600', 'actif', 'Immeubles', 'Geschäftsliegenschaften', 'Immobili'),
      ('1700', 'actif', 'Brevets, licences', 'Patente, Lizenzen', 'Brevetti, licenze'),
      ('1850', 'actif', 'Capital non libéré', 'Nicht einbezahltes Kapital', 'Capitale non versato'),
      ('2000', 'passif', 'Dettes fournisseurs (créanciers)', 'Verbindlichkeiten aus Lieferungen und Leistungen', 'Debiti verso fornitori'),
      ('2030', 'passif', 'Acomptes de clients', 'Erhaltene Anzahlungen', 'Anticipi da clienti'),
      ('2100', 'passif', 'Dettes bancaires', 'Bankverbindlichkeiten', 'Debiti bancari'),
      ('2200', 'passif', 'TVA due', 'Geschuldete MWST', 'IVA dovuta'),
      ('2201', 'passif', 'Décompte TVA', 'MWST-Abrechnungskonto', 'Conteggio IVA'),
      ('2206', 'passif', 'Impôt anticipé dû', 'Verrechnungssteuer geschuldet', 'Imposta preventiva dovuta'),
      ('2208', 'passif', 'Impôts directs dus', 'Direkte Steuern', 'Imposte dirette dovute'),
      ('2210', 'passif', 'Autres dettes à court terme', 'Übrige kurzfristige Verbindlichkeiten', 'Altri debiti a breve termine'),
      ('2261', 'passif', 'Dividendes décidés', 'Beschlossene Ausschüttungen', 'Dividendi deliberati'),
      ('2270', 'passif', 'Assurances sociales et prévoyance', 'Sozialversicherungen und Vorsorge', 'Assicurazioni sociali e previdenza'),
      ('2300', 'passif', 'Charges à payer', 'Noch nicht bezahlter Aufwand', 'Costi da pagare'),
      ('2301', 'passif', 'Produits reçus d''avance', 'Erhaltener Ertrag des Folgejahres', 'Ricavi incassati in anticipo'),
      ('2330', 'passif', 'Provisions à court terme', 'Kurzfristige Rückstellungen', 'Accantonamenti a breve termine'),
      ('2400', 'passif', 'Dettes bancaires à long terme', 'Langfristige Bankverbindlichkeiten', 'Debiti bancari a lungo termine'),
      ('2450', 'passif', 'Emprunts', 'Darlehen', 'Prestiti'),
      ('2451', 'passif', 'Hypothèques', 'Hypotheken', 'Ipoteche'),
      ('2500', 'passif', 'Autres dettes à long terme', 'Übrige langfristige Verbindlichkeiten', 'Altri debiti a lungo termine'),
      ('2600', 'passif', 'Provisions à long terme', 'Langfristige Rückstellungen', 'Accantonamenti a lungo termine'),
      ('2800', 'passif', 'Capital social', 'Grund-, Gesellschafter- oder Stiftungskapital', 'Capitale sociale'),
      ('2850', 'passif', 'Compte privé', 'Privat', 'Conto privato'),
      ('2900', 'passif', 'Réserves légales', 'Gesetzliche Gewinnreserve', 'Riserve legali'),
      ('2950', 'passif', 'Réserves facultatives', 'Freiwillige Gewinnreserven', 'Riserve facoltative'),
      ('2970', 'passif', 'Bénéfice / perte reporté', 'Gewinnvortrag / Verlustvortrag', 'Utile / perdita riportato'),
      ('2979', 'passif', 'Bénéfice / perte de l''exercice', 'Jahresgewinn / Jahresverlust', 'Utile / perdita d''esercizio'),
      ('3000', 'produit', 'Ventes de produits', 'Produktionserlöse', 'Ricavi da produzione'),
      ('3200', 'produit', 'Ventes de marchandises', 'Handelserlöse', 'Ricavi da merci'),
      ('3400', 'produit', 'Prestations de services', 'Dienstleistungserlöse', 'Ricavi da prestazioni'),
      ('3600', 'produit', 'Autres produits', 'Übrige Erlöse', 'Altri ricavi'),
      ('3800', 'produit', 'Déductions sur ventes', 'Erlösminderungen', 'Diminuzioni di ricavi'),
      ('3805', 'produit', 'Pertes sur créances', 'Verluste aus Forderungen', 'Perdite su crediti'),
      ('3900', 'produit', 'Variation des travaux en cours', 'Bestandesänderungen', 'Variazione dei lavori in corso'),
      ('4000', 'charge', 'Charges de matériel', 'Materialaufwand', 'Costi del materiale'),
      ('4200', 'charge', 'Achats de marchandises', 'Handelswarenaufwand', 'Costi delle merci'),
      ('4400', 'charge', 'Prestations de tiers', 'Aufwand für bezogene Dienstleistungen', 'Prestazioni di terzi'),
      ('4900', 'charge', 'Déductions sur achats', 'Aufwandminderungen', 'Riduzioni di costi'),
      ('5000', 'charge', 'Salaires', 'Lohnaufwand', 'Salari'),
      ('5700', 'charge', 'Charges sociales', 'Sozialversicherungsaufwand', 'Oneri sociali'),
      ('5800', 'charge', 'Autres charges de personnel', 'Übriger Personalaufwand', 'Altri costi del personale'),
      ('5900', 'charge', 'Personnel temporaire', 'Leistungen Dritter', 'Personale temporaneo'),
      ('6000', 'charge', 'Loyers', 'Raumaufwand', 'Affitti'),
      ('6100', 'charge', 'Entretien et réparations', 'Unterhalt, Reparaturen, Ersatz', 'Manutenzione e riparazioni'),
      ('6200', 'charge', 'Charges de véhicules', 'Fahrzeug- und Transportaufwand', 'Costi dei veicoli'),
      ('6260', 'charge', 'Leasing', 'Leasingaufwand', 'Leasing'),
      ('6300', 'charge', 'Assurances, taxes, autorisations', 'Sachversicherungen, Abgaben, Gebühren', 'Assicurazioni, tasse, autorizzazioni'),
      ('6400', 'charge', 'Énergie et évacuation', 'Energie- und Entsorgungsaufwand', 'Energia e smaltimento'),
      ('6500', 'charge', 'Frais d''administration', 'Verwaltungsaufwand', 'Costi amministrativi'),
      ('6510', 'charge', 'Téléphone, internet', 'Telefon, Internet', 'Telefono, internet'),
      ('6530', 'charge', 'Fiduciaire et conseil', 'Buchführungs- und Beratungsaufwand', 'Fiduciaria e consulenza'),
      ('6570', 'charge', 'Informatique', 'Informatikaufwand', 'Informatica'),
      ('6600', 'charge', 'Publicité', 'Werbeaufwand', 'Pubblicità'),
      ('6700', 'charge', 'Autres charges d''exploitation', 'Sonstiger betrieblicher Aufwand', 'Altri costi d''esercizio'),
      ('6800', 'charge', 'Amortissements', 'Abschreibungen', 'Ammortamenti'),
      ('6900', 'charge', 'Charges financières', 'Finanzaufwand', 'Oneri finanziari'),
      ('6940', 'charge', 'Frais bancaires', 'Bankspesen', 'Spese bancarie'),
      ('6950', 'produit', 'Produits financiers', 'Finanzertrag', 'Proventi finanziari'),
      ('7000', 'produit', 'Produits accessoires', 'Ertrag Nebenbetrieb', 'Ricavi attività accessorie'),
      ('7500', 'produit', 'Produits immobiliers', 'Liegenschaftsertrag', 'Ricavi immobiliari'),
      ('7510', 'charge', 'Charges immobilières', 'Liegenschaftsaufwand', 'Costi immobiliari'),
      ('8000', 'charge', 'Charges hors exploitation', 'Betriebsfremder Aufwand', 'Costi estranei all''esercizio'),
      ('8100', 'produit', 'Produits hors exploitation', 'Betriebsfremder Ertrag', 'Ricavi estranei all''esercizio'),
      ('8500', 'charge', 'Charges exceptionnelles', 'Ausserordentlicher Aufwand', 'Costi straordinari'),
      ('8510', 'produit', 'Produits exceptionnels', 'Ausserordentlicher Ertrag', 'Ricavi straordinari'),
      ('8900', 'charge', 'Impôts directs', 'Direkte Steuern', 'Imposte dirette'),
      ('9100', 'actif', 'Bilan d''ouverture', 'Eröffnungsbilanz', 'Bilancio d''apertura')
    ) as x(code, type, fr, de, it)
    on conflict (external_client_id, code) do nothing;
  end if;
  select count(*) into v_count from public.fiduciary_ext_accounts where external_client_id = p_ext;
  perform public.fiduciary_audit(v_firm, null, 'ledger_opened', jsonb_build_object('external_client_id', p_ext, 'accounts', v_count));
  return v_count;
end;
$$;
revoke execute on function public.acc_ext_ledger_init(uuid, boolean) from public, anon;
grant execute on function public.acc_ext_ledger_init(uuid, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- Chart of accounts

create or replace function public.acc_ext_accounts(p_ext uuid)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.acc_assert_ext(p_ext);
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', a.id, 'code', a.code, 'label', a.label, 'type', a.type, 'is_active', a.is_active,
      'used', exists (select 1 from public.fiduciary_ext_entry_lines l join public.fiduciary_ext_entries e on e.id = l.entry_id
                      where l.account_id = a.id and e.status in ('draft', 'posted'))
    ) order by a.code)
    from public.fiduciary_ext_accounts a where a.external_client_id = p_ext
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_ext_accounts(uuid) from public, anon;
grant execute on function public.acc_ext_accounts(uuid) to authenticated;

-- Create or update an account by its code.
create or replace function public.acc_ext_save_account(p_ext uuid, p_code text, p_label text, p_type text default null, p_active boolean default true)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_ext(p_ext);
  v_id uuid;
  v_code text := trim(coalesce(p_code, ''));
begin
  if v_code !~ '^[0-9A-Za-z.]{1,12}$' then raise exception 'Numéro de compte invalide'; end if;
  if coalesce(trim(p_label), '') = '' then raise exception 'Libellé manquant'; end if;
  insert into public.fiduciary_ext_accounts (firm_id, external_client_id, code, label, type, is_active)
  values (v_firm, p_ext, v_code, left(trim(p_label), 120), coalesce(nullif(p_type, ''), public.fiduciary_ext_type_of(v_code)), coalesce(p_active, true))
  on conflict (external_client_id, code) do update set
    label = excluded.label, type = coalesce(nullif(p_type, ''), fiduciary_ext_accounts.type), is_active = excluded.is_active, updated_at = now()
  returning id into v_id;
  return v_id;
end;
$$;
revoke execute on function public.acc_ext_save_account(uuid, text, text, text, boolean) from public, anon;
grant execute on function public.acc_ext_save_account(uuid, text, text, text, boolean) to authenticated;

-- Import a chart: [{code, label, type?}], existing codes get the new label.
create or replace function public.acc_ext_import_accounts(p_ext uuid, p_accounts jsonb)
returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_a jsonb;
  v_n int := 0;
begin
  perform public.acc_assert_ext(p_ext);
  if jsonb_typeof(p_accounts) <> 'array' or jsonb_array_length(p_accounts) > 3000 then raise exception 'Liste de comptes invalide'; end if;
  for v_a in select * from jsonb_array_elements(p_accounts) loop
    if coalesce(trim(v_a ->> 'code'), '') ~ '^[0-9A-Za-z.]{1,12}$' and coalesce(trim(v_a ->> 'label'), '') <> '' then
      perform public.acc_ext_save_account(p_ext, v_a ->> 'code', v_a ->> 'label',
        case when v_a ->> 'type' in ('actif', 'passif', 'produit', 'charge') then v_a ->> 'type' end, true);
      v_n := v_n + 1;
    end if;
  end loop;
  update public.fiduciary_external_clients set ledger_started_at = coalesce(ledger_started_at, now()) where id = p_ext;
  return v_n;
end;
$$;
revoke execute on function public.acc_ext_import_accounts(uuid, jsonb) from public, anon;
grant execute on function public.acc_ext_import_accounts(uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Entries

-- New entry (p_id null), or a new version of a draft / of a posted entry
-- in an open period (the old one is kept, 'discarded' / 'replaced'; a
-- posted entry keeps its number). Returns {id, entry_number}.
create or replace function public.acc_ext_save_entry(
  p_ext uuid, p_id uuid, p_date date, p_label text, p_reference text, p_lines jsonb, p_post boolean default true
)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.fiduciary_ext_assert_open(p_ext, p_date);
  v_old public.fiduciary_ext_entries%rowtype;
  v_lines jsonb;
  v_id uuid;
  v_post boolean := coalesce(p_post, true);
begin
  if coalesce(trim(p_label), '') = '' then raise exception 'Libellé manquant'; end if;
  v_lines := public.fiduciary_ext_resolve_lines(p_ext, v_firm, p_lines, false);
  if p_id is not null then
    select * into v_old from public.fiduciary_ext_entries where id = p_id and external_client_id = p_ext for update;
    if not found then raise exception 'Écriture introuvable'; end if;
    if v_old.status not in ('draft', 'posted') then raise exception 'Cette écriture a déjà été modifiée'; end if;
    if v_old.status = 'posted' then
      perform public.fiduciary_ext_assert_open(p_ext, v_old.entry_date);
      if v_old.reversed_by_entry_id is not null or v_old.reverses_entry_id is not null then raise exception 'Une écriture extournée ne se modifie plus'; end if;
      v_post := true;
    end if;
    update public.fiduciary_ext_entries set status = case when status = 'draft' then 'discarded' else 'replaced' end where id = p_id;
    v_id := public.fiduciary_ext_insert_entry(p_ext, v_firm, p_date, p_label, p_reference, v_lines, v_old.source, v_post,
      case when v_old.status = 'posted' then v_old.entry_number end, p_id, null);
    if v_old.status = 'posted' then
      perform public.fiduciary_audit(v_firm, null, 'ledger_entry_changed', jsonb_build_object('external_client_id', p_ext, 'number', v_old.entry_number, 'old_entry_id', p_id, 'new_entry_id', v_id));
    end if;
  else
    v_id := public.fiduciary_ext_insert_entry(p_ext, v_firm, p_date, p_label, p_reference, v_lines, 'manual', v_post);
  end if;
  return jsonb_build_object('id', v_id, 'entry_number', (select entry_number from public.fiduciary_ext_entries where id = v_id));
end;
$$;
revoke execute on function public.acc_ext_save_entry(uuid, uuid, date, text, text, jsonb, boolean) from public, anon;
grant execute on function public.acc_ext_save_entry(uuid, uuid, date, text, text, jsonb, boolean) to authenticated;

-- post (a draft) / discard (a draft) / reverse (a posted entry, dated
-- p_date or its own date).
create or replace function public.acc_ext_entry_action(p_id uuid, p_action text, p_date date default null)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_e public.fiduciary_ext_entries%rowtype;
  v_firm uuid;
  v_lines jsonb;
  v_new uuid;
  v_number int;
begin
  select * into v_e from public.fiduciary_ext_entries where id = p_id for update;
  if not found then raise exception 'Écriture introuvable'; end if;
  v_firm := public.acc_assert_ext(v_e.external_client_id);
  if p_action = 'post' then
    if v_e.status <> 'draft' then raise exception 'Seul un brouillon se comptabilise'; end if;
    perform public.fiduciary_ext_assert_open(v_e.external_client_id, v_e.entry_date);
    perform 1 from public.fiduciary_external_clients where id = v_e.external_client_id for update;
    select coalesce(max(entry_number), 0) + 1 into v_number from public.fiduciary_ext_entries where external_client_id = v_e.external_client_id and entry_number is not null;
    update public.fiduciary_ext_entries set status = 'posted', entry_number = v_number, posted_at = now(), posted_by = auth.uid() where id = p_id;
    return jsonb_build_object('id', p_id, 'entry_number', v_number);
  elsif p_action = 'discard' then
    if v_e.status <> 'draft' then raise exception 'Seul un brouillon se supprime ; extournez une écriture comptabilisée'; end if;
    update public.fiduciary_ext_entries set status = 'discarded' where id = p_id;
    return jsonb_build_object('id', p_id);
  elsif p_action = 'reverse' then
    if v_e.status <> 'posted' then raise exception 'Seule une écriture comptabilisée s''extourne'; end if;
    if v_e.reversed_by_entry_id is not null then raise exception 'Écriture déjà extournée'; end if;
    if v_e.reverses_entry_id is not null then raise exception 'Une extourne ne s''extourne pas'; end if;
    perform public.fiduciary_ext_assert_open(v_e.external_client_id, coalesce(p_date, v_e.entry_date));
    select coalesce(jsonb_agg(jsonb_build_object('account_id', l.account_id, 'debit', l.credit, 'credit', l.debit, 'label', l.label, 'vat_code', l.vat_code) order by l.sort_order), '[]'::jsonb)
    into v_lines from public.fiduciary_ext_entry_lines l where l.entry_id = p_id;
    v_new := public.fiduciary_ext_insert_entry(v_e.external_client_id, v_firm, coalesce(p_date, v_e.entry_date),
      left('Extourne : ' || v_e.label, 200), v_e.reference, v_lines, 'reversal', true, null, null, p_id);
    update public.fiduciary_ext_entries set reversed_by_entry_id = v_new where id = p_id;
    perform public.fiduciary_audit(v_firm, null, 'ledger_entry_reversed', jsonb_build_object('external_client_id', v_e.external_client_id, 'number', v_e.entry_number));
    return jsonb_build_object('id', v_new, 'entry_number', (select entry_number from public.fiduciary_ext_entries where id = v_new));
  end if;
  raise exception 'Action inconnue';
end;
$$;
revoke execute on function public.acc_ext_entry_action(uuid, text, date) from public, anon;
grant execute on function public.acc_ext_entry_action(uuid, text, date) to authenticated;

-- Bulk import (Banana / Abacus / Winbiz / CSV, opening balances):
-- [{date, label, reference, lines:[…]}], all or nothing. Unknown accounts
-- are created when p_create_accounts.
create or replace function public.acc_ext_import_entries(p_ext uuid, p_entries jsonb, p_post boolean default true, p_create_accounts boolean default true, p_source text default 'import')
returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_ext(p_ext);
  v_e jsonb;
  v_date date;
  v_n int := 0;
  v_i int := 0;
begin
  if p_source not in ('import', 'opening') then raise exception 'Source inconnue'; end if;
  if jsonb_typeof(p_entries) <> 'array' or jsonb_array_length(p_entries) = 0 then raise exception 'Aucune écriture à importer'; end if;
  if jsonb_array_length(p_entries) > 5000 then raise exception 'Au maximum 5000 écritures par import'; end if;
  for v_e in select * from jsonb_array_elements(p_entries) loop
    v_i := v_i + 1;
    begin
      v_date := (v_e ->> 'date')::date;
    exception when others then
      raise exception 'Écriture %: date invalide (%)', v_i, v_e ->> 'date';
    end;
    begin
      perform public.fiduciary_ext_assert_open(p_ext, v_date);
      perform public.fiduciary_ext_insert_entry(p_ext, v_firm, v_date,
        coalesce(nullif(trim(v_e ->> 'label'), ''), case when p_source = 'opening' then 'Soldes d''ouverture' else 'Écriture importée' end),
        v_e ->> 'reference', public.fiduciary_ext_resolve_lines(p_ext, v_firm, v_e -> 'lines', coalesce(p_create_accounts, true)), p_source, coalesce(p_post, true));
    exception when others then
      raise exception 'Écriture % (%): %', v_i, coalesce(v_e ->> 'reference', v_e ->> 'label', ''), sqlerrm;
    end;
    v_n := v_n + 1;
  end loop;
  perform public.fiduciary_audit(v_firm, null, 'ledger_import', jsonb_build_object('external_client_id', p_ext, 'entries', v_n, 'source', p_source));
  return v_n;
end;
$$;
revoke execute on function public.acc_ext_import_entries(uuid, jsonb, boolean, boolean, text) from public, anon;
grant execute on function public.acc_ext_import_entries(uuid, jsonb, boolean, boolean, text) to authenticated;

-- The journal: entries of a period (status 'all' = drafts and posted),
-- optionally of one account or matching a text. {total, rows}.
create or replace function public.acc_ext_entries(
  p_ext uuid, p_from date default null, p_to date default null, p_status text default 'all', p_account text default null,
  p_search text default null, p_limit integer default 200, p_offset integer default 0
)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_ext(p_ext);
  v_total int;
  v_rows jsonb;
  v_q text := nullif(trim(coalesce(p_search, '')), '');
begin
  with base as (
    select e.* from public.fiduciary_ext_entries e
    where e.external_client_id = p_ext
      and (case coalesce(p_status, 'all') when 'all' then e.status in ('draft', 'posted') else e.status = p_status end)
      and (p_from is null or e.entry_date >= p_from) and (p_to is null or e.entry_date <= p_to)
      and (p_account is null or exists (select 1 from public.fiduciary_ext_entry_lines l join public.fiduciary_ext_accounts a on a.id = l.account_id where l.entry_id = e.id and a.code = p_account))
      and (v_q is null or e.label ilike '%' || v_q || '%' or coalesce(e.reference, '') ilike '%' || v_q || '%' or e.entry_number::text = v_q
           or exists (select 1 from public.fiduciary_ext_entry_lines l where l.entry_id = e.id and (coalesce(l.label, '') ilike '%' || v_q || '%' or to_char(greatest(l.debit, l.credit), 'FM999999999990.00') = replace(replace(v_q, '''', ''), ',', '.'))))
  )
  select (select count(*) from base),
    coalesce((select jsonb_agg(x order by (x ->> 'entry_date') desc, (x ->> 'entry_number')::int desc nulls first, x ->> 'created_at' desc) from (
      select jsonb_build_object(
        'id', b.id, 'entry_number', b.entry_number, 'entry_date', b.entry_date, 'label', b.label, 'reference', b.reference,
        'status', b.status, 'source', b.source, 'created_at', b.created_at, 'changed', b.replaces_entry_id is not null,
        'reverses_entry_id', b.reverses_entry_id, 'reversed_by_entry_id', b.reversed_by_entry_id,
        'created_by_name', public.acc_member_name(v_firm, b.created_by),
        'amount', (select sum(l.debit) from public.fiduciary_ext_entry_lines l where l.entry_id = b.id),
        'lines', (select jsonb_agg(jsonb_build_object('account_code', a.code, 'account_label', a.label, 'debit', l.debit, 'credit', l.credit, 'label', l.label, 'vat_code', l.vat_code) order by l.sort_order)
                  from public.fiduciary_ext_entry_lines l join public.fiduciary_ext_accounts a on a.id = l.account_id where l.entry_id = b.id)
      ) as x
      from base b
      order by b.entry_date desc, b.entry_number desc nulls first, b.created_at desc
      limit least(greatest(coalesce(p_limit, 200), 1), 2000) offset greatest(coalesce(p_offset, 0), 0)
    ) t), '[]'::jsonb)
  into v_total, v_rows;
  return jsonb_build_object('total', v_total, 'rows', v_rows);
end;
$$;
revoke execute on function public.acc_ext_entries(uuid, date, date, text, text, text, integer, integer) from public, anon;
grant execute on function public.acc_ext_entries(uuid, date, date, text, text, text, integer, integer) to authenticated;

-- Lock (or reopen, p_until null) the period up to a date. Admins.
create or replace function public.acc_ext_set_lock(p_ext uuid, p_until date)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_firm uuid := public.acc_assert_ext(p_ext);
begin
  if public.my_fiduciary_role() not in ('OWNER', 'ADMIN') then raise exception 'Réservé aux administrateurs'; end if;
  if p_until is not null and exists (select 1 from public.fiduciary_ext_entries where external_client_id = p_ext and status = 'draft' and entry_date <= p_until) then
    raise exception 'Des brouillons restent dans cette période : comptabilisez-les ou supprimez-les d''abord';
  end if;
  update public.fiduciary_external_clients set ledger_locked_until = p_until, updated_at = now() where id = p_ext;
  perform public.fiduciary_audit(v_firm, null, case when p_until is null then 'ledger_unlocked' else 'ledger_locked' end,
    jsonb_build_object('external_client_id', p_ext, 'until', p_until));
end;
$$;
revoke execute on function public.acc_ext_set_lock(uuid, date) from public, anon;
grant execute on function public.acc_ext_set_lock(uuid, date) to authenticated;

-- ---------------------------------------------------------------------------
-- Reports (posted entries only)

-- Trial balance of a period. Balance sheet accounts open with everything
-- before p_from; income accounts with the fiscal year up to p_from.
create or replace function public.acc_ext_trial_balance(p_ext uuid, p_from date, p_to date)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_fy date;
begin
  perform public.acc_assert_ext(p_ext);
  v_fy := public.fiduciary_ext_fy_start(p_ext, p_from);
  return coalesce((
    select jsonb_agg(jsonb_build_object('code', x.code, 'label', x.label, 'type', x.type, 'opening', x.opening, 'debit', x.debit, 'credit', x.credit,
                                        'closing', x.opening + x.debit - x.credit) order by x.code)
    from (
      select a.code, a.label, a.type,
        coalesce(sum(l.debit - l.credit) filter (where e.entry_date < p_from and (a.type in ('actif', 'passif') or e.entry_date >= v_fy)), 0) as opening,
        coalesce(sum(l.debit) filter (where e.entry_date between p_from and p_to), 0) as debit,
        coalesce(sum(l.credit) filter (where e.entry_date between p_from and p_to), 0) as credit
      from public.fiduciary_ext_accounts a
      left join public.fiduciary_ext_entry_lines l on l.account_id = a.id
      left join public.fiduciary_ext_entries e on e.id = l.entry_id and e.status = 'posted' and e.entry_date <= p_to
      where a.external_client_id = p_ext
      group by a.code, a.label, a.type
    ) x
    where x.opening <> 0 or x.debit <> 0 or x.credit <> 0
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_ext_trial_balance(uuid, date, date) from public, anon;
grant execute on function public.acc_ext_trial_balance(uuid, date, date) to authenticated;

-- General ledger of one account: opening, movements with running balance.
create or replace function public.acc_ext_account_ledger(p_ext uuid, p_code text, p_from date, p_to date)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_acc public.fiduciary_ext_accounts%rowtype;
  v_fy date;
  v_opening numeric;
begin
  perform public.acc_assert_ext(p_ext);
  select * into v_acc from public.fiduciary_ext_accounts where external_client_id = p_ext and code = p_code;
  if v_acc.id is null then raise exception 'Compte % inconnu', p_code; end if;
  v_fy := public.fiduciary_ext_fy_start(p_ext, p_from);
  select coalesce(sum(l.debit - l.credit), 0) into v_opening
  from public.fiduciary_ext_entry_lines l join public.fiduciary_ext_entries e on e.id = l.entry_id
  where l.account_id = v_acc.id and e.status = 'posted' and e.entry_date < p_from and (v_acc.type in ('actif', 'passif') or e.entry_date >= v_fy);
  return jsonb_build_object(
    'code', v_acc.code, 'label', v_acc.label, 'type', v_acc.type, 'opening', v_opening,
    'rows', coalesce((
      select jsonb_agg(jsonb_build_object('entry_id', x.entry_id, 'entry_number', x.entry_number, 'entry_date', x.entry_date, 'reference', x.reference,
                                          'label', x.label, 'debit', x.debit, 'credit', x.credit, 'balance', v_opening + x.running,
                                          'counterpart', x.counterpart) order by x.entry_date, x.entry_number, x.sort_order)
      from (
        select e.id as entry_id, e.entry_number, e.entry_date, e.reference, coalesce(l.label, e.label) as label, l.debit, l.credit, l.sort_order,
          sum(l.debit - l.credit) over (order by e.entry_date, e.entry_number, l.sort_order rows unbounded preceding) as running,
          (select string_agg(distinct a2.code, ', ') from public.fiduciary_ext_entry_lines l2 join public.fiduciary_ext_accounts a2 on a2.id = l2.account_id
           where l2.entry_id = e.id and l2.account_id <> v_acc.id) as counterpart
        from public.fiduciary_ext_entry_lines l join public.fiduciary_ext_entries e on e.id = l.entry_id
        where l.account_id = v_acc.id and e.status = 'posted' and e.entry_date between p_from and p_to
      ) x
    ), '[]'::jsonb)
  );
end;
$$;
revoke execute on function public.acc_ext_account_ledger(uuid, text, date, date) from public, anon;
grant execute on function public.acc_ext_account_ledger(uuid, text, date, date) to authenticated;

-- Balance sheet at p_to and income statement of its fiscal year (or from
-- p_from). Results of earlier years not yet booked to equity are shown as
-- 'prior_results' so the balance sheet always balances.
create or replace function public.acc_ext_statements(p_ext uuid, p_to date, p_from date default null)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_fy date;
  v_from date;
begin
  perform public.acc_assert_ext(p_ext);
  v_fy := public.fiduciary_ext_fy_start(p_ext, p_to);
  v_from := greatest(coalesce(p_from, v_fy), v_fy);
  return (
    with bal as (
      select a.code, a.label, a.type,
        coalesce(sum(l.debit - l.credit) filter (where a.type in ('actif', 'passif')), 0) as bs,
        coalesce(sum(l.debit - l.credit) filter (where a.type in ('produit', 'charge') and e.entry_date between v_from and p_to), 0) as pl,
        coalesce(sum(l.debit - l.credit) filter (where a.type in ('produit', 'charge') and e.entry_date < v_fy), 0) as prior
      from public.fiduciary_ext_accounts a
      join public.fiduciary_ext_entry_lines l on l.account_id = a.id
      join public.fiduciary_ext_entries e on e.id = l.entry_id and e.status = 'posted' and e.entry_date <= p_to
      where a.external_client_id = p_ext
      group by a.code, a.label, a.type
    )
    select jsonb_build_object(
      'from', v_from, 'to', p_to, 'fy_start', v_fy,
      'assets', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'label', label, 'amount', bs) order by code) from bal where type = 'actif' and bs <> 0), '[]'::jsonb),
      'liabilities', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'label', label, 'amount', -bs) order by code) from bal where type = 'passif' and bs <> 0), '[]'::jsonb),
      'income', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'label', label, 'amount', -pl) order by code) from bal where type = 'produit' and pl <> 0), '[]'::jsonb),
      'expenses', coalesce((select jsonb_agg(jsonb_build_object('code', code, 'label', label, 'amount', pl) order by code) from bal where type = 'charge' and pl <> 0), '[]'::jsonb),
      'result', coalesce((select -sum(pl) from bal), 0),
      'year_result', coalesce((select -sum(l.debit - l.credit)
        from public.fiduciary_ext_accounts a join public.fiduciary_ext_entry_lines l on l.account_id = a.id
        join public.fiduciary_ext_entries e on e.id = l.entry_id and e.status = 'posted'
        where a.external_client_id = p_ext and a.type in ('produit', 'charge') and e.entry_date between v_fy and p_to), 0),
      'prior_results', coalesce((select -sum(prior) from bal), 0)
    )
  );
end;
$$;
revoke execute on function public.acc_ext_statements(uuid, date, date) from public, anon;
grant execute on function public.acc_ext_statements(uuid, date, date) to authenticated;

-- VAT summary of a period: net amounts per VAT code (lines carrying a
-- code, VAT accounts excluded) and the balances of the VAT accounts
-- (2200 due, 1170/1171 input tax).
create or replace function public.acc_ext_vat_summary(p_ext uuid, p_from date, p_to date)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.acc_assert_ext(p_ext);
  return jsonb_build_object(
    'codes', coalesce((
      select jsonb_agg(jsonb_build_object('vat_code', x.vat_code, 'net', x.net, 'lines', x.n) order by x.vat_code)
      from (
        select l.vat_code, round(sum(case when a.type in ('produit', 'passif') then l.credit - l.debit else l.debit - l.credit end), 2) as net, count(*) as n
        from public.fiduciary_ext_entry_lines l
        join public.fiduciary_ext_entries e on e.id = l.entry_id and e.status = 'posted'
        join public.fiduciary_ext_accounts a on a.id = l.account_id
        where e.external_client_id = p_ext and e.entry_date between p_from and p_to and l.vat_code is not null
          and a.code not in ('2200', '1170', '1171')
        group by l.vat_code
      ) x
    ), '[]'::jsonb),
    'vat_due', coalesce((select round(sum(l.credit - l.debit), 2) from public.fiduciary_ext_entry_lines l
      join public.fiduciary_ext_entries e on e.id = l.entry_id and e.status = 'posted' join public.fiduciary_ext_accounts a on a.id = l.account_id
      where e.external_client_id = p_ext and e.entry_date between p_from and p_to and a.code = '2200' and e.source <> 'opening'), 0),
    'input_tax', coalesce((select round(sum(l.debit - l.credit), 2) from public.fiduciary_ext_entry_lines l
      join public.fiduciary_ext_entries e on e.id = l.entry_id and e.status = 'posted' join public.fiduciary_ext_accounts a on a.id = l.account_id
      where e.external_client_id = p_ext and e.entry_date between p_from and p_to and a.code in ('1170', '1171') and e.source <> 'opening'), 0)
  );
end;
$$;
revoke execute on function public.acc_ext_vat_summary(uuid, date, date) from public, anon;
grant execute on function public.acc_ext_vat_summary(uuid, date, date) to authenticated;

-- Indicators, same shape as acc_kpis_internal (Cantia clients).
create or replace function public.fiduciary_ext_kpis(p_ext uuid, p_as_of date)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_from date := public.fiduciary_ext_fy_start(p_ext, p_as_of);
  v_prev_from date;
  v_prev_to date;
  v_cur jsonb;
  v_prev jsonb;
  v_bal jsonb;
  v_monthly jsonb;
begin
  v_prev_from := (v_from - interval '1 year')::date;
  v_prev_to := (p_as_of - interval '1 year')::date;

  with lines as (
    select a.code, e.entry_date, l.debit, l.credit
    from public.fiduciary_ext_entry_lines l
    join public.fiduciary_ext_entries e on e.id = l.entry_id
    join public.fiduciary_ext_accounts a on a.id = l.account_id
    where e.external_client_id = p_ext and e.status = 'posted' and e.entry_date <= p_as_of
  ),
  pl as (
    select (entry_date >= v_from) as cur,
      round(sum(credit - debit) filter (where code like '3%'), 2) as revenue,
      round(sum(debit - credit) filter (where code like '4%'), 2) as material,
      round(sum(debit - credit) filter (where code like '5%'), 2) as personnel,
      round(sum(debit - credit) filter (where code like '6%' and code not like '68%' and code not like '69%'), 2) as opex,
      round(sum(debit - credit) filter (where code like '68%'), 2) as depreciation,
      round(sum(debit - credit) filter (where code like '69%'), 2) as financial,
      round(sum(debit - credit) filter (where code like '7%' or (code like '8%' and code not like '89%')), 2) as other,
      round(sum(debit - credit) filter (where code like '89%'), 2) as taxes,
      count(*) as lines
    from lines
    where (entry_date between v_from and p_as_of) or (entry_date between v_prev_from and v_prev_to)
    group by 1
  )
  select
    (select to_jsonb(p) - 'cur' from pl p where cur),
    (select to_jsonb(p) - 'cur' from pl p where not cur)
  into v_cur, v_prev;

  with lines as (
    select a.code, l.debit, l.credit
    from public.fiduciary_ext_entry_lines l
    join public.fiduciary_ext_entries e on e.id = l.entry_id
    join public.fiduciary_ext_accounts a on a.id = l.account_id
    where e.external_client_id = p_ext and e.status = 'posted' and e.entry_date <= p_as_of
  )
  select jsonb_build_object(
    'liquid', round(coalesce(sum(debit - credit) filter (where code like '10%'), 0), 2),
    'receivables', round(coalesce(sum(debit - credit) filter (where code like '11%'), 0), 2),
    'inventory', round(coalesce(sum(debit - credit) filter (where code like '12%'), 0), 2),
    'current_assets', round(coalesce(sum(debit - credit) filter (where left(code, 2) in ('10', '11', '12', '13')), 0), 2),
    'total_assets', round(coalesce(sum(debit - credit) filter (where code like '1%'), 0), 2),
    'short_term_debt', round(coalesce(sum(credit - debit) filter (where left(code, 2) in ('20', '21', '22', '23')), 0), 2),
    'long_term_debt', round(coalesce(sum(credit - debit) filter (where left(code, 2) in ('24', '25', '26', '27')), 0), 2)
  ) into v_bal from lines;

  select coalesce(jsonb_agg(jsonb_build_object('month', to_char(mm, 'YYYY-MM'), 'revenue', coalesce(x.revenue, 0), 'result', coalesce(x.result, 0)) order by mm), '[]'::jsonb)
  into v_monthly
  from generate_series(date_trunc('month', p_as_of) - interval '11 months', date_trunc('month', p_as_of), interval '1 month') mm
  left join lateral (
    select round(sum(l.credit - l.debit) filter (where a.code like '3%'), 2) as revenue,
           round(sum(l.credit - l.debit) filter (where left(a.code, 1) in ('3', '4', '5', '6', '7', '8')), 2) as result
    from public.fiduciary_ext_entry_lines l
    join public.fiduciary_ext_entries e on e.id = l.entry_id
    join public.fiduciary_ext_accounts a on a.id = l.account_id
    where e.external_client_id = p_ext and e.status = 'posted' and e.entry_date >= mm and e.entry_date < mm + interval '1 month'
  ) x on true;

  return jsonb_build_object(
    'period', jsonb_build_object('from', v_from, 'to', p_as_of, 'prev_from', v_prev_from, 'prev_to', v_prev_to),
    'current', coalesce(v_cur, '{}'::jsonb),
    'previous', coalesce(v_prev, '{}'::jsonb),
    'balance', v_bal,
    'monthly', v_monthly,
    'last_entry_date', (select max(entry_date) from public.fiduciary_ext_entries where external_client_id = p_ext and status = 'posted')
  );
end;
$$;
revoke execute on function public.fiduciary_ext_kpis(uuid, date) from public, anon, authenticated;

create or replace function public.acc_ext_kpis(p_ext uuid, p_as_of date default current_date)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.acc_assert_ext(p_ext);
  return public.fiduciary_ext_kpis(p_ext, coalesce(p_as_of, current_date));
end;
$$;
revoke execute on function public.acc_ext_kpis(uuid, date) from public, anon;
grant execute on function public.acc_ext_kpis(uuid, date) to authenticated;

-- The portfolio now shows the figures of external clients kept in Cantia.
create or replace function public.acc_portfolio()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_firm uuid := public.my_fiduciary_firm_id();
begin
  if v_firm is null then raise exception 'Accès refusé'; end if;
  return coalesce((
    select jsonb_agg(x order by x ->> 'name')
    from (
      select jsonb_build_object(
        'kind', 'cantia', 'organization_id', o.id, 'external_client_id', null, 'name', o.name, 'software', 'cantia',
        'assigned_to', p.assigned_to, 'assigned_name', public.acc_member_name(v_firm, p.assigned_to),
        'kpis', case when o.id in (select public.fiduciary_org_ids('VIEW_ACCOUNTING_DOCUMENTS')) then public.acc_kpis_internal(o.id, current_date) end,
        'requests_open', (select count(*) from public.fiduciary_requests r where r.firm_id = v_firm and r.organization_id = o.id and r.status = 'open'),
        'requests_answered', (select count(*) from public.fiduciary_requests r where r.firm_id = v_firm and r.organization_id = o.id and r.status = 'answered'),
        'work_open', (select count(*) from public.fiduciary_work_items w where w.firm_id = v_firm and w.organization_id = o.id and w.status not in ('done', 'cancelled')),
        'approvals_pending', (select count(*) from public.fiduciary_approvals a where a.firm_id = v_firm and a.organization_id = o.id and a.status = 'pending'),
        'unbilled_minutes', (select coalesce(sum(t.minutes), 0) from public.fiduciary_time_entries t where t.firm_id = v_firm and t.organization_id = o.id and t.status = 'open' and t.billable)
      ) as x
      from public.organizations o
      left join public.fiduciary_client_profiles p on p.firm_id = v_firm and p.organization_id = o.id
      where o.id in (select public.fiduciary_org_ids(null))
      union all
      select jsonb_build_object(
        'kind', 'external', 'organization_id', null, 'external_client_id', c.id, 'name', c.name,
        'software', case when c.ledger_started_at is not null then 'cantia' else c.software end,
        'assigned_to', c.assigned_to, 'assigned_name', public.acc_member_name(v_firm, c.assigned_to),
        'kpis', case when exists (select 1 from public.fiduciary_ext_entries e where e.external_client_id = c.id and e.status = 'posted')
                then public.fiduciary_ext_kpis(c.id, current_date) end,
        'requests_open', (select count(*) from public.fiduciary_external_requests r where r.external_client_id = c.id and r.status = 'open'),
        'requests_answered', (select count(*) from public.fiduciary_external_requests r where r.external_client_id = c.id and r.status = 'answered'),
        'work_open', (select count(*) from public.fiduciary_work_items w where w.external_client_id = c.id and w.status not in ('done', 'cancelled')),
        'approvals_pending', (select count(*) from public.fiduciary_approvals a where a.external_client_id = c.id and a.status = 'pending'),
        'unbilled_minutes', (select coalesce(sum(t.minutes), 0) from public.fiduciary_time_entries t where t.external_client_id = c.id and t.status = 'open' and t.billable)
      )
      from public.fiduciary_external_clients c
      where c.firm_id = v_firm and c.status = 'ACTIVE'
    ) t
  ), '[]'::jsonb);
end;
$$;
revoke execute on function public.acc_portfolio() from public, anon;
grant execute on function public.acc_portfolio() to authenticated;

notify pgrst, 'reload schema';
