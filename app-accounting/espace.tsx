import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AccNav, AccPage, NavButton } from '../components/accounting/AccountingChrome';
import { AccountingOnboarding } from '../components/accounting/Onboarding';
import { Cockpit, TABS, type Tab } from '../components/accounting/Cockpit';
import { useAccCopy } from '../lib/accounting/locale';
import { acc, type Me } from '../lib/accounting/api';
import { usePartnerSession } from '../lib/partners/session';
import { supabase } from '../lib/supabase';
import { colors, fontSize, spacing } from '../lib/theme';

// accounting.cantia.ch/espace: onboarding for a new fiduciary, then the
// cockpit. Signed-out visitors go to the sign-in page.
export default function AccountingSpace() {
  const { copy } = useAccCopy();
  const router = useRouter();
  const session = usePartnerSession();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [me, setMe] = useState<Me | null | undefined>(undefined);

  const load = useCallback(async () => {
    const { data } = await acc.me();
    setMe(data ?? null);
  }, []);

  useEffect(() => {
    if (session === null) router.replace('/connexion');
    else if (session) load();
  }, [session, router, load]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  const meta = session?.user?.user_metadata as { first_name?: string; last_name?: string; full_name?: string } | undefined;
  const [first, ...rest] = (meta?.full_name ?? '').split(' ');
  const initialTab = TABS.includes(params.tab as Tab) ? (params.tab as Tab) : undefined;

  return (
    <AccPage
      nav={
        <AccNav
          right={
            session ? (
              <View style={styles.navRight}>
                {me?.is_admin ? <NavButton href="/admin" label={copy.nav.admin} /> : null}
                <Pressable onPress={logout} hitSlop={8}>
                  <Text style={styles.logout}>{copy.nav.logout}</Text>
                </Pressable>
              </View>
            ) : null
          }
        />
      }
    >
      <Head>
        <title>{`${copy.nav.space} · ${copy.brand}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      {me === undefined ? (
        <Text style={styles.loading}>{copy.common.loading}</Text>
      ) : me === null ? (
        <View style={styles.onboarding}>
          <AccountingOnboarding defaults={{ firstName: meta?.first_name ?? first ?? '', lastName: meta?.last_name ?? rest.join(' ') }} onDone={load} />
        </View>
      ) : (
        <Cockpit me={me} initialTab={initialTab} onReload={load} />
      )}
    </AccPage>
  );
}

const styles = StyleSheet.create({
  navRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logout: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  loading: { padding: spacing.xl, textAlign: 'center', color: colors.textMuted },
  onboarding: { paddingHorizontal: spacing.lg, paddingVertical: 48 },
});
