import type { TradeLandingPage } from './tradeLandingPages';

export const TRADE_PAGES_IT: Record<string, TradeLandingPage> = {
  charpentier: {
    slug: 'charpentier',
    tradeName: 'Carpentieri',
    seo: {
      title: 'Software di gestione per carpentieri in Svizzera | Cantia',
      description:
        'Gestisca preventivi, cantieri, team, ore e fatture con Cantia, il software di gestione pensato per le imprese di carpenteria in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per carpentieri',
      title: 'Il software che collega i Suoi preventivi, il Suo laboratorio e i Suoi cantieri',
      subtitle:
        'Cantia aiuta le imprese di carpenteria a gestire preventivi, team, ore di montaggio, foto di cantiere e fatturazione da un unico strumento.',
    },
    painPoints: [
      {
        problem: 'Il preventivo aspetta spesso la fine della giornata',
        consequence: 'Il tempo di mettere in ordine prestazioni e prezzi la sera, il cliente ha talvolta già un\'altra offerta in mano.',
        response: 'Prepari la Sua offerta direttamente dal cantiere, con un catalogo di prestazioni di carpenteria già calcolate.',
      },
      {
        problem: 'Il laboratorio e il cantiere non lavorano sempre con la stessa informazione',
        consequence: 'Piani, foto e modifiche restano talvolta bloccati da una parte, il che genera telefonate e fa perdere tempo a entrambi i team.',
        response: 'Ogni cantiere centralizza le proprie foto, osservazioni e documenti, consultabili da tutto il team in tempo reale.',
      },
      {
        problem: 'Le ore di montaggio possono erodere rapidamente il margine',
        consequence: 'Il superamento si nota spesso solo al momento della fatturazione, a cantiere ormai concluso.',
        response: 'Colleghi le ore al cantiere e confronti in diretta quanto previsto con quanto effettivamente necessario.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Preventivi rapidi dai computi metrici', text: 'Calcoli una struttura in legno a partire dai Suoi rilievi, con prestazioni e prezzi già memorizzati.' },
      { icon: 'clock', title: 'Rilevazione delle ore di montaggio', text: 'Ogni ora di team collegata al cantiere giusto, confrontata in tempo reale con il preventivato.' },
      { icon: 'image', title: 'Foto prima/dopo', text: 'Documenti ogni fase del montaggio, consultabile sia dal laboratorio sia dal cantiere.' },
      { icon: 'calendar', title: 'Pianificazione laboratorio + cantiere', text: 'Coordini la preparazione in laboratorio e la posa sul terreno in un\'unica pianificazione.' },
      { icon: 'plus-circle', title: 'Lavori supplementari', text: 'Un adattamento richiesto sul posto si aggiunge direttamente al cantiere, con foto e osservazione.' },
      { icon: 'credit-card', title: 'Fatturazione dal preventivo', text: 'A cantiere concluso, la fattura si genera a partire dal preventivo, senza nuova immissione.' },
    ],
    scenario: {
      title: 'Esempio: risanamento di una struttura di tetto esistente',
      text: 'Dopo il sopralluogo, crea il cliente e prepara l\'offerta. Una volta accettato il cantiere, pianifica il team. Foto e osservazioni restano collegate al progetto. Se il cliente richiede un intervento supplementare, viene registrato direttamente. Alla fine, le informazioni necessarie sono già disponibili per preparare la fattura.',
    },
    comparison: [
      { before: 'Preventivo riscritto la sera su un angolo di tavolo', after: 'Preventivo preparato direttamente dal cantiere' },
      { before: 'Piani e foto dispersi tra laboratorio e cantiere', after: 'Tutto centralizzato per cantiere' },
      { before: 'Ore di montaggio non tracciate', after: 'Ore collegate a ogni cantiere' },
      { before: 'Modifiche in corso d\'opera dimenticate', after: 'Lavori supplementari aggiunti in diretta' },
      { before: 'Fattura inviata diversi giorni dopo il montaggio', after: 'Fattura generata dal preventivo' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a una piccola impresa di carpenteria?',
        answer: 'Sì. Il piano Essentiel copre preventivi, cantieri e fatturazione per un\'azienda che inizia o lavora con un piccolo team, senza i moduli HR/pianificazione utili solo a partire da diversi collaboratori.',
      },
      {
        question: 'Posso tracciare le ore dei miei montatori per cantiere?',
        answer: 'Sì, ogni ora registrata è collegata a un cantiere preciso, il che permette di confrontare il tempo previsto con quello effettivamente dedicato al montaggio.',
      },
      {
        question: 'Si possono aggiungere foto direttamente dal cantiere?',
        answer: 'Sì, direttamente da smartphone o tablet sul posto. Vengono classificate automaticamente per cantiere e possono essere geolocalizzate.',
      },
      {
        question: 'Cantia permette di creare preventivi per lavori di carpenteria?',
        answer: 'Sì, con un catalogo di prestazioni riutilizzabile (legno, assemblaggi, copertura associata) e un calcolo automatico dell\'IVA e dei totali.',
      },
      {
        question: 'Posso utilizzare Cantia insieme a Bexio?',
        answer: 'Sì, l\'integrazione nativa sincronizza clienti, fatture e pagamenti tra Cantia e Bexio, a partire dal piano Team.',
      },
    ],
    relatedTrades: ['menuisier', 'macon'],
  },

  macon: {
    slug: 'macon',
    tradeName: 'Muratori',
    seo: {
      title: 'Software di gestione per imprese di muratura in Svizzera | Cantia',
      description:
        'Tenga sotto controllo team, ore e redditività reale dei Suoi cantieri con Cantia, il software di gestione pensato per le imprese di muratura in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per muratori',
      title: 'Meno carta. Più visibilità sui Suoi cantieri.',
      subtitle:
        'Cantia aiuta le imprese di muratura a tenere sotto controllo team, ore, lavori supplementari e la redditività reale di ogni cantiere.',
    },
    painPoints: [
      {
        problem: 'Ore e rapporti di cantiere vivono sulla carta',
        consequence: 'L\'informazione si perde o deve essere reinserita più tardi, spesso a memoria, diversi giorni dopo.',
        response: 'Registri ore e rapporti direttamente dal cantiere, con foto e osservazioni classificate automaticamente.',
      },
      {
        problem: 'Un lavoro supplementare deciso in piena gettata finisce in un angolo della memoria',
        consequence: 'Senza traccia scritta nel posto giusto, questo lavoro talvolta non viene mai fatturato.',
        response: 'Aggiunga il lavoro supplementare direttamente al cantiere interessato, con una foto se necessario, ripreso automaticamente nella fatturazione.',
      },
      {
        problem: 'Più cantieri in parallelo, una redditività conosciuta troppo tardi',
        consequence: 'Un cantiere può sforare sui materiali o sulle ore senza che nessuno se ne accorga prima della fine.',
        response: 'Confronti in diretta ore, materiali e importo fatturato per individuare uno scostamento prima della fine del cantiere.',
      },
    ],
    usages: [
      { icon: 'file-text', title: 'Rapporti di cantiere con foto', text: 'Note e foto della giornata diventano un rapporto pronto da inviare, per cantiere.' },
      { icon: 'clock', title: 'Rilevazione delle ore di team', text: 'Ogni operaio, ogni cantiere, ogni ora, confrontata con il preventivato.' },
      { icon: 'plus-circle', title: 'Lavori supplementari', text: 'Un imprevisto di cantiere si aggiunge direttamente, senza passare da un quaderno.' },
      { icon: 'trending-up', title: 'Redditività per cantiere', text: 'Preventivato, costo reale e margine visibili cantiere per cantiere, non solo a fine mese.' },
      { icon: 'calendar', title: 'Pianificazione multi-cantiere', text: 'Organizzi più team su più cantieri senza conflitti di risorse.' },
      { icon: 'credit-card', title: 'Preventivi e fatture', text: 'Dal preventivo di grezzo alla fattura finale, senza nuova immissione.' },
    ],
    scenario: {
      title: 'Esempio: un cantiere di grezzo, dallo scavo al collaudo',
      text: 'Il team viene assegnato al cantiere dalla pianificazione. Ore e materiali sono seguiti giorno per giorno. Un rinforzo di fondazione imprevisto viene aggiunto come lavoro supplementare, con una foto a supporto. La redditività del cantiere resta visibile per tutta la durata, non solo dopo l\'invio della fattura.',
    },
    comparison: [
      { before: 'Ore annotate su carta', after: 'Ore collegate al cantiere' },
      { before: 'Rapporto di cantiere ricostruito a memoria', after: 'Rapporto generato dalle foto e note della giornata' },
      { before: 'Lavori supplementari dimenticati', after: 'Lavori aggiunti e fatturati' },
      { before: 'Redditività conosciuta solo alla fine', after: 'Redditività seguita in diretta' },
      { before: 'Un quaderno per cantiere', after: 'Una pianificazione centralizzata per tutti i cantieri' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di muratura con più team?',
        answer: 'Sì, la pianificazione e i ruoli di team permettono di coordinare più team su più cantieri, con un accesso adeguato a ciascuno.',
      },
      {
        question: 'Si possono tracciare le ore per cantiere e per operaio?',
        answer: 'Sì, ogni ora registrata è collegata a un cantiere e alla persona interessata, il che alimenta direttamente la redditività del cantiere.',
      },
      {
        question: 'Come si aggiunge un lavoro supplementare scoperto in corso di cantiere?',
        answer: 'Si aggiunge direttamente dal cantiere, con un\'osservazione o una foto, seguendo poi lo stesso percorso di un preventivo fino alla fatturazione.',
      },
      {
        question: 'Cantia permette di vedere la redditività di un cantiere prima della sua fine?',
        answer: 'Sì, il confronto tra importo preventivato e costo reale (ore, materiali) è disponibile in continuo, non solo al bilancio finale.',
      },
      {
        question: 'Posso gestire più cantieri di muratura in parallelo?',
        answer: 'Sì, la pianificazione centralizza tutti i Suoi cantieri attivi ed evita conflitti di risorse tra i team.',
      },
    ],
    relatedBlogSlugs: ['calculer-prix-de-revient-chantier-batiment'],
    relatedTrades: ['charpentier', 'entreprise-generale'],
  },

  electricien: {
    slug: 'electricien',
    tradeName: 'Elettricisti',
    seo: {
      title: 'Software di gestione per imprese elettriche in Svizzera | Cantia',
      description:
        'Gestisca interventi d\'urgenza, cantieri, pianificazione e fatturazione con Cantia, il software di gestione pensato per le imprese elettriche in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per elettricisti',
      title: 'Gestisca i Suoi interventi d\'urgenza e i Suoi cantieri elettrici in un unico strumento',
      subtitle:
        'Pianificazione, clienti, preventivi, ore, rapporti e fatture: Cantia riunisce l\'attività della Sua impresa elettrica senza moltiplicare le applicazioni.',
    },
    painPoints: [
      {
        problem: 'Un\'urgenza stravolge tutta la pianificazione della giornata',
        consequence: 'Senza una vista condivisa, riorganizzare i tecnici richiede una serie di telefonate, con il rischio di dimenticare un appuntamento previsto.',
        response: 'Una pianificazione centrale, visibile da tutto il team, permette di riassegnare un intervento in pochi secondi.',
      },
      {
        problem: 'Un tecnico arriva sul posto senza lo storico del cliente',
        consequence: 'Scopre l\'impianto sul posto, senza sapere cosa sia già stato fatto o fatturato.',
        response: 'Lo storico cliente (preventivi, fatture, interventi precedenti) è accessibile dal terreno, ancora prima di suonare al campanello.',
      },
      {
        problem: 'Un piccolo intervento non viene fatturato subito',
        consequence: 'Finisce dimenticato nella pila amministrativa, e il relativo denaro non entra mai.',
        response: 'Fatturi direttamente dall\'intervento, con fattura QR svizzera pronta da inviare lo stesso giorno.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Pianificazione team e interventi', text: 'Interventi d\'urgenza e cantieri pianificati nella stessa pianificazione, riorganizzabile in tempo reale.' },
      { icon: 'users', title: 'Scheda cliente con storico', text: 'Ogni intervento, preventivo e fattura di un cliente resta accessibile dal terreno.' },
      { icon: 'mic', title: 'Preventivi rapidi', text: 'Calcoli un intervento o un piccolo cantiere elettrico dal Suo catalogo di prestazioni.' },
      { icon: 'file-text', title: 'Rapporti con foto', text: 'Documenti un impianto o un intervento d\'urgenza con foto e osservazioni, classificate per intervento.' },
      { icon: 'clock', title: 'Ore per intervento', text: 'Segua il tempo effettivamente dedicato a ogni intervento d\'urgenza o cantiere.' },
      { icon: 'credit-card', title: 'Fatturazione QR immediata', text: 'Fattura QR svizzera generata dall\'intervento, senza passare dall\'ufficio.' },
    ],
    scenario: {
      title: 'Esempio: una giornata con più interventi, dall\'urgenza al cantiere pianificato',
      text: 'La giornata inizia con una pianificazione già organizzata. Un\'urgenza si aggiunge in mattinata e riorganizza il team. Ogni intervento è documentato (foto, ore), e la fattura dell\'ultimo intervento d\'urgenza parte la sera stessa, direttamente dal terreno.',
    },
    comparison: [
      { before: 'Pianificazione nella testa del titolare', after: 'Pianificazione condivisa da tutto il team' },
      { before: 'Tecnico senza storico cliente', after: 'Storico cliente accessibile sul terreno' },
      { before: 'Fattura inviata diversi giorni dopo', after: 'Fattura creata dall\'intervento' },
      { before: 'Foto degli interventi disperse', after: 'Foto classificate per intervento' },
      { before: 'Ore non collegate a un intervento preciso', after: 'Ore seguite intervento per intervento' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa elettrica con più tecnici?',
        answer: 'Sì, la pianificazione di team e i ruoli personalizzati permettono di coordinare più tecnici su interventi diversi.',
      },
      {
        question: 'Si possono gestire sia interventi d\'urgenza che cantieri pianificati?',
        answer: 'Sì, entrambi vivono nella stessa pianificazione, riorganizzabile rapidamente quando un\'urgenza si aggiunge nel corso della giornata.',
      },
      {
        question: 'Un tecnico può vedere lo storico di un cliente dal terreno?',
        answer: 'Sì, la scheda cliente (preventivi, fatture, interventi precedenti) è accessibile da telefono o tablet, prima dell\'intervento.',
      },
      {
        question: 'Cantia permette di fatturare rapidamente un piccolo intervento?',
        answer: 'Sì, una fattura con fattura QR svizzera può essere generata direttamente dall\'intervento, senza passare dall\'ufficio.',
      },
      {
        question: 'Posso usare Cantia con Bexio per la mia contabilità?',
        answer: 'Sì, l\'integrazione nativa sincronizza clienti, fatture e pagamenti tra Cantia e Bexio, a partire dal piano Team.',
      },
    ],
    relatedBlogSlugs: ['gestion-chantier-facturation-electricien-suisse'],
    relatedTrades: ['plombier', 'entreprise-generale'],
  },

  plombier: {
    slug: 'plombier',
    tradeName: 'Idraulici',
    seo: {
      title: 'Software di gestione per idraulici e installatori sanitari in Svizzera | Cantia',
      description:
        'Centralizzi interventi, cantieri e fatturazione con Cantia, il software di gestione pensato per le imprese di idraulica e sanitari in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per idraulici',
      title: 'I Suoi interventi non dovrebbero finire su foglietti di carta',
      subtitle:
        'Cantia centralizza i Suoi interventi d\'urgenza, i Suoi cantieri sanitari e la Sua fatturazione, dalla prima chiamata del cliente fino al pagamento.',
    },
    painPoints: [
      {
        problem: 'Un intervento d\'urgenza viene annotato su un foglietto di carta',
        consequence: 'Tra lo spostamento e l\'intervento successivo, l\'informazione (cliente, materiale utilizzato, tempo impiegato) si perde prima di arrivare alla fatturazione.',
        response: 'Registri ogni intervento direttamente, con cliente, materiale utilizzato e ore, appena terminato il cantiere.',
      },
      {
        problem: 'La gestione dei clienti avviene a memoria',
        consequence: 'Difficile ricordare chi ha chiamato, per quale motivo, e se l\'ultima fattura è stata effettivamente pagata.',
        response: 'Uno storico cliente centralizzato (preventivi, fatture, interventi) evita dimenticanze di follow-up e solleciti.',
      },
      {
        problem: 'La fattura di un intervento d\'urgenza si trascina per diversi giorni',
        consequence: 'Durante questo tempo, il relativo denaro non entra nella liquidità.',
        response: 'Generi la fattura QR svizzera direttamente dall\'intervento, sul posto o subito dopo.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Preventivi e interventi rapidi', text: 'Calcoli un intervento d\'urgenza o un piccolo cantiere sanitario in pochi minuti.' },
      { icon: 'users', title: 'Gestione clienti centralizzata', text: 'Storico completo di preventivi, fatture e interventi per cliente.' },
      { icon: 'credit-card', title: 'Fatturazione immediata', text: 'Fattura con fattura QR svizzera generata sul posto, pronta da inviare.' },
      { icon: 'clock', title: 'Ore e spostamenti', text: 'Ogni intervento documentato con il tempo effettivamente impiegato.' },
      { icon: 'image', title: 'Foto prima/dopo', text: 'Una perdita, un impianto, una riparazione: la prova resta con il cantiere.' },
      { icon: 'calendar', title: 'Pianificazione dei tecnici', text: 'Organizzi gli interventi della giornata e reagisca rapidamente a un\'urgenza.' },
    ],
    scenario: {
      title: 'Esempio: un intervento d\'urgenza che diventa un piccolo cantiere',
      text: 'Un cliente chiama per una perdita. L\'intervento viene registrato, una foto della perdita è scattata sul posto. Nel colloquio, viene preparato un preventivo complementare per una riparazione più ampia. Una volta accettato, la fattura del primo intervento parte già, senza attendere la fine del secondo cantiere.',
    },
    comparison: [
      { before: 'Intervento d\'urgenza annotato su un foglietto', after: 'Intervento registrato direttamente, con cliente e materiale' },
      { before: 'Gestione clienti a memoria', after: 'Storico cliente centralizzato' },
      { before: 'Fattura inviata diversi giorni dopo', after: 'Fattura creata sul posto, fattura QR svizzera' },
      { before: 'Foto prima/dopo perse nella galleria del telefono', after: 'Foto classificate per intervento' },
      { before: 'Ore di spostamento non conteggiate', after: 'Ore e spostamenti seguiti per intervento' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a una piccola impresa sanitaria o idraulica?',
        answer: 'Sì, il piano Essentiel copre preventivi, interventi e fatturazione per un idraulico che lavora da solo o in un piccolo team.',
      },
      {
        question: 'Si può fatturare un intervento d\'urgenza direttamente dal terreno?',
        answer: 'Sì, una fattura con fattura QR svizzera può essere generata sul posto, appena terminato l\'intervento.',
      },
      {
        question: 'Cantia gestisce la fattura QR svizzera per le mie fatture?',
        answer: 'Sì, ogni fattura include la ricevuta QR svizzera conforme, su tutti i piani.',
      },
      {
        question: 'Posso ritrovare rapidamente lo storico di un cliente prima di un intervento?',
        answer: 'Sì, la scheda cliente centralizza preventivi, fatture e interventi precedenti, accessibile da smartphone.',
      },
      {
        question: 'Cantia funziona altrettanto bene per le urgenze e per i cantieri pianificati?',
        answer: 'Sì, interventi d\'urgenza e cantieri vivono nella stessa pianificazione, riorganizzabile rapidamente in caso di urgenza.',
      },
    ],
    relatedBlogSlugs: ['devis-facture-plombier-sanitaire-suisse'],
    relatedTrades: ['electricien', 'entreprise-generale'],
  },

  peintre: {
    slug: 'peintre',
    tradeName: 'Pittori',
    seo: {
      title: 'Software di gestione per imprese di pittura in Svizzera | Cantia',
      description:
        'Prepari i Suoi preventivi di pittura più velocemente e tenga sotto controllo superfici, team e lavori supplementari con Cantia, il software di gestione pensato per la Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per pittori',
      title: 'Faccia i Suoi preventivi di pittura più velocemente e segua davvero le Sue ore',
      subtitle:
        'Sa quanti metri quadrati ha fatturato. Cantia L\'aiuta anche a sapere quante ore Le sono realmente costati.',
    },
    painPoints: [
      {
        problem: 'Un preventivo quasi identico al precedente viene rifatto da zero',
        consequence: 'Tempo perso a riscrivere prestazioni comunque molto simili da un cantiere all\'altro.',
        response: 'Un catalogo di prestazioni di pittura riutilizzabile accelera ogni nuovo preventivo.',
      },
      {
        problem: 'Il cliente chiede una variante di finitura durante il sopralluogo',
        consequence: 'Difficile calcolare l\'opzione sul posto senza dover ricalcolare tutto più tardi.',
        response: 'Adatti il preventivo direttamente dal computo metrico e dal catalogo, senza ripartire da zero.',
      },
      {
        problem: 'Le ore reali non vengono mai confrontate con i metri quadrati fatturati',
        consequence: 'Il margine reale di un cantiere resta invisibile, anche quando il preventivo è stato venduto bene.',
        response: 'Colleghi le ore al cantiere e le confronti con il preventivato per sapere quanto Le costa davvero un m².',
      },
    ],
    usages: [
      { icon: 'list', title: 'Catalogo delle prestazioni', text: 'Le Sue prestazioni di pittura (superfici, finiture) memorizzate e riutilizzabili.' },
      { icon: 'mic', title: 'Preventivi con computo metrico delle superfici', text: 'Calcoli rapidamente a partire dalle superfici misurate sul posto.' },
      { icon: 'clock', title: 'Rilevazione delle ore per cantiere', text: 'Confronti il tempo previsto con quello effettivamente impiegato, cantiere per cantiere.' },
      { icon: 'image', title: 'Foto prima/dopo', text: 'Conservi una prova visiva di ogni cantiere, utile in caso di contestazione.' },
      { icon: 'plus-circle', title: 'Lavori supplementari', text: 'Una variante o un ritocco richiesto in corso di cantiere si aggiunge direttamente.' },
      { icon: 'credit-card', title: 'Fatturazione dal preventivo', text: 'La fattura riprende automaticamente le prestazioni convalidate.' },
    ],
    scenario: {
      title: 'Esempio: un preventivo di pittura con varianti di finitura',
      text: 'Dopo il sopralluogo e il computo metrico delle superfici, viene preparato un preventivo con più finiture possibili. Il cantiere accettato viene pianificato, le ore del team vengono seguite giorno per giorno. Il cliente chiede un ritocco in corso d\'opera: viene aggiunto come lavoro supplementare, poi ripreso nella fattura finale.',
    },
    comparison: [
      { before: 'Preventivo rifatto da zero ogni volta', after: 'Catalogo di prestazioni riutilizzabile' },
      { before: 'Superfici ricalcolate a mano', after: 'Computo metrico integrato nel preventivo' },
      { before: 'Ore mai confrontate con i m² fatturati', after: 'Ore seguite e confrontate con il preventivato' },
      { before: 'Variante di finitura difficile da calcolare sul posto', after: 'Adattamento rapido dal catalogo' },
      { before: 'Ritocco dimenticato in fattura', after: 'Lavori supplementari aggiunti al cantiere' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di pittura indipendente?',
        answer: 'Sì, il piano Essentiel copre preventivi, catalogo e fatturazione per un pittore che lavora da solo, senza i moduli di team superflui.',
      },
      {
        question: 'Posso creare un catalogo delle mie prestazioni di pittura abituali?',
        answer: 'Sì, ogni prestazione calcolata in un preventivo arricchisce il Suo catalogo, riutilizzabile al cantiere successivo.',
      },
      {
        question: 'Come gestire una variante di finitura richiesta dal cliente?',
        answer: 'Si aggiunge o si modifica direttamente nel preventivo a partire dal catalogo e dal computo metrico, senza ripartire da zero.',
      },
      {
        question: 'Cantia permette di seguire le ore reali rispetto al preventivo?',
        answer: 'Sì, le ore registrate per cantiere vengono confrontate con l\'importo preventivato per valutare la redditività reale.',
      },
      {
        question: 'Si possono aggiungere foto prima/dopo per ogni cantiere?',
        answer: 'Sì, le foto vengono classificate automaticamente per cantiere e consultabili in qualsiasi momento.',
      },
    ],
    relatedBlogSlugs: ['devis-peintre-batiment-calcul-surface-suisse'],
    relatedTrades: ['menuisier', 'entreprise-generale'],
  },

  menuisier: {
    slug: 'menuisier',
    tradeName: 'Falegnami',
    seo: {
      title: 'Software di gestione per imprese di falegnameria in Svizzera | Cantia',
      description:
        'Segua ogni ordine, dal laboratorio alla posa, con Cantia, il software di gestione pensato per le imprese di falegnameria in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per falegnami',
      title: 'Dal laboratorio alla posa, tenga ogni progetto sotto controllo',
      subtitle:
        'Cantia aiuta le imprese di falegnameria a seguire i loro ordini su misura, le misure, la pianificazione laboratorio/posa e la fatturazione.',
    },
    painPoints: [
      {
        problem: 'Numerosi piccoli ordini girano in parallelo',
        consequence: 'Misure, scelte del cliente e scadenze finiscono disperse tra quaderni, e-mail e memoria.',
        response: 'Ogni ordine ha il proprio cantiere, con tutte le informazioni centralizzate nello stesso posto.',
      },
      {
        problem: 'Il cliente modifica la sua richiesta dopo la presa misure',
        consequence: 'Senza una traccia chiara, aumenta il rischio di un errore di produzione o di posa.',
        response: 'La modifica viene aggiunta direttamente al cantiere interessato, visibile dal laboratorio e dal team di posa.',
      },
      {
        problem: 'Nessuno sa con precisione a che punto sia un ordine',
        consequence: 'Il titolare deve essere il punto di passaggio obbligato tra laboratorio e posa per conoscere uno stato.',
        response: 'Stato e pianificazione vengono condivisi tra laboratorio e team di posa, senza intermediario obbligato.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Preventivi su misura', text: 'Calcoli un ordine personalizzato dal Suo catalogo di prestazioni.' },
      { icon: 'file-text', title: 'Gestione degli ordini per cantiere', text: 'Misure, scelte del cliente e scadenze centralizzate per progetto.' },
      { icon: 'calendar', title: 'Pianificazione laboratorio e posa', text: 'Coordini produzione e posa senza telefonate intermedie.' },
      { icon: 'image', title: 'Foto di produzione e posa', text: 'Documenti ogni fase, dal laboratorio fino all\'installazione.' },
      { icon: 'plus-circle', title: 'Modifiche del cliente', text: 'Una richiesta dell\'ultimo minuto si aggiunge direttamente al progetto interessato.' },
      { icon: 'credit-card', title: 'Fatturazione dal preventivo', text: 'La fattura riprende l\'ordine convalidato, senza nuova immissione.' },
    ],
    scenario: {
      title: 'Esempio: un ordine di mobili su misura, dalla presa misure alla posa',
      text: 'La presa misure presso il cliente alimenta un preventivo personalizzato. L\'ordine viene seguito in laboratorio; una modifica richiesta dal cliente viene aggiunta direttamente al cantiere. La posa viene pianificata e documentata con foto, poi la fattura viene generata dal preventivo iniziale.',
    },
    comparison: [
      { before: 'Misure annotate su un quaderno', after: 'Misure e osservazioni collegate al cantiere' },
      { before: 'Modifica del cliente persa tra laboratorio e posa', after: 'Modifica aggiunta direttamente al cantiere interessato' },
      { before: 'Stato dell\'ordine noto solo al titolare', after: 'Stato visibile a tutto il team' },
      { before: 'Foto di produzione e posa disperse', after: 'Foto classificate per cantiere' },
      { before: 'Preventivo personalizzato rifatto da zero', after: 'Catalogo di prestazioni riutilizzabile' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un falegname che lavora su ordini personalizzati?',
        answer: 'Sì, ogni ordine diventa un cantiere con proprie misure, documenti e stato, indipendentemente dal grado di personalizzazione.',
      },
      {
        question: 'Come si segue una modifica richiesta dal cliente dopo la presa misure?',
        answer: 'Si aggiunge direttamente al cantiere interessato, con un\'osservazione, visibile sia dal laboratorio sia dal team di posa.',
      },
      {
        question: 'Si possono coordinare laboratorio e team di posa con Cantia?',
        answer: 'Sì, la pianificazione e lo stato di ogni ordine sono condivisi, senza dover passare da una telefonata intermedia.',
      },
      {
        question: 'Cantia permette di creare preventivi con prestazioni su misura?',
        answer: 'Sì, un catalogo di prestazioni riutilizzabile accelera il calcolo lasciando spazio a voci specifiche per ordine.',
      },
      {
        question: 'Posso aggiungere foto di produzione e posa per progetto?',
        answer: 'Sì, le foto vengono classificate automaticamente per cantiere, dal laboratorio fino all\'installazione finale.',
      },
    ],
    relatedBlogSlugs: ['devis-menuisier-sur-mesure-facturation-suisse'],
    relatedTrades: ['charpentier', 'peintre'],
  },

  'entreprise-generale': {
    slug: 'entreprise-generale',
    tradeName: 'Imprese generali',
    seo: {
      title: 'Software di gestione per imprese generali edili in Svizzera | Cantia',
      description:
        'Centralizzi più cantieri, subappaltatori e budget con Cantia, il software di gestione pensato per le imprese generali edili in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per imprese generali',
      title: 'Una visione chiara su tutti i Suoi cantieri, senza moltiplicare i file',
      subtitle:
        'Cantia centralizza i Suoi cantieri, i Suoi subappaltatori, i Suoi documenti e la redditività di ogni progetto in un unico strumento.',
    },
    painPoints: [
      {
        problem: 'Più cantieri girano in parallelo, ognuno con i propri file',
        consequence: 'Impossibile avere una visione d\'insieme senza ricostruire l\'informazione cantiere per cantiere.',
        response: 'Tutti i Suoi cantieri sono centralizzati in un unico strumento, consultabili nello stesso posto.',
      },
      {
        problem: 'Numerosi subappaltatori da coordinare su cantieri diversi',
        consequence: 'Stati d\'intervento e attestati assicurativi si perdono facilmente da un cantiere all\'altro.',
        response: 'Un elenco di subappaltatori riutilizzabile, con stato e attestati per cantiere.',
      },
      {
        problem: 'La redditività reale di un cantiere è conosciuta solo a fine progetto',
        consequence: 'Uno scostamento di budget o di scadenza viene scoperto troppo tardi per essere corretto.',
        response: 'Confronti importo preventivato e costo reale in continuo, cantiere per cantiere, non solo al bilancio finale.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Pianificazione multi-cantiere', text: 'Organizzi più team e subappaltatori su più cantieri attivi.' },
      { icon: 'users', title: 'Coordinamento dei subappaltatori', text: 'Elenco riutilizzabile, con attestati assicurativi archiviati e datati.' },
      { icon: 'folder', title: 'Documenti per cantiere', text: 'Piani, offerte e contratti classificati in un raccoglitore digitale per progetto.' },
      { icon: 'trending-up', title: 'Redditività per cantiere', text: 'Preventivato, costo reale e margine visibili per ogni progetto in corso.' },
      { icon: 'shield', title: 'Ruoli di team personalizzati', text: 'Decida con precisione chi vede cosa a seconda della funzione di ciascuno.' },
      { icon: 'credit-card', title: 'Fatturazione e liquidità', text: 'Segua ciò che è fatturato, incassato e in arrivo, su tutti i cantieri insieme.' },
    ],
    scenario: {
      title: 'Esempio: più cantieri condotti in parallelo, con subappaltatori',
      text: 'Ogni cantiere dispone del proprio spazio (documenti, pianificazione, subappaltatori). La redditività di ciascuno resta visibile in diretta, e i ruoli di team limitano l\'accesso di ogni collaboratore alle informazioni che lo riguardano realmente.',
    },
    comparison: [
      { before: 'Un file per cantiere, nessuna visione d\'insieme', after: 'Tutti i cantieri centralizzati' },
      { before: 'Subappaltatori seguiti a memoria', after: 'Elenco di subappaltatori con attestati' },
      { before: 'Redditività conosciuta a fine cantiere', after: 'Redditività seguita in diretta, cantiere per cantiere' },
      { before: 'Accesso ai dati non controllato', after: 'Ruoli di team personalizzati' },
      { before: 'Documenti dispersi tra più strumenti', after: 'Raccoglitore digitale per cantiere' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa generale che gestisce più cantieri in parallelo?',
        answer: 'Sì, è esattamente il caso d\'uso a cui puntano la pianificazione multi-cantiere e la visione centralizzata per progetto.',
      },
      {
        question: 'Si possono seguire i subappaltatori e i loro attestati assicurativi?',
        answer: 'Sì, un elenco di subappaltatori riutilizzabile tiene aggiornati lo stato d\'intervento e gli attestati, per cantiere.',
      },
      {
        question: 'Cantia permette di confrontare la redditività di più cantieri?',
        answer: 'Sì, ogni cantiere mostra il proprio margine (preventivato vs costo reale), il che permette di confrontare più progetti tra loro.',
      },
      {
        question: 'Si può limitare l\'accesso di alcuni dipendenti a determinate informazioni?',
        answer: 'Sì, dei ruoli personalizzati permettono di stabilire con precisione chi accede a finanze, computo metrico, pianificazione o documenti.',
      },
      {
        question: 'Cantia si integra con Bexio per la contabilità?',
        answer: 'Sì, l\'integrazione nativa sincronizza clienti, fatture e pagamenti tra Cantia e Bexio, a partire dal piano Team.',
      },
    ],
    relatedBlogSlugs: ['gerer-plusieurs-chantiers-en-parallele-methode'],
    relatedTrades: ['macon', 'electricien'],
  },

  paysagiste: {
    slug: 'paysagiste',
    tradeName: 'Paesaggisti',
    seo: {
      title: 'Software di gestione per imprese di giardinaggio e paesaggistica in Svizzera | Cantia',
      description:
        'Gestisca team mobili, cantieri di sistemazione e contratti di manutenzione con Cantia, il software di gestione pensato per le imprese di paesaggistica in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per paesaggisti',
      title: 'Cantieri, manutenzione e team: tutta la Sua pianificazione nello stesso posto',
      subtitle:
        'Cantia aiuta le imprese di paesaggistica a organizzare i loro team mobili, i loro cantieri di sistemazione e i loro contratti di manutenzione ricorrente.',
    },
    painPoints: [
      {
        problem: 'Numerosi piccoli cantieri e interventi di manutenzione da inserire nella settimana',
        consequence: 'La pianificazione diventa rapidamente difficile da tenere aggiornata, con team mal distribuiti sui siti.',
        response: 'Una pianificazione centrale per team e per giorno, modificabile in pochi secondi.',
      },
      {
        problem: 'I team lavorano su più siti contemporaneamente',
        consequence: 'Coordinare chi va dove, e con quale materiale, diventa un carico mentale costante per il titolare.',
        response: 'Ogni cantiere resta accessibile dal terreno, su mobile, ovunque si trovi il team.',
      },
      {
        problem: 'La manutenzione ricorrente si segue male da una visita all\'altra',
        consequence: 'Un intervento può essere dimenticato, o fatturato male in mancanza di una traccia chiara.',
        response: 'Ogni intervento di manutenzione è collegato al proprio cantiere, pronto per essere ripreso nella fatturazione.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Pianificazione dei team mobili', text: 'Organizzi più team su più siti, modificabile in diretta.' },
      { icon: 'mic', title: 'Preventivi per cantieri e manutenzione', text: 'Calcoli una sistemazione o un contratto di manutenzione dal Suo catalogo.' },
      { icon: 'image', title: 'Foto prima/dopo', text: 'Valorizzi una sistemazione terminata o documenti un intervento di manutenzione.' },
      { icon: 'clock', title: 'Rilevazione delle ore', text: 'Il tempo impiegato per intervento, collegato al cantiere giusto.' },
      { icon: 'credit-card', title: 'Fatturazione dal preventivo', text: 'Ogni intervento fatturato senza attendere la fine della stagione.' },
      { icon: 'list', title: 'Catalogo delle prestazioni', text: 'Le Sue prestazioni ricorrenti (taglio erba, potatura, manutenzione) già calcolate.' },
    ],
    scenario: {
      title: 'Esempio: una stagione con cantieri di sistemazione e contratti di manutenzione',
      text: 'La pianificazione settimanale distribuisce i team su più siti. Ogni intervento di manutenzione è documentato e collegato al proprio cantiere. Una sistemazione più importante viene seguita come un vero cantiere, dal preventivo iniziale alle foto prima/dopo, fino alla fatturazione.',
    },
    comparison: [
      { before: 'Pianificazione dei team mobili su carta', after: 'Pianificazione centralizzata, accessibile sul terreno' },
      { before: 'Manutenzione ricorrente seguita male', after: 'Ogni intervento collegato al proprio cantiere' },
      { before: 'Foto di sistemazione disperse', after: 'Foto prima/dopo classificate per cantiere' },
      { before: 'Preventivi rifatti a ogni piccolo cantiere', after: 'Catalogo di prestazioni riutilizzabile' },
      { before: 'Fattura inviata a fine stagione', after: 'Fattura creata dopo ogni intervento' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di paesaggistica con più team mobili?',
        answer: 'Sì, la pianificazione centralizzata permette di organizzare più team su più siti, consultabile direttamente sul terreno.',
      },
      {
        question: 'Si possono gestire sia cantieri di sistemazione sia contratti di manutenzione?',
        answer: 'Sì, entrambi vivono nello stesso strumento: una sistemazione si segue come un cantiere classico, la manutenzione ricorrente come una serie di interventi collegati a un cantiere.',
      },
      {
        question: 'La pianificazione è consultabile dal terreno, su mobile?',
        answer: 'Sì, Cantia funziona su telefono e tablet, con accesso diretto alla pianificazione e ai cantieri del giorno.',
      },
      {
        question: 'Cantia permette di fatturare rapidamente un intervento di manutenzione?',
        answer: 'Sì, ogni intervento può essere fatturato appena eseguito, senza attendere la fine della stagione.',
      },
      {
        question: 'Posso aggiungere foto prima/dopo per una sistemazione?',
        answer: 'Sì, le foto vengono classificate automaticamente per cantiere e utili per valorizzare una sistemazione terminata.',
      },
    ],
    relatedBlogSlugs: ['devis-facture-paysagiste-jardinier-suisse'],
    relatedTrades: ['entreprise-generale', 'macon'],
  },

  couvreur: {
    slug: 'couvreur',
    tradeName: 'Copritetti',
    seo: {
      title: 'Software di gestione per copritetti in Svizzera | Cantia',
      description:
        'Documenti e gestisca i Suoi cantieri di tetto con Cantia, il software di gestione pensato per le imprese di copertura in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per copritetti',
      title: 'Dal sopralluogo del tetto alla fattura, conservi tutte le prove del cantiere',
      subtitle:
        'Cantia aiuta le imprese di copertura a documentare le loro diagnosi, gestire gli imprevisti di cantiere e fatturare senza perdere traccia.',
    },
    painPoints: [
      {
        problem: 'Una diagnosi del tetto senza una prova visiva chiara',
        consequence: 'Difficile giustificare l\'estensione dei lavori al cliente o all\'assicurazione una volta iniziato il cantiere.',
        response: 'Scatti foto geolocalizzate durante la diagnosi, collegate direttamente al cantiere interessato.',
      },
      {
        problem: 'Una scoperta sotto la copertura cambia tutto il cantiere',
        consequence: 'Senza un documento chiaro al momento della scoperta, il costo aggiuntivo è difficile da far accettare al cliente.',
        response: 'Aggiunga il lavoro supplementare direttamente al cantiere, con una foto, ripreso automaticamente nella fatturazione.',
      },
      {
        problem: 'Sicurezza e prove di intervento devono essere documentate',
        consequence: 'In caso di contestazione o controllo, l\'assenza di traccia scritta complica tutto.',
        response: 'Ogni fase del cantiere (foto, osservazioni, documenti) resta centralizzata e datata automaticamente.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Preventivo dalla diagnosi', text: 'Calcoli un rifacimento di tetto direttamente dopo il sopralluogo diagnostico.' },
      { icon: 'image', title: 'Foto prima/durante/dopo', text: 'Documenti ogni fase del cantiere, geolocalizzate automaticamente.' },
      { icon: 'plus-circle', title: 'Lavori supplementari', text: 'Una scoperta imprevista sotto la copertura si aggiunge direttamente, con foto.' },
      { icon: 'calendar', title: 'Pianificazione di team', text: 'Organizzi i Suoi team su più cantieri di tetto.' },
      { icon: 'file-text', title: 'Rapporti di cantiere', text: 'Note e foto diventano un rapporto pronto da inviare.' },
      { icon: 'credit-card', title: 'Fatturazione dal preventivo', text: 'A cantiere concluso, la fattura riprende tutto ciò che è stato realmente eseguito.' },
    ],
    scenario: {
      title: 'Esempio: un rifacimento di tetto dopo diagnosi',
      text: 'Il sopralluogo e la diagnosi vengono fotografati direttamente sul posto. Il preventivo viene preparato, il cantiere pianificato. Una scoperta imprevista (struttura danneggiata) viene aggiunta come lavoro supplementare con una foto a supporto. La fattura finale riprende l\'insieme dei lavori realmente eseguiti.',
    },
    comparison: [
      { before: 'Diagnosi del tetto senza prova scritta', after: 'Foto geolocalizzate collegate al cantiere' },
      { before: 'Scoperta sotto la copertura non documentata', after: 'Lavori supplementari aggiunti con foto' },
      { before: 'Prove di intervento disperse', after: 'Storico centralizzato e datato per cantiere' },
      { before: 'Preventivo rifatto dopo ogni sopralluogo', after: 'Catalogo di prestazioni riutilizzabile' },
      { before: 'Fattura inviata a posteriori', after: 'Fattura generata dal preventivo' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di copertura?',
        answer: 'Sì, il piano Essentiel copre preventivi, cantieri e fatturazione per un\'impresa di copertura che inizia o lavora con un piccolo team.',
      },
      {
        question: 'Posso documentare una diagnosi del tetto con foto?',
        answer: 'Sì, le foto scattate durante la diagnosi vengono geolocalizzate automaticamente e collegate al cantiere.',
      },
      {
        question: 'Come si aggiunge una scoperta imprevista in corso di cantiere?',
        answer: 'Si aggiunge direttamente al cantiere interessato, con un\'osservazione o una foto, seguendo poi lo stesso percorso di un preventivo fino alla fatturazione.',
      },
      {
        question: 'Cantia permette di conservare una traccia chiara in caso di contestazione?',
        answer: 'Sì, ogni foto, osservazione e documento resta datato e centralizzato per cantiere, consultabile in qualsiasi momento.',
      },
      {
        question: 'Posso usare Cantia con Bexio?',
        answer: 'Sì, l\'integrazione nativa sincronizza clienti, fatture e pagamenti tra Cantia e Bexio, a partire dal piano Team.',
      },
    ],
    relatedBlogSlugs: ['gestion-chantier-devis-couvreur-toiture-suisse'],
    relatedTrades: ['charpentier', 'etancheur'],
  },

  chauffagiste: {
    slug: 'chauffagiste',
    tradeName: 'Termoidraulici',
    seo: {
      title: 'Software di gestione per termoidraulici in Svizzera | Cantia',
      description:
        'Segua impianti, interventi e team con Cantia, il software di gestione pensato per le imprese di riscaldamento in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per termoidraulici',
      title: 'Installazione, intervento d\'urgenza o manutenzione: ogni intervento resta tracciato',
      subtitle:
        'Cantia aiuta le imprese di riscaldamento a organizzare manutenzioni e interventi d\'urgenza, seguire il materiale utilizzato e fatturare rapidamente.',
    },
    painPoints: [
      {
        problem: 'Manutenzioni ricorrenti e interventi d\'urgenza puntuali si mescolano nella pianificazione',
        consequence: 'Un appuntamento di manutenzione annuale può essere dimenticato in mezzo alle urgenze.',
        response: 'Una pianificazione centrale che distingue chiaramente interventi pianificati e urgenze.',
      },
      {
        problem: 'I pezzi sostituiti su un impianto non vengono sempre annotati',
        consequence: 'In caso di nuovo guasto, impossibile sapere rapidamente cosa sia già stato sostituito.',
        response: 'Ogni intervento è documentato con il materiale utilizzato, collegato all\'impianto del cliente.',
      },
      {
        problem: 'Un intervento concluso non viene fatturato subito',
        consequence: 'L\'amministrativo si accumula e ritarda la liquidità dell\'azienda.',
        response: 'Fatturi direttamente dall\'intervento, con fattura QR svizzera pronta da inviare.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Pianificazione manutenzione + urgenza', text: 'Distingua interventi pianificati e urgenze in un\'unica pianificazione.' },
      { icon: 'users', title: 'Storico per impianto', text: 'Ritrovi cosa è stato fatto e sostituito su ogni impianto cliente.' },
      { icon: 'mic', title: 'Preventivi rapidi', text: 'Calcoli un intervento o una sostituzione dal Suo catalogo.' },
      { icon: 'credit-card', title: 'Fatturazione immediata', text: 'Fattura QR svizzera generata direttamente dall\'intervento.' },
      { icon: 'file-text', title: 'Rapporti di intervento', text: 'Documenti ogni passaggio con foto e osservazioni.' },
      { icon: 'clock', title: 'Ore per intervento', text: 'Segua il tempo effettivamente dedicato a ogni impianto.' },
    ],
    scenario: {
      title: 'Esempio: una stagione di controlli caldaia con interventi d\'urgenza puntuali',
      text: 'La pianificazione dei controlli annuali viene organizzata in anticipo. Un\'urgenza di riscaldamento si aggiunge nel corso della settimana, riorganizzata in pochi secondi. Ogni intervento è documentato con il materiale utilizzato, e la fattura parte appena terminato il passaggio.',
    },
    comparison: [
      { before: 'Manutenzioni e interventi d\'urgenza mescolati senza distinzione', after: 'Pianificazione che distingue i due' },
      { before: 'Pezzi sostituiti non annotati', after: 'Materiale utilizzato documentato per intervento' },
      { before: 'Fattura inviata a posteriori', after: 'Fattura creata dall\'intervento' },
      { before: 'Storico dell\'impianto ricordato a memoria', after: 'Storico centralizzato per cliente' },
      { before: 'Ore non seguite per intervento', after: 'Ore collegate a ogni passaggio' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di riscaldamento con più tecnici?',
        answer: 'Sì, la pianificazione di team e i ruoli personalizzati permettono di coordinare più tecnici su interventi diversi.',
      },
      {
        question: 'Si possono distinguere manutenzioni pianificate e interventi d\'urgenza nella pianificazione?',
        answer: 'Sì, entrambi vivono nella stessa pianificazione, riorganizzabile rapidamente quando si aggiunge un\'urgenza.',
      },
      {
        question: 'Posso documentare i pezzi sostituiti durante un intervento?',
        answer: 'Sì, ogni intervento conserva un\'osservazione sul materiale utilizzato, collegata all\'impianto del cliente.',
      },
      {
        question: 'Cantia permette di fatturare rapidamente dopo un intervento d\'urgenza?',
        answer: 'Sì, una fattura con fattura QR svizzera può essere generata direttamente dall\'intervento.',
      },
      {
        question: 'Posso usare Cantia con Bexio?',
        answer: 'Sì, l\'integrazione nativa sincronizza clienti, fatture e pagamenti tra Cantia e Bexio, a partire dal piano Team.',
      },
    ],
    relatedBlogSlugs: ['devis-facture-chauffagiste-cvc-suisse'],
    relatedTrades: ['electricien', 'plombier'],
  },

  carreleur: {
    slug: 'carreleur',
    tradeName: 'Piastrellisti',
    seo: {
      title: 'Software di gestione per piastrellisti in Svizzera | Cantia',
      description:
        'Segua superfici, materiali e tempi di posa con Cantia, il software di gestione pensato per le imprese di posa piastrelle in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per piastrellisti',
      title: 'Ogni metro quadrato conta. Le Sue ore anche.',
      subtitle:
        'Cantia aiuta le imprese di posa piastrelle a calcolare le loro superfici rapidamente e a sapere cosa rende realmente un cantiere di posa.',
    },
    painPoints: [
      {
        problem: 'Le superfici vengono ricalcolate a mano a ogni preventivo',
        consequence: 'Perdita di tempo e rischio di errore su calcoli comunque ripetitivi da un cantiere all\'altro.',
        response: 'Il computo metrico è integrato nel preventivo, con un calcolo automatico per stanza o per zona.',
      },
      {
        problem: 'Una variante di piastrelle viene richiesta in corso di cantiere',
        consequence: 'Difficile da calcolare e far convalidare rapidamente sul posto.',
        response: 'Adatti il preventivo direttamente dal catalogo, con i lavori supplementari seguiti separatamente.',
      },
      {
        problem: 'Il tempo di posa reale non viene mai confrontato con il preventivo',
        consequence: 'Impossibile sapere se un cantiere sia stato davvero redditizio, anche quando il preventivo è stato venduto bene.',
        response: 'Colleghi le ore al cantiere e le confronti con l\'importo preventivato.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Preventivi con computo metrico delle superfici', text: 'Calcoli rapidamente a partire dalle superfici misurate sul posto.' },
      { icon: 'list', title: 'Catalogo dei materiali', text: 'Le Sue prestazioni e materiali abituali memorizzati e riutilizzabili.' },
      { icon: 'clock', title: 'Rilevazione delle ore di posa', text: 'Confronti il tempo previsto con quello effettivamente impiegato, cantiere per cantiere.' },
      { icon: 'image', title: 'Foto prima/dopo', text: 'Conservi una prova visiva di ogni cantiere terminato.' },
      { icon: 'plus-circle', title: 'Lavori supplementari', text: 'Una variante richiesta in corso di cantiere si aggiunge direttamente.' },
      { icon: 'credit-card', title: 'Fatturazione dal preventivo', text: 'La fattura riprende automaticamente le prestazioni convalidate.' },
    ],
    scenario: {
      title: 'Esempio: una posa di piastrelle con variante in corso di cantiere',
      text: 'Il computo metrico delle superfici alimenta un preventivo preparato con il catalogo. Il cantiere viene pianificato. Il cliente cambia piastrelle per una stanza in corso d\'opera, adattato come lavoro supplementare. La fattura finale riprende l\'insieme delle prestazioni realmente posate.',
    },
    comparison: [
      { before: 'Superfici ricalcolate a mano', after: 'Computo metrico integrato nel preventivo' },
      { before: 'Variante di piastrelle difficile da calcolare sul posto', after: 'Adattamento rapido dal catalogo' },
      { before: 'Tempo di posa mai confrontato con il preventivo', after: 'Ore seguite e confrontate con il preventivato' },
      { before: 'Foto di posa disperse', after: 'Foto classificate per cantiere' },
      { before: 'Preventivo rifatto a ogni nuovo cantiere', after: 'Catalogo di prestazioni riutilizzabile' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un piastrellista indipendente o con un piccolo team?',
        answer: 'Sì, il piano Essentiel copre preventivi, catalogo e fatturazione per un piastrellista che lavora da solo o con un piccolo team.',
      },
      {
        question: 'Posso integrare un computo metrico delle superfici direttamente nel preventivo?',
        answer: 'Sì, il computo metrico alimenta direttamente il preventivo, con un calcolo automatico per stanza o per zona.',
      },
      {
        question: 'Come gestire una variante di piastrelle richiesta in corso di cantiere?',
        answer: 'Si aggiunge direttamente nel preventivo a partire dal catalogo e dal computo metrico, senza ripartire da zero.',
      },
      {
        question: 'Cantia permette di confrontare il tempo di posa reale con il preventivo?',
        answer: 'Sì, le ore registrate per cantiere vengono confrontate con l\'importo preventivato.',
      },
      {
        question: 'Posso aggiungere foto prima/dopo per ogni cantiere?',
        answer: 'Sì, le foto vengono classificate automaticamente per cantiere.',
      },
    ],
    relatedBlogSlugs: ['devis-carreleur-facturation-au-m2-suisse'],
    relatedTrades: ['peintre', 'platrier'],
  },

  platrier: {
    slug: 'platrier',
    tradeName: 'Gessatori',
    seo: {
      title: 'Software di gestione per gessatori-cartongessisti in Svizzera | Cantia',
      description:
        'Segua computi metrici, prestazioni e ore per cantiere con Cantia, il software di gestione pensato per le imprese di gessatura in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per gessatori-cartongessisti',
      title: 'Dal computo metrico alla fattura, mantenga il controllo dei Suoi lavori',
      subtitle:
        'Cantia aiuta le imprese di gessatura e cartongesso a calcolare i loro computi metrici, seguire le modifiche di cantiere e coordinare i loro team.',
    },
    painPoints: [
      {
        problem: 'I computi metrici di pareti divisorie e controsoffitti vengono ricalcolati a ogni preventivo',
        consequence: 'Perdita di tempo su calcoli ripetitivi da un cantiere all\'altro.',
        response: 'Il computo metrico è integrato nel preventivo, con un catalogo di prestazioni riutilizzabile.',
      },
      {
        problem: 'Una modifica delle pareti divisorie viene decisa in corso di cantiere',
        consequence: 'Il costo aggiuntivo è difficile da far convalidare e fatturare in seguito senza una traccia chiara.',
        response: 'Il lavoro supplementare si aggiunge direttamente al cantiere, ripreso nella fattura.',
      },
      {
        problem: 'Più cantieri in parallelo, in coordinamento con altri mestieri',
        consequence: 'Difficile sapere chi interviene quando senza una pianificazione condivisa.',
        response: 'Una pianificazione centralizzata, visibile a tutto il team e agli intervenanti del cantiere.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Preventivi con computo metrico', text: 'Calcoli pareti divisorie e controsoffitti da un catalogo di prestazioni riutilizzabile.' },
      { icon: 'plus-circle', title: 'Lavori supplementari', text: 'Una modifica di tramezzatura si aggiunge direttamente al cantiere.' },
      { icon: 'clock', title: 'Rilevazione delle ore', text: 'Confronti il tempo previsto con quello effettivamente impiegato, per cantiere.' },
      { icon: 'calendar', title: 'Pianificazione multi-cantiere', text: 'Coordini i Suoi interventi con gli altri mestieri.' },
      { icon: 'image', title: 'Foto di cantiere', text: 'Documenti l\'avanzamento dei Suoi lavori.' },
      { icon: 'credit-card', title: 'Fatturazione dal preventivo', text: 'La fattura riprende automaticamente le prestazioni eseguite.' },
    ],
    scenario: {
      title: 'Esempio: un cantiere di tramezzature con modifica in corso d\'opera',
      text: 'Il computo metrico iniziale alimenta il preventivo. Il cantiere viene pianificato in coordinamento con gli altri mestieri. Una modifica di tramezzatura richiesta in corso d\'opera viene aggiunta come lavoro supplementare. La fattura finale riprende l\'insieme delle prestazioni eseguite.',
    },
    comparison: [
      { before: 'Computi metrici ricalcolati a ogni preventivo', after: 'Computo metrico integrato e catalogo riutilizzabile' },
      { before: 'Modifica di tramezzatura non tracciata', after: 'Lavori supplementari aggiunti al cantiere' },
      { before: 'Coordinamento con altri mestieri per telefono', after: 'Pianificazione condivisa e centralizzata' },
      { before: 'Ore non seguite per cantiere', after: 'Ore collegate a ogni cantiere' },
      { before: 'Fattura ricostruita a posteriori', after: 'Fattura generata dal preventivo' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di gessatura o cartongesso?',
        answer: 'Sì, il piano Essentiel copre preventivi, cantieri e fatturazione per un\'azienda che inizia o lavora con un piccolo team.',
      },
      {
        question: 'Posso integrare un computo metrico di pareti divisorie o controsoffitti nel preventivo?',
        answer: 'Sì, il computo metrico alimenta direttamente il preventivo, con un catalogo di prestazioni riutilizzabile.',
      },
      {
        question: 'Come si aggiunge una modifica decisa in corso di cantiere?',
        answer: 'Si aggiunge direttamente al cantiere interessato, con un\'osservazione, ripresa nella fatturazione.',
      },
      {
        question: 'Cantia permette di coordinare la mia pianificazione con altri mestieri?',
        answer: 'Sì, la pianificazione è condivisa e centralizzata, visibile a tutto il team del cantiere.',
      },
      {
        question: 'Posso seguire le mie ore di posa per cantiere?',
        answer: 'Sì, ogni ora registrata è collegata a un cantiere preciso.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['carreleur', 'menuisier'],
  },

  'genie-civil': {
    slug: 'genie-civil',
    tradeName: 'Imprese di genio civile',
    seo: {
      title: 'Software di gestione per imprese di genio civile | Cantia',
      description:
        'Gestisca più team e cantieri con una vera visione finanziaria, con Cantia, il software di gestione per il genio civile in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per il genio civile',
      title: 'I Suoi team sul terreno. I Suoi numeri sotto controllo.',
      subtitle:
        'Cantia aiuta le imprese di genio civile a coordinare più team e cantieri seguendo al contempo spese e redditività in diretta.',
    },
    painPoints: [
      {
        problem: 'Più team su più cantieri di grande portata',
        consequence: 'Il coordinamento diventa rapidamente complesso senza una visione centralizzata sull\'insieme dei cantieri.',
        response: 'Una pianificazione multi-cantiere e multi-team centralizzata, consultabile da tutta l\'organizzazione.',
      },
      {
        problem: 'Le spese di cantiere (materiali, noleggio di macchine, subappalto) sono difficili da seguire in tempo reale',
        consequence: 'La redditività reale è conosciuta solo a posteriori, talvolta troppo tardi per reagire.',
        response: 'Colleghi le spese al cantiere interessato e le confronti con il preventivato in continuo.',
      },
      {
        problem: 'I rapporti di cantiere e le prove fotografiche sono disperse tra più intervenanti',
        consequence: 'In caso di contestazione o di gestione del cantiere, l\'informazione è difficile da ricostruire.',
        response: 'Ogni cantiere centralizza i propri rapporti, foto e documenti, accessibili a tutto il team.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Pianificazione multi-team', text: 'Coordini più team su più cantieri in parallelo.' },
      { icon: 'dollar-sign', title: 'Controllo delle spese', text: 'Materiali, macchine e subappalto collegati al cantiere giusto.' },
      { icon: 'trending-up', title: 'Redditività in diretta', text: 'Confronti preventivato e costo reale cantiere per cantiere, in continuo.' },
      { icon: 'file-text', title: 'Rapporti di cantiere', text: 'Foto e note diventano un rapporto pronto da inviare.' },
      { icon: 'folder', title: 'Documenti centralizzati', text: 'Piani, contratti e autorizzazioni classificati per cantiere.' },
      { icon: 'clock', title: 'Ore per cantiere', text: 'Segua la manodopera di ogni team, cantiere per cantiere.' },
    ],
    scenario: {
      title: 'Esempio: un cantiere di genio civile con più team e subappaltatori',
      text: 'La pianificazione coordina team interni e subappaltatori sullo stesso cantiere. Spese e ore vengono seguite giorno per giorno. La redditività resta visibile in continuo, e rapporti come foto sono centralizzati per l\'intero cantiere.',
    },
    comparison: [
      { before: 'Più team, nessuna visione centralizzata', after: 'Pianificazione multi-team centralizzata' },
      { before: 'Spese seguite a posteriori', after: 'Spese collegate al cantiere in continuo' },
      { before: 'Redditività conosciuta a fine cantiere', after: 'Redditività seguita in diretta' },
      { before: 'Rapporti e foto disperse tra intervenanti', after: 'Tutto centralizzato per cantiere' },
      { before: 'Documenti sparsi tra più strumenti', after: 'Raccoglitore digitale per cantiere' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di genio civile che gestisce più cantieri di grande portata?',
        answer: 'Sì, la pianificazione multi-cantiere e il controllo della redditività per cantiere sono pensati per questo caso d\'uso.',
      },
      {
        question: 'Si possono seguire le spese di cantiere (materiali, macchine, subappalto) in tempo reale?',
        answer: 'Sì, ogni spesa è collegata al cantiere interessato e confrontata con l\'importo preventivato in continuo.',
      },
      {
        question: 'Cantia permette di confrontare la redditività di più cantieri in parallelo?',
        answer: 'Sì, ogni cantiere mostra il proprio margine, confrontabile tra progetti.',
      },
      {
        question: 'Si possono centralizzare rapporti e foto di più team su uno stesso cantiere?',
        answer: 'Sì, tutto resta classificato e datato per cantiere, accessibile a tutto il team.',
      },
      {
        question: 'Cantia si integra con Bexio per la contabilità?',
        answer: 'Sì, l\'integrazione nativa sincronizza clienti, fatture e pagamenti tra Cantia e Bexio, a partire dal piano Team.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['entreprise-generale', 'terrassier'],
  },

  terrassier: {
    slug: 'terrassier',
    tradeName: 'Imprese di sterro',
    seo: {
      title: 'Software di gestione per imprese di sterro | Cantia',
      description:
        'Segua macchine, team, ore e lavori supplementari con Cantia, il software di gestione per le imprese di sterro in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per imprese di sterro',
      title: 'Sappia quanto Le costa ogni cantiere prima che sia terminato',
      subtitle:
        'Cantia aiuta le imprese di sterro a seguire il costo reale delle loro macchine, dei loro team e degli imprevisti di terreno, cantiere per cantiere.',
    },
    painPoints: [
      {
        problem: 'Il costo reale delle macchine e del carburante non viene seguito con precisione per cantiere',
        consequence: 'La redditività di un cantiere di sterro può sembrare buona sulla carta ed essere pessima nella realtà.',
        response: 'Colleghi le spese di macchine e carburante al cantiere, confrontate con il preventivato.',
      },
      {
        problem: 'Un imprevisto di terreno (roccia, rete interrata) cambia la portata del cantiere',
        consequence: 'Senza un documento chiaro, il costo aggiuntivo è difficile da giustificare al cliente.',
        response: 'Aggiunga il lavoro supplementare in diretta con una foto, ripreso nella fatturazione.',
      },
      {
        problem: 'Le ore di più collaboratori e macchine sono difficili da ripartire per cantiere',
        consequence: 'Impossibile sapere con precisione quanto sia costato un cantiere in manodopera.',
        response: 'Colleghi le ore al cantiere, per collaboratore.',
      },
    ],
    usages: [
      { icon: 'dollar-sign', title: 'Controllo delle spese', text: 'Macchine e carburante collegati al cantiere giusto.' },
      { icon: 'clock', title: 'Ore per collaboratore', text: 'Ogni persona, ogni cantiere, ogni ora seguita.' },
      { icon: 'plus-circle', title: 'Lavori supplementari', text: 'Un imprevisto di terreno si aggiunge direttamente, con foto.' },
      { icon: 'trending-up', title: 'Redditività in diretta', text: 'Confronti preventivato e costo reale durante il cantiere, non dopo.' },
      { icon: 'image', title: 'Foto prima/dopo', text: 'Documenti lo stato del terreno prima e dopo lo sterro.' },
      { icon: 'credit-card', title: 'Preventivi e fatture', text: 'Dal preventivo iniziale alla fattura finale, senza nuova immissione.' },
    ],
    scenario: {
      title: 'Esempio: un cantiere di sterro con imprevisto di terreno',
      text: 'Il preventivo iniziale si basa sul computo metrico. Una roccia imprevista complica lo sterro e aggiunge ore macchina, documentata come lavoro supplementare con foto. La redditività del cantiere resta seguita per tutta la durata, nonostante l\'imprevisto.',
    },
    comparison: [
      { before: 'Costo di macchine e carburante non seguito per cantiere', after: 'Spese collegate al cantiere' },
      { before: 'Imprevisto di terreno non documentato', after: 'Lavori supplementari aggiunti con foto' },
      { before: 'Ore di più collaboratori difficili da ripartire', after: 'Ore collegate al cantiere e alla persona' },
      { before: 'Redditività conosciuta solo alla fine', after: 'Redditività seguita in diretta' },
      { before: 'Foto di sterro disperse', after: 'Foto classificate per cantiere' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di sterro?',
        answer: 'Sì, il piano Essentiel copre preventivi, cantieri e fatturazione per un\'azienda che inizia o lavora con un piccolo team.',
      },
      {
        question: 'Si può seguire il costo delle macchine e del carburante per cantiere?',
        answer: 'Sì, ogni spesa è collegata al cantiere interessato e confrontata con l\'importo preventivato.',
      },
      {
        question: 'Come si documenta un imprevisto di terreno scoperto in corso di cantiere?',
        answer: 'Si aggiunge direttamente al cantiere con una foto, seguendo poi lo stesso percorso di un preventivo fino alla fatturazione.',
      },
      {
        question: 'Cantia permette di conoscere la redditività di un cantiere prima della sua fine?',
        answer: 'Sì, il confronto tra importo preventivato e costo reale è disponibile in continuo.',
      },
      {
        question: 'Posso seguire le ore di più collaboratori per cantiere?',
        answer: 'Sì, ogni ora registrata è collegata a un cantiere e alla persona interessata.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['genie-civil', 'entreprise-renovation'],
  },

  'entreprise-renovation': {
    slug: 'entreprise-renovation',
    tradeName: 'Imprese di ristrutturazione',
    seo: {
      title: 'Software di gestione per imprese di ristrutturazione | Cantia',
      description:
        'Gestisca i Suoi cantieri di ristrutturazione, imprevisti compresi, con Cantia, il software di gestione per le imprese edili in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per la ristrutturazione',
      title: 'Nella ristrutturazione, gli imprevisti sono normali. Le dimenticanze di fatturazione non dovrebbero esserlo.',
      subtitle:
        'Cantia aiuta le imprese di ristrutturazione a tracciare ogni cambiamento dell\'ultimo minuto, fino alla fattura finale.',
    },
    painPoints: [
      {
        problem: 'Il cliente cambia idea in corso di cantiere',
        consequence: 'Una modifica orale, senza traccia, finisce spesso non fatturata.',
        response: 'Ogni modifica si aggiunge al cantiere come un lavoro supplementare, calcolato e tracciato.',
      },
      {
        problem: 'Una sorpresa dietro una parete cambia la portata dei lavori',
        consequence: 'Il costo aggiuntivo è difficile da giustificare senza una prova visiva al momento della scoperta.',
        response: 'Una foto scattata sul posto, collegata al cantiere, accompagna ogni lavoro supplementare.',
      },
      {
        problem: 'Intervengono più mestieri, le date cambiano di continuo',
        consequence: 'La pianificazione iniziale non riflette più la realtà del cantiere dopo poche settimane.',
        response: 'La pianificazione viene aggiornata in continuo, visibile a tutto il team e ai subappaltatori.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Preventivi di ristrutturazione', text: 'Calcoli a partire dal computo metrico rilevato durante il sopralluogo.' },
      { icon: 'plus-circle', title: 'Lavori supplementari', text: 'Imprevisti e cambiamenti del cliente documentati e fatturati.' },
      { icon: 'image', title: 'Foto prima/durante/dopo', text: 'Ogni scoperta e ogni fase restano tracciate.' },
      { icon: 'calendar', title: 'Pianificazione modificabile', text: 'Riorganizzi facilmente quando le date cambiano.' },
      { icon: 'users', title: 'Coordinamento dei subappaltatori', text: 'Segua più mestieri sullo stesso cantiere.' },
      { icon: 'credit-card', title: 'Fatturazione progressiva', text: 'Fatturi nel corso del cantiere, senza attendere la fine.' },
    ],
    scenario: {
      title: 'Esempio: una ristrutturazione di appartamento con più imprevisti',
      text: 'Il preventivo iniziale si basa sul sopralluogo. Il cantiere inizia con più mestieri. Una sorpresa dietro una parete, poi un cambio idea del cliente, si aggiungono come lavori supplementari documentati. La pianificazione viene riadattata in continuo, e la fattura finale riprende l\'insieme dei lavori realmente eseguiti.',
    },
    comparison: [
      { before: 'Cambio idea del cliente non tracciato', after: 'Lavoro supplementare calcolato e registrato' },
      { before: 'Sorpresa dietro una parete senza prova', after: 'Foto collegata al cantiere al momento della scoperta' },
      { before: 'Pianificazione rigida che non riflette più la realtà', after: 'Pianificazione adattata in continuo' },
      { before: 'Più mestieri coordinati per telefono', after: 'Coordinamento centralizzato e condiviso' },
      { before: 'Fattura ricostruita a memoria a fine cantiere', after: 'Fattura che riprende ogni lavoro supplementare documentato' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa specializzata in ristrutturazione?',
        answer: 'Sì, il controllo dei lavori supplementari e l\'adattamento della pianificazione rispondono direttamente agli imprevisti frequenti nella ristrutturazione.',
      },
      {
        question: 'Come si traccia un cambio idea del cliente in corso di cantiere?',
        answer: 'Si aggiunge come un lavoro supplementare calcolato, con un\'osservazione, ripreso nella fatturazione.',
      },
      {
        question: 'Posso documentare una sorpresa scoperta dietro una parete con una foto?',
        answer: 'Sì, la foto si collega direttamente al cantiere al momento della scoperta.',
      },
      {
        question: 'Cantia permette di adattare la pianificazione quando le date cambiano spesso?',
        answer: 'Sì, la pianificazione viene aggiornata in continuo e resta visibile a tutto il team e ai subappaltatori.',
      },
      {
        question: 'Come si coordina più mestieri su uno stesso cantiere di ristrutturazione?',
        answer: 'Il cantiere centralizza documenti, pianificazione e subappaltatori, consultabili da tutti gli intervenanti.',
      },
    ],
    relatedBlogSlugs: ['calculer-prix-devis-renovation-suisse'],
    relatedTrades: ['entreprise-generale', 'macon'],
  },

  serrurier: {
    slug: 'serrurier',
    tradeName: 'Fabbri',
    seo: {
      title: 'Software di gestione per fabbri in Svizzera | Cantia',
      description:
        'Segua produzione, posa e modifiche con Cantia, il software di gestione per le imprese di fabbro e carpenteria metallica.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per fabbri',
      title: 'Laboratorio, cantiere, posa: ogni informazione segue il progetto',
      subtitle:
        'Cantia aiuta le imprese di fabbro e carpenteria metallica a seguire i loro ordini, dalla presa misure fino alla posa.',
    },
    painPoints: [
      {
        problem: 'Una presa misure in laboratorio e una posa in cantiere, talvolta a settimane di distanza',
        consequence: 'Le informazioni si perdono tra le due fasi se nulla le collega.',
        response: 'Il cantiere centralizza misure e osservazioni, collegate al progetto dall\'inizio alla fine.',
      },
      {
        problem: 'Una modifica viene richiesta dopo la produzione',
        consequence: 'Rischio di errore o di rilavorazione costosa se l\'informazione non arriva in tempo al laboratorio.',
        response: 'La modifica viene aggiunta direttamente al cantiere, visibile dal laboratorio prima della posa.',
      },
      {
        problem: 'Lo stato di un ordine (misura, produzione, posa) non è sempre chiaro',
        consequence: 'Il titolare deve essere sollecitato per sapere a che punto sia ogni progetto.',
        response: 'Stato e pianificazione vengono condivisi tra laboratorio e team di posa.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Preventivi dalle misure', text: 'Calcoli direttamente a partire dalle misure prese sul posto.' },
      { icon: 'file-text', title: 'Gestione degli ordini', text: 'Misura, produzione e posa seguite nello stesso cantiere.' },
      { icon: 'calendar', title: 'Pianificazione laboratorio e posa', text: 'Coordini produzione e installazione senza telefonate intermedie.' },
      { icon: 'image', title: 'Foto di produzione e posa', text: 'Documenti ogni fase, dal laboratorio fino al cantiere.' },
      { icon: 'plus-circle', title: 'Modifiche', text: 'Una richiesta dell\'ultimo minuto si aggiunge direttamente al progetto.' },
      { icon: 'credit-card', title: 'Fatturazione dal preventivo', text: 'La fattura riprende l\'ordine convalidato, senza nuova immissione.' },
    ],
    scenario: {
      title: 'Esempio: un ordine di ringhiera metallica, dalla misura alla posa',
      text: 'La misura presa sul posto alimenta il preventivo. La produzione viene seguita in laboratorio. Una modifica di finitura richiesta dal cliente viene aggiunta direttamente al cantiere. La posa viene pianificata e documentata con foto, poi la fattura viene generata dal preventivo iniziale.',
    },
    comparison: [
      { before: 'Misure e produzione seguite separatamente', after: 'Cantiere centralizzato dall\'inizio alla fine' },
      { before: 'Modifica dopo la produzione trasmessa male', after: 'Modifica aggiunta direttamente al cantiere' },
      { before: 'Stato dell\'ordine noto solo al titolare', after: 'Stato condiviso tra laboratorio e posa' },
      { before: 'Foto di produzione e posa disperse', after: 'Foto classificate per cantiere' },
      { before: 'Preventivo rifatto a ogni nuovo ordine', after: 'Catalogo di prestazioni riutilizzabile' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di fabbro o carpenteria metallica?',
        answer: 'Sì, il controllo dell\'ordine dalla misura alla posa risponde direttamente a questo funzionamento in più fasi.',
      },
      {
        question: 'Come si segue un ordine dalla presa misure fino alla posa?',
        answer: 'Il cantiere centralizza misure, stato di produzione e pianificazione di posa nello stesso posto.',
      },
      {
        question: 'Cosa succede se il cliente richiede una modifica dopo la produzione?',
        answer: 'Si aggiunge direttamente al cantiere, visibile dal laboratorio prima della posa.',
      },
      {
        question: 'Si possono coordinare laboratorio e team di posa con Cantia?',
        answer: 'Sì, lo stato di ogni ordine è condiviso tra i due.',
      },
      {
        question: 'Cantia permette di creare preventivi con prestazioni su misura?',
        answer: 'Sì, un catalogo riutilizzabile accelera il calcolo lasciando spazio a voci specifiche.',
      },
    ],
    relatedBlogSlugs: ['devis-facture-serrurier-metallier-suisse'],
    relatedTrades: ['menuisier', 'construction-bois'],
  },

  ferblantier: {
    slug: 'ferblantier',
    tradeName: 'Lattonieri',
    seo: {
      title: 'Software di gestione per lattonieri in Svizzera | Cantia',
      description:
        'Gestisca preventivi, misure e interventi specifici con Cantia, il software di gestione per le imprese di lattoneria in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per lattonieri',
      title: 'Le Sue misure, i Suoi lavori e le Sue fatture nello stesso posto',
      subtitle:
        'Cantia aiuta le imprese di lattoneria a seguire i loro interventi, spesso puntuali, senza perdere una sola misura lungo il percorso.',
    },
    painPoints: [
      {
        problem: 'Gli interventi di lattoneria sono spesso puntuali e collegati ad altri mestieri',
        consequence: 'Difficile mantenere una visione chiara di ogni intervento senza uno strumento centralizzato.',
        response: 'Ogni intervento diventa un cantiere con proprie misure e documenti.',
      },
      {
        problem: 'Le misure prese sul posto (grondaie, canali di gronda, rivestimenti) devono restare precise fino alla fatturazione',
        consequence: 'Una misura annotata a mano può perdersi o essere ripresa male più tardi.',
        response: 'Misure e osservazioni collegate direttamente al cantiere, consultabili in qualsiasi momento.',
      },
      {
        problem: 'Un intervento concluso non viene fatturato rapidamente',
        consequence: 'L\'amministrativo si accumula tra più piccoli cantieri.',
        response: 'Fatturazione generata dal preventivo, appena terminato l\'intervento.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Preventivi dalle misure', text: 'Calcoli direttamente a partire dalle misure prese sul posto.' },
      { icon: 'file-text', title: 'Gestione dell\'intervento', text: 'Ogni intervento diventa un cantiere seguito.' },
      { icon: 'image', title: 'Foto prima/dopo', text: 'Documenti ogni intervento, anche puntuale.' },
      { icon: 'users', title: 'Coordinamento', text: 'Lavori in collegamento con altri mestieri (tetto, facciata).' },
      { icon: 'credit-card', title: 'Fatturazione rapida', text: 'Fatturi appena terminato l\'intervento.' },
      { icon: 'list', title: 'Catalogo delle prestazioni', text: 'Le Sue prestazioni abituali memorizzate e riutilizzabili.' },
    ],
    scenario: {
      title: 'Esempio: un rifacimento di grondaie dopo una diagnosi del tetto',
      text: 'Le misure vengono prese sul posto. Il preventivo viene preparato con il catalogo di prestazioni. L\'intervento viene documentato con foto. La fattura viene generata appena terminati i lavori.',
    },
    comparison: [
      { before: 'Misure annotate a mano', after: 'Misure collegate direttamente al cantiere' },
      { before: 'Interventi puntuali poco centralizzati', after: 'Ogni intervento diventa un cantiere seguito' },
      { before: 'Fattura inviata a posteriori', after: 'Fattura generata dal preventivo' },
      { before: 'Coordinamento con altri mestieri per telefono', after: 'Cantiere condiviso e consultabile' },
      { before: 'Foto di intervento disperse', after: 'Foto classificate per cantiere' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di lattoneria?',
        answer: 'Sì, il piano Essentiel copre preventivi, interventi e fatturazione per un\'azienda che inizia o lavora con un piccolo team.',
      },
      {
        question: 'Posso registrare misure precise prese sul posto?',
        answer: 'Sì, misure e osservazioni restano collegate direttamente al cantiere.',
      },
      {
        question: 'Come si coordina un intervento con altri mestieri (tetto, facciata)?',
        answer: 'Il cantiere resta condiviso e consultabile da tutti gli intervenanti interessati.',
      },
      {
        question: 'Cantia permette di fatturare rapidamente un piccolo intervento?',
        answer: 'Sì, una fattura può essere generata dal preventivo appena terminato l\'intervento.',
      },
      {
        question: 'Posso aggiungere foto prima/dopo per ogni intervento?',
        answer: 'Sì, le foto vengono classificate automaticamente per cantiere.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['couvreur', 'etancheur'],
  },

  facadier: {
    slug: 'facadier',
    tradeName: 'Facciatisti',
    seo: {
      title: 'Software di gestione per facciatisti in Svizzera | Cantia',
      description:
        'Segua superfici, varianti e avanzamento con Cantia, il software di gestione per le imprese di facciate in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per facciatisti',
      title: 'Mantenga una visione chiara di ogni facciata, dall\'offerta al collaudo',
      subtitle:
        'Cantia aiuta le imprese di facciate a calcolare le loro superfici, gestire le varianti di tonalità e condividere l\'avanzamento del cantiere.',
    },
    painPoints: [
      {
        problem: 'Le superfici di facciata vengono ricalcolate a ogni preventivo',
        consequence: 'Perdita di tempo su computi metrici ripetitivi da un cantiere all\'altro.',
        response: 'Il computo metrico di facciata è integrato nel preventivo, con un catalogo di prestazioni riutilizzabile.',
      },
      {
        problem: 'Una variante di tonalità o di finitura viene decisa in corso di cantiere',
        consequence: 'Difficile da calcolare e far convalidare rapidamente sul posto.',
        response: 'Adatti il preventivo direttamente, con i lavori supplementari seguiti separatamente.',
      },
      {
        problem: 'L\'avanzamento di un cantiere di facciata è difficile da comunicare al cliente',
        consequence: 'Il cliente si preoccupa o richiama senza una visibilità chiara sul cantiere.',
        response: 'Foto di avanzamento collegate al cantiere, consultabili in qualsiasi momento.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Preventivi con computo metrico di facciata', text: 'Calcoli rapidamente a partire dalle superfici misurate.' },
      { icon: 'list', title: 'Catalogo di tonalità', text: 'Le Sue prestazioni e tonalità abituali memorizzate.' },
      { icon: 'image', title: 'Foto di avanzamento', text: 'Condivida lo stato del cantiere a ogni fase.' },
      { icon: 'plus-circle', title: 'Lavori supplementari', text: 'Una variante decisa in corso di cantiere si aggiunge direttamente.' },
      { icon: 'calendar', title: 'Pianificazione di team', text: 'Organizzi i Suoi team su più cantieri di facciata.' },
      { icon: 'credit-card', title: 'Fatturazione dal preventivo', text: 'La fattura riprende le prestazioni realmente eseguite.' },
    ],
    scenario: {
      title: 'Esempio: una ristrutturazione di facciata con variante di tonalità',
      text: 'Il computo metrico iniziale alimenta il preventivo. Il cantiere viene pianificato con foto di avanzamento regolari. Una variante di tonalità richiesta in corso d\'opera viene aggiunta come lavoro supplementare. La fattura finale riprende l\'insieme.',
    },
    comparison: [
      { before: 'Superfici di facciata ricalcolate a ogni preventivo', after: 'Computo metrico integrato e catalogo riutilizzabile' },
      { before: 'Variante di tonalità difficile da calcolare sul posto', after: 'Adattamento rapido dal catalogo' },
      { before: 'Avanzamento del cantiere poco visibile per il cliente', after: 'Foto di avanzamento collegate al cantiere' },
      { before: 'Preventivo rifatto a ogni nuovo cantiere', after: 'Catalogo di prestazioni riutilizzabile' },
      { before: 'Fattura ricostruita a fine cantiere', after: 'Fattura generata dal preventivo' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di facciate?',
        answer: 'Sì, il piano Essentiel copre preventivi, cantieri e fatturazione per un\'azienda che inizia o lavora con un piccolo team.',
      },
      {
        question: 'Posso integrare un computo metrico di facciata direttamente nel preventivo?',
        answer: 'Sì, il computo metrico alimenta direttamente il preventivo, con un catalogo di prestazioni riutilizzabile.',
      },
      {
        question: 'Come gestire una variante di tonalità o di finitura richiesta in corso di cantiere?',
        answer: 'Si aggiunge direttamente nel preventivo, con i lavori supplementari seguiti separatamente.',
      },
      {
        question: 'Cantia permette di condividere l\'avanzamento di un cantiere con il cliente?',
        answer: 'Sì, le foto di avanzamento restano collegate al cantiere e consultabili in qualsiasi momento.',
      },
      {
        question: 'Posso aggiungere foto a ogni fase del cantiere?',
        answer: 'Sì, classificate automaticamente per cantiere.',
      },
    ],
    relatedBlogSlugs: ['devis-facture-facadier-isolation-suisse'],
    relatedTrades: ['peintre', 'etancheur'],
  },

  etancheur: {
    slug: 'etancheur',
    tradeName: 'Impermeabilizzatori',
    seo: {
      title: 'Software di gestione per impermeabilizzatori in Svizzera | Cantia',
      description:
        'Documenti con precisione i Suoi interventi con Cantia, il software di gestione per le imprese di impermeabilizzazione in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per impermeabilizzatori',
      title: 'Foto, rapporti e controllo: conservi una traccia chiara di ogni intervento',
      subtitle:
        'Cantia aiuta le imprese di impermeabilizzazione a documentare con precisione ogni zona trattata e a generare automaticamente i loro rapporti.',
    },
    painPoints: [
      {
        problem: 'Le zone trattate durante un intervento devono essere documentate con precisione',
        consequence: 'Senza una prova chiara, una garanzia o una contestazione diventa difficile da gestire.',
        response: 'Foto geolocalizzate collegate al cantiere, zona per zona.',
      },
      {
        problem: 'Un difetto scoperto in seguito deve poter essere ricollegato all\'intervento originale',
        consequence: 'Senza uno storico chiaro, impossibile sapere rapidamente cosa sia stato fatto e dove.',
        response: 'Ogni cantiere conserva il proprio storico completo (foto, osservazioni, documenti).',
      },
      {
        problem: 'I rapporti di intervento richiedono tempo da redigere la sera',
        consequence: 'Il tempo amministrativo si accumula dopo una giornata già intensa.',
        response: 'Il rapporto si genera automaticamente dalle foto e dalle note prese sul posto.',
      },
    ],
    usages: [
      { icon: 'image', title: 'Foto per zona trattata', text: 'Geolocalizzate automaticamente, zona per zona.' },
      { icon: 'file-text', title: 'Rapporti automatici', text: 'Generati dalle foto e note del cantiere.' },
      { icon: 'mic', title: 'Preventivi di impermeabilizzazione', text: 'Calcoli rapidamente dal Suo catalogo di prestazioni.' },
      { icon: 'folder', title: 'Storico completo', text: 'Ritrovi in qualsiasi momento tutto ciò che è stato fatto su un cantiere.' },
      { icon: 'plus-circle', title: 'Lavori supplementari', text: 'Un difetto scoperto in corso d\'intervento si aggiunge direttamente.' },
      { icon: 'credit-card', title: 'Fatturazione dal preventivo', text: 'La fattura riprende le prestazioni realmente eseguite.' },
    ],
    scenario: {
      title: 'Esempio: un intervento di impermeabilizzazione di un tetto-terrazza',
      text: 'La diagnosi viene fotografata. Il preventivo viene preparato. L\'intervento viene documentato zona per zona con foto geolocalizzate. Il rapporto si genera automaticamente, e la fattura riprende il preventivo iniziale.',
    },
    comparison: [
      { before: 'Zone trattate non documentate con precisione', after: 'Foto geolocalizzate per zona' },
      { before: 'Difetto scoperto in seguito difficile da ricollegare all\'intervento', after: 'Storico completo per cantiere' },
      { before: 'Rapporto di intervento redatto la sera', after: 'Rapporto generato da foto e note' },
      { before: 'Preventivo rifatto a ogni intervento', after: 'Catalogo di prestazioni riutilizzabile' },
      { before: 'Fattura inviata a posteriori', after: 'Fattura generata dal preventivo' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di impermeabilizzazione?',
        answer: 'Sì, il piano Essentiel copre preventivi, interventi e fatturazione per un\'azienda che inizia o lavora con un piccolo team.',
      },
      {
        question: 'Posso geolocalizzare le foto di ogni zona trattata?',
        answer: 'Sì, ogni foto viene geolocalizzata automaticamente e collegata al cantiere.',
      },
      {
        question: 'Come ritrovare lo storico di un intervento in caso di difetto scoperto in seguito?',
        answer: 'Ogni cantiere conserva il proprio storico completo (foto, osservazioni, documenti), consultabile in qualsiasi momento.',
      },
      {
        question: 'Cantia permette di generare automaticamente un rapporto di intervento?',
        answer: 'Sì, il rapporto si genera dalle foto e note prese sul posto.',
      },
      {
        question: 'Posso aggiungere lavori supplementari scoperti in corso d\'intervento?',
        answer: 'Sì, si aggiungono direttamente al cantiere, ripresi nella fatturazione.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['couvreur', 'facadier'],
  },

  'construction-bois': {
    slug: 'construction-bois',
    tradeName: 'Imprese di costruzioni in legno',
    seo: {
      title: 'Software di gestione per le costruzioni in legno in Svizzera | Cantia',
      description:
        'Coordini progettazione, produzione e posa con Cantia, il software di gestione per le imprese di costruzioni in legno in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per le costruzioni in legno',
      title: 'Dallo studio di progettazione alla posa, mantenga ogni fase del progetto connessa',
      subtitle:
        'Cantia aiuta le imprese di costruzioni in legno a seguire i loro progetti dallo studio fino alla posa, senza perdere informazioni lungo il percorso.',
    },
    painPoints: [
      {
        problem: 'Un progetto di costruzione in legno attraversa più fasi su più settimane',
        consequence: 'L\'informazione si disperde tra una fase e l\'altra se nulla le collega.',
        response: 'Un cantiere centralizzato, dallo studio di progettazione fino alla posa finale.',
      },
      {
        problem: 'Una modifica viene decisa dopo la produzione in laboratorio',
        consequence: 'Rischio di errore di posa se l\'informazione non arriva in tempo al cantiere.',
        response: 'La modifica si aggiunge direttamente al cantiere, visibile a tutto il team.',
      },
      {
        problem: 'Il controllo dell\'avanzamento di un cantiere di più settimane è difficile da comunicare',
        consequence: 'Il cliente come il team perdono la visione d\'insieme del progetto.',
        response: 'Foto e rapporti di avanzamento collegati al cantiere, consultabili in qualsiasi momento.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Preventivo dallo studio', text: 'Calcoli il Suo progetto direttamente dopo lo studio di progettazione.' },
      { icon: 'file-text', title: 'Gestione del progetto', text: 'Studio, produzione e posa seguite nello stesso cantiere.' },
      { icon: 'calendar', title: 'Pianificazione laboratorio e cantiere', text: 'Coordini produzione e posa senza telefonate intermedie.' },
      { icon: 'image', title: 'Foto di avanzamento', text: 'Condivida lo stato del progetto a ogni fase.' },
      { icon: 'plus-circle', title: 'Modifiche', text: 'Una richiesta dell\'ultimo minuto si aggiunge direttamente al cantiere.' },
      { icon: 'credit-card', title: 'Fatturazione dal preventivo', text: 'La fattura riprende il preventivo iniziale, senza nuova immissione.' },
    ],
    scenario: {
      title: 'Esempio: un ampliamento in struttura di legno, dallo studio alla posa',
      text: 'Il preventivo viene preparato dopo lo studio. La produzione viene seguita in laboratorio. La posa viene pianificata e documentata con foto. Una modifica dell\'ultimo minuto viene aggiunta direttamente al cantiere, e la fattura viene generata dal preventivo iniziale.',
    },
    comparison: [
      { before: 'Fasi di studio, produzione e posa seguite separatamente', after: 'Cantiere centralizzato dall\'inizio alla fine' },
      { before: 'Modifica dopo la produzione trasmessa male', after: 'Modifica aggiunta direttamente al cantiere' },
      { before: 'Avanzamento del progetto poco visibile', after: 'Foto e rapporti di avanzamento collegati al cantiere' },
      { before: 'Preventivo rifatto a ogni nuovo progetto', after: 'Catalogo di prestazioni riutilizzabile' },
      { before: 'Fattura ricostruita a fine progetto', after: 'Fattura generata dal preventivo' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di costruzioni in legno?',
        answer: 'Sì, il controllo del progetto in più fasi (studio, produzione, posa) risponde direttamente a questo funzionamento.',
      },
      {
        question: 'Come si segue un progetto dallo studio fino alla posa?',
        answer: 'Il cantiere centralizza ogni fase, con i suoi documenti e il suo stato, nello stesso posto.',
      },
      {
        question: 'Cosa succede se una modifica viene decisa dopo la produzione?',
        answer: 'Si aggiunge direttamente al cantiere, visibile a tutto il team prima della posa.',
      },
      {
        question: 'Cantia permette di condividere l\'avanzamento di un cantiere con il cliente?',
        answer: 'Sì, le foto e i rapporti di avanzamento restano collegati al cantiere.',
      },
      {
        question: 'Posso coordinare laboratorio e team di posa con Cantia?',
        answer: 'Sì, la pianificazione è condivisa tra i due.',
      },
    ],
    relatedBlogSlugs: ['devis-charpente-bois-facturation-suisse'],
    relatedTrades: ['charpentier', 'menuisier'],
  },

  vitrier: {
    slug: 'vitrier',
    tradeName: 'Vetrai',
    seo: {
      title: 'Software di gestione per vetrai in Svizzera | Cantia',
      description:
        'Organizzi misure, ordini, pose e interventi con Cantia, il software di gestione per le imprese di vetraria in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per vetrai',
      title: 'Dalla presa misure alla posa, non perda alcuna informazione',
      subtitle:
        'Cantia aiuta le imprese di vetraria a seguire le loro misure, ordini e interventi, dai più pianificati ai più urgenti.',
    },
    painPoints: [
      {
        problem: 'Una presa misure precisa deve restare esatta fino all\'ordine e alla posa',
        consequence: 'Un errore di misura annotato a mano può costare caro in termini di rilavorazione.',
        response: 'Le misure restano collegate direttamente al cantiere, consultabili a ogni fase.',
      },
      {
        problem: 'Gli ordini di vetrate richiedono talvolta diverse settimane di attesa',
        consequence: 'Senza un controllo chiaro, difficile sapere a che punto sia ogni ordine.',
        response: 'Lo stato dell\'ordine viene seguito per cantiere, visibile a tutto il team.',
      },
      {
        problem: 'Un intervento di riparazione d\'urgenza (rottura di vetro) deve essere gestito rapidamente',
        consequence: 'Senza centralizzazione, l\'urgenza si gestisce nella fretta, con il rischio di dimenticare la fatturazione.',
        response: 'L\'intervento viene registrato e fatturato direttamente dal cantiere.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Preventivi dalle misure', text: 'Calcoli direttamente a partire dalle misure prese sul posto.' },
      { icon: 'file-text', title: 'Gestione dell\'ordine', text: 'Stato dell\'ordine seguito per cantiere, fino alla posa.' },
      { icon: 'calendar', title: 'Pianificazione di posa', text: 'Organizzi le Sue pose appena ricevuta la vetrata.' },
      { icon: 'zap', title: 'Interventi urgenti', text: 'Una rottura di vetro registrata e fatturata rapidamente.' },
      { icon: 'image', title: 'Foto prima/dopo', text: 'Documenti ogni intervento.' },
      { icon: 'credit-card', title: 'Fatturazione dal preventivo', text: 'La fattura riprende l\'ordine convalidato.' },
    ],
    scenario: {
      title: 'Esempio: una sostituzione di vetrata dopo una rottura',
      text: 'L\'intervento d\'urgenza viene registrato. La misura viene presa sul posto, il preventivo preparato e l\'ordine seguito. La posa viene pianificata appena ricevuta la merce, e la fattura viene generata dal preventivo.',
    },
    comparison: [
      { before: 'Misure annotate a mano', after: 'Misure collegate direttamente al cantiere' },
      { before: 'Stato dell\'ordine noto solo al titolare', after: 'Stato seguito e condiviso' },
      { before: 'Riparazione d\'urgenza gestita nella fretta', after: 'Intervento registrato e fatturato direttamente' },
      { before: 'Foto prima/dopo disperse', after: 'Foto classificate per cantiere' },
      { before: 'Preventivo rifatto a ogni intervento', after: 'Catalogo di prestazioni riutilizzabile' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di vetraria?',
        answer: 'Sì, il piano Essentiel copre preventivi, interventi e fatturazione per un\'azienda che inizia o lavora con un piccolo team.',
      },
      {
        question: 'Posso registrare misure precise prese sul posto?',
        answer: 'Sì, le misure restano collegate direttamente al cantiere.',
      },
      {
        question: 'Come seguire lo stato di un ordine di vetrata in attesa di consegna?',
        answer: 'Lo stato dell\'ordine viene seguito per cantiere e visibile a tutto il team.',
      },
      {
        question: 'Cantia permette di gestire un intervento di riparazione urgente?',
        answer: 'Sì, l\'intervento può essere registrato e fatturato direttamente dal cantiere.',
      },
      {
        question: 'Posso fatturare rapidamente dopo una sostituzione di vetrata?',
        answer: 'Sì, una fattura può essere generata dal preventivo appena terminata la posa.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['menuisier', 'serrurier'],
  },

  parqueteur: {
    slug: 'parqueteur',
    tradeName: 'Posatori di parquet',
    seo: {
      title: 'Software di gestione per posatori di parquet e pavimenti in Svizzera | Cantia',
      description:
        'Segua superfici, materiali, team e tempi di posa con Cantia, il software di gestione per le imprese di posa pavimenti in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per posatori di parquet e pavimenti',
      title: 'Le Sue superfici sono calcolate. Anche i Suoi margini devono esserlo.',
      subtitle:
        'Cantia aiuta le imprese di posa pavimenti a calcolare le loro superfici rapidamente e a sapere cosa rende realmente un cantiere di posa.',
    },
    painPoints: [
      {
        problem: 'Le superfici di pavimento vengono ricalcolate a ogni preventivo',
        consequence: 'Perdita di tempo su computi metrici ripetitivi da un cantiere all\'altro.',
        response: 'Il computo metrico delle superfici è integrato nel preventivo, con un catalogo di materiali riutilizzabile.',
      },
      {
        problem: 'Una variante di materiale o di posa viene richiesta in corso di cantiere',
        consequence: 'Difficile da calcolare rapidamente sul posto.',
        response: 'Adatti il preventivo direttamente, con i lavori supplementari seguiti separatamente.',
      },
      {
        problem: 'Il tempo di posa reale non viene mai confrontato con quanto preventivato',
        consequence: 'Impossibile sapere se un cantiere di posa sia stato davvero redditizio.',
        response: 'Colleghi le ore al cantiere, confrontate con il preventivato.',
      },
    ],
    usages: [
      { icon: 'mic', title: 'Preventivi con computo metrico delle superfici', text: 'Calcoli rapidamente a partire dalle superfici misurate.' },
      { icon: 'list', title: 'Catalogo dei materiali', text: 'Le Sue prestazioni e materiali abituali memorizzati.' },
      { icon: 'clock', title: 'Rilevazione delle ore di posa', text: 'Confronti il tempo previsto con quello effettivamente impiegato.' },
      { icon: 'image', title: 'Foto prima/dopo', text: 'Conservi una prova visiva di ogni cantiere.' },
      { icon: 'plus-circle', title: 'Lavori supplementari', text: 'Una variante di materiale si aggiunge direttamente.' },
      { icon: 'credit-card', title: 'Fatturazione dal preventivo', text: 'La fattura riprende le prestazioni convalidate.' },
    ],
    scenario: {
      title: 'Esempio: una posa di parquet con variante di materiale',
      text: 'Il computo metrico delle superfici alimenta un preventivo preparato con il catalogo. Una variante di materiale richiesta in corso di cantiere viene aggiunta come lavoro supplementare. Le ore di posa vengono seguite, e la fattura finale riprende l\'insieme.',
    },
    comparison: [
      { before: 'Superfici ricalcolate a ogni preventivo', after: 'Computo metrico integrato nel preventivo' },
      { before: 'Variante di materiale difficile da calcolare sul posto', after: 'Adattamento rapido dal catalogo' },
      { before: 'Tempo di posa mai confrontato con il preventivato', after: 'Ore seguite e confrontate con il preventivato' },
      { before: 'Foto di posa disperse', after: 'Foto classificate per cantiere' },
      { before: 'Preventivo rifatto a ogni nuovo cantiere', after: 'Catalogo di prestazioni riutilizzabile' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un posatore di parquet indipendente o con un piccolo team?',
        answer: 'Sì, il piano Essentiel copre preventivi, catalogo e fatturazione per un\'azienda che lavora da sola o con un piccolo team.',
      },
      {
        question: 'Posso integrare un computo metrico delle superfici direttamente nel preventivo?',
        answer: 'Sì, il computo metrico alimenta direttamente il preventivo.',
      },
      {
        question: 'Come gestire una variante di materiale richiesta in corso di cantiere?',
        answer: 'Si aggiunge direttamente nel preventivo a partire dal catalogo.',
      },
      {
        question: 'Cantia permette di confrontare il tempo di posa reale con il preventivo?',
        answer: 'Sì, le ore registrate per cantiere vengono confrontate con l\'importo preventivato.',
      },
      {
        question: 'Posso aggiungere foto prima/dopo per ogni cantiere?',
        answer: 'Sì, le foto vengono classificate automaticamente per cantiere.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['carreleur', 'menuisier'],
  },

  echafaudeur: {
    slug: 'echafaudeur',
    tradeName: 'Ponteggiatori',
    seo: {
      title: 'Software di gestione per ponteggiatori in Svizzera | Cantia',
      description:
        'Organizzi montaggio, smontaggio e team con Cantia, il software di gestione per le imprese di ponteggi in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per ponteggiatori',
      title: 'Pianifichi i Suoi team e mantenga ogni cantiere sotto controllo',
      subtitle:
        'Cantia aiuta le imprese di ponteggi a coordinare montaggio e smontaggio con gli altri mestieri, senza perdere tempo né giorni di noleggio.',
    },
    painPoints: [
      {
        problem: 'Montaggio e smontaggio devono essere pianificati con precisione insieme ad altri mestieri',
        consequence: 'Un cattivo tempismo blocca il cantiere successivo o immobilizza materiale inutilmente.',
        response: 'Una pianificazione centralizzata, coordinata con le date degli altri intervenanti.',
      },
      {
        problem: 'La durata reale di noleggio di un ponteggio supera talvolta quanto previsto',
        consequence: 'Senza un controllo chiaro, il costo aggiuntivo di noleggio non viene sempre fatturato.',
        response: 'Ogni cantiere segue le proprie date reali di montaggio e smontaggio, riprese nella fatturazione.',
      },
      {
        problem: 'Lo stato del materiale e la sicurezza del montaggio devono essere documentati',
        consequence: 'In caso di controllo o contestazione, l\'assenza di prove complica tutto.',
        response: 'Foto e osservazioni collegate al cantiere, datate automaticamente.',
      },
    ],
    usages: [
      { icon: 'calendar', title: 'Pianificazione montaggio/smontaggio', text: 'Coordinata con le date degli altri mestieri.' },
      { icon: 'clock', title: 'Controllo della durata di noleggio', text: 'Ogni cantiere segue le proprie date reali.' },
      { icon: 'image', title: 'Foto di sicurezza', text: 'Documenti lo stato del materiale e il montaggio.' },
      { icon: 'mic', title: 'Preventivi rapidi', text: 'Calcoli dal Suo catalogo di prestazioni.' },
      { icon: 'users', title: 'Coordinamento', text: 'Lavori in collegamento con gli altri intervenanti del cantiere.' },
      { icon: 'credit-card', title: 'Fatturazione dal preventivo', text: 'Fatturi la durata effettivamente utilizzata.' },
    ],
    scenario: {
      title: 'Esempio: un ponteggio per un cantiere di facciata',
      text: 'Il montaggio viene pianificato in coordinamento con l\'impresa di facciata. La durata di noleggio viene seguita, un prolungamento imprevisto documentato e fatturato. Lo smontaggio viene pianificato appena terminati i lavori.',
    },
    comparison: [
      { before: 'Montaggio/smontaggio coordinato per telefono', after: 'Pianificazione centralizzata e condivisa' },
      { before: 'Durata di noleggio superata non fatturata', after: 'Durata reale seguita e fatturata' },
      { before: 'Stato del materiale non documentato', after: 'Foto e osservazioni collegate al cantiere' },
      { before: 'Preventivo rifatto a ogni nuovo cantiere', after: 'Catalogo di prestazioni riutilizzabile' },
      { before: 'Fattura ricostruita a posteriori', after: 'Fattura generata dal preventivo' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di ponteggi?',
        answer: 'Sì, il piano Essentiel copre preventivi, cantieri e fatturazione per un\'azienda che inizia o lavora con un piccolo team.',
      },
      {
        question: 'Si possono coordinare montaggio e smontaggio con altri mestieri?',
        answer: 'Sì, la pianificazione è centralizzata e condivisa con gli intervenanti del cantiere.',
      },
      {
        question: 'Come fatturare un prolungamento di noleggio imprevisto?',
        answer: 'La durata reale di montaggio/smontaggio viene seguita per cantiere e ripresa nella fatturazione.',
      },
      {
        question: 'Cantia permette di documentare lo stato del materiale e la sicurezza del montaggio?',
        answer: 'Sì, foto e osservazioni restano collegate al cantiere e datate automaticamente.',
      },
      {
        question: 'Posso seguire più cantieri di ponteggio in parallelo?',
        answer: 'Sì, la pianificazione centralizza tutti i Suoi cantieri attivi.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['couvreur', 'facadier'],
  },

  demolition: {
    slug: 'demolition',
    tradeName: 'Imprese di demolizione',
    seo: {
      title: 'Software di gestione per imprese di demolizione | Cantia',
      description:
        'Segua macchine, ore, foto e spese per cantiere con Cantia, il software di gestione per le imprese di demolizione in Svizzera.',
    },
    hero: {
      eyebrow: 'Gestione aziendale per la demolizione',
      title: 'Ore, macchine, foto e spese riunite per cantiere',
      subtitle:
        'Cantia aiuta le imprese di demolizione a seguire il costo reale dei loro cantieri e a documentare ogni stato dei luoghi.',
    },
    painPoints: [
      {
        problem: 'Le spese di macchine e smaltimento non vengono seguite con precisione per cantiere',
        consequence: 'La redditività reale di un cantiere di demolizione è difficile da conoscere prima della fine.',
        response: 'Colleghi le spese al cantiere, confrontate con il preventivato in continuo.',
      },
      {
        problem: 'Lo stato dei luoghi prima della demolizione deve essere documentato chiaramente',
        consequence: 'In caso di contestazione con un vicino o un\'assicurazione, l\'assenza di prove complica tutto.',
        response: 'Foto geolocalizzate prima, durante e dopo, collegate al cantiere.',
      },
      {
        problem: 'Le ore di team e di macchine sono difficili da ripartire tra più cantieri',
        consequence: 'Impossibile sapere con precisione quanto sia costato un cantiere in manodopera e macchine.',
        response: 'Colleghi le ore al cantiere, per persona e per macchina.',
      },
    ],
    usages: [
      { icon: 'dollar-sign', title: 'Controllo delle spese', text: 'Macchine e smaltimento collegati al cantiere giusto.' },
      { icon: 'image', title: 'Foto prima/durante/dopo', text: 'Documenti lo stato dei luoghi a ogni fase.' },
      { icon: 'clock', title: 'Ore per cantiere', text: 'Team e macchine seguite, cantiere per cantiere.' },
      { icon: 'trending-up', title: 'Redditività in diretta', text: 'Confronti preventivato e costo reale in continuo.' },
      { icon: 'mic', title: 'Preventivi e fatture', text: 'Dal preventivo iniziale alla fattura finale.' },
      { icon: 'folder', title: 'Documenti e autorizzazioni', text: 'Centralizzati per cantiere.' },
    ],
    scenario: {
      title: 'Esempio: una demolizione con stato dei luoghi documentato',
      text: 'Lo stato dei luoghi viene fotografato prima dei lavori. Il preventivo viene preparato. Il cantiere viene seguito con ore e spese di macchine collegate. Foto di fine cantiere completano il dossier, e la fattura finale riprende l\'insieme.',
    },
    comparison: [
      { before: 'Spese di macchine e smaltimento non seguite', after: 'Spese collegate al cantiere' },
      { before: 'Stato dei luoghi non documentato', after: 'Foto geolocalizzate prima/durante/dopo' },
      { before: 'Ore di team e macchine difficili da ripartire', after: 'Ore collegate al cantiere' },
      { before: 'Redditività conosciuta a fine cantiere', after: 'Redditività seguita in diretta' },
      { before: 'Documenti e autorizzazioni dispersi', after: 'Centralizzati per cantiere' },
    ],
    faq: [
      {
        question: 'Cantia è adatto a un\'impresa di demolizione?',
        answer: 'Sì, il controllo delle spese di macchine e la redditività per cantiere rispondono direttamente a questo funzionamento.',
      },
      {
        question: 'Si può seguire il costo delle macchine e dello smaltimento per cantiere?',
        answer: 'Sì, ogni spesa è collegata al cantiere interessato e confrontata con l\'importo preventivato.',
      },
      {
        question: 'Come si documenta uno stato dei luoghi prima della demolizione?',
        answer: 'Possono essere scattate foto geolocalizzate prima, durante e dopo i lavori, collegate al cantiere.',
      },
      {
        question: 'Cantia permette di conoscere la redditività di un cantiere prima della sua fine?',
        answer: 'Sì, il confronto tra importo preventivato e costo reale è disponibile in continuo.',
      },
      {
        question: 'Posso seguire le ore di team e macchine per cantiere?',
        answer: 'Sì, ogni ora registrata è collegata a un cantiere e alla persona o macchina interessata.',
      },
    ],
    relatedBlogSlugs: [],
    relatedTrades: ['terrassier', 'genie-civil'],
  },
};
