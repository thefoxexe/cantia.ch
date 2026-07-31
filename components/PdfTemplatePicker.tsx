import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from './ui';
import { supabase } from '../lib/supabase';
import { colors, fontSize, radius, spacing } from '../lib/theme';

export type PdfTemplateKind = 'devis' | 'report';

interface PdfTemplateRow {
  id: string;
  name: string;
  base_layout: string;
  is_default: boolean;
}

const LAYOUT_DESCRIPTIONS: Record<string, string> = {
  classic: 'Sobre, en-tête discret, lignes fines.',
  moderne: 'Bandeau de couleur, titre marqué, mise en avant du kit de marque.',
  minimal: 'Beaucoup de blanc, typographie épurée.',
  structure: 'Sections encadrées, bandeaux de couleur, idéal si beaucoup de contenu.',
};

export function TemplateSwatch({ kind }: { kind: string }) {
  if (kind === 'moderne') {
    return (
      <View style={swatch.base}>
        <View style={[swatch.band, { backgroundColor: colors.primary }]} />
        <View style={swatch.bodyPad}>
          <View style={[swatch.line, { width: '60%' }]} />
          <View style={[swatch.line, { width: '40%' }]} />
        </View>
      </View>
    );
  }
  if (kind === 'minimal') {
    return (
      <View style={swatch.base}>
        <View style={swatch.bodyPadLarge}>
          <View style={[swatch.line, { width: '35%', height: 6, backgroundColor: colors.text }]} />
          <View style={{ height: 8 }} />
          <View style={[swatch.line, { width: '55%' }]} />
          <View style={[swatch.line, { width: '30%' }]} />
        </View>
      </View>
    );
  }
  if (kind === 'structure') {
    return (
      <View style={swatch.base}>
        <View style={swatch.bodyPad}>
          <View style={[swatch.gridHeader, { backgroundColor: colors.primary }]} />
          <View style={[swatch.gridRow, { backgroundColor: colors.surfaceAlt }]} />
          <View style={swatch.gridRow} />
          <View style={[swatch.gridRow, { backgroundColor: colors.surfaceAlt }]} />
        </View>
      </View>
    );
  }
  return (
    <View style={swatch.base}>
      <View style={swatch.bodyPad}>
        <View style={[swatch.line, { width: '45%' }]} />
        <View style={{ height: 6 }} />
        <View style={[swatch.line, { width: '70%' }]} />
        <View style={[swatch.line, { width: '50%' }]} />
      </View>
    </View>
  );
}

// Loads the org's real pdf_templates rows for the given kind (devis or
// report) instead of a hardcoded list — the same 4 base layouts exist for
// both kinds since Phase 2's backfill seeds all orgs identically, but which
// one is `is_default` can differ per kind and per org. Picking a card calls
// the set_default_pdf_template() RPC (admin-gated server-side) rather than
// writing directly to a column, since Phase 3 will add more than one row per
// base_layout (duplicates/custom templates) and this same picker needs to
// keep working once that's true.
export function PdfTemplatePicker({
  organizationId,
  kind,
  disabled,
  hasLogo,
  compact,
}: {
  organizationId: string;
  kind: PdfTemplateKind;
  disabled?: boolean;
  hasLogo?: boolean;
  compact?: boolean;
}) {
  const [templates, setTemplates] = useState<PdfTemplateRow[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('pdf_templates')
      .select('id, name, base_layout, is_default')
      .eq('organization_id', organizationId)
      .eq('kind', kind)
      .order('name', { ascending: true });
    setTemplates(data ?? []);
  }, [organizationId, kind]);

  useEffect(() => {
    load();
  }, [load]);

  async function selectTemplate(templateId: string) {
    const current = templates.find((t) => t.is_default);
    if (disabled || saving || current?.id === templateId) return;
    setSaving(true);
    setTemplates((prev) => prev.map((t) => ({ ...t, is_default: t.id === templateId })));
    await supabase.rpc('set_default_pdf_template', { p_org: organizationId, p_template: templateId, p_kind: kind });
    setSaving(false);
  }

  return (
    <View>
      {hasLogo === false ? (
        <View style={styles.warning}>
          <Feather name="alert-triangle" size={14} color={colors.accent} />
          <Text style={styles.warningText}>
            Aucun logo chargé — vos {kind === 'devis' ? 'devis' : 'rapports'} PDF partiront sans logo. Ajoutez-en un dans
            Compte → Profil entreprise.
          </Text>
        </View>
      ) : null}
      <View style={styles.grid}>
        {templates.map((t) => {
          const active = t.is_default;
          return (
            <Pressable
              key={t.id}
              onPress={() => selectTemplate(t.id)}
              disabled={disabled}
              style={compact ? styles.cardWrapCompact : styles.cardWrap}
            >
              <Card style={[styles.card, compact && styles.cardCompact, active && styles.cardActive]}>
                <View style={styles.preview}>
                  <TemplateSwatch kind={t.base_layout} />
                  {active ? (
                    <View style={styles.check}>
                      <Feather name="check" size={12} color={colors.surface} />
                    </View>
                  ) : null}
                </View>
                <Text style={styles.name}>{t.name}</Text>
                {!compact ? <Text style={styles.desc}>{LAYOUT_DESCRIPTIONS[t.base_layout] ?? ''}</Text> : null}
              </Card>
            </Pressable>
          );
        })}
      </View>
    </View>
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
});
