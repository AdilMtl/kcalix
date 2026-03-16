-- Kcalix v3 — Migration 012: admin features
-- Adiciona coluna `ativo` em authorized_emails para controle de acesso
-- Rollback: ALTER TABLE authorized_emails DROP COLUMN IF EXISTS ativo;

ALTER TABLE authorized_emails
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;

-- DEFAULT true preserva todos os usuários existentes como ativos.
-- Quando ativo = false, o guard de rota bloqueia o login com mensagem clara.
