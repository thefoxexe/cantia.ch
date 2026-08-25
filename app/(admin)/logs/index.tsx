import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container, EmptyState, LoadingScreen } from '../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import { listAuditLogs } from '../../../lib/api/admin';
import type { AdminAuditLog } from '../../../lib/types';

const ACTION_LABEL: Record<string, string> = {
  module_enabled: 'Module activé',
  module_disabled: 'Module désactivé',
  module_registered: 'Module enregistré',
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminLogsList() {
  const [rows, setRows] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { rows: r } = await listAuditLogs(100, 0);
    setRows(r);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView>
      <Container style={styles.container}>
        <Text style={styles.title}>Logs</Text>
        {loading ? (
          <LoadingScreen label="Chargement…" />
        ) : rows.length === 0 ? (
          <EmptyState title="Aucune action enregistrée" />
        ) : (
          <View style={styles.list}>
            {rows.map((log) => (
              <View key={log.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>
                    {ACTION_LABEL[log.action] ?? log.action}
                    {log.module_name ? ` — ${log.module_name}` : ''}
                    {log.organization_name ? ` — ${log.organization_name}` : ''}
                  </Text>
                  <Text style={styles.rowSubtitle}>{log.admin_email ?? 'Système'}</Text>
                </View>
                <Text style={styles.rowMeta}>{formatDateTime(log.created_at)}</Text>
              </View>
            ))}
          </View>
        )}
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowMeta: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
