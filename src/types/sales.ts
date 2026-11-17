export type BrandUnit = 'Explast' | 'PrintBox';

export type RequestType = 
  | 'repeat'        // Reorder existing product
  | 'modified'      // Existing product with changes (artwork, dimensions, material, quantity)
  | 'new_standard'  // New standard catalogue product
  | 'new_custom'    // New custom product
  | 'concept';      // Concept or design enquiry (early stage)

export type RequestStatus = 
  | 'draft' 
  | 'submitted' 
  | 'incomplete' 
  | 'technical_review' 
  | 'approved';

export type ProductFamily = 
  | 'paper_bag' 
  | 'takeaway_box' 
  | 'plastic_sack' 
  | 'paper_cup' 
  | 'custom';

export type TechStatus = 'confirmed' | 'approximate' | 'pending_review' | 'unknown';

export interface Client {
  id: string;
  company_name: string;
  industry?: string;
  location_type?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  status?: string;
  sales_rep_id?: string;
  delivery_address?: string;
  notes?: string;
  account_tier?: string;
  credit_terms?: string;
  active_projects_count?: number;
  assigned_salesperson?: string;
  created_at?: string;
}

export interface StandardVariant {
  variant_id: string;
  label: string;
  width?: number;
  length?: number;
  height?: number;
  capacity?: string;
  gsm?: number;
  micron?: number;
}

export interface Product {
  id: string;
  brand_unit: BrandUnit;
  product_category: string;
  product_type: string;
  product_name: string;
  product_code: string;
  product_family: ProductFamily;
  material_base?: string;
  moq: number;
  unit: string;
  is_active: boolean;
  standard_variants?: StandardVariant[];
}

export interface DimensionsSpec {
  width?: number;
  length?: number;
  height?: number;
  unit: 'mm' | 'cm';
  dimension_type: 'internal' | 'external' | 'assembled' | 'flat';
  status: TechStatus;
}

export interface MaterialSpec {
  material_type: string;
  gsm_or_micron?: string;
  color?: string;
  food_grade: boolean;
  construction_style?: string;
  status: TechStatus;
}

export interface PrintingSpec {
  print_type: 'plain' | 'existing_artwork' | 'modified_artwork' | 'new_artwork' | 'decide_later';
  surfaces?: number;
  colors?: string;
  special_finishing?: string;
  artwork_ready: boolean;
  status: TechStatus;
}

export interface ProjectItemSpec {
  id: string;
  item_type: RequestType;
  product_id?: string;
  product_family: ProductFamily;
  description: string;
  intended_use?: string;
  quantity: number;
  quantity_status: 'estimated' | 'confirmed';
  repeat_frequency?: string;
  dimensions: DimensionsSpec;
  material: MaterialSpec;
  printing: PrintingSpec;
  special_requirements?: string;
  technical_status: TechStatus;
}

export interface ArtworkRequirement {
  status: 'existing_approved' | 'existing_modified' | 'new_artwork' | 'reference_only' | 'no_artwork' | 'not_applicable';
  file_url?: string;
  file_name?: string;
  design_brief?: string;
  brand_guidelines_available: boolean;
  mockup_required: boolean;
  notes_for_design?: string;
}

export interface DeliveryRequirement {
  requested_date?: string;
  is_flexible: boolean;
  delivery_location?: string;
  urgency: 'normal' | 'high' | 'urgent';
  internal_notes?: string;
  outstanding_questions?: string[];
}

export interface SalesProjectDraft {
  id: string;
  project_name: string;
  brand: BrandUnit;
  client_id?: string;
  client?: Client;
  is_new_client: boolean;
  request_type: RequestType;
  parent_project_id?: string;
  
  // Specific aspects that changed (for 'modified' request type)
  changes_summary?: {
    artwork: boolean;
    dimensions: boolean;
    material: boolean;
    quantity: boolean;
    delivery: boolean;
  };
  
  // Product item specifications
  items: ProjectItemSpec[];
  
  // Artwork
  artwork: ArtworkRequirement;
  
  // Delivery & Business
  delivery: DeliveryRequirement;
  
  // Metadata & Timestamps
  current_step: number;
  is_submitted: boolean;
  request_status: RequestStatus;
  created_at: string;
  updated_at: string;
}
