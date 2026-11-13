import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Head from 'expo-router/head';
import { useLocalSearchParams } from 'expo-router';
import { Eyebrow, Headline, Wrap } from '../components/site/Primitives';
import { SitePage, useSiteLayout } from '../components/site/Sections';
import { sans, site } from '../lib/siteTheme';
import { supabase } from '../lib/supabase';

// Unsubscribe link of the welcome e-mail sent to newly founded companies
// (supabase/functions/registry-outreach): the token in the link is the only
// key, no account needed. Not indexed, not in the sitemap.
const COPY = {
  fr: { kicker: 'Désinscription', wait: 'Un instant…', done: 'C’est noté', doneText: 'Vous ne recevrez plus de message de Cantia à cette adresse.', fail: 'Lien non valable', failText: 'Ce lien ne fonctionne pas ou plus. Répondez simplement à notre e-mail par « non merci » et nous ne vous écrirons plus.' },
  de: { kicker: 'Abmeldung', wait: 'Einen Moment…', done: 'Erledigt', doneText: 'Sie erhalten von Cantia keine Nachrichten mehr an diese Adresse.', fail: 'Link ungültig', failText: 'Dieser Link funktioniert nicht oder nicht mehr. Antworten Sie einfach mit «Nein danke» auf unsere E-Mail, und wir schreiben Ihnen nicht mehr.' },
  it: { kicker: 'Disiscrizione', wait: 'Un istante…', done: 'Fatto', doneText: 'Non riceverete più messaggi da Cantia a questo indirizzo.', fail: 'Link non valido', failText: 'Questo link non funziona o non più. Rispondete semplicemente «no grazie» alla nostra e-mail e non vi scriveremo più.' },
};

const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function UnsubscribeScreen() {
  const { phone } = useSiteLayout();
  const { t, l } = useLocalSearchParams<{ t?: string; l?: string }>();
  const c = COPY[l === 'de' || l === 'it' ? l : 'fr'];
  const [state, setState] = useState<'wait' | 'done' | 'fail'>('wait');

  useEffect(() => {
    if (typeof t !== 'string' || !TOKEN_RE.test(t)) {
      setState('fail');
      return;
    }
    supabase.rpc('registry_unsubscribe', { p_token: t }).then(({ data, error }) => setState(!error && data === true ? 'done' : 'fail'));
  }, [t]);

  const title = state === 'done' ? c.done : state === 'fail' ? c.fail : c.wait;
  return (
    <SitePage title={`${c.kicker} | Cantia`} cta={false}>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <View style={{ paddingVertical: phone ? 70 : 130 }}>
        <Wrap>
          <View style={styles.col}>
            <Eyebrow>{c.kicker}</Eyebrow>
            <Headline level={1} plain={title} size={phone ? 36 : 48} style={{ marginTop: 18, marginBottom: 18 }} />
            {state !== 'wait' ? <Text style={[sans, styles.text]}>{state === 'done' ? c.doneText : c.failText}</Text> : null}
          </View>
        </Wrap>
      </View>
    </SitePage>
  );
}

const styles = StyleSheet.create({
  col: { maxWidth: 640 },
  text: { fontSize: 14, color: site.muted, lineHeight: 25 },
});
