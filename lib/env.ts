export const env = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY ?? "",
  ELEVENLABS_VOICE_ID:
    process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM",
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
  RESEND_FROM_EMAIL:
    process.env.RESEND_FROM_EMAIL ?? "AutoActe <noreply@autoacte.ro>",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  WEBHOOK_SIGNING_SECRET: process.env.WEBHOOK_SIGNING_SECRET ?? "dev-secret",
  DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE !== "false",
};

export const integrationStatus = {
  supabase: Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
  anthropic: Boolean(env.ANTHROPIC_API_KEY),
  elevenlabs: Boolean(env.ELEVENLABS_API_KEY),
  resend: Boolean(env.RESEND_API_KEY),
};

export type IntegrationKey = keyof typeof integrationStatus;

export function hasIntegration(key: IntegrationKey) {
  return integrationStatus[key];
}
