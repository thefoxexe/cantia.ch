import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DateField } from '../../DateField';
import { CATEGORIES, categoryLabel, dueOccurrences, FREQUENCIES, monthlyEquivalent, nextOccurrence, PROOFS, type Frequency, type LedgerKind, type RecurringRule } from '../../../lib/admin/ledgerCalc';
import { deleteRecurring, saveRecurring, type RecurringInput } from '../../../lib/admin/ledgerApi';
import { confirm } from '../../../lib/confirm';
import { colors, fontSize, spacing } from '../../../lib/theme';
import { Btn, CategoryIcon, chf, Chip, Field, kit, parseAmount, PAYMENT_METHODS, Sheet, swiss, todayIso, usePhone, VAT_RATES } from './kit';

// Admin › Comptabilité › Récurrents: subscriptions, ads, phone, rent… posted
// into the journal on each due date (button on the page, never silently).

type Draft = RecurringInput & { amountText: string };

const firstOfMonth = () => `${todayIso().slice(0, 8)}01`;

function blank(kind: LedgerKind): Draft {
  return {
    kind,
    category: CATEGORIES[kind][0].key,
    label: '',
    counterparty: '',
    amount_chf: 0,
    amountText: '',
    vat_rate: 0,
    payment_method: kind === 'recette' ? 'banque' : 'carte',
    frequency: 'monthly',
    day_of_month: 1,
    start_date: firstOfMonth(),
    end_date: null,
    proof: null,
    notes: '',
    active: true,
  };
}

// One tap to start from a common charge.
const TEMPLATES: (Partial<Draft> & { label: string })[] = [
  { label: 'Hébergement / logiciel', category: 'logiciels', counterparty: 'Supabase', amountText: '25', proof: 'facture_en_ligne' },
  { label: 'Google Ads', category: 'marketing', counterparty: 'Google', amountText: '300', vat_rate: 8.1, proof: 'facture_en_ligne' },
  { label: 'Abonnement mobile (part pro)', category: 'telecom', counterparty: 'Swisscom', amountText: '35', vat_rate: 8.1, proof: 'facture_en_ligne', notes: 'Part professionnelle 50 %' },
  { label: 'Internet', category: 'telecom', amountText: '49', vat_rate: 8.1 },
  { label: 'Loyer bureau / coworking', category: 'bureau', amountText: '400', payment_method: 'banque', proof: 'piece' },
  { label: 'Assurance RC professionnelle', category: 'assurances', amountText: '480', frequency: 'yearly', payment_method: 'banque', proof: 'piece' },
  { label: 'Fiduciaire', category: 'honoraires', amountText: '900', frequency: 'yearly', vat_rate: 8.1, payment_method: 'banque' },
  { label: 'Frais de tenue de compte', category: 'frais_financiers', amountText: '5', payment_method: 'banque', proof: 'releve' },
];

