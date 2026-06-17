-- db/migrations/9999_enable_rls.sql
-- Enable RLS on every table so the public anon/authenticated PostgREST roles are
-- default-denied (no policies + grants revoked). The app connects as the table
-- OWNER via DATABASE_URI, which bypasses (non-forced) RLS, so it keeps working.
--
-- IMPORTANT: do NOT add `FORCE ROW LEVEL SECURITY` here. FORCE makes RLS apply to
-- the owner too — and with no policies that would return zero rows for the app,
-- causing a production outage. ENABLE + REVOKE is the correct config for an
-- owner-connection app.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'audit_log','blocked_dates','bookings','gallery','inquiries',
    'media','payment_config','reviews','rooms','site_content','users'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated;', t);
  END LOOP;
END $$;

-- Belt-and-suspenders: stop future tables from auto-granting to public roles.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
