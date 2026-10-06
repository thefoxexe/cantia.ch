// Row shapes of the métrés tables (supabase/migrations/20261006120000_tenders_foundation.sql).

export type TenderKind = 'soumission' | 'interne' | 'variante' | 'complementaire';
export type TenderStatus = 'draft' | 'in_progress' | 'priced' | 'offered' | 'archived';
export type ClassificationType = 'CAN' | 'CUSTOM' | 'UNKNOWN';
export type TenderSourceType = 'manual' | 'pdf' | 'duplicate' | 'csv' | 'crbx' | 'legacy';

export type NodeType =
  | 'contract'
  | 'chapter'
  | 'section'
  | 'subsection'
  | 'article'
  | 'subarticle'
  | 'billable_position'
  | 'carry_forward'
  | 'subtotal'
  | 'chapter_total'
  | 'financial_adjustment'
  | 'note'
  | 'other';

export type QuantitySource = 'original' | 'measured' | 'manual';
export type PriceSource = 'document' | 'manual' | 'catalog' | 'last_used' | 'history_average' | 'external';
export type PositionStatus = 'imported' | 'to_review' | 'validated' | 'to_measure' | 'measured' | 'to_price' | 'priced' | 'complete' | 'excluded';

export interface Tender {
  id: string;
  organization_id: string;
  project_id: string;
  name: string;
  number: string | null;
  kind: TenderKind;
  status: TenderStatus;
  classification_type: ClassificationType;
  cfc_code: string | null;
  cfc_label: string | null;
  language: 'fr' | 'de' | 'it';
  currency: string;
  source_type: TenderSourceType;
  metadata: Record<string, unknown>;
  discount_percent: number;
  escompte_percent: number;
  vat_rate: number;
  devis_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SourceBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TenderNode {
  id: string;
  tender_id: string;
  parent_id: string | null;
  node_type: NodeType;
  sort_order: number;
  depth: number;
  raw_number: string | null;
  position_path: string | null;
  display_reference: string | null;
  classification_type: ClassificationType | null;
  cfc_code: string | null;
  can_chapter: string | null;
  can_position: string | null;
  can_version: string | null;
  can_language: string | null;
  is_reserved: boolean;
  title: string | null;
  description: string | null;
  raw_text: string | null;
  source_document_id: string | null;
  source_page: number | null;
  source_bbox: SourceBox | null;
  confidence: number | null;
  needs_review: boolean;
  validated_by: string | null;
  validated_at: string | null;
}

export interface TenderPosition {
  id: string;
  tender_id: string;
  node_id: string;
  raw_unit: string | null;
  unit: string | null;
  quantity_original: number | null;
  quantity_measured: number | null;
  quantity_manual: number | null;
  manual_note: string | null;
  quantity_selected_source: QuantitySource;
  quantity_selected: number | null;
  status: PositionStatus;
  excluded: boolean;
}

export interface PositionBreakdown {
  id: string;
  tender_id: string;
  position_id: string;
  code: string;
  label: string | null;
  unit: string | null;
  quantity_original: number | null;
  quantity_measured: number | null;
  quantity_manual: number | null;
  sort_order: number;
  source_page: number | null;
  source_bbox: SourceBox | null;
  confidence: number | null;
}

export interface PositionPrice {
  position_id: string;
  tender_id: string;
  unit_price: number | null;
  price_source: PriceSource | null;
  document_unit_price: number | null;
  document_amount: number | null;
  amount: number | null;
}

export interface ZoneLabel {
  tender_id: string;
  code: string;
  label: string | null;
  source: 'document' | 'user';
}
