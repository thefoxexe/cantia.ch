import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { AppScreen, LoadingScreen } from '../../../../../components/ui';
import { Btn, Chip, Field, Sheet, kit, usePhone } from '../../../../../components/admin/ledger/kit';
import { NumberInput, TenderDetail } from '../../../../../components/tenders/TenderDetail';
import {
  addNode,
  canEditTenders,
  deleteNode,
  loadTender,
  setUnitPrice,
  setZoneLabel,
  updateBreakdown,
  updateNode,
  updatePosition,
  updateTender,
  type TenderBundle,
  createOfferDevis,
  loadPriceHistory,
  setPrices,
} from '../../../../../lib/tenders/api';
import { suggestPrices, type CatalogPrice, type HistoryPrice, type PriceSuggestion } from '../../../../../lib/tenders/pricing';
import { fetchCatalog } from '../../../../../lib/catalog';
import { exportTenderXlsx } from '../../../../../lib/tenders/export';
import { lineAmount, selectedQuantity, subtotalsByNode, tenderTotals } from '../../../../../lib/tenders/calc';
import { fill, useTenderCopy } from '../../../../../lib/tenders/copy';
import { formatChf, formatQuantity } from '../../../../../lib/tenders/numbers';
import { flattenTree, searchTree, sortOrderAfter, type FlatRow } from '../../../../../lib/tenders/tree';
import { UNIT_CHOICES, unitLabel } from '../../../../../lib/tenders/units';
import type { NodeType, PositionPrice, TenderNode, TenderPosition } from '../../../../../lib/tenders/types';
import { colors, fontSize, radius, spacing } from '../../../../../lib/theme';
import { displayType, monoType } from '../../../../../lib/marketingTheme';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
const STRUCTURE: NodeType[] = ['contract', 'chapter', 'section', 'subsection', 'article', 'subarticle'];

