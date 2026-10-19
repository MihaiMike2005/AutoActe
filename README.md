# AutoActe — Înmatriculează inteligent

AutoActe is a working prototype of a unified, citizen-first flow for registering a vehicle in Romania. The real process spans DGPCI, RAR, ANAF, DGITL and an insurer; AutoActe models that whole journey as one guided wizard. You photograph your documents, Claude Vision fills in the fields, and the app keeps track of the legal deadline and the costs. The institutions themselves are not integrated: their steps are modelled with demo data.

**Background:** started at Cluj Hackathon (May 2026).

---

## Quick start

```bash
# Node 20+ required. This box ships a portable copy at ~/.local/node.
export PATH="$HOME/.local/node/bin:$PATH"

cp .env.local.example .env.local   # optional — see "Local-first" below
npm install
npm run dev                        # http://localhost:3000
```

### Demo accounts

| Email | Role | 2FA code | Status |
|---|---|---|---|
| `cetatean@demo.ro`           | citizen                          | `123456` | working |
| `functionar.dgpci@demo.ro`   | public servant @ DGPCI Cluj      | `123456` | portal not built yet |
| `functionar.rar@demo.ro`     | public servant @ RAR Cluj        | `123456` | portal not built yet |
| `dealer@demo.ro`             | dealer user @ Auto Bavaria       | `123456` | portal not built yet |
| `admin@demo.ro`              | system admin                     | `123456` | portal not built yet |

Password is `Demo2026!` for all. In local-first mode, the **Încearcă demo-ul** button on the landing page signs you in as the citizen in one click.

---

## Local-first mode

If you don't fill `.env.local`, the app runs entirely against an in-memory mock dataset (5 organisations, 10+ marketplace services, 3 demo cases, a working 2FA flow, etc.). Every surface that *would* hit an external service shows a small **Demo Mode** badge.

Plug in real keys to swap each integration independently:

| Integration | Env vars | Falls back to |
|---|---|---|
| Supabase (DB + Auth) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | in-memory store |
| Claude Vision (OCR) | `ANTHROPIC_API_KEY` | pre-baked OCR samples |
| ElevenLabs (voice)  | `ELEVENLABS_API_KEY` | Web Speech API |
| Resend (email)      | `RESEND_API_KEY`     | logged to console |

NHTSA (VIN decode) and BNR (exchange rate) lookups are real and free — no keys needed.

---

## What's built

- **Citizen flow** — `/register`, `/login`, `/verify-2fa`, `/dashboard`, `/cases/new` and `/cases/[caseId]`: a step-by-step wizard per registration scenario (new, used, imported from the EU or outside it), with the 90-day legal deadline for imported vehicles always visible (`lib/state-machine/wizard.ts`).
- **Claude Vision OCR** — `POST /api/internal/ocr` (`lib/ocr/`) extracts fields from document photos, autofills the case and cross-checks the VIN across documents. Without `ANTHROPIC_API_KEY` it returns demo samples.
- **VIN decode** via NHTSA (`/api/internal/vin-decode`) and the **BNR exchange rate** (`/api/internal/bnr-rate`).
- **Cost and annual tax calculators** — `lib/calculators/costuri.ts` and `impozit.ts` (art. 470 Cod Fiscal).
- **CloudEvents** emitted for document events (`lib/events/publish.ts`).
- **Database design** — `supabase/migrations` 001-011, including the hash-chained audit ledger (008) and the outbox (009). Schema only; no UI on top yet.

Auth is demo-only: `lib/auth/actions.ts` checks credentials against the demo profiles.

## What's next

- Clerk (public servant) portal
- Dealer portal
- Service marketplace
- `/ledger` verification page
- Public REST API (`/api/v1`) and n8n webhooks
- Supabase Edge Functions
- Voice guide and chatbot
- RCA and ITP checks

---

## Layout

```
app/
  (auth)/{login,register,verify-2fa}
  (citizen)/{dashboard,cases}       # planned: documents, marketplace, profile
  (servant)/{inbox,cases,analytics} # planned (clerk portal)
  (dealer)/{dashboard,batch}        # planned (dealer portal)
  ledger/                           # planned
  api/internal/                     # server-side proxies: ocr, vin-decode, bnr-rate, documents
                                    # planned: rca-check, itp-check, voice
  api/v1/                           # planned: public REST API (OpenAPI-documented)
  api/webhooks/n8n/                 # planned: inbound HMAC-verified webhooks

components/{ui,auth,wizard,ocr,shared}   # planned: documents, notifications, ledger
lib/{auth,cases,calculators,events,ocr,state-machine,supabase,validators,mock}   # planned: api, external-apis
supabase/migrations/       # 001-011 sql
supabase/functions/        # planned: outbox-flusher, deadline-checker, notification-sender
```

[EVENTS.md](EVENTS.md) is the event catalog (only the document events are emitted so far); [API.md](API.md) and [WEBHOOKS.md](WEBHOOKS.md) are design docs for the planned REST API and webhook contract.

---

## Tech stack

Next.js (App Router) · TypeScript strict · Tailwind v4 · Radix-based components · Supabase · Zustand · TanStack Query/Table · React Hook Form + Zod · Framer Motion · `@anthropic-ai/sdk` · ElevenLabs · lucide-react · react-leaflet + OSM · recharts · @react-pdf/renderer · date-fns + date-fns-tz · sonner · xstate
