import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Field } from '../ui';
import { DateField } from '../DateField';
import { useTranslation } from '../../lib/translations';
import { folderPath, folderTree, folderWords } from '../../lib/projectFolders';
import { colors, fontSize, radius, spacing } from '../../lib/theme';
import type { Client, ProjectFolder } from '../../lib/types';

export interface ProjectInfo {
  reference: string;
  name: string;
  folder_id: string | null;
  client_id: string | null;
  client_name: string;
  address: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  start_date: string | null;
  end_date: string | null;
  notes: string;
}

export const EMPTY_PROJECT_INFO: ProjectInfo = {
  reference: '',
  name: '',
  folder_id: null,
  client_id: null,
  client_name: '',
  address: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  start_date: null,
  end_date: null,
  notes: '',
};

// The row to write: empty strings become null.
export function projectInfoRow(v: ProjectInfo) {
  const s = (x: string) => x.trim() || null;
  return {
    reference: s(v.reference),
    name: v.name.trim(),
    folder_id: v.folder_id,
    client_id: v.client_id,
    client_name: s(v.client_name),
    address: s(v.address),
    contact_name: s(v.contact_name),
    contact_phone: s(v.contact_phone),
    contact_email: s(v.contact_email),
    start_date: v.start_date,
    end_date: v.end_date,
    notes: s(v.notes),
  };
}

