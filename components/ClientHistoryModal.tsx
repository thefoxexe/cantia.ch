import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { ClientDocumentsPayload, ClientDocumentSummary } from '../lib/types';

const DEVIS_STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  ready: "Prêt à l'envoi",
  sent: 'Envoyé',
  accepted: 'Accepté',
  refused: 'Refusé',
};

const FACTURE_STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  partial: 'Partiellement payée',
  paid: 'Payée',
  cancelled: 'Annulée',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  organizationName: string;
  payload: ClientDocumentsPayload | null;
  loading: boolean;
  error: string | null;
}

// Groups the flat devis/factures lists by chantier for display — a client
// who's worked with the same org across several chantiers sees them
// separated instead of one long undifferentiated list.
export function ClientHistoryModal({ visible, onClose, organizationName, payload, loading, error }: Props) {
  const router = useRouter();

  const groups = useMemo(() => {
    if (!payload) return [] as [string, { devis: ClientDocumentSummary[]; factures: ClientDocumentSummary[] }][];
    const map = new Map<string, { devis: ClientDocumentSummary[]; factures: ClientDocumentSummary[] }>();
    const keyFor = (name: string | null) => name ?? 'Sans chantier';
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
  }, [payload]);

  function openDevis(token: string) {
    onClose();
    router.replace(`/devis-client/${token}` as any);
  }

  function openFacture(token: string) {
    onClose();
    router.replace(`/facture-client/${token}` as any);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Mes documents{organizationName ? ` — ${organizationName}` : ''}</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Feather name="x" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.scroll}>
          {loading ? <Text style={styles.hint}>Chargement…</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {!loading && !error && groups.length === 0 ? <Text style={styles.hint}>Aucun document trouvé.</Text> : null}
          {groups.map(([projectName, docs]) => (
            <View key={projectName} style={styles.group}>
              <Text style={styles.groupTitle}>{projectName}</Text>
              {docs.devis.map((d) => (
                <Pressable key={`devis-${d.token}`} style={styles.docRow} onPress={() => openDevis(d.token)}>
                  <Feather name="file-text" size={16} color={colors.textMuted} />
                  <View style={styles.docInfo}>
                    <Text style={styles.docTitle}>Devis {d.number ?? ''}</Text>
                    <Text style={styles.docMeta}>{DEVIS_STATUS_LABELS[d.status] ?? d.status}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
              {docs.factures.map((f) => (
                <Pressable key={`facture-${f.token}`} style={styles.docRow} onPress={() => openFacture(f.token)}>
                  <Feather name="file" size={16} color={colors.textMuted} />
                  <View style={styles.docInfo}>
                    <Text style={styles.docTitle}>
                      {f.is_deposit ? "Facture d'acompte" : 'Facture'} {f.number ?? ''}
                    </Text>
                    <Text style={styles.docMeta}>{FACTURE_STATUS_LABELS[f.status] ?? f.status}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '80%',
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingVertical: spacing.md,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
    paddingVertical: spacing.md,
  },
  group: {
    marginBottom: spacing.lg,
  },
  groupTitle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
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
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
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
});
