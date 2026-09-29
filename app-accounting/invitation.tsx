import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../components/ui';
import { AccNav, AccPage, NavButton } from '../components/accounting/AccountingChrome';
import { useAccCopy } from '../lib/accounting/locale';
import { fill } from '../lib/accounting/copy';
import { acc } from '../lib/accounting/api';
import { usePartnerSession } from '../lib/partners/session';
import { displayType } from '../lib/marketingTheme';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// accounting.cantia.ch/invitation?token=...: a colleague joining the firm,
// or a Cantia client giving the firm access to its data. The signed-in
// email must be the invited one (checked by acc_accept_invitation).
type Preview = Awaited<ReturnType<typeof acc.invitationPreview>>['data'];

export default function InvitationPage() {
  const { copy } = useAccCopy();
  const t = copy.invitation;
  const router = useRouter();
  const session = usePartnerSession();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === 'string' ? params.token : '';
  const [preview, setPreview] = useState<Preview | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!/^[a-f0-9]{24,64}$/.test(token)) {
      setPreview(null);
      return;
    }
    acc.invitationPreview(token).then(({ data }) => setPreview(data ?? null));
  }, [token]);

  const next = encodeURIComponent(`/invitation?token=${token}`);

  async function accept() {
    setBusy(true);
    setError(null);
    const meta = session?.user?.user_metadata as { first_name?: string; last_name?: string } | undefined;
    const { data, error: err } = await acc.acceptInvitation(token, meta?.first_name, meta?.last_name);
    setBusy(false);
    if (err) return setError(err);
    // No firm yet: the onboarding creates it and takes this client along.
    if (data?.needs_firm) return router.replace('/espace');
    setDone(true);
  }

  const valid = preview && preview.status === 'PENDING';

  return (
    <AccPage nav={<AccNav />}>
      <Head>
        <title>{`${t.title} · ${copy.brand}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <View style={styles.wrap}>
        <View style={styles.card}>
          <Text style={styles.title} role="heading" aria-level={1}>
            {t.title}
          </Text>
          {preview === undefined ? (
            <Text style={styles.muted}>{t.loading}</Text>
          ) : !valid ? (
            <Text style={styles.body}>{t.invalid}</Text>
          ) : done ? (
            <>
              <Text style={styles.body}>{t.done}</Text>
              <Button title={t.open} onPress={() => router.replace('/espace')} />
            </>
          ) : (
            <>
              <Text style={styles.lead}>
                {preview.kind === 'STAFF' ? fill(t.staff, { firm: preview.firm_name ?? '' }) : fill(t.client, { org: preview.organization_name ?? '' })}
              </Text>
              {preview.kind === 'CLIENT_TO_FIRM' && preview.permissions ? (
                <View style={styles.pills}>
                  {preview.permissions.map((p) => (
                    <View key={p} style={styles.pill}>
                      <Text style={styles.pillText}>{copy.permissions[p]}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {session ? (
                <>
                  {preview.kind === 'CLIENT_TO_FIRM' ? <Text style={styles.muted}>{t.needsFirm}</Text> : null}
                  <Button title={t.accept} icon="check" onPress={accept} loading={busy} />
                </>
              ) : (
                <>
                  <Text style={styles.muted}>{fill(t.signInFirst, { email: preview.email })}</Text>
                  <View style={styles.actions}>
                    <NavButton href={`/connexion?mode=signup&next=${next}`} label={copy.nav.signup} primary />
                    <NavButton href={`/connexion?next=${next}`} label={copy.nav.login} />
                  </View>
                </>
              )}
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </>
          )}
        </View>
      </View>
    </AccPage>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.lg, paddingVertical: 64, alignItems: 'center' },
  card: { width: '100%', maxWidth: 520, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  title: { ...displayType, fontSize: 28, lineHeight: 32, fontWeight: '800', color: colors.text },
  lead: { fontSize: fontSize.md, lineHeight: 24, color: colors.text },
  body: { fontSize: fontSize.sm, lineHeight: 20, color: colors.text },
  muted: { fontSize: fontSize.sm, lineHeight: 19, color: colors.textMuted },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: { backgroundColor: colors.successSoft, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  pillText: { fontSize: 11, fontWeight: '700', color: colors.success },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  error: { fontSize: fontSize.sm, color: colors.danger },
});
