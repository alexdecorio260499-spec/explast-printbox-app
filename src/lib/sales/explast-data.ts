import {
  ExplastMaterialFamily,
  ExplastMaterialGrade,
  ExplastFormulation,
  ExplastFinalProductType,
  ExplastSalesDraft,
  ExplastQuotationReadiness,
} from '@/types/explast';

export interface ExplastFormulationMeta {
  formulation: ExplastFormulation;
  family: ExplastMaterialFamily;
  grade?: ExplastMaterialGrade;
  hasLinear: boolean;
  hasRecycled: boolean;
  hasMasterbatch: boolean;
  hasOXO: boolean;
  hasUV: boolean;
  description: string;
}

export const EXPLAST_HIERARCHY = {
  LDPE: {
    label: 'LDPE (Low-Density Polyethylene)',
    description: 'High clarity, flexible, strong tear resistance. Suitable for light-to-medium packaging, agricultural films, and commercial liners.',
    grades: [
      {
        grade: 'Grade 2' as const,
        label: 'Grade 2 (General Purpose & Medium Duty)',
        description: 'Standard clarity and melt index, versatile extrusion formulation.',
        formulations: [
          'Grade 2 + Linear',
          'Grade 2 + Linear + Recycled Material',
          'Grade 2 + Linear + Coloured Rec. Material + Coloured Masterbatch',
          'Grade 2 + Linear + Coloured Masterbatch',
          'Grade 2 + Linear + OXO',
          'Grade 2 + Linear + OXO + UV',
        ] as const,
      },
      {
        grade: 'Grade 4' as const,
        label: 'Grade 4 (Heavy Duty & High Strength)',
        description: 'Higher tensile strength and puncture resistance for heavy-duty sacks and industrial wraps.',
        formulations: [
          'Grade 4 + Linear',
          'Grade 4 + Linear + Recycled Material',
          'Grade 4 + Linear + Recycled Material + Coloured Masterbatch',
          'Grade 4 + Linear + Coloured Masterbatch',
          'Grade 4 + Linear + OXO',
        ] as const,
      },
    ],
  },
  MDPE: {
    label: 'MDPE (Medium-Density Polyethylene)',
    description: 'Balanced rigidity, impact resistance, and barrier properties. Often used for specialized industrial film packaging.',
    grades: [],
    formulations: [
      'MDPE',
      'MDPE + Coloured Masterbatch',
      'MDPE + OXO',
      'MDPE + UV',
    ] as const,
  },
  PP: {
    label: 'PP (Polypropylene)',
    description: 'High stiffness, excellent optical clarity, high temperature resistance. Ideal for display packaging and crystal-clear presentation bags.',
    subfamilies: [
      {
        subfamily: 'Elpro' as const,
        label: 'PP - Elpro',
        description: 'High gloss, premium clarity polypropylene formulation.',
        formulations: [
          'PP - Elpro',
          'PP - Elpro + Coloured Masterbatch',
          'PP - Elpro + OXO',
        ] as const,
      },
      {
        subfamily: 'Polimaxx' as const,
        label: 'PP - Polimaxx',
        description: 'Engineered resin with high tensile properties and stiffness.',
        formulations: [
          'PP - Polimaxx',
          'PP - Polimaxx + OXO',
        ] as const,
      },
    ],
  },
};

export const EXPLAST_FINAL_PRODUCT_TYPES: {
  type: ExplastFinalProductType;
  label: string;
  description: string;
  category: 'bag' | 'roll';
}[] = [
  {
    type: 'Side Sealing Bag',
    label: 'Side Sealing Bag',
    description: 'Heat sealed on left and right edges. Commonly used for boutique packaging, retail displays, and stationery.',
    category: 'bag',
  },
  {
    type: 'Bottom Sealing Bag',
    label: 'Bottom Sealing Bag',
    description: 'Heavy duty heat seal along the bottom. Offers maximum load-bearing strength for industrial, grocery, and bin liners.',
    category: 'bag',
  },
  {
    type: 'Bag with Sealing Tape',
    label: 'Bag with Sealing Tape',
    description: 'Features an extended lip with integrated permanent or resealable adhesive tape. Popular for ecommerce and apparel.',
    category: 'bag',
  },
  {
    type: 'Roll',
    label: 'Roll (Continuous Film / Sheeting)',
    description: 'Supplied directly as continuous tubing, centerfold film, or perforated roll according to required roll length or weight.',
    category: 'roll',
  },
];

export function getFormulationsForFamilyAndGrade(
  family: ExplastMaterialFamily,
  grade?: ExplastMaterialGrade
): readonly string[] {
  if (family === 'LDPE') {
    const matchedGrade = EXPLAST_HIERARCHY.LDPE.grades.find(g => g.grade === grade);
    return matchedGrade ? matchedGrade.formulations : EXPLAST_HIERARCHY.LDPE.grades[0].formulations;
  }
  if (family === 'MDPE') {
    return EXPLAST_HIERARCHY.MDPE.formulations;
  }
  if (family === 'PP') {
    const matchedSub = EXPLAST_HIERARCHY.PP.subfamilies.find(s => s.subfamily === grade);
    return matchedSub ? matchedSub.formulations : EXPLAST_HIERARCHY.PP.subfamilies[0].formulations;
  }
  return [];
}

