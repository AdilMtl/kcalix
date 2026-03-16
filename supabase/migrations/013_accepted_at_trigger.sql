-- ============================================================
-- Kcalix v3 — Migration 013: preencher accepted_at automaticamente
-- Quando o usuário convidado define a senha, marca accepted_at
-- em authorized_emails com o timestamp atual.
-- Execute no SQL Editor do Supabase (Run)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_user_confirmed()
RETURNS trigger AS $$
BEGIN
  -- Preenche accepted_at quando o usuário confirma o email (define a senha via convite)
  -- email_confirmed_at é preenchido pelo Supabase quando o usuário clica no link do convite
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.authorized_emails
    SET accepted_at = now()
    WHERE email = NEW.email
      AND accepted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_user_confirmed ON auth.users;
CREATE TRIGGER on_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_confirmed();
