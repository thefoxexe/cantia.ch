import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { parseCsv, type ParsedCsv } from '../../../lib/csv';
import { importChantiers, importClients, type ImportKind } from '../../../lib/api/dataImport';
import { Button, Card, PageHeader, Screen } from '../../../components/ui';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';

interface FieldDef {
  key: string;
  labelKey: string;
  required: boolean;
}

const CLIENT_FIELDS: FieldDef[] = [
  { key: 'name', labelKey: 'dataImport.fieldName', required: true },
  { key: 'email', labelKey: 'dataImport.fieldEmail', required: false },
  { key: 'phone', labelKey: 'dataImport.fieldPhone', required: false },
  { key: 'address', labelKey: 'dataImport.fieldAddress', required: false },
];

const CHANTIER_FIELDS: FieldDef[] = [
  { key: 'name', labelKey: 'dataImport.fieldChantierName', required: true },
  { key: 'clientName', labelKey: 'dataImport.fieldClientName', required: false },
  { key: 'address', labelKey: 'dataImport.fieldAddress', required: false },
];

// Guesses a mapping from header text so the common case (a header already
// named "Nom"/"Name"/"Client"/"Adresse"…) needs zero manual clicks —
// still fully overridable below, this only saves the obvious cases.
function guessMapping(headers: string[], fields: FieldDef[]): Record<string, number | null> {
  const mapping: Record<string, number | null> = {};
  const normalized = headers.map((h) => h.trim().toLowerCase());
  const GUESSES: Record<string, string[]> = {
    name: ['nom', 'name', 'client', 'raison sociale'],
    clientName: ['client', 'nom du client', 'customer'],
    email: ['email', 'e-mail', 'courriel'],
    phone: ['telephone', 'téléphone', 'tel', 'phone', 'mobile'],
    address: ['adresse', 'address', 'rue'],
  };
  for (const field of fields) {
    const candidates = GUESSES[field.key] ?? [];
    const idx = normalized.findIndex((h) => candidates.some((c) => h.includes(c)));
    mapping[field.key] = idx === -1 ? null : idx;
  }
  return mapping;
}

