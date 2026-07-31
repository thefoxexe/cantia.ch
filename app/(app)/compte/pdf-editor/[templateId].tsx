import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { supabase } from '../../../../lib/supabase';
import { Button, Card, EmptyState, Field, LoadingScreen, PageHeader, Screen } from '../../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';
import type { PdfBlock, PdfBlockBinding } from '../../../../lib/types';

// Must match PAGE_WIDTH/PAGE_HEIGHT/MARGIN in supabase/functions/_shared/pdf-helpers.ts —
// block x/y/width/height are stored in these same PDF points, top-left/y-down, so what's
// dragged here lines up 1:1 with what generate-devis-pdf/generate-report-pdf render.
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const MIN_SIZE = 16;

interface BindingMeta {
  label: string;
  kinds: ('devis' | 'report')[];
  maxOne?: boolean;
  defaultSize: { width: number; height: number };
}

const BINDING_META: Record<PdfBlockBinding, BindingMeta> = {
  logo: { label: 'Logo', kinds: ['devis', 'report'], maxOne: true, defaultSize: { width: 100, height: 44 } },
  signature: { label: 'Signature', kinds: ['devis', 'report'], maxOne: true, defaultSize: { width: 150, height: 50 } },
  'org.name': { label: "Nom de l'entreprise", kinds: ['devis', 'report'], defaultSize: { width: 250, height: 20 } },
  'org.contact': { label: 'Coordonnées entreprise', kinds: ['devis', 'report'], defaultSize: { width: 250, height: 40 } },
  'document.title': { label: 'Titre du document', kinds: ['devis', 'report'], maxOne: true, defaultSize: { width: 300, height: 30 } },
  'document.meta': { label: 'Infos client / chantier', kinds: ['devis', 'report'], maxOne: true, defaultSize: { width: 300, height: 60 } },
  notes: { label: 'Notes', kinds: ['devis', 'report'], maxOne: true, defaultSize: { width: 511, height: 100 } },
  photos: { label: 'Grille photos', kinds: ['report'], maxOne: true, defaultSize: { width: 511, height: 300 } },
  items_table: { label: 'Tableau des lignes', kinds: ['devis'], maxOne: true, defaultSize: { width: 511, height: 300 } },
  totals: { label: 'Totaux', kinds: ['devis'], maxOne: true, defaultSize: { width: 223, height: 80 } },
  static: { label: 'Texte libre', kinds: ['devis', 'report'], defaultSize: { width: 250, height: 24 } },
  divider: { label: 'Séparateur', kinds: ['devis', 'report'], defaultSize: { width: 511, height: 1 } },
};

function clampBlock(b: PdfBlock): PdfBlock {
  const width = Math.max(MIN_SIZE, Math.min(PAGE_WIDTH, b.width));
  const height = Math.max(MIN_SIZE, Math.min(PAGE_HEIGHT, b.height));
  const x = Math.max(0, Math.min(PAGE_WIDTH - width, b.x));
  const y = Math.max(0, Math.min(PAGE_HEIGHT - height, b.y));
  return { ...b, x, y, width, height };
}