export default function TenderEditorScreen() {
  const c = useTenderCopy();
  const router = useRouter();
  const { phone } = usePhone();
  const { width } = useWindowDimensions();
  // The detail panel sits beside the table only when both fit comfortably.
  const sidePanel = (width >= 1024 ? width - 240 : width) >= 1200;
  const [view, setView] = useState<'positions' | 'tree'>('positions');
  const [filter, setFilter] = useState<'all' | 'noprice' | 'review' | 'gap'>('all');
  const priceInputs = useRef(new Map<string, TextInput | null>());
  const [history, setHistory] = useState<HistoryPrice[]>([]);
  const [catalog, setCatalog] = useState<CatalogPrice[]>([]);
  const [filling, setFilling] = useState(false);
  const [offering, setOffering] = useState(false);
  const { id: projectId, tenderId } = useLocalSearchParams<{ id: string; tenderId: string }>();
  const [bundle, setBundle] = useState<TenderBundle | null | undefined>(undefined);
  const [editable, setEditable] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [save, setSave] = useState<{ state: SaveState; error?: string }>({ state: 'idle' });
  const [adding, setAdding] = useState<null | 'section' | 'position'>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const pending = useRef(0);

  useEffect(() => {
    let alive = true;
    loadTender(tenderId).then(async ({ bundle: b }) => {
      if (!alive) return;
      setBundle(b);
      if (b) setEditable(await canEditTenders(b.tender.organization_id));
      if (b?.pricesVisible) {
        const [h, cat] = await Promise.all([loadPriceHistory(b.tender.id), fetchCatalog(b.tender.organization_id)]);
        if (!alive) return;
        setHistory(h);
        setCatalog(cat.map((x) => ({ description: x.description, unit: x.unit, unitPrice: x.unitPrice })));
      }
    });
    return () => {
      alive = false;
    };
  }, [tenderId]);

  // Every write goes through here: optimistic local update first, then the
  // database; the status pill shows « Enregistrement… » / « Enregistré ».
  const persist = useCallback(async (run: () => Promise<{ error: string | null }>) => {
    pending.current += 1;
    setSave({ state: 'saving' });
    const { error } = await run();
    pending.current -= 1;
    if (error) setSave({ state: 'error', error });
    else if (pending.current === 0) setSave({ state: 'saved' });
  }, []);

  const derived = useMemo(() => {
    if (!bundle) return null;
    const posByNode = new Map<string, TenderPosition>();
    for (const p of bundle.positions) posByNode.set(p.node_id, p);
    const priceByPos = new Map<string, PositionPrice>();
    for (const p of bundle.prices) priceByPos.set(p.position_id, p);
    const amounts = new Map<string, number | null>();
    let priced = 0;
    let noPrice = 0;
    let toReview = 0;
    for (const n of bundle.nodes) {
      if (n.needs_review) toReview += 1;
      const pos = posByNode.get(n.id);
      if (!pos) continue;
      const price = priceByPos.get(pos.id);
      const a = lineAmount(pos.quantity_selected, price?.unit_price ?? null, pos.excluded);
      amounts.set(n.id, a);
      if (!pos.excluded) {
        if (price?.unit_price != null) priced += 1;
        else noPrice += 1;
      }
    }
    const subtotals = subtotalsByNode(bundle.nodes, amounts);
    const totals = tenderTotals([...amounts.values()], bundle.tender);
    return { posByNode, priceByPos, amounts, subtotals, totals, priced, noPrice, toReview };
  }, [bundle]);

  const rows = useMemo<FlatRow<TenderNode>[]>(() => {
    if (!bundle || !derived) return [];
    const keep = searchTree(bundle.nodes, query, (n) => {
      const pos = derived.posByNode.get(n.id);
      return [n.is_reserved ? 'R' : '', n.can_chapter, n.display_reference, n.raw_number, n.position_path, n.title, n.description, pos?.unit].filter(Boolean).join(' ');
    });
    if (view === 'tree' && filter === 'all') return flattenTree(bundle.nodes, keep ? new Set() : collapsed, keep ?? undefined);
    // "Positions" view: chapters as headings, then only the lines to price.
    const passes = (n: TenderNode) => {
      const pos = derived.posByNode.get(n.id);
      if (!pos) return false;
      if (filter === 'noprice') return !pos.excluded && derived.priceByPos.get(pos.id)?.unit_price == null;
      if (filter === 'review') return n.needs_review;
      if (filter === 'gap') return pos.quantity_original != null && pos.quantity_selected != null && pos.quantity_selected !== pos.quantity_original;
      return true;
    };
    const out: FlatRow<TenderNode>[] = [];
    let heading: FlatRow<TenderNode> | null = null;
    for (const r of flattenTree(bundle.nodes, new Set(), keep ?? undefined)) {
      if (r.node.node_type === 'chapter' || (r.node.node_type === 'contract' && !bundle.nodes.some((x) => x.node_type === 'chapter'))) {
        heading = { node: r.node, level: 0, hasChildren: false };
        continue;
      }
      if (!passes(r.node)) continue;
      if (heading) {
        out.push(heading);
        heading = null;
      }
      out.push({ node: r.node, level: 1, hasChildren: false });
    }
    return out;
  }, [bundle, derived, query, collapsed, view, filter]);

  // Short context above a position: its nearest titled parents.
  const breadcrumbs = useMemo(() => {
    const map = new Map<string, string>();
    if (!bundle) return map;
    const byId = new Map(bundle.nodes.map((n) => [n.id, n]));
    for (const n of bundle.nodes) {
      if (n.node_type !== 'billable_position') continue;
      const parts: string[] = [];
      let cur = n.parent_id ? byId.get(n.parent_id) : undefined;
      while (cur && cur.node_type !== 'chapter' && cur.node_type !== 'contract' && parts.length < 2) {
        if (cur.title) parts.unshift(cur.title.replace(/\.$/, ''));
        cur = cur.parent_id ? byId.get(cur.parent_id) : undefined;
      }
      map.set(n.id, parts.join(' › '));
    }
    return map;
  }, [bundle]);

  if (bundle === undefined) {
    return (
      <AppScreen>
        <LoadingScreen />
      </AppScreen>
    );
  }
  if (!bundle || !derived) {
    return (
      <AppScreen>
        <View style={{ padding: spacing.xl, gap: spacing.md }}>
          <Text style={kit.body}>{c.notFound}</Text>
          <Btn label={c.back} icon="arrow-left" onPress={() => router.replace(`/(app)/chantiers/${projectId}/metre` as any)} />
        </View>
      </AppScreen>
    );
  }

  const { tender } = bundle;
  const selected = selectedId ? bundle.nodes.find((n) => n.id === selectedId) ?? null : null;
  const selectedPos = selected ? derived.posByNode.get(selected.id) ?? null : null;
  const billableCount = bundle.positions.length;

  // ---- local mutations -------------------------------------------------------
  const patchNodeLocal = (nodeId: string, patch: Partial<TenderNode>) =>
    setBundle((b) => (b ? { ...b, nodes: b.nodes.map((n) => (n.id === nodeId ? { ...n, ...patch } : n)) } : b));
  const patchPositionLocal = (posId: string, patch: Partial<TenderPosition>) =>
    setBundle((b) => {
      if (!b) return b;
      return {
        ...b,
        positions: b.positions.map((p) => {
          if (p.id !== posId) return p;
          const next = { ...p, ...patch };
          return { ...next, quantity_selected: selectedQuantity(next) };
        }),
      };
    });

  const onNode = (node: TenderNode, patch: Partial<TenderNode> & { validated_at?: string | null }) => {
    patchNodeLocal(node.id, patch);
    persist(() => updateNode(node.id, patch as any));
  };
  const onPosition = (pos: TenderPosition, patch: Partial<TenderPosition>) => {
    patchPositionLocal(pos.id, patch);
    persist(async () => {
      const { position, error } = await updatePosition(pos.id, patch as any);
      if (position) setBundle((b) => (b ? { ...b, positions: b.positions.map((p) => (p.id === position.id ? position : p)) } : b));
      return { error };
    });
  };
  const onPrice = (pos: TenderPosition, unitPrice: number | null, source: PositionPrice['price_source'] = 'manual') => {
    setBundle((b) => {
      if (!b) return b;
      const exists = b.prices.some((p) => p.position_id === pos.id);
      const base: PositionPrice = { position_id: pos.id, tender_id: tender.id, unit_price: unitPrice, price_source: source, document_unit_price: null, document_amount: null, amount: null };
      return { ...b, prices: exists ? b.prices.map((p) => (p.position_id === pos.id ? { ...p, unit_price: unitPrice, price_source: source } : p)) : [...b.prices, base] };
    });
    persist(async () => {
      const { price, error } = await setUnitPrice(tender.id, pos.id, unitPrice, source);
      if (price) setBundle((b) => (b ? { ...b, prices: b.prices.map((p) => (p.position_id === price.position_id ? price : p)) } : b));
      return { error };
    });
  };
  const onTender = (patch: Partial<typeof tender>) => {
    setBundle((b) => (b ? { ...b, tender: { ...b.tender, ...patch } } : b));
    persist(() => updateTender(tender.id, patch as any));
  };

  async function onAdd(kind: 'section' | 'position', title: string, reference: string, unit: string | null) {
    // Inside the selected chapter/section, or right after the selected position.
    let parentId: string | null = null;
    let after: TenderNode | null = null;
    if (selected) {
      if (STRUCTURE.includes(selected.node_type) && kind === 'position') parentId = selected.id;
      else {
        parentId = selected.parent_id;
        after = selected;
      }
    }
    const siblings = bundle!.nodes.filter((n) => n.parent_id === parentId);
    const parent = parentId ? bundle!.nodes.find((n) => n.id === parentId) : null;
    const { node, position, error } = await addNode(tender.id, {
      parentId,
      nodeType: kind === 'section' ? 'section' : 'billable_position',
      depth: parent ? parent.depth + 1 : 0,
      sortOrder: sortOrderAfter(siblings, after),
      title,
      reference: reference || null,
      unit,
    });
    if (error || !node) return error ?? 'Erreur';
    setBundle((b) => (b ? { ...b, nodes: [...b.nodes, node], positions: position ? [...b.positions, position] : b.positions } : b));
    if (parentId) setCollapsed((s) => new Set([...s].filter((x) => x !== parentId)));
    setSelectedId(node.id);
    setAdding(null);
    return null;
  }

  async function onDeleteNode(nodeId: string) {
    const ids = new Set([nodeId]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const n of bundle!.nodes) if (n.parent_id && ids.has(n.parent_id) && !ids.has(n.id)) (ids.add(n.id), (grew = true));
    }
    setBundle((b) => (b ? { ...b, nodes: b.nodes.filter((n) => !ids.has(n.id)), positions: b.positions.filter((p) => !ids.has(p.node_id)) } : b));
    setSelectedId(null);
    setConfirmDelete(null);
    persist(() => deleteNode(nodeId));
  }

  const toggle = (nodeId: string) => setCollapsed((s) => (s.has(nodeId) ? new Set([...s].filter((x) => x !== nodeId)) : new Set([...s, nodeId])));
  const collapseAll = () => setCollapsed(new Set(bundle.nodes.filter((n) => bundle.nodes.some((k) => k.parent_id === n.id)).map((n) => n.id)));

  const suggestionsFor = (n: TenderNode, pos: TenderPosition): PriceSuggestion[] =>
    suggestPrices({ text: n.description || n.title || '', unit: pos.unit, documentUnitPrice: derived.priceByPos.get(pos.id)?.document_unit_price ?? null }, history, catalog);

  const detail = selected ? (
    <TenderDetail
      c={c}
      tenderId={tender.id}
      node={selected}
      position={selectedPos}
      price={selectedPos ? derived.priceByPos.get(selectedPos.id) ?? null : null}
      breakdowns={selectedPos ? bundle.breakdowns.filter((b) => b.position_id === selectedPos.id) : []}
      zoneLabels={bundle.zoneLabels}
      editable={editable}
      pricesVisible={bundle.pricesVisible}
      onNode={(patch) => onNode(selected, patch)}
      onPosition={(patch) => selectedPos && onPosition(selectedPos, patch)}
      onPrice={(n, src) => selectedPos && onPrice(selectedPos, n, src ?? 'manual')}
      suggestions={selectedPos ? suggestionsFor(selected, selectedPos) : []}
      onBreakdown={(id, q) => {
        setBundle((b) => (b ? { ...b, breakdowns: b.breakdowns.map((x) => (x.id === id ? { ...x, quantity_manual: q } : x)) } : b));
        persist(() => updateBreakdown(id, { quantity_manual: q }));
      }}
      onZoneLabel={(code, label) => {
        setBundle((b) => (b ? { ...b, zoneLabels: [...b.zoneLabels.filter((z) => z.code !== code), { tender_id: tender.id, code, label, source: 'user' }] } : b));
        persist(() => setZoneLabel(tender.id, code, label || null));
      }}
      onDelete={() => setConfirmDelete(selected.id)}
    />
  ) : null;

  const showPrices = bundle.pricesVisible;

  return (
    <AppScreen>
      <View style={[styles.header, phone && { paddingHorizontal: spacing.lg }]}>
        <Pressable onPress={() => router.replace(`/(app)/chantiers/${projectId}/metre` as any)} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={18} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={kit.eyebrow} numberOfLines={1}>
            {[c.kinds[tender.kind], tender.cfc_code ? `CFC ${tender.cfc_code}` : null, tender.number].filter(Boolean).join(' · ')}
          </Text>
          <TitleInput value={tender.name} editable={editable} onCommit={(name) => onTender({ name })} small={phone} />
        </View>
        <SavePill state={save.state} c={c} />
        {!editable ? <Chip small label={c.readOnly} active={false} icon="lock" onPress={() => {}} /> : null}
      </View>
      {save.state === 'error' ? <Text style={[styles.error, { paddingHorizontal: spacing.xl }]}>{fill(c.saveFailed, { error: save.error ?? '' })}</Text> : null}

      <ScrollView horizontal={phone} showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={[styles.stats, phone && { paddingHorizontal: spacing.lg, flexWrap: 'nowrap' }]}>
        <Stat value={billableCount} label={c.statPositions} />
        {showPrices ? <Stat value={derived.priced} label={c.statPriced} tone="ok" /> : null}
        {showPrices ? <Stat value={derived.noPrice} label={c.statNoPrice} tone={derived.noPrice ? 'warn' : undefined} /> : null}
        <Stat value={derived.toReview} label={c.statToReview} tone={derived.toReview ? 'bad' : undefined} />
        {showPrices ? (
          <View style={styles.totalStat}>
            <Text style={kit.eyebrow}>{c.statTotal}</Text>
            <Text style={styles.totalValue}>CHF {formatChf(derived.totals.net)}</Text>
          </View>
        ) : null}
      </ScrollView>

      {showPrices && billableCount ? (
        <View style={[styles.actionsRow, phone && { paddingHorizontal: spacing.lg }]}>
          {editable && derived.noPrice ? <Btn label={c.fillPrices} icon="zap" onPress={() => setFilling(true)} /> : null}
          {Platform.OS === 'web' ? <Btn label={c.exportXlsx} icon="download" onPress={() => exportTenderXlsx(bundle)} /> : null}
          {tender.devis_id ? <Btn label={c.openDevis} icon="file-text" onPress={() => router.push(`/(app)/devis/${tender.devis_id}` as any)} /> : null}
          {editable ? <Btn label={c.createDevis} icon="send" variant="primary" onPress={() => setOffering(true)} /> : null}
        </View>
      ) : null}

      <View style={[styles.toolbar, phone && { paddingHorizontal: spacing.lg }]}>
        <View style={styles.search}>
          <Feather name="search" size={15} color={colors.textMuted} />
          <TextInput style={styles.searchInput} value={query} onChangeText={setQuery} placeholder={c.search} placeholderTextColor={colors.textMuted} />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Feather name="x" size={15} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
        {editable ? <Btn label={c.addSection} icon="folder-plus" onPress={() => setAdding('section')} /> : null}
        {editable ? <Btn label={c.addPosition} icon="plus" variant="primary" onPress={() => setAdding('position')} /> : null}
      </View>
      <View style={[styles.filters, phone && { paddingHorizontal: spacing.lg }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, alignItems: 'center' }}>
          <Chip small label={c.filterPositions} icon="list" active={view === 'positions' && filter === 'all'} onPress={() => (setView('positions'), setFilter('all'))} />
          <Chip small label={c.filterTree} icon="git-merge" active={view === 'tree' && filter === 'all'} onPress={() => (setView('tree'), setFilter('all'))} />
          <View style={styles.filterSep} />
          {showPrices ? <Chip small label={`${c.filterNoPrice} · ${derived.noPrice}`} active={filter === 'noprice'} onPress={() => setFilter(filter === 'noprice' ? 'all' : 'noprice')} /> : null}
          <Chip small label={`${c.filterReview} · ${derived.toReview}`} active={filter === 'review'} onPress={() => setFilter(filter === 'review' ? 'all' : 'review')} />
          <Chip small label={c.filterGap} active={filter === 'gap'} onPress={() => setFilter(filter === 'gap' ? 'all' : 'gap')} />
          {view === 'tree' && filter === 'all' && !phone ? <Btn label={c.expandAll} icon="chevrons-down" variant="ghost" onPress={() => setCollapsed(new Set())} /> : null}
          {view === 'tree' && filter === 'all' && !phone ? <Btn label={c.collapseAll} icon="chevrons-up" variant="ghost" onPress={collapseAll} /> : null}
        </ScrollView>
      </View>

      <View style={styles.body}>
        <View style={{ flex: 1, minWidth: 0 }}>
          {!phone ? <TableHeader c={c} showPrices={showPrices} /> : null}
          <FlatList
            data={rows}
            keyExtractor={(r) => r.node.id}
            initialNumToRender={40}
            windowSize={12}
            contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
            ListEmptyComponent={<Text style={[kit.muted, { padding: spacing.xl }]}>{c.noPosition}</Text>}
            renderItem={({ item }) => (
              <Row
                row={item}
                c={c}
                phone={phone}
                selected={item.node.id === selectedId}
                collapsed={collapsed.has(item.node.id)}
                position={derived.posByNode.get(item.node.id) ?? null}
                price={(() => {
                  const p = derived.posByNode.get(item.node.id);
                  return p ? derived.priceByPos.get(p.id) ?? null : null;
                })()}
                amount={derived.amounts.get(item.node.id) ?? null}
                subtotal={derived.subtotals.get(item.node.id) ?? null}
                showPrices={showPrices}
                editable={editable}
                onToggle={() => toggle(item.node.id)}
                onSelect={() => setSelectedId(item.node.id === selectedId ? null : item.node.id)}
                onPrice={(n) => {
                  const p = derived.posByNode.get(item.node.id);
                  if (p) onPrice(p, n);
                }}
                breadcrumb={view === 'positions' || filter !== 'all' ? breadcrumbs.get(item.node.id) ?? '' : ''}
                flat={view === 'positions' || filter !== 'all'}
                priceRef={(r) => priceInputs.current.set(item.node.id, r)}
                onPriceNext={() => {
                  const ids = rows.filter((x) => derived.posByNode.has(x.node.id)).map((x) => x.node.id);
                  const next = ids[ids.indexOf(item.node.id) + 1];
                  if (next) priceInputs.current.get(next)?.focus();
                }}
              />
            )}
            ListFooterComponent={showPrices && billableCount ? <Totals c={c} totals={derived.totals} tender={tender} editable={editable} onTender={onTender} /> : null}
          />
        </View>
        {sidePanel && selected ? (
          <View style={styles.side}>
            <View style={styles.sideHead}>
              <Text style={kit.cardTitle}>{selectedPos ? c.colPosition : c.colDescription}</Text>
              <Pressable onPress={() => setSelectedId(null)} hitSlop={10} style={kit.close}>
                <Feather name="x" size={16} color={colors.textMuted} />
              </Pressable>
            </View>
            <FlatList data={[0]} keyExtractor={() => 'd'} renderItem={() => <View style={{ padding: spacing.lg }}>{detail}</View>} />
          </View>
        ) : null}
      </View>

      {!sidePanel && selected ? (
        <Sheet title={selectedPos ? c.colPosition : c.colDescription} onClose={() => setSelectedId(null)}>
          {detail}
        </Sheet>
      ) : null}

      {filling ? (
        <FillPricesSheet
          c={c}
          candidates={bundle.positions
            .filter((p) => !p.excluded && derived.priceByPos.get(p.id)?.unit_price == null)
            .map((p) => {
              const n = bundle.nodes.find((x) => x.id === p.node_id)!;
              const best = suggestionsFor(n, p).find((sg) => sg.source !== 'history_average');
              return best ? { position: p, node: n, suggestion: best } : null;
            })
            .filter(Boolean) as FillCandidate[]}
          onClose={() => setFilling(false)}
          onApply={async (rows) => {
            setBundle((b) => {
              if (!b) return b;
              const map = new Map(b.prices.map((x) => [x.position_id, x]));
              for (const r of rows) map.set(r.positionId, { ...(map.get(r.positionId) ?? { position_id: r.positionId, tender_id: tender.id, document_unit_price: null, document_amount: null, amount: null }), unit_price: r.unitPrice, price_source: r.source });
              return { ...b, prices: [...map.values()] };
            });
            setFilling(false);
            persist(async () => {
              const { prices, error } = await setPrices(tender.id, rows);
              if (prices.length) setBundle((b) => (b ? { ...b, prices: b.prices.map((x) => prices.find((y) => y.position_id === x.position_id) ?? x) } : b));
              return { error };
            });
          }}
        />
      ) : null}

      {offering ? (
        <OfferSheet
          c={c}
          tender={tender}
          count={bundle.positions.filter((p) => !p.excluded).length}
          net={derived.totals.net}
          onClose={() => setOffering(false)}
          onCreate={async (clientName, includeUnpriced) => {
            const { devisId, error } = await createOfferDevis(tender.id, { clientName, includeUnpriced });
            if (error && !devisId) return error;
            setOffering(false);
            if (devisId) router.push(`/(app)/devis/${devisId}` as any);
            return null;
          }}
        />
      ) : null}

      {adding ? <AddSheet kind={adding} c={c} onClose={() => setAdding(null)} onAdd={onAdd} /> : null}

      {confirmDelete ? (
        <Sheet
          title={c.deleteNode}
          onClose={() => setConfirmDelete(null)}
          footer={
            <>
              <Btn label={c.cancel} onPress={() => setConfirmDelete(null)} grow />
              <Btn label={c.confirmDelete} icon="trash-2" variant="bad" onPress={() => onDeleteNode(confirmDelete)} grow />
            </>
          }
        >
          <Text style={kit.body}>{c.deleteNodeConfirm}</Text>
        </Sheet>
      ) : null}
    </AppScreen>
  );
}

