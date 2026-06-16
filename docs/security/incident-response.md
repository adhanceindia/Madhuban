# Incident Response Runbook

This runbook defines how the Madhuban Garden Resort team detects, contains,
eradicates, and recovers from security incidents — and how it communicates during
one. It is intentionally concise and action-oriented.

Primary security contact: **security@madhubangarden.com**
(see [SECURITY.md](../../SECURITY.md) and
[`/.well-known/security.txt`](../../public/.well-known/security.txt)).

---

## 1. Detection

Sources that may surface an incident, in rough priority order:

- **Sentry alerts** — the primary automated signal. An error-rate spike alert rule
  (see Sentry note in [SECURITY.md](../../SECURITY.md)) flags anomalous failures,
  unexpected exceptions, or sudden 4xx/5xx surges.
- **`audit_log` review** — auth events (`auth.login`, `auth.login_failed`,
  `auth.logout`), unexpected role changes, mass deletions, or double-booking flags
  from the iCal sync.
- **Upstash Redis rate-limit signals** — repeated lockouts or throttling on
  `/login`, bookings, inquiry, and payment endpoints indicate brute-force or abuse.
- **Vercel logs / deployment alerts** — runtime errors and traffic anomalies.
- **Payment gateway dashboards** — webhook signature failures, disputed or
  mismatched charges.
- **External report** — a researcher emailing security@madhubangarden.com.

On any credible signal, **declare an incident** and start a timestamped log of
actions taken (who, what, when).

---

## 2. Triage & Severity

| Severity | Examples | Target response |
| --- | --- | --- |
| **SEV-1 Critical** | Active data breach, leaked credentials/secret, payment fraud, full outage. | Immediate — all hands. |
| **SEV-2 High** | Exploitable vuln with no confirmed exploitation, partial outage, single-account compromise. | Within hours. |
| **SEV-3 Low** | Low-impact misconfig, non-exploitable finding. | Next business day. |

Assign an **incident lead** who owns decisions and the comms timeline.

---

## 3. Containment

Move fast to stop the bleeding before eradicating root cause.

- **Compromised staff account:** deactivate the user (`is_active = false`) and
  trigger sign-out-of-all-sessions; force a password reset.
- **Leaked secret / API key:** rotate it immediately (see the key-rotation runbook
  below) and treat any data reachable with that key as exposed.
- **Active exploitation of an endpoint:** tighten or block via rate-limiting; if
  necessary, deploy a hotfix that disables the affected route.
- **Suspected DB compromise:** rotate `DATABASE_URI` credentials and review
  recent `audit_log` writes for tampering.
- **Payment fraud:** disable the affected gateway in `payment_config`
  (`<gateway>_enabled = false`) and switch `active_gateway` if needed.

---

## 4. Key-Rotation Runbook

Rotate the relevant credential, update it in **both** `.env.local` (for local) and
the **Vercel** project environment, then **redeploy** so the new value is picked
up. Lazy service clients read `process.env` at request time, so a redeploy is
required for the change to take effect.

| Secret | Where to rotate | Notes |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → API | High blast radius; rotate first if Supabase is implicated. |
| `DATABASE_URI` | Supabase → Database → reset password | Update connection string + redeploy. |
| `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Razorpay dashboard | Re-register webhook secret. |
| Other gateway secrets (PhonePe/Cashfree/CCAvenue/PayU) | Respective gateway dashboard → `payment_config` | Stored encrypted; re-save via the admin settings/payment page. |
| `RESEND_API_KEY` | Resend dashboard | |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash console | |
| `QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY` | Upstash QStash → API keys | Roll current→next to avoid cron downtime. |
| `ICAL_EXPORT_TOKEN` | Generate `openssl rand -base64 32` | Reissue OTA feed URLs with the new `?token=`. |
| `ENCRYPTION_KEY` | Generate `openssl rand -base64 32` | **Careful:** re-encrypt existing gateway secrets — decrypt with the old key, re-encrypt with the new one before swapping. |
| `SENTRY_DSN` | Sentry project settings | |

After any rotation, confirm the app still functions (login, a booking, a payment
resolve) and that no stale value remains in any environment.

---

## 5. Eradication & Recovery

- Identify and fix the root cause; deploy the patched `main`.
- Verify the vulnerability is closed (reproduce the original attack — it should now
  fail).
- Restore any affected data from backups if integrity was impacted.
- Watch Sentry and `audit_log` closely for recurrence after recovery.

---

## 6. Communication

- **Internal:** keep stakeholders updated through a single incident channel; the
  incident lead owns updates.
- **Affected users:** if personal data was exposed, notify affected individuals
  promptly and clearly (what happened, what data, what they should do).
- **Regulators:** assess statutory breach-notification obligations and report
  within the required timeframe where applicable.
- **Reporter:** if the incident originated from an external report, keep the
  reporter informed of remediation and credit them if they wish.

---

## 7. Post-Incident Review

Within **5 business days** of resolution, hold a blameless retrospective:

- Timeline of detection → containment → recovery.
- Root cause and contributing factors.
- What worked, what didn't.
- Concrete follow-up actions with owners and due dates (e.g. new alert rules,
  additional rate limits, tests).
