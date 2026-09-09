import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { useTranslation } from '../lib/translations';

type StatusKind = 'idle' | 'scanning' | 'success' | 'error';

// The "photographier / depuis une photo" block shared by every place that
// can turn a receipt photo into a structured expense (Rentabilité's
// ExpenseComposer, Trésorerie's one-off form). Two icon tiles matching the
// dashboard's own shortcut-tile language, a section label, and a single
// status slot underneath that always shows something — scanning, what was
// read, or what went wrong — never just... nothing.
export function ReceiptScanTiles({
  onCamera,
  onGallery,
  status,
  statusMessage,
  cameraLabel,
  galleryLabel,
}: {
  onCamera: () => void;
  onGallery: () => void;
  status: StatusKind;
  statusMessage: string;
  cameraLabel: string;
  galleryLabel: string;
}) {
  const { t } = useTranslation();
  const scanning = status === 'scanning';

  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>{t('receiptScan.sectionLabel')}</Text>
      <View style={styles.tileRow}>
        <Pressable onPress={onCamera} disabled={scanning} style={({ pressed }) => [styles.tile, pressed && !scanning && styles.tilePressed]}>
          <View style={styles.tileIcon}>
            {scanning ? <ActivityIndicator size="small" color={colors.primary} /> : <Feather name="camera" size={18} color={colors.primary} />}
          </View>
          <Text style={styles.tileLabel}>{cameraLabel}</Text>
        </Pressable>
        <Pressable onPress={onGallery} disabled={scanning} style={({ pressed }) => [styles.tile, pressed && !scanning && styles.tilePressed]}>
          <View style={styles.tileIcon}>
            <Feather name="image" size={18} color={colors.primary} />
          </View>
          <Text style={styles.tileLabel}>{galleryLabel}</Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.statusRow,
          status === 'success' && styles.statusRowSuccess,
          status === 'error' && styles.statusRowError,
        ]}
      >
        {status === 'scanning' ? <ActivityIndicator size="small" color={colors.accent} /> : null}
        {status === 'success' ? <Feather name="check-circle" size={14} color={colors.success} /> : null}
        {status === 'error' ? <Feather name="alert-circle" size={14} color={colors.danger} /> : null}
        {status === 'idle' ? <Feather name="info" size={14} color={colors.textMuted} /> : null}
        <Text
          style={[
            styles.statusText,
            status === 'success' && styles.statusTextSuccess,
            status === 'error' && styles.statusTextError,
          ]}
        >
          {statusMessage}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tileRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  tilePressed: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  statusRowSuccess: {
    backgroundColor: colors.successSoft,
  },
  statusRowError: {
    backgroundColor: colors.dangerSoft,
  },
  statusText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 16,
  },
  statusTextSuccess: {
    color: colors.success,
    fontWeight: '600',
  },
  statusTextError: {
    color: colors.danger,
  },
});
