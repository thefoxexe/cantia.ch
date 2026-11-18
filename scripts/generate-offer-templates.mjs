// Blank quote templates offered for download on the quote pages
// (/de/offerte-erstellen, /it/creare-preventivo): the same structure as the
// French one (public/downloads/modele-devis-gratuit-batiment.pdf), in
// German and Italian. Run once after changing the texts:
// `node scripts/generate-offer-templates.mjs`.
import { writeFileSync } from 'node:fs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const COPY = {
  de: {
    file: 'public/downloads/offerte-vorlage-handwerker.pdf',
    title: 'Offerte-Vorlage – leer',
    subject: 'Leere Offerte-Vorlage für Handwerksbetriebe in der Schweiz',
    heading: 'OFFERTE',
    company: 'UNTERNEHMEN',
    client: 'KUNDE',
    companyLines: ['Firma: ', 'Adresse: ', 'PLZ / Ort: ', 'UID / MWST-Nr.: ', 'Tel.: ', 'E-Mail: '],
    clientLines: ['Name / Firma: ', 'Adresse: ', 'PLZ / Ort: '],
    number: 'Offerte Nr.: ',
    date: 'Datum: ',
    validity: 'Gültig bis: ',
    subjectLine: 'Gegenstand der Arbeiten: ',
    cols: ['Beschreibung', 'Menge', 'Einheit', 'Preis/Einh. CHF', 'Total CHF'],
    subtotal: 'Total exkl. MWST',
    vat: 'MWST 8,1 %',
    total: 'Total inkl. MWST',
    termsTitle: 'Bedingungen',
    terms: [
      'Diese Offerte ist bis zum oben genannten Datum gültig. Die Arbeiten beginnen nach schriftlicher Annahme.',
      'Nicht vorgesehene Mehrleistungen werden vor der Ausführung mit einem unterschriebenen Nachtrag vereinbart.',
      'Zahlungsbedingungen: ',
    ],
    accept: 'Angenommen, der Kunde (Ort, Datum, Unterschrift)',
    sign: 'Unterschrift des Unternehmens',
    footer: 'Vorlage von Cantia – Offerten und Rechnungen für Handwerksbetriebe – cantia.ch',
  },
  it: {
    file: 'public/downloads/modello-preventivo-edilizia.pdf',
    title: 'Modello di preventivo – vuoto',
    subject: 'Modello di preventivo vuoto per artigiani e imprese edili in Svizzera',
    heading: 'PREVENTIVO',
    company: 'IMPRESA',
    client: 'CLIENTE',
    companyLines: ['Ragione sociale: ', 'Indirizzo: ', 'NPA / Località: ', 'IDI / N. IVA: ', 'Tel.: ', 'E-mail: '],
    clientLines: ['Nome / Ragione sociale: ', 'Indirizzo: ', 'NPA / Località: '],
    number: 'Preventivo n.: ',
    date: 'Data: ',
    validity: 'Valido fino al: ',
    subjectLine: 'Oggetto dei lavori: ',
    cols: ['Descrizione', 'Quantità', 'Unità', 'Prezzo unit. CHF', 'Totale CHF'],
    subtotal: 'Totale IVA esclusa',
    vat: 'IVA 8,1 %',
    total: 'Totale IVA inclusa',
    termsTitle: 'Condizioni',
    terms: [
      'Il presente preventivo è valido fino alla data indicata sopra. I lavori iniziano dopo l’accettazione scritta.',
      'Ogni prestazione supplementare non prevista è concordata con un’aggiunta firmata prima dell’esecuzione.',
      'Condizioni di pagamento: ',
    ],
    accept: 'Per accettazione, il cliente (luogo, data, firma)',
    sign: 'Firma dell’impresa',
    footer: 'Modello proposto da Cantia – preventivi e fatture per le imprese edili – cantia.ch',
  },
};

const INK = rgb(0.145, 0.161, 0.129);
const MUTED = rgb(0.45, 0.47, 0.43);
const COPPER = rgb(0.651, 0.365, 0.212);
const LINE = rgb(0.85, 0.85, 0.82);
const dots = (n) => '.'.repeat(n);

for (const c of Object.values(COPY)) {
  const doc = await PDFDocument.create();
  doc.setTitle(c.title);
  doc.setSubject(c.subject);
  doc.setAuthor('Cantia');
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const text = (s, x, y, size = 9, f = font, color = INK) => page.drawText(s, { x, y, size, font: f, color });
  const M = 48;
  const W = 595.28 - 2 * M;

  text(c.heading, M, 790, 22, bold);
  text('cantia.ch', 595.28 - M - font.widthOfTextAtSize('cantia.ch', 9), 796, 9, font, COPPER);
  page.drawLine({ start: { x: M, y: 778 }, end: { x: M + W, y: 778 }, thickness: 1.2, color: COPPER });

  let y = 752;
  text(c.company, M, y, 8, bold, MUTED);
  text(c.client, M + W / 2 + 10, y, 8, bold, MUTED);
  y -= 16;
  c.companyLines.forEach((l, i) => text(l + dots(Math.max(8, 56 - l.length)), M, y - i * 15));
  c.clientLines.forEach((l, i) => text(l + dots(Math.max(8, 56 - l.length)), M + W / 2 + 10, y - i * 15));

  y = 640;
  page.drawRectangle({ x: M, y: y - 8, width: W, height: 24, color: rgb(0.965, 0.957, 0.937) });
  text(c.number + dots(18), M + 8, y, 9);
  text(c.date + dots(16), M + 190, y, 9);
  text(c.validity + dots(16), M + 340, y, 9);
  y -= 34;
  text(c.subjectLine + dots(110 - c.subjectLine.length), M, y, 9);

  // Lines of the quote.
  y -= 30;
  const colX = [M, M + 255, M + 305, M + 355, M + 435];
  page.drawRectangle({ x: M, y: y - 6, width: W, height: 20, color: INK });
  c.cols.forEach((h, i) => text(h, colX[i] + 6, y, 8.5, bold, rgb(1, 1, 1)));
  for (let r = 0; r < 12; r++) {
    const ry = y - 26 - r * 20;
    page.drawLine({ start: { x: M, y: ry }, end: { x: M + W, y: ry }, thickness: 0.6, color: LINE });
  }
  y = y - 26 - 12 * 20 - 22;
  for (const [label, strong] of [[c.subtotal, false], [c.vat, false], [c.total, true]]) {
    text(label, M + 300, y, 9.5, strong ? bold : font);
    text('CHF ' + dots(22), M + 400, y, 9.5, strong ? bold : font);
    y -= 18;
  }

  y -= 14;
  text(c.termsTitle, M, y, 9, bold);
  y -= 14;
  c.terms.forEach((t, i) => text(i === c.terms.length - 1 ? t + dots(80) : t, M, y - i * 13, 8.5, font, MUTED));

  y -= 70;
  text(c.accept, M, y, 8.5, bold);
  text(c.sign, M + W / 2 + 10, y, 8.5, bold);
  page.drawLine({ start: { x: M, y: y - 40 }, end: { x: M + W / 2 - 20, y: y - 40 }, thickness: 0.6, color: LINE });
  page.drawLine({ start: { x: M + W / 2 + 10, y: y - 40 }, end: { x: M + W, y: y - 40 }, thickness: 0.6, color: LINE });

  text(c.footer, (595.28 - font.widthOfTextAtSize(c.footer, 7.5)) / 2, 30, 7.5, font, MUTED);
  writeFileSync(c.file, await doc.save());
  console.log('written', c.file);
}
