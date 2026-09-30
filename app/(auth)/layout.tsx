import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between gradient-hero p-10 text-white md:flex">
        <Logo inverted />
        <div className="max-w-md space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            Un singur cont. Toate ghișeele. Niciun termen ratat.
          </h2>
          <p className="text-white/70">
            Suntem singura platformă care îți gestionează simultan dosarul la DGPCI, RAR, ANAF, DGITL și
            asigurătorul tău — fără să mai depinzi de niciuna dintre cozile lor.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-bold">9.4/10</div>
              <div className="text-white/60">Net Promoter Score</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-bold">99.97%</div>
              <div className="text-white/60">Uptime ledger</div>
            </div>
          </div>
        </div>
        <p className="text-xs text-white/40">
          © 2026 AutoActe · Construit pentru oameni, nu pentru ghișee.
        </p>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 md:hidden">
          <Logo />
          <Link href="/" className="text-sm text-[--color-muted-foreground] hover:underline">
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
