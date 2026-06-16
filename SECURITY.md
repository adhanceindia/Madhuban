# Security Policy

This document covers the security posture, vulnerability-reporting process, and
operational hardening checklist for the **Madhuban Garden Resort** application
(Next.js 15 App Router, Drizzle ORM over Supabase Postgres, Supabase Auth).

---

## Supported Versions

This is a single, continuously deployed application (one production deployment on
Vercel). There are no maintained release branches — **only the currently deployed
`main` branch receives security fixes.**

| Version | Supported |
| --- | --- |
| `main` (production) | ✅ Yes — actively maintained |
| Any previous deployment / commit | ❌ No — upgrade to the latest `main` |

Security patches are rolled forward into `main` and deployed; there is no
back-porting to older revisions.

---

## Reporting a Vulnerability

If you discover a security vulnerability, please report it **privately** — do not
open a public GitHub issue, and do not disclose it publicly until it has been
resolved.

- **Email:** [security@madhubangarden.com](mailto:security@madhubangarden.com)
- A machine-readable contact is also published at
  [`/.well-known/security.txt`](public/.well-known/security.txt).

Please include:

- A description of the vulnerability and its impact.
- Step-by-step reproduction instructions (and a proof-of-concept if available).
- The affected URL(s), endpoint(s), or component(s).
- Any relevant logs, screenshots, or request/response captures.

**What to expect:**

- Acknowledgement of your report within **5 business days**.
- A triage assessment and severity rating.
- Coordinated disclosure — we will keep you updated on remediation progress and
  credit you (if desired) once a fix is deployed.

Please act in good faith: do not access, modify, or exfiltrate data that is not
yours, do not run automated scans that degrade service availability, and give us
a reasonable window to remediate before any disclosure.

---

## Repository Settings — Hardening Checklist

These are **manual, one-time configuration steps** performed in GitHub repository
settings (Settings → Code security, and Settings → Branches). They are operational
and cannot be set from application code — track completion here.

- [ ] **Enable GitHub secret scanning** (Settings → Code security and analysis →
      Secret scanning).
- [ ] **Enable push protection** (Settings → Code security and analysis → Secret
      scanning → Push protection) — blocks commits that contain detected secrets.
- [ ] **Require the CI `build` status check** to pass before merging to `main`
      (Settings → Branches → branch protection rule for `main` → Require status
      checks to pass → select `build`).
- [ ] **Require at least 1 approving review** before merging to `main`
      (Settings → Branches → Require a pull request before merging → Require
      approvals: 1).
- [ ] **Disallow force-pushes to `main`** (Settings → Branches → branch protection
      rule for `main` → leave "Allow force pushes" disabled).

---

## Environment Variable Inventory

The following environment variables are consumed by the application. **Names only —
never commit real values.** Placeholders live in [`.env.example`](.env.example);
real secrets live in `.env.local` (git-ignored) and in the Vercel project's
encrypted environment settings.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URI` | Supabase Postgres connection string (Drizzle). |
| `PAYLOAD_SECRET` | Legacy / inert — retained placeholder only. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public). |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-only). |
| `RAZORPAY_KEY_ID` | Razorpay public key id. |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret. |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signature secret. |
| `RESEND_API_KEY` | Resend transactional-email API key. |
| `ADMIN_EMAIL` | Destination for admin notification emails. |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (rate limiting / cache). |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token. |
| `QSTASH_CURRENT_SIGNING_KEY` | Upstash QStash signing key (cron verification). |
| `QSTASH_NEXT_SIGNING_KEY` | Upstash QStash rotation signing key. |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | Google Places API key (public). |
| `ICAL_EXPORT_TOKEN` | Secret token gating the public iCal `.ics` export feed. |
| `ENCRYPTION_KEY` | AES-256-GCM key (32 bytes, base64) for stored gateway secrets. |
| `SENTRY_DSN` | Sentry error-monitoring DSN (see note below). |

Additional payment-gateway credentials (PhonePe, Cashfree, CCAvenue, PayU) are
stored encrypted in the `payment_config` table rather than as environment
variables.

---

## Error Monitoring (Sentry) — Recommended Manual Install

Production error monitoring via **Sentry** is a recommended hardening step that is
**deferred from Task 15** of the security remediation plan and must be installed
manually:

```bash
npm i @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Then set the `SENTRY_DSN` environment variable (placeholder already present in
[`.env.example`](.env.example)) in `.env.local` and in Vercel, and configure an
alert rule for error-rate spikes. Sentry is the primary detection signal referenced
in [docs/security/incident-response.md](docs/security/incident-response.md).

---

## Further Reading

- [Data Retention Policy](docs/security/data-retention.md)
- [Incident Response Runbook](docs/security/incident-response.md)
- [Privacy Controls](docs/security/privacy-controls.md)
