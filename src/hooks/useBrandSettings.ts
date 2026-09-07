import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BrandSettings } from "@/types";

export function useBrandSettings() {
  const [settings, setSettings] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      const { data, error } = await supabase
        .from("brand_settings")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return;
      if (!error && data) setSettings(data as unknown as BrandSettings);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  return { settings, loading };
}
