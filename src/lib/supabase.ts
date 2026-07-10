import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const hasSupabaseConfig =
  Boolean(supabaseUrl && supabaseAnonKey) &&
  !supabaseUrl.includes("placeholder.supabase.co") &&
  supabaseAnonKey !== "placeholder";

export const isStrictFreeTierMode =
  process.env.NEXT_PUBLIC_GRME_STRICT_FREE_TIER === "true";

function createNoopSupabase(): SupabaseClient {
  const noopResult = { data: null, error: null };

  const makeProxy = (): SupabaseClient =>
    new Proxy(function () {}, {
      get(_target, prop) {
        if (prop === "then") {
          return (resolve: (value: typeof noopResult) => void) => resolve(noopResult);
        }
        if (prop === "catch") {
          return () => Promise.resolve(noopResult);
        }
        if (prop === "finally") {
          return (callback?: () => void) => {
            callback?.();
            return Promise.resolve(noopResult);
          };
        }
        if (prop === "removeChannel") {
          return () => Promise.resolve(true);
        }
        return () => makeProxy();
      },
      apply() {
        return makeProxy();
      },
    }) as unknown as SupabaseClient;

  return makeProxy();
}

export function getSupabase(): SupabaseClient {
  if (client) return client;

  if (!hasSupabaseConfig) {
    client = createNoopSupabase();
  } else {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }

  return client;
}

// Convenience export — lazy singleton
let _supabase: SupabaseClient | null = null;
export function supabase(): SupabaseClient {
  if (!_supabase) _supabase = getSupabase();
  return _supabase;
}
