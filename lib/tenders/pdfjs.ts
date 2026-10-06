// pdf.js in the browser, loaded on demand from cdnjs (same approach as the
// Leaflet maps): nothing is added to the app bundle, and the 1 MB library is
// only fetched by someone who imports a soumission or opens a plan.

import { Platform } from 'react-native';
import type { PdfJsLike } from './parser/extract.ts';

const VERSION = '3.11.174';
const BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${VERSION}`;

export interface PdfJsWeb extends PdfJsLike {
  GlobalWorkerOptions: { workerSrc: string };
}

let loading: Promise<PdfJsWeb> | null = null;

export function loadPdfJs(): Promise<PdfJsWeb> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return Promise.reject(new Error('Disponible sur ordinateur (navigateur) uniquement.'));
  const w = window as unknown as { pdfjsLib?: PdfJsWeb };
  if (w.pdfjsLib) return Promise.resolve(w.pdfjsLib);
  if (loading) return loading;
  loading = new Promise<PdfJsWeb>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${BASE}/pdf.min.js`;
    script.async = true;
    script.onload = () => {
      const lib = (window as unknown as { pdfjsLib?: PdfJsWeb }).pdfjsLib;
      if (!lib) return reject(new Error('pdf.js introuvable'));
      lib.GlobalWorkerOptions.workerSrc = `${BASE}/pdf.worker.min.js`;
      resolve(lib);
    };
    script.onerror = () => {
      loading = null;
      reject(new Error('Impossible de charger le lecteur PDF. Vérifiez votre connexion.'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

export async function sha256Hex(data: Uint8Array): Promise<string | null> {
  try {
    const digest = await crypto.subtle.digest('SHA-256', data as unknown as ArrayBuffer);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
}
