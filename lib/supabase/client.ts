"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env, integrationStatus } from "@/lib/env";
import { createMockSupabase } from "./mock";
import type { SupabaseLike } from "./types";

let cached: SupabaseLike | null = null;

export function getSupabaseBrowser(): SupabaseLike {
  if (cached) return cached;
  if (!integrationStatus.supabase) {
    cached = createMockSupabase();
    return cached;
  }
  cached = createBrowserClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
  ) as unknown as SupabaseLike;
  return cached;
}
