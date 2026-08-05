import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button, Card, Field } from './ui';
import { supabase } from '../lib/supabase';
import { colors, fontSize, radius, spacing } from '../lib/theme';

export type PdfTemplateKind = 'devis' | 'report';
export type LogoPlacement = 'left' | 'center' | 'right';

interface PdfTemplateRow {
  id: string;
  name: string;
  base_layout: 'classic' | 'moderne' | 'minimal' | 'structure';
  is_default: boolean;
  brand_color_override: string | null;
  logo_placement_override: LogoPlacement | null;
  footer_text_override: string | null;
}

export const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

export const BRAND_COLOR_PRESETS = [
  '#1F3D3A', // vert sapin (défaut)
  '#16324F', // bleu marine
  '#7A2E2E', // rouge brique
  '#2E4A2E', // vert forêt
  '#33475B', // bleu ardoise
  '#6B4226', // terre cuite
  '#263238', // anthracite
  '#8A5A00', // ambre
];

export const LOGO_PLACEMENTS: { id: LogoPlacement; label: string; icon: 'align-left' | 'align-center' | 'align-right' }[] = [
  { id: 'left', label: 'Gauche', icon: 'align-left' },
  { id: 'center', label: 'Centré', icon: 'align-center' },
  { id: 'right', label: 'Droite', icon: 'align-right' },
];

// Devis and reports both use a single unified layout now — the only thing
// that varies between an org's templates is brand color, so the swatch is
// just tinted by that color rather than depicting a chosen base_layout.
export function TemplateSwatch({ color }: { color?: string }) {
  return (
    <View style={swatch.base}>
      <View style={swatch.bodyPad}>
        <View style={[swatch.line, { width: '45%', height: 6, backgroundColor: color || colors.primary }]} />
        <View style={{ height: 6 }} />
        <View style={[swatch.line, { width: '70%' }]} />
        <View style={[swatch.line, { width: '50%' }]} />
      </View>
    </View>
  );
}

function useCustomizationAccess(organizationId: string | undefined) {
  const [hasCustomization, setHasCustomization] = useState<boolean | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    let active = true;
    supabase
      .from('organizations')
      .select('plans(has_customization)')
      .eq('id', organizationId)
      .single()
      .then(({ data }) => {
        if (!active) return;
        const plan = (data as any)?.plans;
        setHasCustomization(Array.isArray(plan) ? (plan[0]?.has_customization ?? true) : (plan?.has_customization ?? true));
      });
    return () => {
      active = false;
    };
  }, [organizationId]);

  return hasCustomization;
}

function UpsellCard() {
  const router = useRouter();
  return (
    <Card style={styles.upsell}>
      <Feather name="lock" size={20} color={colors.accent} />
      <Text style={styles.upsellTitle}>Personnalisation des documents</Text>
      <Text style={styles.upsellText}>
        Choisissez la mise en page, la couleur de marque et le placement du logo de vos devis et rapports PDF, et créez
        plusieurs modèles pour vos différents besoins.
      </Text>
      <Text style={styles.upsellText}>Disponible à partir du plan Indépendant (dès CHF 9/mois).</Text>
      <Button title="Voir les plans" variant="secondary" icon="arrow-right" onPress={() => router.push('/(app)/compte')} style={{ marginTop: spacing.md }} />
    </Card>
  );
}