export function evaluateExplastQuotationReadiness(draft: ExplastSalesDraft): ExplastQuotationReadiness {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Customer Check
  if (!draft.client_id) {
    missing.push('Customer is not identified or registered.');
  }

  // Material & Formulation Check
  if (!draft.material_family || !draft.formulation) {
    missing.push('Material family and specific formulation must be selected.');
  }

  // Final Product Type
  if (!draft.final_product_type) {
    missing.push('Final product type (Side Seal, Bottom Seal, Tape Bag, or Roll) is required.');
  }

  // Quantity Check
  if (!draft.quantity || draft.quantity <= 0) {
    missing.push('Valid production quantity is required.');
  }

  // Dimension & Thickness Check
  const ps = draft.product_spec;
  if (!ps.thickness_micron || ps.thickness_micron <= 0) {
    missing.push('Film thickness (micron / µm) must be specified.');
  }

  if (draft.final_product_type === 'Roll') {
    if (!ps.roll_width_mm || ps.roll_width_mm <= 0) {
      missing.push('Roll width (mm) is required.');
    }
    if ((!ps.roll_length_meters || ps.roll_length_meters <= 0) && (!ps.roll_weight_kg || ps.roll_weight_kg <= 0)) {
      missing.push('Either roll length (meters) or roll weight (kg) must be provided.');
    }
  } else {
    // Bag product types
    if (!ps.width_mm || ps.width_mm <= 0) {
      missing.push('Bag width (mm) is required.');
    }
    if (!ps.length_mm || ps.length_mm <= 0) {
      missing.push('Bag length / height (mm) is required.');
    }
    if (draft.final_product_type === 'Bag with Sealing Tape') {
      if (!ps.tape_type) {
        warnings.push('Sealing tape type (permanent vs resealable) not confirmed.');
      }
    }
  }

  // Printing & Technical Assessment Check
  let approvalRequired = false;

  if (draft.print_type === 'printed') {
    if (!draft.printing_spec.num_colors || draft.printing_spec.num_colors < 1 || draft.printing_spec.num_colors > 8) {
      missing.push('Number of print colours must be between 1 and 8.');
    }
    
    // Printing feasibility: up to 8 colors depends on cylinder size / machine width
    if (draft.printing_spec.num_colors > 4) {
      warnings.push(`High colour print (${draft.printing_spec.num_colors} colours) requires cylinder & dimension feasibility review.`);
      approvalRequired = true;
    }

    if (draft.printing_spec.artwork_status === 'none' || draft.printing_spec.artwork_status === 'in_development') {
      warnings.push('Artwork is still pending or in development.');
    }
  }

  // Technical Assessment Status
  const taStatus = draft.technical_assessment?.status;
  if (taStatus === 'awaiting_assessment' || taStatus === 'in_progress' || taStatus === 'pending_info') {
    warnings.push(`Technical manufacturing assessment is currently: ${taStatus.replace('_', ' ')}.`);
    approvalRequired = true;
  } else if (taStatus === 'rejected') {
    missing.push('Technical assessment was rejected or requires design modification.');
  }

  const isReady = missing.length === 0 && (!approvalRequired || taStatus === 'approved');

  return {
    is_ready: isReady,
    missing_requirements: missing,
    warnings,
    approval_required: approvalRequired,
  };
}

export function createInitialExplastDraft(): ExplastSalesDraft {
  const defaultFamily: ExplastMaterialFamily = 'LDPE';
  const defaultGrade: ExplastMaterialGrade = 'Grade 2';
  const defaultFormulation: ExplastFormulation = 'Grade 2 + Linear';
  const defaultProductType: ExplastFinalProductType = 'Side Sealing Bag';

  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    project_name: 'New Explast Packaging Request',
    brand: 'Explast',
    is_new_client: false,
    is_repeat: false,
    repeat_type: 'new_config',
    material_family: defaultFamily,
    material_grade: defaultGrade,
    formulation: defaultFormulation,
    print_type: 'plain',
    extrusion_spec: {
      thickness_micron: 40,
      material_color: 'Natural / Transparent',
      roll_width_mm: 300,
    },
    printing_spec: {
      is_printed: false,
      num_colors: 1,
      artwork_status: 'none',
      feasibility_review_required: false,
    },
    final_product_type: defaultProductType,
    product_spec: {
      product_type: defaultProductType,
      width_mm: 250,
      length_mm: 350,
      thickness_micron: 40,
      material_color: 'Natural / Transparent',
    },
    quantity: 10000,
    quantity_unit: 'units',
    urgency: 'normal',
    technical_assessment: {
      status: 'not_required',
      extrusion_feasibility: 'feasible',
      conversion_feasibility: 'feasible',
    },
    quotation_readiness: {
      is_ready: false,
      missing_requirements: ['Customer is not identified or registered.'],
      warnings: [],
      approval_required: false,
    },
    current_step: 0,
    is_submitted: false,
    status: 'draft',
    created_at: now,
    updated_at: now,
  };
}
