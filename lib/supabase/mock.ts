import type { SupabaseLike } from "./types";

/**
 * In-memory Supabase stub for local-first dev. Backed by the demo dataset
 * so the app stays usable without real Supabase credentials.
 */
export function createMockSupabase(): SupabaseLike {
  return {
    auth: {
      async getUser() {
        return { data: { user: null }, error: null };
      },
      async signInWithPassword({ email }) {
        return {
          data: { user: { id: "mock-" + email, email } },
          error: null,
        };
      },
      async signUp({ email }) {
        return {
          data: { user: { id: "mock-" + email, email } },
          error: null,
        };
      },
      async signOut() {
        return { error: null };
      },
    },
    from() {
      return {
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      };
    },
  };
}