interface FillCandidate {
  position: TenderPosition;
  node: TenderNode;
  suggestion: PriceSuggestion;
}

function FillPricesSheet({ c, candidates, onClose, onApply }: { c: ReturnType<typeof useTenderCopy>; candidates: FillCandidate[]; onClose: () => void; onApply: (rows: { positionId: string; unitPrice: number; source: NonNullable<PositionPrice['price_source']> }[]) => void }) {
  const [picked, setPicked] = useState<Set<string>>(new Set(candidates.map((x) => x.position.id)));
  const toggle = (id: string) => setPicked((s) => (s.has(id) ? new Set([...s].filter((x) => x !== id)) : new Set([...s, id])));
  return (
    <Sheet
      title={c.fillTitle}
      onClose={onClose}
      footer={
        <>
          <Btn label={c.cancel} onPress={onClose} grow />
          <Btn
            label={fill(c.fillApply, { n: picked.size })}
            icon="check"
            variant="primary"
            disabled={!picked.size}
            onPress={() => onApply(candidates.filter((x) => picked.has(x.position.id)).map((x) => ({ positionId: x.position.id, unitPrice: x.suggestion.unitPrice, source: x.suggestion.source })))}
            grow
          />
        </>
      }
    >
      {candidates.length ? (
        <>
          <Text style={kit.body}>{fill(c.fillIntro, { n: candidates.length })}</Text>
          <View style={kit.row}>
            <Btn label={c.fillAll} variant="ghost" onPress={() => setPicked(new Set(candidates.map((x) => x.position.id)))} />
            <Btn label={c.fillNoneSel} variant="ghost" onPress={() => setPicked(new Set())} />
          </View>
          {candidates.map((x) => (
            <Pressable key={x.position.id} onPress={() => toggle(x.position.id)} style={styles.fillRow}>
              <Feather name={picked.has(x.position.id) ? 'check-square' : 'square'} size={18} color={picked.has(x.position.id) ? colors.primary : colors.textMuted} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.refText}>{x.node.position_path ?? x.node.raw_number}</Text>
                <Text style={kit.body} numberOfLines={2}>
                  {(x.node.description || x.node.title || '').replace(/\s*\n\s*/g, ' ')}
                </Text>
                <Text style={kit.hint} numberOfLines={1}>
                  {c.suggestionLabels[x.suggestion.source]} · {x.suggestion.detail}
                </Text>
              </View>
              <Text style={styles.fillPrice}>
                {formatChf(x.suggestion.unitPrice)}
                <Text style={kit.hint}> /{unitLabel(x.position.unit)}</Text>
              </Text>
            </Pressable>
          ))}
        </>
      ) : (
        <Text style={kit.body}>{c.fillNone}</Text>
      )}
    </Sheet>
  );
}

