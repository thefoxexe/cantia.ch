import { useRef, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
import { Button, Field, PageHeader, Screen } from '../../../../components/ui';
import { PdfTemplatePicker } from '../../../../components/PdfTemplatePicker';
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
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { organization, user } = useAuth();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [templateId, setTemplateId] = useState<string | null>(null);
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

  async function toggleDictation() {
    if (dictation.listening) {
      dictation.stop();
      return;
    }
    notesBaseRef.current = notes;
    const started = await dictation.start('fr-FR');
    if (!started) {
      Alert.alert('Permission requise', "Autorisez l'accès au microphone pour dicter votre rapport.");
    }
  }

  async function addFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission requise', "Autorisez l'accès à l'appareil photo pour prendre des photos.");
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
      Alert.alert('Permission requise', "Autorisez l'accès à vos photos pour en importer.");
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
      setError('Le titre du rapport est requis.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      setStep('Enregistrement du rapport…');
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert({
          organization_id: organization.id,
          project_id: projectId,
          title: title.trim(),
          notes: notes.trim() || null,
          template_id: templateId,
          created_by: user?.id,
        })
        .select()
        .single();

      if (reportError || !report) throw new Error(reportError?.message ?? 'Échec de la création du rapport');

      for (let i = 0; i < photos.length; i++) {
        setStep(`Envoi photo ${i + 1}/${photos.length}…`);
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
        setStep('Rédaction du rapport par IA…');
        const { notes: polished } = await polishReportNotes(report.id);
        if (polished) {
          await supabase.from('reports').update({ notes: polished }).eq('id', report.id);
        }
      }

      setStep('Génération du PDF…');
      const { error: pdfError } = await generateReportPdf(report.id);
      if (pdfError) {
        setError(`Rapport enregistré, mais la génération du PDF a échoué : ${pdfError}`);
        setLoading(false);
        setStep(null);
        return;
      }

      router.replace(`/(app)/chantiers/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
      setStep(null);
    }
  }

  return (
    <Screen style={{ padding: spacing.xl }}>
      <ScrollView>
        <PageHeader title="Nouveau rapport" backTo={`/(app)/chantiers/${projectId}`} />

        <Field label="Titre du rapport" value={title} onChangeText={setTitle} placeholder="Ex : Visite de chantier du 12 mars" />

        <Text style={styles.fieldLabel}>Modèle de rapport</Text>
        {organization ? (
          <PdfTemplatePicker
            organizationId={organization.id}
            kind="report"
            hasLogo={!!organization?.logo_url}
            compact
            selectedId={templateId}
            onSelect={setTemplateId}
          />
        ) : null}

        <View style={styles.notesLabelRow}>
          <Text style={styles.fieldLabel}>Notes</Text>
          {dictation.supported ? (
            <Pressable
              onPress={toggleDictation}
              style={[styles.dictateButton, dictation.listening && styles.dictateButtonActive]}
            >
              <Feather name="mic" size={13} color={dictation.listening ? '#fff' : colors.primary} />
              <Text style={[styles.dictateButtonText, dictation.listening && styles.dictateButtonTextActive]}>
                {dictation.listening ? 'Écoute…' : 'Dicter'}
              </Text>
            </Pressable>
          ) : null}
        </View>
        <TextInput
          style={styles.notes}
          value={notes}
          onChangeText={setNotes}
          placeholder="Observations, remarques, avancement…"
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.fieldLabel}>Photos ({photos.length})</Text>
        <View style={styles.photoButtons}>
          <Pressable style={styles.photoButton} onPress={addFromCamera}>
            <Feather name="camera" size={16} color={colors.text} />
            <Text style={styles.photoButtonText}>Prendre une photo</Text>
          </Pressable>
          <Pressable style={styles.photoButton} onPress={addFromGallery}>
            <Feather name="image" size={16} color={colors.text} />
            <Text style={styles.photoButtonText}>Depuis la galerie</Text>
          </Pressable>
        </View>

        {photos.map((p, i) => (
          <View key={`${p.uri}-${i}`} style={styles.photoRow}>
            <Image source={{ uri: p.uri }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.captionInput}
                value={p.caption}
                onChangeText={(t) => updateCaption(i, t)}
                placeholder="Légende (optionnel)"
                placeholderTextColor={colors.textMuted}
              />
              <View style={styles.geoRow}>
                <Feather name="map-pin" size={11} color={colors.textMuted} />
                <Text style={styles.geo}>
                  {p.latitude != null ? `${p.latitude.toFixed(4)}, ${p.longitude!.toFixed(4)}` : 'Position non disponible'}
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
          title="Créer et générer le rapport PDF"
          onPress={handleSubmit}
          loading={loading}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
