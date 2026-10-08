import { createClient } from 'npm:@supabase/supabase-js@2';

// Cantia Accounting emails (FR/DE/IT). The database writes what to send in
// fiduciary_email_outbox (supabase/migrations/20260929210000_accounting_foundation.sql);
// this function is called right after by a trigger, and hourly by pg_cron
// for retries, both with the X-Dispatch-Secret header. Deployed without JWT
// verification for that reason.

type Locale = 'fr' | 'de' | 'it';
type Payload = {
  firm_name?: string;
  first_name?: string;
  organization_name?: string;
  company_name?: string | null;
  contact_name?: string | null;
  token?: string;
  partner_code?: string | null;
  role?: string;
  title?: string;
  details?: string | null;
  due_date?: string | null;
  organization_id?: string;
  external_client_id?: string | null;
  portal_token?: string | null;
  brand_color?: string | null;
  reply_to?: string | null;
  accepted?: boolean;
  reminder?: boolean;
};
// `from_firm`: sent on behalf of the fiduciary to its own client (sender
// name and reply-to are the firm's, the button wears its colour).
type Mail = { subject: string; title: string; paragraphs: string[]; cta: string; url: string; from_firm?: boolean };

const ACCOUNTING_URL = Deno.env.get('ACCOUNTING_URL') ?? 'https://accounting.cantia.ch';
const APP_URL = Deno.env.get('APP_URL') ?? 'https://app.cantia.ch';

const BRAND: Record<Locale, string> = { fr: 'Cantia Accounting', de: 'Cantia Accounting', it: 'Cantia Accounting' };
const FOOTER: Record<Locale, string> = {
  fr: 'Cantia, le logiciel suisse pour piloter chantiers et projets. Espace fiduciaires gratuit.',
  de: 'Cantia, die Schweizer Software für Baustellen und Projekte. Treuhandbereich kostenlos.',
  it: 'Cantia, il software svizzero per cantieri e progetti. Spazio fiduciari gratuito.',
};