function OfferSheet({ c, tender, count, net, onClose, onCreate }: { c: ReturnType<typeof useTenderCopy>; tender: TenderBundle['tender']; count: number; net: number; onClose: () => void; onCreate: (client: string, includeUnpriced: boolean) => Promise<string | null> }) {
  const [client, setClient] = useState('');
  const [unpriced, setUnpriced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <Sheet
      title={c.offerTitle}
      onClose={onClose}
      footer={
        <>
          <Btn label={c.cancel} onPress={onClose} grow />
          <Btn
            label={busy ? c.importing : c.createDevis}
            icon="send"
            variant="primary"
            disabled={busy}
            grow
            onPress={async () => {
              setBusy(true);
              const err = await onCreate(client, unpriced);
              setBusy(false);
              if (err) setError(err);
            }}
          />
        </>
      }
    >
      <Text style={kit.body}>{c.offerIntro}</Text>
      {tender.devis_id ? <Text style={[kit.hint, { color: '#9A6412' }]}>{c.offerExists}</Text> : null}
      <Field label={c.offerClient}>
        <TextInput style={kit.input} value={client} onChangeText={setClient} placeholder={tender.metadata?.owner ? String(tender.metadata.owner).split(',')[0] : ''} placeholderTextColor={colors.textMuted} />
      </Field>
      <Pressable onPress={() => setUnpriced((v) => !v)} style={styles.fillRow}>
        <Feather name={unpriced ? 'check-square' : 'square'} size={18} color={unpriced ? colors.primary : colors.textMuted} />
        <Text style={kit.body}>{c.offerUnpriced}</Text>
      </Pressable>
      <Text style={styles.fillPrice}>{fill(c.offerSummary, { n: count, total: formatChf(net) })}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Sheet>
  );
}

