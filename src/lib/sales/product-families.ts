import { ProductFamily, BrandUnit, Product } from '@/types/sales';

export interface ProductFamilyConfig {
  id: ProductFamily;
  brand: BrandUnit;
  label: string;
  description: string;
  category: string;
  applicableDimensions: {
    width: boolean;
    length: boolean;
    height: boolean;
    gusset?: boolean;
    capacity?: boolean;
  };
  dimensionUnits: ('mm' | 'cm')[];
  materials: string[];
  constructionStyles: string[];
  closureOrHandles: string[];
  defaultMoq: number;
}

export const PRODUCT_FAMILIES: Record<ProductFamily, ProductFamilyConfig> = {
  paper_bag: {
    id: 'paper_bag',
    brand: 'PrintBox',
    label: 'Paper Bag',
    description: 'Custom retail, grocery, and boutique takeaway paper bags.',
    category: 'Paper Bag',
    applicableDimensions: {
      width: true,
      length: true,
      height: true,
      gusset: true,
    },
    dimensionUnits: ['mm', 'cm'],
    materials: [
      'Brown Kraft (100-140 GSM)',
      'White Bleached Kraft (100-130 GSM)',
      'Recycled Kraft Paper (110 GSM)',
      'Coated Art Paper (150-170 GSM)',
    ],
    constructionStyles: ['SOS Block Bottom', 'Pinch Bottom', 'Flat Bag'],
    closureOrHandles: ['Twisted Paper Handle', 'Flat Folded Handle', 'Die-Cut Handle', 'No Handle (Grocery)'],
    defaultMoq: 3000,
  },
  takeaway_box: {
    id: 'takeaway_box',
    brand: 'PrintBox',
    label: 'Takeaway Box / Food Carton',
    description: 'Folded food boxes, burger boxes, meal trays, and bakery cartons.',
    category: 'Takeaway Box',
    applicableDimensions: {
      width: true,
      length: true,
      height: true,
    },
    dimensionUnits: ['mm', 'cm'],
    materials: [
      'Virgin Kraft Board (280-320 GSM)',
      'White Coated Duplex Board (250-350 GSM)',
      'F-Flute Corrugated Board',
      'Greaseproof Barrier Kraft (280 GSM)',
    ],
    constructionStyles: ['Flap & Lock Folded', 'Self-Erecting Auto-Bottom', 'Clamshell One-Piece', 'Two-Piece Tray & Lid'],
    closureOrHandles: ['Tuck-in Top Flap', 'Side Lock Tabs', 'Window Patching (PLA)', 'None'],
    defaultMoq: 5000,
  },
  paper_cup: {
    id: 'paper_cup',
    brand: 'PrintBox',
    label: 'Paper Cup & Bowl',
    description: 'Single and double wall hot drink cups and soup/salad bowls.',
    category: 'Other',
    applicableDimensions: {
      width: true,  // Top diameter
      length: true, // Bottom diameter
      height: true, // Height
      capacity: true,
    },
    dimensionUnits: ['mm', 'cm'],
    materials: [
      'Food Grade Cupstock (280 GSM) + PE Coating',
      'Food Grade Cupstock (280 GSM) + Biodegradable PLA',
      'Double Wall Kraft Barrier',
    ],
    constructionStyles: ['Single Wall', 'Double Wall Insulated', 'Ripple Wall'],
    closureOrHandles: ['Sip Lid Compatible', 'Dome Lid Compatible', 'No Lid Required'],
    defaultMoq: 2500,
  },
  plastic_sack: {
    id: 'plastic_sack',
    brand: 'Explast',
    label: 'Heavy Duty Plastic Sack / Liner',
    description: 'Commercial, industrial, agricultural, and food-grade plastic packaging.',
    category: 'Plastic Sack',
    applicableDimensions: {
      width: true,
      length: true,
      height: false,
      gusset: true,
    },
    dimensionUnits: ['mm', 'cm'],
    materials: [
      'Virgin Low-Density Polyethylene (LDPE)',
      'High-Density Polyethylene (HDPE)',
      'Linear Low-Density Polyethylene (LLDPE)',
      'PCR Recycled Blend (30% Recycled)',
      'Bio-based Compostable Polymer',
    ],
    constructionStyles: ['Bottom Gusset Sack', 'Side Gusset Sack', 'Flat Tubing Bag', 'Continuous Roll Perforated'],
    closureOrHandles: ['Heat Seal Ready', 'Open Top with Tie Wire', 'Punch Hole Handle', 'Drawstring'],
    defaultMoq: 5000,
  },
  custom: {
    id: 'custom',
    brand: 'PrintBox', // Can adapt to Explast or PrintBox
    label: 'Custom Packaging Solution',
    description: 'Tailored or unclassified packaging requirement needing technical design.',
    category: 'Other',
    applicableDimensions: {
      width: true,
      length: true,
      height: true,
    },
    dimensionUnits: ['mm', 'cm'],
    materials: [
      'Custom Paper / Board Requirement',
      'Custom Polymer / Film Formulation',
      'Special Composite / Hybrid Material',
      'To be determined during technical review',
    ],
    constructionStyles: ['Custom Die-Cut Design', 'Special Assembly', 'To Be Designed'],
    closureOrHandles: ['Custom Specification', 'None'],
    defaultMoq: 1000,
  },
};