function esc(text: string | null | undefined): string {
  return String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function newClientUrl(p: Payload): string {
  const params = new URLSearchParams({ fiduciary_invite: p.token ?? '' });
  if (p.partner_code) params.set('ref', p.partner_code);
  return `${APP_URL}/signup?${params.toString()}`;
}

function portalUrl(p: Payload): string {
  return `${ACCOUNTING_URL}/depot?t=${encodeURIComponent(p.portal_token ?? '')}`;
}

function clientUrl(p: Payload, tab: string): string {
  if (p.organization_id) return `${ACCOUNTING_URL}/mandant?id=${encodeURIComponent(p.organization_id)}&tab=${tab}`;
  if (p.external_client_id) return `${ACCOUNTING_URL}/mandant?ext=${encodeURIComponent(p.external_client_id)}&tab=${tab}`;
  return `${ACCOUNTING_URL}/espace?tab=${tab}`;
}

function build(kind: string, l: Locale, p: Payload): Mail | null {
  const firm = esc(p.firm_name);
  const org = esc(p.organization_name);
  const roleLabel = (r?: string) =>
    r === 'ADMIN' ? { fr: 'administrateur', de: 'Administrator', it: 'amministratore' }[l] : { fr: 'collaborateur', de: 'Mitarbeitende/r', it: 'collaboratore' }[l];

  switch (kind) {
    case 'welcome':
      return {
        fr: {
          subject: `Bienvenue sur Cantia Accounting, ${firm}`,
          title: `Votre espace est prêt${p.first_name ? `, ${esc(p.first_name)}` : ''}.`,
          paragraphs: [
            'Invitez vos mandants qui utilisent Cantia : dès qu’ils acceptent, leurs factures, paiements, écritures et justificatifs sont dans votre cockpit, sans leur demander d’envois par e-mail.',
            'Vos mandants qui ne sont pas encore sur Cantia ? Invitez-les aussi depuis votre espace. C’est gratuit pour vous, sans limite.',
          ],
          cta: 'Ouvrir mon espace',
          url: `${ACCOUNTING_URL}/espace`,
        },
        de: {
          subject: `Willkommen bei Cantia Accounting, ${firm}`,
          title: `Ihr Bereich ist bereit${p.first_name ? `, ${esc(p.first_name)}` : ''}.`,
          paragraphs: [
            'Laden Sie Ihre Mandanten ein, die Cantia nutzen: Sobald sie zustimmen, sind ihre Rechnungen, Zahlungen, Buchungen und Belege in Ihrem Cockpit, ohne Versand per E-Mail.',
            'Mandanten, die Cantia noch nicht nutzen? Laden Sie sie ebenfalls aus Ihrem Bereich ein. Für Sie kostenlos und unbegrenzt.',
          ],
          cta: 'Meinen Bereich öffnen',
          url: `${ACCOUNTING_URL}/espace`,
        },
        it: {
          subject: `Benvenuti su Cantia Accounting, ${firm}`,
          title: `Il suo spazio è pronto${p.first_name ? `, ${esc(p.first_name)}` : ''}.`,
          paragraphs: [
            'Inviti i suoi mandanti che usano Cantia: appena accettano, fatture, pagamenti, registrazioni e giustificativi sono nel suo cockpit, senza invii per e-mail.',
            'Mandanti non ancora su Cantia? Li inviti dal suo spazio. Per lei è gratuito e senza limiti.',
          ],
          cta: 'Aprire il mio spazio',
          url: `${ACCOUNTING_URL}/espace`,
        },
      }[l];
    case 'staff_invite':
      return {
        fr: {
          subject: `${firm} vous invite sur Cantia Accounting`,
          title: `Rejoignez ${firm}.`,
          paragraphs: [`Vous êtes invité comme ${roleLabel(p.role)} dans l’espace Cantia de ${firm}, où l’équipe retrouve les données comptables de ses mandants.`, 'Connectez-vous ou créez votre compte avec cette adresse e-mail pour accepter. L’invitation est valable 30 jours.'],
          cta: 'Accepter l’invitation',
          url: `${ACCOUNTING_URL}/invitation?token=${p.token}`,
        },
        de: {
          subject: `${firm} lädt Sie zu Cantia Accounting ein`,
          title: `Treten Sie ${firm} bei.`,
          paragraphs: [`Sie sind als ${roleLabel(p.role)} in den Cantia-Bereich von ${firm} eingeladen, in dem das Team die Buchhaltungsdaten seiner Mandanten findet.`, 'Melden Sie sich mit dieser E-Mail-Adresse an oder erstellen Sie ein Konto, um anzunehmen. Die Einladung ist 30 Tage gültig.'],
          cta: 'Einladung annehmen',
          url: `${ACCOUNTING_URL}/invitation?token=${p.token}`,
        },
        it: {
          subject: `${firm} la invita su Cantia Accounting`,
          title: `Si unisca a ${firm}.`,
          paragraphs: [`È invitato come ${roleLabel(p.role)} nello spazio Cantia di ${firm}, dove il team trova i dati contabili dei suoi mandanti.`, 'Acceda o crei un account con questo indirizzo e-mail per accettare. L’invito è valido 30 giorni.'],
          cta: 'Accettare l’invito',
          url: `${ACCOUNTING_URL}/invitation?token=${p.token}`,
        },
      }[l];
    case 'client_invite_firm':
      return {
        fr: {
          subject: `${org} vous donne accès à sa comptabilité sur Cantia`,
          title: `${org} vous invite comme fiduciaire.`,
          paragraphs: [
            `${org} utilise Cantia pour ses devis, factures et sa comptabilité, et vous ouvre un accès en lecture à ses données comptables.`,
            'Créez votre espace fiduciaire gratuitement, ou connectez-vous : vous retrouvez ensuite tous vos mandants Cantia au même endroit.',
          ],
          cta: 'Accepter et ouvrir l’espace',
          url: `${ACCOUNTING_URL}/invitation?token=${p.token}`,
        },
        de: {
          subject: `${org} gibt Ihnen Zugriff auf die Buchhaltung in Cantia`,
          title: `${org} lädt Sie als Treuhand ein.`,
          paragraphs: [
            `${org} nutzt Cantia für Offerten, Rechnungen und Buchhaltung und gibt Ihnen Lesezugriff auf die Buchhaltungsdaten.`,
            'Erstellen Sie kostenlos Ihren Treuhandbereich oder melden Sie sich an: Danach finden Sie alle Cantia-Mandanten an einem Ort.',
          ],
          cta: 'Annehmen und Bereich öffnen',
          url: `${ACCOUNTING_URL}/invitation?token=${p.token}`,
        },
        it: {
          subject: `${org} le dà accesso alla sua contabilità su Cantia`,
          title: `${org} la invita come fiduciario.`,
          paragraphs: [
            `${org} usa Cantia per preventivi, fatture e contabilità e le apre un accesso in lettura ai suoi dati contabili.`,
            'Crei gratuitamente il suo spazio fiduciario o acceda: troverà poi tutti i suoi mandanti Cantia in un unico posto.',
          ],
          cta: 'Accettare e aprire lo spazio',
          url: `${ACCOUNTING_URL}/invitation?token=${p.token}`,
        },
      }[l];
    case 'client_invite_existing_firm':
      return {
        fr: { subject: `${org} vous invite à accéder à sa comptabilité`, title: `Nouveau mandant : ${org}.`, paragraphs: [`${org} vous ouvre un accès à ses données comptables Cantia. Acceptez-le depuis votre espace pour l’ajouter à vos mandants.`], cta: 'Voir la demande', url: `${ACCOUNTING_URL}/espace` },
        de: { subject: `${org} lädt Sie zu seiner Buchhaltung ein`, title: `Neuer Mandant: ${org}.`, paragraphs: [`${org} gibt Ihnen Zugriff auf seine Cantia-Buchhaltungsdaten. Nehmen Sie ihn in Ihrem Bereich an, um ihn zu Ihren Mandanten hinzuzufügen.`], cta: 'Anfrage ansehen', url: `${ACCOUNTING_URL}/espace` },
        it: { subject: `${org} la invita ad accedere alla sua contabilità`, title: `Nuovo mandante: ${org}.`, paragraphs: [`${org} le apre un accesso ai suoi dati contabili Cantia. Lo accetti dal suo spazio per aggiungerlo ai suoi mandanti.`], cta: 'Vedere la richiesta', url: `${ACCOUNTING_URL}/espace` },
      }[l];
    case 'access_request':
      return {
        fr: {
          subject: `${firm} souhaite accéder à vos données comptables Cantia`,
          title: `Votre fiduciaire demande un accès.`,
          paragraphs: [
            `${firm} souhaite accéder à vos données comptables Cantia (factures, paiements, comptabilité, justificatifs), en lecture seule.`,
            'Rien n’est visible tant que vous n’avez pas accepté. Vous choisissez ce qu’elle voit et vous pouvez révoquer l’accès à tout moment dans Paramètres › Fiduciaire.',
          ],
          cta: 'Accepter ou refuser',
          url: `${APP_URL}/compte/fiduciaire`,
        },
        de: {
          subject: `${firm} möchte auf Ihre Cantia-Buchhaltungsdaten zugreifen`,
          title: 'Ihre Treuhand bittet um Zugriff.',
          paragraphs: [
            `${firm} möchte Lesezugriff auf Ihre Cantia-Buchhaltungsdaten (Rechnungen, Zahlungen, Buchhaltung, Belege).`,
            'Solange Sie nicht zustimmen, ist nichts sichtbar. Sie wählen, was sichtbar ist, und können den Zugriff jederzeit unter Einstellungen › Treuhand widerrufen.',
          ],
          cta: 'Annehmen oder ablehnen',
          url: `${APP_URL}/compte/fiduciaire`,
        },
        it: {
          subject: `${firm} desidera accedere ai suoi dati contabili Cantia`,
          title: 'Il suo fiduciario chiede un accesso.',
          paragraphs: [
            `${firm} desidera accedere in sola lettura ai suoi dati contabili Cantia (fatture, pagamenti, contabilità, giustificativi).`,
            'Nulla è visibile finché non accetta. Sceglie lei cosa è visibile e può revocare l’accesso in qualsiasi momento in Impostazioni › Fiduciario.',
          ],
          cta: 'Accettare o rifiutare',
          url: `${APP_URL}/compte/fiduciaire`,
        },
      }[l];
    case 'access_accepted':
      return {
        fr: { subject: `${org} a accepté votre demande d’accès`, title: `${org} est maintenant dans vos mandants.`, paragraphs: ['Vous accédez à ses données comptables selon les autorisations qu’il a choisies.'], cta: 'Ouvrir le mandant', url: `${ACCOUNTING_URL}/espace` },
        de: { subject: `${org} hat Ihre Zugriffsanfrage angenommen`, title: `${org} ist jetzt Ihr Mandant.`, paragraphs: ['Sie greifen gemäss den gewählten Berechtigungen auf seine Buchhaltungsdaten zu.'], cta: 'Mandant öffnen', url: `${ACCOUNTING_URL}/espace` },
        it: { subject: `${org} ha accettato la sua richiesta di accesso`, title: `${org} è ora tra i suoi mandanti.`, paragraphs: ['Accede ai suoi dati contabili secondo le autorizzazioni scelte.'], cta: 'Aprire il mandante', url: `${ACCOUNTING_URL}/espace` },
      }[l];
    case 'access_refused':
      return {
        fr: { subject: `${org} a refusé votre demande d’accès`, title: 'Demande refusée.', paragraphs: [`${org} n’a pas accepté votre demande d’accès. Aucune donnée n’a été partagée.`], cta: 'Ouvrir mon espace', url: `${ACCOUNTING_URL}/espace` },
        de: { subject: `${org} hat Ihre Zugriffsanfrage abgelehnt`, title: 'Anfrage abgelehnt.', paragraphs: [`${org} hat Ihre Zugriffsanfrage nicht angenommen. Es wurden keine Daten geteilt.`], cta: 'Meinen Bereich öffnen', url: `${ACCOUNTING_URL}/espace` },
        it: { subject: `${org} ha rifiutato la sua richiesta di accesso`, title: 'Richiesta rifiutata.', paragraphs: [`${org} non ha accettato la sua richiesta di accesso. Nessun dato è stato condiviso.`], cta: 'Aprire il mio spazio', url: `${ACCOUNTING_URL}/espace` },
      }[l];
    case 'access_revoked':
      return {
        fr: { subject: `${org} a révoqué votre accès`, title: 'Accès révoqué.', paragraphs: [`${org} a mis fin à votre accès à ses données comptables Cantia. Elles ne sont plus visibles depuis votre espace.`], cta: 'Ouvrir mon espace', url: `${ACCOUNTING_URL}/espace` },
        de: { subject: `${org} hat Ihren Zugriff widerrufen`, title: 'Zugriff widerrufen.', paragraphs: [`${org} hat Ihren Zugriff auf seine Cantia-Buchhaltungsdaten beendet. Sie sind in Ihrem Bereich nicht mehr sichtbar.`], cta: 'Meinen Bereich öffnen', url: `${ACCOUNTING_URL}/espace` },
        it: { subject: `${org} ha revocato il suo accesso`, title: 'Accesso revocato.', paragraphs: [`${org} ha revocato il suo accesso ai dati contabili Cantia. Non sono più visibili dal suo spazio.`], cta: 'Aprire il mio spazio', url: `${ACCOUNTING_URL}/espace` },
      }[l];
    case 'new_client_invite': {
      const hello = p.contact_name ? esc(p.contact_name) : null;
      return {
        fr: {
          subject: `${firm} vous invite à utiliser Cantia`,
          title: hello ? `Bonjour ${hello},` : 'Bonjour,',
          paragraphs: [
            `Votre fiduciaire, ${firm}, vous invite à utiliser Cantia afin de simplifier votre collaboration.`,
            'Cantia est le logiciel suisse des entreprises qui travaillent sur chantiers et par projets : devis, factures avec QR-bill, suivi des paiements, heures et salaires, comptabilité. Votre fiduciaire retrouve ce dont elle a besoin directement, sans échanges de fichiers.',
            'Vous pouvez essayer gratuitement. Rien n’est partagé avec votre fiduciaire tant que vous ne l’avez pas accepté.',
          ],
          cta: 'Créer mon compte Cantia',
          url: newClientUrl(p),
        },
        de: {
          subject: `${firm} lädt Sie ein, Cantia zu nutzen`,
          title: hello ? `Guten Tag ${hello}` : 'Guten Tag',
          paragraphs: [
            `Ihre Treuhand, ${firm}, lädt Sie ein, Cantia zu nutzen, um Ihre Zusammenarbeit zu vereinfachen.`,
            'Cantia ist die Schweizer Software für Unternehmen, die auf Baustellen und in Projekten arbeiten: Offerten, Rechnungen mit QR-Rechnung, Zahlungsüberwachung, Stunden und Löhne, Buchhaltung. Ihre Treuhand findet direkt, was sie braucht, ohne Dateiaustausch.',
            'Sie können Cantia kostenlos testen. Mit Ihrer Treuhand wird nichts geteilt, bevor Sie zustimmen.',
          ],
          cta: 'Mein Cantia-Konto erstellen',
          url: newClientUrl(p),
        },
        it: {
          subject: `${firm} la invita a usare Cantia`,
          title: hello ? `Buongiorno ${hello},` : 'Buongiorno,',
          paragraphs: [
            `Il suo fiduciario, ${firm}, la invita a usare Cantia per semplificare la vostra collaborazione.`,
            'Cantia è il software svizzero per le imprese che lavorano su cantieri e per progetti: preventivi, fatture con QR-bill, pagamenti, ore e salari, contabilità. Il suo fiduciario trova direttamente ciò che gli serve, senza scambi di file.',
            'Può provarlo gratuitamente. Nulla viene condiviso con il suo fiduciario finché lei non accetta.',
          ],
          cta: 'Creare il mio account Cantia',
          url: newClientUrl(p),
        },
      }[l];
    }
    case 'request_new':
    case 'request_reminder': {
      const title = esc(p.title);
      const details = p.details ? esc(p.details).replace(/\n/g, '<br/>') : null;
      const due = p.due_date ? p.due_date.split('-').reverse().join('.') : null;
      const reminder = kind === 'request_reminder';
      return {
        fr: {
          subject: reminder ? `Rappel : ${firm} attend « ${title} »` : `${firm} vous demande : ${title}`,
          title: reminder ? 'Petit rappel de votre fiduciaire.' : 'Votre fiduciaire a besoin d’un document.',
          paragraphs: [
            `<strong>${title}</strong>${due ? ` · à fournir d’ici le ${due}` : ''}`,
            ...(details ? [details] : []),
            'Répondez depuis Cantia, dans Paramètres › Fiduciaire : ajoutez vos fichiers, ils arrivent directement chez votre fiduciaire. Pas besoin de les envoyer par e-mail.',
          ],
          cta: 'Répondre à la demande',
          url: `${APP_URL}/compte/fiduciaire`,
        },
        de: {
          subject: reminder ? `Erinnerung: ${firm} wartet auf «${title}»` : `${firm} bittet Sie um: ${title}`,
          title: reminder ? 'Eine kurze Erinnerung Ihrer Treuhand.' : 'Ihre Treuhand benötigt ein Dokument.',
          paragraphs: [
            `<strong>${title}</strong>${due ? ` · bis ${due}` : ''}`,
            ...(details ? [details] : []),
            'Antworten Sie in Cantia unter Einstellungen › Treuhand: Fügen Sie Ihre Dateien hinzu, sie gehen direkt an Ihre Treuhand. Kein E-Mail-Versand nötig.',
          ],
          cta: 'Auf die Anfrage antworten',
          url: `${APP_URL}/compte/fiduciaire`,
        },
        it: {
          subject: reminder ? `Promemoria: ${firm} attende «${title}»` : `${firm} le chiede: ${title}`,
          title: reminder ? 'Un breve promemoria del suo fiduciario.' : 'Il suo fiduciario ha bisogno di un documento.',
          paragraphs: [
            `<strong>${title}</strong>${due ? ` · entro il ${due}` : ''}`,
            ...(details ? [details] : []),
            'Risponda da Cantia, in Impostazioni › Fiduciario: aggiunga i suoi file, arrivano direttamente al suo fiduciario. Nessun invio per e-mail.',
          ],
          cta: 'Rispondere alla richiesta',
          url: `${APP_URL}/compte/fiduciaire`,
        },
      }[l];
    }
    case 'request_answered': {
      const title = esc(p.title);
      const url = clientUrl(p, 'requests');
      return {
        fr: { subject: `${org} a répondu : ${title}`, title: `${org} a répondu à votre demande.`, paragraphs: [`<strong>${title}</strong>`, 'Les fichiers et le message sont dans le dossier du mandant. Marquez la demande comme traitée une fois vérifiée.'], cta: 'Voir la réponse', url },
        de: { subject: `${org} hat geantwortet: ${title}`, title: `${org} hat auf Ihre Anfrage geantwortet.`, paragraphs: [`<strong>${title}</strong>`, 'Dateien und Nachricht finden Sie im Dossier des Mandanten. Markieren Sie die Anfrage nach der Prüfung als erledigt.'], cta: 'Antwort ansehen', url },
        it: { subject: `${org} ha risposto: ${title}`, title: `${org} ha risposto alla sua richiesta.`, paragraphs: [`<strong>${title}</strong>`, 'I file e il messaggio sono nel dossier del mandante. Segni la richiesta come evasa dopo la verifica.'], cta: 'Vedere la risposta', url },
      }[l];
    }
    case 'document_shared': {
      const title = esc(p.title);
      const details = p.details ? esc(p.details).replace(/\n/g, '<br/>') : null;
      const url = p.organization_id ? `${ACCOUNTING_URL}/mandant?id=${encodeURIComponent(p.organization_id)}&tab=documents` : `${ACCOUNTING_URL}/espace`;
      return {
        fr: { subject: `${org} vous a envoyé un document`, title: `${org} vous a envoyé un document.`, paragraphs: [`<strong>${title}</strong>`, ...(details ? [details] : []), 'Le document est dans le dossier du mandant, rubrique Documents.'], cta: 'Ouvrir le document', url },
        de: { subject: `${org} hat Ihnen ein Dokument gesendet`, title: `${org} hat Ihnen ein Dokument gesendet.`, paragraphs: [`<strong>${title}</strong>`, ...(details ? [details] : []), 'Das Dokument finden Sie im Dossier des Mandanten unter Dokumente.'], cta: 'Dokument öffnen', url },
        it: { subject: `${org} le ha inviato un documento`, title: `${org} le ha inviato un documento.`, paragraphs: [`<strong>${title}</strong>`, ...(details ? [details] : []), 'Il documento è nel dossier del mandante, sezione Documenti.'], cta: 'Aprire il documento', url },
      }[l];
    }

    case 'ext_request_new':
    case 'ext_request_reminder': {
      const title = esc(p.title);
      const details = p.details ? esc(p.details).replace(/\n/g, '<br/>') : null;
      const due = p.due_date ? p.due_date.split('-').reverse().join('.') : null;
      const reminder = kind === 'ext_request_reminder';
      const hello = p.contact_name ? esc(p.contact_name) : null;
      const url = portalUrl(p);
      return {
        fr: {
          subject: reminder ? `Rappel : ${firm} attend « ${title} »` : `${firm} vous demande : ${title}`,
          title: hello ? `Bonjour ${hello},` : 'Bonjour,',
          paragraphs: [
            reminder ? `Petit rappel : ${firm} attend toujours le document suivant.` : `${firm} a besoin du document suivant.`,
            `<strong>${title}</strong>${due ? ` · à fournir d’ici le ${due}` : ''}`,
            ...(details ? [details] : []),
            'Déposez vos fichiers sur votre espace sécurisé : ils arrivent directement chez votre fiduciaire. Aucun compte n’est nécessaire.',
          ],
          cta: 'Envoyer mes documents',
          url,
          from_firm: true,
        },
        de: {
          subject: reminder ? `Erinnerung: ${firm} wartet auf «${title}»` : `${firm} bittet Sie um: ${title}`,
          title: hello ? `Guten Tag ${hello}` : 'Guten Tag',
          paragraphs: [
            reminder ? `Eine kurze Erinnerung: ${firm} wartet noch auf folgendes Dokument.` : `${firm} benötigt folgendes Dokument.`,
            `<strong>${title}</strong>${due ? ` · bis ${due}` : ''}`,
            ...(details ? [details] : []),
            'Laden Sie Ihre Dateien in Ihrem sicheren Bereich hoch: Sie gehen direkt an Ihre Treuhand. Kein Konto nötig.',
          ],
          cta: 'Meine Dokumente senden',
          url,
          from_firm: true,
        },
        it: {
          subject: reminder ? `Promemoria: ${firm} attende «${title}»` : `${firm} le chiede: ${title}`,
          title: hello ? `Buongiorno ${hello},` : 'Buongiorno,',
          paragraphs: [
            reminder ? `Un breve promemoria: ${firm} attende ancora il documento seguente.` : `${firm} ha bisogno del documento seguente.`,
            `<strong>${title}</strong>${due ? ` · entro il ${due}` : ''}`,
            ...(details ? [details] : []),
            'Carichi i suoi file nel suo spazio sicuro: arrivano direttamente alla sua fiduciaria. Nessun account necessario.',
          ],
          cta: 'Inviare i miei documenti',
          url,
          from_firm: true,
        },
      }[l];
    }
    case 'approval_new': {
      const title = esc(p.title);
      const details = p.details ? esc(p.details).replace(/\n/g, '<br/>') : null;
      const due = p.due_date ? p.due_date.split('-').reverse().join('.') : null;
      const ext = !!p.portal_token;
      const url = ext ? portalUrl(p) : `${APP_URL}/compte/fiduciaire`;
      const hello = p.contact_name ? esc(p.contact_name) : null;
      return {
        fr: {
          subject: `${p.reminder ? 'Rappel : ' : ''}${firm} vous soumet un document à valider : ${title}`,
          title: hello ? `Bonjour ${hello},` : 'Document à valider.',
          paragraphs: [
            `${firm} vous soumet <strong>${title}</strong>${due ? `, à valider d’ici le ${due}` : ''}.`,
            ...(details ? [details] : []),
            ext ? 'Lisez le document et signez-le en ligne sur votre espace sécurisé, sans compte.' : 'Lisez le document et signez-le dans Cantia, Paramètres › Fiduciaire.',
          ],
          cta: 'Lire et signer',
          url,
          from_firm: ext,
        },
        de: {
          subject: `${p.reminder ? 'Erinnerung: ' : ''}${firm} legt Ihnen ein Dokument zur Freigabe vor: ${title}`,
          title: hello ? `Guten Tag ${hello}` : 'Dokument zur Freigabe.',
          paragraphs: [
            `${firm} legt Ihnen <strong>${title}</strong> vor${due ? `, Freigabe bis ${due}` : ''}.`,
            ...(details ? [details] : []),
            ext ? 'Lesen Sie das Dokument und unterzeichnen Sie es online in Ihrem sicheren Bereich, ohne Konto.' : 'Lesen Sie das Dokument und unterzeichnen Sie es in Cantia unter Einstellungen › Treuhand.',
          ],
          cta: 'Lesen und unterzeichnen',
          url,
          from_firm: ext,
        },
        it: {
          subject: `${p.reminder ? 'Promemoria: ' : ''}${firm} le sottopone un documento da convalidare: ${title}`,
          title: hello ? `Buongiorno ${hello},` : 'Documento da convalidare.',
          paragraphs: [
            `${firm} le sottopone <strong>${title}</strong>${due ? `, da convalidare entro il ${due}` : ''}.`,
            ...(details ? [details] : []),
            ext ? 'Legga il documento e lo firmi online nel suo spazio sicuro, senza account.' : 'Legga il documento e lo firmi in Cantia, Impostazioni › Fiduciario.',
          ],
          cta: 'Leggere e firmare',
          url,
          from_firm: ext,
        },
      }[l];
    }
    case 'approval_decided':
    case 'proposal_decided': {
      const title = esc(p.title);
      const reason = p.details ? esc(p.details) : null;
      const approval = kind === 'approval_decided';
      const url = clientUrl(p, approval ? 'approvals' : 'proposals');
      return {
        fr: {
          subject: p.accepted ? `${org} a ${approval ? 'signé' : 'accepté'} : ${title}` : `${org} a refusé : ${title}`,
          title: p.accepted ? (approval ? `${org} a signé.` : `${org} a accepté votre écriture.`) : `${org} a refusé.`,
          paragraphs: [`<strong>${title}</strong>`, ...(reason ? [`Motif : ${reason}`] : []), approval && p.accepted ? 'La preuve de signature (nom, date, empreinte du document) est dans le dossier du mandant.' : 'Le détail est dans le dossier du mandant.'],
          cta: 'Ouvrir le dossier',
          url,
        },
        de: {
          subject: p.accepted ? `${org} hat ${approval ? 'unterzeichnet' : 'angenommen'}: ${title}` : `${org} hat abgelehnt: ${title}`,
          title: p.accepted ? (approval ? `${org} hat unterzeichnet.` : `${org} hat Ihre Buchung angenommen.`) : `${org} hat abgelehnt.`,
          paragraphs: [`<strong>${title}</strong>`, ...(reason ? [`Grund: ${reason}`] : []), approval && p.accepted ? 'Der Unterschriftsnachweis (Name, Datum, Fingerabdruck) ist im Dossier des Mandanten.' : 'Die Einzelheiten finden Sie im Dossier des Mandanten.'],
          cta: 'Dossier öffnen',
          url,
        },
        it: {
          subject: p.accepted ? `${org} ha ${approval ? 'firmato' : 'accettato'}: ${title}` : `${org} ha rifiutato: ${title}`,
          title: p.accepted ? (approval ? `${org} ha firmato.` : `${org} ha accettato la sua registrazione.`) : `${org} ha rifiutato.`,
          paragraphs: [`<strong>${title}</strong>`, ...(reason ? [`Motivo: ${reason}`] : []), approval && p.accepted ? 'La prova di firma (nome, data, impronta) è nel dossier del mandante.' : 'Il dettaglio è nel dossier del mandante.'],
          cta: 'Aprire il dossier',
          url,
        },
      }[l];
    }
    case 'proposal_new': {
      const title = esc(p.title);
      const details = p.details ? esc(p.details).replace(/\n/g, '<br/>') : null;
      const url = `${APP_URL}/compte/fiduciaire`;
      return {
        fr: { subject: `${firm} vous propose une écriture : ${title}`, title: 'Votre fiduciaire propose une écriture.', paragraphs: [`<strong>${title}</strong>`, ...(details ? [details] : []), 'Elle n’entre dans votre comptabilité qu’une fois acceptée. Vérifiez-la dans Cantia, Paramètres › Fiduciaire.'], cta: 'Voir l’écriture', url },
        de: { subject: `${firm} schlägt Ihnen eine Buchung vor: ${title}`, title: 'Ihre Treuhand schlägt eine Buchung vor.', paragraphs: [`<strong>${title}</strong>`, ...(details ? [details] : []), 'Sie geht erst nach Ihrer Annahme in die Buchhaltung. Prüfen Sie sie in Cantia unter Einstellungen › Treuhand.'], cta: 'Buchung ansehen', url },
        it: { subject: `${firm} le propone una registrazione: ${title}`, title: 'La sua fiduciaria propone una registrazione.', paragraphs: [`<strong>${title}</strong>`, ...(details ? [details] : []), 'Entra nella sua contabilità solo dopo la sua accettazione. La verifichi in Cantia, Impostazioni › Fiduciario.'], cta: 'Vedere la registrazione', url },
      }[l];
    }
    default:
      return null;
  }
}

function render(m: Mail, l: Locale, accent = '#A95C30'): string {
  return `
  <div style="background:#F7F1E6;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E7DCCB;border-radius:14px;overflow:hidden">
      <div style="background:#16120E;padding:22px 32px" bgcolor="#16120E"><img src="https://krijilwxhdlzflvnvrtl.supabase.co/storage/v1/object/public/brand/email/logo-on-dark-v1.png" width="170" height="32" alt="Cantia" style="display:inline-block;vertical-align:middle;border:0;height:32px;width:170px" /><span style="display:inline-block;vertical-align:middle;margin-left:10px;font-size:12px;font-weight:700;letter-spacing:2.4px;color:#D9895A">&mdash;&nbsp;ACCOUNTING</span></div>
      <div style="padding:32px">
      <p style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:800;color:#231A12">${m.title}</p>
      ${m.paragraphs.map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#3D3126">${p}</p>`).join('')}
      <p style="margin:24px 0 8px"><a href="${m.url}" style="display:inline-block;background:${accent};color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;padding:12px 20px;border-radius:10px">${m.cta}</a></p>
      <p style="margin:12px 0 0;font-size:12px;color:#8A7B6C;word-break:break-all">${m.url}</p>
      </div>
    </div>
    <p style="max-width:560px;margin:16px auto 0;font-size:12px;color:#8A7B6C;text-align:center">${FOOTER[l]}</p>
  </div>`;
}

Deno.serve(async (req: Request) => {
  const secret = Deno.env.get('DISPATCH_SECRET');
  if (!secret || req.headers.get('x-dispatch-secret') !== secret) return new Response('forbidden', { status: 403 });
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return json({ error: 'RESEND_API_KEY missing' }, 500);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: rows, error } = await admin.rpc('fiduciary_outbox_claim', { p_limit: 25 });
  if (error) return json({ error: error.message }, 500);

  let sent = 0;
  let failed = 0;
  for (const row of (rows ?? []) as { id: string; kind: string; to_email: string; locale: string; payload: Payload }[]) {
    const locale: Locale = row.locale === 'de' || row.locale === 'it' ? row.locale : 'fr';
    const mail = build(row.kind, locale, row.payload ?? {});
    if (!mail) {
      await admin.from('fiduciary_email_outbox').update({ last_error: 'unknown kind', attempts: 99 }).eq('id', row.id);
      failed += 1;
      continue;
    }
    const p = row.payload ?? {};
    const accent = mail.from_firm && p.brand_color && /^#[0-9a-fA-F]{6}$/.test(p.brand_color) ? p.brand_color : '#A95C30';
    const senderName = mail.from_firm && p.firm_name ? `${String(p.firm_name).replace(/[<>"\r\n]/g, '').slice(0, 60)} via Cantia` : BRAND[locale];
    const replyTo = mail.from_firm && p.reply_to && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.reply_to) ? p.reply_to : 'info@cantia.ch';
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `${senderName} <noreply@cantia.ch>`,
        to: [row.to_email],
        reply_to: replyTo,
        subject: mail.subject.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'),
        html: render(mail, locale, accent),
      }),
    });
    if (res.ok) {
      await admin.from('fiduciary_email_outbox').update({ sent_at: new Date().toISOString(), last_error: null }).eq('id', row.id);
      sent += 1;
    } else {
      await admin.from('fiduciary_email_outbox').update({ last_error: `resend ${res.status}: ${(await res.text()).slice(0, 300)}` }).eq('id', row.id);
      failed += 1;
    }
  }
  return json({ sent, failed });
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
