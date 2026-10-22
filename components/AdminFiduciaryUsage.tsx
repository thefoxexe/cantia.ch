import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { FirmUsage } from '../lib/accounting/api';

// Super Admin › Fiduciaires: what a firm uses on accounting.cantia.ch.
// Internal tool: French only.

const FEATURE_LABEL: Record<string, string> = {
  clients_cantia: 'Mandants Cantia',
  clients_external: 'Mandants hors Cantia',
  invitations: 'Invitations de clients',
  requests: 'Demandes de documents',
  files_received: 'Fichiers reçus des clients',
  shared_documents: 'Documents envoyés par les clients',
  approvals: 'Validations et signatures',
  proposals: 'Écritures proposées',
  time: 'Saisie du temps',
  work: 'Travaux par mandat',
  templates: 'Modèles de processus',
  deadlines: 'Échéances suivies',
  notes: 'Notes internes',
  ledger_entries: 'Écritures (compta hors Cantia)',
  ledger_accounts: 'Plan comptable (hors Cantia)',
  vat_returns: 'Décomptes TVA',
  closings: 'Bouclements annuels',
  team: 'Équipe',
  branding: 'Logo et couleur du cabinet',
  directory: 'Visible dans l’annuaire',
};

const SPACE: Record<string, string> = {
  overview: 'Accueil',
  clients: 'Mandants',
  work: 'Travaux',
  requests: 'Demandes',
  deadlines: 'Échéances',
  approvals: 'Validations',
  time: 'Temps',
  documents: 'Documents',
  team: 'Équipe',
  partner: 'Partenariat',
  settings: 'Réglages',
};

const CLIENT: Record<string, string> = {
  overview: 'Aperçu',
  work: 'Travaux',
  requests: 'Demandes',
  deadlines: 'Échéances',
  approvals: 'Validations',
  time: 'Temps',
  invoices: 'Factures',
  payments: 'Paiements',
  customers: 'Clients du mandant',
  accounting: 'Comptabilité',
  proposals: 'Écritures proposées',
  documents: 'Documents',
  quotes: 'Devis',
  hours: 'Heures',
  payroll: 'Salaires',
  integrations: 'Intégrations',
  notes: 'Notes',
  ledger: 'Comptabilité',
  settings: 'Réglages',
};

const LEDGER: Record<string, string> = {
  journal: 'Journal',
  accounts: 'Plan comptable',
  reports: 'États financiers',
  vat: 'TVA',
  closing: 'Bouclement',
  kpis: 'Indicateurs',
  import: 'Import',
  settings: 'Réglages',
};

const EXPORT: Record<string, string> = {
  banana: 'Banana',
  abacus: 'Abacus',
  winbiz: 'Winbiz',
  'banana-balances': 'Banana (soldes)',
  'abacus-balances': 'Abacus (soldes)',
  'winbiz-balances': 'Winbiz (soldes)',
  'ledger-account': 'Grand livre d’un compte (CSV)',
  balance: 'Balance (CSV)',
  'balance-csv': 'Balance (CSV)',
  'entries-csv': 'Écritures (CSV)',
  'vat-xml': 'TVA eCH-0217 (XML)',
  'vat-csv': 'Décompte TVA (CSV)',
  'annual-accounts': 'Comptes annuels',
  'time-csv': 'Temps (CSV)',
};

const ACTION: Record<string, string> = {
  firm_created: 'Cabinet créé',
  client_invited: 'Client invité',
  new_client_joined: 'Nouveau client inscrit par invitation',
  external_client_created: 'Mandant hors Cantia créé',
  external_client_updated: 'Mandant hors Cantia modifié',
  external_client_new_link: 'Nouveau lien de dépôt généré',
  request_created: 'Demande de documents envoyée',
  request_answered: 'Demande répondue par le client',
  request_done: 'Demande terminée',
  request_open: 'Demande rouverte',
  request_cancelled: 'Demande annulée',
  request_remind: 'Relance envoyée',
};

