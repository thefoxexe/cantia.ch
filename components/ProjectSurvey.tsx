import { useCallback, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { invokeFunction } from '../lib/api/functions';
import { wgs84ToLv95 } from '../lib/swissCoords';
import { SwissMap } from './SwissMap';
import { Button, Card, EmptyState, Field } from './ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';
import type { Plan, SurveyPoint } from '../lib/types';

type ExportFormat = 'csv' | 'dxf' | 'xml' | 'gpx';
type Delivery = 'download' | 'email';

const FORMATS: { key: ExportFormat; label: string }[] = [
  { key: 'csv', label: 'CSV' },
  { key: 'dxf', label: 'DXF' },
  { key: 'xml', label: 'Point XML' },
  { key: 'gpx', label: 'GPX' },
];

function nextCode(points: SurveyPoint[]): string {
  let max = 0;
  for (const p of points) {
    const m = /^P(\d+)$/i.exec(p.code.trim());
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `P${max + 1}`;
}

export function ProjectSurvey({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const { organization, user } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [points, setPoints] = useState<SurveyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [pointClass, setPointClass] = useState('');
  const [newClassInput, setNewClassInput] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [elevation, setElevation] = useState('');
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showExport, setShowExport] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [delivery, setDelivery] = useState<Delivery>('download');
  const [email, setEmail] = useState(user?.email ?? '');
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [{ data: planRow }, { data: pointRows }] = await Promise.all([
      supabase.from('plans').select('*').eq('id', organization.plan_id).single(),
      supabase.from('survey_points').select('*').eq('project_id', projectId).order('sort_order', { ascending: true }),
    ]);
    setPlan(planRow ?? null);
    setPoints(pointRows ?? []);
    setLoading(false);
  }, [organization, projectId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const knownClasses = useMemo(() => {
    const set = new Set<string>();
    for (const p of points) if (p.class) set.add(p.class);
    return Array.from(set);
  }, [points]);

  function openForm(prefillLat?: number, prefillLon?: number) {
    setCode(nextCode(points));
    setDescription('');
    setPointClass('');
    setNewClassInput('');
    setLat(prefillLat != null ? String(prefillLat) : '');
    setLon(prefillLon != null ? String(prefillLon) : '');
    setElevation('');
    setShowForm(true);
  }

  async function useMyLocation() {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return;
      const loc = await Location.getCurrentPositionAsync({});
      setLat(String(loc.coords.latitude));
      setLon(String(loc.coords.longitude));
      if (loc.coords.altitude != null) setElevation(String(Math.round(loc.coords.altitude * 100) / 100));
    } finally {
      setLocating(false);
    }
  }

  async function addPoint() {
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (!code.trim() || Number.isNaN(latNum) || Number.isNaN(lonNum)) return;
    setSaving(true);
    const { e, n } = wgs84ToLv95(latNum, lonNum);
    const finalClass = (newClassInput.trim() || pointClass || '').trim() || null;
    await supabase.from('survey_points').insert({
      organization_id: organizationId,
      project_id: projectId,
      code: code.trim(),
      description: description.trim() || null,
      class: finalClass,
      latitude: latNum,
      longitude: lonNum,
      elevation: elevation.trim() ? Number(elevation) : null,
      lv95_e: e,
      lv95_n: n,
      source: 'manual',
      sort_order: points.length,
      created_by: user?.id ?? null,
    });
    setShowForm(false);
    setSaving(false);
    load();
  }

  async function deletePoint(id: string) {
    await supabase.from('survey_points').delete().eq('id', id);
    load();
  }

  async function runExport() {
    setExporting(true);
    setExportMessage(null);
    const { data, error } = await invokeFunction<{ url?: string }>('export-survey-points', {
      project_id: projectId,
      format,
      delivery,
      email: delivery === 'email' ? email.trim() : null,
    });
    setExporting(false);
    if (error) {
      setExportMessage({ kind: 'error', text: error });
      return;
    }
    if (delivery === 'download' && data?.url) {
      Linking.openURL(data.url);
      setExportMessage({ kind: 'success', text: 'Export généré — le téléchargement a démarré.' });
    } else if (delivery === 'email') {
      setExportMessage({ kind: 'success', text: `Export envoyé à ${email}.` });
    }
  }

  if (!plan?.has_rtk) {
    return (
      <Card style={styles.upsell}>
        <Feather name="crosshair" size={22} color={colors.accent} />
        <Text style={styles.upsellTitle}>Levés de précision</Text>
        <Text style={styles.upsellText}>
          Enregistrez des points de chantier positionnés sur le cadastre et l’orthophoto officiels de la Suisse,
          avec export DXF / CSV / XML / GPX et connexion à un récepteur RTK sur tablette (bientôt).
        </Text>
        <Text style={styles.upsellText}>Disponible à partir du plan Indépendant (dès CHF 29/mois).</Text>
        <Button
          title="Voir les plans"
          variant="secondary"
          icon="arrow-right"
          onPress={() => router.push('/(app)/compte')}
          style={{ marginTop: spacing.md }}
        />
      </Card>
    );
  }

  return (
    <View>
      <SwissMap
        points={points.map((p) => ({ id: p.id, code: p.code, description: p.description, pointClass: p.class, lat: p.latitude, lon: p.longitude }))}
        onMapPress={(pLat, pLon) => openForm(pLat, pLon)}
      />
      <Text style={styles.mapHint}>Touchez la carte pour ajouter un point à cet endroit.</Text>

      <View style={styles.actionsRow}>
        <Pressable style={styles.newButton} onPress={() => openForm()}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.newButtonText}>Ajouter un point</Text>
        </Pressable>
        {points.length > 0 ? (
          <Pressable style={styles.secondaryButton} onPress={() => setShowExport((s) => !s)}>
            <Feather name="download" size={16} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Exporter</Text>
          </Pressable>
        ) : null}
      </View>

      {showForm ? (
        <Card style={{ marginBottom: spacing.lg }}>
          <View style={styles.row3}>
            <View style={styles.row3ItemSmall}>
              <Field label="Code" value={code} onChangeText={setCode} placeholder="P1" />
            </View>
            <View style={styles.row3Item}>
              <Field label="Description" value={description} onChangeText={setDescription} placeholder="Angle bâtiment" />
            </View>
          </View>

          <Text style={styles.chipLabel}>Classe du point</Text>
          <View style={styles.chipRow}>
            {knownClasses.map((c) => (
              <Pressable
                key={c}
                onPress={() => {
                  setPointClass(c);
                  setNewClassInput('');
                }}
                style={[styles.chip, pointClass === c && styles.chipActive]}
              >
                <Text style={[styles.chipText, pointClass === c && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <Field
            label="Nouvelle classe (optionnel)"
            value={newClassInput}
            onChangeText={(t) => {
              setNewClassInput(t);
              setPointClass('');
            }}
            placeholder="Ex : borne, regard, angle bâtiment…"
          />

          <View style={styles.row3}>
            <View style={styles.row3Item}>
              <Field label="Latitude" value={lat} onChangeText={setLat} keyboardType="decimal-pad" placeholder="46.94809" />
            </View>
            <View style={styles.row3Item}>
              <Field label="Longitude" value={lon} onChangeText={setLon} keyboardType="decimal-pad" placeholder="7.44744" />
            </View>
            <View style={styles.row3Item}>
              <Field label="Altitude (m)" value={elevation} onChangeText={setElevation} keyboardType="decimal-pad" placeholder="540.2" />
            </View>
          </View>
          <Button
            title="Utiliser ma position"
            variant="secondary"
            icon="crosshair"
            onPress={useMyLocation}
            loading={locating}
            style={{ marginBottom: spacing.md }}
          />
          <View style={styles.formButtonsRow}>
            <Button title="Annuler" variant="secondary" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
            <Button title="Ajouter le point" icon="check" onPress={addPoint} loading={saving} style={{ flex: 1 }} />
          </View>
        </Card>
      ) : null}

      {showExport ? (
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={styles.exportTitle}>Exporter les points</Text>
          <Text style={styles.chipLabel}>Format</Text>
          <View style={styles.chipRow}>
            {FORMATS.map((f) => (
              <Pressable
                key={f.key}
                onPress={() => setFormat(f.key)}
                style={[styles.chip, format === f.key && styles.chipActive]}
              >
                <Text style={[styles.chipText, format === f.key && styles.chipTextActive]}>{f.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.chipLabel}>Livraison</Text>
          <View style={styles.chipRow}>
            <Pressable
              onPress={() => setDelivery('download')}
              style={[styles.chip, delivery === 'download' && styles.chipActive]}
            >
              <Text style={[styles.chipText, delivery === 'download' && styles.chipTextActive]}>Télécharger</Text>
            </Pressable>
            <Pressable
              onPress={() => setDelivery('email')}
              style={[styles.chip, delivery === 'email' && styles.chipActive]}
            >
              <Text style={[styles.chipText, delivery === 'email' && styles.chipTextActive]}>Par e-mail</Text>
            </Pressable>
          </View>
          {delivery === 'email' ? (
            <Field label="E-mail de réception" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          ) : null}
          {exportMessage ? (
            <Text style={[styles.exportMessage, exportMessage.kind === 'error' && styles.exportMessageError]}>
              {exportMessage.text}
            </Text>
          ) : null}
          <Button
            title={exporting ? 'Génération en cours…' : 'Générer l’export'}
            icon="download"
            onPress={runExport}
            loading={exporting}
            style={{ marginTop: spacing.sm }}
          />
        </Card>
      ) : null}

      {points.length === 0 && !loading ? (
        <EmptyState title="Aucun point de levé" subtitle="Touchez la carte, ou ajoutez un point manuellement / via votre position." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {points.map((p) => (
            <Card key={p.id} style={styles.pointRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.pointHeaderRow}>
                  <Text style={styles.pointCode}>{p.code}</Text>
                  {p.class ? (
                    <View style={styles.classBadge}>
                      <Text style={styles.classBadgeText}>{p.class}</Text>
                    </View>
                  ) : null}
                </View>
                {p.description ? <Text style={styles.pointMeta}>{p.description}</Text> : null}
                <Text style={styles.pointMeta}>
                  {p.latitude.toFixed(6)}, {p.longitude.toFixed(6)}
                  {p.elevation != null ? ` · ${p.elevation} m` : ''}
                </Text>
                {p.lv95_e != null && p.lv95_n != null ? (
                  <Text style={styles.pointMetaMuted}>
                    LV95 E {Math.round(p.lv95_e).toLocaleString('fr-CH')} / N {Math.round(p.lv95_n).toLocaleString('fr-CH')}
                  </Text>
                ) : null}
              </View>
              <Pressable hitSlop={8} onPress={() => deletePoint(p.id)}>
                <Feather name="trash-2" size={16} color={colors.danger} />
              </Pressable>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  upsell: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  upsellTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  upsellText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  mapHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  formButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  row3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  row3Item: {
    flexGrow: 1,
    flexBasis: 140,
  },
  row3ItemSmall: {
    flexGrow: 0.6,
    flexBasis: 90,
  },
  exportTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chipLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
  },
  exportMessage: {
    fontSize: fontSize.xs,
    color: colors.success,
    marginTop: spacing.md,
  },
  exportMessageError: {
    color: colors.danger,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pointCode: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  classBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  classBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
  pointMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  pointMetaMuted: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
