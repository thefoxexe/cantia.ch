# Black Friday announcement for companies that do not know Cantia yet
# (FR/DE/IT). Same template as build.py (logo, white body, one link domain),
# other words: who we are, what Cantia does, then the offer.
import copy, json
import build

A = copy.deepcopy(build.C)
YEAR = [('Essentiel', '20.–', '240.–'), ('Équipe', '36.–', '432.–'), ('Entreprise', '47.20', '566.40')]

A['fr'].update(
  subject='Black Friday chez Cantia : ça vaut le détour',
  preheader='Le logiciel suisse des PME, jusqu’à -54 % à vie. Jusqu’au lundi 30 novembre à minuit.',
  p1='Cantia est un logiciel suisse qui réunit, au même endroit, tout ce qui fait tourner une entreprise qui travaille par projets :',
  feat=['Devis signés en ligne par vos clients', 'Factures QR et relances automatiques', 'Chantiers, rapports et photos depuis le téléphone', 'Planning de l’équipe, heures et salaires', 'Comptabilité et TVA, prêtes pour votre fiduciaire'],
  p2='Pour notre premier Black Friday, tous les plans sont à prix réduit jusqu’au <b>lundi 30 novembre à minuit</b>. Et ce prix reste le vôtre tant que vous gardez l’abonnement.',
  p3='',
  p5='Une question avant de vous décider ? Répondez simplement à ce mail, nous vous répondons personnellement.',
  foot='Pour ne plus recevoir nos offres, répondez « stop ».')
A['de'].update(
  subject='Black Friday bei Cantia: Es lohnt sich',
  preheader='Die Schweizer Software für KMU, bis zu -54 % lebenslang. Bis Montag, 30. November, Mitternacht.',
  p1='Cantia ist eine Schweizer Software, die alles an einem Ort vereint, was ein Unternehmen braucht, das in Projekten arbeitet:',
  feat=['Offerten, die Ihre Kunden online unterschreiben', 'QR-Rechnungen und automatische Mahnungen', 'Baustellen, Rapporte und Fotos vom Handy aus', 'Einsatzplanung, Stunden und Löhne', 'Buchhaltung und MWST, bereit für Ihre Treuhand'],
  p2='Zu unserem ersten Black Friday sind alle Pläne bis <b>Montag, 30. November, Mitternacht</b> günstiger. Und dieser Preis bleibt Ihrer, solange Sie das Abo behalten.',
  p3='',
  foot='Um keine Angebote mehr zu erhalten, antworten Sie mit «Stopp».')
A['it'].update(
  subject='Black Friday da Cantia: vale la pena',
  preheader='Il software svizzero per le PMI, fino a -54 % a vita. Fino a lunedì 30 novembre a mezzanotte.',
  p1='Cantia è un software svizzero che riunisce in un unico posto tutto ciò che serve a un’impresa che lavora per progetti:',
  feat=['Preventivi firmati online dai clienti', 'Fatture QR e solleciti automatici', 'Cantieri, rapporti e foto dal telefono', 'Pianificazione della squadra, ore e salari', 'Contabilità e IVA, pronte per la fiduciaria'],
  p2='Per il nostro primo Black Friday tutti i piani sono scontati fino a <b>lunedì 30 novembre a mezzanotte</b>. E questo prezzo resta suo finché mantiene l’abbonamento.',
  p3='',
  foot='Per non ricevere più le nostre offerte, risponda «stop».')
for loc in A:
    A[loc]['hello'] = {'fr': 'Bonjour,', 'de': 'Grüezi', 'it': 'Buongiorno,'}[loc]

meta = {}
for loc in A:
    html = build.build(loc, A).replace('utm_campaign=bf2026-relance', 'utm_campaign=bf2026-annonce')
    txt = build.build_text(loc, A).replace('utm_campaign=bf2026-relance', 'utm_campaign=bf2026-annonce')
    open(f'black-friday-annonce-{loc}.html', 'w').write(html)
    open(f'black-friday-annonce-{loc}.txt', 'w').write(txt)
    meta[loc] = {'subject': A[loc]['subject'], 'preheader': A[loc]['preheader']}
json.dump(meta, open('objets-annonce.json', 'w'), ensure_ascii=False, indent=1)
print('ok')