export function areaLabel(area: string): string {
  const [kind, rest = ''] = area.split(':');
  if (kind === 'space') return `Espace › ${SPACE[rest] ?? rest}`;
  if (kind === 'client') return `Mandant Cantia › ${CLIENT[rest] ?? rest}`;
  if (kind === 'external') return `Mandant hors Cantia › ${CLIENT[rest] ?? rest}`;
  if (kind === 'ledger') return `Compta hors Cantia › ${LEDGER[rest] ?? rest}`;
  if (kind === 'export') return `Export › ${EXPORT[rest] ?? rest}`;
  if (area === 'clients:portfolio') return 'Mandants › Vue portefeuille';
  if (area === 'document:open') return 'Document ouvert';
  return area;
}

function actionLabel(key: string): string {
  return ACTION[key] ?? key.replace(/_/g, ' ');
}

export function relativeTime(iso: string | null): string {
  if (!iso) return 'jamais';
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 2) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'hier';
  if (days < 30) return `il y a ${days} jours`;
  return new Date(iso).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function dateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Green under a week, amber under a month, red beyond (or never).
export function freshnessColor(iso: string | null): string {
  if (!iso) return colors.danger;
  const days = (Date.now() - new Date(iso).getTime()) / 86400000;
  return days < 7 ? colors.success : days < 30 ? colors.warning : colors.danger;
}

const ROLE: Record<string, string> = { OWNER: 'Propriétaire', ADMIN: 'Admin', MEMBER: 'Collaborateur' };

