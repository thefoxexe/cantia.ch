import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../../lib/auth-context';
import { supabase } from '../../../../lib/supabase';
import { uploadToOrgBucket } from '../../../../lib/api/storage';
import { assetFileInfo, normalizeImageOrientation } from '../../../../lib/imageAsset';
import { generateReportPdf } from '../../../../lib/api/pdf';
import { polishReportNotes } from '../../../../lib/api/ai';
import { captureLocation, exifCoords, exifTakenAt } from '../../../../lib/geo';
import { useDictation } from '../../../../lib/useDictation';
import { fetchCatalog, findMatches, type CatalogEntry, type CatalogMatch } from '../../../../lib/catalog';
import { Button, Field, PageHeader, Screen } from '../../../../components/ui';
import { useTranslation } from '../../../../lib/translations';
import { colors, fontSize, radius, spacing } from '../../../../lib/theme';

interface PendingPhoto {
  id: string;
  uri: string;
  mimeType: string | null;
  caption: string;
  latitude: number | null;
  longitude: number | null;
  takenAt: string;
}

export default function NewReportScreen() {
  const { t } = useTranslation();
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { organization, user } = useAuth();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string | null>(null);

  // Notes present before dictation started, so the live transcript is
  // appended rather than overwriting anything already typed.
  const notesBaseRef = useRef('');
  const dictation = useDictation((sessionTranscript) => {
    const base = notesBaseRef.current;
    setNotes(base + (base && sessionTranscript ? ' ' : '') + sessionTranscript);
  });

  // Same catalog as the devis screen — reused here so a phrase like "tuyau
  // PVC" typed or dictated into a report's notes surfaces the price it's
  // usually billed at, without the writer having to leave the report to
  // look it up.
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  useEffect(() => {
    if (!organization) return;
    fetchCatalog(organization.id).then(setCatalog);
  }, [organization]);

  // Notes are free-flowing prose, not one description per line like a devis
  // — matching the whole text against the catalog would dilute the score
  // past anything meaningful. Instead, match only the fragment since the
  // last sentence/clause break, i.e. whatever the writer is currently in
  // the middle of typing.
  const notesFragmentStart = Math.max(notes.lastIndexOf('\n'), notes.lastIndexOf('.'), notes.lastIndexOf(','));
  const notesFragment = notes.slice(notesFragmentStart + 1).trim();
  const catalogMatches = useMemo(() => findMatches(catalog, notesFragment), [catalog, notesFragment]);

  function applyCatalogMatch(match: CatalogMatch) {
    const before = notes.slice(0, notesFragmentStart + 1);
    const prefix = before && !/\s$/.test(before) ? `${before} ` : before;
    setNotes(`${prefix}${match.description} (CHF ${match.unitPrice.toFixed(2)}/${match.unit})`);
  }

  async function toggleDictation() {
    if (dictation.listening) {
      await dictation.stop();
      return;
    }
    notesBaseRef.current = notes;
    const started = await dictation.start('fr-FR');
    if (!started) {
      Alert.alert(t('newReport.micPermissionTitle'), t('newReport.micPermission'));
    }
  }

  async function addFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('newReport.micPermissionTitle'), t('newReport.cameraPermission'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets![0];
    const id = `${Date.now()}-${Math.random()}`;
    // Adding the photo to the list shouldn't wait on a GPS fix, which can
    // take several seconds — show it right away and fill in coordinates
    // once captureLocation() resolves.
    setPhotos((prev) => [
      ...prev,
      { id, uri: asset.uri, mimeType: asset.mimeType ?? null, caption: '', latitude: null, longitude: null, takenAt: new Date().toISOString() },
    ]);
    captureLocation().then((coords) => {
      setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...coords } : p)));
    });
  }

  async function addFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('newReport.micPermissionTitle'), t('newReport.galleryPermission'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsMultipleSelection: true, exif: true });
    if (result.canceled || !result.assets?.length) return;
    const added = result.assets.map((a) => ({
      id: `${Date.now()}-${Math.random()}`,
      uri: a.uri,
      mimeType: a.mimeType ?? null,
      caption: '',
      ...exifCoords(a.exif),
      takenAt: exifTakenAt(a.exif),
    }));
    setPhotos((prev) => [...prev, ...added]);
  }

  function updateCaption(index: number, caption: string) {
    setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, caption } : p)));
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!organization) return;
    if (!title.trim()) {
      setError(t('newReport.titleRequired'));
      return;
    }
    setError(null);
    setLoading(true);

    try {
      setStep(t('newReport.savingReport'));
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert({
          organization_id: organization.id,
          project_id: projectId,
          title: title.trim(),
          notes: notes.trim() || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (reportError || !report) throw new Error(reportError?.message ?? t('newReport.createFailed'));

      for (let i = 0; i < photos.length; i++) {
        setStep(t('newReport.sendingPhoto', { current: i + 1, total: photos.length }));
        const p = photos[i];
        const raw = assetFileInfo(p);
        const { uri, ext, contentType } = await normalizeImageOrientation(p.uri, raw.contentType);
        const subPath = `reports/${report.id}/photos/${Date.now()}-${i}.${ext}`;
        const { path } = await uploadToOrgBucket(organization.id, subPath, uri, contentType);
        if (path) {
          await supabase.from('report_photos').insert({
            report_id: report.id,
            storage_path: path,
            caption: p.caption.trim() || null,
            latitude: p.latitude,
            longitude: p.longitude,
            taken_at: p.takenAt,
            sort_order: i,
          });
        }
      }

      // Always let the AI turn the raw (often dictated) notes into proper
      // report prose — no separate manual "Rédiger avec l'IA" step to
      // remember. Best-effort: if it fails (e.g. no notes at all), the
      // report still gets created and PDF'd with whatever notes exist.
      if (notes.trim()) {
        setStep(t('newReport.aiWriting'));
        const { notes: polished } = await polishReportNotes(report.id);
        if (polished) {
          await supabase.from('reports').update({ notes: polished }).eq('id', report.id);
        }
      }

      setStep(t('newReport.generatingPdf'));
      const { error: pdfError } = await generateReportPdf(report.id);
      if (pdfError) {
        setError(t('newReport.savedButPdfFailed', { error: pdfError }));
        setLoading(false);
        setStep(null);
        return;
      }

      router.replace(`/(app)/chantiers/${projectId}/reports`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
      setStep(null);
    }
  }

  return (
    <Screen style={{ padding: spacing.xl }}>
      <ScrollView>
        <PageHeader title={t('newReport.title')} backTo={`/(app)/chantiers/${projectId}/reports`} />

        <Field label={t('newReport.titleLabel')} value={title} onChangeText={setTitle} placeholder={t('newReport.titlePlaceholder')} />

        {organization && !organization.logo_url ? (
          <View style={styles.warning}>
            <Feather name="alert-triangle" size={14} color={colors.accent} />
            <Text style={styles.warningText}>{t('newReport.noLogoWarning')}</Text>
          </View>
        ) : null}

        <View style={styles.notesLabelRow}>
          <Text style={styles.fieldLabel}>{t('newReport.notesLabel')}</Text>
          {dictation.supported ? (
            <Pressable
              onPress={toggleDictation}
              disabled={dictation.transcribing}
              style={[styles.dictateButton, (dictation.listening || dictation.transcribing) && styles.dictateButtonActive]}
            >
              {dictation.transcribing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="mic" size={13} color={dictation.listening ? '#fff' : colors.primary} />
              )}
              <Text
                style={[styles.dictateButtonText, (dictation.listening || dictation.transcribing) && styles.dictateButtonTextActive]}
              >
                {dictation.transcribing ? t('newReport.transcribing') : dictation.listening ? t('newReport.listening') : t('newReport.dictate')}
              </Text>
            </Pressable>
          ) : null}
        </View>
        <TextInput
          style={styles.notes}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('newReport.notesPlaceholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
        />
        {catalogMatches.length > 0 ? (
          <View style={styles.suggestionRow}>
            <Feather name="zap" size={11} color={colors.primary} style={{ marginTop: 3 }} />
            <View style={styles.suggestionChips}>
              {catalogMatches.map((m) => (
                <Pressable key={m.description} style={styles.suggestionChip} onPress={() => applyCatalogMatch(m)}>
                  <Text style={styles.suggestionMatch}>{Math.round(m.score * 100)}%</Text>
                  <Text style={styles.suggestionText} numberOfLines={1}>
                    {m.description}
                  </Text>
                  <Text style={styles.suggestionPrice}>CHF {m.unitPrice.toFixed(2)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.fieldLabel}>{t('newReport.photosLabel', { count: photos.length })}</Text>
        <View style={styles.photoButtons}>
          <Pressable style={styles.photoButton} onPress={addFromCamera}>
            <Feather name="camera" size={16} color={colors.text} />
            <Text style={styles.photoButtonText}>{t('newReport.takePhoto')}</Text>
          </Pressable>
          <Pressable style={styles.photoButton} onPress={addFromGallery}>
            <Feather name="image" size={16} color={colors.text} />
            <Text style={styles.photoButtonText}>{t('newReport.fromGallery')}</Text>
          </Pressable>
        </View>

        {photos.map((p, i) => (
          <View key={`${p.uri}-${i}`} style={styles.photoRow}>
            <Image source={{ uri: p.uri }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.captionInput}
                value={p.caption}
                onChangeText={(val) => updateCaption(i, val)}
                placeholder={t('newReport.captionPlaceholder')}
                placeholderTextColor={colors.textMuted}
              />
              <View style={styles.geoRow}>
                <Feather name="map-pin" size={11} color={colors.textMuted} />
                <Text style={styles.geo}>
                  {p.latitude != null ? `${p.latitude.toFixed(4)}, ${p.longitude!.toFixed(4)}` : t('newReport.positionUnavailable')}
                </Text>
              </View>
            </View>
            <Pressable onPress={() => removePhoto(i)} hitSlop={8}>
              <Feather name="x" size={18} color={colors.danger} />
            </Pressable>
          </View>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {step ? <Text style={styles.step}>{step}</Text> : null}

        <Button
          title={t('newReport.submit')}
          onPress={handleSubmit}
          loading={loading}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  notesLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dictateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.xs,
  },
  dictateButtonActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  dictateButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  dictateButtonTextActive: {
    color: '#fff',
  },
  notes: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: -spacing.md,
    marginBottom: spacing.md,
  },
  suggestionChips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 260,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  suggestionMatch: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  suggestionText: {
    fontSize: fontSize.xs,
    color: colors.text,
    flexShrink: 1,
  },
  suggestionPrice: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  photoButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    height: 38,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  geoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  geo: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
  step: {
    color: colors.primary,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
});
