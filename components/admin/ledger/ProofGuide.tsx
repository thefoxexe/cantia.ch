import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES, categoryLabel, PROOF_GUIDE, proofStatus, PROOFS, type LedgerEntry, type ProofKind } from '../../../lib/admin/ledgerCalc';
import { colors, spacing } from '../../../lib/theme';
import { CategoryIcon, chf, Chip, kit, ProofBadge, swiss, usePhone } from './kit';

// Admin › Comptabilité › Justificatifs: what Swiss law expects, what to do
// without a receipt, where to find each kind of document, and the expenses
// still to sort out.

const LEVELS: { icon: keyof typeof Feather.glyphMap; color: string; title: string; text: string }[] = [
  {
    icon: 'check-circle',
    color: colors.success,
    title: '1. La facture ou le ticket',
    text: 'La meilleure preuve : document du fournisseur avec date, montant, nom et objet. Une photo nette ou le PDF suffit, le papier n’est pas obligatoire.',
  },
  {
    icon: 'download-cloud',
    color: colors.success,
    title: '2. La facture dans le compte du fournisseur',
    text: 'Google Ads, Meta, Stripe, logiciels : la facture existe toujours dans votre compte. Prenez l’habitude de la télécharger une fois par mois et de la joindre ; à défaut, marquez « Facture en ligne ».',
  },
  {
    icon: 'file-text',
    color: colors.warning,
    title: '3. Quittance interne + relevé',
    text: 'Quand aucun document n’existe (horodateur, pourboire, ticket perdu) : une quittance interne signée qui dit quoi, combien, pourquoi, avec la ligne du relevé bancaire. À garder pour les exceptions et les petits montants.',
  },
  {
    icon: 'alert-triangle',
    color: colors.danger,
    title: '4. Rien du tout',
    text: 'Le fisc peut refuser la déduction ou l’estimer lui-même. C’est à vous de prouver vos charges : régularisez avant de remettre vos comptes.',
  },
];