export function FiduciaryUsagePanel({ usage }: { usage: FirmUsage }) {
  const used = usage.features.filter((f) => f.count > 0);
  const unused = usage.features.filter((f) => f.count === 0);
  const maxViews = Math.max(1, ...usage.daily.map((d) => d.views));
  const totalViews = usage.daily.reduce((n, d) => n + d.views, 0);
  const activeDays = usage.daily.filter((d) => d.views > 0).length;

  return (
    <View style={st.wrap}>
      <Text style={st.title}>Personnes</Text>
      <View style={st.list}>
        {usage.members.map((m) => (
          <View key={m.user_id} style={st.person}>
            <View style={[st.dot, { backgroundColor: freshnessColor(m.last_seen_at ?? m.last_sign_in_at) }]} />
            <View style={{ flex: 1, minWidth: 200 }}>
              <Text style={st.strong}>
                {m.name || m.email} <Text style={st.muted}>· {ROLE[m.role] ?? m.role}</Text>
              </Text>
              <Text style={st.muted}>{m.email}</Text>
              {m.top_areas.length > 0 ? <Text style={st.muted}>Utilise surtout : {m.top_areas.slice(0, 3).map(areaLabel).join(' · ')}</Text> : null}
            </View>
            <View style={st.personMeta}>
              <Text style={st.metaStrong}>Vu {relativeTime(m.last_seen_at)}</Text>
              <Text style={st.muted}>Connexion {relativeTime(m.last_sign_in_at)}</Text>
              <Text style={st.muted}>{m.active_days_30} jour{m.active_days_30 > 1 ? 's' : ''} actif{m.active_days_30 > 1 ? 's' : ''} / 30</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={st.title}>Activité des 30 derniers jours</Text>
      <View style={st.chartCard}>
        <Text style={st.muted}>
          {totalViews} écran{totalViews > 1 ? 's' : ''} ouvert{totalViews > 1 ? 's' : ''} sur {activeDays} jour{activeDays > 1 ? 's' : ''}
        </Text>
        <View style={st.chart} accessibilityLabel={`Activité quotidienne, maximum ${maxViews} écrans par jour`}>
          {usage.daily.map((d) => (
            <View key={d.day} style={st.barSlot}>
              <View style={[st.bar, { height: d.views > 0 ? Math.max(3, (d.views / maxViews) * 64) : 1, backgroundColor: d.views > 0 ? colors.primary : colors.border }]} />
            </View>
          ))}
        </View>
        <View style={st.chartAxis}>
          <Text style={st.axis}>{new Date(usage.daily[0]?.day ?? Date.now()).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' })}</Text>
          <Text style={st.axis}>max {maxViews} / jour</Text>
          <Text style={st.axis}>aujourd’hui</Text>
        </View>
      </View>

      <Text style={st.title}>
        Fonctions utilisées ({used.length} / {usage.features.length})
      </Text>
      <View style={st.grid}>
        {used.map((f) => (
          <View key={f.key} style={st.feature}>
            <Feather name="check-circle" size={14} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={st.strong}>{FEATURE_LABEL[f.key] ?? f.key}</Text>
              <Text style={st.muted}>
                {[f.key === 'branding' || f.key === 'directory' ? 'oui' : String(f.count), f.extra, f.last_at ? `dernier ${relativeTime(f.last_at)}` : null].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </View>
        ))}
      </View>
      {unused.length > 0 ? (
        <Text style={st.muted}>Jamais utilisé : {unused.map((f) => FEATURE_LABEL[f.key] ?? f.key).join(', ')}</Text>
      ) : null}

      <Text style={st.title}>Écrans et exports (90 jours)</Text>
      {usage.areas.length === 0 ? (
        <Text style={st.muted}>Rien d’enregistré pour l’instant : le suivi des écrans démarre avec cette version.</Text>
      ) : (
        <View style={st.list}>
          {usage.areas.map((a) => (
            <View key={a.area} style={st.areaRow}>
              <Text style={[st.row, { flex: 1 }]}>{areaLabel(a.area)}</Text>
              <Text style={st.num}>{a.views}×</Text>
              <Text style={st.areaMeta}>
                {a.days} j · {a.users} pers. · {relativeTime(a.last_at)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text style={st.title}>Dernières actions</Text>
      {usage.recent.length === 0 ? <Text style={st.muted}>Aucune action enregistrée.</Text> : null}
      <View style={st.list}>
        {usage.recent.slice(0, 30).map((r, i) => (
          <View key={`${r.at}-${i}`} style={st.event}>
            <Feather name={r.kind === 'action' ? 'zap' : 'eye'} size={13} color={r.kind === 'action' ? colors.primary : colors.textMuted} style={{ marginTop: 3 }} />
            <View style={{ flex: 1 }}>
              <Text style={st.row}>
                {r.kind === 'action' ? actionLabel(r.key) : `${areaLabel(r.key)}${r.views && r.views > 1 ? ` (${r.views}× ce jour-là)` : ''}`}
                {r.client ? <Text style={st.muted}> · {r.client}</Text> : null}
              </Text>
              <Text style={st.muted}>
                {[r.actor ?? (r.kind === 'action' ? 'client' : null), dateTime(r.at)].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { gap: spacing.md },
  title: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.sm },
  list: { gap: 6 },
  person: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: spacing.md, backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  personMeta: { alignItems: 'flex-end', gap: 1 },
  strong: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  metaStrong: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  muted: { fontSize: 12, color: colors.textMuted, fontWeight: '400' },
  row: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  chartCard: { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 66, gap: 2 },
  barSlot: { flex: 1, alignItems: 'stretch', justifyContent: 'flex-end' },
  bar: { borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  chartAxis: { flexDirection: 'row', justifyContent: 'space-between' },
  axis: { fontSize: 11, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  feature: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', flexGrow: 1, flexBasis: 240, backgroundColor: colors.successSoft, borderRadius: radius.md, padding: spacing.sm },
  areaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 6 },
  num: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'], minWidth: 40, textAlign: 'right' },
  areaMeta: { fontSize: 12, color: colors.textMuted, minWidth: 170, textAlign: 'right' },
  event: { flexDirection: 'row', gap: spacing.sm },
});
