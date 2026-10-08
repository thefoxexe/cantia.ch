import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useIsWide } from './AccountingChrome';
import { DeadlinesSection, NotesPanel, Panel, RequestsSection, Stat } from './Workspace';
import { TimeSection, WorkSection } from './ProWork';
import { ApprovalsSection, ExternalClientForm, KpiPanel, PortalLinkPanel } from './ProClients';
import { ExtLedger } from './ExtLedger';
import { LinkButton, Message, Pill, ps } from './ProShared';
import { useAccCopy } from '../../lib/accounting/locale';
import { acc, formatDate, type Me } from '../../lib/accounting/api';
import { useWorkCopy } from '../../lib/accounting/workCopy';
import { SOFTWARE_LABEL, formatMinutes, pro, type ExternalClient } from '../../lib/accounting/pro';
import { useProCopy } from '../../lib/accounting/proCopy';
import { useLedgerCopy } from '../../lib/accounting/ledgerCopy';
import { displayType } from '../../lib/marketingTheme';
import { colors, fontSize, spacing } from '../../lib/theme';

type Tab = 'overview' | 'ledger' | 'work' | 'requests' | 'deadlines' | 'approvals' | 'time' | 'notes' | 'settings';
const TABS: Tab[] = ['overview', 'ledger', 'work', 'requests', 'deadlines', 'approvals', 'time', 'notes', 'settings'];

