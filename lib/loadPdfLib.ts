// pdf-lib, loaded on demand from cdnjs in the browser (never in the app
// bundle). Used to fill soumission PDFs and to export the construction
// schedule.
import type { PdfLibLike } from './tenders/pdfFill';

let loading: Promise<PdfLibLike> | null = null;
export function loadPdfLib(): Promise<PdfLibLike> {
  const w = window as unknown as { PDFLib?: PdfLibLike };
  if (w.PDFLib) return Promise.resolve(w.PDFLib);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
    s.async = true;
    s.onload = () => ((window as unknown as { PDFLib?: PdfLibLike }).PDFLib ? resolve((window as unknown as { PDFLib: PdfLibLike }).PDFLib) : reject(new Error('pdf-lib introuvable')));
    s.onerror = () => {
      loading = null;
      reject(new Error('Impossible de charger l’outil PDF. Vérifiez votre connexion.'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

