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
  // Marca o email como convidado na tabela (o convite real e enviado
  // manualmente pelo painel do Supabase: Authentication > Users > Invite user)
  return supabase
    .from('authorized_emails')
    .update({ invited_at: new Date().toISOString() })
    .eq('email', email.toLowerCase().trim())
}
