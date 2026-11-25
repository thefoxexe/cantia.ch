import type * as PdfLib from 'pdf-lib';

// pdf-lib is not in the app bundle (see lib/loadPdfLib.ts): it is loaded
// from cdnjs when a PDF is actually drawn. The copied renderer only needs
// rgb() at module load (colour constants), which is a plain object in
// pdf-lib ({ type: ColorTypes.RGB, red, green, blue }), so it is built here.
export type { PDFDocument, PDFFont, PDFImage, PDFPage, RGB } from 'pdf-lib';

export const rgb: typeof PdfLib.rgb = (red, green, blue) => ({ type: 'RGB', red, green, blue }) as ReturnType<typeof PdfLib.rgb>;
