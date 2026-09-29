# Cantia Accounting (accounting.cantia.ch)

Espace gratuit pour les fiduciaires qui travaillent avec des entreprises clientes de Cantia.
Nom affiché : **Cantia Fiduciaires** (FR), **Cantia Treuhand** (DE), **Cantia Fiduciari** (IT).

## Architecture

| Site | Build | Racine des routes |
|---|---|---|
| cantia.ch + app.cantia.ch | `expo export` (défaut) | `app/` |
| partners.cantia.ch | `scripts/build-partners.mjs` (`CANTIA_SURFACE=partners`) | `app-partners/` |
| accounting.cantia.ch | `scripts/build-accounting.mjs` (`CANTIA_SURFACE=accounting`) | `app-accounting/` |

Un seul dépôt, un seul `netlify.toml`, un seul projet Supabase. `app.config.js` choisit la racine
(`ACCOUNTING_BUILD=1`). Le build écrit `dist/` avec ses propres `_redirects`, `robots.txt` et `sitemap.xml`.

Fichiers principaux :

- `app-accounting/` : `index|de|it` (landing), `connexion`, `espace` (onboarding + cockpit), `mandant?id=`, `invitation?token=`, `admin`
- `components/accounting/` : `AccountingChrome`, `AccountingLanding`, `Onboarding`, `Cockpit`
- `lib/accounting/` : `copy.ts` (FR/DE/IT), `locale.tsx`, `api.ts`
- App (client) : `app/(app)/compte/fiduciaire.tsx`, `lib/api/fiduciary.ts`
- Base : `supabase/migrations/20260929210000_accounting_foundation.sql`
- E-mails : `supabase/functions/accounting-mailer`
- SSO : `supabase/functions/partners-sso` (`target: 'partners' | 'accounting'`)

## Auth et SSO