function TitleInput({ value, editable, onCommit, small }: { value: string; editable: boolean; onCommit: (s: string) => void; small?: boolean }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <TextInput
      style={[styles.title, small && { fontSize: 19 }]}
      value={text}
      editable={editable}
      onChangeText={setText}
      onBlur={() => text.trim() && text !== value && onCommit(text.trim())}
    />
  );
}

function SavePill({ state, c }: { state: SaveState; c: ReturnType<typeof useTenderCopy> }) {
  if (state === 'idle') return null;
  const saving = state === 'saving';
  const failed = state === 'error';
  return (
    <View style={[styles.pill, failed && { backgroundColor: colors.dangerSoft }]}>
      <Feather name={saving ? 'loader' : failed ? 'alert-circle' : 'check'} size={12} color={failed ? colors.danger : saving ? colors.textMuted : colors.success} />
      <Text style={[styles.pillText, failed && { color: colors.danger }]}>{saving ? c.saving : failed ? '!' : c.saved}</Text>
    </View>
  );
}

function Stat({ value, label, tone }: { value: number; label: string; tone?: 'ok' | 'warn' | 'bad' }) {
  const color = tone === 'ok' ? colors.success : tone === 'bad' ? colors.danger : tone === 'warn' ? '#B7791F' : colors.text;
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={kit.hint}>{label}</Text>
    </View>
  );
}

