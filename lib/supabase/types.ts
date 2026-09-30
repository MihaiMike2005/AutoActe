export type SupabaseLike = {
  auth: {
    getUser: () => Promise<{
      data: { user: { id: string; email?: string } | null };
      error: { message: string } | null;
    }>;
    signInWithPassword: (args: {
      email: string;
      password: string;
    }) => Promise<{
      data: { user: { id: string; email: string } | null };
      error: { message: string } | null;
    }>;
    signUp: (args: { email: string; password: string }) => Promise<{
      data: { user: { id: string; email: string } | null };
      error: { message: string } | null;
    }>;
    signOut: () => Promise<{ error: { message: string } | null }>;
  };
  from: (table: string) => unknown;
};