// A client of the firm that is not on Cantia (accounting.cantia.ch/mandant?ext=…).
export function ExternalMandant({ me, id, initialTab }: { me: Me; id: string; initialTab?: string }) {
  const { copy, locale } = useAccCopy();
  const w = useWorkCopy();
  const p = useProCopy();
  const lc = useLedgerCopy();
  const router = useRouter();
  const wide = useIsWide(900);
  const [client, setClient] = useState<ExternalClient | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>(TABS.includes(initialTab as Tab) ? (initialTab as Tab) : 'overview');
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const isAdmin = me.role === 'OWNER' || me.role === 'ADMIN';

  const load = useCallback(async () => {
    const [{ data: one }, { data: list }] = await Promise.all([pro.externalClient(id), pro.externalClients(true)]);
    const counts = (list ?? []).find((x) => x.id === id);
    setClient(one ? { ...one, ...(counts ?? {}) } : null);
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);

  const label = (k: Tab) =>
    k === 'overview' ? w.client.overview : k === 'ledger' ? lc.tab : k === 'requests' ? w.client.requests : k === 'deadlines' ? w.client.deadlines : k === 'notes' ? w.client.notes : k === 'settings' ? p.ext.settings : p.client.tabs[k];

  async function invite() {
    if (!client?.email) return;
    const { error } = await acc.inviteClient(client.email, client.name, client.contact_name ?? '');
    setMessage(error ? { text: error, error: true } : { text: p.ext.invited, error: false });
  }

  return (
    <View style={{ width: '100%', gap: spacing.lg }}>
      <Head>
        <title>{`${client?.name ?? p.ext.add} · ${copy.brand}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Pressable onPress={() => router.push('/espace?tab=clients' as any)} style={st.back}>
        <Feather name="arrow-left" size={15} color={colors.textMuted} />
        <Text style={st.backText}>{copy.client.back}</Text>
      </Pressable>
      {client === undefined ? (
        <Text style={ps.muted}>{copy.common.loading}</Text>
      ) : client === null ? (
        <Panel>
          <Text style={ps.body}>{p.ext.notFound}</Text>
        </Panel>
      ) : (
        <>
          <View style={st.head}>
            <View style={{ flex: 1, minWidth: 240, gap: 4 }}>
              <View style={ps.actions}>
                <Pill label={p.common.external} />
                {client.ledger_started_at ? (
                  <Pill label={`${lc.tab} Cantia`} tone="primary" />
                ) : SOFTWARE_LABEL[client.software] !== '—' ? (
                  <Pill label={SOFTWARE_LABEL[client.software]} tone="primary" />
                ) : null}
                {client.status === 'ARCHIVED' ? <Pill label={p.ext.archived} tone="warning" /> : null}
              </View>
              <Text style={st.h1} role="heading" aria-level={1}>
                {client.name}
              </Text>
              <Text style={ps.muted}>
                {[
                  client.contact_name,
                  [client.address, [client.postal_code, client.city].filter(Boolean).join(' ')].filter(Boolean).join(', '),
                  client.ide_number ? `IDE ${client.ide_number}` : null,
                  client.email,
                  client.phone,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
              <Text style={ps.small}>
                {[w.profile.legalForms[client.legal_form], w.profile.vatMethods[client.vat_method], client.assigned_name].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </View>

          <View style={[st.tabs, !wide && st.tabsMobile]}>
            {TABS.map((k) => (
              <Pressable key={k} onPress={() => setTab(k)} style={[st.tab, tab === k && st.tabActive]} accessibilityRole="tab" aria-selected={tab === k}>
                <Text style={[st.tabText, tab === k && st.tabTextActive]}>{label(k)}</Text>
              </Pressable>
            ))}
          </View>
          <Message value={message} />

          {tab === 'overview' ? (
            <View style={{ gap: spacing.lg }}>
              <View style={st.stats}>
                <Stat label={w.client.requests} value={String(client.requests_open ?? 0)} hint={client.requests_answered ? `${client.requests_answered} ✓` : undefined} onPress={() => setTab('requests')} />
                <Stat label={p.client.tabs.work} value={String(client.work_open ?? 0)} onPress={() => setTab('work')} />
                <Stat label={p.client.tabs.approvals} value={String(client.approvals_pending ?? 0)} onPress={() => setTab('approvals')} />
                <Stat label={p.time.toBill} value={`${formatMinutes(client.unbilled_minutes ?? 0)} h`} onPress={() => setTab('time')} />
              </View>
              {client.ledger_started_at ? (
                <Panel title={lc.tab}>
                  <KpiPanel ext={client.id} compact />
                </Panel>
              ) : null}
              <PortalLinkPanel client={client} isAdmin={isAdmin} onChanged={load} />
              {client.email ? (
                <Panel title={p.ext.invite}>
                  <Text style={ps.small}>{p.ext.inviteText}</Text>
                  <LinkButton label={p.ext.invite} icon="send" onPress={invite} />
                </Panel>
              ) : null}
              <Text style={ps.small}>{formatDate(client.created_at, locale)}</Text>
            </View>
          ) : tab === 'ledger' ? (
            <ExtLedger me={me} client={client} onChanged={load} />
          ) : tab === 'work' ? (
            <WorkSection me={me} client={{ ext: client.id }} embedded />
          ) : tab === 'requests' ? (
            <RequestsSection mandants={[]} extId={client.id} embedded />
          ) : tab === 'deadlines' ? (
            <DeadlinesSection extId={client.id} embedded />
          ) : tab === 'approvals' ? (
            <ApprovalsSection me={me} client={{ ext: client.id }} embedded />
          ) : tab === 'time' ? (
            <TimeSection me={me} client={{ ext: client.id }} embedded />
          ) : tab === 'notes' ? (
            <NotesPanel extId={client.id} />
          ) : (
            <View style={{ gap: spacing.lg }}>
              <Panel title={p.ext.edit}>
                <ExternalClientForm
                  id={client.id}
                  initial={client}
                  onSaved={() => {
                    setMessage({ text: p.common.saved, error: false });
                    load();
                  }}
                />
              </Panel>
              {isAdmin ? (
                <View style={ps.actions}>
                  {client.status === 'ACTIVE' ? (
                    <LinkButton
                      label={confirmArchive ? p.ext.archiveConfirm : p.ext.archive}
                      icon="archive"
                      tone="danger"
                      onPress={async () => {
                        if (!confirmArchive) return setConfirmArchive(true);
                        await pro.externalAction(client.id, 'archive');
                        router.replace('/espace?tab=clients' as any);
                      }}
                    />
                  ) : (
                    <LinkButton label={p.ext.restore} icon="rotate-ccw" onPress={() => pro.externalAction(client.id, 'restore').then(load)} />
                  )}
                </View>
              ) : null}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  h1: { ...displayType, fontSize: 32, lineHeight: 36, fontWeight: '800', color: colors.text },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabsMobile: { flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none' } as any,
  tab: { flexShrink: 0, paddingVertical: 10, paddingHorizontal: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.text, fontWeight: '800' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});
