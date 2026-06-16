# Privacy Controls

This document describes the personal data (PII) that Madhuban Garden Resort
collects and stores, the lawful basis for processing it, and the procedure for
handling data-subject requests (access, correction, deletion).

See also: [data-retention.md](data-retention.md) for how long each category is kept
and [incident-response.md](incident-response.md) for breach handling.

---

## What PII Is Stored

| Data subject | Personal data | Table |
| --- | --- | --- |
| **Guests** | Name, email, phone, booking dates, room selection, payment status / transaction references | `bookings` |
| **Event / wedding leads** | Name, email, phone, event details, message | `inquiries` |
| **Reviewers** | Reviewer name, review text, rating | `reviews` |
| **Staff** | Name, email, role; authentication identity in Supabase Auth (`users.auth_id` links to it) | `users` (+ Supabase Auth) |
| **All staff actions** | Actor id, action, before/after values (secrets redacted) | `audit_log` |
| **Uploads** | File metadata; uploaded media may incidentally contain personal images | `media` (objects in Supabase S3) |

**Payment card data is never stored by this application.** Card details are handled
entirely by the PCI-compliant payment gateways (Razorpay, PhonePe, Cashfree,
CCAvenue, PayU); we store only gateway transaction references and status.

Stored gateway *credentials* (not cardholder data) are encrypted at rest in
`payment_config` using AES-256-GCM (`ENCRYPTION_KEY`). Audit-log diffs redact known
secret keys (`*_secret`, `*_key`, `*_password`, `working_key`, `salt`).

---

## Lawful Basis for Processing

| Processing purpose | Lawful basis |
| --- | --- |
| Creating and managing a booking; sending booking confirmations | **Contract** — processing is necessary to provide the reservation the guest requested. |
| Responding to event/wedding inquiries | **Legitimate interest** (responding to a request the individual initiated) / pre-contract steps. |
| Retaining booking/invoice records for 7 years | **Legal obligation** — tax and accounting record-keeping. |
| Security audit logging and rate limiting | **Legitimate interest** — protecting the service and its users. |
| Publishing guest reviews | **Consent** — reviews are published only with the reviewer's agreement. |
| Staff account management | **Contract / legitimate interest** — operating the business. |

Marketing communications, where applicable, are sent only on the basis of
**consent**, and recipients can opt out at any time.

---

## Data-Subject Rights

Individuals may request: **access** to their data, **correction** of inaccurate
data, **deletion** ("right to be forgotten"), and a **copy** of their data
(portability). Requests are received at **security@madhubangarden.com** and should
be acknowledged within **5 business days** and fulfilled within **30 days**.

### Verifying the requester

Before acting, **verify the requester's identity** to ensure data is not disclosed
to or deleted by the wrong person — e.g. confirm control of the email address on
file and match it against booking/inquiry records.

### Deletion Procedure

1. **Locate** all records for the data subject across `bookings`, `inquiries`,
   `reviews`, and any related `media`, matched by email (and corroborated by name /
   phone).
2. **Inquiries, reviews, orphaned media:** these have no statutory retention need
   — **hard-delete** the rows / objects.
3. **Bookings within the 7-year financial window:** do **not** hard-delete.
   **Anonymise** the directly identifying fields instead — replace guest name with
   a placeholder (e.g. `Redacted Guest`), and null/scrub email and phone — while
   retaining the booking/invoice row and its financial figures for tax compliance.
   Document why the row was retained.
4. **Bookings older than 7 years:** may be fully deleted per the retention policy.
5. **Staff accounts:** deactivate (`is_active = false`) rather than delete to
   preserve `audit_log` foreign keys; anonymise the staff member's name/email on a
   verified erasure request once they have left.
6. **Auth identity:** delete the corresponding Supabase Auth user where the
   individual is being fully erased and no record must reference them.
7. **Log the action** — record the fulfilled request in `audit_log`
   (`action: 'privacy.erasure'`) without storing the now-deleted PII.
8. **Confirm** completion to the requester in writing.

### Access / Portability Procedure

Compile the individual's records from the tables above into a human-readable export
(e.g. JSON or PDF), exclude any third-party personal data, and deliver it through a
secure channel to the verified requester.

---

## Data Sharing & Sub-Processors

Personal data is shared only with the sub-processors required to run the service:

- **Supabase** — database, authentication, and file storage.
- **Vercel** — application hosting.
- **Payment gateways** (Razorpay, PhonePe, Cashfree, CCAvenue, PayU) — payment
  processing.
- **Resend** — transactional email delivery.
- **Upstash** — Redis (rate limiting) and QStash (scheduled jobs).
- **Google** — Places API (public site features).
- **Sentry** (recommended) — error monitoring; configured to avoid sending PII in
  event payloads.

Data is not sold or shared for unrelated purposes.

---

## Review Cadence

This document is reviewed **annually** and whenever a new category of personal data
or a new sub-processor is introduced.
