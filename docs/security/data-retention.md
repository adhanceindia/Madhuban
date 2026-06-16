# Data Retention Policy

This policy defines how long Madhuban Garden Resort retains operational and
personal data, and the mechanism used to purge data past its retention window. It
exists to satisfy data-minimisation principles: we keep personal data only as long
as there is a legitimate operational, financial, or legal need.

See also: [privacy-controls.md](privacy-controls.md) for the PII inventory and
data-subject rights, and [incident-response.md](incident-response.md) for breach
handling.

---

## Retention Windows

| Data | Table | Retention window | Rationale |
| --- | --- | --- | --- |
| **Bookings** | `bookings` | **7 years** after checkout / cancellation | Financial records (GST invoices, payment reconciliation) must be retained for statutory tax/accounting purposes. |
| **Inquiries** | `inquiries` | **12 months** after last status change | Event/wedding leads are sales records with no statutory retention need; purged once stale. |
| **Audit logs** | `audit_log` | **24 months** | Security forensics and incident investigation; long enough to cover an audit cycle, short enough to limit exposure. |
| **Reviews** | `reviews` | Indefinite while published; **12 months** after unpublish | Published content is operational; unpublished/rejected reviews are purged. |
| **Blocked dates** | `blocked_dates` | **12 months** after the blocked end-date | Past calendar blocks (manual + OTA iCal) have no ongoing value. |
| **Media** | `media` | While referenced; orphans purged after **3 months** | Storage hygiene for Supabase S3 objects no longer linked to any entity. |
| **Staff accounts** | `users` | Deactivated (`is_active = false`), not deleted | Preserve audit-log foreign keys; PII can be anonymised on request (see privacy-controls.md). |

> **Note on bookings vs. PII:** the 7-year window applies to the *financial
> record*. Where a guest exercises a deletion request before that window elapses,
> directly identifying PII fields (guest name, email, phone) are **anonymised**
> while the booking/invoice row itself is retained for tax compliance. See the
> data-subject deletion procedure in [privacy-controls.md](privacy-controls.md).

---

## Periodic Purge Job Design

Retention is enforced by a scheduled **QStash cron** job that runs a server route
which deletes rows past their window. This mirrors the existing iCal sync cron
pattern (`app/api/cron/sync-ical`).

### Mechanism

- **Schedule:** QStash cron, **daily** (e.g. `0 3 * * *`, off-peak).
- **Endpoint:** a new authenticated route, e.g. `app/api/cron/purge/route.ts`.
- **Auth:** verify the QStash signing keys (`QSTASH_CURRENT_SIGNING_KEY` /
  `QSTASH_NEXT_SIGNING_KEY`) exactly as the iCal cron does — reject any request
  whose signature does not validate.
- **Action:** within the handler, query Drizzle directly (no REST-to-REST) and
  delete rows whose age exceeds the configured window.

### Reference logic (illustrative)

```ts
// Purge inquiries older than 12 months.
const cutoff = new Date()
cutoff.setMonth(cutoff.getMonth() - 12)

await getDb()
  .delete(inquiries)
  .where(lt(inquiries.updated_at, cutoff))
```

Apply the analogous cutoff per table:

- `inquiries` — delete where `updated_at` < now − 12 months.
- `audit_log` — delete where `created_at` < now − 24 months.
- `blocked_dates` — delete where `end_date` < now − 12 months.
- `bookings` — **anonymise** (do not hard-delete) PII fields where
  `checkout_date` < now − 7 years; the row is retained for accounting.

### Operational notes

- Each purge run should **write an `audit_log` entry** summarising counts deleted
  per table (`action: 'data.purge'`), so retention enforcement is itself auditable.
- The job must be **idempotent** and safe to re-run — it only deletes rows already
  past their cutoff.
- Batch large deletes to avoid long transactions (e.g. `LIMIT`/loop) if table
  volumes grow.
- Retention windows are configuration, not magic numbers — surface them as named
  constants so they can be reviewed and adjusted with legal/finance sign-off.

---

## Review Cadence

This policy is reviewed **annually**, or whenever a new category of personal data
is introduced. Changes to retention windows require sign-off from the data owner.
