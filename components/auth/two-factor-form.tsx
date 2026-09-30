"use client";

import { useActionState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { verifyTwoFactorAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function TwoFactorForm({ demoCode }: { demoCode: string | null }) {
  const [state, action, pending] = useActionState(verifyTwoFactorAction, { ok: false });

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="code">Cod 2FA</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="6 cifre"
          required
          className="text-center text-2xl tracking-[0.4em]"
        />
      </div>

      {demoCode ? (
        <Alert variant="info">
          <AlertDescription>
            Cod demo: <code className="rounded bg-blue-100 px-1.5 py-0.5 text-base font-semibold">{demoCode}</code>
            <span className="ml-1 text-xs text-blue-800/80">
              (în producție: e-mail / SMS / push.)
            </span>
          </AlertDescription>
        </Alert>
      ) : null}

      {state.error ? (
        <Alert variant="danger" aria-live="polite">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        {pending ? "Se validează…" : "Validează & intră"}
      </Button>
    </form>
  );
}
