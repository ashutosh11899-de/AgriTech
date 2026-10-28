import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  role: 'farmer' | 'admin';
  phone: string;
  location: string;
  avatar_url: string;
  created_at: string;
};

export type Farm = {
  id: string;
  user_id: string;
  name: string;
  size_acres: number;
  location: string;
  soil_type: string;
  irrigation_type: string;
  established_date: string | null;
  description: string;
  created_at: string;
};

export type Crop = {
  id: string;
  farm_id: string;
  user_id: string;
  name: string;
  variety: string;
  status: 'planted' | 'growing' | 'harvested' | 'failed';
  planted_date: string | null;
  expected_harvest: string | null;
  area_acres: number;
  soil_ph: number;
  nitrogen_level: number;
  phosphorus_level: number;
  potassium_level: number;
  moisture_percent: number;
  notes: string;
  created_at: string;
};

export type PestAlert = {
  id: string;
  farm_id: string;
  user_id: string;
  pest_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_crop: string;
  description: string;
  recommended_action: string;
  status: 'active' | 'resolved' | 'monitoring';
  detected_at: string;
  created_at: string;
};

export type WeatherData = {
  id: string;
  farm_id: string;
  user_id: string;
  recorded_at: string;
  temperature_c: number;
  humidity_percent: number;
  rainfall_mm: number;
  wind_speed_kmh: number;
  condition: string;
  forecast_days: ForecastDay[];
  created_at: string;
};

export type ForecastDay = {
  day: string;
  high: number;
  low: number;
  condition: string;
  rain_chance: number;
};

export type Resource = {
  id: string;
  name: string;
  category: 'Fertilizer' | 'Pesticide' | 'Seeds' | 'Equipment' | 'Tools' | 'Other';
  description: string;
  price: number;
  unit: string;
  stock_quantity: number;
  image_url: string;
  brand: string;
  is_available: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: string;
  notes: string;
  created_at: string;
};

export type Expert = {
  id: string;
  name: string;
  specialization: string;
  bio: string;
  years_experience: number;
  rating: number;
  review_count: number;
  availability: string;
  hourly_rate: number;
  image_url: string;
  languages: string[];
  created_at: string;
};

export type Consultation = {
  id: string;
  user_id: string;
  expert_id: string;
  topic: string;
  description: string;
  preferred_date: string | null;
  preferred_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meeting_link: string;
  notes: string;
  created_at: string;
  expert?: Expert;
};
