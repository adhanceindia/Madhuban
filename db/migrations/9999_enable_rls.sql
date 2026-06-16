-- db/migrations/9999_enable_rls.sql
-- Enable RLS on every table. App uses the owner connection (DATABASE_URI) which
-- bypasses RLS; the public anon/authenticated roles are denied (no policies).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'audit_log','blocked_dates','bookings','gallery','inquiries',
    'media','payment_config','reviews','rooms','site_content','users'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated;', t);
  END LOOP;
END $$;

-- Belt-and-suspenders: stop future tables from auto-granting to public roles.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
