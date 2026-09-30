# AutoActe REST API (v1)

Base URL: `https://<host>/api/v1`

## Auth

Either a Supabase JWT (`Authorization: Bearer <jwt>`) or an API key (`Authorization: Bearer auak_<token>`). Keys are created at **Settings → API Keys**; the full token is shown ONCE on creation — only the SHA-256 hash is stored.

## Response envelope

```json
{
  "data": { "...": "..." } | null,
  "error": { "code": "string", "message": "string", "details": {} } | null,
  "meta": { "request_id": "uuid", "timestamp": "ISO-8601" }
}
```

## Conventions

- **Idempotency:** every mutating endpoint accepts `X-Idempotency-Key: <uuidv4>`. Repeats inside 24 h return the cached response.
- **Pagination:** `?cursor=<opaque>&limit=<n>` (n ≤ 100). Cursor is round-tripped from the previous response's `meta.next_cursor`.
- **Rate limit:** 100 req/min per token. `X-RateLimit-Remaining` header in every response.

## Endpoints

### Cases

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/cases` | List cases owned by token's user/org. |
| `POST` | `/cases` | Create a new case. Body: `{ scenario, vehicle: { vin, … }, citizen_id? }`. |
| `GET`  | `/cases/{id}` | Fetch one case. |
| `PATCH`| `/cases/{id}` | Update status / metadata. Servants only. |
| `POST` | `/cases/{id}/advance` | Mark current step complete, move to next. |

### Documents

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/documents?case_id={id}` | List documents for a case. |
| `POST` | `/documents` | Upload a document (multipart). Body fields: `case_id`, `type`, `file`. |
| `POST` | `/documents/{id}/ocr` | Run Claude Vision OCR (if not already run). |

### Payments

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/payments` | Initiate. Body: `{ case_id, amount, purpose, payment_method }`. |
| `POST` | `/payments/{id}/confirm` | Mark `completed`. |

### Webhooks (admin)

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/webhooks` | List subscriptions. |
| `POST` | `/webhooks` | Create subscription. Body: `{ url, event_types[] }`. Returns secret ONCE. |
| `DELETE` | `/webhooks/{id}` | Revoke. |

### Inbound (from n8n)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/webhooks/n8n/{source}` | n8n calls in. HMAC-verified using `WEBHOOK_SIGNING_SECRET`. |

## Errors

Standard codes: `unauthenticated`, `forbidden`, `not_found`, `invalid_request`, `idempotency_replay`, `rate_limited`, `internal`.

```json
{
  "data": null,
  "error": {
    "code": "invalid_request",
    "message": "vin: must be 17 alphanumeric characters",
    "details": { "field": "vehicle.vin" }
  },
  "meta": { "request_id": "…", "timestamp": "…" }
}
```

OpenAPI 3.1 spec is generated at `/api/v1/openapi.json` — point any client generator (`openapi-typescript`, `oasdiff`, Postman) at it.
