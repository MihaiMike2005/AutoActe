import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  Clock,
  Code,
  Inbox,
  ListChecks,
  ScanText,
  ShieldCheck,
  ShoppingBag,
  Webhook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { startDemoAction } from "@/lib/auth/actions";

const REPO_URL = "https://github.com/MihaiMike2005/AutoActe";

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo inverted className="sm:-ml-3 lg:-ml-4 2xl:-ml-8" />
          <nav className="hidden items-center gap-1 md:flex">
            <Button asChild variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
              <Link href="#cum-functioneaza">Cum funcționează</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
              <Link href="#de-ce">De ce</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
              <Link href="#ce-urmeaza">Ce urmează</Link>
            </Button>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
              <Link href="/login">Autentificare</Link>
            </Button>
            <form action={startDemoAction} className="hidden sm:block">
              <Button type="submit" className="shadow-lg shadow-(--color-primary)/30">
                Încearcă demo <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-hero relative isolate overflow-hidden text-white">
        <div className="container-page pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Înmatricularea auto, <span className="text-(--color-accent)"><span className="whitespace-nowrap">într-un</span> singur flux digital</span>.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/75 md:text-xl">
              AutoActe este un prototip care modelează întregul drum al unei înmatriculări prin DGPCI, RAR,
              ANAF, DGITL și asigurători. Fotografiezi documentele, Claude Vision completează câmpurile, iar
              aplicația ține evidența termenelor legale și a costurilor.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <form action={startDemoAction}>
                <Button type="submit" size="xl" className="shadow-2xl shadow-(--color-primary)/40">
                  Încearcă demo-ul <ArrowRight className="h-5 w-5" />
                </Button>
              </form>
              <Button asChild size="xl" variant="outline" className="border-white/30 text-white bg-white/5 hover:bg-white/10">
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  <Code className="h-5 w-5" /> Codul sursă
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cum funcționează */}
      <section id="cum-functioneaza" className="bg-(--color-background) py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Trei surprize plăcute, într-un flux pe care îl știai dureros
            </h2>
            <p className="mt-4 text-(--color-muted-foreground)">
              Toate trei funcționează în demo, cu date de test, fără să-ți faci cont.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ScanText,
                title: "OCR cu Claude Vision",
                body:
                  "Fotografiezi briefcul, kaufvertragul și CI-ul. Claude Vision extrage câmpurile, le completează în dosar și verifică încrucișat VIN-ul între documente.",
              },
              {
                icon: ListChecks,
                title: "Wizard ghidat, cu termenul de 90 de zile",
                body:
                  "Alegi scenariul (mașină nouă, second-hand sau importată) și primești pașii în ordinea corectă. Pentru mașinile importate, termenul legal de 90 de zile rămâne mereu la vedere.",
              },
              {
                icon: Calculator,
                title: "Calculator de costuri și impozit",
                body:
                  "Vezi din start taxele de înmatriculare, plăcuțele, omologarea RAR și impozitul anual, calculat după art. 470 din Codul Fiscal.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-(--color-border) bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="inline-grid h-11 w-11 place-items-center rounded-lg bg-(--color-primary)/10 text-(--color-primary)">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-(--color-muted-foreground)">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* De ce */}
      <section id="de-ce" className="bg-white py-24">
        <div className="container-page grid items-center gap-12 md:grid-cols-2">
          <div>
            <Badge variant="warning" className="mb-4">
              <Clock className="h-3 w-3" />
              Termen legal: 90 zile
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Astăzi: mai multe ghișee, aceleași acte cerute din nou și amendă dacă ratezi termenul.
            </h2>
            <p className="mt-4 leading-relaxed text-(--color-muted-foreground)">
              AutoActe îți arată la fiecare etapă ce ai de făcut și cât timp mai ai, cu un cronometru
              permanent și termene marcate pe culori.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Auto-completare CNP, VIN și capacitate cilindrică din fotografii.",
                "Decodare VIN prin NHTSA: marca, modelul și anul, direct din seria de șasiu.",
                "Calculator cost actualizat live, cu impozit anual conform art. 470 din Codul Fiscal.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-3xl border border-(--color-border) bg-(--color-background) p-6 shadow-sm">
            <div className="absolute -top-3 left-6">
              <Badge variant="default">Previzualizare</Badge>
            </div>
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Ce urmează */}
      <section id="ce-urmeaza" className="bg-(--color-background) py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ce urmează</h2>
            <p className="mt-4 text-(--color-muted-foreground)">
              Wizardul modelează pașii a cinci instituții. Nu există încă integrări cu sistemele lor:
              pașii sunt simulați cu date demo.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            {[
              { label: "DGPCI", desc: "Înmatriculare + plăcuțe" },
              { label: "RAR", desc: "Omologare + CIV" },
              { label: "ANAF", desc: "Certificat TVA" },
              { label: "DGITL", desc: "Impozit anual" },
              { label: "Asigurători", desc: "Poliță RCA" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-(--color-border) bg-white p-4 text-center">
                <div className="font-semibold tracking-tight">{item.label}</div>
                <div className="text-xs text-(--color-muted-foreground)">{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-3xl">
            <h3 className="text-center text-lg font-semibold">Planificat, încă neconstruit</h3>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Inbox,
                  title: "Portal funcționar",
                  body: "Inbox pentru DGPCI și RAR, cu aprobare semi-automată a dosarelor.",
                },
                {
                  icon: Building2,
                  title: "Portal dealer",
                  body: "Înmatriculări în lot pentru dealeri auto.",
                },
                {
                  icon: ShoppingBag,
                  title: "Marketplace de servicii",
                  body: "Traduceri legalizate, transport și asistență la RAR, oferite în contextul dosarului.",
                },
                {
                  icon: ShieldCheck,
                  title: "Pagină de verificare a ledger-ului",
                  body: "Lanțul de audit SHA-256 există deja în schema bazei de date; lipsește pagina care îl verifică.",
                },
                {
                  icon: Webhook,
                  title: "API public + webhook-uri",
                  body: "REST /api/v1 și livrarea evenimentelor CloudEvents prin webhook-uri, de exemplu către n8n.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className="flex items-start gap-3 rounded-xl border border-dashed border-(--color-border) bg-white p-4"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-(--color-secondary) text-(--color-muted-foreground)">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{title}</span>
                      <Badge variant="muted" size="sm">Planificat</Badge>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-(--color-muted-foreground)">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-(--color-border) bg-white py-10">
        <div className="container-page flex flex-col items-center justify-between gap-4 md:flex-row">
          <Logo />
          <p className="text-xs text-(--color-muted-foreground)">
            Proiect personal · Mihai Stefanita ·{" "}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--color-primary) hover:underline"
            >
              Cod sursă pe GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-(--color-border) bg-white p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-100 text-amber-700">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">BMW 320d · INM-2026-000142</div>
            <div className="text-xs text-(--color-muted-foreground)">Importat din Germania · 60 zile rămase</div>
          </div>
        </div>
        <Badge variant="warning">RAR programare</Badge>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-(--color-border) bg-white p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-100 text-blue-700">
            <ScanText className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Dacia Spring · INM-2026-000168</div>
            <div className="text-xs text-(--color-muted-foreground)">Mașină nouă RO · 83% finalizat</div>
          </div>
        </div>
        <Badge variant="default">DGPCI</Badge>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-(--color-border) bg-white p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Skoda Octavia · INM-2025-099741</div>
            <div className="text-xs text-(--color-muted-foreground)">Finalizat acum 80 zile · CJ 22 ABC</div>
          </div>
        </div>
        <Badge variant="success">Completat</Badge>
      </div>
    </div>
  );
}
