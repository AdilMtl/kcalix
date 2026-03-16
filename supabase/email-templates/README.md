# Kcalix — Email Templates

Templates HTML para os emails transacionais do Supabase.

## Como aplicar

1. Acesse [supabase.com](https://supabase.com) → projeto → **Authentication** → **Email Templates**
2. Selecione o template desejado
3. Cole o HTML do arquivo correspondente
4. Salva — entra em vigor imediatamente

## Templates disponíveis

| Arquivo | Template no Supabase | Assunto |
|---|---|---|
| `invite-user.html` | Invite user | Você foi convidado para o Kcalix 🎉 |
| `reset-password.html` | Reset password | Redefinir sua senha do Kcalix |

## Variáveis Supabase utilizadas

- `{{ .ConfirmationURL }}` — link de confirmação gerado automaticamente

## Notas

- O logo usa `https://kcalix.vercel.app/icon-192.png` — se o domínio mudar, atualizar nos dois arquivos
- Emails usam tabelas HTML (sem flexbox/grid) para compatibilidade máxima com clientes de email
- Fundo escuro `#0a0e18` — mesma cor do app
- Futuro: configurar SMTP customizado via Resend (`@kcalix.app`) quando houver domínio próprio