function TableHeader({ c, showPrices }: { c: ReturnType<typeof useTenderCopy>; showPrices: boolean }) {
  return (
    <View style={[styles.tr, styles.th]}>
      <Text style={[styles.thText, styles.cRef]}>{c.colPosition}</Text>
      <Text style={[styles.thText, { flex: 1, paddingLeft: 18 }]}>{c.colDescription}</Text>
      <Text style={[styles.thText, styles.cQty]}>{c.colOriginal}</Text>
      <Text style={[styles.thText, styles.cQty]}>{c.colSelected}</Text>
      <Text style={[styles.thText, styles.cUnit]}>{c.colUnit}</Text>
      {showPrices ? <Text style={[styles.thText, styles.cPrice]}>{c.colPrice}</Text> : null}
      {showPrices ? <Text style={[styles.thText, styles.cAmount]}>{c.colAmount}</Text> : null}
    </View>
  );
}

interface RowProps {
  row: FlatRow<TenderNode>;
  c: ReturnType<typeof useTenderCopy>;
  phone: boolean;
  selected: boolean;
  collapsed: boolean;
  position: TenderPosition | null;
  price: PositionPrice | null;
  amount: number | null;
  subtotal: number | null;
  showPrices: boolean;
  editable: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onPrice: (n: number | null) => void;
  breadcrumb: string;
  flat: boolean;
  priceRef: (r: TextInput | null) => void;
  onPriceNext: () => void;
}