// Initial verified catalogue products for fallback & initial state
export const DEFAULT_CATALOGUE_PRODUCTS: Product[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    brand_unit: 'PrintBox',
    product_category: 'Paper Bag',
    product_type: 'Standardised',
    product_name: 'Twisted Handle Kraft Bag',
    product_code: 'PB-BAG-01',
    product_family: 'paper_bag',
    material_base: 'Brown Kraft Paper',
    moq: 3000,
    unit: 'units',
    is_active: true,
    standard_variants: [
      { variant_id: 'sm', label: 'Small (220 x 110 x 280 mm)', width: 220, length: 110, height: 280, gsm: 100 },
      { variant_id: 'md', label: 'Medium (260 x 120 x 350 mm)', width: 260, length: 120, height: 350, gsm: 120 },
      { variant_id: 'lg', label: 'Large (320 x 140 x 420 mm)', width: 320, length: 140, height: 420, gsm: 130 },
    ],
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    brand_unit: 'PrintBox',
    product_category: 'Takeaway Box',
    product_type: 'Standardised',
    product_name: 'Flap-Folded Burger Box',
    product_code: 'PB-BOX-01',
    product_family: 'takeaway_box',
    material_base: 'Virgin Kraft Board',
    moq: 5000,
    unit: 'units',
    is_active: true,
    standard_variants: [
      { variant_id: 'std', label: 'Standard Burger (120 x 120 x 90 mm)', width: 120, length: 120, height: 90, gsm: 280 },
      { variant_id: 'xl', label: 'Large Meal Box (180 x 120 x 80 mm)', width: 180, length: 120, height: 80, gsm: 300 },
    ],
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    brand_unit: 'PrintBox',
    product_category: 'Other',
    product_type: 'Standardised',
    product_name: 'Double Wall Insulated Coffee Cup',
    product_code: 'PB-CUP-01',
    product_family: 'paper_cup',
    material_base: 'Food Board + PLA',
    moq: 2500,
    unit: 'units',
    is_active: true,
    standard_variants: [
      { variant_id: '8oz', label: '8 oz / 240 ml', capacity: '8oz', gsm: 280 },
      { variant_id: '12oz', label: '12 oz / 360 ml', capacity: '12oz', gsm: 320 },
    ],
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    brand_unit: 'Explast',
    product_category: 'Plastic Sack',
    product_type: 'Standardised',
    product_name: 'Heavy Duty Industrial Sack',
    product_code: 'EXP-SCK-01',
    product_family: 'plastic_sack',
    material_base: 'LDPE / HDPE Blend',
    moq: 5000,
    unit: 'units',
    is_active: true,
    standard_variants: [
      { variant_id: '25kg', label: '25kg Capacity (450 x 750 mm, 120µm)', width: 450, length: 750, height: 0, micron: 120 },
      { variant_id: '50kg', label: '50kg Capacity (600 x 900 mm, 150µm)', width: 600, length: 900, height: 0, micron: 150 },
    ],
  },
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    brand_unit: 'Explast',
    product_category: 'Plastic Sack',
    product_type: 'Standardised',
    product_name: 'Food-Grade Produce Liner Bag',
    product_code: 'EXP-LNR-01',
    product_family: 'plastic_sack',
    material_base: 'Virgin Food-Grade LDPE',
    moq: 10000,
    unit: 'units',
    is_active: true,
    standard_variants: [
      { variant_id: 'std', label: 'Standard Crate Liner (600 x 400 x 800 mm, 40µm)', width: 600, length: 400, height: 800, micron: 40 },
    ],
  },
];
