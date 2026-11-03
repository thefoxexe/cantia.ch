import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Btn, Chip, Sheet, kit } from '../admin/ledger/kit';
import { fill, type ScheduleCopy } from '../../lib/schedule/copy';
import { proposeSchedule } from '../../lib/schedule/api';
import { aiPlanToTemplate, type AiPlan } from '../../lib/schedule/ai';
import { templateStats, type TemplateData } from '../../lib/schedule/templates';
import { getAppLocale } from '../../lib/translations';
import { useDictation } from '../../lib/useDictation';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import { tradeColor } from './GanttView';

// "Proposer avec l'IA": the user describes the chantier, Claude proposes
// phases, tasks and milestones (supabase/functions/generate-schedule), the
// proposal is shown in full and nothing is written until "Utiliser ce
// planning" — then onApply inserts it like a template.
export function AiPlanSheet({
  c,
  organizationId,
  canton,
  start,
  appendHint,
  onClose,
  onApply,
}: {
  c: ScheduleCopy;
  organizationId: string;
  canton: string | null;
  start: string | null;
  appendHint?: boolean;
  onClose: () => void;
  onApply: (data: TemplateData) => Promise<string | null>;
}) {
  const [request, setRequest] = useState('');
  const [busy, setBusy] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ plan: AiPlan; data: TemplateData } | null>(null);

  // Dictation (same as the rapports: recording, then server transcription):
  // the transcript is added after what is already written, and can be
  // corrected before asking for the planning.
  const baseRef = useRef('');
  const dictation = useDictation((transcript) => {
    const base = baseRef.current;
    setRequest(base + (base && transcript ? ' ' : '') + transcript);
  });
  const toggleDictation = async () => {
    if (dictation.listening) {
      await dictation.stop();
      return;
    }
    setError(null);
    baseRef.current = request.trim();
    const lang = getAppLocale();
    const started = await dictation.start(lang === 'de' ? 'de-CH' : lang === 'it' ? 'it-CH' : 'fr-CH');
    if (!started) setError(c.aiMicDenied);
  };
  const recording = dictation.listening || dictation.transcribing;

  const generate = async () => {
    if (!request.trim() || busy) return;
    setBusy(true);
    setError(null);
    const { plan, error: e } = await proposeSchedule(organizationId, request.trim(), { locale: getAppLocale(), canton, start });
    setBusy(false);
    if (e || !plan) {
      // supabase-js's own wording when the function isn't reachable (not
      // deployed yet, network): no JSON error from our function to show.
      setError(e && /non-2xx|Failed to send|fetch/i.test(e) ? c.aiUnavailable : e ?? c.aiEmpty);
      return;
    }
    const data = aiPlanToTemplate(plan, getAppLocale());
    setResult({ plan, data });
    if (!data.items.length) setError(plan.summary || c.aiEmpty);
  };

  const st = result?.data.items.length ? templateStats(result.data) : null;
  const depthOf = (key: string): number => {
    let d = 0;
    let cur = result?.data.items.find((i) => i.key === key);
    while (cur?.parent && d < 5) {
      d += 1;
      const parent: string = cur.parent;
      cur = result?.data.items.find((i) => i.key === parent);
    }
    return d;
  };

  return (
    <Sheet
      title={c.aiTitle}
      onClose={onClose}
      footer={
        <>
          <Btn label={c.cancel} onPress={onClose} grow />
          {result?.data.items.length ? (
            <Btn
              label={applying ? '…' : c.aiApply}
              icon="check"
              variant="primary"
              grow
              disabled={applying || busy}
              onPress={async () => {
                setApplying(true);
                const e = await onApply(result.data);
                setApplying(false);
                if (e) setError(e);
              }}
            />
          ) : (
            <Btn label={busy ? '…' : c.aiGenerate} icon="zap" variant="primary" grow disabled={busy || recording || !request.trim()} onPress={generate} />
          )}
        </>
      }
    >
      <Text style={kit.hint}>{c.aiHint}</Text>
      <TextInput
        value={request}
        onChangeText={setRequest}
        placeholder={c.aiPlaceholder}
        placeholderTextColor={colors.textMuted}
        multiline
        editable={!busy && !recording}
        style={[kit.input, styles.request]}
      />
      {dictation.supported ? (
        <Pressable
          onPress={toggleDictation}
          disabled={busy || dictation.transcribing}
          style={[styles.dictate, recording && styles.dictateOn]}
          accessibilityRole="button"
        >
          {dictation.transcribing ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="mic" size={15} color={dictation.listening ? '#fff' : colors.primary} />}
          <Text style={[styles.dictateText, recording && { color: '#fff' }]}>
            {dictation.transcribing ? c.aiTranscribing : dictation.listening ? c.aiListening : c.aiDictate}
          </Text>
        </Pressable>
      ) : null}
      <View style={kit.row}>
        {c.aiExamples.map((ex) => (
          <Chip key={ex} small label={ex} active={request === ex} onPress={() => setRequest(ex)} />
        ))}
      </View>

      {busy ? (
        <View style={styles.busy}>
          <ActivityIndicator color={colors.primary} />
          <Text style={kit.hint}>{c.aiBusy}</Text>
        </View>
      ) : null}

      {result && st ? (
        <>
          <View style={{ gap: 4 }}>
            <Text style={[kit.body, { fontWeight: '800' }]}>{result.plan.title}</Text>
            {result.plan.summary ? <Text style={kit.body}>{result.plan.summary}</Text> : null}
            <Text style={kit.hint}>{fill(c.templateStats, { p: st.phases, t: st.tasks + st.milestones, d: st.days })}</Text>
          </View>
          <ScrollView style={styles.preview} nestedScrollEnabled>
            {result.data.items.map((it) => (
              <View key={it.key} style={[styles.line, it.kind === 'phase' && styles.phaseLine, { paddingLeft: spacing.md + depthOf(it.key) * spacing.lg }]}>
                {it.kind === 'milestone' ? <Text style={styles.diamond}>◆</Text> : it.trade ? <View style={[styles.dot, { backgroundColor: tradeColor(it.trade) }]} /> : null}
                <Text style={[styles.name, it.kind === 'phase' && { fontWeight: '800' }]} numberOfLines={1}>
                  {it.name}
                </Text>
                {it.trade && it.kind !== 'phase' ? <Text style={styles.trade} numberOfLines={1}>{it.trade}</Text> : null}
                {it.kind === 'task' && it.duration ? <Text style={styles.dur}>{`${it.duration} ${c.days}`}</Text> : null}
              </View>
            ))}
          </ScrollView>
          {result.plan.assumptions?.length ? (
            <View style={{ gap: 4 }}>
              <Text style={kit.eyebrow}>{c.aiAssumptions}</Text>
              {result.plan.assumptions.map((a, i) => (
                <View key={i} style={styles.assumption}>
                  <Feather name="alert-circle" size={13} color={colors.textMuted} style={{ marginTop: 2 }} />
                  <Text style={[kit.hint, { flex: 1 }]}>{a}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <Text style={kit.hint}>{c.aiDisclaimer}</Text>
          {appendHint ? <Text style={kit.hint}>{c.aiAppendHint}</Text> : null}
          <Btn label={c.aiAgain} icon="refresh-cw" variant="ghost" disabled={busy || applying} onPress={generate} />
        </>
      ) : null}

      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  request: { minHeight: 84, textAlignVertical: 'top' },
  dictate: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface },
  dictateOn: { backgroundColor: colors.primary },
  dictateText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  busy: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  preview: { maxHeight: 300, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.md, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  phaseLine: { backgroundColor: '#F4F1EC' },
  name: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  trade: { fontSize: fontSize.xs, color: colors.textMuted, maxWidth: 130 },
  dur: { fontSize: fontSize.xs, color: colors.text, fontVariant: ['tabular-nums'], minWidth: 40, textAlign: 'right' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  diamond: { fontSize: 10, color: colors.text },
  assumption: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
});
