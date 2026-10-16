import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../lib/auth-context';
import { useModule } from '../../lib/modules';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../lib/translations';
import { RELIEF_COPY, fill, reliefLocale } from '../../lib/relief/copy';
import { colors } from '../../lib/theme';

// The way into Cantia Maquette, in the top bar next to the bell (app/(app)/
// _layout.tsx), when the option is on: a small block of the model, the
// name, and how many people are out on the company's projects today.

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function MaquetteButton({ compact = false }: { compact?: boolean }) {
  const on = useModule('relief');
  const router = useRouter();
  const { i18n } = useTranslation();
  const copy = RELIEF_COPY[reliefLocale(i18n.language)];
  const { organization } = useAuth();
  const [out, setOut] = useState(0);
  const orgId = organization?.id;

  const load = useCallback(async () => {
    if (!orgId || !on) return;
    const day = today();
    const { data } = await supabase.from('planning_assignments').select('member_user_id').eq('organization_id', orgId).not('project_id', 'is', null).lte('starts_on', day).gte('ends_on', day).limit(500);
    setOut(new Set(((data ?? []) as { member_user_id: string }[]).map((r) => r.member_user_id)).size);
  }, [orgId, on]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  useEffect(() => {
    load();
  }, [load]);

  if (!on) return null;
  const label = out ? fill(copy.entryLive, { n: String(out) }) : copy.entry;
  return (
    <Pressable
      onPress={() => router.push('/maquette' as never)}
      style={({ pressed }) => [styles.btn, compact && styles.btnCompact, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${copy.brand} · ${label}`}
      hitSlop={6}
    >
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path d="M12 2.5 21 7.4 12 12.3 3 7.4z" fill={colors.primary} />
        <Path d="M3 7.4v9.3l9 4.8v-9.2z" fill="#231A12" />
        <Path d="M21 7.4v9.3l-9 4.8v-9.2z" fill="#6E6153" />
        <Path d="M7.2 9.7v4.6M10 11.2v5.6" stroke="#F7F1E6" strokeWidth={1.1} />
      </Svg>
      {compact ? null : <Text style={styles.text}>{copy.entry}</Text>}
      {out ? (
        <View style={[styles.count, compact && styles.countCompact]}>
          <View style={styles.dot} />
          <Text style={styles.countText}>{out}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 10,
    paddingRight: 12,
    borderRadius: 3,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnCompact: {
    width: 34,
    paddingLeft: 0,
    paddingRight: 0,
    justifyContent: 'center',
    gap: 0,
  },
  pressed: { opacity: 0.7 },
  text: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.1,
  },
  count: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#231A12',
  },
  countCompact: {
    position: 'absolute',
    top: -6,
    right: -6,
    paddingHorizontal: 4,
    height: 16,
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#6FBF8E' },
  countText: { fontSize: 10.5, fontWeight: '800', color: '#FFFFFF' },
});
