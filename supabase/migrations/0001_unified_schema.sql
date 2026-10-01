-- Migration: 0001_unified_schema.sql

-- ==========================================
-- 1. ENUMS & TYPES
-- ==========================================

CREATE TYPE public.app_role AS ENUM ('Sales', 'Design', 'Management', 'Production');
CREATE TYPE public.brand_unit AS ENUM ('Explast', 'PrintBox');
CREATE TYPE public.industry_type AS ENUM ('Food Service', 'Retail', 'Industrial', 'Agriculture', 'Textile', 'Pharma');
CREATE TYPE public.location_type AS ENUM ('Local (Mauritius)', 'Export (International)');
CREATE TYPE public.client_status AS ENUM ('Lead', 'Client', 'Cold');
CREATE TYPE public.product_category AS ENUM ('Paper Bag', 'Takeaway Box', 'Plastic Sack', 'Textile Wrap', 'Other');
CREATE TYPE public.product_type AS ENUM ('Standardised', 'Customised');
CREATE TYPE public.workflow_path AS ENUM ('Path A', 'Path B', 'Path C');
CREATE TYPE public.kanban_stage AS ENUM ('Discovery', 'Design/Mockup', 'Quoting', 'Pending Approval', 'Production Order');
CREATE TYPE public.approval_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE public.asset_type AS ENUM ('Client Logo', 'Working File (Adobe)', 'Final Mockup', '3D Preview Link');

-- ==========================================
-- 2. TABLES
-- ==========================================

-- 2.1 Users (Profiles)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role public.app_role DEFAULT 'Sales'::public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2.2 Clients
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  industry public.industry_type,
  location_type public.location_type,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  sales_rep_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status public.client_status DEFAULT 'Lead'::public.client_status NOT NULL,
  last_contact_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2.3 Products
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_unit public.brand_unit NOT NULL,
  product_category public.product_category NOT NULL,
  product_type public.product_type NOT NULL,
  material_base TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2.4 Projects
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  business_unit public.brand_unit NOT NULL,
  project_name TEXT NOT NULL,
  workflow_path public.workflow_path NOT NULL,
  kanban_stage public.kanban_stage DEFAULT 'Discovery'::public.kanban_stage NOT NULL,
  
  -- Discovery Section (Auto-Deprecates)
  form_data_temp JSONB,
  
  -- Metadata Section (Persists)
  metadata_resume TEXT,
  
  -- Quotation Section
  total_value_mur DECIMAL(12,2) DEFAULT 0.00,
  free_delivery BOOLEAN DEFAULT FALSE,
  michel_approval public.approval_status DEFAULT 'Pending'::public.approval_status NOT NULL,
  client_approval BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2.5 Design Assets
CREATE TABLE public.design_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  extracted_date TIMESTAMPTZ,
  extracted_company TEXT,
  asset_type public.asset_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2.6 Production Orders
CREATE TABLE public.production_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL, -- e.g. PO-1045
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
  generated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  generated_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  pdf_document TEXT, -- URL to the file
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 3. TRIGGERS & AUTOMATION
-- ==========================================

-- Function to handle auto-updating `updated_at` on tables
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger for Auto-Deprecating Discovery Data when order is validated
-- The rule says: "cleared when order is validated to save space"
CREATE OR REPLACE FUNCTION public.auto_deprecate_discovery_data()
RETURNS TRIGGER AS $$
BEGIN
  -- If workflow enters Production Order, clear the temp discovery data
  IF NEW.kanban_stage = 'Production Order' AND OLD.kanban_stage IS DISTINCT FROM 'Production Order' THEN
    NEW.form_data_temp = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deprecate_discovery
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_deprecate_discovery_data();

-- Dynamic Delivery Logic Trigger (Free delivery if local and > 3000 MUR)
CREATE OR REPLACE FUNCTION public.evaluate_free_delivery()
RETURNS TRIGGER AS $$
DECLARE
  v_loc public.location_type;
BEGIN
  -- get the location type of the client
  SELECT location_type INTO v_loc FROM public.clients WHERE id = NEW.client_id;
  
  IF NEW.total_value_mur > 3000 AND v_loc = 'Local (Mauritius)' THEN
    NEW.free_delivery = TRUE;
  ELSE
    NEW.free_delivery = FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_free_delivery
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.evaluate_free_delivery();

-- Create new user profile on Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown User'),
    'Sales' 
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;

-- Transparent Access: Everyone authenticated can SELECT
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view all clients" ON public.clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view all products" ON public.products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view all projects" ON public.projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view all assets" ON public.design_assets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view all orders" ON public.production_orders FOR SELECT USING (auth.role() = 'authenticated');

-- Basic Write Access (All authenticated users can Insert/Update for now, relying on Dashboard UI constraints)
CREATE POLICY "Authenticated users can insert/update clients" ON public.clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert/update projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert/update assets" ON public.design_assets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert/update orders" ON public.production_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

