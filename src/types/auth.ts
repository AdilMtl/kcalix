import type { User, Session } from '@supabase/supabase-js'

export type { User, Session }

export interface Profile {
  id: string
  nome: string | null
  plano: 'free' | 'premium'
  created_at: string
  updated_at: string
}

export interface AuthorizedEmail {
  id: string
  email: string
  invited_at: string | null
  accepted_at: string | null
  created_at: string
}

export interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  error: string | null
}
