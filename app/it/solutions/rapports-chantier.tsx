import { forceLocale } from '../../../lib/translations';
import { SolutionPage } from '../../../components/SolutionPage';
import { ModuleMockup } from '../../../components/solutions/ModuleMockup';

forceLocale('it');

export default function RapportsChantierSolutionPageIt() {
  return (
    <SolutionPage
      kicker="Rapporti di cantiere"
      title="Il rapporto si redige mentre è ancora in cantiere"
      subtitle="Note vocali, foto geolocalizzate e messaggi del feed: Cantia raccoglie tutto e ne ricava un rapporto redatto, strutturato e pronto per l'invio — non resta che rileggerlo."
      visual={<ModuleMockup kind="rapports-chantier" />}
      features={[
        {
          icon: 'mic',
          title: 'Dettato a voce',
          text: "Racconti quello che è successo normalmente — Cantia trascrive e il redattore IA ne ricava un testo professionale, senza errori né espressioni colloquiali.",
        },
        {
          icon: 'message-square',
          title: 'Dal feed di cantiere',
          text: "Le note e i messaggi vocali scambiati nel feed della squadra possono alimentare direttamente il rapporto, senza dover riscrivere tutto.",
        },
        {
          icon: 'camera',
          title: 'Foto geolocalizzate',
          text: "Ogni foto mantiene la sua posizione GPS e la sua marca temporale, organizzate automaticamente in griglia nel PDF.",
        },
        {
          icon: 'map',
          title: 'Localizzazione delle foto',
          text: "Quando le foto vengono scattate in più punti del cantiere, uno schema di localizzazione relativa le colloca le une rispetto alle altre.",
        },
        {
          icon: 'edit-3',
          title: 'Firma del redattore',
          text: "Il rapporto riporta la firma personale di chi lo ha redatto, non un timbro generico dell'azienda.",
        },
        {
          icon: 'droplet',
          title: 'Un rendering per tutti i mestieri',
          text: "Che Lei sia muratore, pittore, elettricista o geometra, lo stesso modello sobrio si adatta al colore del Suo marchio.",
        },
      ]}
      steps={[
        { title: 'Prenda nota sul posto', text: 'A voce, in testo, o dal feed di cantiere condiviso con la Sua squadra.' },
        { title: "L'IA redige", text: 'Note grezze, didascalie delle foto e localizzazione vengono assemblate in un testo chiaro.' },
        { title: 'Rilegga e generi il PDF', text: 'Corregga se necessario, poi esporti un rapporto pronto per essere inviato al cliente.' },
      ]}
      faq={[
        {
          question: 'Come si redige rapidamente un rapporto di cantiere?',
          answer:
            "Scatti le Sue foto e detti le Sue note sul momento — Cantia assembla tutto in un rapporto PDF strutturato e pronto per l'invio, senza dover riscrivere tutto la sera.",
        },
        {
          question: 'Le foto vengono geolocalizzate automaticamente?',
          answer: "Sì, ogni foto viene marcata temporalmente e geolocalizzata senza alcuna azione aggiuntiva da parte Sua.",
        },
        {
          question: 'Si può personalizzare il rapporto con logo e firma?',
          answer: "Sì, ogni rapporto PDF riprende il Suo logo, il colore del Suo marchio e la firma di chi lo ha redatto.",
        },
        {
          question: 'Il rapporto di cantiere sostituisce un diario di cantiere cartaceo?',
          answer:
            "Sì — note, foto e monitoraggio sono centralizzati in un documento digitale consultabile in qualsiasi momento, per cantiere.",
        },
      ]}
      related={[
        { href: '/it/solutions/dictee-vocale', label: 'Dettatura vocale' },
        { href: '/it/solutions/planning', label: "Pianificazione di squadra" },
      ]}
      closingTitle="Un rapporto professionale, senza passarci la serata"
      closingText="Incluso in tutti i piani Cantia, senza eccezioni."
    />
  );
}
