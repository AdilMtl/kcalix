import { supabase } from './supabase'

const SITE_URL = import.meta.env.VITE_SITE_URL ?? window.location.origin

// ── Autenticacao ────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/set-password`,
  })
}

export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword })
}

export async function getSession() {
  return supabase.auth.getSession()
}

export async function getProfile(userId: string) {
  return supabase.from('profiles').select('*').eq('id', userId).single()
}

// ── Admin: emails autorizados ───────────────────────────────
// Acesso protegido por RLS — so o admin (policy "admin_only") consegue operar

export async function listAuthorizedEmails() {
  return supabase
    .from('authorized_emails')
    .select('*')
    .order('created_at', { ascending: false })
}

export async function addAuthorizedEmail(email: string) {
  return supabase
    .from('authorized_emails')
    .insert({ email: email.toLowerCase().trim() })
    .select()
    .single()
}

export async function removeAuthorizedEmail(id: string) {
  return supabase.from('authorized_emails').delete().eq('id', id)
}

export async function markAsInvited(email: string) {
  return supabase
    .from('authorized_emails')
    .update({ invited_at: new Date().toISOString() })
    .eq('email', email.toLowerCase().trim())
}

export async function inviteUser(email: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke('invite-user', {
    body: { email },
  })
  if (error) return { ok: false, error: error.message }
  if (data?.error) return { ok: false, error: data.error }
  return { ok: true }
}

export async function setUserAtivo(email: string, ativo: boolean) {
  return supabase
    .from('authorized_emails')
    .update({ ativo })
    .eq('email', email.toLowerCase().trim())
}

export async function checkUserAtivo(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('authorized_emails')
    .select('ativo')
    .eq('email', email.toLowerCase().trim())
    .single()
  // 403 = usuário normal sem acesso à tabela (RLS admin_only) — tratar como ativo
  // Só bloqueamos quando conseguimos ler e o campo é explicitamente false
  if (error) return true
  if (!data) return true
  return data.ativo !== false
}
