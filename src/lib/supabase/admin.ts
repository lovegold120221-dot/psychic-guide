import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client — uses the service_role key to bypass RLS.
 * Server-side only. NEVER import this in client components or API routes
 * that are publicly accessible without authentication.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin credentials not configured. " +
      "Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