export default function DataImportScreen() {
  const { t } = useTranslation();
  const { organization, user } = useAuth();
  const [kind, setKind] = useState<ImportKind>('clients');
  const [picking, setPicking] = useState(false);
  const [csv, setCsv] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<Record<string, number | null>>({});
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);

  const fields = kind === 'clients' ? CLIENT_FIELDS : CHANTIER_FIELDS;

  function reset() {
    setCsv(null);
    setMapping({});
    setResult(null);
    setError(null);
  }

  function changeKind(next: ImportKind) {
    setKind(next);
    reset();
  }

  async function handlePick() {
    setError(null);
    setResult(null);
    const picked = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'text/comma-separated-values', 'text/plain', '*/*'], copyToCacheDirectory: true });
    if (picked.canceled || !picked.assets?.length) return;
    setPicking(true);
    try {
      const text = await fetch(picked.assets[0].uri).then((r) => r.text());
      const parsed = parseCsv(text);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setError(t('dataImport.emptyFile'));
        return;
      }
      setCsv(parsed);
      setMapping(guessMapping(parsed.headers, kind === 'clients' ? CLIENT_FIELDS : CHANTIER_FIELDS));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dataImport.readError'));
    } finally {
      setPicking(false);
    }
  }

  function cell(row: string[], fieldKey: string): string {
    const idx = mapping[fieldKey];
    return idx == null || idx < 0 ? '' : (row[idx] ?? '');
  }

  async function handleImport() {
    if (!csv || !organization) return;
    const requiredField = fields.find((f) => f.required);
    if (requiredField && mapping[requiredField.key] == null) {
      setError(t('dataImport.mappingRequired', { field: t(requiredField.labelKey as any) }));
      return;
    }
    setImporting(true);
    setError(null);
    if (kind === 'clients') {
      const rows = csv.rows.map((r) => ({
        name: cell(r, 'name'),
        email: cell(r, 'email'),
        phone: cell(r, 'phone'),
        address: cell(r, 'address'),
      }));
      const res = await importClients(organization.id, user?.id, rows);
      setResult(res);
    } else {
      const rows = csv.rows.map((r) => ({
        name: cell(r, 'name'),
        clientName: cell(r, 'clientName'),
        address: cell(r, 'address'),
      }));
      const res = await importChantiers(organization.id, user?.id, rows);
      setResult(res);
    }
    setImporting(false);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
        <View style={styles.container}>
          <PageHeader title={t('dataImport.title')} backTo="/(app)/compte" />
          <Text style={styles.subtitle}>{t('dataImport.subtitle')}</Text>

          <View style={styles.kindRow}>
            <Pressable style={[styles.kindChip, kind === 'clients' && styles.kindChipActive]} onPress={() => changeKind('clients')}>
              <Text style={[styles.kindChipText, kind === 'clients' && styles.kindChipTextActive]}>{t('dataImport.kindClients')}</Text>
            </Pressable>
            <Pressable style={[styles.kindChip, kind === 'chantiers' && styles.kindChipActive]} onPress={() => changeKind('chantiers')}>
              <Text style={[styles.kindChipText, kind === 'chantiers' && styles.kindChipTextActive]}>{t('dataImport.kindChantiers')}</Text>
            </Pressable>
          </View>
          <Text style={styles.kindHint}>{kind === 'clients' ? t('dataImport.kindClientsHint') : t('dataImport.kindChantiersHint')}</Text>

          {!csv ? (
            <Card style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl, marginTop: spacing.lg }}>
              <Feather name="upload-cloud" size={28} color={colors.primary} />
              <Text style={styles.pickTitle}>{t('dataImport.pickTitle')}</Text>
              <Text style={styles.pickHint}>{t('dataImport.pickHint')}</Text>
              <Button title={t('dataImport.chooseFile')} icon="upload" onPress={handlePick} loading={picking} />
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </Card>
          ) : result ? (
            <Card style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl, marginTop: spacing.lg }}>
              <Feather name={result.imported > 0 ? 'check-circle' : 'alert-triangle'} size={28} color={result.imported > 0 ? colors.success : colors.warning} />
              <Text style={styles.pickTitle}>{t('dataImport.importedCount', { count: result.imported })}</Text>
              {result.errors.length > 0 ? (
                <View style={{ gap: 2 }}>
                  {result.errors.slice(0, 5).map((e, i) => (
                    <Text key={i} style={styles.error}>{e}</Text>
                  ))}
                </View>
              ) : null}
              <Button title={t('dataImport.importAnother')} variant="secondary" onPress={reset} style={{ marginTop: spacing.sm }} />
            </Card>
          ) : (
            <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
              <Card>
                <Text style={styles.sectionTitle}>{t('dataImport.mappingTitle')}</Text>
                <Text style={styles.sectionHint}>{t('dataImport.mappingHint')}</Text>
                <View style={{ gap: spacing.md }}>
                  {fields.map((field) => (
                    <View key={field.key} style={styles.mappingRow}>
                      <Text style={styles.mappingLabel}>
                        {t(field.labelKey as any)}
                        {field.required ? ' *' : ''}
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
                        <Pressable
                          style={[styles.headerChip, mapping[field.key] == null && styles.headerChipActive]}
                          onPress={() => setMapping((m) => ({ ...m, [field.key]: null }))}
                        >
                          <Text style={[styles.headerChipText, mapping[field.key] == null && styles.headerChipTextActive]}>{t('dataImport.noColumn')}</Text>
                        </Pressable>
                        {csv.headers.map((h, idx) => (
                          <Pressable
                            key={idx}
                            style={[styles.headerChip, mapping[field.key] === idx && styles.headerChipActive]}
                            onPress={() => setMapping((m) => ({ ...m, [field.key]: idx }))}
                          >
                            <Text style={[styles.headerChipText, mapping[field.key] === idx && styles.headerChipTextActive]} numberOfLines={1}>
                              {h || `#${idx + 1}`}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  ))}
                </View>
              </Card>

              <Card>
                <Text style={styles.sectionTitle}>{t('dataImport.previewTitle', { count: csv.rows.length })}</Text>
                <View style={{ gap: spacing.xs }}>
                  {csv.rows.slice(0, 5).map((row, i) => (
                    <View key={i} style={styles.previewRow}>
                      {fields.map((field) => (
                        <Text key={field.key} style={styles.previewCell} numberOfLines={1}>
                          {cell(row, field.key) || '—'}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              </Card>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button title={t('dataImport.importButton', { count: csv.rows.length })} onPress={handleImport} loading={importing} />
              <Button title={t('dataImport.cancel')} variant="secondary" onPress={reset} />
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  kindRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  kindChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kindChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  kindChipText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
  },
  kindChipTextActive: {
    color: colors.primary,
  },
  kindHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 17,
  },
  pickTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  pickHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 17,
  },
  mappingRow: {
    gap: spacing.xs,
  },
  mappingLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  headerChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 180,
  },
  headerChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  headerChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  headerChipTextActive: {
    color: colors.primary,
  },
  previewRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewCell: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
  },
});
