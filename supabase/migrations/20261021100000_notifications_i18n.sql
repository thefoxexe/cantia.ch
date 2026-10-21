-- Notifications in the recipient's language. Every source (triggers,
-- scheduled jobs, fiduciary functions, edge functions) still writes the
-- French text; a trigger rewrites title and body for German or Italian
-- members (organization_members.locale, else the company's locale) before
-- the row is stored, so the app, the e-mail and the push all read the same
-- translated text. Unknown text is left as it is.

create or replace function public.notif_recipient_locale(p_org uuid, p_user uuid)
returns text
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(
    (select nullif(m.locale, '') from public.organization_members m where m.organization_id = p_org and m.user_id = p_user limit 1),
    (select nullif(o.locale, '') from public.organizations o where o.id = p_org),
    'fr'
  );
$$;

create or replace function public.notif_translate(p_text text, p_locale text)
returns text
language plpgsql
immutable
as $$
declare
  r record;
  v text := p_text;
  v_months_fr text[] := array['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  v_months_de text[] := array['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  v_months_it text[] := array['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
  i int;
begin
  if p_text is null or p_locale not in ('de', 'it') then
    return p_text;
  end if;
  -- Whole sentences first (anchored), then the "Title — subject" prefixes.
  for r in
    select * from (values
      (1, '^Ce devis est en brouillon depuis plusieurs jours et n''a pas encore été envoyé\.$',
          'Diese Offerte ist seit mehreren Tagen ein Entwurf und wurde noch nicht versendet.',
          'Questo preventivo è in bozza da diversi giorni e non è ancora stato inviato.'),
      (2, '^Ce devis arrive à échéance de validité, relancez le client si besoin\.$',
          'Die Gültigkeit dieser Offerte läuft bald ab – fragen Sie bei Bedarf beim Kunden nach.',
          'La validità di questo preventivo sta per scadere: sollecitate il cliente se necessario.'),
      (3, '^Échéance dépassée le (.+), pensez à relancer\.$',
          'Fälligkeit am \1 überschritten – denken Sie an eine Mahnung.',
          'Scadenza superata il \1: pensate a un sollecito.'),
      (4, '^CHF (\S+) prévu le (.+)\.$',
          'CHF \1 fällig am \2.',
          'CHF \1 previsti il \2.'),
      (5, '^Le client a accepté et signé ce devis depuis le portail client\.$',
          'Der Kunde hat diese Offerte im Kundenportal angenommen und unterschrieben.',
          'Il cliente ha accettato e firmato questo preventivo dal portale clienti.'),
      (6, '^(.+) a accepté et signé ce devis depuis le portail client\.$',
          '\1 hat diese Offerte im Kundenportal angenommen und unterschrieben.',
          '\1 ha accettato e firmato questo preventivo dal portale clienti.'),
      (7, '^Quelqu''un souhaite rejoindre votre organisation\.$',
          'Jemand möchte Ihrer Organisation beitreten.',
          'Qualcuno desidera unirsi alla vostra organizzazione.'),
      (8, '^(.+) souhaite rejoindre votre organisation\.$',
          '\1 möchte Ihrer Organisation beitreten.',
          '\1 desidera unirsi alla vostra organizzazione.'),
      (9, '^L''adresse (.+) a refusé l''e-mail\. Vérifiez-la et renvoyez le document\.$',
          'Die Adresse \1 hat die E-Mail abgelehnt. Prüfen Sie sie und senden Sie das Dokument erneut.',
          'L''indirizzo \1 ha rifiutato l''e-mail. Verificatelo e inviate di nuovo il documento.'),
      (10, '^L''adresse (.+) a refusé l''e-mail\. Vérifiez-la et renvoyez le devis\.$',
          'Die Adresse \1 hat die E-Mail abgelehnt. Prüfen Sie sie und senden Sie die Offerte erneut.',
          'L''indirizzo \1 ha rifiutato l''e-mail. Verificatelo e inviate di nuovo il preventivo.'),
      (11, '^Le client a consulté le devis \((\d+)e fois\)\.$',
          'Der Kunde hat die Offerte angesehen (\1. Mal).',
          'Il cliente ha visualizzato il preventivo (\1ª volta).'),
      (12, '^Le client a consulté le devis\.$',
          'Der Kunde hat die Offerte angesehen.',
          'Il cliente ha visualizzato il preventivo.'),
      (13, '^(.+) a consulté le devis \((\d+)e fois\)\.$',
          '\1 hat die Offerte angesehen (\2. Mal).',
          '\1 ha visualizzato il preventivo (\2ª volta).'),
      (14, '^(.+) a consulté le devis\.$',
          '\1 hat die Offerte angesehen.',
          '\1 ha visualizzato il preventivo.'),
      (15, '^Votre fiduciaire souhaite accéder à vos données comptables( Cantia)?\. Acceptez ou refusez dans Paramètres › Fiduciaire\.$',
          'Ihre Treuhand möchte auf Ihre Buchhaltungsdaten\1 zugreifen. Annehmen oder ablehnen unter Einstellungen › Treuhand.',
          'Il vostro fiduciario desidera accedere ai vostri dati contabili\1. Accettate o rifiutate in Impostazioni › Fiduciario.'),
      (16, '^(.+) souhaite accéder à vos données comptables( Cantia)?\. Acceptez ou refusez dans Paramètres › Fiduciaire\.$',
          '\1 möchte auf Ihre Buchhaltungsdaten\2 zugreifen. Annehmen oder ablehnen unter Einstellungen › Treuhand.',
          '\1 desidera accedere ai vostri dati contabili\2. Accettate o rifiutate in Impostazioni › Fiduciario.'),
      (17, '^(.+) a accepté votre invitation et accède maintenant à vos données comptables\.$',
          '\1 hat Ihre Einladung angenommen und hat nun Zugriff auf Ihre Buchhaltungsdaten.',
          '\1 ha accettato il vostro invito e ora accede ai vostri dati contabili.'),
      (18, '^(.+) a accepté votre invitation\.$',
          '\1 hat Ihre Einladung angenommen.',
          '\1 ha accettato il vostro invito.'),
      (19, '^(.+) a décliné votre invitation\.$',
          '\1 hat Ihre Einladung abgelehnt.',
          '\1 ha declinato il vostro invito.'),
      (20, '^(.+) a mis fin à son accès à vos données\.$',
          '\1 hat den Zugriff auf Ihre Daten beendet.',
          '\1 ha terminato il proprio accesso ai vostri dati.'),
      (21, '^Votre fiche de salaire est prête\. Connectez-vous pour la consulter et la télécharger\.$',
          'Ihre Lohnabrechnung ist bereit. Melden Sie sich an, um sie anzusehen und herunterzuladen.',
          'La vostra busta paga è pronta. Accedete per consultarla e scaricarla.'),
      (22, '^Votre fiduciaire : (.+)$', 'Ihre Treuhand: \1', 'Il vostro fiduciario: \1'),
      (23, '^\(sans objet\)', '(kein Betreff)', '(senza oggetto)'),
      -- Titles.
      (40, '^Devis en attente — ', 'Offerte ausstehend — ', 'Preventivo in sospeso — '),
      (41, '^Devis bientôt échu — ', 'Offerte läuft bald ab — ', 'Preventivo in scadenza — '),
      (42, '^Facture en retard — ', 'Rechnung überfällig — ', 'Fattura scaduta — '),
      (43, '^Dépense récurrente à venir — ', 'Wiederkehrende Ausgabe fällig — ', 'Spesa ricorrente in arrivo — '),
      (44, '^Devis signé — ', 'Offerte unterschrieben — ', 'Preventivo firmato — '),
      (45, '^Travaux supplémentaires accepté(s)? — ', 'Zusatzarbeiten angenommen — ', 'Lavori supplementari accettati — '),
      (46, '^Nouvelle demande pour rejoindre votre entreprise$', 'Neue Beitrittsanfrage für Ihr Unternehmen', 'Nuova richiesta di adesione alla vostra azienda'),
      (47, '^Nouvelle demande pour rejoindre ', 'Neue Beitrittsanfrage für ', 'Nuova richiesta di adesione a '),
      (48, '^Nouvel e-mail — ', 'Neue E-Mail — ', 'Nuova e-mail — '),
      (49, '^Nouveau message — ', 'Neue Nachricht — ', 'Nuovo messaggio — '),
      (50, '^E-mail non délivré — ', 'E-Mail nicht zugestellt — ', 'E-mail non recapitata — '),
      (51, '^Devis non délivré — ', 'Offerte nicht zugestellt — ', 'Preventivo non recapitato — '),
      (52, '^Devis consulté — ', 'Offerte angesehen — ', 'Preventivo visualizzato — '),
      (53, '^Facture consultée — ', 'Rechnung angesehen — ', 'Fattura visualizzata — '),
      (54, '^Fiche de salaire disponible — ', 'Lohnabrechnung verfügbar — ', 'Busta paga disponibile — '),
      (55, '^Votre fiduciaire vous attend$', 'Ihre Treuhand wartet auf Sie', 'Il vostro fiduciario vi aspetta'),
      (56, '^Demande d''accès de votre fiduciaire$', 'Zugriffsanfrage Ihrer Treuhand', 'Richiesta di accesso del vostro fiduciario'),
      (57, '^Fiduciaire connectée$', 'Treuhand verbunden', 'Fiduciario collegato'),
      (58, '^Invitation déclinée$', 'Einladung abgelehnt', 'Invito declinato'),
      (59, '^Mandat terminé$', 'Mandat beendet', 'Mandato terminato'),
      (60, '^Rappel de votre fiduciaire$', 'Erinnerung Ihrer Treuhand', 'Promemoria del vostro fiduciario'),
      (61, '^Votre fiduciaire vous demande un document$', 'Ihre Treuhand bittet Sie um ein Dokument', 'Il vostro fiduciario vi chiede un documento'),
      (62, '^Écriture proposée par votre fiduciaire$', 'Buchung von Ihrer Treuhand vorgeschlagen', 'Registrazione proposta dal vostro fiduciario'),
      (63, '^Rappel : document à valider$', 'Erinnerung: Dokument zu genehmigen', 'Promemoria: documento da approvare'),
      (64, '^Document à valider$', 'Dokument zu genehmigen', 'Documento da approvare')
    ) as t(ord, pat, de, it)
    order by ord
  loop
    if v ~ r.pat then
      v := regexp_replace(v, r.pat, case when p_locale = 'de' then r.de else r.it end);
      exit when r.ord < 40;
    end if;
  end loop;
  -- Document words after "·" in the e-mail line, months in payslip titles.
  v := regexp_replace(v, ' · Devis ', case when p_locale = 'de' then ' · Offerte ' else ' · Preventivo ' end);
  v := regexp_replace(v, ' · Facture ', case when p_locale = 'de' then ' · Rechnung ' else ' · Fattura ' end);
  if v ~ '^(Lohnabrechnung verfügbar|Busta paga disponibile) — ' then
    for i in 1..12 loop
      v := regexp_replace(v, '\m' || v_months_fr[i] || '\M', case when p_locale = 'de' then v_months_de[i] else v_months_it[i] end, 'i');
    end loop;
  end if;
  return v;
end;
$$;

create or replace function public.notifications_localize()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_locale text;
begin
  v_locale := public.notif_recipient_locale(new.organization_id, new.user_id);
  if v_locale in ('de', 'it') then
    new.title := public.notif_translate(new.title, v_locale);
    new.body := public.notif_translate(new.body, v_locale);
  end if;
  return new;
exception when others then
  return new;
end;
$$;

drop trigger if exists notifications_localize on public.notifications;
create trigger notifications_localize before insert on public.notifications
for each row execute function public.notifications_localize();
