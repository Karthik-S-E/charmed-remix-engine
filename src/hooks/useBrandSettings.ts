import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BrandSettings } from "@/types";

export function useBrandSettings() {
  const [settings, setSettings] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("brand_settings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setSettings(data as unknown as BrandSettings);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}
