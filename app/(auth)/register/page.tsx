import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Înregistrare — AutoActe" };

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Creează cont gratuit</h1>
        <p className="text-sm text-[--color-muted-foreground]">
          Acceptăm ROeID, ANAF SPV și CNP. Pentru hackathon: orice email funcționează. Vei primi cod 2FA imediat.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