Un seul utilisateur Cantia (`auth.users`) pour l'app, Partners et Accounting. Une fiduciaire se connecte
avec le même mot de passe ou Google. Les sessions restent par domaine (jamais de cookie d'auth sur `.cantia.ch`) ;
le passage d'un site à l'autre utilise un lien de connexion à usage unique généré par `partners-sso`,
limité aux destinations connues. À configurer dans Supabase : Redirect URLs `https://accounting.cantia.ch/**`.

## Modèles

- `fiduciary_firms` : la fiduciaire (jamais une `organizations`). `verified`, `public_directory_visible` préparés pour l'annuaire.
- `fiduciary_members` : `OWNER | ADMIN | MEMBER`, une fiduciaire par utilisateur (V1). `all_clients` + `fiduciary_member_clients` préparent l'accès par mandant.
- `fiduciary_client_access` : lien fiduciaire ↔ entreprise. Statuts `PENDING_CLIENT` (demandé par la fiduciaire), `PENDING_FIRM` (proposé par le client), `ACTIVE`, `REFUSED`, `REVOKED`, `CANCELLED`. `permissions text[]`, `requested_by`, `approved_by`, `revoked_by`, dates.
- `fiduciary_invitations` : `STAFF`, `CLIENT_TO_FIRM`, `NEW_CLIENT` (avec `partner_code` et `result_organization_id`).
- `fiduciary_audit_log`, `fiduciary_admin_notes`, `fiduciary_email_outbox`.

## Permissions

`VIEW_INVOICES`, `VIEW_QUOTES`, `VIEW_CUSTOMERS`, `VIEW_PAYMENT_STATUS`, `VIEW_ACCOUNTING_DOCUMENTS`,
`DOWNLOAD_DOCUMENTS`, `VIEW_EXPORTS`, `VIEW_WORK_HOURS`, `VIEW_PAYROLL_DATA`.

**ACCOUNTING_STANDARD** (défaut) : factures, paiements, clients, comptabilité/justificatifs, téléchargements, exports.
Devis, heures et salaires restent fermés tant que le client ne les ouvre pas.

## Sécurité et vie privée (nLPD)

- Aucune donnée tant que l'accès n'est pas `ACTIVE`.
- Lecture seule : uniquement des politiques RLS `SELECT` ajoutées sur les tables concernées, toutes basées sur
  `fiduciary_org_ids(permission)` (auth.uid() → membre d'une fiduciaire active → accès ACTIVE → permission).
  L'`organization_id` envoyé par le navigateur n'accorde rien.
- Stockage : seuls les PDF de factures et les justificatifs d'écritures sont téléchargeables, jamais le reste du stockage.
- Jamais affichés : photos de chantier, planning, notes internes, géolocalisation, rapports.
- Révocation immédiate (la requête suivante ne renvoie plus rien). Tout est journalisé :
  invitation, demande, acceptation, refus, permissions modifiées, révocation, collaborateur ajouté/retiré,
  Partners activé, dossier consulté (au plus une fois par heure et par personne).
- Le client voit dans Paramètres › Fiduciaire qui a accès, à quoi, et l'historique.

## Parcours

1. **Client → fiduciaire** : Paramètres › Fiduciaire › Inviter. Si l'e-mail appartient à une fiduciaire Cantia :
   `PENDING_FIRM`, elle accepte dans son cockpit. Sinon invitation `CLIENT_TO_FIRM` ; à la création de son espace,
   l'accès devient `ACTIVE` avec les autorisations choisies par le client.
2. **Fiduciaire → client existant** : « Ajouter un mandant » avec l'e-mail du responsable. Demande `PENDING_CLIENT`,
   notification + e-mail au client, qui accepte ou refuse (et ajuste les autorisations).
3. **Fiduciaire → nouveau client** : même bouton ; si l'e-mail n'a pas de compte, invitation `NEW_CLIENT` avec lien
   `app.cantia.ch/signup?fiduciary_invite=TOKEN&ref=CODE`. Le jeton suit le compte (métadonnées) ; à la création
   de l'entreprise, un trigger crée l'accès `PENDING_CLIENT` et le client accepte explicitement.

## Pont Partners

« Activer Cantia Partners » crée un profil partenaire `ACCOUNTING_FIRM` pour le même utilisateur (`become_partner`).
Ensuite, chaque invitation de nouveau client inclut automatiquement son code. Rattachement, commission (25 % pendant
12 mois) et versements passent par le moteur Partners existant (`partners_attribute_core`, `partners_record_payment`).
Un client déjà sur Cantia ne génère pas de commission.

## Intégrations

Affichées telles qu'elles sont : Bexio (statut, dernière synchronisation, dernière erreur, jamais les identifiants).
WinBiz, Crésus, Abacus, Klara : « pas encore disponibles », exports CSV (écritures, balance, feuille TVA).

## E-mails

`fiduciary_email_outbox` rempli par les fonctions SQL, envoyé tout de suite par `accounting-mailer` (trigger +
`X-Dispatch-Secret`), relance horaire (cron `accounting-mailer-retry`). Modèles FR/DE/IT : bienvenue, invitation
collaborateur, invitation d'un client vers la fiduciaire, demande d'accès, accès accepté, refusé, révoqué,
invitation nouveau client.

## Admin

`accounting.cantia.ch/admin` (permission `accounting.admin`, donnée aux admins plateforme) : nombre de fiduciaires,
actives, mandants liés, clients acquis, MRR acquis, fiduciaires partenaires, demandes suspectes (refus répétés,
volume anormal). Fiche : profil, membres, mandants, invitations, profil Partners, commissions, notes, journal ;
actions vérifier / suspendre / bloquer / retirer un accès / ajouter une note.

## Netlify

Nouveau site Netlify sur le même dépôt et la même branche :

- Base directory : (vide)
- Build command : (vide, `netlify.toml` s'en charge)
- Publish directory : `dist`
- Variables : `CANTIA_SURFACE=accounting` (+ les mêmes `EXPO_PUBLIC_*` que les autres sites si elles y sont définies)
- Domaine : `accounting.cantia.ch` (CNAME `accounting` → `<site>.netlify.app`, automatique avec Netlify DNS)

## Tests effectués (base de production, transactions annulées)

- Fiduciaire A demande l'accès : 0 facture visible avant accord ; 1 facture + lignes après ; devis non autorisés : 0.
- Fiduciaire B : 0. Après révocation : 0. Journal et e-mails générés.
- Nouveau client invité par une fiduciaire partenaire : accès `PENDING_CLIENT` à l'inscription, rattachement Partners,
  rien de visible avant accord, visible après, paiement de 79 CHF → commission 19.75 CHF.

## Prévu, pas encore construit

Import CSV des mandants, annuaire public (`cantia.ch/fiduciaires`), limitation d'un collaborateur à certains mandants,
connexions WinBiz / Crésus / Abacus / Klara.
