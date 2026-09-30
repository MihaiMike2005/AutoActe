import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ScanText,
  ShieldCheck,
  Sparkles,
  Workflow,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo inverted />
          <nav className="hidden items-center gap-1 md:flex">
            <Button asChild variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
              <Link href="#cum-funcționează">Cum funcționează</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
              <Link href="#impact">Impact</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
              <Link href="#ecosistem">Ecosistem</Link>
            </Button>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
              <Link href="/login">Autentificare</Link>
            </Button>
            <Button asChild className="shadow-lg shadow-[--color-primary]/30">
              <Link href="/register">
                Începe gratuit <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-hero relative isolate overflow-hidden text-white">
        <div className="container-page pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="accent" className="mb-6 bg-white/10 text-white border-white/15 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Cluj Hackathon 2026 — Digital Romania
            </Badge>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Înmatricularea auto, <span className="text-[--color-accent]">finalizată într-o singură seară</span>.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/75 md:text-xl">
              AutoActe unește DGPCI, RAR, ANAF, DGITL și asigurătorii într-un flux digital end-to-end,
              cu OCR Claude Vision, validare încrucișată automată și transparență blockchain-grade.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="xl" className="shadow-2xl shadow-[--color-primary]/40">
                <Link href="/register">
                  Pornește flux nou <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="border-white/30 text-white bg-white/5 hover:bg-white/10">
                <Link href="/login">Conectează-te cu cont demo</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-white/50">
              Demo: <code className="rounded bg-white/10 px-1.5 py-0.5">cetatean@demo.ro</code> /
              <code className="ml-1 rounded bg-white/10 px-1.5 py-0.5">Demo2026!</code>
              {" · "}
              2FA: <code className="rounded bg-white/10 px-1.5 py-0.5">123456</code>
            </p>
          </div>

          {/* Stat strip */}
          <div className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { kpi: "5 → 1", label: "instituții unificate" },
              { kpi: "4 sgt → 2 zile", label: "timp mediu înmatriculare" },
              { kpi: "20+ ore", label: "economisite per cetățean" },
              { kpi: "8 mil.", label: "proprietari de vehicule" },
            ].map((s) => (
              <div
                key={s.kpi}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
              >
                <div className="text-2xl font-bold text-white">{s.kpi}</div>
                <div className="mt-1 text-sm text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cum funcționează */}
      <section id="cum-funcționează" className="bg-[--color-background] py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Trei surprize plăcute, într-un flux pe care îl știai dureros
            </h2>
            <p className="mt-4 text-[--color-muted-foreground]">
              Construit cu Claude Vision și API-uri publice — nimic fictiv, totul demonstrabil.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ScanText,
                title: "OCR cu Claude Vision",
                body:
                  "Fotografiezi briefcul, kaufvertragul și CI-ul. În ~6 secunde ai 80% din câmpuri auto-completate și verificate încrucișat pe VIN.",
              },
              {
                icon: Workflow,
                title: "Flux orchestrat end-to-end",
                body:
                  "Wizardul tău se sincronizează cu ANAF, RAR, DGITL și DGPCI prin webhook-uri n8n — primești notificări la fiecare pas.",
              },
              {
                icon: ShieldCheck,
                title: "Ledger criptografic",
                body:
                  "Fiecare acțiune este înregistrată într-un lanț SHA-256. Funcționarii și cetățenii pot verifica integritatea cu un click.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-[--color-border] bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="inline-grid h-11 w-11 place-items-center rounded-lg bg-[--color-primary]/10 text-[--color-primary]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[--color-muted-foreground]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="bg-white py-24">
        <div className="container-page grid items-center gap-12 md:grid-cols-2">
          <div>
            <Badge variant="warning" className="mb-4">
              <Clock className="h-3 w-3" />
              Termen legal: 90 zile
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Astăzi: 5 ghișee, 2–4 săptămâni, risc penal după 90 zile.
            </h2>
            <p className="mt-4 leading-relaxed text-[--color-muted-foreground]">
              AutoActe te ghidează cu un cronometru permanent, deadline-uri colorate și acțiuni concrete
              la fiecare etapă. Niciun cetățean nu mai ratează un termen legal.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Auto-completare CNP, VIN și capacitate cilindrică din fotografii.",
                "Calculator cost actualizat live, cu impozit anual conform art. 470 din Codul Fiscal.",
                "Marketplace contextual: traduceri legalizate, transport, asistență RAR.",
                "Portal funcționar cu inbox în timp real și aprobare semi-automată.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-3xl border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
            <div className="absolute -top-3 left-6">
              <Badge variant="default">Live demo</Badge>
            </div>
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Ecosistem */}
      <section id="ecosistem" className="bg-[--color-background] py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Un ecosistem deschis, gata de integrat
            </h2>
            <p className="mt-4 text-[--color-muted-foreground]">
              API public REST, webhook-uri CloudEvents 1.0, n8n-ready. Construim împreună cu instituțiile —
              fără ele nu există Digital Romania.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {[
              { label: "DGPCI", desc: "Înmatriculare + plăcuțe" },
              { label: "RAR", desc: "Omologare + CIV" },
              { label: "ANAF", desc: "Certificat TVA" },
              { label: "DGITL", desc: "Impozit anual" },
              { label: "Asigurători", desc: "RCA real-time" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[--color-border] bg-white p-4 text-center">
                <div className="font-semibold tracking-tight">{item.label}</div>
                <div className="text-xs text-[--color-muted-foreground]">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[--color-border] bg-white py-10">
        <div className="container-page flex flex-col items-center justify-between gap-4 md:flex-row">
          <Logo />
          <p className="text-xs text-[--color-muted-foreground]">
            Construit pentru Cluj Hackathon 2026 · MIT License · ROeID-ready
          </p>
        </div>
      </footer>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-[--color-border] bg-white p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-100 text-amber-700">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">BMW 320d · INM-2026-000142</div>
            <div className="text-xs text-[--color-muted-foreground]">Importat din Germania · 60 zile rămase</div>
          </div>
        </div>
        <Badge variant="warning">RAR programare</Badge>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-[--color-border] bg-white p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-100 text-blue-700">
            <ScanText className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Dacia Spring · INM-2026-000168</div>
            <div className="text-xs text-[--color-muted-foreground]">Mașină nouă RO · 83% finalizat</div>
          </div>
        </div>
        <Badge variant="default">DGPCI</Badge>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-[--color-border] bg-white p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Skoda Octavia · INM-2025-099741</div>
            <div className="text-xs text-[--color-muted-foreground]">Finalizat acum 80 zile · CJ 22 ABC</div>
          </div>
        </div>
        <Badge variant="success">Completat</Badge>
      </div>
    </div>
  );
}
