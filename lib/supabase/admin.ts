import { createClient } from "@supabase/supabase-js";

/** Server-only Supabase secret key (replaces legacy service_role JWT). Never import from Client Components. */
function getSupabaseSecretKey(): string {
  return process.env.SUPABASE_SECRET_KEY?.trim() ?? "";
}

/**
 * Server-only Supabase client with the secret key. Never import from Client Components.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const secretKey = getSupabaseSecretKey();

  if (!supabaseUrl || !secretKey) {
    throw new Error(
      "Missing Supabase configuration: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.",
    );
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function hasServiceRoleConfiguration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  return Boolean(supabaseUrl && getSupabaseSecretKey());
}