export function ProofGuide({ entries, onOpen, onSetProof }: { entries: LedgerEntry[]; onOpen: (e: LedgerEntry) => void; onSetProof?: (e: LedgerEntry, proof: ProofKind) => void }) {
  const { phone } = usePhone();
  const [openCat, setOpenCat] = useState<string | null>('marketing');
  const todo = entries.filter((e) => proofStatus(e) === 'missing');
  const weak = entries.filter((e) => proofStatus(e) === 'weak');
  const expenses = entries.filter((e) => e.kind === 'depense');
  const ok = expenses.length - todo.length;
  const pct = expenses.length ? Math.round((ok / expenses.length) * 100) : 100;

  return (
    <View style={{ gap: spacing.lg }}>
      {/* To sort out */}
      <View style={kit.card}>
        <View style={[kit.row, { justifyContent: 'space-between' }]}>
          <Text style={kit.cardTitle}>À régulariser sur la période</Text>
          <Text style={[kit.body, { fontWeight: '800', color: todo.length ? colors.danger : colors.success }]}>{pct} % justifié</Text>
        </View>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
          <View style={{ height: 8, width: `${pct}%`, backgroundColor: todo.length ? colors.warning : colors.success }} />
        </View>
        {todo.length === 0 ? (
          <Text style={kit.muted}>Toutes les dépenses de la période ont une preuve. {weak.length ? `${weak.length} reposent seulement sur un relevé ou une quittance interne.` : ''}</Text>
        ) : (
          <Text style={kit.muted}>Pour chacune : joignez le document, ou indiquez où se trouve la preuve.</Text>
        )}
        {todo.slice(0, 30).map((e) => (
          <View key={e.id} style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, gap: spacing.sm }}>
            <Pressable onPress={() => onOpen(e)} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <CategoryIcon kind={e.kind} category={e.category} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[kit.body, { fontWeight: '700' }]} numberOfLines={1}>
                  {e.label}
                </Text>
                <Text style={kit.hint} numberOfLines={1}>
                  {swiss(e.entry_date)} · {categoryLabel(e.kind, e.category)}
                </Text>
              </View>
              <Text style={[kit.body, { fontWeight: '800', color: colors.danger }]}>−{chf(e.amount_chf)}</Text>
            </Pressable>
            {onSetProof ? (
              <View style={kit.row}>
                <Chip small icon="paperclip" label="Joindre" active={false} onPress={() => onOpen(e)} />
                {PROOFS.filter((p) => p.key !== 'quittance_interne').map((p) => (
                  <Chip key={p.key} small label={p.short} active={false} onPress={() => onSetProof(e, p.key)} />
                ))}
              </View>
            ) : null}
          </View>
        ))}
        {todo.length > 30 ? <Text style={kit.hint}>… et {todo.length - 30} autre(s). Filtrez le journal sur « À justifier ».</Text> : null}
      </View>

      {/* Levels */}
      <View style={kit.card}>
        <Text style={kit.cardTitle}>Qu’est-ce qui compte comme justificatif ?</Text>
        <View style={{ gap: spacing.md }}>
          {LEVELS.map((l) => (
            <View key={l.title} style={{ flexDirection: 'row', gap: spacing.md }}>
              <Feather name={l.icon} size={18} color={l.color} style={{ marginTop: 2 }} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[kit.body, { fontWeight: '700' }]}>{l.title}</Text>
                <Text style={kit.muted}>{l.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* By category */}
      <View style={kit.card}>
        <Text style={kit.cardTitle}>Où trouver le justificatif, par catégorie</Text>
        {CATEGORIES.depense.map((c) => {
          const open = openCat === c.key;
          return (
            <View key={c.key} style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
              <Pressable onPress={() => setOpenCat(open ? null : c.key)} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 10 }}>
                <CategoryIcon kind="depense" category={c.key} size={30} />
                <Text style={[kit.body, { flex: 1, fontWeight: '600' }]}>{c.label}</Text>
                <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
              </Pressable>
              {open ? <Text style={[kit.muted, { paddingLeft: phone ? 0 : 42, paddingBottom: 12 }]}>{PROOF_GUIDE[c.key]}</Text> : null}
            </View>
          );
        })}
      </View>

      {/* Rules */}
      <View style={[kit.card, { backgroundColor: colors.bg }]}>
        <Text style={kit.cardTitle}>Ce que dit la loi, en bref</Text>
        {[
          'Indépendant avec moins de CHF 500’000 de chiffre d’affaires : une comptabilité des recettes et des dépenses et de l’état du patrimoine suffit (art. 957 al. 2 CO).',
          'Chaque écriture doit pouvoir être prouvée par une pièce, papier ou électronique (art. 957a CO). Une photo ou un PDF est valable.',
          'Conservez les pièces 10 ans (art. 958f CO).',
          'AVS : vos cotisations définitives sont calculées sur le revenu que l’administration fiscale communique à la caisse. La caisse demande rarement des justificatifs ; ce sont les impôts qui peuvent le faire. Votre rapport sert à fixer des acomptes justes.',
          'Publicité ou logiciels facturés depuis l’étranger (Google, Meta…) : au-delà de CHF 10’000 de prestations étrangères par an, l’impôt sur les acquisitions (TVA) s’applique même sans être assujetti (art. 45 LTVA).',
          'Dépenses mixtes (téléphone, voiture, bureau à domicile) : seule la part professionnelle est déductible ; notez le pourcentage.',
        ].map((t) => (
          <View key={t} style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={[kit.body, { color: colors.primary }]}>•</Text>
            <Text style={[kit.muted, { flex: 1 }]}>{t}</Text>
          </View>
        ))}
        <Text style={kit.hint}>Informations générales, pas un conseil fiscal personnalisé. En cas de doute, votre fiduciaire tranche.</Text>
      </View>

      {weak.length ? (
        <View style={kit.card}>
          <Text style={kit.cardTitle}>Preuves fragiles ({weak.length})</Text>
          <Text style={kit.muted}>Acceptables, mais si vous pouvez obtenir la facture, c’est mieux.</Text>
          {weak.slice(0, 15).map((e) => (
            <Pressable key={e.id} onPress={() => onOpen(e)} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
              <Text style={[kit.body, { flex: 1 }]} numberOfLines={1}>
                {swiss(e.entry_date)} · {e.label}
              </Text>
              <ProofBadge entry={e} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
