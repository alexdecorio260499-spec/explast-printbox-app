-- Migration: 0002_adaptive_sales_workflow.sql
-- Purpose: Schema extensions to support the Adaptive Sales Request Workflow

-- ============================================================================
-- 1. EXTEND PRODUCTS TABLE FOR DYNAMIC CATALOGUE & FAMILY RULES
-- ============================================================================

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS product_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS product_family TEXT,
  ADD COLUMN IF NOT EXISTS moq INTEGER DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'units',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS standard_variants JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS spec_config JSONB DEFAULT '{}'::jsonb;

-- ============================================================================
-- 2. EXTEND PROJECTS TABLE FOR REQUEST TYPES, DRAFTS & DELIVERY
-- ============================================================================

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS request_type TEXT DEFAULT 'new_standard',
  ADD COLUMN IF NOT EXISTS request_status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS parent_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS requested_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
  ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS completeness_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS outstanding_questions JSONB DEFAULT '[]'::jsonb;

-- ============================================================================
-- 3. CREATE PROJECT ITEMS TABLE (MULTI-PRODUCT & CUSTOM ITEM SPECIFICATIONS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.project_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  item_type TEXT NOT NULL DEFAULT 'standard', -- 'standard', 'modified', 'custom', 'concept', 'repeat'
  product_family TEXT NOT NULL,              -- 'paper_bag', 'takeaway_box', 'plastic_sack', 'paper_cup', 'custom'
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  quantity_status TEXT NOT NULL DEFAULT 'estimated', -- 'estimated', 'confirmed'
  dimensions JSONB DEFAULT '{}'::jsonb,      -- { width, length, height, unit, is_confirmed, dimension_type }
  material_specs JSONB DEFAULT '{}'::jsonb,  -- { material_type, gsm, color, food_grade, is_confirmed }
  printing_specs JSONB DEFAULT '{}'::jsonb,  -- { print_type, surfaces, colors, artwork_status, is_confirmed }
  technical_status TEXT DEFAULT 'pending_review', -- 'confirmed', 'approximate', 'pending_review', 'unknown'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for project_items updated_at
DROP TRIGGER IF EXISTS set_project_items_updated_at ON public.project_items;
CREATE TRIGGER set_project_items_updated_at 
  BEFORE UPDATE ON public.project_items 
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) FOR PROJECT ITEMS & DEVELOPMENT DEMO ACCESS
-- ============================================================================

ALTER TABLE public.project_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all project items" 
  ON public.project_items FOR SELECT 
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Authenticated users can insert/update project items" 
  ON public.project_items FOR ALL 
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Also ensure anon access for demo/development if user email is not yet confirmed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Allow dev read on clients'
  ) THEN
    CREATE POLICY "Allow dev read on clients" ON public.clients FOR SELECT USING (true);
    CREATE POLICY "Allow dev write on clients" ON public.clients FOR ALL USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow dev read on products'
  ) THEN
    CREATE POLICY "Allow dev read on products" ON public.products FOR SELECT USING (true);
    CREATE POLICY "Allow dev write on products" ON public.products FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Allow dev read on projects'
  ) THEN
    CREATE POLICY "Allow dev read on projects" ON public.projects FOR SELECT USING (true);
    CREATE POLICY "Allow dev write on projects" ON public.projects FOR ALL USING (true);
  END IF;
END $$;

-- ============================================================================
-- 5. SEED VERIFIED CATALOGUE PRODUCTS & SAMPLE DATA
-- ============================================================================

-- Insert sample verified clients
INSERT INTO public.clients (id, company_name, industry, location_type, contact_name, contact_email, contact_phone, status)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'ABC Restaurant', 'Food Service', 'Local (Mauritius)', 'Jean Michel', 'jm@abcrestaurant.mu', '+230 5123 4567', 'Client'),
  ('a0000000-0000-0000-0000-000000000002', 'Bean Roasters Cafe', 'Food Service', 'Local (Mauritius)', 'Sarah Chen', 'sarah@beanroasters.mu', '+230 5987 6543', 'Client'),
  ('a0000000-0000-0000-0000-000000000003', 'Boutique Paris', 'Retail', 'Local (Mauritius)', 'Marie Dupont', 'marie@boutiqueparis.mu', '+230 5456 7890', 'Client'),
  ('a0000000-0000-0000-0000-000000000004', 'Industrial Plastics Ltd', 'Industrial', 'Local (Mauritius)', 'Kevin Ramgoolam', 'kevin@ipl.mu', '+230 5234 5678', 'Lead')
ON CONFLICT (id) DO UPDATE SET 
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  contact_email = EXCLUDED.contact_email;

