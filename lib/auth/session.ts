import { cookies } from "next/headers";
import type { UserRole } from "@/types/domain";
import { decodeSigned, encodeSigned, hmac, safeEqual } from "./signed-token";

const SESSION_COOKIE = "autoacte_session";
const PENDING_2FA_COOKIE = "autoacte_pending_2fa";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const PENDING_2FA_TTL_SECONDS = 60 * 5;

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
  code_hash: string;
  expires_at: number;
};

export type NewPendingTwoFactor = Omit<PendingTwoFactor, "code_hash"> & {
  code: string;
};

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

function twoFactorCodeHash(user_id: string, code: string) {
  return hmac("2fa-code", `${user_id}:${code}`);
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const session = decodeSigned<Session>(SESSION_COOKIE, raw);
  if (!session) return null;
  if (session.issued_at + SESSION_TTL_SECONDS * 1000 < Date.now()) return null;
  return session;
}

export async function setSession(session: Session) {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSigned(SESSION_COOKIE, session), {
    ...COOKIE_OPTS,
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(PENDING_2FA_COOKIE);
}

export async function setPending2FA({ code, ...rest }: NewPendingTwoFactor) {
  const store = await cookies();
  const pending: PendingTwoFactor = {
    ...rest,
    code_hash: twoFactorCodeHash(rest.user_id, code).toString("base64url"),
  };
  store.set(PENDING_2FA_COOKIE, encodeSigned(PENDING_2FA_COOKIE, pending), {
    ...COOKIE_OPTS,
    maxAge: PENDING_2FA_TTL_SECONDS,
  });
}

export async function getPending2FA(): Promise<PendingTwoFactor | null> {
  const store = await cookies();
  const raw = store.get(PENDING_2FA_COOKIE)?.value;
  if (!raw) return null;
  const pending = decodeSigned<PendingTwoFactor>(PENDING_2FA_COOKIE, raw);
  if (!pending || pending.expires_at < Date.now()) return null;
  return pending;
}

export function checkPending2FACode(pending: PendingTwoFactor, code: string) {
  return safeEqual(
    Buffer.from(pending.code_hash, "base64url"),
    twoFactorCodeHash(pending.user_id, code),
  );
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
