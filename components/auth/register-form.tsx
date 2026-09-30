"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import { registerAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, { ok: false });

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Nume complet</Label>
        <Input id="full_name" name="full_name" required autoComplete="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Parolă</Label>
        <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cnp">CNP (opțional)</Label>
          <Input id="cnp" name="cnp" maxLength={13} placeholder="13 cifre" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefon (opțional)</Label>
          <Input id="phone" name="phone" inputMode="tel" placeholder="07xxxxxxxx" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="county">Județ (opțional)</Label>
        <Input id="county" name="county" placeholder="Cluj" />
      </div>

      {state.error ? (
        <Alert variant="danger" aria-live="polite">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        {pending ? "Se creează contul…" : "Creează cont"}
      </Button>

      <p className="text-center text-sm text-[--color-muted-foreground]">
        Ai deja cont?{" "}
        <Link href="/login" className="font-medium text-[--color-primary] hover:underline">
          Autentifică-te
        </Link>
      </p>
    </form>
  );
}
