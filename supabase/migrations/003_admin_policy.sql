-- ============================================================
-- Kcalix v3 — Policy admin para authorized_emails
-- Execute no SQL Editor do Supabase (Run)
-- ============================================================

-- Permite que apenas o usuario admin leia e escreva em authorized_emails.
-- Usa auth.jwt() ->> 'email' em vez de SELECT FROM auth.users
-- (auth.users não é acessível pelo role authenticated dentro de policies)

DROP POLICY IF EXISTS "admin_only" ON authorized_emails;

CREATE POLICY "admin_only" ON authorized_emails
  FOR ALL TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'adilson.matioli@gmail.com'
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'adilson.matioli@gmail.com'
  );
