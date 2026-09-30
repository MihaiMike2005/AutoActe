import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, integrationStatus } from "@/lib/env";
import { createMockSupabase } from "./mock";
import type { SupabaseLike } from "./types";

export async function getSupabaseServer(): Promise<SupabaseLike> {
  if (!integrationStatus.supabase) {
    return createMockSupabase();
  }
  const cookieStore = await cookies();
  return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — ignore (middleware refreshes).
        }
      },
    },
  }) as unknown as SupabaseLike;
}

export async function getSupabaseAdmin(): Promise<SupabaseLike> {
  if (!integrationStatus.supabase || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return createMockSupabase();
  }
  const cookieStore = await cookies();
  return createServerClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  }) as unknown as SupabaseLike;
}
