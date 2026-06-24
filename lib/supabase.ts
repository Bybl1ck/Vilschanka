import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;
let supabaseServiceRoleClient: SupabaseClient | null = null;

function clientOptions() {
  return {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  };
}

export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Не налаштовано NEXT_PUBLIC_SUPABASE_URL або ключ Supabase.");
  }

  supabaseClient = createClient(url, key, clientOptions());

  return supabaseClient;
}

/**
 * Серверний клієнт для операцій адмін-панелі та seed-скриптів.
 * SERVICE_ROLE_KEY є рекомендованим, але fallback на наявний публічний ключ
 * зберігає сумісність із поточними env та RLS-політиками MVP.
 */
export function getSupabaseAdmin() {
  if (supabaseAdminClient) return supabaseAdminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const developmentFallbackKey = process.env.NODE_ENV !== "production"
    ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : undefined;
  const key = serviceRoleKey || developmentFallbackKey;

  if (!url || !key) {
    throw new Error("Не налаштовано NEXT_PUBLIC_SUPABASE_URL або серверний SUPABASE_SERVICE_ROLE_KEY.");
  }

  supabaseAdminClient = createClient(url, key, clientOptions());
  return supabaseAdminClient;
}

/** Строгий server-only клієнт для Storage та інших привілейованих операцій. */
export function getSupabaseServiceRole() {
  if (supabaseServiceRoleClient) return supabaseServiceRoleClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Не налаштовано NEXT_PUBLIC_SUPABASE_URL або SUPABASE_SERVICE_ROLE_KEY.");
  }

  supabaseServiceRoleClient = createClient(url, key, clientOptions());
  return supabaseServiceRoleClient;
}
