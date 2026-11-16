-- Migration: 0003_explast_manufacturing_workflow.sql
-- Purpose: Independent Explast plastic film & packaging manufacturing schema and seed records

-- ============================================================================
-- 1. CREATE EXPLAST SPECIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.explast_specifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  material_family TEXT NOT NULL,         -- 'LDPE', 'MDPE', 'PP'
  material_grade TEXT,                   -- 'Grade 2', 'Grade 4', 'Elpro', 'Polimaxx'
  formulation TEXT NOT NULL,             -- Specific formulation from official hierarchy
  print_type TEXT NOT NULL DEFAULT 'plain', -- 'plain', 'printed'
  final_product_type TEXT NOT NULL,      -- 'Side Sealing Bag', 'Bottom Sealing Bag', 'Bag with Sealing Tape', 'Roll'
  extrusion_spec JSONB DEFAULT '{}'::jsonb,
  printing_spec JSONB DEFAULT '{}'::jsonb,
  product_spec JSONB DEFAULT '{}'::jsonb,
  quantity INTEGER NOT NULL DEFAULT 0,
  quantity_unit TEXT DEFAULT 'units',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for explast_specifications updated_at
DROP TRIGGER IF EXISTS set_explast_specifications_updated_at ON public.explast_specifications;
CREATE TRIGGER set_explast_specifications_updated_at 
  BEFORE UPDATE ON public.explast_specifications 
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 2. CREATE EXPLAST TECHNICAL ASSESSMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.explast_technical_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  specification_id UUID REFERENCES public.explast_specifications(id) ON DELETE SET NULL,
  assessment_status TEXT NOT NULL DEFAULT 'not_required',
  responsible_person TEXT,
  assessment_date TIMESTAMPTZ,
  extrusion_feasibility TEXT DEFAULT 'feasible',
  printing_feasibility TEXT DEFAULT 'feasible',
  conversion_feasibility TEXT DEFAULT 'feasible',
  observations TEXT,
  calculations JSONB DEFAULT '{}'::jsonb,
  approval_status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for explast_technical_assessments updated_at
DROP TRIGGER IF EXISTS set_explast_technical_assessments_updated_at ON public.explast_technical_assessments;
CREATE TRIGGER set_explast_technical_assessments_updated_at 
  BEFORE UPDATE ON public.explast_technical_assessments 
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) FOR EXPLAST WORKFLOW
-- ============================================================================

ALTER TABLE public.explast_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explast_technical_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated and anon users can view explast specs" 
  ON public.explast_specifications FOR SELECT 
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Authenticated and anon users can insert/update explast specs" 
  ON public.explast_specifications FOR ALL 
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Authenticated and anon users can view explast assessments" 
  ON public.explast_technical_assessments FOR SELECT 
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Authenticated and anon users can insert/update explast assessments" 
  ON public.explast_technical_assessments FOR ALL 
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- ============================================================================
-- 4. SEED HISTORICAL APPROVED EXPLAST PROJECTS FOR REPEAT & MODIFIED TESTING
-- ============================================================================

-- Project 1: Industrial Plastics Ltd - Historical Plain LDPE Grade 2 Side Sealing Bag (Approved)
INSERT INTO public.projects (
  id, 
  client_id, 
  business_unit, 
  project_name, 
  workflow_path, 
  kanban_stage, 
  request_type, 
  request_status, 
  total_value_mur
)
VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000004',
  'Explast',
  'IPL - LDPE Grade 2 Side Sealing Bags 2025',
  'Path B',
  'Production Order',
  'new_standard',
  'submitted',
  85000.00
) ON CONFLICT (id) DO UPDATE SET 
  project_name = EXCLUDED.project_name;

INSERT INTO public.explast_specifications (
  id,
  project_id,
  material_family,
  material_grade,
  formulation,
  print_type,
  final_product_type,
  extrusion_spec,
  printing_spec,
  product_spec,
  quantity,
  quantity_unit
)
VALUES (
  'f0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  'LDPE',
  'Grade 2',
  'Grade 2 + Linear',
  'plain',
  'Side Sealing Bag',
  '{"roll_width_mm": 350, "thickness_micron": 50, "material_color": "Natural Clear"}'::jsonb,
  '{"is_printed": false, "num_colors": 0, "artwork_status": "none"}'::jsonb,
  '{"width_mm": 300, "length_mm": 450, "thickness_micron": 50, "material_color": "Natural Clear", "product_type": "Side Sealing Bag"}'::jsonb,
  50000,
  'units'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.explast_technical_assessments (
  id,
  project_id,
  specification_id,
  assessment_status,
  responsible_person,
  extrusion_feasibility,
  printing_feasibility,
  conversion_feasibility,
  observations,
  approval_status
)
VALUES (
  'g0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  'f0000000-0000-0000-0000-000000000001',
  'approved',
  'Sunil (Head of Extrusion)',
  'feasible',
  'feasible',
  'feasible',
  'Extrusion run validated on Line 2 with Grade 2 + Linear blend at 50µm.',
  'Approved'
) ON CONFLICT (id) DO NOTHING;

-- Project 2: ABC Restaurant - Historical Printed Bag with Sealing Tape (Approved)
INSERT INTO public.projects (
  id, 
  client_id, 
  business_unit, 
  project_name, 
  workflow_path, 
  kanban_stage, 
  request_type, 
  request_status, 
  total_value_mur
)
VALUES (
  'e0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'Explast',
  'ABC Restaurant - Printed Sealing Tape Bags',
  'Path B',
  'Production Order',
  'new_standard',
  'submitted',
  62000.00
) ON CONFLICT (id) DO UPDATE SET 
  project_name = EXCLUDED.project_name;

INSERT INTO public.explast_specifications (
  id,
  project_id,
  material_family,
  material_grade,
  formulation,
  print_type,
  final_product_type,
  extrusion_spec,
  printing_spec,
  product_spec,
  quantity,
  quantity_unit
)
VALUES (
  'f0000000-0000-0000-0000-000000000002',
  'e0000000-0000-0000-0000-000000000002',
  'PP',
  'Elpro',
  'PP - Elpro',
  'printed',
  'Bag with Sealing Tape',
  '{"roll_width_mm": 280, "thickness_micron": 40, "material_color": "High Gloss Clear"}'::jsonb,
  '{"is_printed": true, "num_colors": 2, "artwork_status": "approved_existing", "artwork_file_name": "abc-poly-bag-v1.ai"}'::jsonb,
  '{"width_mm": 250, "length_mm": 350, "lip_size_mm": 40, "tape_type": "resealable", "thickness_micron": 40, "material_color": "High Gloss Clear", "product_type": "Bag with Sealing Tape"}'::jsonb,
  25000,
  'units'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.explast_technical_assessments (
  id,
  project_id,
  specification_id,
  assessment_status,
  responsible_person,
  extrusion_feasibility,
  printing_feasibility,
  conversion_feasibility,
  observations,
  approval_status
)
VALUES (
  'g0000000-0000-0000-0000-000000000002',
  'e0000000-0000-0000-0000-000000000002',
  'f0000000-0000-0000-0000-000000000002',
  'approved',
  'Sunil (Head of Extrusion)',
  'feasible',
  'feasible',
  'feasible',
  'PP Elpro clarity confirmed. 2-color flexographic printing cylinder prepared.',
  'Approved'
) ON CONFLICT (id) DO NOTHING;
