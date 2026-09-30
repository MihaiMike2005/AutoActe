# AutoActe Event Catalog

Every state change on a core entity emits a CloudEvents 1.0 envelope. Events land in the `outbox` table inside the same transaction as the state change, then the `outbox-flusher` Edge Function delivers them to all matching `webhook_subscriptions`.

## Envelope

```json
{
  "id": "evt_<uuid>",
  "specversion": "1.0",
  "type": "ro.autoacte.case.created",
  "source": "autoacte.ro",
  "time": "2026-05-23T14:23:00Z",
  "datacontenttype": "application/json",
  "data": { /* see per-type payload below */ }
}
```

## Types

### Case lifecycle

| Type | Triggered by | `data` shape |
|---|---|---|
| `ro.autoacte.case.created` | INSERT on `registration_cases` | `{ case_id, case_number, citizen_id, scenario, status: "draft" }` |
| `ro.autoacte.case.status_changed` | UPDATE of `status` | `{ case_id, case_number, previous_status, status }` |
| `ro.autoacte.case.completed` | `completed_at` set | `{ case_id, case_number, total_paid }` |

### Step lifecycle

| Type | Triggered by | `data` shape |
|---|---|---|
| `ro.autoacte.step.started` | `case_steps.status → 'in_progress'` | `{ case_id, step_code, started_at }` |
| `ro.autoacte.step.completed` | `case_steps.status → 'completed'` | `{ case_id, step_code, completed_at }` |
| `ro.autoacte.step.blocked` | `case_steps.status → 'blocked'` | `{ case_id, step_code, blocker_reason }` |

### Documents

| Type | `data` shape |
|---|---|
| `ro.autoacte.document.uploaded` | `{ document_id, case_id, type, owner_id }` |
| `ro.autoacte.document.ocr_completed` | `{ document_id, confidence, extracted_data }` |
| `ro.autoacte.document.validated` | `{ document_id, case_id, validated_by }` |
| `ro.autoacte.document.rejected` | `{ document_id, case_id, reasons[] }` |

### Payments

| Type | `data` shape |
|---|---|
| `ro.autoacte.payment.initiated` | `{ payment_id, case_id, amount, purpose }` |
| `ro.autoacte.payment.completed` | `{ payment_id, case_id, amount, paid_at }` |

### Appointments

| Type | `data` shape |
|---|---|
| `ro.autoacte.appointment.scheduled` | `{ appointment_id, case_id, organization_id, scheduled_at }` |

### Deadlines (cron)

| Type | `data` shape |
|---|---|
| `ro.autoacte.deadline.warning` | `{ case_id, days_remaining: 60\|30\|7\|1 }` |

### Marketplace

| Type | `data` shape |
|---|---|
| `ro.autoacte.service_order.created` | `{ order_id, service_id, citizen_id, provider_org_id }` |
| `ro.autoacte.service_order.completed` | `{ order_id, rating? }` |

### Batch (dealers)

| Type | `data` shape |
|---|---|
| `ro.autoacte.batch.completed` | `{ batch_id, total, completed, failed }` |

## Subscribing from n8n

1. Open the **HTTP Webhook** node in n8n and copy the generated URL.
2. Inside AutoActe, go to **Settings → Webhooks** → *New subscription*. Paste the URL, pick the events, save.
3. AutoActe signs each delivery with `X-AutoActe-Signature: sha256=<hex>` using your subscription secret. The secret is shown ONCE on creation — store it in n8n credentials.
4. Use the verification snippet from `WEBHOOKS.md` to check the signature.

## Retry policy

Exponential back-off: `1m, 5m, 30m, 2h, 12h` — max 5 attempts. 2xx responses mark the delivery successful. Non-2xx and timeouts (10 s) get retried.
