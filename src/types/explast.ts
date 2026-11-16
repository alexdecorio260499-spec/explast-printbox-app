import { Client } from './sales';

export type ExplastMaterialFamily = 'LDPE' | 'MDPE' | 'PP';

export type ExplastLDPEGrade = 'Grade 2' | 'Grade 4';
export type ExplastPPGrade = 'Elpro' | 'Polimaxx';
export type ExplastMaterialGrade = ExplastLDPEGrade | ExplastPPGrade | 'Standard';

// LDPE Formulations
export type ExplastLDPEGrade2Formulation =
  | 'Grade 2 + Linear'
  | 'Grade 2 + Linear + Recycled Material'
  | 'Grade 2 + Linear + Coloured Rec. Material + Coloured Masterbatch'
  | 'Grade 2 + Linear + Coloured Masterbatch'
  | 'Grade 2 + Linear + OXO'
  | 'Grade 2 + Linear + OXO + UV';

export type ExplastLDPEGrade4Formulation =
  | 'Grade 4 + Linear'
  | 'Grade 4 + Linear + Recycled Material'
  | 'Grade 4 + Linear + Recycled Material + Coloured Masterbatch'
  | 'Grade 4 + Linear + Coloured Masterbatch'
  | 'Grade 4 + Linear + OXO';

// MDPE Formulations
export type ExplastMDPEFormulation =
  | 'MDPE'
  | 'MDPE + Coloured Masterbatch'
  | 'MDPE + OXO'
  | 'MDPE + UV';

// PP Formulations
export type ExplastPPElproFormulation =
  | 'PP - Elpro'
  | 'PP - Elpro + Coloured Masterbatch'
  | 'PP - Elpro + OXO';

export type ExplastPPPolimaxxFormulation =
  | 'PP - Polimaxx'
  | 'PP - Polimaxx + OXO';

export type ExplastFormulation =
  | ExplastLDPEGrade2Formulation
  | ExplastLDPEGrade4Formulation
  | ExplastMDPEFormulation
  | ExplastPPElproFormulation
  | ExplastPPPolimaxxFormulation;

export type ExplastPrintType = 'plain' | 'printed';

export type ExplastFinalProductType =
  | 'Side Sealing Bag'
  | 'Bottom Sealing Bag'
  | 'Bag with Sealing Tape'
  | 'Roll';

export type ExplastSealingTapeType = 'permanent' | 'resealable' | 'anti_static';

export type ExplastArtworkStatus =
  | 'final'
  | 'in_development'
  | 'approved_existing'
  | 'new_design'
  | 'none';

export interface ExplastExtrusionSpec {
  roll_width_mm?: number;
  thickness_micron: number;
  material_color: string;
  linear_addition_percentage?: number;
  special_additives?: string;
}

export interface ExplastPrintingSpec {
  is_printed: boolean;
  num_colors: number; // 1 to 8
  artwork_status: ExplastArtworkStatus;
  artwork_file_url?: string;
  artwork_file_name?: string;
  print_requirements_notes?: string;
  feasibility_review_required: boolean;
  feasibility_notes?: string;
}

export interface ExplastProductSpecificSpec {
  product_type: ExplastFinalProductType;
  // Bag dimensions
  width_mm?: number;
  length_mm?: number;
  thickness_micron: number;
  material_color: string;
  // Sealing tape bag specifics
  tape_type?: ExplastSealingTapeType;
  lip_size_mm?: number;
  tape_requirements?: string;
  // Roll specifics
  roll_width_mm?: number;
  roll_length_meters?: number;
  roll_weight_kg?: number;
  core_diameter_mm?: number;
  winding_direction?: string;
  perforation_interval_mm?: number;
  // Common notes
  additional_requirements?: string;
}

export type ExplastTechAssessmentStatus =
  | 'not_required'
  | 'pending_info'
  | 'awaiting_assessment'
  | 'in_progress'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected';

export interface ExplastTechnicalAssessment {
  status: ExplastTechAssessmentStatus;
  responsible_person?: string;
  assessment_date?: string;
  extrusion_feasibility?: 'feasible' | 'requires_modification' | 'unfeasible' | 'pending';
  printing_feasibility?: 'feasible' | 'requires_modification' | 'unfeasible' | 'pending';
  conversion_feasibility?: 'feasible' | 'requires_modification' | 'unfeasible' | 'pending';
  observations?: string;
  calculations?: {
    estimated_film_weight_kg?: number;
    extrusion_output_rate?: string;
    scrap_allowance_percent?: number;
    notes?: string;
  };
  attachments?: string[];
}

export interface ExplastQuotationReadiness {
  is_ready: boolean;
  missing_requirements: string[];
  warnings: string[];
  approval_required: boolean;
}

export interface ExplastSpecificationSnapshot {
  id: string;
  version: number;
  material_family: ExplastMaterialFamily;
  material_grade?: ExplastMaterialGrade;
  formulation: ExplastFormulation;
  print_type: ExplastPrintType;
  final_product_type: ExplastFinalProductType;
  extrusion_spec: ExplastExtrusionSpec;
  printing_spec: ExplastPrintingSpec;
  product_spec: ExplastProductSpecificSpec;
  quantity: number;
  quantity_unit: 'units' | 'kg' | 'rolls';
  technical_assessment: ExplastTechnicalAssessment;
  created_at: string;
}

export interface ExplastSalesDraft {
  id: string;
  project_name: string;
  brand: 'Explast';
  client_id?: string;
  client?: Client;
  is_new_client: boolean;
  
  // Historical / Repeat linkage
  is_repeat: boolean;
  parent_project_id?: string;
  repeat_type: 'exact_repeat' | 'modified' | 'new_config';
  changed_aspects?: {
    material: boolean;
    product_type: boolean;
    dimensions: boolean;
    thickness: boolean;
    printing: boolean;
    artwork: boolean;
  };
  
  // Material Selection
  material_family: ExplastMaterialFamily;
  material_grade?: ExplastMaterialGrade;
  formulation: ExplastFormulation;
  
  // Extrusion & Print
  print_type: ExplastPrintType;
  extrusion_spec: ExplastExtrusionSpec;
  printing_spec: ExplastPrintingSpec;
  
  // Final Product & Conversion
  final_product_type: ExplastFinalProductType;
  product_spec: ExplastProductSpecificSpec;
  
  // Commercial / Delivery
  quantity: number;
  quantity_unit: 'units' | 'kg' | 'rolls';
  requested_delivery_date?: string;
  delivery_location?: string;
  urgency: 'normal' | 'high' | 'urgent';
  internal_notes?: string;
  
  // Technical Assessment & Readiness
  technical_assessment: ExplastTechnicalAssessment;
  quotation_readiness: ExplastQuotationReadiness;
  
  // Form State
  current_step: number;
  is_submitted: boolean;
  status: 'draft' | 'submitted' | 'technical_review' | 'ready_for_quotation';
  created_at: string;
  updated_at: string;
}
