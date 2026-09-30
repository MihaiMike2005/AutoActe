import { cookies } from "next/headers";
import type { UserRole } from "@/types/domain";

const SESSION_COOKIE = "autoacte_session";
const PENDING_2FA_COOKIE = "autoacte_pending_2fa";

export type Session = {
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_ids: string[];
  verified_2fa: boolean;
  issued_at: number;
};

export type PendingTwoFactor = {
  user_id: string;
  email: string;
  code: string;
  expires_at: number;
};

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as Session;
  } catch {
    return null;
  }
}

export async function setSession(session: Session) {
  const store = await cookies();
  const value = Buffer.from(JSON.stringify(session)).toString("base64");
  store.set(SESSION_COOKIE, value, {
    ...COOKIE_OPTS,
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(PENDING_2FA_COOKIE);
}

export async function setPending2FA(p: PendingTwoFactor) {
  const store = await cookies();
  store.set(PENDING_2FA_COOKIE, Buffer.from(JSON.stringify(p)).toString("base64"), {
    ...COOKIE_OPTS,
    maxAge: 60 * 5,
  });
}

export async function getPending2FA(): Promise<PendingTwoFactor | null> {
  const store = await cookies();
  const raw = store.get(PENDING_2FA_COOKIE)?.value;
  if (!raw) return null;
  try {
    const p = JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as PendingTwoFactor;
    if (p.expires_at < Date.now()) return null;
    return p;
  } catch {
    return null;
  }
}

export async function clearPending2FA() {
  const store = await cookies();
  store.delete(PENDING_2FA_COOKIE);
}

export function requireRole(session: Session | null, role: UserRole) {
  if (!session) return false;
  if (!session.verified_2fa) return false;
  return session.role === role || session.role === "system";
}
