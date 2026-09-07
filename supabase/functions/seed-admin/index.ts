import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ADMIN_EMAIL = "admin@kandammakids.com";
const ADMIN_PASSWORD = "Kandamma@Admin2026";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Only allowed while no admin exists (one-time bootstrap).
  const { count, error: countError } = await admin
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  if (countError) {
    return new Response(JSON.stringify({ error: countError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if ((count ?? 0) > 0) {
    return new Response(JSON.stringify({ error: "Admin already exists" }), {
      status: 409,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Kandamma Kids Admin" },
  });

  if (createError || !created.user) {
    return new Response(JSON.stringify({ error: createError?.message ?? "create failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = created.user.id;

  await admin.from("user_roles").delete().eq("user_id", userId);
  const { error: roleError } = await admin.from("user_roles").insert({ user_id: userId, role: "admin" });

  if (roleError) {
    return new Response(JSON.stringify({ error: roleError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  await admin.from("profiles").upsert({ id: userId, full_name: "Kandamma Kids Admin" });

  return new Response(JSON.stringify({ ok: true, email: ADMIN_EMAIL, user_id: userId }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