function Row({ row, c, phone, selected, collapsed, position, price, amount, subtotal, showPrices, editable, onToggle, onSelect, onPrice, breadcrumb, flat, priceRef, onPriceNext }: RowProps) {
  const { node, level, hasChildren } = row;
  const indent = flat ? 0 : Math.min(level, 6) * (phone ? 12 : 16);
  // The chapter is already the heading: show the local reference only.
  const ref = node.node_type === 'chapter' ? `CAN ${node.raw_number ?? ''}` : node.position_path ?? node.raw_number ?? node.display_reference ?? '';
  const text = position ? (node.description || node.title || '').replace(/\s*\n\s*/g, ' ') : node.title || node.description;
  const isStructure = !position && STRUCTURE.includes(node.node_type);
  const isFinancial = ['carry_forward', 'subtotal', 'chapter_total', 'financial_adjustment'].includes(node.node_type);
  const differs = position && position.quantity_selected_source !== 'original' && position.quantity_original != null && position.quantity_selected !== position.quantity_original;

  const chevron = hasChildren ? (
    <Pressable onPress={onToggle} hitSlop={8} style={styles.chevron}>
      <Feather name={collapsed ? 'chevron-right' : 'chevron-down'} size={15} color={colors.textMuted} />
    </Pressable>
  ) : (
    <View style={styles.chevron} />
  );

  const refView = (
    <View style={[styles.refWrap, !phone && styles.cRef]}>
      {node.is_reserved ? <Text style={styles.r}>R</Text> : null}
      <Text style={[styles.refText, isStructure && { fontWeight: '800' }]} numberOfLines={1}>
        {ref}
      </Text>
    </View>
  );

  if (phone) {
    return (
      <Pressable onPress={onSelect} style={[styles.mRow, { paddingLeft: spacing.lg + indent }, selected && styles.rowSelected, isStructure && level === 0 && styles.chapterRow]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {chevron}
          {refView}
          {node.needs_review ? <Feather name="alert-triangle" size={13} color={colors.danger} /> : null}
          {isStructure && showPrices && subtotal ? <Text style={[styles.mono, { marginLeft: 'auto' }]}>{formatChf(subtotal)}</Text> : null}
        </View>
        {breadcrumb ? (
          <Text style={styles.crumb} numberOfLines={1}>
            {breadcrumb}
          </Text>
        ) : null}
        <Text style={[styles.desc, isStructure && styles.descStructure, isFinancial && styles.descFinancial, position?.excluded && styles.strike]} numberOfLines={position ? 3 : 2}>
          {text}
        </Text>
        {position ? (
          <View style={styles.mLine}>
            <Text style={styles.mono}>
              {position.quantity_selected == null ? '—' : formatQuantity(position.quantity_selected)} {unitLabel(position.unit)}
              {differs ? <Text style={styles.diffDot}> ●</Text> : null}
            </Text>
            {showPrices ? <Text style={styles.monoMuted}>{price?.unit_price != null ? `× ${formatChf(price.unit_price)}` : ''}</Text> : null}
            {showPrices ? <Text style={[styles.mono, { marginLeft: 'auto', fontWeight: '800' }]}>{amount == null ? '—' : formatChf(amount)}</Text> : null}
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onSelect} style={[styles.tr, selected && styles.rowSelected, isStructure && level === 0 && styles.chapterRow]}>
      {refView}
      <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: indent }}>
        {flat ? null : chevron}
        {node.needs_review ? <Feather name="alert-triangle" size={13} color={colors.danger} /> : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          {breadcrumb ? (
            <Text style={styles.crumb} numberOfLines={1}>
              {breadcrumb}
            </Text>
          ) : null}
          <Text style={[styles.desc, isStructure && styles.descStructure, isFinancial && styles.descFinancial, position?.excluded && styles.strike]} numberOfLines={position ? 2 : 1}>
            {text}
          </Text>
        </View>
      </View>
      {position ? (
        <>
          <Text style={[styles.mono, styles.cQty, { color: colors.textMuted }]}>{position.quantity_original == null ? '' : formatQuantity(position.quantity_original)}</Text>
          <Text style={[styles.mono, styles.cQty, differs && { color: colors.primaryDark, fontWeight: '800' }]}>
            {position.quantity_selected == null ? '—' : formatQuantity(position.quantity_selected)}
          </Text>
          <Text style={[styles.monoMuted, styles.cUnit]}>{unitLabel(position.unit) || c.noUnit}</Text>
          {showPrices ? (
            <View style={styles.cPrice}>
              {editable ? (
                <NumberInput value={price?.unit_price ?? null} editable onCommit={onPrice} style={styles.inlinePrice} placeholder={c.colPrice} inputRef={priceRef} onSubmitNext={onPriceNext} />
              ) : (
                <Text style={[styles.mono, { textAlign: 'right' }]}>{price?.unit_price == null ? '' : formatChf(price.unit_price)}</Text>
              )}
            </View>
          ) : null}
          {showPrices ? <Text style={[styles.mono, styles.cAmount, { fontWeight: '700' }]}>{amount == null ? '' : formatChf(amount)}</Text> : null}
        </>
      ) : (
        <>
          <View style={styles.cQty} />
          <View style={styles.cQty} />
          <View style={styles.cUnit} />
          {showPrices ? <View style={styles.cPrice} /> : null}
          {showPrices ? <Text style={[styles.mono, styles.cAmount, { color: colors.textMuted, fontWeight: '700' }]}>{isStructure && subtotal ? formatChf(subtotal) : ''}</Text> : null}
        </>
      )}
    </Pressable>
  );
}

function Totals({ c, totals, tender, editable, onTender }: { c: ReturnType<typeof useTenderCopy>; totals: ReturnType<typeof tenderTotals>; tender: TenderBundle['tender']; editable: boolean; onTender: (p: any) => void }) {
  const line = (label: string, value: number, pct?: { key: 'discount_percent' | 'escompte_percent' | 'vat_rate'; value: number }, strong?: boolean) => (
    <View style={styles.totLine}>
      <Text style={[kit.body, strong && { fontWeight: '800' }]}>{label}</Text>
      {pct ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <NumberInput value={pct.value} editable={editable} onCommit={(n) => onTender({ [pct.key]: n ?? 0 })} style={{ width: 70, paddingVertical: 5 }} />
          <Text style={kit.hint}>%</Text>
        </View>
      ) : null}
      <Text style={[styles.mono, { marginLeft: 'auto', minWidth: 120, textAlign: 'right' }, strong && { fontWeight: '800', fontSize: 16 }]}>{formatChf(value)}</Text>
    </View>
  );
  return (
    <View style={styles.totals}>
      <Text style={kit.eyebrow}>{c.totals}</Text>
      {line(c.brut, totals.brut)}
      {line(c.discount, -totals.discount, { key: 'discount_percent', value: tender.discount_percent })}
      {line(c.subtotal1, totals.subtotal1)}
      {line(c.escompte, -totals.escompte, { key: 'escompte_percent', value: tender.escompte_percent })}
      {line(c.subtotal2, totals.subtotal2)}
      {line(c.vat, totals.vat, { key: 'vat_rate', value: tender.vat_rate })}
      {line(c.net, totals.net, undefined, true)}
    </View>
  );
}

function AddSheet({ kind, c, onClose, onAdd }: { kind: 'section' | 'position'; c: ReturnType<typeof useTenderCopy>; onClose: () => void; onAdd: (k: 'section' | 'position', title: string, ref: string, unit: string | null) => Promise<string | null> }) {
  const [title, setTitle] = useState('');
  const [ref, setRef] = useState('');
  const [unit, setUnit] = useState<string | null>(kind === 'position' ? 'm2' : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    const err = await onAdd(kind, title.trim(), ref.trim(), unit);
    setBusy(false);
    if (err) setError(err);
  };
  return (
    <Sheet
      title={kind === 'section' ? c.addSectionTitle : c.addPositionTitle}
      onClose={onClose}
      footer={
        <>
          <Btn label={c.cancel} onPress={onClose} grow />
          <Btn label={c.create} icon="check" variant="primary" onPress={submit} disabled={busy || !title.trim()} grow />
        </>
      }
    >
      <View style={[kit.row, { alignItems: 'flex-start' }]}>
        <View style={{ width: 140 }}>
          <Field label={c.reference}>
            <TextInput style={[kit.input, { ...monoType }]} value={ref} onChangeText={setRef} placeholder="121.111" placeholderTextColor={colors.textMuted} />
          </Field>
        </View>
        <Field label={c.title} half>
          <TextInput style={kit.input} value={title} onChangeText={setTitle} autoFocus onSubmitEditing={submit} />
        </Field>
      </View>
      {kind === 'position' ? (
        <Field label={c.unit}>
          <View style={kit.row}>
            {UNIT_CHOICES.map((u) => (
              <Chip key={u} small label={unitLabel(u)} active={unit === u} onPress={() => setUnit(u)} />
            ))}
          </View>
        </Field>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  title: { ...displayType, fontSize: 24, fontWeight: '800', color: colors.text, paddingVertical: 2, minWidth: 0 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt },
  pillText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  stat: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minWidth: 84 },
  statValue: { ...displayType, fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  totalStat: { marginLeft: 'auto', alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.lg, backgroundColor: colors.text },
  totalValue: { ...displayType, fontSize: 20, fontWeight: '800', color: '#fff', fontVariant: ['tabular-nums'] },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  fillRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  fillPrice: { ...monoType, fontSize: 14, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  filters: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  filterSep: { width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: 4 },
  crumb: { fontSize: 11.5, color: colors.textMuted, marginBottom: 1 },
  toolbar: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, flexGrow: 1, flexBasis: 240, minWidth: 0, paddingHorizontal: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, minHeight: 42 },
  searchInput: { flex: 1, fontSize: fontSize.sm, color: colors.text, paddingVertical: 10, minWidth: 0 },
  body: { flex: 1, flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  side: { width: 420, borderLeftWidth: 1, borderLeftColor: colors.border, backgroundColor: colors.surface },
  sideHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  tr: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: 6, minHeight: 44, borderBottomWidth: 1, borderBottomColor: colors.border },
  th: { backgroundColor: colors.bg, minHeight: 34 },
  thText: { ...monoType, fontSize: 10.5, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted },
  chapterRow: { backgroundColor: colors.bg },
  rowSelected: { backgroundColor: colors.primarySoft },
  chevron: { width: 18, alignItems: 'center' },
  cRef: { width: 104 },
  cQty: { width: 78, textAlign: 'right' },
  cUnit: { width: 44 },
  cPrice: { width: 96 },
  cAmount: { width: 104, textAlign: 'right' },
  refWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 0 },
  refText: { ...monoType, fontSize: 12.5, color: colors.text, flexShrink: 1 },
  r: { ...monoType, fontSize: 10, fontWeight: '800', color: '#fff', backgroundColor: colors.primary, paddingHorizontal: 4, borderRadius: 3, overflow: 'hidden' },
  desc: { fontSize: fontSize.sm, color: colors.text },
  descStructure: { fontWeight: '800' },
  descFinancial: { fontStyle: 'italic', color: colors.textMuted },
  strike: { textDecorationLine: 'line-through', color: colors.textMuted },
  mono: { ...monoType, fontSize: 13, color: colors.text, fontVariant: ['tabular-nums'] },
  monoMuted: { ...monoType, fontSize: 12.5, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  inlinePrice: { paddingVertical: 5, paddingHorizontal: 8, fontSize: 13 },
  diffDot: { color: colors.primary },
  mRow: { gap: 4, paddingVertical: 10, paddingRight: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  mLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingLeft: 24 },
  totals: { gap: 6, margin: spacing.lg, padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, maxWidth: 520, alignSelf: 'flex-end', width: '100%' },
  totLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 34 },
  error: { fontSize: fontSize.sm, color: colors.danger },
});
