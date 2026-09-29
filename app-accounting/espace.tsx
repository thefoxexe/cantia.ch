import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AccNav, AccPage } from '../components/accounting/AccountingChrome';
import { AccountingOnboarding } from '../components/accounting/Onboarding';
import { Cockpit } from '../components/accounting/Cockpit';
import { AccShell, SECTIONS, type SectionKey } from '../components/accounting/Shell';
import { useAccCopy } from '../lib/accounting/locale';
import { useWorkCopy } from '../lib/accounting/workCopy';
import { acc, type Me } from '../lib/accounting/api';
import { usePartnerSession } from '../lib/partners/session';
import { colors, spacing } from '../lib/theme';

// accounting.cantia.ch/espace: onboarding for a new fiduciary, then the
// workspace. Signed-out visitors go to the sign-in page. The section is in
// the URL (?tab=), so every view can be linked and reloaded.
export default function AccountingSpace() {
  const { copy } = useAccCopy();
  const w = useWorkCopy();
  const router = useRouter();
  const session = usePartnerSession();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [counts, setCounts] = useState<Partial<Record<SectionKey, number>>>({});
  const tab: SectionKey = SECTIONS.includes(params.tab as SectionKey) ? (params.tab as SectionKey) : 'overview';

  const load = useCallback(async () => {
    const { data } = await acc.me();
    setMe(data ?? null);
  }, []);

  useEffect(() => {
    if (session === null) router.replace('/connexion');
    else if (session) load();
  }, [session, router, load]);

  const go = useCallback((next: SectionKey) => router.setParams({ tab: next }), [router]);

  const meta = session?.user?.user_metadata as { first_name?: string; last_name?: string; full_name?: string } | undefined;
  const [first, ...rest] = (meta?.full_name ?? '').split(' ');

  // No firm yet: the onboarding keeps the public frame.
  if (me === null) {
    return (
      <AccPage nav={<AccNav />}>
        <Head>
          <title>{`${copy.nav.space} · ${copy.brand}`}</title>
          <meta name="robots" content="noindex" />
        </Head>
        <View style={styles.onboarding}>
          <AccountingOnboarding defaults={{ firstName: meta?.first_name ?? first ?? '', lastName: meta?.last_name ?? rest.join(' ') }} onDone={load} />
        </View>
      </AccPage>
    );
  }

  return (
    <AccShell me={me ?? null} active={tab} onSelect={go} badges={counts}>
      <Head>
        <title>{`${w.shell[tab]} · ${copy.brand}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      {me === undefined ? <Text style={styles.loading}>{copy.common.loading}</Text> : <Cockpit me={me} tab={tab} onGo={go} onReload={load} onCounts={setCounts} />}
    </AccShell>
  );
}

const styles = StyleSheet.create({
  loading: { padding: spacing.xl, textAlign: 'center', color: colors.textMuted },
  onboarding: { paddingHorizontal: spacing.lg, paddingVertical: 48 },
});
