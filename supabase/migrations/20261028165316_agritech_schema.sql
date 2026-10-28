/*
# AgriTech Platform Schema

## Description
Full schema for a smart agricultural management platform supporting farmers and admins.

## New Tables
- `profiles` - User profiles (farmer or admin role, personal info)
- `farms` - Farm details linked to a farmer profile
- `crops` - Crops associated with farms, tracking status and soil data
- `pest_alerts` - Pest and disease alert notifications per farm
- `weather_data` - Weather records and forecasts per farm location
- `resources` - Agricultural resources/products available for purchase
- `orders` - Orders placed by farmers for resources
- `order_items` - Line items within each order
- `experts` - Expert consultant profiles
- `consultations` - Consultation session requests from farmers to experts

## Security
- RLS enabled on all tables
- Authenticated users can manage their own data
- Admins identified by role in profiles table
- anon role can read resources and experts (marketplace)
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
  phone text DEFAULT '',
  location text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- FARMS
CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  size_acres numeric NOT NULL DEFAULT 0,
  location text NOT NULL DEFAULT '',
  soil_type text DEFAULT 'Loamy',
  irrigation_type text DEFAULT 'Drip',
  established_date date,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON farms TO authenticated;

DROP POLICY IF EXISTS "select_own_farms" ON farms;
CREATE POLICY "select_own_farms" ON farms FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_farms" ON farms;
CREATE POLICY "insert_own_farms" ON farms FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_farms" ON farms;
CREATE POLICY "update_own_farms" ON farms FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_farms" ON farms;
CREATE POLICY "delete_own_farms" ON farms FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CROPS
CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  variety text DEFAULT '',
  status text NOT NULL DEFAULT 'growing' CHECK (status IN ('planted', 'growing', 'harvested', 'failed')),
  planted_date date,
  expected_harvest date,
  area_acres numeric DEFAULT 0,
  soil_ph numeric DEFAULT 7.0,
  nitrogen_level numeric DEFAULT 0,
  phosphorus_level numeric DEFAULT 0,
  potassium_level numeric DEFAULT 0,
  moisture_percent numeric DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON crops TO authenticated;

DROP POLICY IF EXISTS "select_own_crops" ON crops;
CREATE POLICY "select_own_crops" ON crops FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_crops" ON crops;
CREATE POLICY "insert_own_crops" ON crops FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_crops" ON crops;
CREATE POLICY "update_own_crops" ON crops FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_crops" ON crops;
CREATE POLICY "delete_own_crops" ON crops FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PEST ALERTS
CREATE TABLE IF NOT EXISTS pest_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  pest_name text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  affected_crop text DEFAULT '',
  description text DEFAULT '',
  recommended_action text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'monitoring')),
  detected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pest_alerts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON pest_alerts TO authenticated;

DROP POLICY IF EXISTS "select_own_pest_alerts" ON pest_alerts;
CREATE POLICY "select_own_pest_alerts" ON pest_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_pest_alerts" ON pest_alerts;
CREATE POLICY "insert_own_pest_alerts" ON pest_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_pest_alerts" ON pest_alerts;
CREATE POLICY "update_own_pest_alerts" ON pest_alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_pest_alerts" ON pest_alerts;
CREATE POLICY "delete_own_pest_alerts" ON pest_alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- WEATHER DATA
CREATE TABLE IF NOT EXISTS weather_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at timestamptz DEFAULT now(),
  temperature_c numeric DEFAULT 0,
  humidity_percent numeric DEFAULT 0,
  rainfall_mm numeric DEFAULT 0,
  wind_speed_kmh numeric DEFAULT 0,
  condition text DEFAULT 'Sunny',
  forecast_days jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON weather_data TO authenticated;

DROP POLICY IF EXISTS "select_own_weather" ON weather_data;
CREATE POLICY "select_own_weather" ON weather_data FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_weather" ON weather_data;
CREATE POLICY "insert_own_weather" ON weather_data FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_weather" ON weather_data;
CREATE POLICY "update_own_weather" ON weather_data FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_weather" ON weather_data;
CREATE POLICY "delete_own_weather" ON weather_data FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RESOURCES (Products/Marketplace)
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Fertilizer' CHECK (category IN ('Fertilizer', 'Pesticide', 'Seeds', 'Equipment', 'Tools', 'Other')),
  description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  unit text DEFAULT 'kg',
  stock_quantity integer DEFAULT 0,
  image_url text DEFAULT '',
  brand text DEFAULT '',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON resources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON resources TO authenticated;

DROP POLICY IF EXISTS "public_select_resources" ON resources;
CREATE POLICY "public_select_resources" ON resources FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_resources" ON resources;
CREATE POLICY "auth_insert_resources" ON resources FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_resources" ON resources;
CREATE POLICY "auth_update_resources" ON resources FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_resources" ON resources;
CREATE POLICY "auth_delete_resources" ON resources FOR DELETE TO authenticated USING (true);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric NOT NULL DEFAULT 0,
  shipping_address text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;

DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_orders" ON orders;
CREATE POLICY "delete_own_orders" ON orders FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON order_items TO authenticated;

DROP POLICY IF EXISTS "select_own_order_items" ON order_items;
CREATE POLICY "select_own_order_items" ON order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items" ON order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_order_items" ON order_items;
CREATE POLICY "delete_own_order_items" ON order_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- EXPERTS
CREATE TABLE IF NOT EXISTS experts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialization text NOT NULL,
  bio text DEFAULT '',
  years_experience integer DEFAULT 0,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  availability text DEFAULT 'Available',
  hourly_rate numeric DEFAULT 0,
  image_url text DEFAULT '',
  languages text[] DEFAULT ARRAY['English'],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON experts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON experts TO authenticated;

DROP POLICY IF EXISTS "public_select_experts" ON experts;
CREATE POLICY "public_select_experts" ON experts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_manage_experts" ON experts;
CREATE POLICY "auth_manage_experts" ON experts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_experts" ON experts;
CREATE POLICY "auth_update_experts" ON experts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_experts" ON experts;
CREATE POLICY "auth_delete_experts" ON experts FOR DELETE TO authenticated USING (true);

-- CONSULTATIONS
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id uuid NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  topic text NOT NULL,
  description text DEFAULT '',
  preferred_date date,
  preferred_time text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  meeting_link text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON consultations TO authenticated;

DROP POLICY IF EXISTS "select_own_consultations" ON consultations;
CREATE POLICY "select_own_consultations" ON consultations FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_consultations" ON consultations;
CREATE POLICY "insert_own_consultations" ON consultations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_consultations" ON consultations;
CREATE POLICY "update_own_consultations" ON consultations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_consultations" ON consultations;
CREATE POLICY "delete_own_consultations" ON consultations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Seed some resources
INSERT INTO resources (name, category, description, price, unit, stock_quantity, brand, image_url) VALUES
('NPK Fertilizer 20-20-20', 'Fertilizer', 'Balanced fertilizer for all crops. Promotes healthy growth and yield.', 850, 'kg', 500, 'GreenGrow', ''),
('Urea 46% Nitrogen', 'Fertilizer', 'High nitrogen fertilizer ideal for leafy crops and cereals.', 650, 'kg', 800, 'AgriChem', ''),
('Neem-based Pesticide', 'Pesticide', 'Organic pesticide effective against aphids, whiteflies, and caterpillars.', 450, 'L', 300, 'BioShield', ''),
('Chlorpyrifos 50% EC', 'Pesticide', 'Broad-spectrum insecticide for soil and foliar pests.', 780, 'L', 200, 'AgriGuard', ''),
('Hybrid Wheat Seeds', 'Seeds', 'High-yield drought-resistant wheat variety. Suitable for various soil types.', 1200, 'kg', 150, 'SeedTech', ''),
('Hybrid Tomato Seeds', 'Seeds', 'Disease-resistant tomato with 60-day maturity. High market value.', 950, 'packet', 400, 'VegGrow', ''),
('Drip Irrigation Kit', 'Equipment', 'Complete drip irrigation setup for 1 acre. Includes pipes, emitters, and timer.', 8500, 'set', 50, 'IrriPro', ''),
('Soil pH Meter', 'Tools', 'Digital meter for accurate soil pH and moisture reading.', 2200, 'piece', 100, 'AgriTool', '')
ON CONFLICT DO NOTHING;

-- Seed some experts
INSERT INTO experts (name, specialization, bio, years_experience, rating, review_count, availability, hourly_rate, languages) VALUES
('Dr. Priya Sharma', 'Soil Science & Crop Nutrition', 'Expert in soil health analysis, fertilizer recommendations, and sustainable farming practices with 15 years of field experience.', 15, 4.9, 127, 'Available', 500, ARRAY['English', 'Hindi']),
('Prof. Rajan Kumar', 'Pest & Disease Management', 'Specializes in integrated pest management (IPM) for a wide range of crops including vegetables, cereals, and fruits.', 20, 4.8, 203, 'Available', 600, ARRAY['English', 'Hindi', 'Tamil']),
('Dr. Anita Desai', 'Agricultural Economics', 'Helps farmers with market analysis, crop planning for profit maximization, and government scheme advisories.', 12, 4.7, 89, 'Busy', 450, ARRAY['English', 'Gujarati', 'Hindi']),
('Mr. Suresh Nair', 'Irrigation & Water Management', 'Expert in water-saving irrigation techniques, drip and sprinkler systems, and rainwater harvesting for farms.', 18, 4.9, 164, 'Available', 550, ARRAY['English', 'Malayalam', 'Tamil'])
ON CONFLICT DO NOTHING;
