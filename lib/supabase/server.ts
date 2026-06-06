import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server client with the service role key. All writes go through here, so the
// PostGIS RPCs run with full privileges and RLS is bypassed.
export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
