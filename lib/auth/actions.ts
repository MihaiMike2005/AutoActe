"use server";

import { redirect } from "next/navigation";
import { LoginSchema, RegisterSchema, TwoFactorSchema } from "@/lib/validators";
import {
  clearPending2FA,
  clearSession,
  getPending2FA,
  setPending2FA,
  setSession,
} from "./session";
import {
  demoProfiles,
  getDemoProfileByEmail,
} from "@/lib/mock/demo-data";
import type { Profile } from "@/types/domain";

type FormState = { ok: boolean; error?: string };

const DEMO_PASSWORD = "Demo2026!";
const DEMO_2FA_CODE = "123456";

function profileToSession(p: Profile, verified_2fa: boolean) {
  return {
    user_id: p.id,
    email: p.email,
    full_name: p.full_name,
    role: p.role,
    organization_ids: p.organization_ids ?? [],
    verified_2fa,
    issued_at: Date.now(),
  };
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
  }

  const { email, password } = parsed.data;
  const profile = getDemoProfileByEmail(email);

  if (!profile || password !== DEMO_PASSWORD) {
    return { ok: false, error: "Email sau parolă incorectă." };
  }

  await setPending2FA({
    user_id: profile.id,
    email: profile.email,
    code: DEMO_2FA_CODE,
    expires_at: Date.now() + 5 * 60 * 1000,
  });

  redirect("/verify-2fa");
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = RegisterSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
    cnp: formData.get("cnp") ?? "",
    phone: formData.get("phone") ?? "",
    county: formData.get("county") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
  }

  const exists = getDemoProfileByEmail(parsed.data.email);
  if (exists) {
    return { ok: false, error: "Există deja un cont cu acest email." };
  }

  const newProfile: Profile = {
    id: "u-" + Math.random().toString(36).slice(2, 10),
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    cnp: parsed.data.cnp || undefined,
    phone: parsed.data.phone || undefined,
    county: parsed.data.county || undefined,
    role: "citizen",
    preferred_language: "ro",
    accessibility_settings: {
      high_contrast: false,
      screen_reader: false,
      font_size: "normal",
      voice_guide: false,
    },
    created_at: new Date().toISOString(),
  };
  demoProfiles.push(newProfile);

  await setPending2FA({
    user_id: newProfile.id,
    email: newProfile.email,
    code: DEMO_2FA_CODE,
    expires_at: Date.now() + 5 * 60 * 1000,
  });

  redirect("/verify-2fa");
}

export async function verifyTwoFactorAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = TwoFactorSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { ok: false, error: "Codul are 6 cifre" };
  }
  const pending = await getPending2FA();
  if (!pending) {
    return { ok: false, error: "Sesiune expirată. Te rugăm să te autentifici din nou." };
  }
  if (parsed.data.code !== pending.code) {
    return { ok: false, error: "Cod incorect." };
  }
  const profile = demoProfiles.find((p) => p.id === pending.user_id);
  if (!profile) {
    return { ok: false, error: "Cont negăsit." };
  }
  await setSession(profileToSession(profile, true));
  await clearPending2FA();

  const dest =
    profile.role === "public_servant"
      ? "/inbox"
      : profile.role === "dealer_user"
        ? "/dealer/dashboard"
        : "/dashboard";
  redirect(dest);
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
