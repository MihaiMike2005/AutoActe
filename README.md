# AutoActe — Înmatriculează inteligent

Production-grade web platform that digitalizes the entire Romanian vehicle registration flow. Unifies DGPCI, RAR, ANAF, DGITL and insurers into a single citizen-first wizard powered by Claude Vision OCR.

Built for **Cluj Hackathon 2026 — "Digital Romania"**.

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

| Email | Role | 2FA code |
|---|---|---|
| `cetatean@demo.ro`           | citizen                          | `123456` |
| `functionar.dgpci@demo.ro`   | public servant @ DGPCI Cluj      | `123456` |
| `functionar.rar@demo.ro`     | public servant @ RAR Cluj        | `123456` |
| `dealer@demo.ro`             | dealer user @ Auto Bavaria       | `123456` |
| `admin@demo.ro`              | system admin                     | `123456` |

Password is `Demo2026!` for all.

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

NHTSA, BNR, OpenStreetMap and CAID lookups are real and free — no keys needed.

---

## Layout

```
app/
  (auth)/{login,register,verify-2fa}
  (citizen)/{dashboard,cases,documents,marketplace,profile}
  (servant)/{inbox,cases,analytics}
  (dealer)/{dashboard,batch}
  api/v1/                  # public REST API (OpenAPI-documented)
  api/internal/            # server-side proxies (NHTSA, OCR, voice, …)
  api/webhooks/n8n/        # inbound HMAC-verified webhooks

components/{ui,wizard,ocr,documents,notifications,ledger,shared}
lib/{supabase,api,events,ocr,validators,state-machine,calculators,external-apis,mock,utils}
supabase/migrations/       # 001-011 sql
supabase/functions/        # outbox-flusher, deadline-checker, notification-sender
```

See [CLAUDE.md](CLAUDE.md) for the full project context, [EVENTS.md](EVENTS.md) for the n8n event catalog, [API.md](API.md) for the REST reference, [WEBHOOKS.md](WEBHOOKS.md) for the webhook contract.

---

## Phase status

- [x] Phase 0 — Bootstrap (Next.js 16 + Tailwind v4 + folder structure)
- [x] Phase 1 — Schema + auth + landing
- [x] Phase 2 — Citizen wizard core
- [ ] Phase 3 — Claude Vision OCR
- [ ] Phase 4 — Functionary portal
- [ ] Phase 5 — Marketplace + dealer B2B
- [ ] Phase 6 — Chatbot + voice + push + email
- [ ] Phase 7 — Public API + n8n webhooks
- [ ] Phase 8 — RLS + a11y audit + deploy

---

## Tech stack

Next.js (App Router) · TypeScript strict · Tailwind v4 · Radix-based components · Supabase · Zustand · TanStack Query/Table · React Hook Form + Zod · Framer Motion · `@anthropic-ai/sdk` · ElevenLabs · lucide-react · react-leaflet + OSM · recharts · @react-pdf/renderer · date-fns + date-fns-tz · sonner · xstate

## License

MIT — built for the public good.