// Two independent modes, picked by which optional props the caller passes:
// - Plain pick (no `manage`, optional `selectedId`/`onSelect`): used both as
//   a "settings" picker (self-mutates the org default via
//   set_default_pdf_template when `onSelect` is absent) and as a "creation"
//   picker (controlled — reports the pick to the parent instead of mutating
//   anything, so a single document can override the org default without
//   changing it for every future one).
// - `manage`: adds create/duplicate/edit/delete around the same grid, for
//   the dedicated settings screens.
export function PdfTemplatePicker({
  organizationId,
  kind,
  disabled,
  hasLogo,
  compact,
  manage,
  selectedId,
  onSelect,
}: {
  organizationId: string;
  kind: PdfTemplateKind;
  disabled?: boolean;
  hasLogo?: boolean;
  compact?: boolean;
  manage?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const [templates, setTemplates] = useState<PdfTemplateRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<PdfTemplateRow | null>(null);
  const [creating, setCreating] = useState(false);
  const hasCustomization = useCustomizationAccess(organizationId);
  const controlled = !!onSelect;

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('pdf_templates')
      .select('id, name, base_layout, is_default, brand_color_override, logo_placement_override, footer_text_override')
      .eq('organization_id', organizationId)
      .eq('kind', kind)
      .order('name', { ascending: true });
    const rows = (data as PdfTemplateRow[]) ?? [];
    setTemplates(rows);
    return rows;
  }, [organizationId, kind]);

  useEffect(() => {
    load();
  }, [load]);

  // Seeds the controlled selection with the org's default template once
  // templates have loaded, so a document's creation screen starts on the
  // same template it would otherwise fall back to, instead of nothing
  // highlighted until the user taps a card.
  useEffect(() => {
    if (!controlled || selectedId != null || templates.length === 0) return;
    const def = templates.find((t) => t.is_default);
    if (def) onSelect!(def.id);
  }, [controlled, selectedId, templates, onSelect]);

  async function selectTemplate(templateId: string) {
    if (disabled || saving) return;
    if (controlled) {
      onSelect!(templateId);
      return;
    }
    const current = templates.find((t) => t.is_default);
    if (current?.id === templateId) return;
    setSaving(true);
    setTemplates((prev) => prev.map((t) => ({ ...t, is_default: t.id === templateId })));
    await supabase.rpc('set_default_pdf_template', { p_org: organizationId, p_template: templateId, p_kind: kind });
    setSaving(false);
  }

  if (hasCustomization === false) {
    return <UpsellCard />;
  }

  const activeId = controlled ? selectedId : templates.find((t) => t.is_default)?.id;

  return (
    <View>
      {hasLogo === false && kind === 'report' ? (
        <View style={styles.warning}>
          <Feather name="alert-triangle" size={14} color={colors.accent} />
          <Text style={styles.warningText}>
            Aucun logo chargé — vos rapports PDF partiront sans logo. Ajoutez-en un dans Compte → Profil entreprise.
          </Text>
        </View>
      ) : null}
      <View style={styles.grid}>
        {templates.map((t) => {
          const active = t.id === activeId;
          return (
            <Pressable
              key={t.id}
              onPress={() => selectTemplate(t.id)}
              disabled={disabled}
              style={compact ? styles.cardWrapCompact : styles.cardWrap}
            >
              <Card style={[styles.card, compact && styles.cardCompact, active && styles.cardActive]}>
                <View style={styles.preview}>
                  <TemplateSwatch color={t.brand_color_override ?? undefined} />
                  {active ? (
                    <View style={styles.check}>
                      <Feather name="check" size={12} color={colors.surface} />
                    </View>
                  ) : null}
                </View>
                <Text style={styles.name}>{t.name}</Text>
                {!compact ? <Text style={styles.desc}>Mise en page unique, personnalisez la couleur.</Text> : null}
                {manage ? (
                  <View style={styles.cardActions}>
                    <Pressable hitSlop={8} onPress={() => setEditing(t)}>
                      <Feather name="edit-2" size={15} color={colors.textMuted} />
                    </Pressable>
                    <Pressable hitSlop={8} onPress={() => duplicateTemplate(organizationId, t, load)}>
                      <Feather name="copy" size={15} color={colors.textMuted} />
                    </Pressable>
                    {!t.is_default ? (
                      <Pressable hitSlop={8} onPress={() => deleteTemplate(t.id, load)}>
                        <Feather name="trash-2" size={15} color={colors.danger} />
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </Card>
            </Pressable>
          );
        })}
        {manage ? (
          <Pressable onPress={() => setCreating(true)} style={compact ? styles.cardWrapCompact : styles.cardWrap}>
            <Card style={[styles.card, compact && styles.cardCompact, styles.newCard]}>
              <Feather name="plus" size={22} color={colors.textMuted} />
              <Text style={styles.newCardText}>Nouveau modèle</Text>
            </Card>
          </Pressable>
        ) : null}
      </View>

      {manage && creating ? (
        <CreateTemplateModal
          organizationId={organizationId}
          kind={kind}
          onClose={() => setCreating(false)}
          onCreated={load}
        />
      ) : null}
      {manage && editing ? (
        <EditTemplateModal kind={kind} template={editing} onClose={() => setEditing(null)} onSaved={load} />
      ) : null}
    </View>
  );
}

async function duplicateTemplate(organizationId: string, template: PdfTemplateRow, onDone: () => void) {
  await supabase.rpc('duplicate_pdf_template', { p_template: template.id, p_name: `${template.name} (copie)` });
  onDone();
}

async function deleteTemplate(templateId: string, onDone: () => void) {
  await supabase.rpc('delete_pdf_template', { p_template: templateId });
  onDone();
}

function CreateTemplateModal({
  organizationId,
  kind,
  onClose,
  onCreated,
}: {
  organizationId: string;
  kind: PdfTemplateKind;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim() || saving) return;
    setSaving(true);
    await supabase.rpc('create_pdf_template', {
      p_org: organizationId,
      p_kind: kind,
      p_base_layout: 'classic',
      p_name: name.trim(),
    });
    setSaving(false);
    onCreated();
    onClose();
  }

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouveau modèle</Text>
            <Pressable hitSlop={8} onPress={onClose}>
              <Feather name="x" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Field
              label="Nom du modèle"
              value={name}
              onChangeText={setName}
              placeholder={kind === 'devis' ? 'Ex : Devis rénovation' : 'Ex : Rapport visite client'}
            />
            <Button
              title="Créer"
              icon="check"
              onPress={handleCreate}
              loading={saving}
              disabled={!name.trim()}
              style={{ marginTop: spacing.lg }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function EditTemplateModal({
  kind,
  template,
  onClose,
  onSaved,
}: {
  kind: PdfTemplateKind;
  template: PdfTemplateRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(template.name);
  const [colorOverride, setColorOverride] = useState(template.brand_color_override ?? '');
  const [placementOverride, setPlacementOverride] = useState<LogoPlacement | null>(template.logo_placement_override);
  const [footerOverride, setFooterOverride] = useState(template.footer_text_override ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || saving) return;
    setSaving(true);
    const validColor = HEX_COLOR_RE.test(colorOverride.trim());
    await supabase.rpc('update_pdf_template', {
      p_template: template.id,
      p_name: name.trim(),
      p_brand_color_override: validColor ? colorOverride.trim() : null,
      p_logo_placement_override: placementOverride,
      p_footer_text_override: footerOverride.trim() || null,
    });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Modifier le modèle</Text>
            <Pressable hitSlop={8} onPress={onClose}>
              <Feather name="x" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Field label="Nom du modèle" value={name} onChangeText={setName} />

            <View style={styles.overrideHeaderRow}>
              <Text style={styles.fieldLabel}>Couleur (remplace le kit de marque)</Text>
              {colorOverride ? (
                <Pressable onPress={() => setColorOverride('')}>
                  <Text style={styles.resetLink}>Utiliser le kit de marque</Text>
                </Pressable>
              ) : null}
            </View>
            <View style={styles.colorRow}>
              {BRAND_COLOR_PRESETS.map((hex) => (
                <Pressable
                  key={hex}
                  onPress={() => setColorOverride(hex)}
                  style={[styles.colorSwatch, { backgroundColor: hex }, colorOverride.toLowerCase() === hex.toLowerCase() && styles.colorSwatchActive]}
                >
                  {colorOverride.toLowerCase() === hex.toLowerCase() ? <Feather name="check" size={14} color={colors.surface} /> : null}
                </Pressable>
              ))}
            </View>
            <Field label="Couleur personnalisée (hex)" value={colorOverride} onChangeText={setColorOverride} autoCapitalize="none" placeholder="Hérite du kit de marque" />

            {kind === 'report' ? (
              <>
                <View style={styles.overrideHeaderRow}>
                  <Text style={styles.fieldLabel}>Placement du logo</Text>
                  {placementOverride ? (
                    <Pressable onPress={() => setPlacementOverride(null)}>
                      <Text style={styles.resetLink}>Utiliser le kit de marque</Text>
                    </Pressable>
                  ) : null}
                </View>
                <View style={styles.placementRow}>
                  {LOGO_PLACEMENTS.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => setPlacementOverride(p.id)}
                      style={[styles.placementChip, placementOverride === p.id && styles.chipActive]}
                    >
                      <Feather name={p.icon} size={14} color={placementOverride === p.id ? colors.primary : colors.textMuted} />
                      <Text style={[styles.chipText, placementOverride === p.id && styles.chipTextActive]}>{p.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            <Field
              label="Pied de page (remplace le kit de marque)"
              value={footerOverride}
              onChangeText={setFooterOverride}
              placeholder="Hérite du kit de marque"
            />

            <Button title="Enregistrer" icon="check" onPress={handleSave} loading={saving} disabled={!name.trim()} style={{ marginTop: spacing.lg }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const swatch = StyleSheet.create({
  base: {
    width: '100%',
    aspectRatio: 1.3,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  band: {
    height: '32%',
    width: '100%',
  },
  bodyPad: {
    padding: 10,
    gap: 5,
  },
  bodyPadLarge: {
    padding: 14,
  },
  line: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  gridHeader: {
    height: 8,
    borderRadius: 2,
  },
  gridRow: {
    height: 8,
    borderRadius: 1,
    marginTop: 3,
  },
});

const styles = StyleSheet.create({
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  // The sizing constraints live on the Pressable (the actual flex item
  // inside `grid`), not on the Card it wraps — a View's flexGrow/flexBasis
  // only affects layout when applied to the flex child itself. flexBasis is
  // a percentage (not a fixed px width like 260) specifically so exactly two
  // cards ever share a row: a fixed 260px basis left room for three per row
  // on wide screens, so the 4th card (Structuré) wrapped alone onto its own
  // row and, with flexGrow, stretched to fill the entire row width — several
  // times bigger than its siblings. 48%+48%+gap always wraps after two,
  // keeping all four cards the same size everywhere (2-up on wide screens,
  // 1-up on narrow ones).
  cardWrap: {
    flexGrow: 1,
    flexBasis: '48%',
    minWidth: 220,
  },
  cardWrapCompact: {
    width: 120,
  },
  card: {
    flex: 1,
  },
  cardCompact: {
    padding: spacing.sm,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  preview: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  desc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  newCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  newCardText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  upsell: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  upsellTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  upsellText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  modalBody: {
    padding: spacing.lg,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  overrideHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  resetLink: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: colors.text,
  },
  placementRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  placementChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
