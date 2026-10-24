import { createElement, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../lib/theme';

// Super Admin › E-mails: what the recipient will see — inbox line (sender,
// subject, preheader) and the HTML rendered in a sandboxed frame, at desktop
// or phone width, with the placeholders filled with sample values. Web
// only: the admin is used from a browser.

const SAMPLE: Record<string, string> = { prenom: 'Marc', nom: 'Marc Dubois', entreprise: 'Dubois Maçonnerie Sàrl', plan: 'Équipe' };

export function fillSample(text: string, values: Record<string, string> = SAMPLE): string {
  return text.replace(/\{\{\s*(prenom|nom|entreprise|plan)\s*(?:\|([^}]*))?\}\}/gi, (_m, key: string) => values[key.toLowerCase()] ?? '');
}

export function extractPreheader(html: string): string {
  const m = html.match(/<div[^>]*display\s*:\s*none[^>]*>([\s\S]*?)<\/div>/i);
  return m ? m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;|&#8203;|&zwnj;|‌|​/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

export function AdminEmailPreview({ subject, html, from, emptyHint }: { subject: string; html: string; from: string; emptyHint?: string }) {
  const [device, setDevice] = useState<'desktop' | 'phone'>('desktop');
  const [withSample, setWithSample] = useState(true);
  const doc = useMemo(() => (withSample ? fillSample(html) : html), [html, withSample]);
  const preheader = useMemo(() => extractPreheader(doc), [doc]);

  if (!html.trim()) {
    return (
      <View style={[styles.box, styles.empty]}>
        <Feather name="eye" size={18} color={colors.textMuted} />
        <Text style={styles.muted}>{emptyHint ?? 'L’aperçu apparaît ici dès qu’il y a du HTML.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.box}>
      <View style={styles.bar}>
        <Text style={styles.barTitle}>Aperçu</Text>
        <View style={styles.seg}>
          {(['desktop', 'phone'] as const).map((d) => (
            <Pressable key={d} onPress={() => setDevice(d)} style={[styles.segItem, device === d && styles.segOn]}>
              <Feather name={d === 'desktop' ? 'monitor' : 'smartphone'} size={13} color={device === d ? colors.primary : colors.textMuted} />
              <Text style={[styles.segText, device === d && { color: colors.primary }]}>{d === 'desktop' ? 'Ordinateur' : 'Téléphone'}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => setWithSample((v) => !v)} hitSlop={6}>
          <Text style={styles.link}>{withSample ? 'Exemple : Marc, Dubois Maçonnerie' : 'Variables brutes'}</Text>
        </Pressable>
      </View>

      <View style={styles.inbox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>C</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.from} numberOfLines={1}>
            {from}
          </Text>
          <Text style={styles.subject} numberOfLines={1}>
            {fillSample(subject) || '(sans objet)'}
          </Text>
          <Text style={styles.muted} numberOfLines={1}>
            {preheader || 'Pas de préheader : la boîte mail affichera le début du texte.'}
          </Text>
        </View>
      </View>

      {Platform.OS === 'web' ? (
        <View style={styles.stage}>
          {createElement('iframe', {
            title: 'Aperçu de l’e-mail',
            srcDoc: doc,
            sandbox: 'allow-popups allow-popups-to-escape-sandbox',
            style: {
              width: device === 'phone' ? 375 : '100%',
              maxWidth: '100%',
              height: 720,
              border: `1px solid ${colors.border}`,
              borderRadius: device === 'phone' ? 24 : 8,
              background: '#fff',
              display: 'block',
              margin: '0 auto',
            },
          })}
        </View>
      ) : (
        <Text style={styles.muted}>L’aperçu s’affiche dans un navigateur.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.sm, marginBottom: spacing.lg },
  empty: { alignItems: 'center', paddingVertical: spacing.xl, gap: 6 },
  bar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, justifyContent: 'space-between' },
  barTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  seg: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  segItem: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6 },
  segOn: { backgroundColor: colors.primarySoft },
  segText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted },
  link: { fontSize: fontSize.xs, color: colors.primary, fontWeight: '700' },
  inbox: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.bg },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800' },
  from: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text },
  subject: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text },
  muted: { fontSize: fontSize.xs, color: colors.textMuted },
  stage: { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.sm },
});