// Everything that describes a chantier — shared by « Nouveau chantier » and
// the chantier's settings.
export function ProjectInfoForm({
  value,
  onChange,
  folders,
  clients,
  suggestion,
  editable = true,
}: {
  value: ProjectInfo;
  onChange: (patch: Partial<ProjectInfo>) => void;
  folders: ProjectFolder[];
  clients: Client[];
  suggestion?: string;
  editable?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const fw = folderWords(i18n.language);
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [folderOpen, setFolderOpen] = useState(false);
  const [pickClient, setPickClient] = useState(false);
  const [q, setQ] = useState('');
  const linked = clients.find((c) => c.id === value.client_id) ?? null;
  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    return clients.filter((c) => !s || [c.name, c.company_name, c.address, c.email].some((x) => x?.toLowerCase().includes(s))).slice(0, 8);
  }, [clients, q]);
  const path = folderPath(folders, value.folder_id);

  const col = (children: React.ReactNode) => <View style={wide ? { flex: 1, minWidth: 0 } : null}>{children}</View>;
  const row = (...children: React.ReactNode[]) => <View style={wide ? styles.row : null}>{children.map((c, i) => <View key={i} style={wide ? { flex: 1, minWidth: 0 } : null}>{c}</View>)}</View>;

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('projectInfo.sectionId')}</Text>
        {row(
          <View>
            <Field
              label={t('projectInfo.referenceLabel')}
              value={value.reference}
              onChangeText={(reference) => onChange({ reference })}
              placeholder={suggestion}
              editable={editable}
              autoCapitalize="characters"
            />
            {suggestion && !value.reference && editable ? (
              <Pressable onPress={() => onChange({ reference: suggestion })} style={styles.suggest}>
                <Feather name="corner-down-left" size={12} color={colors.primary} />
                <Text style={styles.suggestText}>{suggestion}</Text>
              </Pressable>
            ) : null}
          </View>,
          <Field label={t('projectInfo.nameLabel')} value={value.name} onChangeText={(name) => onChange({ name })} placeholder={t('projectInfo.namePlaceholder')} editable={editable} />,
        )}
        <Text style={styles.hint}>{t('projectInfo.referenceHint')}</Text>
        <Text style={styles.label}>{t('projectInfo.folderLabel')}</Text>
        <Pressable disabled={!editable} onPress={() => setFolderOpen(true)} style={styles.select}>
          <Feather name="folder" size={16} color={colors.primary} />
          <Text style={[styles.selectText, !path.length && { color: colors.textMuted }]} numberOfLines={1}>
            {path.length ? path.map((f) => f.name).join(' › ') : t('explorer.topLevel', fw)}
          </Text>
          <Feather name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('projectInfo.sectionClient')}</Text>
        {linked ? (
          <View style={styles.linked}>
            <Feather name="user-check" size={16} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.selectText}>{linked.company_name || linked.name}</Text>
              <Text style={styles.hint}>{[t('projectInfo.clientLinked'), linked.phone, linked.email].filter(Boolean).join(' · ')}</Text>
            </View>
            {editable ? (
              <Pressable onPress={() => onChange({ client_id: null })} hitSlop={6}>
                <Text style={styles.link}>{t('projectInfo.unlink')}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <>
            <Field label={t('projectInfo.clientLabel')} value={value.client_name} onChangeText={(client_name) => onChange({ client_name })} placeholder={t('projectInfo.clientPlaceholder')} editable={editable} />
            {editable && clients.length ? (
              pickClient ? (
                <View style={styles.picker}>
                  <View style={styles.searchRow}>
                    <Feather name="search" size={15} color={colors.textMuted} />
                    <TextInput value={q} onChangeText={setQ} placeholder={t('projectInfo.searchContacts')} placeholderTextColor={colors.textMuted} style={styles.search} autoFocus />
                    <Pressable onPress={() => setPickClient(false)} hitSlop={6}>
                      <Feather name="x" size={16} color={colors.textMuted} />
                    </Pressable>
                  </View>
                  {matches.length ? (
                    matches.map((c) => (
                      <Pressable
                        key={c.id}
                        style={({ hovered }: any) => [styles.option, hovered && { backgroundColor: colors.surfaceAlt }]}
                        onPress={() => {
                          onChange({
                            client_id: c.id,
                            client_name: c.company_name || c.name,
                            address: value.address || c.address || '',
                          });
                          setPickClient(false);
                          setQ('');
                        }}
                      >
                        <Feather name={c.type === 'entreprise' ? 'briefcase' : 'user'} size={14} color={colors.textMuted} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.optionText} numberOfLines={1}>
                            {c.company_name || c.name}
                          </Text>
                          {c.address ? (
                            <Text style={styles.hint} numberOfLines={1}>
                              {c.address}
                            </Text>
                          ) : null}
                        </View>
                      </Pressable>
                    ))
                  ) : (
                    <Text style={[styles.hint, { padding: spacing.md }]}>{t('projectInfo.noContacts')}</Text>
                  )}
                </View>
              ) : (
                <Pressable onPress={() => setPickClient(true)} style={styles.suggest}>
                  <Feather name="book-open" size={13} color={colors.primary} />
                  <Text style={styles.suggestText}>{t('projectInfo.clientFromContacts')}</Text>
                </Pressable>
              )
            ) : null}
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('projectInfo.sectionPlace')}</Text>
        <Field label={t('projectInfo.addressLabel')} value={value.address} onChangeText={(address) => onChange({ address })} placeholder={t('projectInfo.addressPlaceholder')} editable={editable} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('projectInfo.sectionContact')}</Text>
        <Field label={t('projectInfo.contactName')} value={value.contact_name} onChangeText={(contact_name) => onChange({ contact_name })} placeholder={t('projectInfo.contactNamePlaceholder')} editable={editable} />
        {row(
          <Field label={t('projectInfo.contactPhone')} value={value.contact_phone} onChangeText={(contact_phone) => onChange({ contact_phone })} keyboardType="phone-pad" placeholder="+41 79 000 00 00" editable={editable} />,
          <Field label={t('projectInfo.contactEmail')} value={value.contact_email} onChangeText={(contact_email) => onChange({ contact_email })} keyboardType="email-address" autoCapitalize="none" editable={editable} />,
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('projectInfo.sectionDates')}</Text>
        <View style={styles.row}>
          {col(<DateField label={t('projectInfo.startDate')} value={value.start_date} onChange={(start_date) => onChange({ start_date })} />)}
          {col(<DateField label={t('projectInfo.endDate')} value={value.end_date} onChange={(end_date) => onChange({ end_date })} />)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('projectInfo.sectionNotes')}</Text>
        <Field
          label={t('projectInfo.notesLabel')}
          value={value.notes}
          onChangeText={(notes) => onChange({ notes })}
          placeholder={t('projectInfo.notesPlaceholder')}
          multiline
          style={{ minHeight: 90, textAlignVertical: 'top' }}
          editable={editable}
        />
      </View>

      <Modal visible={folderOpen} transparent animationType="fade" onRequestClose={() => setFolderOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setFolderOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{t('projectInfo.folderLabel')}</Text>
            <FolderList folders={folders} selected={value.folder_id} onPick={(id) => { onChange({ folder_id: id }); setFolderOpen(false); }} topLabel={t('explorer.topLevel', fw)} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// Tree of folders, the root first — used by this form and by « Déplacer ».
export function FolderList({ folders, selected, onPick, topLabel, disabledIds }: { folders: ProjectFolder[]; selected: string | null; onPick: (id: string | null) => void; topLabel: string; disabledIds?: Set<string> }) {
  const tree = folderTree(folders);
  const item = (id: string | null, name: string, depth: number) => {
    const on = selected === id;
    const off = !!id && !!disabledIds?.has(id);
    return (
      <Pressable key={id ?? 'root'} disabled={off} onPress={() => onPick(id)} style={({ hovered }: any) => [styles.option, { paddingLeft: spacing.md + depth * 18 }, hovered && { backgroundColor: colors.surfaceAlt }, on && { backgroundColor: colors.primarySoft }, off && { opacity: 0.4 }]}>
        <Feather name={id ? 'folder' : 'home'} size={15} color={on ? colors.primary : colors.textMuted} />
        <Text style={[styles.optionText, on && { color: colors.primary, fontWeight: '700' }]} numberOfLines={1}>
          {name}
        </Text>
        {on ? <Feather name="check" size={15} color={colors.primary} /> : null}
      </Pressable>
    );
  };
  return (
    <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ paddingBottom: spacing.sm }}>
      {item(null, topLabel, 0)}
      {tree.map(({ folder, depth }) => item(folder.id, folder.name, depth + 1))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: 2 },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  label: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.md, fontWeight: '500' },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16 },
  link: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700' },
  select: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 12, backgroundColor: colors.bg },
  selectText: { flex: 1, fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  suggest: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: -6, marginBottom: spacing.sm, paddingVertical: 4 },
  suggestText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700' },
  linked: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  picker: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  search: { flex: 1, paddingVertical: 10, fontSize: fontSize.md, color: colors.text },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 10 },
  optionText: { flex: 1, fontSize: fontSize.md, color: colors.text },
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 20, 18, 0.5)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  sheet: { width: '100%', maxWidth: 440, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.sm },
  sheetTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
});
