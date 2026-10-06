// Shapes shared by the import pipeline:
// DocumentExtractor → LayoutAnalyzer → TenderParser → ValidationEngine.

import type { NodeType, SourceBox } from '../types.ts';

// One text run as the PDF draws it, in PDF points, origin top-left.
export interface TextItem {
  page: number; // 1-based
  x: number;
  y: number; // top of the run
  w: number;
  h: number;
  str: string;
  fontSize: number;
  fontName?: string;
}

export interface PageInfo {
  page: number;
  width: number;
  height: number;
  rotation: number;
  textItems: number;
}

export interface ExtractedDocument {
  pages: PageInfo[];
  items: TextItem[];
  // true when most pages carry no text layer (scan) → OCR path.
  scanned: boolean;
}

// A visual line: runs of the same page sharing a baseline, left to right.
export interface Line {
  page: number;
  y: number;
  h: number;
  items: TextItem[];
  text: string;
}

export type Certainty = 'certain' | 'probable' | 'uncertain';

export interface DraftBreakdown {
  code: string;
  quantity: number | null;
  rawQuantity: string | null;
  unit: string | null;
  page: number;
  bbox: SourceBox;
  // The document leaves the quantity as a field to fill in ("...... m2").
  blank?: boolean;
}

export interface DraftNode {
  key: string; // stable key inside the draft
  parentKey: string | null;
  nodeType: NodeType;
  depth: number;
  rawNumber: string | null; // exactly as printed: "121", ".111", "R 429"
  positionPath: string | null; // "121.111"
  displayReference: string | null; // "241 / 121.111"
  canChapter: string | null;
  canVersion: string | null;
  canLanguage: string | null;
  cfcCode: string | null;
  isReserved: boolean;
  title: string;
  description: string; // complete text, never truncated
  rawText: string; // the source lines, as extracted
  page: number | null;
  bbox: SourceBox | null; // normalized 0..1 on its page
  // billable only
  rawUnit: string | null;
  unit: string | null;
  quantity: number | null; // the soumission's total (":Total" or the single zone)
  rawQuantity: string | null;
  breakdowns: DraftBreakdown[];
  documentUnitPrice: number | null;
  documentAmount: number | null;
  certainty: Certainty;
  issues: DraftIssue[];
}

export type IssueKind = 'unit_unknown' | 'unit_missing' | 'quantity_missing' | 'breakdown_sum' | 'amount_mismatch' | 'orphan_quantity' | 'number_ambiguous';

export interface DraftIssue {
  kind: IssueKind;
  message: string;
  // what the user can pick from, for a question
  choices?: string[];
}

export interface DraftQuestion {
  id: string;
  kind: 'unit' | 'zone_label' | 'classification' | 'column_role';
  prompt: string;
  nodeKeys: string[];
  choices?: string[];
  code?: string; // zone_label
  answer?: string | null;
}

export interface DocumentMeta {
  title: string | null;
  tenderNumber: string | null;
  project: string | null;
  owner: string | null;
  architect: string | null;
  engineer: string | null;
  cfcCode: string | null;
  cfcLabel: string | null;
  date: string | null;
  language: 'fr' | 'de' | 'it' | null;
  zoneCodes: string[];
  documentVatRate: number | null;
  chapters: { code: string; title: string; version: string | null }[];
}

export interface ParseStats {
  pages: number;
  nodes: number;
  billable: number;
  certain: number;
  probable: number;
  uncertain: number;
  reserved: number;
  breakdowns: number;
  carryForwards: number;
  chapterTotals: number;
  pricesInDocument: number;
}

export interface ParseResult {
  parserVersion: string;
  classification: 'CAN' | 'CUSTOM' | 'UNKNOWN';
  classificationConfidence: number;
  meta: DocumentMeta;
  nodes: DraftNode[];
  questions: DraftQuestion[];
  stats: ParseStats;
}
