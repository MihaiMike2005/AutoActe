# AutoActe Webhooks

## Outbound (AutoActe → n8n / your system)

### Subscribe

```http
POST /api/v1/webhooks
Authorization: Bearer auak_…
Content-Type: application/json

{
  "url": "https://your-host/webhooks/in",
  "event_types": [
    "ro.autoacte.case.created",
    "ro.autoacte.step.completed",
    "ro.autoacte.document.validated"
  ]
}
```

Response (returned **once** — the secret is never shown again):

```json
{
  "data": {
    "id": "sub_…",
    "secret": "whsec_…",
    "url": "https://your-host/webhooks/in",
    "event_types": [ "..." ]
  }
}
```

### Delivery

Each delivery is a POST with headers:

```
Content-Type: application/json
X-AutoActe-Event-Id:   evt_…
X-AutoActe-Event-Type: ro.autoacte.case.created
X-AutoActe-Signature:  sha256=<hex>
X-AutoActe-Timestamp:  1716470400
```

The body is the full CloudEvents envelope (see `EVENTS.md`).

### Verify the signature

```ts
import { createHmac, timingSafeEqual } from "node:crypto";

function verify(body: string, signature: string, secret: string) {
  const expected = "sha256=" + createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
```

### Retries

`1m → 5m → 30m → 2h → 12h`, max 5 attempts. After the final failure the subscription stays active but the delivery is logged in `webhook_deliveries` for replay.

### Sample n8n workflow

1. **Webhook node** (POST, mode `Last node responds`). Copy the production URL.
2. **Function node** — verify signature using the snippet above.
3. **Switch node** — branch by `X-AutoActe-Event-Type` header.
4. **HTTP Request node** — POST back to AutoActe `/api/v1/cases/{id}` etc.

## Inbound (n8n → AutoActe)

```http
POST /api/webhooks/n8n/{source}
X-N8N-Signature: sha256=<hex>
Content-Type: application/json

{ "...": "..." }
```

`{source}` is a slug you choose per workflow (e.g. `dgpci-sync`, `rar-status`). AutoActe verifies the signature with `WEBHOOK_SIGNING_SECRET` (configured in env). The body is forwarded to a handler in `lib/webhooks/n8n/<source>.ts`.
