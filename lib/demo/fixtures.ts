// @ts-nocheck
// Sample company of the read-only demo (demo.cantia.ch): Atelier Martin SA,
// the same data as the screenshots of the site. Built per language and
// relative to today, so the demo never looks out of date. Served to the app
// by lib/demo/fetch.ts instead of Supabase; nothing here is a real customer.
export type DemoLocale = 'fr' | 'de' | 'it';

export function buildDemoFixtures(LOC: DemoLocale, now: number = Date.now()): any {

  const TX = {
    fr: {},
    de: { 'Aménagement bureaux': 'Büroausbau', 'Rénovation vestiaires école': 'Umbau Schulgarderoben', 'Cuisine Villa Rossier': 'Küche Villa Rossier', 'M. et Mme Dubois': 'Herr und Frau Dubois', 'Famille Rossier': 'Familie Rossier', 'Gemeinde Pully': 'Gemeinde Pully', 'Commune de Pully': 'Gemeinde Pully', 'Point avec le client': 'Besprechung mit dem Kunden', 'Réception des travaux': 'Bauabnahme', 'Métrés bureaux 2e étage': 'Ausmass Büros 2. Stock', 'Carrelage salle de bain': 'Plattenarbeiten Bad', 'Raccordements sanitaires': 'Sanitäranschlüsse', 'Pose des cloisons': 'Trennwände montieren', 'Commander le carrelage de sol pour la Villa des Vignes': 'Bodenplatten für die Villa des Vignes bestellen', 'Relancer la Commune de Pully pour le solde': 'Gemeinde Pully an den Restbetrag erinnern', 'Préparer le décompte TVA du trimestre': 'MWST-Abrechnung des Quartals vorbereiten', 'Loyer atelier': 'Miete Werkstatt', 'Leasing camionnette': 'Leasing Lieferwagen', 'Assurance RC entreprise': 'Betriebshaftpflicht', 'Fondation Les Tilleuls': 'Stiftung Les Tilleuls', 'Régie du Lac SA': 'Régie du Lac SA' },
    it: { 'Aménagement bureaux': 'Allestimento uffici', 'Rénovation vestiaires école': 'Ristrutturazione spogliatoi scuola', 'Cuisine Villa Rossier': 'Cucina Villa Rossier', 'M. et Mme Dubois': 'Sig. e Sig.ra Dubois', 'Famille Rossier': 'Famiglia Rossier', 'Commune de Pully': 'Comune di Pully', 'Point avec le client': 'Incontro con il cliente', 'Réception des travaux': 'Collaudo dei lavori', 'Métrés bureaux 2e étage': 'Misure uffici 2° piano', 'Carrelage salle de bain': 'Piastrelle bagno', 'Raccordements sanitaires': 'Allacciamenti sanitari', 'Pose des cloisons': 'Posa delle pareti divisorie', 'Commander le carrelage de sol pour la Villa des Vignes': 'Ordinare le piastrelle del pavimento per la Villa des Vignes', 'Relancer la Commune de Pully pour le solde': 'Sollecitare il Comune di Pully per il saldo', 'Préparer le décompte TVA du trimestre': 'Preparare il rendiconto IVA del trimestre', 'Loyer atelier': 'Affitto laboratorio', 'Leasing camionnette': 'Leasing furgone', 'Assurance RC entreprise': 'Assicurazione RC aziendale', 'Fondation Les Tilleuls': 'Fondazione Les Tilleuls', 'Régie du Lac SA': 'Régie du Lac SA' },
  }[LOC];
  const T = (s) => TX[s] ?? s;
  const today = new Date(now); today.setUTCHours(9, 0, 0, 0);
  const iso = (d) => d.toISOString().slice(0, 10);
  const add = (n) => { const d = new Date(today); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
  const ORG = 'o-atelier-martin', USER = 'u-lucie-martin';
  const org = { id: ORG, name: 'Atelier Martin SA', trade: 'carreleur', logo_url: null, signature_url: null, address: null, street: 'Avenue de la Gare 12', postal_code: '1003', locality: 'Lausanne', ide_number: 'CHE-123.456.789', phone: '021 555 40 20', email: 'bureau@atelier-martin.ch', website: null, default_vat_rate: 8.1, vat_liable: true, devis_validity_days: 30, devis_terms: null, devis_template: 'classic', brand_color: '#a65d36', logo_placement: 'right', client_address_position: 'right', footer_text: null, iban: 'CH9300762011623852957', hourly_cost: 85, payroll_km_rate_chf: 0.7, payroll_payday: 25, locale: LOC, work_term: 'chantier', plan_id: 'equipe', trial_ends_at: null, stripe_customer_id: 'cus_x', stripe_subscription_id: 'sub_x', subscription_status: 'active', enabled_modules: ['documents','photos','devis','metre','gantt','planning','profitability','subcontractors','payroll','treasury','accounting'], plan_selected: true, onboarding_completed: true, created_at: '2026-08-01T08:00:00Z' };
  const plan = { id: 'equipe', name: 'Équipe', has_survey: true, max_trames: null, has_payroll: true, has_tenders: true, max_members: 10, has_planning: true, has_treasury: true, max_org_roles: null, is_contact_only: false, price_chf_yearly: 758.4, storage_quota_mb: 15360, has_customization: true, has_email_sending: true, has_profitability: true, has_site_schedule: true, max_tenders_total: null, price_chf_monthly: 79, has_sales_tracking: false, has_bexio_integration: true, max_ai_uses_per_month: 600, max_tenders_per_month: 3, has_document_locale_override: true, max_devis_factures_per_month: null };
  const tables = {
    organization_members: [{ id: 'm1', role: 'owner', role_id: null, organization_id: ORG, user_id: USER, locale: LOC, organizations: { ...org, plans: plan }, organization_roles: null, full_name: 'Lucie Martin', profiles: { id: USER, full_name: 'Lucie Martin', email: 'lucie@atelier-martin.ch' } },
      { id: 'm2', role: 'member', user_id: 'u2', organization_id: ORG, full_name: 'Lucas Meyer' },
      { id: 'm3', role: 'member', user_id: 'u3', organization_id: ORG, full_name: 'Julie Duc' },
      { id: 'm4', role: 'member', user_id: 'u4', organization_id: ORG, full_name: 'Sarah Rey' }],
    organizations: [org],
    plans: [plan],
    profiles: [{ id: USER, full_name: 'Lucie Martin', email: 'lucie@atelier-martin.ch', avatar_url: null, locale: 'fr' }],
    cash_snapshots: [
      { id: 's1', organization_id: ORG, balance_chf: 41850, recorded_at: add(-120) + 'T08:00:00Z', created_by: USER },
      { id: 's2', organization_id: ORG, balance_chf: 38400, recorded_at: add(-90) + 'T08:00:00Z', created_by: USER },
      { id: 's3', organization_id: ORG, balance_chf: 45120, recorded_at: add(-60) + 'T08:00:00Z', created_by: USER },
      { id: 's4', organization_id: ORG, balance_chf: 43760, recorded_at: add(-30) + 'T08:00:00Z', created_by: USER },
      { id: 's5', organization_id: ORG, balance_chf: 46800, recorded_at: add(-1) + 'T08:00:00Z', created_by: USER },
    ],
    factures: [
      { id: 'f1', number: 'F-2026-0154', client_name: T('M. et Mme Dubois'), due_date: add(30), vat_rate: 8.1, status: 'sent' },
      { id: 'f2', number: 'F-2026-0149', client_name: T('Régie du Lac SA'), due_date: add(12), vat_rate: 8.1, status: 'sent' },
      { id: 'f3', number: 'F-2026-0141', client_name: T('Commune de Pully'), due_date: add(-4), vat_rate: 8.1, status: 'partial' },
      { id: 'f4', number: 'F-2026-0157', client_name: T('Fondation Les Tilleuls'), due_date: add(41), vat_rate: 8.1, status: 'sent' },
      { id: 'f5', number: 'F-2026-0160', client_name: T('Villa Rossier'), due_date: add(64), vat_rate: 8.1, status: 'sent' },
    ],
    facture_payments: [{ id: 'pay1', facture_id: 'f3', amount: 2000, paid_at: add(-12), created_by: USER, created_at: add(-12) + 'T10:00:00Z' }],
    payroll_profiles: [
      { user_id: 'u2', salary_type: 'monthly', hourly_rate_chf: null, monthly_salary_chf: 5600 },
      { user_id: 'u3', salary_type: 'monthly', hourly_rate_chf: null, monthly_salary_chf: 5200 },
    ],
    payroll_work_types: [], payroll_time_entries: [],
    subcontractor_invoices: [{ id: 'si1', amount: 3480, due_date: add(18), paid: false, project_subcontractor_id: 'ps1', project_subcontractors: { subcontractors: { company_name: 'Électricité Rochat Sàrl' } } }],
    recurring_expenses: [
      { id: 'r1', organization_id: ORG, label: T('Loyer atelier'), category: 'loyer', amount_chf: 2400, frequency: 'monthly', next_due_date: add(20), reminder_days_before: 5, active: true, notes: null, created_by: USER, created_at: '2026-08-01', updated_at: '2026-08-01' },
      { id: 'r2', organization_id: ORG, label: T('Leasing camionnette'), category: 'vehicule', amount_chf: 690, frequency: 'monthly', next_due_date: add(5), reminder_days_before: 5, active: true, notes: null, created_by: USER, created_at: '2026-08-01', updated_at: '2026-08-01' },
      { id: 'r3', organization_id: ORG, label: T('Assurance RC entreprise'), category: 'assurance', amount_chf: 1850, frequency: 'yearly', next_due_date: add(48), reminder_days_before: 10, active: true, notes: null, created_by: USER, created_at: '2026-08-01', updated_at: '2026-08-01' },
    ],
    projects: [
      { id: 'p1', organization_id: ORG, name: T('Villa des Vignes'), client_name: T('M. et Mme Dubois'), address: 'Chemin du Verger 8, 1400 Yverdon-les-Bains', status: 'active', cover_photo_url: null, enabled_modules: ['documents','photos','devis','planning','gantt'], auto_daily_report_enabled: false, reference: 'CH-2026-031', folder_id: null, client_id: null, contact_name: null, contact_phone: null, contact_email: null, start_date: add(-6), end_date: add(36), notes: null, created_by: USER, created_at: add(-20), updated_at: add(0) + 'T07:40:00Z' },
      { id: 'p2', organization_id: ORG, name: T('Aménagement bureaux'), client_name: T('Régie du Lac SA'), address: 'Quai d’Ouchy 4, 1006 Lausanne', status: 'active', cover_photo_url: null, enabled_modules: ['documents','photos','devis'], auto_daily_report_enabled: false, reference: 'CH-2026-028', folder_id: null, client_id: null, contact_name: null, contact_phone: null, contact_email: null, start_date: add(-14), end_date: add(10), notes: null, created_by: USER, created_at: add(-30), updated_at: add(-1) + 'T16:10:00Z' },
      { id: 'p3', organization_id: ORG, name: T('Rénovation vestiaires école'), client_name: T('Commune de Pully'), address: 'Avenue de Lavaux 21, 1009 Pully', status: 'active', cover_photo_url: null, enabled_modules: ['documents','photos','devis'], auto_daily_report_enabled: false, reference: 'CH-2026-025', folder_id: null, client_id: null, contact_name: null, contact_phone: null, contact_email: null, start_date: add(-40), end_date: add(4), notes: null, created_by: USER, created_at: add(-45), updated_at: add(-2) + 'T11:00:00Z' },
      { id: 'p4', organization_id: ORG, name: T('Cuisine Villa Rossier'), client_name: T('Famille Rossier'), address: 'Route de Grandvaux 9, 1096 Cully', status: 'active', cover_photo_url: null, enabled_modules: ['documents','photos','devis'], auto_daily_report_enabled: false, reference: 'CH-2026-034', folder_id: null, client_id: null, contact_name: null, contact_phone: null, contact_email: null, start_date: add(15), end_date: add(30), notes: null, created_by: USER, created_at: add(-5), updated_at: add(-3) + 'T09:00:00Z' },
    ],
    project_favorites: [],
    dashboard_tasks: [
      { id: 't1', organization_id: ORG, title: T('Commander le carrelage de sol pour la Villa des Vignes'), category: 'chantier', done: false, done_at: null, created_by: USER, created_at: add(-1), project_id: 'p1', due_on: add(1), assigned_to: USER },
      { id: 't2', organization_id: ORG, title: T('Relancer la Commune de Pully pour le solde'), category: 'client', done: false, done_at: null, created_by: USER, created_at: add(-2), project_id: 'p3', due_on: add(0), assigned_to: USER },
      { id: 't3', organization_id: ORG, title: T('Préparer le décompte TVA du trimestre'), category: 'administratif', done: false, done_at: null, created_by: USER, created_at: add(-3), project_id: null, due_on: add(9), assigned_to: USER },
    ],
    planning_assignments: [
      { id: 'a1', organization_id: ORG, project_id: 'p1', member_user_id: USER, starts_on: add(0), ends_on: add(0), title: T('Point avec le client'), start_time: '08:00', end_time: '09:00', is_private: false, note: null, created_by: USER, created_at: add(-2), updated_at: add(-2), projects: { name: T('Villa des Vignes') } },
      { id: 'a2', organization_id: ORG, project_id: 'p3', member_user_id: USER, starts_on: add(0), ends_on: add(0), title: T('Réception des travaux'), start_time: '14:00', end_time: '15:30', is_private: false, note: null, created_by: USER, created_at: add(-2), updated_at: add(-2), projects: { name: T('Rénovation vestiaires école') } },
      { id: 'a4', organization_id: ORG, project_id: 'p1', member_user_id: 'u2', starts_on: add(-1), ends_on: add(3), title: T('Carrelage salle de bain'), start_time: null, end_time: null, is_private: false, note: null, created_by: USER, created_at: add(-2), updated_at: add(-2), projects: { name: T('Villa des Vignes') } },
      { id: 'a5', organization_id: ORG, project_id: 'p1', member_user_id: 'u3', starts_on: add(0), ends_on: add(1), title: T('Raccordements sanitaires'), start_time: null, end_time: null, is_private: false, note: null, created_by: USER, created_at: add(-2), updated_at: add(-2), projects: { name: T('Villa des Vignes') } },
      { id: 'a6', organization_id: ORG, project_id: 'p2', member_user_id: 'u4', starts_on: add(0), ends_on: add(2), title: T('Pose des cloisons'), start_time: null, end_time: null, is_private: false, note: null, created_by: USER, created_at: add(-2), updated_at: add(-2), projects: { name: T('Aménagement bureaux') } },
      { id: 'a3', organization_id: ORG, project_id: 'p2', member_user_id: USER, starts_on: add(2), ends_on: add(2), title: T('Métrés bureaux 2e étage'), start_time: '10:00', end_time: '11:30', is_private: false, note: null, created_by: USER, created_at: add(-2), updated_at: add(-2), projects: { name: T('Aménagement bureaux') } },
    ],
    bank_accounts: [], bank_transactions: [], notifications: [],
  };
  const rpc = {
    is_platform_admin: false,
    touch_presence: null,
    org_track: null,
    planning_busy_blocks: [],
    facture_subtotals: [{ facture_id: 'f1', subtotal: 10540 }, { facture_id: 'f2', subtotal: 6820 }, { facture_id: 'f3', subtotal: 4170 }, { facture_id: 'f4', subtotal: 14250 }, { facture_id: 'f5', subtotal: 9600 }],
  };
  tables.integrations = [{ id: 'int1', organization_id: ORG, provider: 'bexio', status: 'connected', external_company_id: '4471', external_company_name: LOC === 'de' ? 'Schreinerei Martin AG' : LOC === 'it' ? 'Falegnameria Martin SA' : 'Atelier Martin SA', last_sync_at: new Date(Date.now() - 7 * 60000).toISOString(), auto_sync_enabled: true, created_at: '2026-09-02T08:00:00Z', updated_at: new Date().toISOString() }];
  tables.calendar_connections = [];

  // ---- help-center captures (contacts, quote, invoice lines, site, hours)
  const L3 = (fr, de, it) => (LOC === 'de' ? de : LOC === 'it' ? it : fr);
  const ts = (d, h = '08:00') => `${d}T${h}:00Z`;
  tables.clients = [
    { id: 'c1', organization_id: ORG, type: 'particulier', name: T('M. et Mme Dubois'), company_name: null, email: 'famille.dubois@bluewin.ch', phone: '079 412 33 18', address: 'Chemin du Verger 8, 1400 Yverdon-les-Bains', notes: null, created_by: USER, created_at: ts(add(-60)), updated_at: ts(add(-3)) },
    { id: 'c2', organization_id: ORG, type: 'entreprise', name: 'Régie du Lac SA', company_name: 'Régie du Lac SA', email: 'technique@regie-du-lac.ch', phone: '021 612 40 00', address: 'Quai d’Ouchy 4, 1006 Lausanne', notes: null, created_by: USER, created_at: ts(add(-90)), updated_at: ts(add(-10)) },
    { id: 'c3', organization_id: ORG, type: 'entreprise', name: T('Commune de Pully'), company_name: T('Commune de Pully'), email: 'batiments@pully.ch', phone: '021 721 31 11', address: 'Avenue de Lavaux 21, 1009 Pully', notes: null, created_by: USER, created_at: ts(add(-120)), updated_at: ts(add(-20)) },
    { id: 'c4', organization_id: ORG, type: 'particulier', name: T('Famille Rossier'), company_name: null, email: 'rossier.famille@gmail.com', phone: '078 220 51 09', address: 'Route de Grandvaux 9, 1096 Cully', notes: null, created_by: USER, created_at: ts(add(-30)), updated_at: ts(add(-2)) },
    { id: 'c5', organization_id: ORG, type: 'entreprise', name: 'Fondation Les Tilleuls', company_name: 'Fondation Les Tilleuls', email: 'direction@lestilleuls.ch', phone: '024 425 60 70', address: 'Rue des Tilleuls 2, 1400 Yverdon-les-Bains', notes: null, created_by: USER, created_at: ts(add(-200)), updated_at: ts(add(-40)) },
    { id: 'c6', organization_id: ORG, type: 'particulier', name: 'Marc Rochat', company_name: null, email: 'm.rochat@sunrise.ch', phone: '076 301 22 47', address: 'Rue du Midi 9, 1400 Yverdon-les-Bains', notes: null, created_by: USER, created_at: ts(add(-14)), updated_at: ts(add(-14)) },
  ];
  tables.subcontractors = [];
  const lines = [
    [L3('Dépose de l’ancienne salle de bain et évacuation', 'Rückbau des alten Badezimmers und Entsorgung', 'Smontaggio del vecchio bagno e sgombero'), 1, L3('forfait', 'Pauschal', 'forfait'), 850],
    [L3('Carrelage sol et mur, fourniture et pose', 'Boden- und Wandplatten, Lieferung und Verlegung', 'Piastrelle pavimento e pareti, fornitura e posa'), 28, 'm²', 145],
    [L3('Douche à l’italienne, vasque et WC suspendu', 'Bodengleiche Dusche, Waschtisch und Wand-WC', 'Doccia a filo pavimento, lavabo e WC sospeso'), 1, L3('forfait', 'Pauschal', 'forfait'), 3200],
    [L3('Raccordements eau, VMC et éclairage', 'Anschlüsse Wasser, Lüftung und Beleuchtung', 'Allacciamenti acqua, ventilazione e illuminazione'), 1, L3('forfait', 'Pauschal', 'forfait'), 2430],
  ];
  tables.devis = [
    { id: 'd1', organization_id: ORG, project_id: 'p1', client_id: 'c1', number: 'D-2026-0142', client_name: T('M. et Mme Dubois'), client_address: 'Chemin du Verger 8, 1400 Yverdon-les-Bains', client_email: 'famille.dubois@bluewin.ch', notes: L3('Travaux prévus du 24 au 28 novembre 2026.', 'Arbeiten geplant vom 24. bis 28. November 2026.', 'Lavori previsti dal 24 al 28 novembre 2026.'), status: 'sent', vat_rate: 8.1, valid_until: add(20), pdf_path: null, public_token: 'tok1', client_signed_at: null, client_signer_name: null, client_signature_data: null, created_by: USER, created_at: ts(add(-2)), updated_at: ts(add(-1)) },
  ];
  tables.devis_items = lines.map(([d, q, u, p], i) => ({ id: 'di' + i, devis_id: 'd1', description: d, quantity: q, unit: u, unit_price: p, sort_order: i }));
  tables.facture_items = (tables.factures || []).flatMap((f) => lines.map(([d, q, u, p], i) => ({ id: f.id + 'i' + i, facture_id: f.id, description: d, quantity: q, unit: u, unit_price: p, sort_order: i })));
  tables.payroll_work_types = [
    { id: 'wt1', organization_id: ORG, label: L3('Pose', 'Verlegung', 'Posa'), hourly_rate_chf: 92, sort_order: 0, active: true, created_at: ts(add(-100)) },
    { id: 'wt2', organization_id: ORG, label: L3('Préparation', 'Vorbereitung', 'Preparazione'), hourly_rate_chf: 85, sort_order: 1, active: true, created_at: ts(add(-100)) },
    { id: 'wt3', organization_id: ORG, label: L3('Déplacement', 'Fahrt', 'Trasferta'), hourly_rate_chf: 70, sort_order: 2, active: true, created_at: ts(add(-100)) },
  ];
  const te = (id, user, day, proj, wt, s, e, h, note) => ({ id, organization_id: ORG, project_id: proj, user_id: user, entry_date: add(day), hours: h, work_type_id: wt, start_time: s, end_time: e, note, invoiced_facture_id: null, created_by: user, created_at: ts(add(day), '17:00'), updated_at: ts(add(day), '17:00') });
  tables.payroll_time_entries = [
    te('t1', USER, 0, 'p1', 'wt2', '07:30', '12:00', 4.5, L3('Préparation des supports', 'Untergrund vorbereitet', 'Preparazione dei supporti')),
    te('t2', USER, 0, 'p1', 'wt1', '13:00', '16:30', 3.5, L3('Pose faïence douche', 'Wandplatten Dusche verlegt', 'Posa piastrelle doccia')),
    te('t3', 'u2', 0, 'p3', 'wt1', '07:00', '16:00', 8, null),
    te('t4', USER, -1, 'p2', 'wt1', '07:30', '16:30', 8, null),
    te('t5', USER, -2, 'p1', 'wt3', '07:00', '07:45', 0.75, null),
  ];
  tables.payroll_expense_types = []; tables.payroll_expenses = [];
  tables.reports = [
    { id: 'r1', organization_id: ORG, project_id: 'p1', template_id: null, title: L3('Rapport du 9 novembre', 'Rapport vom 9. November', 'Rapporto del 9 novembre'), notes: null, structured_content: null, status: 'generated', pdf_path: null, created_by: USER, created_at: ts(add(-1), '17:30'), updated_at: ts(add(-1), '17:30') },
  ];
  tables.feed_entries = [
    { id: 'fe1', organization_id: ORG, project_id: 'p1', type: 'note', body: L3('Carrelage sol posé, joints demain matin. Douche à l’italienne prête pour l’étanchéité.', 'Bodenplatten verlegt, Fugen morgen früh. Bodengleiche Dusche bereit für die Abdichtung.', 'Pavimento posato, fughe domattina. Doccia a filo pronta per l’impermeabilizzazione.'), storage_path: null, caption: null, latitude: null, longitude: null, taken_at: null, transcript: null, duration_seconds: null, report_id: null, created_by: USER, created_at: ts(add(0), '11:42'), edited_at: null },
    { id: 'fe2', organization_id: ORG, project_id: 'p1', type: 'note', body: L3('Client passé sur place : valide le choix du joint gris clair.', 'Kunde vor Ort: bestätigt hellgraue Fugen.', 'Cliente sul posto: conferma la fuga grigio chiaro.'), storage_path: null, caption: null, latitude: null, longitude: null, taken_at: null, transcript: null, duration_seconds: null, report_id: 'r1', created_by: USER, created_at: ts(add(-1), '15:10'), edited_at: null },
  ];
  tables.files = []; tables.tenders = []; tables.project_subcontractors = []; tables.extra_works = []; tables.chantier_situations = [];
  tables.organization_roles = []; tables.organization_invites = []; tables.integration_mappings = [];
  rpc.mark_feed_read = null; rpc.list_join_requests_for_org = []; rpc.list_my_private_modules = []; rpc.org_has_site_schedule = true;


  // ---- soumission (own texts, CUSTOM classification: never CAN content)
  {
    const TID = 'tn1';
    const chap = [
      ['1', L3('Travaux préparatoires', 'Vorbereitungsarbeiten', 'Lavori preparatori'), [
        ['1.01', L3('Protection des sols et accès existants', 'Schutz bestehender Böden und Zugänge', 'Protezione dei pavimenti e accessi esistenti'), 'm²', 180, 4.5],
        ['1.02', L3('Ragréage autolissant, épaisseur moyenne 5 mm', 'Selbstverlaufende Ausgleichsmasse, Ø 5 mm', 'Autolivellante, spessore medio 5 mm'), 'm²', 165, 18],
      ]],
      ['2', L3('Carrelage sol bureaux', 'Bodenplatten Büros', 'Pavimento uffici'), [
        ['2.01', L3('Grès cérame 60×60 rectifié, fourniture et pose collée', 'Feinsteinzeug 60×60 rektifiziert, Lieferung und Verlegung geklebt', 'Gres porcellanato 60×60 rettificato, fornitura e posa incollata'), 'm²', 142, 98],
        ['2.02', L3('Plinthes assorties, hauteur 8 cm', 'Passende Sockelleisten, Höhe 8 cm', 'Zoccolini abbinati, altezza 8 cm'), 'm', 96, 24],
        ['2.03', L3('Joints de dilatation avec profilé', 'Dehnfugen mit Profil', 'Giunti di dilatazione con profilo'), 'm', 38, 31],
      ]],
      ['3', L3('Faïence sanitaires', 'Wandplatten Sanitärräume', 'Rivestimento bagni'), [
        ['3.01', L3('Faïence 30×60 blanc mat, pose collée', 'Wandplatten 30×60 weiss matt, geklebt', 'Piastrelle 30×60 bianco opaco, posa incollata'), 'm²', 64, 86],
        ['3.02', L3('Étanchéité liquide zones humides', 'Flüssigabdichtung Nasszonen', 'Impermeabilizzazione liquida zone umide'), 'm²', 22, 42],
        ['3.03', L3('Profilés d’angle inox', 'Eckprofile Edelstahl', 'Profili angolari inox'), L3('pce', 'Stk', 'pz'), 24, null],
      ]],
      ['4', L3('Divers', 'Diverses', 'Diversi'), [
        ['4.01', L3('Nettoyage de fin de chantier', 'Bauendreinigung', 'Pulizia di fine cantiere'), L3('forfait', 'Pauschal', 'forfait'), 1, null],
      ]],
    ];
    const nodes = [], positions = [], prices = [];
    let so = 0;
    for (const [num, title, items] of chap) {
      const cid = 'tc' + num;
      nodes.push({ id: cid, tender_id: TID, parent_id: null, node_type: 'chapter', sort_order: so++, depth: 0, raw_number: num, position_path: num, display_reference: num, classification_type: 'CUSTOM', cfc_code: null, can_chapter: null, can_position: null, can_version: null, can_language: null, is_reserved: false, title, description: null, raw_text: null, source_document_id: null, source_page: 1, source_bbox: null, confidence: 0.98, needs_review: false, validated_by: USER, validated_at: ts(add(-2)) });
      for (const [ref, label, unit, qty, pu] of items) {
        const nid = 'tp' + ref.replace('.', '_');
        nodes.push({ id: nid, tender_id: TID, parent_id: cid, node_type: 'billable_position', sort_order: so++, depth: 1, raw_number: ref, position_path: ref, display_reference: ref, classification_type: 'CUSTOM', cfc_code: null, can_chapter: null, can_position: null, can_version: null, can_language: null, is_reserved: false, title: label, description: null, raw_text: null, source_document_id: null, source_page: 1 + Math.floor(so / 6), source_bbox: null, confidence: 0.97, needs_review: false, validated_by: USER, validated_at: ts(add(-2)) });
        positions.push({ id: 'pos' + nid, tender_id: TID, node_id: nid, raw_unit: unit, unit, quantity_original: qty, quantity_measured: null, quantity_manual: null, manual_note: null, quantity_selected_source: 'original', quantity_selected: qty, status: pu == null ? 'to_price' : 'priced', excluded: false, created_at: ts(add(-3)) });
        prices.push({ position_id: 'pos' + nid, tender_id: TID, unit_price: pu, price_source: pu == null ? null : 'catalog', document_unit_price: null, document_amount: null, amount: pu == null ? null : Math.round(pu * qty * 100) / 100 });
      }
    }
    const tender = (id, project_id, name, number, status, created, extra = {}) => ({ id, organization_id: ORG, project_id, name, number, kind: 'soumission', status, classification_type: 'CUSTOM', cfc_code: null, cfc_label: null, language: LOC, currency: 'CHF', source_type: 'pdf', metadata: {}, discount_percent: 0, escompte_percent: 2, vat_rate: 8.1, devis_id: null, sort_order: 0, created_at: ts(add(created)), updated_at: ts(add(created)), projects: { name: tables.projects.find((p) => p.id === project_id).name }, tender_positions: [{ count: extra.count ?? 0 }] });
    tables.tenders = [
      tender(TID, 'p2', L3('Carrelage bureaux 2e étage', 'Plattenarbeiten Büros 2. OG', 'Piastrelle uffici 2° piano'), 'S-2026-014', 'in_progress', -3, { count: positions.length }),
      tender('tn2', 'p3', L3('Vestiaires et douches', 'Garderoben und Duschen', 'Spogliatoi e docce'), 'S-2026-011', 'offered', -21, { count: 24 }),
      tender('tn3', 'p4', L3('Crédence et sol cuisine', 'Küchenrückwand und Boden', 'Paraschizzi e pavimento cucina'), 'S-2026-009', 'priced', -34, { count: 7 }),
    ];
    tables.tender_nodes = nodes;
    tables.tender_positions = positions;
    tables.tender_position_prices = [...prices, { position_id: 'x1', tender_id: 'tn2', unit_price: null, amount: 18240 }, { position_id: 'x2', tender_id: 'tn3', unit_price: null, amount: 6380 }];
    tables.position_breakdowns = []; tables.tender_zone_labels = []; tables.tender_documents = []; tables.tender_audit_log = [];
    rpc.org_tender_quota = { allowed: true, limit: null, used: 3 };
    rpc.org_has_tenders = true; rpc.can_price_tender = true;
  }

  // ---- rentabilité + travaux supplémentaires (Villa des Vignes)
  {
    const d1 = tables.devis.find((d) => d.id === 'd1');
    tables.devis.push({ ...d1, id: 'd9', number: 'D-2026-0131', status: 'accepted', created_at: ts(add(-40)), updated_at: ts(add(-38)) });
    // Positions of the accepted quote, adding up to its subtotal (18'450 HT).
    const lines9 = [
      [L3('Dépose de l’ancien revêtement et évacuation', 'Rückbau des alten Belags und Entsorgung', 'Rimozione del vecchio rivestimento e sgombero'), 1, L3('forfait', 'Pauschal', 'forfait'), 2760],
      [L3('Chape et ragréage, cuisine et séjour', 'Unterlagsboden und Ausgleich, Küche und Wohnraum', 'Massetto e livellamento, cucina e soggiorno'), 46, 'm²', 55],
      [L3('Carrelage sol cuisine, fourniture et pose', 'Bodenplatten Küche, Lieferung und Verlegung', 'Piastrelle pavimento cucina, fornitura e posa'), 34, 'm²', 150],
      [L3('Faïence crédence, fourniture et pose', 'Wandplatten Küchenrückwand, Lieferung und Verlegung', 'Piastrelle paraschizzi, fornitura e posa'), 12, 'm²', 165],
      [L3('Plinthes assorties', 'Passende Sockelleisten', 'Battiscopa coordinati'), 60, 'ml', 18],
      [L3('Terrasse en grès cérame sur plots', 'Terrasse aus Feinsteinzeug auf Stelzlagern', 'Terrazza in gres porcellanato su piedini'), 25, 'm²', 200],
    ];
    tables.devis_items.push(...lines9.map(([d, q, u, p], i) => ({ id: 'd9i' + i, devis_id: 'd9', description: d, quantity: q, unit: u, unit_price: p, sort_order: i })));
    { const DS = { d1: 10540, d9: 18450 }; rpc.devis_subtotals = (b) => (b.p_ids || Object.keys(DS)).filter((i) => DS[i] != null).map((i) => ({ devis_id: i, subtotal: DS[i] })); }
    rpc.project_total_real_hours = 96;
    const ex = (id, label, amount, cat, day) => ({ id, organization_id: ORG, project_id: 'p1', label, amount, category: cat, expense_date: add(day), notes: null, vat_rate: 8.1, created_by: USER, created_at: ts(add(day), '16:00') });
    tables.project_expenses = [
      ex('e1', L3('Grès cérame 60×60, 34 m²', 'Feinsteinzeug 60×60, 34 m²', 'Gres porcellanato 60×60, 34 m²'), 2890, 'materiaux', -6),
      ex('e2', L3('Colle et joints flexibles', 'Kleber und flexible Fugen', 'Colla e fughe flessibili'), 486.4, 'materiaux', -6),
      ex('e3', L3('Receveur de douche et siphon', 'Duschwanne und Siphon', 'Piatto doccia e sifone'), 1240, 'materiaux', -12),
      ex('e4', L3('Location benne 7 m³', 'Mulde 7 m³ gemietet', 'Noleggio benna 7 m³'), 380, 'location', -18),
      ex('e5', L3('Sous-traitance électricité', 'Unterakkord Elektro', 'Subappalto elettricità'), 1150, 'sous_traitance', -9),
    ];
    const ew = (id, number, title, status, day, extra = {}) => ({ id, organization_id: ORG, project_id: 'p1', client_id: 'c1', devis_id: 'd9', number, title, client_name: T('M. et Mme Dubois'), client_email: 'famille.dubois@bluewin.ch', notes: null, status, vat_rate: 8.1, public_token: 'tok' + id, client_signed_at: status === 'accepted' ? ts(add(day + 1), '18:40') : null, client_signer_name: status === 'accepted' ? 'Claire Dubois' : null, client_signature_data: null, facture_id: null, pdf_path: null, created_by: USER, created_at: ts(add(day), '15:00'), updated_at: ts(add(day), '15:00'), locale: LOC, ...extra });
    tables.extra_works = [
      ew('w2', 'TS-2026-007', L3('Niche de douche carrelée', 'Geflieste Duschnische', 'Nicchia doccia piastrellata'), 'sent', -1),
      ew('w1', 'TS-2026-005', L3('Remplacement de la chape fissurée', 'Ersatz des gerissenen Unterlagsbodens', 'Sostituzione del massetto fessurato'), 'accepted', -8),
      ew('w0', 'TS-2026-003', L3('Seuil en pierre naturelle', 'Schwelle aus Naturstein', 'Soglia in pietra naturale'), 'refused', -20),
    ];
    const it = (id, w, d, q, u, p, so) => ({ id, extra_work_id: w, description: d, quantity: q, unit: u, unit_price: p, sort_order: so });
    tables.extra_work_items = [
      it('wi1', 'w1', L3('Démolition et évacuation de la chape', 'Abbruch und Entsorgung Unterlagsboden', 'Demolizione e sgombero del massetto'), 6, 'm²', 65, 0),
      it('wi2', 'w1', L3('Nouvelle chape ciment 6 cm', 'Neuer Zementunterlagsboden 6 cm', 'Nuovo massetto cementizio 6 cm'), 6, 'm²', 92, 1),
      it('wi3', 'w1', L3('Séchage accéléré', 'Beschleunigte Trocknung', 'Asciugatura accelerata'), 1, L3('forfait', 'Pauschal', 'forfait'), 540, 2),
      it('wi4', 'w2', L3('Niche 30×60 avec étanchéité', 'Nische 30×60 mit Abdichtung', 'Nicchia 30×60 con impermeabilizzazione'), 1, L3('pce', 'Stk', 'pz'), 420, 0),
      it('wi5', 'w2', L3('Profilés inox d’angle', 'Eckprofile Edelstahl', 'Profili angolari inox'), 4, 'm', 38, 1),
      it('wi6', 'w0', L3('Seuil en granit, fourniture et pose', 'Granitschwelle, Lieferung und Verlegung', 'Soglia in granito, fornitura e posa'), 1, L3('pce', 'Stk', 'pz'), 310, 0),
    ];
  }

  // ---- fiches de salaire, novembre 2026
  {
    const slip = (id, user, status, type, gross, ded, net, emp, hours = null, rate = null, monthly = null) => ({ id, organization_id: ORG, run_id: 'run11', owner_key: user, user_id: user, ghost_employee_id: null, year: 2026, month: 11, status, salary_type: type, hourly_rate_chf: rate, monthly_salary_chf: monthly, total_hours: hours, gross_chf: gross, total_deductions_chf: ded, net_chf: net, employer_cost_chf: emp, wage_additions_chf: 0, net_adjustments_chf: 0, snapshot: {}, calculated_at: ts(add(-1)), validated_at: status === 'calculee' ? null : ts(add(-1), '16:00'), paid_at: status === 'payee' ? ts(add(0), '07:00') : null, reversed_slip_id: null, created_at: ts(add(-1)) });
    tables.payroll_slips = [
      slip('sl1', USER, 'payee', 'monthly', 6800, 873.2, 5926.8, 7942.4, null, null, 6800),
      slip('sl2', 'u2', 'validee', 'monthly', 5600, 718.6, 4881.4, 6541.3, null, null, 5600),
      slip('sl3', 'u3', 'validee', 'monthly', 5200, 667.3, 4532.7, 6074.0, null, null, 5200),
      slip('sl4', 'u4', 'calculee', 'hourly', 4416, 566.7, 3849.3, 5158.2, 138, 32, null),
    ];
    tables.payroll_ghost_employees = []; tables.payroll_wage_types = [];
  }

  // ---- fil du chantier (notes de l'équipe)
  {
    const base = tables.feed_entries[0];
    const fe = (id, by, day, h, body, extra = {}) => ({ ...base, id, created_by: by, body, created_at: ts(add(day), h), ...extra });
    tables.feed_entries = [
      fe('fa1', 'u2', -2, '07:48', L3('Arrivé sur place, dépose de l’ancienne faïence terminée côté douche. Évacuation des gravats à 10 h.', 'Vor Ort, alte Wandplatten bei der Dusche entfernt. Schutt wird um 10 Uhr abgeholt.', 'Arrivato sul posto, rimosse le vecchie piastrelle lato doccia. Sgombero macerie alle 10.')),
      fe('fa2', 'u3', -2, '15:20', L3('Chape fissurée sous l’ancien receveur, environ 6 m². Il faudra la refaire avant la pose.', 'Gerissener Unterlagsboden unter der alten Duschwanne, ca. 6 m². Muss vor dem Verlegen ersetzt werden.', 'Massetto fessurato sotto il vecchio piatto doccia, circa 6 m². Va rifatto prima della posa.')),
      fe('fa3', USER, -2, '16:05', L3('Travaux supplémentaires TS-2026-005 envoyés au client pour signature.', 'Regiearbeit TS-2026-005 dem Kunden zur Unterschrift gesendet.', 'Lavori supplementari TS-2026-005 inviati al cliente per la firma.')),
      fe('fa4', 'u2', -1, '11:12', L3('Nouvelle chape coulée, séchage accéléré en place. Raccords d’eau contrôlés, pas de fuite.', 'Neuer Unterlagsboden gegossen, Schnelltrocknung läuft. Wasseranschlüsse geprüft, dicht.', 'Nuovo massetto gettato, asciugatura accelerata in corso. Allacciamenti acqua controllati, nessuna perdita.'), { type: 'voice', transcript: null, duration_seconds: 24 }),
      { ...tables.feed_entries[0], created_at: ts(add(0), '11:42') },
      { ...(tables.feed_entries[1] || tables.feed_entries[0]), id: 'fe2b', created_by: 'u3', created_at: ts(add(0), '14:30') },
    ];
  }

  // ---- assistant vocal: answers of the edge functions for one dictation
  const funcs = {
    'transcribe-audio': { transcript: L3('Crée un devis pour la Fondation Les Tilleuls : entretien des espaces verts, 6 heures à 78 francs, taille des haies 45 mètres, et évacuation des déchets verts.', 'Erstelle eine Offerte für die Stiftung Les Tilleuls: Grünflächenpflege, 6 Stunden zu 78 Franken, Heckenschnitt 45 Meter und Entsorgung des Grünguts.', 'Crea un preventivo per la Fondazione Les Tilleuls: manutenzione del verde, 6 ore a 78 franchi, taglio siepi 45 metri e smaltimento degli scarti verdi.') },
    'route-voice-command': { command: { action: 'create_devis', projectId: null, workTypeId: null, startTime: null, endTime: null, hours: null, label: null, amount: null, clientName: T('Fondation Les Tilleuls'), note: '', summary: L3('Devis pour Fondation Les Tilleuls', 'Offerte für Stiftung Les Tilleuls', 'Preventivo per Fondazione Les Tilleuls') } },
    'generate-devis-lines': { lines: [
      { description: L3('Entretien des espaces verts : tonte et désherbage', 'Grünflächenpflege: Mähen und Jäten', 'Manutenzione del verde: taglio erba e diserbo'), quantity: 6, unit: L3('h', 'Std.', 'h'), unitPrice: 78, matched: true, priceSource: 'stated' },
      { description: L3('Taille des haies, évacuation comprise', 'Heckenschnitt, inkl. Abtransport', 'Taglio siepi, sgombero incluso'), quantity: 45, unit: 'm', unitPrice: 6.5, matched: true, priceSource: 'catalog' },
      { description: L3('Évacuation des déchets verts', 'Entsorgung Grüngut', 'Smaltimento scarti verdi'), quantity: 1, unit: L3('forfait', 'Pauschal', 'forfait'), unitPrice: 120, matched: true, priceSource: 'catalog' },
    ] },
  };

  // ---- demo only: what the detail pages read (client sheet, expenses, mailbox)
  {
    const byClient = { f1: 'c1', f2: 'c2', f3: 'c3', f4: 'c5', f5: 'c4' };
    const issued = { f1: -6, f2: -18, f3: -34, f4: -3, f5: -1 };
    tables.factures = tables.factures.map((f) => ({
      organization_id: ORG,
      client_id: byClient[f.id] ?? null,
      project_id: { f1: 'p1', f2: 'p2', f3: 'p3', f5: 'p4' }[f.id] ?? null,
      issue_date: add(issued[f.id] ?? -5),
      created_at: ts(add(issued[f.id] ?? -5)),
      updated_at: ts(add(issued[f.id] ?? -5)),
      ...f,
    }));
    tables.client_notes = [
      { id: 'cn1', organization_id: ORG, client_id: 'c1', body: L3('Préfèrent être appelés après 17 h. Accès au chantier par le portail côté verger.', 'Möchten nach 17 Uhr angerufen werden. Zugang zur Baustelle über das Tor beim Obstgarten.', 'Preferiscono essere chiamati dopo le 17. Accesso al cantiere dal cancello lato frutteto.'), created_by: USER, created_at: ts(add(-9), '10:20') },
      { id: 'cn2', organization_id: ORG, client_id: 'c3', body: L3('Facturer au service des bâtiments, avec la référence du bon de commande.', 'An die Bauverwaltung fakturieren, mit der Bestellnummer.', 'Fatturare all’ufficio edifici, con il riferimento dell’ordine.'), created_by: USER, created_at: ts(add(-20), '14:05') },
    ];
    tables.expenses = [
      { id: 'e1', organization_id: ORG, label: L3('Colle et joints, Villa des Vignes', 'Kleber und Fugen, Villa des Vignes', 'Colla e fughe, Villa des Vignes'), category: 'materiel', amount_chf: 486.4, expense_date: add(-2), notes: null, vat_rate: 8.1, project_id: 'p1', created_by: USER, created_at: ts(add(-2)), updated_at: ts(add(-2)) },
      { id: 'e2', organization_id: ORG, label: L3('Carburant camionnette', 'Treibstoff Lieferwagen', 'Carburante furgone'), category: 'vehicule', amount_chf: 112.7, expense_date: add(-4), notes: null, vat_rate: 8.1, project_id: null, created_by: USER, created_at: ts(add(-4)), updated_at: ts(add(-4)) },
      { id: 'e3', organization_id: ORG, label: L3('Location carrelette électrique', 'Miete Fliesenschneider', 'Noleggio tagliapiastrelle'), category: 'materiel', amount_chf: 95, expense_date: add(-7), notes: null, vat_rate: 8.1, project_id: 'p2', created_by: USER, created_at: ts(add(-7)), updated_at: ts(add(-7)) },
    ];
    tables.email_messages = [];
    tables.sales_emails = [];
  }

  return { tables, rpc, USER, ORG, org, plan, funcs };

}
