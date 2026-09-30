"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import { loginAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm({ initialEmail }: { initialEmail?: string }) {
  const [state, action, pending] = useActionState(loginAction, { ok: false });

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={initialEmail ?? "cetatean@demo.ro"}
          required
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Parolă</Label>
          <Link href="#" className="text-xs text-[--color-primary] hover:underline">
            Ai uitat parola?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          defaultValue="Demo2026!"
          required
        />
      </div>

      {state.error ? (
        <Alert variant="danger" aria-live="polite">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        {pending ? "Se autentifică…" : "Continuă spre 2FA"}
      </Button>

      <p className="text-center text-sm text-[--color-muted-foreground]">
        Nu ai cont încă?{" "}
        <Link href="/register" className="font-medium text-[--color-primary] hover:underline">
          Înregistrează-te în 30 sec.
        </Link>
      </p>
    </form>
  );
}
