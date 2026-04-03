# QStash Setup

Cron jobs have been migrated from Vercel Cron to Upstash QStash.
Register each route below as a **Schedule** in the [Upstash QStash dashboard](https://console.upstash.com/qstash).

---

## Scheduled Routes

| Route | Original Vercel schedule | Cron expression |
|---|---|---|
| `POST /api/cron/sync-ical` | Every 30 minutes | `*/30 * * * *` |

---

## How to register a schedule

1. Open the Upstash dashboard → **QStash** → **Schedules** → **Create Schedule**.
2. Set **URL** to your production domain + the route path, e.g.:
   ```
   https://madhubangarden.com/api/cron/sync-ical
   ```
3. Set the **Cron** field to the expression from the table above.
4. Save. QStash will POST to the URL on that schedule and include a signed `Upstash-Signature` header that the handler verifies automatically.

---

## Required environment variables

Add these to your Vercel project environment variables (and `.env.local` for local testing):

```
QSTASH_CURRENT_SIGNING_KEY=   # from Upstash dashboard → QStash → API Keys
QSTASH_NEXT_SIGNING_KEY=      # from Upstash dashboard → QStash → API Keys
```

The `CRON_SECRET` variable is no longer needed and can be removed.

---

## Local development

QStash cannot reach `localhost`. To test the handler locally, temporarily bypass
signature verification by hitting the route with a tool like `curl`:

```bash
curl -X POST http://localhost:3000/api/cron/sync-ical
```

In production, all calls go through QStash and the signature is verified automatically
by `verifySignatureAppRouter` from `@upstash/qstash/nextjs`.