function newBlockId(): string {
  return `b_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

interface TemplateRow {
  id: string;
  organization_id: string;
  name: string;
  kind: 'devis' | 'report';
  layout_mode: 'preset' | 'custom';
}

export default function PdfEditorScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const [template, setTemplate] = useState<TemplateRow | null>(null);
  const [blocks, setBlocks] = useState<PdfBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(0);

  useEffect(() => {
    let active = true;
    supabase
      .from('pdf_templates')
      .select('id, organization_id, name, kind, layout_mode, blocks')
      .eq('id', templateId)
      .single()
      .then(({ data }) => {
        if (!active) return;
        if (data) {
          setTemplate({ id: data.id, organization_id: data.organization_id, name: data.name, kind: data.kind, layout_mode: data.layout_mode });
          setBlocks(Array.isArray(data.blocks) ? data.blocks : []);
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [templateId]);

  const updateBlock = useCallback((id: string, patch: Partial<PdfBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? clampBlock({ ...b, ...patch }) : b)));
    setDirty(true);
  }, []);

  function addBlock(binding: PdfBlockBinding) {
    const meta = BINDING_META[binding];
    const maxZ = blocks.reduce((m, b) => Math.max(m, b.z), 0);
    const offset = (blocks.length % 6) * 14;
    const block: PdfBlock = {
      id: newBlockId(),
      binding,
      x: MARGIN + offset,
      y: MARGIN + offset,
      width: meta.defaultSize.width,
      height: meta.defaultSize.height,
      z: maxZ + 1,
      ...(binding === 'divider' ? { style: { shapeKind: 'line' as const } } : {}),
      ...(binding === 'static' ? { text: 'Votre texte' } : {}),
    };
    setBlocks((prev) => [...prev, clampBlock(block)]);
    setSelectedId(block.id);
    setDirty(true);
  }

  function deleteBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
    setDirty(true);
  }

  async function handleSave() {
    if (!template || saving) return;
    setSaving(true);
    const { error } = await supabase.rpc('update_pdf_template_blocks', { p_template: template.id, p_blocks: blocks });
    setSaving(false);
    if (!error) setDirty(false);
  }

  function onCanvasLayout(e: LayoutChangeEvent) {
    setCanvasWidth(e.nativeEvent.layout.width);
  }

  if (loading) return <LoadingScreen />;
  if (!template) {
    return (
      <Screen>
        <EmptyState title="Modèle introuvable" />
      </Screen>
    );
  }

  const backTo = template.kind === 'report' ? '/(app)/compte/rapports' : '/(app)/compte/devis';
  const scale = canvasWidth > 0 ? canvasWidth / PAGE_WIDTH : 0;
  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;
  const availableBindings = (Object.keys(BINDING_META) as PdfBlockBinding[]).filter((b) => BINDING_META[b].kinds.includes(template.kind));

  return (
    <Screen>
      <PageHeader
        title={template.name}
        backTo={backTo}
        right={
          <Pressable onPress={handleSave} disabled={saving || !dirty} hitSlop={8} style={[styles.saveBtn, !dirty && styles.saveBtnIdle]}>
            {saving ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="check" size={15} color="#fff" />}
            <Text style={styles.saveBtnText}>{dirty ? 'Enregistrer' : 'Enregistré'}</Text>
          </Pressable>
        }
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paletteRow}>
        {availableBindings.map((binding) => {
          const meta = BINDING_META[binding];
          const used = meta.maxOne && blocks.some((b) => b.binding === binding);
          return (
            <Pressable
              key={binding}
              disabled={!!used}
              onPress={() => addBlock(binding)}
              style={[styles.paletteChip, used && styles.paletteChipDisabled]}
            >
              <Feather name="plus" size={13} color={used ? colors.textMuted : colors.primary} />
              <Text style={[styles.paletteChipText, used && styles.paletteChipTextDisabled]}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.canvasOuter} onLayout={onCanvasLayout}>
          {scale > 0 ? (
            <Pressable onPress={() => setSelectedId(null)} style={[styles.canvas, { width: PAGE_WIDTH * scale, height: PAGE_HEIGHT * scale }]}>
              {blocks
                .slice()
                .sort((a, b) => a.z - b.z)
                .map((b) => (
                  <EditableBlock
                    key={b.id}
                    block={b}
                    scale={scale}
                    selected={b.id === selectedId}
                    onSelect={() => setSelectedId(b.id)}
                    onChange={updateBlock}
                  />
                ))}
            </Pressable>
          ) : null}
        </View>

        {selectedBlock ? (
          <Card style={styles.inspector}>
            <View style={styles.inspectorHeader}>
              <Text style={styles.inspectorTitle}>{BINDING_META[selectedBlock.binding].label}</Text>
              <Pressable hitSlop={8} onPress={() => deleteBlock(selectedBlock.id)}>
                <Feather name="trash-2" size={18} color={colors.danger} />
              </Pressable>
            </View>
            {selectedBlock.binding === 'static' ? (
              <Field
                label="Texte"
                value={selectedBlock.text ?? ''}
                onChangeText={(t) => updateBlock(selectedBlock.id, { text: t })}
                multiline
                placeholder="Votre texte"
              />
            ) : null}
            <View style={styles.numRow}>
              <NumField label="X" value={selectedBlock.x} onChange={(v) => updateBlock(selectedBlock.id, { x: v })} />
              <NumField label="Y" value={selectedBlock.y} onChange={(v) => updateBlock(selectedBlock.id, { y: v })} />
            </View>
            <View style={styles.numRow}>
              <NumField label="Largeur" value={selectedBlock.width} onChange={(v) => updateBlock(selectedBlock.id, { width: v })} />
              <NumField label="Hauteur" value={selectedBlock.height} onChange={(v) => updateBlock(selectedBlock.id, { height: v })} />
            </View>
          </Card>
        ) : (
          <Text style={styles.hint}>
            Touchez un bloc pour le sélectionner : glissez pour le déplacer, tirez le coin en bas à droite pour le
            redimensionner. Ajoutez-en avec les boutons ci-dessus.
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(String(Math.round(value)));

  useEffect(() => {
    setText(String(Math.round(value)));
  }, [value]);

  return (
    <Field
      label={label}
      value={text}
      onChangeText={setText}
      keyboardType="numeric"
      style={{ flex: 1 }}
      onBlur={() => {
        const n = parseFloat(text.replace(',', '.'));
        if (!Number.isNaN(n)) onChange(Math.max(0, n));
        else setText(String(Math.round(value)));
      }}
    />
  );
}

function EditableBlock({
  block,
  scale,
  selected,
  onSelect,
  onChange,
}: {
  block: PdfBlock;
  scale: number;
  selected: boolean;
  onSelect: () => void;
  onChange: (id: string, patch: Partial<Pick<PdfBlock, 'x' | 'y' | 'width' | 'height'>>) => void;
}) {
  const x = useSharedValue(block.x);
  const y = useSharedValue(block.y);
  const width = useSharedValue(block.width);
  const height = useSharedValue(block.height);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startW = useSharedValue(0);
  const startH = useSharedValue(0);

  useEffect(() => {
    x.value = block.x;
    y.value = block.y;
    width.value = block.width;
    height.value = block.height;
  }, [block.x, block.y, block.width, block.height]);

  const commitMove = useCallback(() => onChange(block.id, { x: x.value, y: y.value }), [block.id, onChange]);
  const commitResize = useCallback(() => onChange(block.id, { width: width.value, height: height.value }), [block.id, onChange]);

  const resizeGesture = Gesture.Pan()
    .minDistance(0)
    .onStart(() => {
      startW.value = width.value;
      startH.value = height.value;
    })
    .onUpdate((e) => {
      width.value = Math.max(MIN_SIZE, Math.min(PAGE_WIDTH - x.value, startW.value + e.translationX / scale));
      height.value = Math.max(MIN_SIZE, Math.min(PAGE_HEIGHT - y.value, startH.value + e.translationY / scale));
    })
    .onEnd(() => {
      runOnJS(commitResize)();
    });

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .requireExternalGestureToFail(resizeGesture)
    .onStart(() => {
      startX.value = x.value;
      startY.value = y.value;
      runOnJS(onSelect)();
    })
    .onUpdate((e) => {
      x.value = Math.max(0, Math.min(PAGE_WIDTH - width.value, startX.value + e.translationX / scale));
      y.value = Math.max(0, Math.min(PAGE_HEIGHT - height.value, startY.value + e.translationY / scale));
    })
    .onEnd(() => {
      runOnJS(commitMove)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    left: x.value * scale,
    top: y.value * scale,
    width: width.value * scale,
    height: height.value * scale,
    zIndex: selected ? 9999 : block.z,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.block, animatedStyle, selected && styles.blockSelected]}>
        <View style={styles.blockLabelWrap} pointerEvents="none">
          <Text numberOfLines={2} style={styles.blockLabel}>
            {BINDING_META[block.binding].label}
          </Text>
        </View>
        {selected ? (
          <GestureDetector gesture={resizeGesture}>
            <View style={styles.handle} hitSlop={10} />
          </GestureDetector>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  saveBtnIdle: {
    backgroundColor: colors.textMuted,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  paletteRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  paletteChip: {
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
  paletteChipDisabled: {
    opacity: 0.4,
  },
  paletteChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  paletteChipTextDisabled: {
    color: colors.textMuted,
  },
  body: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    alignItems: 'center',
  },
  canvasOuter: {
    width: '100%',
    maxWidth: 700,
    alignItems: 'center',
  },
  canvas: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  block: {
    position: 'absolute',
    backgroundColor: 'rgba(31,61,58,0.08)',
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    padding: 4,
  },
  blockSelected: {
    borderStyle: 'solid',
    borderWidth: 2,
    backgroundColor: 'rgba(31,61,58,0.14)',
  },
  blockLabelWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  blockLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  handle: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
  },
  inspector: {
    width: '100%',
    maxWidth: 700,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  inspectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inspectorTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  numRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    maxWidth: 400,
  },
});
