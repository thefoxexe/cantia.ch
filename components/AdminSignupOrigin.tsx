import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { AdminOrgOrigin, SignupChannel } from '../lib/api/admin';

type IconName = keyof typeof Feather.glyphMap;

const CHANNEL_META: Record<SignupChannel['key'], { icon: IconName; color: string }> = {
  partner: { icon: 'users', color: colors.plum },
  fiduciary: { icon: 'briefcase', color: colors.slate },
  google_ads: { icon: 'target', color: colors.accent },
  campaign: { icon: 'flag', color: colors.accent },
  search: { icon: 'search', color: colors.success },
  social: { icon: 'share-2', color: colors.slate },
  ai: { icon: 'cpu', color: colors.plum },
  website: { icon: 'link', color: colors.moss },
  blog: { icon: 'book-open', color: colors.moss },
  direct: { icon: 'navigation', color: colors.primary },
  site: { icon: 'globe', color: colors.primary },
  unknown: { icon: 'help-circle', color: colors.textMuted },
};

const SIGNUP_SOURCE_LABEL: Record<string, string> = {
  accounting: 'accounting.cantia.ch (fiduciaires)',
  partners: 'partners.cantia.ch',
};

const PROVIDER_LABEL: Record<string, string> = { email: 'e-mail et mot de passe', google: 'Google' };

const FIDUCIARY_SOURCE_LABEL: Record<string, string> = {
  NEW_CLIENT_INVITE: 'invitée à créer son compte par la fiduciaire',
  CLIENT_INVITE: 'invitée par la fiduciaire',
  FIRM_REQUEST: 'demande d’accès de la fiduciaire',
};

const FIDUCIARY_STATUS_LABEL: Record<string, string> = {
  PENDING_CLIENT: 'en attente du client',
  PENDING_FIRM: 'en attente de la fiduciaire',
  ACTIVE: 'accès actif',
  REFUSED: 'refusé',
  REVOKED: 'révoqué',
  CANCELLED: 'annulé',
};

const PARTNER_SOURCE_LABEL: Record<string, string> = { link: 'lien du partenaire', code: 'code saisi à l’inscription', admin: 'attribué à la main' };

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function describeHost(host: string | null): string | null {
  if (!host) return null;
  if (host === 'ios') return 'App iPhone';
  if (host === 'android') return 'App Android';
  return host;
}

