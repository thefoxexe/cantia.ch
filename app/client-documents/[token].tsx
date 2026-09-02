import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { listClientDocuments, getPublicDocumentPdfUrl } from '../../lib/api/publicPortal';
import { downloadFile } from '../../lib/downloadFile';
import { ClientPortalHeader } from '../../components/ClientPortalHeader';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { premiumCard, portalFonts } from '../../lib/clientPortalTheme';
import { applyClientPortalLocale, detectAndApplyBrowserLocale, useTranslation } from '../../lib/translations';
import type { ClientDocumentsPayload, ClientDocumentSummary } from '../../lib/types';

detectAndApplyBrowserLocale();

// A dedicated page (reached via the hamburger menu on a devis/facture page,
// or the back button from one) rather than a bottom-sheet — the client's
// full document history, chantier by chantier, with devis and factures
// kept in visually separate sections and a direct download action on every
// row so they don't have to open a document first just to grab its PDF.
export default function ClientDocumentsScreen() {
  const { t } = useTranslation();
  const DEVIS_STATUS_LABELS: Record<string, string> = {
    draft: t('common.status.draft'),
    ready: t('common.status.ready'),
    sent: t('common.status.sent'),
    accepted: t('common.status.accepted'),
    refused: t('common.status.refused'),
  };
  const FACTURE_STATUS_LABELS: Record<string, string> = {
    draft: t('common.status.draft'),
    sent: t('common.status.sent'),
    partial: t('common.status.partial'),
    paid: t('common.status.paid'),
    cancelled: t('common.status.cancelled'),
  };
  const { token, kind, email, session } = useLocalSearchParams<{ token: string; kind: string; email: string; session: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<ClientDocumentsPayload | null>(null);
  const [downloadingToken, setDownloadingToken] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !email || !session) return;
    setLoading(true);
    setError(null);
    const docKind = kind === 'facture' ? 'facture' : 'devis';
    const { data, error: err } = await listClientDocuments(token, docKind, email, session);
    setLoading(false);
    if (err || !data) {
      setError(t('clientDocumentsPortal.loadFailed'));
      return;
    }
    setPayload(data);
    applyClientPortalLocale(data.organization_locale);
  }, [token, kind, email, session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const groups = useMemo(() => {
    if (!payload) return [] as [string, { devis: ClientDocumentSummary[]; factures: ClientDocumentSummary[] }][];
    const map = new Map<string, { devis: ClientDocumentSummary[]; factures: ClientDocumentSummary[] }>();
    const keyFor = (name: string | null) => name ?? t('clientDocumentsPortal.noProject');
    for (const d of payload.devis) {
      const key = keyFor(d.project_name);
      const group = map.get(key) ?? { devis: [], factures: [] };
      group.devis.push(d);
      map.set(key, group);
    }
    for (const f of payload.factures) {
      const key = keyFor(f.project_name);
      const group = map.get(key) ?? { devis: [], factures: [] };
      group.factures.push(f);
      map.set(key, group);
    }
    return Array.from(map.entries());
  }, [payload, t]);

  async function handleDownload(docToken: string, docKind: 'devis' | 'facture', filenamePrefix: string) {
    if (!email || !session) return;
    setDownloadingToken(docToken);
    setDownloadError(null);
    const { url, error: err } = await getPublicDocumentPdfUrl(docToken, docKind, email, session);
    setDownloadingToken(null);
    if (err || !url) {
      setDownloadError(err ?? t('clientDocumentsPortal.downloadFailed'));
      return;
    }
    await downloadFile(url, `${filenamePrefix}.pdf`);
  }

  // Carrying email+session forward lets the destination page skip the
  // verification gate entirely when the session is still valid — sessions
  // are scoped to the email, not a single document, so one code unlocks
  // browsing across all of it (see 20260901050000_portal_session_scope_by_email.sql).
  function openDevis(docToken: string) {
    router.push(`/devis-client/${docToken}?email=${encodeURIComponent(email)}&session=${encodeURIComponent(session)}` as any);
  }

  function openFacture(docToken: string) {
    router.push(`/facture-client/${docToken}?email=${encodeURIComponent(email)}&session=${encodeURIComponent(session)}` as any);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ClientPortalHeader />
      <Pressable onPress={() => router.back()} style={styles.backRow} hitSlop={8}>
        <Feather name="arrow-left" size={16} color={colors.textMuted} />
        <Text style={styles.backText}>{t('clientDocumentsPortal.back')}</Text>
      </Pressable>

      <Text style={styles.title}>{payload?.organization_name ? t('clientDocumentsPortal.titleWithOrg', { org: payload.organization_name }) : t('clientDocumentsPortal.title')}</Text>

      {loading ? <Text style={styles.hint}>{t('clientDocumentsPortal.loading')}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {downloadError ? <Text style={styles.error}>{downloadError}</Text> : null}
      {!loading && !error && groups.length === 0 ? <Text style={styles.hint}>{t('clientDocumentsPortal.noDocuments')}</Text> : null}

      {groups.map(([projectName, docs]) => (
        <View key={projectName} style={[premiumCard, styles.group]}>
          <Text style={styles.groupTitle}>{projectName}</Text>

          {docs.devis.length > 0 ? (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>{t('clientDocumentsPortal.devisTitle')}</Text>
              {docs.devis.map((d) => (
                <View key={d.token} style={styles.docRow}>
                  <Pressable style={styles.docInfoRow} onPress={() => openDevis(d.token)}>
                    <Feather name="file-text" size={16} color={colors.textMuted} />
                    <View style={styles.docInfo}>
                      <Text style={styles.docTitle}>{t('clientDocumentsPortal.devisNumber', { number: d.number ?? '' })}</Text>
                      <Text style={styles.docMeta}>{DEVIS_STATUS_LABELS[d.status] ?? d.status}</Text>
                    </View>
                  </Pressable>
                  {d.has_pdf ? (
                    <Pressable
                      onPress={() => handleDownload(d.token, 'devis', `Devis-${d.number ?? d.token}`)}
                      style={styles.downloadButton}
                      hitSlop={8}
                      disabled={downloadingToken === d.token}
                    >
                      <Feather name={downloadingToken === d.token ? 'loader' : 'download'} size={16} color={colors.primary} />
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {docs.factures.length > 0 ? (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>{t('clientDocumentsPortal.facturesTitle')}</Text>
              {docs.factures.map((f) => (
                <View key={f.token} style={styles.docRow}>
                  <Pressable style={styles.docInfoRow} onPress={() => openFacture(f.token)}>
                    <Feather name="file" size={16} color={colors.textMuted} />
                    <View style={styles.docInfo}>
                      <Text style={styles.docTitle}>
                        {f.is_deposit ? t('clientDocumentsPortal.depositFactureNumber', { number: f.number ?? '' }) : t('clientDocumentsPortal.factureNumber', { number: f.number ?? '' })}
                      </Text>
                      <Text style={styles.docMeta}>{FACTURE_STATUS_LABELS[f.status] ?? f.status}</Text>
                    </View>
                  </Pressable>
                  {f.has_pdf ? (
                    <Pressable
                      onPress={() => handleDownload(f.token, 'facture', `Facture-${f.number ?? f.token}`)}
                      style={styles.downloadButton}
                      hitSlop={8}
                      disabled={downloadingToken === f.token}
                    >
                      <Feather name={downloadingToken === f.token ? 'loader' : 'download'} size={16} color={colors.primary} />
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  backText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  title: {
    fontFamily: portalFonts.display,
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  subsection: {
    gap: spacing.xs,
  },
  subsectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  docInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  docMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  downloadButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
