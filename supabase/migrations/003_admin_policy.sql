-- ============================================================
-- Kcalix v3 — Policy admin para authorized_emails
-- Execute no SQL Editor do Supabase (Run)
-- ============================================================

-- Permite que apenas o usuario admin leia e escreva em authorized_emails.
-- Substitua 'adilson.matioli@gmail.com' pelo seu email se necessario.

CREATE POLICY "admin_only" ON authorized_emails
  FOR ALL TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'adilson.matioli@gmail.com'
  );
