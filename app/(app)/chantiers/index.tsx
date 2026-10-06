import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';
import { supabase } from '../../../lib/supabase';
import { getSignedUrls } from '../../../lib/api/storage';
import { getFeedUnreadCounts } from '../../../lib/api/feed';
import { confirm } from '../../../lib/confirm';
import { Button, EmptyState, PageHeader, AppScreen, StatusBadge } from '../../../components/ui';
import { FolderList } from '../../../components/chantier/ProjectInfoForm';
import { compareReference, createFolder, deleteFolder, folderPath, folderWords, listFavorites, listFolders, moveProject, setFavorite, updateFolder } from '../../../lib/projectFolders';
import { useTranslation } from '../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../lib/theme';
import type { Project, ProjectFolder } from '../../../lib/types';

type Sort = 'number' | 'name' | 'recent';

// Where the user was, so coming back from a chantier lands in the same folder.
let lastFolder: string | null = null;
let lastSort: Sort = 'number';

// Chantiers filed like a file explorer: folders (« 2026 » › « Villas »),
// chantiers inside, a number per chantier, a star for the favourites.
export default function ChantiersListScreen() {
  const { t, i18n } = useTranslation();
  const fw = folderWords(i18n.language);
  const { organization, canCreateProjects } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ folder?: string }>();
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const [projects, setProjects] = useState<Project[]>([]);
  const [folders, setFolders] = useState<ProjectFolder[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('number');
  const [hideClosed, setHideClosed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // dialogs
  const [naming, setNaming] = useState<{ folder: ProjectFolder | null; name: string } | null>(null);
  const [menu, setMenu] = useState<ProjectFolder | null>(null);
  const [moving, setMoving] = useState<{ kind: 'project'; item: Project } | { kind: 'folder'; item: ProjectFolder } | null>(null);

  // after mount (keeps the first render identical to the server's)
  useEffect(() => {
    setCurrent(params.folder ? String(params.folder) : lastFolder);
    setSort(lastSort);
  }, [params.folder]);

  const open = (id: string | null) => {
    lastFolder = id;
    setCurrent(id);
    setQuery('');
  };

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [{ data }, f, favs] = await Promise.all([
      supabase.from('projects').select('*').eq('organization_id', organization.id).order('created_at', { ascending: false }),
      listFolders(organization.id),
      listFavorites(),
    ]);
    setProjects(data ?? []);
    setFolders(f);
    setFavorites(favs);
    const paths = (data ?? []).map((p) => p.cover_photo_url).filter((p): p is string => !!p);
    setCoverUrls(await getSignedUrls(paths));
    setUnreadCounts(await getFeedUnreadCounts(organization.id));
    setLoading(false);
  }, [organization]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // a folder deleted elsewhere: back to the top
  const here = current && folders.some((f) => f.id === current) ? current : null;
  const path = folderPath(folders, here);
  const q = query.trim().toLowerCase();

  const sorted = useCallback(
    (list: Project[]) =>
      [...list].sort((a, b) => {
        const fav = Number(favorites.has(b.id)) - Number(favorites.has(a.id));
        if (fav) return fav;
        if (sort === 'name') return a.name.localeCompare(b.name, 'fr', { numeric: true });
        if (sort === 'recent') return b.created_at.localeCompare(a.created_at);
        return compareReference(a, b);
      }),
    [favorites, sort],
  );

  const visible = (p: Project) => !hideClosed || p.status === 'active';
  const subFolders = useMemo(
    () => (q ? folders.filter((f) => f.name.toLowerCase().includes(q)) : folders.filter((f) => (f.parent_id ?? null) === here)).sort((a, b) => a.name.localeCompare(b.name, 'fr', { numeric: true })),
    [folders, here, q],
  );
  const shown = useMemo(() => {
    const list = q
      ? projects.filter((p) => [p.reference, p.name, p.client_name, p.address, p.contact_name].some((x) => x?.toLowerCase().includes(q)))
      : projects.filter((p) => (p.folder_id && folders.some((f) => f.id === p.folder_id) ? p.folder_id : null) === here);
    return sorted(list.filter(visible));
  }, [projects, folders, here, q, sorted, hideClosed]);

  const countIn = (id: string) => ({
    p: projects.filter((p) => p.folder_id === id).length,
    d: folders.filter((f) => f.parent_id === id).length,
  });

  async function toggleFavorite(p: Project) {
    const on = !favorites.has(p.id);
    setFavorites((s) => {
      const n = new Set(s);
      if (on) n.add(p.id);
      else n.delete(p.id);
      return n;
    });
    const { error: e } = await setFavorite(p.id, on);
    if (e) {
      setError(e);
      load();
    }
  }

  async function saveFolderName() {
    if (!naming || !organization || !naming.name.trim()) return;
    const { error: e } = naming.folder ? await updateFolder(naming.folder.id, { name: naming.name.trim() }) : await createFolder(organization.id, naming.name, here);
    setError(e);
    setNaming(null);
    load();
  }

  async function removeFolder(f: ProjectFolder) {
    setMenu(null);
    if (!(await confirm(t('explorer.deleteFolderTitle', { name: f.name }), t('explorer.deleteFolderBody', fw)))) return;
    const { error: e } = await deleteFolder(f);
    setError(e);
    load();
  }

  async function moveTo(target: string | null) {
    if (!moving) return;
    const { error: e } = moving.kind === 'project' ? await moveProject(moving.item.id, target) : await updateFolder(moving.item.id, { parent_id: target });
    setError(e);
    setMoving(null);
    load();
  }

  // a folder cannot go inside itself or one of its own sub-folders
  const blocked = useMemo(() => {
    if (moving?.kind !== 'folder') return undefined;
    const out = new Set<string>([moving.item.id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const f of folders) if (f.parent_id && out.has(f.parent_id) && !out.has(f.id)) (out.add(f.id), (grew = true));
    }
    return out;
  }, [moving, folders]);

  const pathOf = (p: Project) => folderPath(folders, p.folder_id).map((f) => f.name).join(' › ');

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={[styles.page, !wide && { padding: spacing.lg }]} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        <PageHeader title={t('chantiersList.title')} backTo="/(app)" />
        <Text style={styles.pageSubtitle}>{t('chantiersList.subtitle')}</Text>

        {/* breadcrumb */}
        <View style={styles.crumbs}>
          <Pressable onPress={() => open(null)} style={styles.crumb} hitSlop={4}>
            <Feather name="home" size={14} color={path.length ? colors.primary : colors.text} />
            <Text style={[styles.crumbText, !path.length && styles.crumbOn]}>{t('explorer.allProjects')}</Text>
          </Pressable>
          {path.map((f, i) => (
            <View key={f.id} style={styles.crumb}>
              <Feather name="chevron-right" size={14} color={colors.textMuted} />
              <Pressable onPress={() => open(f.id)} hitSlop={4}>
                <Text style={[styles.crumbText, i === path.length - 1 && styles.crumbOn]}>{f.name}</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* actions + search + sort */}
        <View style={styles.toolbar}>
          {canCreateProjects ? (
            <>
              <Button title={t('chantiersList.newProject')} icon="plus" onPress={() => router.push((here ? `/(app)/chantiers/new?folder=${here}` : '/(app)/chantiers/new') as never)} style={wide ? undefined : { flex: 1 }} />
              <Button title={t('explorer.newFolder', fw)} icon="folder-plus" variant="secondary" onPress={() => setNaming({ folder: null, name: '' })} style={wide ? undefined : { flex: 1 }} />
            </>
          ) : null}
          <View style={[styles.searchRow, wide ? { flex: 1, minWidth: 240 } : { width: '100%' }]}>
            <Feather name="search" size={16} color={colors.textMuted} />
            <TextInput style={styles.searchInput} value={query} onChangeText={setQuery} placeholder={t('explorer.search')} placeholderTextColor={colors.textMuted} />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={6}>
                <Feather name="x" size={16} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
          <View style={styles.seg}>
            {(['number', 'name', 'recent'] as Sort[]).map((k) => (
              <Pressable
                key={k}
                onPress={() => {
                  lastSort = k;
                  setSort(k);
                }}
                style={[styles.segItem, sort === k && styles.segOn]}
              >
                <Text style={[styles.segText, sort === k && styles.segTextOn]}>{t(k === 'number' ? 'explorer.sortNumber' : k === 'name' ? 'explorer.sortName' : 'explorer.sortRecent')}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => setHideClosed((v) => !v)} style={[styles.chip, hideClosed && styles.chipOn]}>
            <Feather name={hideClosed ? 'eye-off' : 'eye'} size={13} color={hideClosed ? colors.primary : colors.textMuted} />
            <Text style={[styles.chipText, hideClosed && { color: colors.primary }]}>{t('explorer.hideClosed')}</Text>
          </Pressable>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* folders */}
        {subFolders.length ? (
          <View style={styles.grid}>
            {subFolders.map((f) => {
              const n = countIn(f.id);
              return (
                <Pressable key={f.id} onPress={() => open(f.id)} style={({ hovered }: any) => [styles.folder, hovered && styles.folderHover]}>
                  <View style={styles.folderIcon}>
                    <Feather name="folder" size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.folderName} numberOfLines={1}>
                      {f.name}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {[t('explorer.projectsCount', { count: n.p }), n.d ? t('explorer.foldersCount', { count: n.d, ...fw }) : null].filter(Boolean).join(' · ')}
                      {q && f.parent_id ? ` · ${folderPath(folders, f.parent_id).map((x) => x.name).join(' › ')}` : ''}
                    </Text>
                  </View>
                  {canCreateProjects ? (
                    <Pressable onPress={() => setMenu(f)} hitSlop={8} style={styles.iconBtn} accessibilityLabel="…">
                      <Feather name="more-vertical" size={16} color={colors.textMuted} />
                    </Pressable>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {/* chantiers */}
        <View style={{ gap: spacing.sm }}>
          {shown.map((item) => {
            const fav = favorites.has(item.id);
            const where = q ? pathOf(item) : '';
            return (
              <Pressable key={item.id} onPress={() => router.push(`/(app)/chantiers/${item.id}`)} style={({ hovered }: any) => [styles.card, hovered && styles.folderHover]}>
                <Pressable onPress={() => toggleFavorite(item)} hitSlop={8} style={styles.star} accessibilityLabel={fav ? t('explorer.unfavorite') : t('explorer.favorite')}>
                  <FontAwesome name={fav ? 'star' : 'star-o'} size={18} color={fav ? '#E0A100' : colors.textMuted} />
                </Pressable>
                {!wide ? null : item.cover_photo_url && coverUrls[item.cover_photo_url] ? (
                  <Image source={{ uri: coverUrls[item.cover_photo_url] }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder]}>
                    <Feather name="layers" size={16} color={colors.textMuted} />
                  </View>
                )}
                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    {item.reference ? <Text style={styles.ref}>{item.reference}</Text> : null}
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={styles.meta} numberOfLines={1}>
                    {[item.client_name, item.address].filter(Boolean).join(' · ') || ' '}
                  </Text>
                  {where ? (
                    <Text style={[styles.meta, { color: colors.primary }]} numberOfLines={1}>
                      <Feather name="folder" size={11} /> {where}
                    </Text>
                  ) : null}
                </View>
                {wide ? <StatusBadge status={item.status} /> : null}
                {unreadCounts[item.id] ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{unreadCounts[item.id] > 9 ? '9+' : unreadCounts[item.id]}</Text>
                  </View>
                ) : null}
                {canCreateProjects ? (
                  <Pressable onPress={() => setMoving({ kind: 'project', item })} hitSlop={8} style={styles.iconBtn} accessibilityLabel={t('explorer.move')}>
                    <Feather name="folder" size={15} color={colors.textMuted} />
                  </Pressable>
                ) : null}
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </Pressable>
            );
          })}
        </View>

        {!loading && !shown.length && !subFolders.length ? (
          q ? (
            <EmptyState title={t('explorer.noResults')} subtitle="" />
          ) : here ? (
            <EmptyState title={t('explorer.emptyFolder', fw)} subtitle={t('explorer.emptyFolderHint')} />
          ) : (
            <EmptyState title={t('chantiersList.emptyTitle')} subtitle={t('chantiersList.emptySubtitle')} />
          )
        ) : null}
      </ScrollView>

      {/* new / rename folder */}
      <Modal visible={!!naming} transparent animationType="fade" onRequestClose={() => setNaming(null)}>
        <Pressable style={styles.backdrop} onPress={() => setNaming(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{naming?.folder ? t('explorer.rename') : t('explorer.newFolder', fw)}</Text>
            {!naming?.folder && path.length ? <Text style={styles.meta}>{path.map((f) => f.name).join(' › ')}</Text> : null}
            <Text style={styles.label}>{t('explorer.folderName', fw)}</Text>
            <TextInput
              value={naming?.name ?? ''}
              onChangeText={(name) => setNaming((n) => (n ? { ...n, name } : n))}
              placeholder={t('explorer.folderNamePlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoFocus
              maxLength={80}
              onSubmitEditing={saveFolderName}
            />
            <View style={styles.sheetActions}>
              <Button title={t('explorer.cancel')} variant="secondary" onPress={() => setNaming(null)} style={{ flex: 1 }} />
              <Button title={naming?.folder ? t('explorer.save') : t('explorer.create')} icon="check" onPress={saveFolderName} disabled={!naming?.name.trim()} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* folder menu */}
      <Modal visible={!!menu} transparent animationType="fade" onRequestClose={() => setMenu(null)}>
        <Pressable style={styles.backdrop} onPress={() => setMenu(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{menu?.name}</Text>
            {[
              { icon: 'edit-2' as const, label: t('explorer.rename'), on: () => menu && (setNaming({ folder: menu, name: menu.name }), setMenu(null)) },
              { icon: 'corner-up-right' as const, label: t('explorer.move'), on: () => menu && (setMoving({ kind: 'folder', item: menu }), setMenu(null)) },
              { icon: 'trash-2' as const, label: t('explorer.delete'), on: () => menu && removeFolder(menu), danger: true },
            ].map((a) => (
              <Pressable key={a.label} onPress={a.on} style={({ hovered }: any) => [styles.menuRow, hovered && { backgroundColor: colors.surfaceAlt }]}>
                <Feather name={a.icon} size={16} color={a.danger ? colors.danger : colors.text} />
                <Text style={[styles.menuText, a.danger && { color: colors.danger }]}>{a.label}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* move */}
      <Modal visible={!!moving} transparent animationType="fade" onRequestClose={() => setMoving(null)}>
        <Pressable style={styles.backdrop} onPress={() => setMoving(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{moving ? t('explorer.moveTitle', { name: moving.item.name }) : ''}</Text>
            {moving ? (
              <FolderList
                folders={folders}
                selected={moving.kind === 'project' ? moving.item.folder_id : moving.item.parent_id}
                onPick={moveTo}
                topLabel={t('explorer.topLevel', fw)}
                disabledIds={blocked}
              />
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { padding: spacing.xl, gap: spacing.md, width: '100%', maxWidth: 1100, alignSelf: 'center', paddingBottom: spacing.xxl * 2 },
  pageSubtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: -spacing.sm },
  crumbs: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  crumb: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  crumbText: { fontSize: fontSize.md, color: colors.primary, fontWeight: '600' },
  crumbOn: { color: colors.text, fontWeight: '800' },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: fontSize.md, color: colors.text, minWidth: 0 },
  seg: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 3 },
  segItem: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm },
  segOn: { backgroundColor: colors.surface },
  segText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  segTextOn: { color: colors.text, fontWeight: '800' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  error: { color: colors.danger, fontSize: fontSize.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  folder: { flexGrow: 1, flexBasis: 240, maxWidth: 360, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  folderHover: { borderColor: colors.primary },
  folderIcon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  folderName: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  iconBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  star: { width: 28, alignItems: 'center' },
  thumb: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, minWidth: 0, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ref: { fontSize: fontSize.xs, fontWeight: '800', color: colors.primary, backgroundColor: colors.primarySoft, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, fontVariant: ['tabular-nums'], overflow: 'hidden' },
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, flexShrink: 1 },
  meta: { fontSize: fontSize.sm, color: colors.textMuted },
  unreadBadge: { minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  unreadBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  backdrop: { flex: 1, backgroundColor: 'rgba(15, 20, 18, 0.5)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  sheet: { width: '100%', maxWidth: 440, backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, gap: spacing.sm },
  sheetTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  label: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500', marginTop: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 11, fontSize: fontSize.md, color: colors.text, backgroundColor: colors.bg },
  sheetActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.sm, paddingVertical: 12, borderRadius: radius.md },
  menuText: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
});
