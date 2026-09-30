import { redirect } from "next/navigation";
import { TwoFactorForm } from "@/components/auth/two-factor-form";
import { getPending2FA } from "@/lib/auth/session";
import { integrationStatus } from "@/lib/env";

export const metadata = { title: "Validare 2FA — AutoActe" };

export default async function Verify2FAPage() {
  const pending = await getPending2FA();
  if (!pending) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Validare în 2 pași</h1>
        <p className="text-sm text-[--color-muted-foreground]">
          Am trimis un cod către <strong>{pending.email}</strong>. Introdu-l mai jos pentru a finaliza autentificarea.
          Codul expiră în 5 minute.
        </p>
      </div>
      <TwoFactorForm demoCode={integrationStatus.supabase ? null : pending.code} />
    </div>
  );
}