export function RecurringTab({ rules, available, onChanged, onPostDue, posting }: { rules: RecurringRule[]; available: boolean; onChanged: () => void; onPostDue: () => void; posting: boolean }) {
  const { phone } = usePhone();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = todayIso();

  if (!available) {
    return (
      <View style={[kit.card, { backgroundColor: colors.warningSoft, borderColor: colors.warningSoft }]}>
        <Text style={kit.cardTitle}>Une petite mise à jour de la base est nécessaire</Text>
        <Text style={kit.body}>Collez le bloc « Récurrents et justificatifs » de docs/sql/a-coller-dans-supabase.sql dans Supabase › SQL Editor, puis rechargez la page.</Text>
      </View>
    );
  }

  const active = rules.filter((r) => r.active);
  const monthlyOut = active.filter((r) => r.kind === 'depense').reduce((s, r) => s + monthlyEquivalent(r), 0);
  const monthlyIn = active.filter((r) => r.kind === 'recette').reduce((s, r) => s + monthlyEquivalent(r), 0);
  const due = rules.reduce((n, r) => n + dueOccurrences(r, today).length, 0);

  async function save() {
    if (!draft) return;
    const amount = parseAmount(draft.amountText);
    if (!draft.label.trim()) return setError('Le libellé est obligatoire.');
    if (!Number.isFinite(amount) || amount <= 0) return setError('Montant invalide.');
    if (draft.end_date && draft.end_date < draft.start_date) return setError('La fin doit être après le début.');
    setSaving(true);
    const { error: e } = await saveRecurring({ ...draft, amount_chf: amount });
    setSaving(false);
    if (e) return setError(e);
    setDraft(null);
    onChanged();
  }

  async function remove(id: string) {
    if (!(await confirm('Supprimer cette écriture récurrente ?', 'Les écritures déjà passées au journal restent.'))) return;
    await deleteRecurring(id);
    setDraft(null);
    onChanged();
  }

  const edit = (r: RecurringRule) => setDraft({ ...r, counterparty: r.counterparty ?? '', notes: r.notes ?? '', amountText: String(r.amount_chf) });
  const set = (p: Partial<Draft>) => draft && setDraft({ ...draft, ...p });

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={[kit.row, { gap: spacing.md }]}>
        <View style={[kit.card, { flexGrow: 1, flexBasis: phone ? '100%' : 220 }]}>
          <Text style={kit.eyebrow}>Charges fixes</Text>
          <Text style={[kit.display, { fontSize: 24, color: colors.danger }]}>CHF {chf(monthlyOut)}</Text>
          <Text style={kit.hint}>par mois en moyenne · {chf(monthlyOut * 12)} par an</Text>
        </View>
        <View style={[kit.card, { flexGrow: 1, flexBasis: phone ? '100%' : 220 }]}>
          <Text style={kit.eyebrow}>Revenus récurrents</Text>
          <Text style={[kit.display, { fontSize: 24, color: colors.success }]}>CHF {chf(monthlyIn)}</Text>
          <Text style={kit.hint}>par mois en moyenne</Text>
        </View>
      </View>

      {due ? (
        <View style={[kit.banner, { backgroundColor: colors.primarySoft }]}>
          <Feather name="clock" size={16} color={colors.primaryDark} />
          <Text style={[kit.body, { flex: 1, minWidth: 180, color: colors.primaryDark }]}>{due} écriture(s) arrivée(s) à échéance, pas encore au journal.</Text>
          <Btn icon="check-circle" label={posting ? 'Comptabilisation…' : 'Comptabiliser'} variant="primary" onPress={onPostDue} disabled={posting} />
        </View>
      ) : null}

      <View style={[kit.row, { justifyContent: 'space-between' }]}>
        <Text style={kit.cardTitle}>{rules.length ? `${rules.length} écriture(s) récurrente(s)` : 'Aucune écriture récurrente'}</Text>
        <View style={kit.row}>
          <Btn icon="plus" label="Recette" variant="ok" onPress={() => setDraft(blank('recette'))} />
          <Btn icon="plus" label="Dépense" variant="bad" onPress={() => setDraft(blank('depense'))} />
        </View>
      </View>

      {rules.map((r) => {
        const next = nextOccurrence(r, today);
        const freq = FREQUENCIES.find((f) => f.key === r.frequency)?.label ?? r.frequency;
        return (
          <Pressable key={r.id} onPress={() => edit(r)} style={({ hovered }: any) => [kit.card, { flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: r.active ? 1 : 0.6 }, hovered && { borderColor: colors.primary }]}>
            <CategoryIcon kind={r.kind} category={r.category} size={40} />
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text style={[kit.body, { fontWeight: '700' }]} numberOfLines={1}>
                {r.label}
              </Text>
              <Text style={kit.hint} numberOfLines={2}>
                {[freq, r.frequency === 'weekly' ? null : `le ${r.day_of_month}`, categoryLabel(r.kind, r.category), r.counterparty].filter(Boolean).join(' · ')}
              </Text>
              <Text style={[kit.hint, { color: r.active ? colors.primaryDark : colors.textMuted }]}>{r.active ? (next ? `Prochaine : ${swiss(next)}` : 'Terminée') : 'En pause'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={[kit.body, { fontWeight: '800', color: r.kind === 'recette' ? colors.success : colors.danger, fontVariant: ['tabular-nums'] }]}>
                {r.kind === 'recette' ? '+' : '−'}
                {chf(r.amount_chf)}
              </Text>
              <Pressable
                onPress={async (e: any) => {
                  e?.stopPropagation?.();
                  await saveRecurring({ ...r, active: !r.active });
                  onChanged();
                }}
                hitSlop={6}
              >
                <Text style={kit.link}>{r.active ? 'Mettre en pause' : 'Reprendre'}</Text>
              </Pressable>
            </View>
          </Pressable>
        );
      })}

      <View style={[kit.card, { backgroundColor: colors.bg }]}>
        <Text style={kit.cardTitle}>Démarrer depuis un modèle</Text>
        <View style={kit.row}>
          {TEMPLATES.map((t) => (
            <Chip key={t.label} small icon="plus" label={t.label} active={false} onPress={() => setDraft({ ...blank('depense'), ...t, counterparty: t.counterparty ?? '', notes: t.notes ?? '' })} />
          ))}
        </View>
        <Text style={kit.hint}>
          Les écritures récurrentes ne passent au journal que lorsque vous cliquez sur « Comptabiliser » : vous gardez la main si un montant change (publicité, téléphone). Modifiez ensuite l’écriture du mois concernée.
        </Text>
      </View>

      {draft ? (
        <Sheet
          title={draft.id ? 'Modifier l’écriture récurrente' : 'Nouvelle écriture récurrente'}
          onClose={() => setDraft(null)}
          footer={
            <>
              {draft.id ? <Btn icon="trash-2" label="Supprimer" variant="bad" onPress={() => remove(draft.id!)} /> : null}
              <View style={{ flex: 1 }} />
              <Btn label="Annuler" onPress={() => setDraft(null)} />
              <Btn icon="check" label={saving ? 'Enregistrement…' : 'Enregistrer'} variant="primary" onPress={save} disabled={saving} />
            </>
          }
        >
          <View style={kit.row}>
            <Chip label="Recette" icon="arrow-down-left" tone="ok" active={draft.kind === 'recette'} onPress={() => set({ kind: 'recette', category: CATEGORIES.recette[0].key })} />
            <Chip label="Dépense" icon="arrow-up-right" tone="bad" active={draft.kind === 'depense'} onPress={() => set({ kind: 'depense', category: CATEGORIES.depense[0].key })} />
          </View>
          <View style={kit.row}>
            <Field label="Libellé" half>
              <TextInput value={draft.label} onChangeText={(v) => set({ label: v })} placeholder="Ex. Supabase Pro" placeholderTextColor={colors.textMuted} style={kit.input} />
            </Field>
            <Field label="Montant (CHF, TVA comprise)" half>
              <TextInput value={draft.amountText} onChangeText={(v) => set({ amountText: v })} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} style={[kit.input, { fontWeight: '800' }]} />
            </Field>
          </View>
          <Field label="Fréquence">
            <View style={kit.row}>
              {FREQUENCIES.map((f) => (
                <Chip key={f.key} small label={f.label} active={draft.frequency === f.key} onPress={() => set({ frequency: f.key as Frequency })} />
              ))}
            </View>
          </Field>
          <View style={kit.row}>
            {draft.frequency !== 'weekly' ? (
              <Field label="Jour du mois" half hint="31 = dernier jour du mois">
                <TextInput
                  value={String(draft.day_of_month)}
                  onChangeText={(v) => set({ day_of_month: Math.max(1, Math.min(31, Number(v.replace(/\D/g, '')) || 1)) })}
                  keyboardType="number-pad"
                  style={kit.input}
                />
              </Field>
            ) : null}
            <View style={{ flexGrow: 1, flexBasis: 160, minWidth: 0 }}>
              <DateField label="À partir du" value={draft.start_date} onChange={(v) => v && set({ start_date: v })} />
            </View>
            <View style={{ flexGrow: 1, flexBasis: 160, minWidth: 0 }}>
              <DateField label="Jusqu’au (facultatif)" value={draft.end_date} onChange={(v) => set({ end_date: v })} />
            </View>
          </View>
          <Field label="Catégorie">
            <View style={kit.row}>
              {CATEGORIES[draft.kind].map((c) => (
                <Chip key={c.key} small label={c.label} active={draft.category === c.key} onPress={() => set({ category: c.key })} />
              ))}
            </View>
          </Field>
          <Field label={draft.kind === 'recette' ? 'Client' : 'Fournisseur'}>
            <TextInput value={draft.counterparty ?? ''} onChangeText={(v) => set({ counterparty: v })} style={kit.input} />
          </Field>
          {draft.kind === 'depense' ? (
            <Field label="Justificatif habituel" hint="Repris sur chaque écriture du journal. Vous pourrez y joindre le PDF du mois.">
              <View style={kit.row}>
                {PROOFS.map((p) => (
                  <Chip key={p.key} small label={p.short} active={draft.proof === p.key} onPress={() => set({ proof: draft.proof === p.key ? null : p.key })} />
                ))}
              </View>
            </Field>
          ) : null}
          <Field label="TVA comprise">
            <View style={kit.row}>
              {VAT_RATES.map((r) => (
                <Chip key={r} small label={r ? `${String(r).replace('.', ',')} %` : 'Sans TVA'} active={draft.vat_rate === r} onPress={() => set({ vat_rate: r })} />
              ))}
            </View>
          </Field>
          <Field label="Moyen de paiement">
            <View style={kit.row}>
              {PAYMENT_METHODS.map((m) => (
                <Chip key={m.key} small label={m.label} active={draft.payment_method === m.key} onPress={() => set({ payment_method: m.key })} />
              ))}
            </View>
          </Field>
          <Field label="Notes">
            <TextInput value={draft.notes ?? ''} onChangeText={(v) => set({ notes: v })} multiline style={[kit.input, { minHeight: 56, fontSize: fontSize.sm }]} />
          </Field>
          {draft.id ? (
            <Pressable onPress={() => set({ active: !draft.active })} style={kit.row}>
              <Feather name={draft.active ? 'pause-circle' : 'play-circle'} size={16} color={colors.primary} />
              <Text style={kit.link}>{draft.active ? 'Mettre en pause' : 'Reprendre'}</Text>
            </Pressable>
          ) : null}
          {error ? <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>{error}</Text> : null}
        </Sheet>
      ) : null}
    </View>
  );
}