// "il y a 3 jours" between the first visit and the company's creation —
// the one number that says whether this was an impulse or a slow decision.
function describeDelay(fromIso: string | null, toIso: string): string | null {
  if (!fromIso) return null;
  const minutes = Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60000);
  if (minutes < 0) return null;
  if (minutes < 60) return `${minutes} min avant l’inscription`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h avant l’inscription`;
  return `${Math.round(hours / 24)} jours avant l’inscription`;
}

export function SignupChannelChip({ channel, compact }: { channel: SignupChannel; compact?: boolean }) {
  const meta = CHANNEL_META[channel.key] ?? CHANNEL_META.unknown;
  return (
    <View style={[styles.chip, { backgroundColor: `${meta.color}1a` }]}>
      <Feather name={meta.icon} size={compact ? 11 : 13} color={meta.color} />
      <Text style={[styles.chipText, compact && styles.chipTextCompact, { color: meta.color }]} numberOfLines={1}>
        {channel.label}
        {!compact && channel.detail ? ` · ${channel.detail}` : ''}
      </Text>
    </View>
  );
}

function Row({ icon, label, value, sub }: { icon: IconName; label: string; value: string; sub?: string | null }) {
  return (
    <View style={styles.row}>
      <Feather name={icon} size={15} color={colors.textMuted} style={styles.rowIcon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} selectable>
          {value}
        </Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

export function AdminSignupOrigin({ origin }: { origin: AdminOrgOrigin }) {
  const { owner, campaign, first_visit: firstVisit, journey, partner } = origin;
  const host = describeHost(origin.host);
  const campaignParts = campaign
    ? [
        campaign.utm_source && `source : ${campaign.utm_source}`,
        campaign.utm_medium && `support : ${campaign.utm_medium}`,
        campaign.utm_campaign && `campagne : ${campaign.utm_campaign}`,
        campaign.utm_content && `annonce : ${campaign.utm_content}`,
        campaign.utm_term && `mot-clé : ${campaign.utm_term}`,
      ].filter(Boolean)
    : [];
  const hasTrace =
    origin.channel.key !== 'unknown' || !!host || !!campaign || !!origin.signup_referrer || !!firstVisit || !!partner || origin.fiduciaries.length > 0 || origin.blog_leads.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Canal</Text>
        <SignupChannelChip channel={origin.channel} />
      </View>

      {owner ? (
        <Row
          icon="user"
          label="Compte du propriétaire"
          value={`${owner.email} — via ${PROVIDER_LABEL[owner.provider ?? ''] ?? owner.provider ?? 'inconnu'}`}
          sub={[
            `Compte créé le ${formatDateTime(owner.account_created_at)}`,
            owner.signup_source ? `inscrit depuis ${SIGNUP_SOURCE_LABEL[owner.signup_source] ?? owner.signup_source}` : null,
            owner.newsletter ? 'newsletter acceptée' : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        />
      ) : null}

      {host ? <Row icon="monitor" label="Entreprise créée depuis" value={host} sub={formatDateTime(origin.created_at)} /> : null}

      {firstVisit ? (
        <Row
          icon="log-in"
          label="Première visite sur le site"
          value={firstVisit.referrer ? `Depuis ${firstVisit.referrer}` : 'Accès direct (adresse tapée, favori ou lien sans référent)'}
          sub={[
            firstVisit.landing_path ? `Page d’arrivée : ${firstVisit.landing_path}` : null,
            firstVisit.at ? formatDateTime(firstVisit.at) : null,
            describeDelay(firstVisit.at, origin.created_at),
          ]
            .filter(Boolean)
            .join(' · ')}
        />
      ) : null}

      {campaign ? (
        <Row
          icon={campaign.gclid ? 'target' : 'flag'}
          label={campaign.gclid ? 'Clic sur une annonce Google Ads' : 'Campagne (paramètres UTM)'}
          value={campaignParts.length > 0 ? campaignParts.join(' · ') : 'Annonce Google Ads (sans paramètre UTM)'}
        />
      ) : null}

      {origin.signup_referrer ? (
        <Row icon="corner-down-right" label="Page juste avant l’inscription" value={origin.signup_referrer} />
      ) : null}

      {partner ? (
        <Row
          icon="users"
          label="Partenaire"
          value={[partner.name, partner.code ? `code ${partner.code}` : null].filter(Boolean).join(' · ') || 'Partenaire'}
          sub={[
            partner.source ? (PARTNER_SOURCE_LABEL[partner.source] ?? partner.source) : null,
            partner.first_click_at ? `premier clic le ${formatDateTime(partner.first_click_at)}` : null,
            partner.clicks.length > 0 ? `${partner.clicks.length} clic${partner.clicks.length > 1 ? 's' : ''} sur le lien` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        />
      ) : null}

      {origin.fiduciaries.map((f, i) => (
        <Row
          key={`fid-${i}`}
          icon="briefcase"
          label="Fiduciaire"
          value={[f.firm, f.city].filter(Boolean).join(', ')}
          sub={[FIDUCIARY_SOURCE_LABEL[f.source] ?? f.source, FIDUCIARY_STATUS_LABEL[f.status] ?? f.status, f.requested_at ? formatDateTime(f.requested_at) : null]
            .filter(Boolean)
            .join(' · ')}
        />
      ))}

      {origin.blog_leads.map((b, i) => (
        <Row
          key={`blog-${i}`}
          icon="book-open"
          label="Contact laissé sur le blog"
          value={b.slug ? `/blog/${b.slug}` : 'Blog'}
          sub={formatDateTime(b.at)}
        />
      ))}

      {journey && journey.pageviews > 0 ? (
        <View style={styles.journey}>
          <Text style={styles.rowLabel}>Parcours avant l’inscription</Text>
          <Text style={styles.journeySummary}>
            {journey.pageviews} page{journey.pageviews > 1 ? 's' : ''} vue{journey.pageviews > 1 ? 's' : ''} sur {journey.days} jour
            {journey.days > 1 ? 's' : ''}
            {journey.referrers.length > 0 ? ` · venu de ${journey.referrers.join(', ')}` : ''}
          </Text>
          {journey.pages.map((p) => (
            <View key={p.path} style={styles.pageRow}>
              <View style={styles.pageDot} />
              <Text style={styles.pagePath} numberOfLines={1}>
                {p.path}
              </Text>
              {p.views > 1 ? <Text style={styles.pageViews}>×{p.views}</Text> : null}
              <Text style={styles.pageAt}>{formatDateTime(p.at)}</Text>
            </View>
          ))}
          {journey.actions.length > 0 ? (
            <Text style={styles.rowSub}>
              Actions : {journey.actions.map((a) => `${a.kind} (${a.page})`).join(' · ')}
            </Text>
          ) : null}
        </View>
      ) : null}

      {!hasTrace || origin.channel.key === 'unknown' ? (
        <View style={styles.note}>
          <Feather name="info" size={14} color={colors.textMuted} />
          <Text style={styles.noteText}>
            {hasTrace
              ? 'Pas assez d’éléments pour déterminer le canal avec certitude.'
              : 'Aucune trace de provenance : l’entreprise a été créée avant la mise en place du suivi détaillé, ou le visiteur a refusé les cookies du site.'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
    shadowColor: '#0B0F0E',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  headerLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    maxWidth: '100%',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    flexShrink: 1,
  },
  chipTextCompact: {
    fontSize: 11,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowIcon: {
    marginTop: 2,
  },
  rowLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  rowSub: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  journey: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: 6,
  },
  journeySummary: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  pageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  pagePath: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  pageViews: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  pageAt: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  noteText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
