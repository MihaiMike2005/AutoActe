# AutoActe — Project Context for Claude Code

Production-grade web app digitalizing the Romanian vehicle registration process. Built for Cluj Hackathon 2026 ("Digital Romania" theme). Unifies DGPCI, RAR, ANAF, DGITL and insurers into one citizen-first flow.

## Stack

Next.js 15+ (App Router) · TypeScript strict · Tailwind v4 · shadcn-style components (Radix primitives, built in-tree) · Supabase (Postgres + Auth + Realtime + Storage + Edge Functions) · Zustand · TanStack Query/Table · React Hook Form + Zod · Framer Motion · `@anthropic-ai/sdk` (Claude Vision OCR + assistant) · ElevenLabs (voice guide) · lucide-react · react-leaflet + OSM · recharts · @react-pdf/renderer · date-fns + date-fns-tz · sonner

**Forbidden:** Material UI, Bootstrap, Chakra, multiple icon libs, jQuery, moment.js, Redux/MobX/Recoil, CSS-in-JS (other than Tailwind).

## Local-first mode

Everything works without external services. If `.env.local` is missing keys (`NEXT_PUBLIC_SUPABASE_URL`, `ANTHROPIC_API_KEY`, etc.), `lib/env.ts → integrationStatus` flags drop to `false` and code falls back to in-memory mocks (`lib/mock/demo-data.ts`, `lib/supabase/mock.ts`). UI shows a "Demo Mode" badge on affected surfaces.

Plug real keys into `.env.local` (template at `.env.local.example`) to swap in Supabase, Anthropic, ElevenLabs, Resend.

OCR runs through `POST /api/internal/ocr` (`lib/ocr/`). Without `ANTHROPIC_API_KEY` it returns consistent demo extractions from `lib/ocr/demo-samples.ts`; with a key it calls Claude with structured outputs (model from `ANTHROPIC_OCR_MODEL`, default `claude-sonnet-5-5`). Uploaded files and pending scans live in a `globalThis` store (`lib/ocr/upload-store.ts`) so route handlers and Server Actions share them. Uploads are capped at 8 MB because the proxy buffers only 10 MB of request body.

## Folder map

- `app/(auth|citizen|servant|dealer)/…` — route groups by role
- `app/api/v1/…` — public REST API (versioned, OpenAPI-documented)
- `app/api/internal/…` — server-side proxies (NHTSA, CAID, RAR, BNR, OCR, voice)
- `app/api/webhooks/n8n/[source]/…` — inbound n8n webhooks (HMAC-verified)
- `components/{ui,wizard,ocr,documents,notifications,ledger,shared}/`
- `lib/{supabase,api,events,ocr,validators,state-machine,calculators,external-apis,utils}/`
- `lib/mock/` — local-first demo dataset
- `supabase/migrations/001..011_*.sql` — apply 001-009 + 011 during dev; RLS (010) only at Phase 8
- `supabase/functions/{outbox-flusher,deadline-checker,notification-sender}/` — Edge Functions

## Architecture rules

1. **Event-driven:** every state change in `registration_cases`, `case_steps`, `documents`, `payments` publishes a CloudEvent 1.0 to the `outbox` table (transactional). Worker flushes to `webhook_subscriptions`. n8n attaches here.
2. **Reverse-DNS event types:** `ro.autoacte.<entity>.<action>` — full catalog in `EVENTS.md`.
3. **Public API conventions:** `/api/v1/*`, response envelope `{ data, error, meta }`, `X-Idempotency-Key` for mutations, Bearer JWT or `auak_` API key, cursor pagination (`?cursor=&limit=`), 100 req/min.
4. **Audit ledger:** every mutation goes through `add_audit_entry()` SQL function (SHA-256 hash chain). `verify_audit_chain()` proves integrity. Surfaced at `/ledger`.
5. **RBAC by route group:** middleware checks `profiles.role`; route groups `(citizen)`, `(servant)`, `(dealer)` only render after match.
6. **Never** call external APIs from client — always proxy through `app/api/internal/*`.
7. **Never** put business logic in components — use `lib/*` functions.
8. **Default to no comments.** Add only when the *why* would surprise a reader.

## Demo accounts

| Email | Password | Role | 2FA |
|---|---|---|---|
| cetatean@demo.ro | Demo2026! | citizen | 123456 |
| functionar.dgpci@demo.ro | Demo2026! | public_servant @ DGPCI Cluj | 123456 |
| functionar.rar@demo.ro | Demo2026! | public_servant @ RAR Cluj | 123456 |
| dealer@demo.ro | Demo2026! | dealer_user @ Auto Bavaria | 123456 |
| admin@demo.ro | Demo2026! | system | 123456 |

In demo mode 2FA always accepts `123456`. In Supabase mode the code is sent via email/console.

## Phases (current cursor)

- ✅ Phase 0 — bootstrap, deps, tokens, folder structure
- ✅ Phase 1 — migrations + auth + landing
- ✅ Phase 2 — citizen wizard core
- ✅ Phase 3 — OCR + magic moments (Claude Vision)
- ⏳ Phase 4 — functionary portal
- ⏳ Phase 5 — marketplace + dealer B2B
- ⏳ Phase 6 — chatbot, voice guide, push, email, maps
- ⏳ Phase 7 — public API + webhooks for n8n + OpenAPI
- ⏳ Phase 8 — RLS, accessibility audit, polish, deploy

## Quick commands

```bash
npm run dev        # http://localhost:3000
npm run build
npm run lint
```

PATH note: this dev box uses a portable Node at `~/.local/node/bin`. Either add it to PATH (`export PATH="$HOME/.local/node/bin:$PATH"`) or install Node globally.
