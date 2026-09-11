import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { TrialForecastRow } from '../lib/adminDataContext';

function formatChf(amount: number): string {
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(amount);
}

function relativeDays(days: number): string {
  if (days <= 0) return "Se termine aujourd'hui";
  if (days === 1) return 'Demain';
  return `Dans ${days} jours`;
}

// The forecast angle on trials: not just "who's trialing" (Entreprises
// already shows that) but "when does real money start coming in, and how
// much" — sorted soonest-first so the ones worth a follow-up call surface
// on their own.
export function TrialForecast({ rows }: { rows: TrialForecastRow[] | null }) {
  const router = useRouter();

  if (rows === null) {
    return <Text style={styles.emptyText}>Calcul des essais en cours…</Text>;
  }
  if (rows.length === 0) {
    return <Text style={styles.emptyText}>Aucun essai en cours actuellement.</Text>;
  }

  const forecastRows = rows.filter((r) => r.amount != null);
  const totalForecast = forecastRows.reduce((sum, r) => sum + (r.amount ?? 0), 0);

  return (
    <View>
      {forecastRows.length > 0 ? (
        <View style={styles.banner}>
          <Feather name="trending-up" size={16} color={colors.success} />
          <Text style={styles.bannerText}>
            ≈ {formatChf(totalForecast)}/mois attendu si {forecastRows.length === 1 ? 'cet essai convertit' : `ces ${forecastRows.length} essais convertissent`}
          </Text>
        </View>
      ) : null}

      {/* A vertical list of rows, not a grid of cards — each row needs a
          name, a plan, a date and an amount side by side, which only stays
          readable stacked full-width; it already reflows fine down to
          phone width since nothing here has a fixed width. */}
      <View style={styles.list}>
        {rows.map((r) => {
          const urgent = r.days <= 3;
          return (
            <Pressable key={r.id} style={styles.row} onPress={() => router.push(`/(admin)/organizations/${r.id}` as any)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {r.name}
                </Text>
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {r.planName ?? 'Découverte'}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={[styles.rowDays, urgent && styles.rowDaysUrgent]}>{relativeDays(r.days)}</Text>
                <Text style={styles.rowAmount}>{r.amount != null ? `≈ ${formatChf(r.amount)}` : r.hasCard ? '—' : 'Sans carte'}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successSoft,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  bannerText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.success,
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
  rowName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  rowMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowDays: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  rowDaysUrgent: {
    color: colors.warning,
  },
  rowAmount: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
});
