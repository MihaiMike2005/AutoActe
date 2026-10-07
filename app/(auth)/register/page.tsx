import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Înregistrare — AutoActe" };

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Creează cont gratuit</h1>
        <p className="text-sm text-(--color-muted-foreground)">
          Mod demo: orice email funcționează, iar codul 2FA îl primești imediat.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
