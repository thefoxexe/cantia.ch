import { createElement, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { sans, site } from '../../lib/siteTheme';
import { useSiteLayout } from './Sections';
import { imageUri } from './SiteImage';

// Home page › "Avant / avec Cantia": one document at a time, a slider wipes
// from how many companies still do it (spreadsheet invoice, word-processor
// offer, carbon-copy régie slip, e-mail report, coloured spreadsheet planning)
// to the same document out of Cantia. The "avant" pictures are drawn for the
// example; the "après" ones are real exports of the app's own renderers
// (supabase/functions/_shared/pdf-document-renderers.ts, generate-report-pdf)
// and the real Planning screen. Same fictitious job everywhere: Atelier
// Martin SA, villa des Vignes, M. et Mme Dubois. French only for now.

type Key = 'facture' | 'devis' | 'travaux' | 'rapport' | 'planning';
type Doc = { label: string; before: ImageSourcePropType; after: ImageSourcePropType; beforeAlt: string; afterAlt: string; wide?: boolean; bad: string[]; good: string[] };

const DOCS: Record<Key, Doc> = {
  facture: {
    label: 'Facture',
    before: require('../../assets/marketing/site/avant-apres/facture-avant.jpg'),
    after: require('../../assets/marketing/site/avant-apres/facture-apres.jpg'),
    beforeAlt: 'Exemple de facture faite sur un tableur, avec un ancien taux de TVA',
    afterAlt: 'Facture Cantia avec QR-facture',
    bad: ['TVA restée à 7,7 %, alors que le taux est de 8,1 % depuis 2024', 'IBAN à recopier à la main, pas de QR-facture', 'Chaque facture part d’une « Copie de Facture 87 »'],
    good: ['TVA 8,1 % calculée sur le sous-total', 'QR-facture suisse : le client scanne et paie', 'Numéro, échéance et chantier remplis tout seuls'],
  },
  devis: {
    label: 'Devis',
    before: require('../../assets/marketing/site/avant-apres/devis-avant.jpg'),
    after: require('../../assets/marketing/site/avant-apres/devis-apres.jpg'),
    beforeAlt: 'Exemple d’offre faite sur un traitement de texte',
    afterAlt: 'Devis Cantia signé en ligne par le client',
    bad: ['« Offre FINAL v3.docx » : laquelle a été envoyée ?', 'Un [DATE] oublié, un prix manquant, l’ancien taux de TVA', '« Bon pour accord » à imprimer, signer et scanner'],
    good: ['Positions, unités et totaux toujours justes', 'Signé en ligne par le client, avec la date et l’heure', 'Le devis accepté devient une facture en un clic'],
  },
  travaux: {
    label: 'Travaux en plus',
    before: require('../../assets/marketing/site/avant-apres/travaux-avant.jpg'),
    after: require('../../assets/marketing/site/avant-apres/travaux-apres.jpg'),
    beforeAlt: 'Exemple de bon de régie rempli à la main sur un carnet',
    afterAlt: 'Travaux supplémentaires Cantia signés par le client',
    bad: ['Un bon papier rempli au stylo, à recopier au bureau', '« 1h forf.? » et « ?? » : les prix sont à retrouver', 'Une signature griffonnée, sans date ni heure'],
    good: ['Heures, matériel et prix chiffrés, TVA comprise', 'Le client signe sur le téléphone, sur le chantier', 'Le PDF signé part au client par e-mail'],
  },
  rapport: {
    label: 'Rapport',
    before: require('../../assets/marketing/site/avant-apres/rapport-avant.jpg'),
    after: require('../../assets/marketing/site/avant-apres/rapport-apres.jpg'),
    beforeAlt: 'Exemple de rapport de chantier envoyé par e-mail avec des photos en pièces jointes',
    afterAlt: 'Rapport de chantier Cantia',
    bad: ['Un e-mail tapé le soir, sans structure', '9 photos de 31 Mo en pièces jointes', 'Les heures et le matériel sont à recopier ailleurs'],
    good: ['Les notes du chantier mises en forme automatiquement', 'Travaux, équipe et heures, matériel, points d’attention', 'Un PDF propre à envoyer au client'],
  },
  planning: {
    label: 'Planning',
    before: require('../../assets/marketing/site/avant-apres/planning-avant.jpg'),
    after: require('../../assets/marketing/site/avant-apres/planning-apres.jpg'),
    beforeAlt: 'Exemple de planning d’équipe fait sur un tableur',
    afterAlt: 'Écran Planning de Cantia',
    wide: true,
    bad: ['Une feuille par semaine, copiée de la précédente', 'Des cases coloriées, des « malade? » et des « Pully ?? »', 'Plusieurs versions du fichier selon qui l’a modifié'],
    good: ['Rendez-vous, chantiers et absences au même endroit', 'Chaque personne a sa ligne, semaine par semaine', 'Une seule version, à jour pour tout le monde'],
  },
};
const ORDER: Key[] = ['facture', 'devis', 'travaux', 'rapport', 'planning'];

export function BeforeAfter() {
  const { phone } = useSiteLayout();
  const [key, setKey] = useState<Key>('facture');
  const doc = DOCS[key];
  const frameW = doc.wide ? (phone ? undefined : 560) : phone ? 340 : 380;

  const tabs = ORDER.map((k) => {
    const on = k === key;
    return (
      <Pressable key={k} onPress={() => setKey(k)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={on ? styles.tabOn : styles.tab}>
        <Text style={[sans, styles.tabText, on && { color: site.ink }]}>{DOCS[k].label}</Text>
      </Pressable>
    );
  });

  return (
    <View style={{ gap: phone ? 20 : 26 }}>
      {phone ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs}
        </ScrollView>
      ) : (
        <View style={[styles.tabs, { alignSelf: 'flex-start' }]}>{tabs}</View>
      )}
      <View style={phone ? { gap: 22 } : { flexDirection: 'row', gap: 48, alignItems: 'center' }}>
        <View style={{ width: frameW ?? '100%', maxWidth: '100%', alignSelf: phone ? 'center' : 'flex-start', gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[sans, styles.tag, { backgroundColor: site.ink }]}>Avant</Text>
            <Text style={[sans, styles.tag, { backgroundColor: site.copper }]}>Avec Cantia</Text>
          </View>
          <Wipe key={key} doc={doc} />
        </View>
        <View style={phone ? { gap: 18 } : { flex: 1, gap: 22, minWidth: 0 }}>
          <Points title="Avant" items={doc.bad} good={false} />
          <Points title="Avec Cantia" items={doc.good} good />
        </View>
      </View>
    </View>
  );
}

function Points({ title, items, good }: { title: string; items: string[]; good: boolean }) {
  const color = good ? '#2f6b3a' : '#a8322a';
  return (
    <View style={{ gap: 9 }}>
      <Text style={[sans, styles.pointsTitle, { color }]}>{title}</Text>
      {items.map((t) => (
        <View key={t} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <Feather name={good ? 'check' : 'x'} size={16} color={color} style={{ marginTop: 2 }} />
          <Text style={[sans, styles.point, !good && { color: site.muted }]}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

// The wipe itself is plain DOM: pointer capture, clip-path and an ARIA slider
// handle, which React Native's views don't offer. The site is web only.
function Wipe({ doc }: { doc: Doc }) {
  const [x, setX] = useState(50);
  const frame = useRef<HTMLDivElement | null>(null);
  const drag = useRef(false);
  if (Platform.OS !== 'web') return null;
  const at = (clientX: number) => {
    const r = frame.current?.getBoundingClientRect();
    if (r) setX(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };
  const img = (src: ImageSourcePropType, alt: string, clip?: string) =>
    createElement('img', {
      src: imageUri(src),
      alt,
      loading: 'lazy',
      decoding: 'async',
      draggable: false,
      style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', display: 'block', pointerEvents: 'none', clipPath: clip },
    });
  return createElement(
    'div',
    {
      ref: frame,
      onPointerDown: (e: any) => {
        drag.current = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        at(e.clientX);
      },
      onPointerMove: (e: any) => drag.current && at(e.clientX),
      onPointerUp: () => (drag.current = false),
      onPointerCancel: () => (drag.current = false),
      style: {
        position: 'relative',
        width: '100%',
        aspectRatio: doc.wide ? '16 / 10' : '960 / 1358',
        overflow: 'hidden',
        borderRadius: doc.wide ? 10 : 4,
        background: '#fff',
        boxShadow: '0 22px 48px rgba(86,58,34,0.18), 0 2px 6px rgba(86,58,34,0.08)',
        touchAction: 'pan-y',
        userSelect: 'none',
        cursor: 'ew-resize',
      },
    },
    img(doc.after, doc.afterAlt),
    img(doc.before, doc.beforeAlt, `inset(0 ${100 - x}% 0 0)`),
    createElement('div', { style: { position: 'absolute', top: 0, bottom: 0, left: `${x}%`, width: 2, marginLeft: -1, background: '#fff', boxShadow: '0 0 0 1px rgba(0,0,0,.12), 0 0 16px rgba(0,0,0,.25)', pointerEvents: 'none' } }),
    createElement(
      'button',
      {
        type: 'button',
        role: 'slider',
        'aria-label': 'Comparer avant et avec Cantia',
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': Math.round(x),
        onKeyDown: (e: any) => {
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
          e.preventDefault();
          setX((v) => Math.max(0, Math.min(100, v + (e.key === 'ArrowLeft' ? -5 : 5))));
        },
        style: { position: 'absolute', top: '50%', left: `${x}%`, width: 42, height: 42, margin: '-21px 0 0 -21px', borderRadius: '50%', border: 0, padding: 0, background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,.3)', display: 'grid', placeItems: 'center', cursor: 'ew-resize', color: site.ink },
      },
      createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, createElement('path', { d: 'M9 6l-6 6 6 6M15 6l6 6-6 6' })),
    ),
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 999, backgroundColor: '#ece8df' },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999 },
  tabOn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: site.white },
  tabText: { fontSize: 14, fontWeight: '600', color: site.muted },
  tag: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, overflow: 'hidden' },
  pointsTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  point: { flex: 1, fontSize: 15, lineHeight: 22, color: site.ink },
});
