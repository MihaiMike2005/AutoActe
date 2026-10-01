import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

type SecretHolder = typeof globalThis & { __autoacteDevAuthSecret?: Buffer };

function authSecret(): Buffer {
  if (env.AUTH_SESSION_SECRET) return Buffer.from(env.AUTH_SESSION_SECRET, "utf8");
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SESSION_SECRET must be set in production.");
  }
  // Pinned to globalThis so HMR reloads and separate route bundles share one dev secret.
  const holder = globalThis as SecretHolder;
  if (!holder.__autoacteDevAuthSecret) {
    holder.__autoacteDevAuthSecret = randomBytes(32);
    console.warn(
      "[auth] AUTH_SESSION_SECRET is not set; using a random per-process secret. Sessions reset on restart.",
    );
  }
  return holder.__autoacteDevAuthSecret;
}

export function hmac(purpose: string, data: string): Buffer {
  return createHmac("sha256", authSecret()).update(`${purpose}\n${data}`).digest();
}

export function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

export function encodeSigned(purpose: string, payload: unknown): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${hmac(purpose, body).toString("base64url")}`;
}

export function decodeSigned<T>(purpose: string, token: string): T | null {
  const dot = token.indexOf(".");
  if (dot <= 0 || dot !== token.lastIndexOf(".")) return null;
  const body = token.slice(0, dot);
  const mac = Buffer.from(token.slice(dot + 1), "base64url");
  if (!safeEqual(mac, hmac(purpose, body))) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed as T;
  } catch {
    return null;
  }
}
