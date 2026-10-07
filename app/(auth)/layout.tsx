import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between gradient-hero p-10 text-white md:flex">
        <Logo inverted />
        <div className="max-w-md space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            Toate actele într-un singur dosar. Termenele mereu la vedere.
          </h2>
          <p className="text-white/70">
            Un prototip care modelează pașii de la DGPCI, RAR, ANAF, DGITL și asigurător într-un singur
            flux ghidat, cu date demo.
          </p>
        </div>
        <p className="text-xs text-white/40">
          © 2026 AutoActe · Construit pentru oameni, nu pentru ghișee.
        </p>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 md:hidden">
          <Logo />
          <Link href="/" className="text-sm text-(--color-muted-foreground) hover:underline">
            Înapoi acasă
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
