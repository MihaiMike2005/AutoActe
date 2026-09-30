import { redirect } from "next/navigation";
import { getSession, type Session } from "@/lib/auth/session";
import type { UserRole } from "@/types/domain";

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session || !session.verified_2fa) {
    redirect("/login");
  }
  return session;
}

export async function requireRoleOrRedirect(role: UserRole): Promise<Session> {
  const session = await requireSession();
  if (session.role !== role && session.role !== "system") {
    const dest =
      session.role === "public_servant"
        ? "/inbox"
        : session.role === "dealer_user"
          ? "/dealer/dashboard"
          : "/dashboard";
    redirect(dest);
  }
  return session;
}
