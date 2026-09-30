import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Autentificare — AutoActe" };

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Bun venit înapoi</h1>
        <p className="text-sm text-[--color-muted-foreground]">
          Conectează-te pentru a-ți relua dosarele de înmatriculare. Următorul pas este o validare 2FA.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
