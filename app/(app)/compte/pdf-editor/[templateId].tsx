import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { supabase } from '../../../../lib/supabase';
import { BRAND_COLOR_PRESETS } from '../../../../components/PdfTemplatePicker';
import { EmptyState, Field, LoadingScreen, PageHeader, Screen } from '../../../../components/ui';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';
import type { PdfBlock, PdfBlockBinding, PdfBlockStyle } from '../../../../lib/types';

// Bindings drawn via drawTextBlock (or, for 'notes', the flow-block text
// loop) — the ones where a text color / alignment actually changes
// anything in the rendered PDF. Image/table/divider bindings ignore these.
const COLOR_CAPABLE: PdfBlockBinding[] = ['org.name', 'org.contact', 'document.title', 'document.meta', 'notes', 'static'];
const ALIGN_CAPABLE: PdfBlockBinding[] = ['org.name', 'org.contact', 'document.title', 'document.meta', 'static'];
// 'notes'/'photos'/'items_table'/'totals' are drawn outside drawAnchoredBlock
// (as paginated "flow" content, see pdf-blocks.ts) and never read
// style.background/borderColor — hiding the controls here instead of
// showing a color that silently does nothing in the generated PDF.
const BACKGROUND_CAPABLE: PdfBlockBinding[] = [
  'logo',
  'signature',
  'org.name',
  'org.contact',
  'document.title',
  'document.meta',
  'static',
];

// Must match PAGE_WIDTH/PAGE_HEIGHT/MARGIN in supabase/functions/_shared/pdf-helpers.ts —
// block x/y/width/height are stored in these same PDF points, top-left/y-down, so what's
// dragged here lines up 1:1 with what generate-devis-pdf/generate-report-pdf render.
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const MIN_SIZE = 16;

// Purely visual guides (not stored, not enforced) helping an admin place
// header content near the top and footer content near the bottom of the
// same free canvas — see the "3 zones" framing raised in conversation.
// Blocks can still be dragged anywhere; these bands just orient the eye.
const HEADER_ZONE_H = 150;
const FOOTER_ZONE_H = 90;

