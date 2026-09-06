export type ProductGender = "boy" | "girl" | "unisex";

export interface Product {
  id: string;
  slug: string;
  name: string;
  design_number?: string | null;
  colors?: string[] | null;
  color_images?: Record<string, string> | null;
  style?: string | null;
  occasion?: string | null;
  price: number;
  gender: ProductGender;
  age_range: string;
  sizes?: string[] | null;
  in_stock: boolean;
  stock_quantity: number;
  description?: string | null;
  main_image?: string | null;
  meesho_url?: string | null;
  flipkart_url?: string | null;
  created_at?: string;
}

export interface BrandSettings {
  id: string;
  store_name: string;
  tagline?: string | null;
  logo_url?: string | null;
  updated_at?: string;
}

export interface Profile {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  address?: string | null;
}

export type AppRole = "admin" | "customer";
