import type { HelpArticleMore } from './helpArticlesMore';

// Extra sections and questions for the help articles, Italian (Lei form,
// as in the rest of the Italian interface). Same content as the French file.
export const HELP_MORE_IT: Record<string, HelpArticleMore> = {
  demarrage: {
    sections: [
      {
        title: 'Da dove cominciare la prima settimana',
        paragraphs: [
          'Cominci da Account → Azienda: nome, indirizzo, IBAN, logo e colore. Queste informazioni compaiono su ogni preventivo e su ogni fattura e danno subito un aspetto professionale ai Suoi documenti.',
          'Crei poi un primo cantiere e un primo preventivo con un cliente vero. Vedrà come i due si collegano e come nasce la fattura una volta accettato il preventivo. Se ha già un elenco di clienti, lo importi da Account → Importazione dati (Excel o CSV) invece di riscrivere tutto.',
          'Quando la base è pronta, inviti il team da Account → Team e attivi solo i moduli che Le servono. Meglio pochi moduli usati bene che accendere tutto in una volta.',
        ],
      },
      {
        title: 'Ruoli e permessi',
        paragraphs: [
          "Ogni membro ha un ruolo. L'amministratore vede e regola tutto, un ruolo del personale gestisce ore e salari, un dipendente standard vede le proprie ore, i propri cantieri e ciò che il suo ruolo permette. I ruoli si regolano in Account → Team.",
        ],
      },
    ],
    faq: [
      { q: 'Posso usare Cantia sul telefono?', a: "Sì. Cantia funziona nel browser del telefono, e può aggiungerlo alla schermata principale per aprirlo come un'app." },
      { q: 'Un modulo disattivato cancella i miei dati?', a: 'No. Un modulo spento scompare dalla navigazione, i suoi dati restano. Se lo riattiva, ritrova tutto.' },
      { q: 'Dove trovo aiuto strada facendo?', a: "In Account → Aiuto, con tutti gli articoli di questo centro assistenza, e per e-mail a info@cantia.ch." },
    ],
  },
  'devis-creation': {
    sections: [
      {
        title: 'Un preventivo chiaro, voce per voce',
        paragraphs: [
          "Ogni voce ha una descrizione, una quantità, un'unità e un prezzo unitario. Cantia calcola i totali, l'IVA e il totale. Una descrizione già usata in un preventivo precedente viene proposta con la sua unità e l'ultimo prezzo (veda l'articolo sul Catalogo).",
          "Per le posizioni che tornano spesso, un modello inserisce più voci in una volta. Le note in testa e in fondo al preventivo servono alle condizioni: validità, acconto richiesto, cosa non è compreso.",
        ],
      },
      {
        title: 'Inviare e seguire',
        paragraphs: [
          "Quando il preventivo è pronto, parte per e-mail con il PDF e il link al portale cliente, dove il cliente può firmare online. Il preventivo passa a Inviato e vede lo stato cambiare quando il cliente accetta. Con il piano Entreprise sa anche quando il cliente ha aperto il preventivo.",
          "Se il cliente chiede una modifica, duplichi o modifichi il preventivo invece di crearne uno nuovo: lo storico resta legato allo stesso cliente e allo stesso cantiere.",
        ],
      },
    ],
    faq: [
      { q: 'Quanti preventivi posso creare?', a: 'Quanti ne vuole: preventivi e fatture sono illimitati in tutti i piani.' },
      { q: 'Il preventivo può partire in francese o in tedesco?', a: 'Sì, dal piano Team: ogni documento può uscire nella lingua del cliente.' },
      { q: 'Cosa succede quando il cliente firma?', a: "Il preventivo passa ad Accettato, la firma viene registrata con data e ora e la fattura corrispondente viene creata. Non deve ricopiare nulla." },
    ],
  },
  'devis-trames': {
    sections: [
      {
        title: 'Quando creare un modello',
        paragraphs: [
          "Un modello conviene appena lo stesso gruppo di voci torna da un preventivo all'altro: un bagno tipo, un tetto, un forfait di manutenzione annuale. Lo compila una volta con le descrizioni, le unità e i prezzi giusti, poi adatta solo le quantità.",
          "Un modello non blocca nulla: una volta inserito in un preventivo, ogni voce resta modificabile. Se i Suoi prezzi cambiano, aggiorni il modello e i prossimi preventivi partiranno con i nuovi importi, senza toccare quelli già inviati.",
        ],
      },
      {
        title: 'Una libreria ordinata',
        paragraphs: [
          "Dia a ogni modello un nome che tutto il team capisce («Bagno completo 6 m²» invece di «BAGNO2»). Elimini quelli che non servono più: l'elenco resta corto e si trova quello giusto in pochi secondi. Il piano Essentiel comprende fino a 40 modelli, Team ed Entreprise non hanno limiti.",
        ],
      },
    ],
    faq: [
      { q: 'Un modello modificato cambia i miei vecchi preventivi?', a: 'No. I preventivi già creati mantengono le loro voci. Il modello serve solo ai prossimi.' },
      { q: 'Posso partire da un preventivo esistente?', a: 'Sì, con «Salva come modello» nel menu del preventivo.' },
      { q: 'Tutto il team vede i modelli?', a: "Sì, i modelli appartengono all'azienda e sono condivisi da tutti quelli che creano preventivi." },
    ],
  },
  'facturation-acomptes': {
    sections: [
      {
        title: 'Un esempio concreto',
        paragraphs: [
          "Preventivo accettato di CHF 20'000.–. Fattura un acconto del 30 % all'ordine, cioè CHF 6'000.–, poi un secondo acconto del 30 % a metà cantiere. Alla fine la fattura finale riprende il totale del preventivo e deduce i CHF 12'000.– già fatturati: restano CHF 8'000.– da pagare, più gli eventuali lavori supplementari accettati.",
          "Per i cantieri lunghi fatturati secondo l'avanzamento, gli stati d'avanzamento fatturano la percentuale realmente eseguita a ogni tappa, e solo la differenza rispetto allo stato precedente.",
        ],
      },
      {
        title: 'Pagamenti e stati',
        paragraphs: [
          "Una fattura passa da Bozza, Pronta, Inviata, Parzialmente pagata a Pagata. Una fattura inviata con la scadenza superata viene segnalata in ritardo. Ogni pagamento registrato aggiorna il saldo. L'abbinamento con il riferimento QR, o l'importazione di un estratto conto, evita di registrare ogni pagamento a mano.",
        ],
      },
    ],
    faq: [
      { q: 'Posso fare più acconti sullo stesso preventivo?', a: 'Sì. La fattura finale li deduce tutti automaticamente.' },
      { q: 'E se annullo un acconto?', a: 'La deduzione viene ricalcolata: il saldo della fattura finale resta corretto.' },
      { q: 'Le fatture hanno la sezione QR?', a: 'Sì, tutte le fatture includono la sezione QR svizzera con il riferimento di pagamento.' },
    ],
  },
  'facturation-email-lien': {
    sections: [
      {
        title: "Il testo dell'e-mail",
        paragraphs: [
          "Il testo che accompagna un preventivo, una fattura o un promemoria si regola una volta in Account → E-mail. Gli elementi tra parentesi graffe (nome del cliente, numero, importo) vengono compilati automaticamente all'invio. Il PDF allegato e il link sicuro al documento vengono sempre aggiunti sotto.",
          "Gli invii e le risposte dei clienti si ritrovano nella sezione E-mail, con il loro seguito. Se l'indirizzo del cliente rifiuta l'e-mail, ne viene avvisato per correggere l'indirizzo e reinviare.",
        ],
      },
      {
        title: 'Inviare da sé o tramite Cantia',
        paragraphs: [
          "L'invio tramite Cantia tiene tutto nello stesso posto: data d'invio, apertura del link, firma. Il link copiato resta utile per un cliente che preferisce WhatsApp, ma il seguito dell'invio è allora a carico Suo.",
        ],
      },
    ],
    faq: [
      { q: "Bisogna generare il PDF prima dell'invio?", a: 'Sì, il PDF deve esistere per essere allegato. Si genera appena il documento esce dalla bozza.' },
      { q: 'Il link scade?', a: "Il link resta valido, ma si apre solo dopo la verifica dell'indirizzo e-mail del cliente indicato sul documento." },
      { q: 'Il cliente può pagare dal link?', a: 'Vede il dettaglio, il saldo e la fattura QR. Il pagamento si fa poi dalla sua banca, come per ogni fattura QR.' },
    ],
  },
  'chantiers-rapports': {
    sections: [
      {
        title: 'Tenere il diario giorno per giorno',
        paragraphs: [
          "Il diario di cantiere funziona bene quando ognuno pubblica ciò che fa nel momento in cui lo fa: una foto prima di chiudere un soffitto, un messaggio quando arriva una consegna, una nota quando il cliente chiede un cambiamento. Queste voci diventano la memoria del cantiere, datata e condivisa da tutto il team.",
          'I messaggi si dettano: a fine giornata dica cosa è stato fatto e cosa resta, Cantia lo scrive per Lei.',
        ],
      },
      {
        title: 'Un rapporto pronto da inviare',
        paragraphs: [
          "Per un rapporto settimanale al committente o all'architetto, selezioni le voci della settimana e generi il PDF. Il testo di sintesi proposto dall'IA si rilegge e si corregge prima dell'esportazione. Il rapporto porta il logo e il colore della Sua azienda.",
        ],
      },
    ],
    faq: [
      { q: 'Le foto sono datate?', a: 'Sì, ogni foto del diario ha data, ora e posizione, il che la rende una prova utile in caso di contestazione.' },
      { q: 'Posso lavorare senza rete?', a: 'Sì, le foto scattate offline si sincronizzano appena torna la connessione.' },
      { q: 'Chi vede il diario di un cantiere?', a: "I membri dell'azienda che hanno accesso a quel cantiere, secondo il loro ruolo." },
    ],
  },
  rentabilite: {
    sections: [
      {
        title: 'Leggere il margine di un cantiere',
        paragraphs: [
          "Il margine è l'importo preventivato (preventivo accettato e lavori supplementari accettati) meno i costi reali: materiale, manodopera e subappaltatori. Compare in franchi e in percentuale e si aggiorna a ogni spesa o ora aggiunta.",
          "Perché sia giusto bastano due abitudini: collegare ogni spesa al cantiere giusto e registrare le ore sul cantiere in cui sono state fatte. Il costo orario medio, impostato da un amministratore, deve riflettere il vero costo di un'ora (salario, oneri, vacanze), non solo il salario.",
        ],
      },
      {
        title: 'Reagire prima della fine',
        paragraphs: [
          "Guardare la redditività a metà cantiere, e non solo alla fine, permette ancora di agire: fatturare un extra dimenticato con un lavoro supplementare, rivedere il team assegnato o correggere il prossimo preventivo dello stesso tipo.",
        ],
      },
    ],
    faq: [
      { q: 'Quale piano serve?', a: 'La redditività per cantiere è inclusa dal piano Team.' },
      { q: 'Le ore vengono contate automaticamente?', a: 'Sì, le ore registrate sul cantiere vengono valorizzate al costo orario definito.' },
      { q: 'Le fatture dei subappaltatori contano?', a: 'Sì, si aggiungono al costo reale del cantiere a cui sono collegate.' },
    ],
  },
  planning: {
    sections: [
      {
        title: 'Organizzare la settimana',
        paragraphs: [
          "La pianificazione si legge per giorno o per settimana. Ogni assegnazione collega una persona a un cantiere per uno o più giorni. Si vede a colpo d'occhio chi è dove, chi è libero e a quale cantiere manca personale.",
          'Quando due cantieri si contendono le stesse persone, la pianificazione lo mostra prima del lunedì mattina, non sul posto. Basta spostare un\'assegnazione per correggere.',
        ],
      },
      {
        title: 'Dalla pianificazione al cantiere',
        paragraphs: [
          "Ogni assegnazione rimanda a un vero cantiere: dalla pianificazione si ritrovano direttamente i suoi rapporti, le foto e i preventivi. I membri del team vedono la propria pianificazione sul telefono e sanno dove vanno il giorno dopo.",
          "Per un cantiere diviso in fasi, il programma lavori (diagramma delle tappe) proposto dall'IA a partire dal preventivo aiuta a fissare l'ordine e la durata dei lavori, che poi adatta.",
        ],
      },
    ],
    faq: [
      { q: 'Quale piano serve?', a: 'La pianificazione è inclusa dal piano Team.' },
      { q: 'La pianificazione sostituisce la registrazione delle ore?', a: 'No. Serve da stima finché non ci sono ore registrate, poi le ore reali prendono il sopravvento per la redditività.' },
      { q: 'I dipendenti vedono la pianificazione?', a: 'Sì, ognuno vede le proprie assegnazioni dal telefono.' },
    ],
  },
  metre: {
    sections: [
      {
        title: 'Come funziona',
        paragraphs: [
          "Il computo metrico si trova in ogni cantiere. Lì si dettagliano le quantità posizione per posizione: una descrizione, un'unità (m², m³, ml, pezzo, ora…) e le misure che danno la quantità. Il totale di ogni posizione e il totale del computo si calcolano man mano.",
          'In cantiere la tabella si usa dal telefono, il che evita di annotare su un quaderno e ricopiare tutto in ufficio. Le misure restano legate al cantiere e si ritrovano più tardi se il cliente contesta una quantità.',
        ],
      },
      {
        title: 'Dal computo al preventivo',
        paragraphs: [
          "Il pulsante «Crea un preventivo da questo computo metrico» genera un preventivo precompilato con una voce per posizione e le quantità misurate. Resta da controllare i prezzi unitari, spesso già proposti dal Catalogo per le posizioni già fatturate.",
          "Per un capitolato ricevuto da un architetto o da un committente, il modulo Compilare un capitolato (beta) permette di importare il documento ricevuto, inserire i Suoi prezzi e rinviare il PDF compilato.",
        ],
      },
    ],
    faq: [
      { q: 'Dove si attiva il computo metrico?', a: 'Nelle impostazioni del cantiere, con gli altri strumenti propri del cantiere.' },
      { q: 'Il preventivo generato resta modificabile?', a: "Sì, è un preventivo normale: voci, prezzi e testi si modificano prima dell'invio." },
      { q: 'Il computo viene eliminato con il cantiere?', a: 'Sì, eliminando un cantiere si elimina anche il suo computo. I preventivi già creati restano.' },
    ],
  },
  inventaire: {
    sections: [
      {
        title: 'Una base di prezzi che si costruisce da sola',
        paragraphs: [
          "Non serve riempire il Catalogo prima di iniziare. Ogni preventivo lo alimenta: dopo qualche settimana le Sue posizioni abituali ci sono, con l'unità e l'ultimo prezzo praticato. È ciò che permette di calcolare un nuovo preventivo in pochi minuti.",
          "Il Catalogo segnala anche un prezzo che si discosta molto dai Suoi prezzi abituali per la stessa posizione. Utile per accorgersi di un errore di battitura prima che il preventivo parta.",
        ],
      },
      {
        title: 'Importare ciò che ha già',
        paragraphs: [
          "Se tiene già un listino in Excel, lo esporti in CSV e lo importi: le colonne descrizione, unità e prezzo vengono riconosciute automaticamente. L'esportazione del Catalogo fornisce in ogni momento un file aggiornato, per esempio per la revisione annuale dei prezzi.",
          "Con l'integrazione Bexio (dal piano Team) si possono riprendere anche le posizioni del Suo catalogo Bexio.",
        ],
      },
    ],
    faq: [
      { q: 'Il Catalogo gestisce un magazzino?', a: 'No. È una libreria di posizioni e prezzi, non un controllo del materiale in magazzino.' },
      { q: 'Modificare una posizione cambia i miei vecchi preventivi?', a: 'No, solo i prossimi.' },
      { q: 'Posso eliminare una posizione?', a: 'Sì, dal Catalogo, in qualsiasi momento.' },
    ],
  },
  'equipe-modules': {
    sections: [
      {
        title: 'Invitare qualcuno',
        paragraphs: [
          "In Account → Team copi il link d'invito e lo invii al collega (e-mail, SMS, WhatsApp). Iscrivendosi con questo link entra direttamente nella Sua azienda. Poi sceglie il suo ruolo: vede solo ciò che quel ruolo permette.",
          'Il numero di membri dipende dal piano: fino a 3 con Essentiel, 10 con Team, 25 con Entreprise. Oltre, l\'offerta Sur mesure si adatta alla Sua dimensione.',
        ],
      },
      {
        title: 'Scegliere i moduli',
        paragraphs: [
          "Account → Moduli attivati regola le sezioni visibili per tutto il team. Gli strumenti propri di un cantiere (documenti, foto, computo metrico, subappaltatori, redditività) si scelgono separatamente nelle impostazioni di ogni cantiere. Una piccola impresa può così tenere un'app molto semplice e aggiungere man mano.",
        ],
      },
    ],
    faq: [
      { q: "Un membro che se n'è andato mantiene l'accesso?", a: "No, lo tolga da Account → Team e non ha più accesso. I documenti che ha creato restano nell'azienda." },
      { q: 'Posso creare ruoli miei?', a: 'Sì, con diritti scelti. Il piano Essentiel ne comprende due, Team ed Entreprise senza limiti.' },
      { q: 'Un modulo costa di più?', a: 'No, i moduli del Suo piano sono compresi nel prezzo.' },
    ],
  },
  'personnalisation-abonnement': {
    sections: [
      {
        title: 'I tre piani in breve',
        paragraphs: [
          "Essentiel (CHF 39.– al mese): preventivi, fatture e rapporti illimitati, fattura QR, contabilità e IVA, fino a 3 membri e 5 GB. Team (CHF 79.–): pianificazione, redditività, liquidità, salari, Bexio, documenti nella lingua del cliente, fino a 10 membri e 15 GB. Entreprise (CHF 129.–): seguito commerciale, promemoria automatici dei preventivi, fino a 25 membri e 40 GB. La fatturazione annuale costa il 20 % in meno.",
          'Può cambiare piano in qualsiasi momento da Account → Abbonamento. Il passaggio a un piano superiore è immediato.',
        ],
      },
      {
        title: 'Prova e disdetta',
        paragraphs: [
          "La prova dura 14 giorni con tutte le funzioni del piano scelto. Durante la prova non viene addebitato nulla, e può disdire online prima della fine senza pagare niente. Dopo la prova l'abbonamento parte e si gestisce dalla stessa schermata, fatture comprese.",
        ],
      },
    ],
    faq: [
      { q: "I prezzi comprendono l'IVA?", a: 'Fanno stato i prezzi della pagina Tariffe. La Sua fattura Stripe dettaglia l\'importo.' },
      { q: 'Voglio recuperare i miei dati prima di andarmene?', a: 'I Suoi preventivi e fatture esistono in PDF, e gli elenchi si esportano. Per il resto scriva a info@cantia.ch.' },
      { q: 'Ho ricevuto un codice personale, dove lo inserisco?', a: 'Nella schermata di scelta del piano, con «Ha un piano personale?».' },
    ],
  },
  'tableau-de-bord': {
    sections: [
      {
        title: 'Cosa si guarda ogni mattina',
        paragraphs: [
          "La Dashboard risponde a tre domande: cosa aspetta una risposta (preventivi inviati), cosa deve entrare (fatture aperte e in ritardo) e a che punto sono i cantieri in corso. Ogni indicatore apre l'elenco corrispondente, già filtrato.",
          'Una fattura in ritardo si vede subito, con l\'importo e i giorni di ritardo. Spesso è il momento di inviare un promemoria, direttamente dalla fattura.',
        ],
      },
      {
        title: 'Sul telefono',
        paragraphs: [
          "Sul telefono la Dashboard passa a una sola colonna, con le scorciatoie in alto. Il pulsante microfono in basso permette di aggiungere ore o una spesa a voce, senza lasciare la Dashboard.",
          "Le notifiche (campanella in alto) segnalano cosa è appena successo: un preventivo firmato, un'e-mail di un cliente, una fattura che passa in ritardo. Si regolano in Account → Notifiche.",
        ],
      },
    ],
    faq: [
      { q: 'Perché non vedo gli importi?', a: "I dati finanziari dipendono dal Suo ruolo. Un amministratore può darLe l'accesso." },
      { q: 'Gli indicatori sono aggiornati?', a: 'Sì, vengono calcolati a ogni apertura a partire dai Suoi documenti.' },
      { q: 'Posso ricevere le notifiche per e-mail?', a: 'Sì, tipo per tipo, in Account → Notifiche.' },
    ],
  },
  'rejoindre-organisation': {
    sections: [
      {
        title: "Con un link d'invito",
        paragraphs: [
          "Apra il link ricevuto, crei il Suo account con il Suo indirizzo e-mail e arriva direttamente nell'azienda. Non c'è un piano da scegliere né un pagamento da fare: La copre l'abbonamento dell'azienda.",
          "Se il link non funziona più, ne chieda uno nuovo all'amministratore: lo copia da Account → Team.",
        ],
      },
      {
        title: 'Senza link',
        paragraphs: [
          "All'iscrizione scelga di aderire a un'azienda esistente e la cerchi per nome. L'amministratore riceve una notifica, accetta o rifiuta la richiesta, e Lei viene avvisato appena ha risposto. Nel frattempo nulla dell'azienda è visibile.",
        ],
      },
    ],
    faq: [
      { q: 'Il mio capo deve pagare per me?', a: "Il Suo accesso fa parte dell'abbonamento dell'azienda, nel limite di membri del suo piano." },
      { q: "Ho sbagliato azienda, cosa faccio?", a: "Chieda all'amministratore di quell'azienda di toglierLa, poi aderisca a quella giusta." },
      { q: "Cosa vede l'azienda del mio account?", a: 'Il Suo nome, la Sua e-mail e ciò che registra per lei: ore, spese, messaggi di cantiere.' },
    ],
  },
  'dictee-vocale': {
    sections: [
      {
        title: 'Dettare bene',
        paragraphs: [
          "Parli come parlerebbe a un collega, senza dettare la punteggiatura. Per una voce di preventivo dia il lavoro, la quantità, l'unità e il prezzo nella stessa frase. Per le ore dia il cantiere o il cliente, gli orari e cosa è stato fatto.",
          'La dettatura funziona in italiano, francese e tedesco e riconosce la lingua da sola. Nel rumore di un cantiere aiuta avvicinare il telefono.',
        ],
      },
      {
        title: 'Niente viene salvato senza di Lei',
        paragraphs: [
          "L'assistente mostra sempre cosa ha capito prima di salvare: cantiere, ore, importo, categoria. Corregge a mano o ridetta. Gli utilizzi dell'assistente IA vengono contati al mese: 150 con Essentiel, 600 con Team, 2'000 con Entreprise.",
        ],
      },
    ],
    faq: [
      { q: 'Le mie registrazioni vengono conservate?', a: 'No. L\'audio serve alla trascrizione, poi il file temporaneo viene eliminato. Resta solo il testo.' },
      { q: 'Serve una connessione?', a: 'Sì, al momento della dettatura, perché la trascrizione avviene su server sicuri.' },
      { q: 'Capisce il dialetto?', a: "Funziona meglio con l'italiano standard. Il vocabolario dell'edilizia e i numeri vengono riconosciuti bene." },
    ],
  },
  'chantiers-documents': {
    sections: [
      {
        title: "Un ordine che regge nel tempo",
        paragraphs: [
          "Crei le stesse cartelle in ogni cantiere (piani, autorizzazioni, contratti, fornitori, foto di consegna): tutto il team sa dove cercare, e un cantiere ripreso due anni dopo si capisce in pochi minuti.",
          "I piani si consultano in cantiere dal telefono o dal tablet, senza stamparli a ogni nuova versione. Tenga la vecchia versione in una sottocartella invece di sovrascriverla, per sapere su quale base è stato fatto un lavoro.",
        ],
      },
      {
        title: 'Archiviazione',
        paragraphs: [
          'Ogni piano ha il suo spazio: 5 GB con Essentiel, 15 GB con Team, 40 GB con Entreprise. Account → Archiviazione mostra cosa occupa spazio, per tipo di file. I file sono ospitati in Svizzera.',
        ],
      },
    ],
    faq: [
      { q: 'Posso condividere un documento con il cliente?', a: 'Preventivi, fatture e lavori supplementari si condividono tramite il portale cliente. Gli altri documenti si scaricano e si inoltrano.' },
      { q: 'Quali file sono accettati?', a: 'PDF, immagini e file Office, tra gli altri. I più comuni si aprono in anteprima.' },
      { q: 'Cosa succede se elimino il cantiere?', a: 'I suoi documenti e le foto vengono eliminati con lui. Preventivi e fatture restano.' },
    ],
  },
  'chantiers-sous-traitants': {
    sections: [
      {
        title: 'Seguire ciò che si affida',
        paragraphs: [
          "Sul cantiere la scheda Subappaltatori elenca le imprese che intervengono, con le loro fatture e ciò che resta da pagare. A fine cantiere sa esattamente quanto è costato il subappalto, senza riprendere i raccoglitori.",
          'Registri ogni fattura ricevuta appena arriva, con la sua scadenza: compare nella previsione di Liquidità, il che evita brutte sorprese a fine mese.',
        ],
      },
      {
        title: 'Perché conta per il margine',
        paragraphs: [
          "Un subappalto rappresenta spesso una grossa parte del costo di un cantiere. Se non viene contato, il margine mostrato è troppo bello. Collegandolo al cantiere, la scheda Redditività mostra un margine realistico, da confrontare con quello previsto nel preventivo.",
          "Per i lavori affidati, conservi anche il contratto o l'offerta del subappaltatore nei documenti del cantiere: è la base in caso di disaccordo su cosa era compreso.",
        ],
      },
    ],
    faq: [
      { q: 'Devo reinserire un subappaltatore a ogni cantiere?', a: 'No, la rubrica dei subappaltatori permette di sceglierlo in pochi clic.' },
      { q: 'Il subappaltatore ha accesso a Cantia?', a: 'No, compare come contatto. Non ha un account nella Sua azienda.' },
      { q: 'Dove si attiva questa scheda?', a: 'Nelle impostazioni del cantiere.' },
    ],
  },
  'travaux-supplementaires': {
    sections: [
      {
        title: 'Il riflesso giusto sul posto',
        paragraphs: [
          "Il cliente chiede un cambiamento mentre è in cantiere: crei subito il lavoro supplementare dal telefono, detti la descrizione e il prezzo e lo invii. Il cliente lo firma online il giorno stesso, prima che il lavoro venga fatto. Niente più discussioni tre mesi dopo su cosa era stato detto.",
        ],
      },
      {
        title: 'Seguito e fatturazione',
        paragraphs: [
          "Ogni lavoro supplementare conserva data, firma e stato. Accettato, diventa una fattura o confluisce nella fattura finale del cantiere. L'elenco dei lavori supplementari del cantiere mostra cosa è firmato, in attesa o rifiutato.",
          'Registri anche i piccoli extra: a fine cantiere sono spesso diversi lavori minori che insieme fanno un importo importante.',
        ],
      },
    ],
    faq: [
      { q: 'Serve un preventivo originale?', a: 'No, un lavoro supplementare può essere collegato al preventivo originale o creato da solo sul cantiere.' },
      { q: 'Il cliente deve creare un account per firmare?', a: "No, firma dal link ricevuto per e-mail, dopo la verifica del suo indirizzo." },
      { q: 'Il margine del cantiere viene aggiornato?', a: "Sì, un lavoro supplementare accettato aumenta l'importo preventivato del cantiere." },
    ],
  },
  'rh-heures-salaires': {
    sections: [
      {
        title: 'Impostare i salari',
        paragraphs: [
          "Per ogni dipendente indichi nella sua scheda il salario (mensile o orario), le aliquote dei contributi e, se del caso, l'aliquota dell'imposta alla fonte. I valori proposti sono indicativi: riprenda quelli della Sua cassa di compensazione, della Sua cassa pensione e del Suo assicuratore infortuni.",
          "Per un salario orario senza vacanze fisse, l'indennità di vacanza (8,33 % per 4 settimane, 10,64 % per 5 settimane) si aggiunge alla busta paga. Anche la tredicesima si regola per dipendente.",
        ],
      },
      {
        title: 'Ogni mese',
        paragraphs: [
          "A fine mese verifichi le ore, poi generi le buste paga: Cantia calcola dal lordo al netto con le ore registrate e le spese. Ogni dipendente riceve la sua busta paga e la ritrova nel suo spazio. La scrittura contabile dei salari può essere generata per la contabilità, e il certificato di salario annuale si prepara dagli stessi dati.",
        ],
      },
    ],
    faq: [
      { q: 'Quale piano serve?', a: 'I salari sono inclusi dal piano Team.' },
      { q: 'Le aliquote sono aggiornate?', a: 'Le aliquote legali di base sono precompilate, ma verifichi sempre quelle delle Sue casse e del Suo cantone.' },
      { q: 'Il mio fiduciario può vedere i salari?', a: "Sì, se gli dà accesso da Account → Fiduciario." },
    ],
  },
  'rh-heures-guide': {
    sections: [
      {
        title: 'Le buone abitudini',
        paragraphs: [
          "La cosa più affidabile è registrare ogni giorno, a fine giornata, dal cantiere. Una settimana ricostruita il venerdì dimentica sempre qualcosa. Il tipo di lavoro (posa, trasporto, pulizia…) si sceglie a ogni voce e permette poi di fatturare per categoria.",
          'Le spese del giorno (pasti, chilometri) si aggiungono nella stessa voce, il che evita scontrini persi a fine mese.',
        ],
      },
      {
        title: 'Dalla registrazione alla fattura',
        paragraphs: [
          "Per un cantiere fatturato in economia, la scheda Fatturazione di Personale → Ore mostra le ore non ancora fatturate per cantiere e per tipo. La fattura creata riprende ore e tariffe, e le ore fatturate non ricompaiono più. Per un cantiere a forfait, le stesse ore servono al calcolo della redditività.",
        ],
      },
    ],
    faq: [
      { q: 'Un dipendente può correggere le sue ore?', a: 'Sì, dal suo foglio ore, aprendo la voce da correggere.' },
      { q: 'Si può registrare per qualcun altro?', a: 'Un responsabile con il ruolo adatto può registrare le ore di un membro del team.' },
      { q: "Cosa contiene l'esportazione CSV?", a: 'Le ore del periodo mostrato, con data, persona, cantiere e tipo di lavoro.' },
    ],
  },
  tresorerie: {
    sections: [
      {
        title: 'Leggere la curva',
        paragraphs: [
          "La curva parte dal saldo inserito, aggiunge le fatture clienti attese alla loro scadenza e toglie i salari nel giorno di paga, le fatture dei subappaltatori e le spese ricorrenti. Il punto più basso dei 90 giorni è quello da tenere d'occhio.",
          'Una fattura cliente in ritardo resta nella previsione, ma viene segnalata: se il calo dipende da lei, è la prima da sollecitare.',
        ],
      },
      {
        title: 'Aggiornare in due minuti',
        paragraphs: [
          "Una volta alla settimana aggiorni il saldo bancario e controlli i pagamenti ricevuti (l'importazione di un estratto CAMT li abbina in una volta). La previsione resta affidabile senza dedicarle più tempo.",
        ],
      },
    ],
    faq: [
      { q: 'Quale piano serve?', a: 'La liquidità è inclusa dal piano Team.' },
      { q: 'Cantia accede al mio conto bancario?', a: "No. Il saldo si inserisce a mano, e l'estratto conto è un file che sceglie Lei di caricare." },
      { q: 'Gli acquisti occasionali contano?', a: 'No, la previsione considera solo ciò che è ricorrente o atteso. Gli acquisti occasionali compaiono in Spese.' },
    ],
  },
  depenses: {
    sections: [
      {
        title: 'Scansionare uno scontrino',
        paragraphs: [
          "Fotografi lo scontrino o la fattura del fornitore: fornitore, data e importo vengono letti automaticamente. Verifichi, scelga il cantiere se l'acquisto lo riguarda, e salvi. La foto resta legata alla spesa come giustificativo.",
          'Le spese dettate a voce arrivano nello stesso posto. Un rapido sguardo all\'elenco a fine settimana basta per verificare che ogni acquisto sia sul cantiere giusto.',
        ],
      },
      {
        title: 'Per la contabilità',
        paragraphs: [
          "I filtri per periodo e per cantiere danno un totale in un attimo, per esempio per preparare l'IVA del trimestre. Il Suo fiduciario può accedere ai giustificativi se gli apre l'accesso da Account → Fiduciario, senza spedire raccoglitori.",
        ],
      },
    ],
    faq: [
      { q: 'Una spesa può cambiare cantiere?', a: 'Sì, modificandola dalla redditività del cantiere.' },
      { q: 'Cosa fare con uno scontrino illeggibile?', a: "Inserisca l'importo e il fornitore a mano, la foto resta come giustificativo." },
      { q: 'Le spese ricorrenti si ripetono da sole?', a: 'Sì, con un promemoria prima di ogni scadenza.' },
    ],
  },
  clients: {
    sections: [
      {
        title: 'Una scheda ben compilata',
        paragraphs: [
          "Indichi l'indirizzo di fatturazione esatto, l'e-mail che riceve i documenti e la lingua del cliente. Sono queste informazioni a finire su ogni preventivo e fattura, e l'e-mail serve anche a proteggere l'accesso al portale cliente.",
          "Per un'amministrazione immobiliare o un'impresa, tenga una sola scheda per società e indichi l'indirizzo del cantiere su ogni cantiere, invece di creare un cliente per stabile.",
        ],
      },
      {
        title: 'Ritrovare lo storico',
        paragraphs: [
          "La scheda riunisce tutti i documenti del cliente, dal primo preventivo all'ultima fattura, con il loro stato. Prima di richiamare un cliente basta uno sguardo per sapere cosa è in corso, cosa è stato accettato e cosa resta da pagare.",
          'I clienti esistenti si importano da un file Excel o CSV (Account → Importazione dati), o da Bexio se usa l\'integrazione.',
        ],
      },
    ],
    faq: [
      { q: 'Come evitare i doppioni?', a: 'Cerchi il cliente prima di crearne uno nuovo: al momento del preventivo Cantia propone le schede esistenti.' },
      { q: 'Il cliente vede la sua scheda?', a: 'No, vede solo i documenti che gli invia tramite il portale cliente.' },
      { q: "Un privato e un'impresa sono uguali?", a: 'Sì, una scheda cliente serve a entrambi. Indichi semplicemente il nome della società quando c\'è.' },
    ],
  },
  'sous-traitants': {
    sections: [
      {
        title: 'Costruire la propria rete',
        paragraphs: [
          "Aggiunga ogni subappaltatore una volta: nome dell'impresa, contatto, telefono, e-mail, mestiere. La rubrica diventa la Sua agenda dei partner, condivisa da tutto il team, invece di essere sparsa nei telefoni.",
          'Il mestiere permette di ritrovare in fretta un elettricista o un lattoniere disponibile quando un cantiere ne ha bisogno.',
        ],
      },
      {
        title: 'Fatture e pagamenti',
        paragraphs: [
          "Ogni fattura ricevuta si registra con importo, scadenza e stato. Il totale da pagare a ogni subappaltatore si vede a colpo d'occhio, cantiere per cantiere. Gli importi dovuti compaiono anche nella previsione di liquidità.",
          "Per i lotti importanti, conservi l'offerta e il contratto del subappaltatore nei documenti del cantiere, accanto alle sue fatture.",
        ],
      },
    ],
    faq: [
      { q: 'Dove si attiva il modulo?', a: 'In Account → Moduli attivati.' },
      { q: 'Posso vedere tutto ciò che ho pagato a un subappaltatore?', a: 'Sì, la sua scheda raggruppa le sue fatture su tutti i cantieri.' },
      { q: 'Il subappaltatore riceve un accesso?', a: 'No, è un contatto nella Sua rubrica, senza account Cantia.' },
    ],
  },
  'integration-bexio': {
    sections: [
      {
        title: 'Collegare Bexio',
        paragraphs: [
          "In Account → Integrazioni scelga Bexio e acceda con il Suo account Bexio abituale. Autorizza Cantia a scambiare i dati necessari; Cantia non vede mai la Sua password. Il collegamento richiede un minuto.",
          'I clienti viaggiano nei due sensi: un cliente creato in Bexio arriva in Cantia, un cliente creato in Cantia va in Bexio, con una sincronizzazione regolare.',
        ],
      },
      {
        title: 'Una ripartizione chiara',
        paragraphs: [
          "Cantia resta lo strumento del cantiere e dei documenti (preventivi, cantieri, ore, fatture), Bexio quello della contabilità. Ogni fattura inviata arriva in Bexio come bozza: il Suo fiduciario o Lei la convalidate, così non ci sono due persone che contabilizzano la stessa cosa.",
        ],
      },
    ],
    faq: [
      { q: 'Quale piano serve?', a: "L'integrazione Bexio è inclusa dal piano Team." },
      { q: 'Serve un abbonamento Bexio particolare?', a: "Serve un account Bexio con accesso all'API. I piani attuali di Bexio di solito lo permettono, verifichi il Suo." },
      { q: 'Cosa succede se scollego?', a: 'Gli scambi si fermano subito. I dati già presenti da entrambe le parti restano.' },
    ],
  },
  'relances-impayes': {
    sections: [
      {
        title: 'Inviare un promemoria',
        paragraphs: [
          "Da una fattura in ritardo, il pulsante «Invia un promemoria» invia al cliente il testo di sollecito previsto, con la fattura e il link sicuro. I testi prima e dopo la scadenza si regolano una volta in Account → E-mail, con il nome del cliente e l'importo compilati automaticamente.",
          'Ogni promemoria inviato compare nella sezione E-mail con la sua data: sa chi è stato sollecitato e quando.',
        ],
      },
      {
        title: 'Se il cliente continua a non pagare',
        paragraphs: [
          "Dopo due promemoria senza risposta, una telefonata spesso risolve. Se nulla si muove, resta possibile la procedura esecutiva; il blog di Cantia ne spiega le tappe. I promemoria datati in Cantia aiutano a mostrare che il cliente è stato avvisato.",
        ],
      },
    ],
    faq: [
      { q: 'Posso modificare il testo del promemoria?', a: 'Sì, in Account → E-mail e prima di ogni invio.' },
      { q: 'Cantia aggiunge interessi di mora?', a: 'No, decide Lei. Lo strumento gratuito per gli interessi di mora calcola l\'importo.' },
      { q: 'Come evitare di sollecitare un cliente che ha pagato?', a: "Abbini i pagamenti prima di sollecitare, con il riferimento QR o l'importazione dell'estratto conto." },
    ],
  },
  'import-releve-bancaire': {
    sections: [
      {
        title: 'Ottenere il file',
        paragraphs: [
          "Nell'e-banking cerchi l'esportazione dell'estratto conto in formato CAMT.053 (a volte chiamato «estratto ISO 20022» o «XML»). Scelga il periodo dall'ultima importazione, scarichi il file e lo importi in Cantia.",
          'Se carica un file già importato, Cantia lo segnala per evitare di trattare due volte gli stessi pagamenti.',
        ],
      },
      {
        title: 'Verificare e confermare',
        paragraphs: [
          "Cantia mostra ogni pagamento con la fattura proposta. Le corrispondenze esatte sono già spuntate; quelle proposte per somiglianza di nome attendono la Sua verifica. Confermando, le fatture passano a Pagata o Parzialmente pagata, e la liquidità si aggiorna.",
          "I pagamenti in uscita e le entrate senza fattura restano a parte: può collegarli a una spesa o a un salario già registrati, oppure ignorarli.",
        ],
      },
    ],
    faq: [
      { q: 'Quali banche sono compatibili?', a: 'Ogni banca svizzera che esporta un estratto CAMT.053, come le principali.' },
      { q: 'Cantia si collega alla mia banca?', a: 'No, carica Lei un file. Non viene dato alcun accesso al Suo conto.' },
      { q: 'E se un cliente paga due fatture in una volta?', a: 'Verifichi la proposta e ripartisca il pagamento sulle fatture interessate.' },
    ],
  },
  'portail-client': {
    sections: [
      {
        title: 'Cosa vive il cliente',
        paragraphs: [
          "Il cliente riceve un'e-mail con il Suo testo, il PDF e un pulsante per aprire il documento. Conferma il suo indirizzo e-mail con un codice ricevuto, poi vede il documento con i Suoi colori: voci, totali, condizioni. Su un preventivo firma in fondo alla pagina, senza installare nulla.",
          'La pagina funziona sia sul telefono sia sul computer.',
        ],
      },
      {
        title: 'Cosa vede Lei',
        paragraphs: [
          "Appena il cliente firma, il documento passa ad Accettato in Cantia e riceve una notifica. Firma, data e ora vengono registrate con il documento. Con il piano Entreprise vede anche quando il cliente ha consultato il preventivo, il che aiuta a scegliere il momento giusto per richiamarlo.",
        ],
      },
    ],
    faq: [
      { q: 'Il cliente può rifiutare?', a: 'Sì, può rifiutare il preventivo dal portale. Lei viene avvisato.' },
      { q: 'Una firma online ha valore?', a: "Prova l'accordo del cliente, con data e ora. Per casi particolari chieda consiglio a un giurista." },
      { q: 'Cosa succede se il link viene inoltrato?', a: "Senza accesso all'indirizzo e-mail del cliente il codice non può essere ricevuto e il documento non si apre." },
    ],
  },
};