// Three tiers instead of one hard cutoff — an iPad (portrait ~768-834pt,
// landscape ~1024pt) needs to actually work, only a phone doesn't:
// - < BLOCKED_WIDTH: refuse to render, ask for a bigger screen (phones).
// - < COMPACT_WIDTH: still the full editor, but the palette becomes a
//   horizontal strip and the inspector a bottom sheet, so the canvas isn't
//   squeezed by two fixed side columns on a narrower tablet screen.
// - >= COMPACT_WIDTH: Shopify-style 3 fixed columns side by side.
const BLOCKED_WIDTH = 640;
const COMPACT_WIDTH = 1080;

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
  const { width: windowWidth } = useWindowDimensions();
  const [template, setTemplate] = useState<TemplateRow | null>(null);
  const [blocks, setBlocks] = useState<PdfBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const toastOpacity = useSharedValue(0);

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

  const updateStyle = useCallback((id: string, patch: Partial<PdfBlockStyle>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, style: { ...b.style, ...patch } } : b)));
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
    if (!error) {
      setDirty(false);
      toastOpacity.value = withTiming(1, { duration: 150 });
      setTimeout(() => {
        toastOpacity.value = withTiming(0, { duration: 300 });
      }, 1400);
    }
  }

  function onCanvasLayout(e: LayoutChangeEvent) {
    setCanvasWidth(e.nativeEvent.layout.width);
  }

  const toastStyle = useAnimatedStyle(() => ({ opacity: toastOpacity.value }));

  if (loading) return <LoadingScreen />;
  if (!template) {
    return (
      <Screen>
        <EmptyState title="Modèle introuvable" />
      </Screen>
    );
  }

  const backTo = template.kind === 'report' ? '/(app)/compte/rapports' : '/(app)/compte/devis';

  if (windowWidth < BLOCKED_WIDTH) {
    return (
      <Screen>
        <PageHeader title={template.name} backTo={backTo} />
        <View style={styles.tooSmall}>
          <Feather name="monitor" size={40} color={colors.textMuted} />
          <Text style={styles.tooSmallTitle}>Écran trop petit pour l'éditeur</Text>
          <Text style={styles.tooSmallText}>
            L'éditeur de modèle a besoin de place pour afficher la palette d'outils, l'aperçu et les réglages.
            Ouvrez cette page sur une tablette ou un ordinateur.
          </Text>
        </View>
      </Screen>
    );
  }

  const compact = windowWidth < COMPACT_WIDTH;
  const scale = canvasWidth > 0 ? canvasWidth / PAGE_WIDTH : 0;
  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;
  const availableBindings = (Object.keys(BINDING_META) as PdfBlockBinding[]).filter((b) => BINDING_META[b].kinds.includes(template.kind));

  const saveButton = (
    <Pressable onPress={handleSave} disabled={saving || !dirty} hitSlop={8} style={[styles.saveBtn, !dirty && styles.saveBtnIdle]}>
      {saving ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="check" size={15} color="#fff" />}
      <Text style={styles.saveBtnText}>{dirty ? 'Enregistrer' : 'Enregistré'}</Text>
    </Pressable>
  );

  const canvas = (
    <View style={styles.canvasOuter} onLayout={onCanvasLayout}>
      {scale > 0 ? (
        <Pressable onPress={() => setSelectedId(null)} style={[styles.canvas, { width: PAGE_WIDTH * scale, height: PAGE_HEIGHT * scale }]}>
          <ZoneGuides scale={scale} />
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
  );

  return (
    <Screen>
      <PageHeader title={template.name} backTo={backTo} right={saveButton} />

      {compact ? (
        <>
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

          <ScrollView contentContainerStyle={styles.compactCanvasArea}>{canvas}</ScrollView>

          <Modal visible={!!selectedBlock} animationType="slide" transparent onRequestClose={() => setSelectedId(null)}>
            <View style={styles.modalOverlay}>
              <Pressable style={styles.modalBackdrop} onPress={() => setSelectedId(null)} />
              {selectedBlock ? (
                <View style={styles.modalSheet}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{BINDING_META[selectedBlock.binding].label}</Text>
                    <View style={styles.modalHeaderActions}>
                      <Pressable hitSlop={8} onPress={() => deleteBlock(selectedBlock.id)}>
                        <Feather name="trash-2" size={19} color={colors.danger} />
                      </Pressable>
                      <Pressable hitSlop={8} onPress={() => setSelectedId(null)}>
                        <Feather name="x" size={21} color={colors.textMuted} />
                      </Pressable>
                    </View>
                  </View>
                  <ScrollView contentContainerStyle={styles.modalBody}>
                    <InspectorBody block={selectedBlock} onUpdateBlock={updateBlock} onUpdateStyle={updateStyle} />
                  </ScrollView>
                </View>
              ) : null}
            </View>
          </Modal>
        </>
      ) : (
        <View style={styles.workspace}>
          <ScrollView style={styles.paletteColumn} contentContainerStyle={styles.paletteColumnContent}>
            <Text style={styles.columnTitle}>Blocs</Text>
            {availableBindings.map((binding) => {
              const meta = BINDING_META[binding];
              const used = meta.maxOne && blocks.some((b) => b.binding === binding);
              return (
                <Pressable
                  key={binding}
                  disabled={!!used}
                  onPress={() => addBlock(binding)}
                  style={[styles.paletteItem, used && styles.paletteItemDisabled]}
                >
                  <View style={styles.paletteItemIcon}>
                    <Feather name="plus" size={13} color={used ? colors.textMuted : colors.primary} />
                  </View>
                  <Text style={[styles.paletteItemText, used && styles.paletteItemTextDisabled]}>{meta.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView style={styles.canvasColumn} contentContainerStyle={styles.canvasColumnContent}>
            {canvas}
          </ScrollView>

          <ScrollView style={styles.inspectorColumn} contentContainerStyle={styles.inspectorColumnContent}>
            {!selectedBlock ? (
              <View style={styles.inspectorPlaceholder}>
                <Feather name="mouse-pointer" size={24} color={colors.textMuted} />
                <Text style={styles.inspectorPlaceholderText}>
                  Sélectionnez un bloc dans l'aperçu pour modifier son texte, sa taille, sa position et son style.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.inspectorHeader}>
                  <Text style={styles.columnTitle}>{BINDING_META[selectedBlock.binding].label}</Text>
                  <Pressable hitSlop={8} onPress={() => deleteBlock(selectedBlock.id)}>
                    <Feather name="trash-2" size={18} color={colors.danger} />
                  </Pressable>
                </View>
                <InspectorBody block={selectedBlock} onUpdateBlock={updateBlock} onUpdateStyle={updateStyle} />
              </>
            )}
          </ScrollView>
        </View>
      )}

      <Animated.View style={[styles.toast, toastStyle]} pointerEvents="none">
        <Feather name="check-circle" size={14} color="#fff" />
        <Text style={styles.toastText}>Enregistré</Text>
      </Animated.View>
    </Screen>
  );
}

// Shared between the desktop inspector column and the tablet bottom-sheet
// modal — same fields either way, just a different container around them.
function InspectorBody({
  block,
  onUpdateBlock,
  onUpdateStyle,
}: {
  block: PdfBlock;
  onUpdateBlock: (id: string, patch: Partial<PdfBlock>) => void;
  onUpdateStyle: (id: string, patch: Partial<PdfBlockStyle>) => void;
}) {
  return (
    <>
      {block.binding === 'static' ? (
        <Field
          label="Texte"
          value={block.text ?? ''}
          onChangeText={(t) => onUpdateBlock(block.id, { text: t })}
          multiline
          placeholder="Votre texte"
        />
      ) : null}

      <View style={styles.numRow}>
        <NumField label="X" value={block.x} onChange={(v) => onUpdateBlock(block.id, { x: v })} />
        <NumField label="Y" value={block.y} onChange={(v) => onUpdateBlock(block.id, { y: v })} />
      </View>
      <View style={styles.numRow}>
        <NumField label="Largeur" value={block.width} onChange={(v) => onUpdateBlock(block.id, { width: v })} />
        <NumField label="Hauteur" value={block.height} onChange={(v) => onUpdateBlock(block.id, { height: v })} />
      </View>

      {COLOR_CAPABLE.includes(block.binding) ? (
        <>
          <Text style={styles.fieldLabel}>Couleur du texte</Text>
          <ColorPickerRow value={block.style?.color} allowNone onChange={(hex) => onUpdateStyle(block.id, { color: hex ?? undefined })} />
        </>
      ) : null}

      {ALIGN_CAPABLE.includes(block.binding) ? (
        <>
          <Text style={styles.fieldLabel}>Alignement</Text>
          <View style={styles.alignRow}>
            {(
              [
                { id: 'left', icon: 'align-left' },
                { id: 'center', icon: 'align-center' },
                { id: 'right', icon: 'align-right' },
              ] as const
            ).map((a) => {
              const active = (block.style?.align ?? 'left') === a.id;
              return (
                <Pressable
                  key={a.id}
                  onPress={() => onUpdateStyle(block.id, { align: a.id })}
                  style={[styles.alignChip, active && styles.alignChipActive]}
                >
                  <Feather name={a.icon} size={15} color={active ? colors.primary : colors.textMuted} />
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      {BACKGROUND_CAPABLE.includes(block.binding) ? (
        <>
          <Text style={styles.fieldLabel}>Fond</Text>
          <ColorPickerRow value={block.style?.background} allowNone onChange={(hex) => onUpdateStyle(block.id, { background: hex })} />
          <Text style={styles.fieldLabel}>Bordure</Text>
          <ColorPickerRow value={block.style?.borderColor} allowNone onChange={(hex) => onUpdateStyle(block.id, { borderColor: hex })} />
        </>
      ) : null}
    </>
  );
}

// Visual-only header/body/footer bands — a block's stored x/y is unaffected
// by which band it visually falls in; this is purely a placement guide, not
// a data model (see the top-of-file comment on HEADER_ZONE_H/FOOTER_ZONE_H).
function ZoneGuides({ scale }: { scale: number }) {
  const headerY = HEADER_ZONE_H * scale;
  const footerY = (PAGE_HEIGHT - FOOTER_ZONE_H) * scale;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.zoneLine, { top: headerY }]} />
      <View style={[styles.zoneLine, { top: footerY }]} />
      <Text style={[styles.zoneLabel, { top: 4 }]}>EN-TÊTE</Text>
      <Text style={[styles.zoneLabel, { top: headerY + 4 }]}>CORPS</Text>
      <Text style={[styles.zoneLabel, { top: footerY + 4 }]}>PIED DE PAGE</Text>
    </View>
  );
}

function ColorPickerRow({
  value,
  onChange,
  allowNone,
}: {
  value: string | null | undefined;
  onChange: (hex: string | null) => void;
  allowNone?: boolean;
}) {
  return (
    <View style={styles.colorRow}>
      {allowNone ? (
        <Pressable
          onPress={() => onChange(null)}
          style={[styles.colorSwatch, styles.colorSwatchNone, !value && styles.colorSwatchActive]}
        >
          <Feather name="slash" size={13} color={colors.textMuted} />
        </Pressable>
      ) : null}
      {BRAND_COLOR_PRESETS.map((hex) => {
        const active = value?.toLowerCase() === hex.toLowerCase();
        return (
          <Pressable key={hex} onPress={() => onChange(hex)} style={[styles.colorSwatch, { backgroundColor: hex }, active && styles.colorSwatchActive]}>
            {active ? <Feather name="check" size={13} color="#fff" /> : null}
          </Pressable>
        );
      })}
    </View>
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
  tooSmall: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  tooSmallTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  tooSmallText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 380,
  },
  workspace: {
    flex: 1,
    flexDirection: 'row',
  },
  columnTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  paletteColumn: {
    width: 220,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surface,
  },
  paletteColumnContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  paletteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  paletteItemDisabled: {
    opacity: 0.4,
  },
  paletteItemIcon: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteItemText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  paletteItemTextDisabled: {
    color: colors.textMuted,
  },
  paletteRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.bg,
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
  compactCanvasArea: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  canvasColumn: {
    flex: 1,
  },
  canvasColumnContent: {
    padding: spacing.xxl,
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
    ...Platform.select({
      web: { boxShadow: '0 18px 40px -18px rgba(18,33,31,0.35)' },
      default: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 6,
      },
    }),
  },
  zoneLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    opacity: 0.5,
  },
  zoneLabel: {
    position: 'absolute',
    left: 6,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.accent,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 3,
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
  inspectorColumn: {
    width: 320,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    backgroundColor: colors.surface,
  },
  inspectorColumnContent: {
    padding: spacing.lg,
  },
  inspectorPlaceholder: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  inspectorPlaceholderText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  inspectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  numRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
  colorSwatchNone: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  colorSwatchActive: {
    borderColor: colors.text,
  },
  alignRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  alignChip: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  alignChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '85%',
    minHeight: '55%',
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
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  modalBody: {
    padding: spacing.lg,
  },
  toast: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  toastText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});
