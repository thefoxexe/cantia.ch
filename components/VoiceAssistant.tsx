import { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { isModuleEnabled } from '../lib/modules';
import { useDictation } from '../lib/useDictation';
import { routeVoiceCommand, generateDevisLines, answerAssistantQuestion, type VoiceCommand, type VoiceCommandAction, type DictatedDevisLine } from '../lib/api/ai';
import { listWorkTypes, createTimeEntry, hoursFromRange } from '../lib/api/payroll';
import { createProjectExpense } from '../lib/api/expenses';
import { createExpense } from '../lib/api/treasury';
import { buildAssistantContext } from '../lib/api/assistantContext';
import { fetchCatalog, type CatalogEntry } from '../lib/catalog';
import { Field } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import { getAppLocale, useTranslation } from '../lib/translations';

interface PickItem {
  id: string;
  label: string;
}

type Stage = 'idle' | 'routing' | 'confirm' | 'saving' | 'saved' | 'answered' | 'error' | 'unavailable';

const ALL_ACTIONS: Exclude<VoiceCommandAction, 'unknown'>[] = ['payroll_entry', 'expense', 'create_devis', 'create_facture', 'question'];

// A single floating mic button, mounted once at the shell level (mobile and
// desktop alike) so it's reachable from anywhere in the app — unlike the
// per-screen dictation in PayrollEntryPanel (which commits straight away,
// because the screen it's on already disambiguates the action), this one
// has to figure out WHAT the user meant before doing anything, so every
// result always lands in an editable confirmation step: nothing is written
// until the user taps Confirmer, and they can correct it either by hand or
// by re-dictating.
export function VoiceAssistant() {
  const { t } = useTranslation();
  const { organization, user, canViewFinances } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const payrollEnabled = isModuleEnabled(organization?.enabled_modules, 'payroll');
  const treasuryModuleOk = isModuleEnabled(organization?.enabled_modules, 'treasury') && canViewFinances;

  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [command, setCommand] = useState<VoiceCommand | null>(null);

  const [listsLoaded, setListsLoaded] = useState(false);
  const [projects, setProjects] = useState<PickItem[]>([]);
  const [workTypes, setWorkTypes] = useState<PickItem[]>([]);
  const [profitabilityEnabled, setProfitabilityEnabled] = useState(false);
  const [treasuryEnabled, setTreasuryEnabled] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);

  const [projectId, setProjectId] = useState<string | null>(null);
  const [workTypeId, setWorkTypeId] = useState<string | null>(null);
  const [hoursText, setHoursText] = useState('');
  const [note, setNote] = useState('');
  const [expenseLabel, setExpenseLabel] = useState('');
  const [amountText, setAmountText] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  // create_devis / create_facture: the client name comes straight from the
  // router, editable before handing off; the lines come from a second AI
  // call (generateDevisLines, same one the devis/facture editors already
  // use for their own "Dicter les positions" button) fired on the same
  // transcript once the router confirms which document type it is.
  const [devisClientName, setDevisClientName] = useState('');
  const [devisLines, setDevisLines] = useState<DictatedDevisLine[]>([]);

  // question: the natural-language answer from answerAssistantQuestion,
  // generated from a context bundle this component fetches itself — never
  // navigated to, just shown in place.
  const [answerText, setAnswerText] = useState<string | null>(null);

  const transcriptRef = useRef('');
  const dictation = useDictation((sessionTranscript) => {
    transcriptRef.current = sessionTranscript;
  });

  // The AI always tries to classify between every action type, regardless
  // of whether this org can actually use it — that's what lets it recognize
  // "j'ai acheté du bois pour 60 francs" as an expense even on a plan
  // without Rentabilité/Trésorerie, so the assistant can say "this exists,
  // but isn't on your plan" instead of a vague "didn't understand". Devis,
  // factures and questions have no plan gate (every plan can create
  // documents and ask questions), so only payroll_entry/expense go through
  // actionUsable below.
  const classificationActions = ALL_ACTIONS;
  // "expense" covers two destinations: a chantier-linked material cost
  // (needs profitabilityEnabled, feeds that chantier's Rentabilité) or a
  // general/overhead outflow (needs treasuryEnabled, feeds the general
  // expenses list managed from Dépenses) — see handleConfirm and
  // ConfirmForm below for how the split is decided once a chantier is or
  // isn't picked.
  const showProjectPickerForExpense = profitabilityEnabled && projects.length > 0;

  function actionUsable(action: VoiceCommandAction): boolean {
    if (action === 'payroll_entry') return payrollEnabled;
    if (action === 'expense') return profitabilityEnabled || treasuryEnabled;
    return true;
  }

  function taskCategoryLabel(category: string): string {
    return t(`taskCategory.${category}`) || category;
  }

  if (!organization) return null;

  async function ensureListsLoaded() {
    if (listsLoaded || !organization) return;
    const [projectsRes, workTypeRows, planRes, catalogRows] = await Promise.all([
      supabase.from('projects').select('id, name').eq('organization_id', organization.id).order('name'),
      payrollEnabled ? listWorkTypes(organization.id) : Promise.resolve([]),
      organization.plan_id
        ? supabase.from('plans').select('name, has_profitability, has_treasury').eq('id', organization.plan_id).single()
        : Promise.resolve({ data: null as { name: string; has_profitability: boolean; has_treasury: boolean } | null }),
      fetchCatalog(organization.id),
    ]);
    setProjects(((projectsRes.data ?? []) as { id: string; name: string }[]).map((p) => ({ id: p.id, label: p.name })));
    setWorkTypes(workTypeRows.map((w) => ({ id: w.id, label: w.label })));
    setProfitabilityEnabled(!!planRes.data?.has_profitability);
    setTreasuryEnabled(treasuryModuleOk && !!planRes.data?.has_treasury);
    setPlanName(planRes.data?.name ?? null);
    setCatalog(catalogRows);
    setListsLoaded(true);
  }

  function resetAndClose() {
    setOpen(false);
    setStage('idle');
    setErrorMessage(null);
    setCommand(null);
    setSaveError(null);
    setDevisClientName('');
    setDevisLines([]);
    setAnswerText(null);
  }

  async function openAssistant() {
    setOpen(true);
    setStage('idle');
    setErrorMessage(null);
    setCommand(null);
    setAnswerText(null);
    await ensureListsLoaded();
  }

  async function toggleRecording() {
    if (dictation.listening) {
      await dictation.stop();
      await runRouting();
      return;
    }
    transcriptRef.current = '';
    setErrorMessage(null);
    const started = await dictation.start(getAppLocale() === 'de' ? 'de-DE' : getAppLocale() === 'it' ? 'it-IT' : 'fr-FR');
    if (!started) {
      setStage('error');
      setErrorMessage(t('voiceAssistant.micPermissionBody'));
    }
  }

  async function runRouting() {
    const transcript = transcriptRef.current.trim();
    if (!transcript || !organization) {
      setStage('idle');
      return;
    }
    setStage('routing');
    const projectsPayload = projects.map((p) => ({ id: p.id, name: p.label }));
    const workTypesPayload = workTypes.map((w) => ({ id: w.id, label: w.label }));
    const locale = getAppLocale() === 'de' ? 'de' : getAppLocale() === 'it' ? 'it' : 'fr';
    const { command: cmd, error: err } = await routeVoiceCommand(
      transcript,
      organization.id,
      projectsPayload,
      workTypesPayload,
      classificationActions,
      locale,
    );
    if (err || !cmd || cmd.action === 'unknown') {
      setStage('error');
      setErrorMessage((cmd?.summary || err) ?? t('voiceAssistant.errorGeneric'));
      return;
    }
    if (!actionUsable(cmd.action)) {
      setCommand(cmd);
      setStage('unavailable');
      return;
    }

    if (cmd.action === 'question') {
      setCommand(cmd);
      const context = await buildAssistantContext(organization, planName, treasuryEnabled, taskCategoryLabel);
      const { answer, error: ansErr } = await answerAssistantQuestion(transcript, organization.id, context, locale);
      if (ansErr || !answer) {
        setStage('error');
        setErrorMessage(ansErr ?? t('voiceAssistant.errorGeneric'));
        return;
      }
      setAnswerText(answer);
      setStage('answered');
      return;
    }

    if (cmd.action === 'create_devis' || cmd.action === 'create_facture') {
      setCommand(cmd);
      setDevisClientName(cmd.clientName ?? '');
      const catalogPayload = catalog.slice(0, 150).map((c) => ({ description: c.description, unit: c.unit, unitPrice: c.unitPrice }));
      const { lines } = await generateDevisLines(transcript, catalogPayload, organization.id);
      setDevisLines(lines ?? []);
      setSaveError(null);
      setStage('confirm');
      return;
    }

    setCommand(cmd);
    setProjectId(cmd.projectId);
    setWorkTypeId(cmd.workTypeId);
    const hrs = cmd.hours ?? (cmd.startTime && cmd.endTime ? hoursFromRange(cmd.startTime, cmd.endTime) : null);
    setHoursText(hrs ? String(hrs) : '');
    setNote(cmd.note ?? '');
    setExpenseLabel(cmd.label ?? '');
    setAmountText(cmd.amount ? String(cmd.amount) : '');
    setSaveError(null);
    setStage('confirm');
  }

  // Navigates to the devis/facture creation screen with whatever was
  // dictated pre-filled — nothing is written to the database from here;
  // the destination screen's own "Enregistrer" is still the one save point,
  // same as if the user had typed everything by hand.
  function handleCreateDocument() {
    if (!command || (command.action !== 'create_devis' && command.action !== 'create_facture')) return;
    const params = new URLSearchParams();
    if (devisClientName.trim()) params.set('voiceClientName', devisClientName.trim());
    if (devisLines.length) params.set('voiceLines', JSON.stringify(devisLines));
    const base = command.action === 'create_devis' ? '/(app)/devis/new' : '/(app)/devis/factures/new';
    const target = params.toString() ? `${base}?${params.toString()}` : base;
    resetAndClose();
    router.push(target as any);
  }

  async function handleConfirm() {
    if (!command || !organization || !user) return;
    if (command.action === 'payroll_entry') {
      if (!projectId) {
        setSaveError(t('voiceAssistant.missingProject'));
        return;
      }
      const hours = Number(hoursText.replace(',', '.'));
      if (!hours || hours <= 0) {
        setSaveError(t('voiceAssistant.missingHours'));
        return;
      }
      setSaveError(null);
      setStage('saving');
      const { error } = await createTimeEntry({
        organizationId: organization.id,
        projectId,
        workTypeId,
        userId: user.id,
        entryDate: new Date().toISOString().slice(0, 10),
        hours,
        startTime: null,
        endTime: null,
        note,
        createdBy: user.id,
      });
      if (error) {
        setStage('confirm');
        setSaveError(error);
        return;
      }
    } else if (command.action === 'expense') {
      const amount = Number(amountText.replace(',', '.'));
      if (!amount || amount <= 0) {
        setSaveError(t('voiceAssistant.missingAmount'));
        return;
      }
      if (!expenseLabel.trim()) {
        setSaveError(t('voiceAssistant.missingLabel'));
        return;
      }
      if (!projectId && !treasuryEnabled) {
        setSaveError(t('voiceAssistant.missingProject'));
        return;
      }
      setSaveError(null);
      setStage('saving');
      const error = projectId
        ? (await createProjectExpense(organization.id, projectId, expenseLabel.trim(), amount, user.id)).error
        : (
            await createExpense(organization.id, user.id, {
              label: expenseLabel.trim(),
              category: null,
              amountChf: amount,
              expenseDate: new Date().toISOString().slice(0, 10),
              notes: null,
            })
          ).error;
      if (error) {
        setStage('confirm');
        setSaveError(error);
        return;
      }
    }
    setStage('saved');
  }

  function startOver() {
    setStage('idle');
    setCommand(null);
    setErrorMessage(null);
    setSaveError(null);
    toggleRecording();
  }

  const recording = dictation.listening;
  const busy = dictation.transcribing || stage === 'routing';

  return (
    <>
      <Pressable
        onPress={openAssistant}
        style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
        accessibilityLabel={t('voiceAssistant.title')}
      >
        <Feather name="mic" size={22} color="#fff" />
      </Pressable>

      <Modal visible={open} animationType="fade" transparent onRequestClose={resetAndClose}>
        <Pressable style={styles.backdrop} onPress={() => (stage === 'saving' ? null : resetAndClose())}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTitleRow}>
                <View style={styles.cardHeaderIcon}>
                  <Feather name="mic" size={16} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>{t('voiceAssistant.title')}</Text>
              </View>
              <Pressable onPress={resetAndClose} hitSlop={8}>
                <Feather name="x" size={20} color={colors.textMuted} />
              </Pressable>
            </View>

            {stage === 'confirm' && command && (command.action === 'create_devis' || command.action === 'create_facture') ? (
              <DevisFactureConfirm
                command={command}
                clientName={devisClientName}
                setClientName={setDevisClientName}
                lines={devisLines}
                onConfirm={handleCreateDocument}
                onRetryVoice={startOver}
              />
            ) : stage === 'confirm' && command ? (
              <ConfirmForm
                command={command}
                projects={projects}
                workTypes={workTypes}
                showProjectPickerForExpense={showProjectPickerForExpense}
                allowGeneralExpense={treasuryEnabled}
                projectId={projectId}
                setProjectId={setProjectId}
                workTypeId={workTypeId}
                setWorkTypeId={setWorkTypeId}
                hoursText={hoursText}
                setHoursText={setHoursText}
                note={note}
                setNote={setNote}
                expenseLabel={expenseLabel}
                setExpenseLabel={setExpenseLabel}
                amountText={amountText}
                setAmountText={setAmountText}
                saveError={saveError}
                onConfirm={handleConfirm}
                onRetryVoice={startOver}
              />
            ) : stage === 'answered' && answerText ? (
              <View style={styles.centerBlock}>
                <View style={styles.cardHeaderIcon}>
                  <Feather name="message-circle" size={16} color={colors.primary} />
                </View>
                <Text style={styles.answerText}>{answerText}</Text>
                <View style={styles.savedActions}>
                  <Pressable style={styles.secondaryButton} onPress={resetAndClose}>
                    <Text style={styles.secondaryButtonText}>{t('voiceAssistant.close')}</Text>
                  </Pressable>
                  <Pressable style={styles.primaryButton} onPress={openAssistant}>
                    <Feather name="mic" size={14} color="#fff" />
                    <Text style={styles.primaryButtonText}>{t('voiceAssistant.askAnother')}</Text>
                  </Pressable>
                </View>
              </View>
            ) : stage === 'saving' ? (
              <View style={styles.centerBlock}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : stage === 'saved' && command ? (
              <View style={styles.centerBlock}>
                <Feather name="check-circle" size={32} color={colors.success} />
                <Text style={styles.savedText}>
                  {command.action === 'payroll_entry' ? t('voiceAssistant.savedPayroll') : t('voiceAssistant.savedExpense')}
                </Text>
                {/* Exactly where it landed — the whole point being that
                    confirming shouldn't leave you wondering. */}
                <Text style={styles.savedDestination}>
                  {command.action === 'payroll_entry'
                    ? t('voiceAssistant.savedPayrollProject', { project: projects.find((p) => p.id === projectId)?.label ?? '' })
                    : projectId
                      ? t('voiceAssistant.savedExpenseProject', { project: projects.find((p) => p.id === projectId)?.label ?? '' })
                      : t('voiceAssistant.savedExpenseGeneral')}
                </Text>
                <View style={styles.savedActions}>
                  <Pressable style={styles.secondaryButton} onPress={resetAndClose}>
                    <Text style={styles.secondaryButtonText}>{t('voiceAssistant.close')}</Text>
                  </Pressable>
                  {command.action === 'expense' ? (
                    <Pressable
                      style={styles.primaryButton}
                      onPress={() => {
                        const target = projectId ? (`/(app)/chantiers/${projectId}/profitability` as any) : ('/(app)/depenses' as any);
                        resetAndClose();
                        router.push(target);
                      }}
                    >
                      <Text style={styles.primaryButtonText}>{projectId ? t('voiceAssistant.viewChantier') : t('voiceAssistant.viewExpenses')}</Text>
                    </Pressable>
                  ) : (
                    <Pressable style={styles.primaryButton} onPress={openAssistant}>
                      <Text style={styles.primaryButtonText}>{t('voiceAssistant.addAnother')}</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ) : stage === 'unavailable' && command ? (
              <View style={styles.centerBlock}>
                <Feather name="lock" size={26} color={colors.accent} />
                <Text style={styles.hintText}>
                  {command.action === 'payroll_entry' ? t('voiceAssistant.unavailablePayroll') : t('voiceAssistant.unavailableExpense')}
                </Text>
                <View style={styles.savedActions}>
                  <Pressable style={styles.secondaryButton} onPress={resetAndClose}>
                    <Text style={styles.secondaryButtonText}>{t('voiceAssistant.close')}</Text>
                  </Pressable>
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => {
                      resetAndClose();
                      router.push('/(app)/compte' as any);
                    }}
                  >
                    <Text style={styles.primaryButtonText}>{t('voiceAssistant.seePlans')}</Text>
                  </Pressable>
                </View>
              </View>
            ) : stage === 'error' ? (
              <View style={styles.centerBlock}>
                <Feather name="alert-triangle" size={26} color={colors.warning} />
                <Text style={styles.hintText}>{errorMessage ?? t('voiceAssistant.errorGeneric')}</Text>
                <Pressable style={styles.primaryButton} onPress={() => setStage('idle')}>
                  <Text style={styles.primaryButtonText}>{t('voiceAssistant.tryAgain')}</Text>
                </Pressable>
              </View>
            ) : busy ? (
              <View style={styles.centerBlock}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.hintText}>{t('voiceAssistant.analyzing')}</Text>
              </View>
            ) : (
              <View style={styles.centerBlock}>
                <Text style={styles.hintText}>{t('voiceAssistant.idleHint')}</Text>
                <View style={styles.exampleCard}>
                  <View style={styles.exampleRow}>
                    <Feather name="clock" size={13} color={colors.textMuted} />
                    <Text style={styles.exampleText}>{t('voiceAssistant.example1')}</Text>
                  </View>
                  <View style={styles.exampleRow}>
                    <Feather name="shopping-bag" size={13} color={colors.textMuted} />
                    <Text style={styles.exampleText}>{t('voiceAssistant.example2')}</Text>
                  </View>
                  <View style={styles.exampleRow}>
                    <Feather name="file-text" size={13} color={colors.textMuted} />
                    <Text style={styles.exampleText}>{t('voiceAssistant.example3')}</Text>
                  </View>
                  <View style={styles.exampleRow}>
                    <Feather name="help-circle" size={13} color={colors.textMuted} />
                    <Text style={styles.exampleText}>{t('voiceAssistant.example4')}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={toggleRecording}
                  accessibilityLabel={recording ? t('voiceAssistant.listeningStop') : t('voiceAssistant.tapToSpeak')}
                  style={[styles.micButtonLarge, recording && styles.micButtonLargeActive]}
                >
                  <Feather name={recording ? 'square' : 'mic'} size={26} color="#fff" />
                </Pressable>
                <Text style={styles.micCaption}>{recording ? t('voiceAssistant.listeningStop') : t('voiceAssistant.tapToSpeak')}</Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function SelectRow({
  label,
  options,
  value,
  noneLabel,
  onChange,
}: {
  label: string;
  options: PickItem[];
  value: string | null;
  noneLabel?: string;
  onChange: (id: string | null) => void;
}) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {noneLabel ? (
          <Pressable onPress={() => onChange(null)} style={[styles.chip, value === null && styles.chipActive]}>
            <Text style={[styles.chipText, value === null && styles.chipTextActive]}>{noneLabel}</Text>
          </Pressable>
        ) : null}
        {options.map((o) => (
          <Pressable key={o.id} onPress={() => onChange(o.id)} style={[styles.chip, value === o.id && styles.chipActive]}>
            <Text style={[styles.chipText, value === o.id && styles.chipTextActive]} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function ConfirmForm({
  command,
  projects,
  workTypes,
  showProjectPickerForExpense,
  allowGeneralExpense,
  projectId,
  setProjectId,
  workTypeId,
  setWorkTypeId,
  hoursText,
  setHoursText,
  note,
  setNote,
  expenseLabel,
  setExpenseLabel,
  amountText,
  setAmountText,
  saveError,
  onConfirm,
  onRetryVoice,
}: {
  command: VoiceCommand;
  projects: PickItem[];
  workTypes: PickItem[];
  showProjectPickerForExpense: boolean;
  allowGeneralExpense: boolean;
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  workTypeId: string | null;
  setWorkTypeId: (id: string | null) => void;
  hoursText: string;
  setHoursText: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  expenseLabel: string;
  setExpenseLabel: (v: string) => void;
  amountText: string;
  setAmountText: (v: string) => void;
  saveError: string | null;
  onConfirm: () => void;
  onRetryVoice: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: spacing.md }}>
      {command.summary ? <Text style={styles.summaryBanner}>{command.summary}</Text> : null}

      {command.action === 'payroll_entry' ? (
        <>
          <SelectRow label={t('voiceAssistant.projectLabel')} options={projects} value={projectId} onChange={setProjectId} />
          <SelectRow
            label={t('voiceAssistant.workTypeLabel')}
            options={workTypes}
            value={workTypeId}
            noneLabel={t('voiceAssistant.workTypeNone')}
            onChange={setWorkTypeId}
          />
          <Field label={t('voiceAssistant.hoursLabel')} value={hoursText} onChangeText={setHoursText} keyboardType="decimal-pad" placeholder="0" />
          <Field label={t('voiceAssistant.noteLabel')} value={note} onChangeText={setNote} />
        </>
      ) : (
        <>
          {showProjectPickerForExpense ? (
            <SelectRow
              label={t('voiceAssistant.projectLabel')}
              options={projects}
              value={projectId}
              noneLabel={allowGeneralExpense ? t('voiceAssistant.generalExpenseOption') : undefined}
              onChange={setProjectId}
            />
          ) : null}
          <Field label={t('voiceAssistant.expenseLabelLabel')} value={expenseLabel} onChangeText={setExpenseLabel} />
          <Field label={t('voiceAssistant.amountLabel')} value={amountText} onChangeText={setAmountText} keyboardType="decimal-pad" placeholder="0" />
        </>
      )}

      {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

      <View style={styles.confirmActions}>
        <Pressable style={styles.secondaryButton} onPress={onRetryVoice}>
          <Feather name="mic" size={14} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>{t('voiceAssistant.retryVoice')}</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={onConfirm}>
          <Feather name="check" size={14} color="#fff" />
          <Text style={styles.primaryButtonText}>{t('voiceAssistant.confirmButton')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function chf(n: number): string {
  return `CHF ${n.toLocaleString(`${getAppLocale()}-CH`, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Preview-and-redirect step for create_devis/create_facture: the client
// name is editable here (a quick voice-recognition fix before navigating),
// but the dictated lines are shown read-only — they're meant to be
// reviewed and adjusted on the devis/facture editor itself, which is where
// they land pre-filled. Nothing is written to the database from this modal.
function DevisFactureConfirm({
  command,
  clientName,
  setClientName,
  lines,
  onConfirm,
  onRetryVoice,
}: {
  command: VoiceCommand;
  clientName: string;
  setClientName: (v: string) => void;
  lines: DictatedDevisLine[];
  onConfirm: () => void;
  onRetryVoice: () => void;
}) {
  const { t } = useTranslation();
  const total = lines.reduce((sum, l) => sum + l.quantity * (l.unitPrice ?? 0), 0);
  const hasUnpriced = lines.some((l) => l.unitPrice == null);
  const isDevis = command.action === 'create_devis';

  return (
    <View style={{ gap: spacing.md }}>
      {command.summary ? <Text style={styles.summaryBanner}>{command.summary}</Text> : null}

      <Field label={t('voiceAssistant.clientNameLabel')} value={clientName} onChangeText={setClientName} placeholder={t('voiceAssistant.clientNamePlaceholder')} />

      <View style={{ gap: spacing.xs }}>
        <Text style={styles.fieldLabel}>{t('voiceAssistant.linesPreviewLabel')}</Text>
        {lines.length === 0 ? (
          <Text style={styles.hintText}>{t('voiceAssistant.noLinesDictated')}</Text>
        ) : (
          <View style={styles.linesPreview}>
            {lines.map((l, i) => (
              <View key={i} style={styles.linePreviewRow}>
                <Text style={styles.linePreviewDescription} numberOfLines={2}>
                  {l.quantity} {l.unit} — {l.description}
                </Text>
                <Text style={styles.linePreviewPrice}>{l.unitPrice != null ? chf(l.quantity * l.unitPrice) : t('voiceAssistant.needsPriceTag')}</Text>
              </View>
            ))}
            <View style={styles.linePreviewTotalRow}>
              <Text style={styles.linePreviewTotalLabel}>{t('voiceAssistant.totalEstimateLabel')}</Text>
              <Text style={styles.linePreviewTotalValue}>{chf(total)}</Text>
            </View>
            {hasUnpriced ? <Text style={styles.hintText}>{t('voiceAssistant.someLinesNeedPrice')}</Text> : null}
          </View>
        )}
      </View>

      <View style={styles.confirmActions}>
        <Pressable style={styles.secondaryButton} onPress={onRetryVoice}>
          <Feather name="mic" size={14} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>{t('voiceAssistant.retryVoice')}</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={onConfirm}>
          <Feather name="arrow-right" size={14} color="#fff" />
          <Text style={styles.primaryButtonText}>{isDevis ? t('voiceAssistant.createDevisButton') : t('voiceAssistant.createFactureButton')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 20,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(35,26,18,0.45)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardHeaderIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  centerBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  hintText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  exampleCard: {
    width: '100%',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  exampleText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  micButtonLarge: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  micButtonLargeActive: {
    backgroundColor: colors.danger,
  },
  micCaption: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  summaryBanner: {
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    lineHeight: 19,
  },
  fieldLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chipRow: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    maxWidth: 180,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.danger,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  secondaryButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  savedText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  savedDestination: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  savedActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.sm,
  },
  answerText: {
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  linesPreview: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linePreviewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  linePreviewDescription: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  linePreviewPrice: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  linePreviewTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  linePreviewTotalLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
  },
  linePreviewTotalValue: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.primary,
  },
});
