import { createBrowserClient } from "@supabase/ssr";

function requiredPublicValue(name: string, value: string | undefined): string {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    throw new Error(
      `Missing Supabase configuration: ${name} is not set. Add it to .env.local.`,
    );
  }

  return trimmed;
}

export function createClient() {
  const supabaseUrl = requiredPublicValue(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const supabasePublishableKey = requiredPublicValue(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
