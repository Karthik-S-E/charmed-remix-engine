import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types";

function mapRow(row: Record<string, unknown>): Product {
  const salePrice = row.sale_price as number | null | undefined;
  const basePrice = Number(row.price ?? 0);
  const effectivePrice = salePrice ?? basePrice;
  return {
    ...(row as unknown as Product),
    price: effectivePrice,
    originalPrice: salePrice ? basePrice : undefined,
    salePrice,
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).single();
  if (error || !data) return null;
  return mapRow(data);
}

export async function getRelatedProducts(slug: string, count = 3): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").neq("slug", slug).limit(count);
  if (error) throw error;
  return (data ?? []).map(mapRow);
}