-- Insert sample verified catalogue products for PrintBox
INSERT INTO public.products (id, brand_unit, product_category, product_type, product_name, product_code, product_family, material_base, moq, unit, standard_variants)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'PrintBox', 'Paper Bag', 'Standardised', 'Twisted Handle Kraft Bag', 'PB-BAG-01', 'paper_bag', 'Brown Kraft Paper', 3000, 'units', '[
    {"variant_id": "sm", "label": "Small (220 x 110 x 280 mm)", "width": 220, "length": 110, "height": 280, "gsm": 100},
    {"variant_id": "md", "label": "Medium (260 x 120 x 350 mm)", "width": 260, "length": 120, "height": 350, "gsm": 120},
    {"variant_id": "lg", "label": "Large (320 x 140 x 420 mm)", "width": 320, "length": 140, "height": 420, "gsm": 130}
  ]'::jsonb),
  ('b0000000-0000-0000-0000-000000000002', 'PrintBox', 'Takeaway Box', 'Standardised', 'Flap-Folded Burger Box', 'PB-BOX-01', 'takeaway_box', 'Virgin Kraft Board', 5000, 'units', '[
    {"variant_id": "std", "label": "Standard Burger (120 x 120 x 90 mm)", "width": 120, "length": 120, "height": 90, "gsm": 280},
    {"variant_id": "xl", "label": "Large Meal Box (180 x 120 x 80 mm)", "width": 180, "length": 120, "height": 80, "gsm": 300}
  ]'::jsonb),
  ('b0000000-0000-0000-0000-000000000003', 'PrintBox', 'Other', 'Standardised', 'Double Wall Insulated Coffee Cup', 'PB-CUP-01', 'paper_cup', 'Food Board + PLA', 2500, 'units', '[
    {"variant_id": "8oz", "label": "8 oz / 240 ml", "capacity": "8oz", "gsm": 280},
    {"variant_id": "12oz", "label": "12 oz / 360 ml", "capacity": "12oz", "gsm": 320}
  ]'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
  product_name = EXCLUDED.product_name,
  product_code = EXCLUDED.product_code,
  moq = EXCLUDED.moq;

-- Insert sample verified catalogue products for Explast
INSERT INTO public.products (id, brand_unit, product_category, product_type, product_name, product_code, product_family, material_base, moq, unit, standard_variants)
VALUES 
  ('b0000000-0000-0000-0000-000000000004', 'Explast', 'Plastic Sack', 'Standardised', 'Heavy Duty Industrial Sack', 'EXP-SCK-01', 'plastic_sack', 'LDPE / HDPE Blend', 5000, 'units', '[
    {"variant_id": "25kg", "label": "25kg Capacity (450 x 750 mm, 120µm)", "width": 450, "length": 750, "height": 0, "micron": 120},
    {"variant_id": "50kg", "label": "50kg Capacity (600 x 900 mm, 150µm)", "width": 600, "length": 900, "height": 0, "micron": 150}
  ]'::jsonb),
  ('b0000000-0000-0000-0000-000000000005', 'Explast', 'Plastic Sack', 'Standardised', 'Food-Grade Produce Liner Bag', 'EXP-LNR-01', 'plastic_sack', 'Virgin Food-Grade LDPE', 10000, 'units', '[
    {"variant_id": "std", "label": "Standard Crate Liner (600 x 400 x 800 mm, 40µm)", "width": 600, "length": 400, "height": 800, "micron": 40}
  ]'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
  product_name = EXCLUDED.product_name,
  product_code = EXCLUDED.product_code,
  moq = EXCLUDED.moq;

-- Insert a historical project for ABC Restaurant (to test repeat order and changed artwork scenarios)
INSERT INTO public.projects (id, client_id, business_unit, project_name, workflow_path, kanban_stage, request_type, request_status, total_value_mur)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'PrintBox', 'ABC Takeaway Boxes 2025', 'Path A', 'Production Order', 'new_standard', 'submitted', 45000.00)
ON CONFLICT (id) DO UPDATE SET 
  project_name = EXCLUDED.project_name;

INSERT INTO public.project_items (project_id, product_id, item_type, product_family, description, quantity, quantity_status, dimensions, material_specs, printing_specs, technical_status)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'standard',
  'takeaway_box',
  'Flap-Folded Burger Box for ABC Restaurant',
  5000,
  'confirmed',
  '{"width": 120, "length": 120, "height": 90, "unit": "mm", "is_confirmed": true}'::jsonb,
  '{"material_type": "Virgin Kraft Board", "gsm": 280, "food_grade": true, "is_confirmed": true}'::jsonb,
  '{"print_type": "2_colors", "surfaces": 2, "artwork_status": "existing_approved", "is_confirmed": true}'::jsonb,
  'confirmed'
) ON CONFLICT DO NOTHING;

INSERT INTO public.design_assets (project_id, file_url, file_name, asset_type)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'https://vqwvddwdkxnkqgfyiizt.supabase.co/storage/v1/object/public/design-assets/abc-burger-box-v1.pdf',
  'abc-burger-box-v1.pdf',
  'Final Mockup'
) ON CONFLICT DO NOTHING;
