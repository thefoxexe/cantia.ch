import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DateField } from '../../DateField';
import { CATEGORIES, PROOF_GUIDE, PROOFS, type LedgerKind } from '../../../lib/admin/ledgerCalc';
import type { LedgerInput } from '../../../lib/admin/ledgerApi';
import { colors, fontSize, spacing } from '../../../lib/theme';
import { Btn, Chip, Field, kit, PAYMENT_METHODS, Sheet, todayIso, VAT_RATES } from './kit';

export type EntryDraft = LedgerInput & { amountText: string; recurring?: boolean };

export function emptyEntry(kind: LedgerKind): EntryDraft {
  return {
    entry_date: todayIso(),
    kind,
    category: CATEGORIES[kind][0].key,
    label: '',
    counterparty: '',
    amount_chf: 0,
    amountText: '',
    vat_rate: 0,
    payment_method: kind === 'recette' ? 'banque' : 'carte',
    reference: '',
    receipt_path: null,
    notes: '',
    proof: null,
  };
}

export function EntryModal({
  draft,
  setDraft,
  saving,
  error,
  v2,
  onSave,
  onDelete,
  onPickReceipt,
  onOpenReceipt,
  onInternalReceipt,
  onMakeRecurring,
}: {
  draft: EntryDraft;
  setDraft: (d: EntryDraft | null) => void;
  saving: boolean;
  error: string | null;
  v2: boolean;
  onSave: () => void;
  onDelete?: () => void;
  onPickReceipt: () => void;
  onOpenReceipt: (path: string) => void;
  onInternalReceipt?: (reason: string) => void;
  onMakeRecurring?: () => void;
}) {
  const set = (p: Partial<EntryDraft>) => setDraft({ ...draft, ...p });
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState('');
  const isExpense = draft.kind === 'depense';
  const guide = isExpense ? PROOF_GUIDE[draft.category] : null;

  return (
    <Sheet
      title={draft.id ? 'Modifier l’écriture' : isExpense ? 'Nouvelle dépense' : 'Nouvelle recette'}
      onClose={() => setDraft(null)}
      footer={
        <>
          {onDelete ? <Btn icon="trash-2" label="Supprimer" variant="bad" onPress={onDelete} /> : null}
          <View style={{ flex: 1 }} />
          <Btn label="Annuler" onPress={() => setDraft(null)} />
          <Btn icon="check" label={saving ? 'Enregistrement…' : 'Enregistrer'} variant="primary" onPress={onSave} disabled={saving} />
        </>
      }
    >
      <View style={kit.row}>
        <Chip label="Recette" icon="arrow-down-left" tone="ok" active={draft.kind === 'recette'} onPress={() => set({ kind: 'recette', category: CATEGORIES.recette[0].key })} />
        <Chip label="Dépense" icon="arrow-up-right" tone="bad" active={isExpense} onPress={() => set({ kind: 'depense', category: CATEGORIES.depense[0].key })} />
      </View>

      <Field label="Montant (CHF, TVA comprise)">
        <TextInput
          value={draft.amountText}
          onChangeText={(v) => set({ amountText: v })}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          style={[kit.input, { fontSize: 26, fontWeight: '800', paddingVertical: 12, color: isExpense ? colors.danger : colors.success }]}
        />
      </Field>

      <View style={kit.row}>
        <Field label="Libellé" half>
          <TextInput value={draft.label} onChangeText={(v) => set({ label: v })} placeholder={isExpense ? 'Ex. Google Ads septembre' : 'Ex. Abonnement Cantia'} placeholderTextColor={colors.textMuted} style={kit.input} />
        </Field>
        <View style={{ flexGrow: 1, flexBasis: 160, minWidth: 0 }}>
          <DateField label="Date" value={draft.entry_date} onChange={(v) => v && set({ entry_date: v })} />
        </View>
      </View>

      <Field label="Catégorie">
        <View style={kit.row}>
          {CATEGORIES[draft.kind].map((c) => (
            <Chip key={c.key} small label={c.label} active={draft.category === c.key} onPress={() => set({ category: c.key })} />
          ))}
        </View>
      </Field>

      <View style={kit.row}>
        <Field label={isExpense ? 'Fournisseur' : 'Client'} half>
          <TextInput value={draft.counterparty ?? ''} onChangeText={(v) => set({ counterparty: v })} placeholder={isExpense ? 'Ex. Google' : 'Ex. WebAlp.ch'} placeholderTextColor={colors.textMuted} style={kit.input} />
        </Field>
        <Field label="Référence (n° de facture…)" half>
          <TextInput value={draft.reference ?? ''} onChangeText={(v) => set({ reference: v })} style={kit.input} />
        </Field>
      </View>

      {/* Justificatif */}
      {isExpense ? (
        <View style={[kit.card, { backgroundColor: colors.bg, gap: spacing.sm }]}>
          <Text style={kit.cardTitle}>Justificatif</Text>
          {draft.receipt_path ? (
            <View style={kit.row}>
              <Pressable onPress={() => onOpenReceipt(draft.receipt_path!)} style={[kit.chip, { borderColor: colors.success, backgroundColor: colors.successSoft }]}>
                <Feather name="paperclip" size={13} color={colors.success} />
                <Text style={[kit.chipText, { color: colors.success }]}>{draft.proof === 'quittance_interne' ? 'Voir la quittance interne' : 'Voir le justificatif'}</Text>
              </Pressable>
              <Pressable onPress={() => set({ receipt_path: null, proof: null })} hitSlop={6}>
                <Text style={kit.muted}>Retirer</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Btn icon="upload" label="Joindre la facture ou le ticket (photo, PDF)" onPress={onPickReceipt} />
              {v2 ? (
                <>
                  <Text style={[kit.hint, { marginTop: 4 }]}>Pas de fichier sous la main ? Indiquez où se trouve la preuve :</Text>
                  <View style={kit.row}>
                    {PROOFS.map((p) => (
                      <Chip key={p.key} small label={p.short} active={draft.proof === p.key} onPress={() => set({ proof: draft.proof === p.key ? null : p.key })} />
                    ))}
                  </View>
                  {draft.proof ? <Text style={kit.hint}>{PROOFS.find((p) => p.key === draft.proof)?.label}</Text> : null}
                </>
              ) : null}
              {onInternalReceipt ? (
                reasonOpen ? (
                  <View style={{ gap: 6 }}>
                    <TextInput
                      value={reason}
                      onChangeText={setReason}
                      multiline
                      placeholder="Pourquoi il n’y a pas de document (ex. horodateur sans ticket, pourboire, ticket perdu)"
                      placeholderTextColor={colors.textMuted}
                      style={[kit.input, { minHeight: 64, fontSize: fontSize.sm }]}
                    />
                    <View style={kit.row}>
                      <Btn icon="file-plus" label="Créer et joindre la quittance" variant="primary" onPress={() => onInternalReceipt(reason)} disabled={!reason.trim() || saving} />
                      <Btn label="Annuler" variant="ghost" onPress={() => setReasonOpen(false)} />
                    </View>
                  </View>
                ) : (
                  <Pressable onPress={() => setReasonOpen(true)} hitSlop={6}>
                    <Text style={kit.link}>Aucun document n’existe ? Créer une quittance interne (PDF)</Text>
                  </Pressable>
                )
              ) : null}
            </>
          )}
          {guide ? (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <Feather name="info" size={14} color={colors.slate} style={{ marginTop: 2 }} />
              <Text style={[kit.hint, { flex: 1, color: colors.slate }]}>{guide}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <Field label="TVA comprise dans le montant">
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
      <Field label="Notes" hint={isExpense ? 'Lien avec l’activité, personnes présentes (repas), part privée (téléphone, voiture)…' : undefined}>
        <TextInput value={draft.notes ?? ''} onChangeText={(v) => set({ notes: v })} multiline style={[kit.input, { minHeight: 64, fontSize: fontSize.sm }]} />
      </Field>

      {onMakeRecurring && !draft.id ? (
        <Pressable onPress={onMakeRecurring} style={[kit.banner, { backgroundColor: colors.primarySoft }]}>
          <Feather name="repeat" size={16} color={colors.primaryDark} />
          <Text style={[kit.body, { flex: 1, color: colors.primaryDark }]}>Ça revient chaque mois ? En faire une écriture récurrente</Text>
          <Feather name="chevron-right" size={16} color={colors.primaryDark} />
        </Pressable>
      ) : null}

      {error ? <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>{error}</Text> : null}
    </Sheet>
  );
}
