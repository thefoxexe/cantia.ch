import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DateField } from '../../DateField';
import { filterEntries, ledgerCsv, periodPresets, summarize, type LedgerEntry, type LedgerFilter } from '../../../lib/admin/ledgerCalc';
import { listLedger } from '../../../lib/admin/ledgerApi';
import { downloadLedgerReport, type LedgerHolder } from '../../../lib/admin/ledgerPdf';
import { downloadText } from '../../../lib/api/closing';
import { colors, fontSize, spacing } from '../../../lib/theme';
import { Btn, chf, Chip, Field, kit, Sheet, swiss, todayIso } from './kit';

// Export: any period (quick choices or two dates), PDF report or CSV.
// Loads the period on its own, so it does not depend on what the page shows.
export function ExportDialog({ initialFrom, initialTo, filter, holder, onClose }: { initialFrom: string; initialTo: string; filter: LedgerFilter | null; holder: LedgerHolder; onClose: () => void }) {
  const presets = useMemo(() => periodPresets(todayIso()), []);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [useFilter, setUseFilter] = useState(false);
  const [rows, setRows] = useState<LedgerEntry[] | null>(null);
  const valid = !!from && !!to && from <= to;

  useEffect(() => {
    if (!valid) return;
    let alive = true;
    setRows(null);
    listLedger(from, to).then((r) => alive && setRows(r.rows));
    return () => {
      alive = false;
    };
  }, [from, to, valid]);

  const entries = useMemo(() => (rows ? filterEntries(rows, { ...(useFilter && filter ? filter : {}), from, to }) : []), [rows, useFilter, filter, from, to]);
  const s = useMemo(() => summarize(entries), [entries]);
  const active = presets.find((p) => p.from === from && p.to === to)?.key ?? null;
  const ready = valid && !!rows && entries.length > 0;

  return (
    <Sheet
      title="Exporter la comptabilité"
      onClose={onClose}
      footer={
        <>
          <Btn icon="grid" label="CSV" onPress={() => downloadText(ledgerCsv(entries), `journal-${from}-au-${to}.csv`)} disabled={!ready} grow />
          <Btn icon="file-text" label="Rapport PDF" variant="primary" onPress={() => downloadLedgerReport({ entries, from, to, holder, filtered: useFilter && !!filter })} disabled={!ready} grow />
        </>
      }
    >
      <Field label="Période">
        <View style={kit.row}>
          {presets.map((p) => (
            <Chip
              key={p.key}
              small
              label={p.label}
              active={active === p.key}
              onPress={() => {
                setFrom(p.from);
                setTo(p.to);
              }}
            />
          ))}
        </View>
      </Field>
      <View style={kit.row}>
        <View style={{ flexGrow: 1, flexBasis: 160, minWidth: 0 }}>
          <DateField label="Du" value={from} onChange={(v) => v && setFrom(v)} />
        </View>
        <View style={{ flexGrow: 1, flexBasis: 160, minWidth: 0 }}>
          <DateField label="Au" value={to} onChange={(v) => v && setTo(v)} />
        </View>
      </View>
      {!valid ? <Text style={{ color: colors.danger, fontSize: fontSize.sm }}>La date de fin doit être après la date de début.</Text> : null}

      {filter ? (
        <Pressable onPress={() => setUseFilter((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Feather name={useFilter ? 'check-square' : 'square'} size={16} color={colors.text} />
          <Text style={[kit.muted, { flex: 1 }]}>Appliquer aussi les filtres de la page (type, catégories, recherche)</Text>
        </Pressable>
      ) : null}

      <View style={[kit.card, { backgroundColor: colors.bg, gap: 6 }]}>
        {rows === null && valid ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Text style={kit.eyebrow}>
              {swiss(from)} → {swiss(to)} · {s.count} écriture(s)
            </Text>
            <View style={[kit.row, { justifyContent: 'space-between' }]}>
              <Text style={[kit.body, { color: colors.success, fontWeight: '700' }]}>Recettes {chf(s.income)}</Text>
              <Text style={[kit.body, { color: colors.danger, fontWeight: '700' }]}>Dépenses {chf(s.expenses)}</Text>
              <Text style={[kit.body, { fontWeight: '800' }]}>
                {s.profit >= 0 ? 'Bénéfice' : 'Perte'} {chf(s.profit)}
              </Text>
            </View>
            {s.missingReceipts ? <Text style={[kit.hint, { color: colors.danger }]}>{s.missingReceipts} dépense(s) sans justificatif sur cette période.</Text> : null}
          </>
        )}
      </View>
    </Sheet>
  );
}
