import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getProfile } from '../lib/auth'
import type { User, Session, Profile } from '../types/auth'

// Estado global simples sem biblioteca externa
// Compartilhado via modulo — qualquer hook que importe usa o mesmo estado

let _user: User | null = null
let _session: Session | null = null
let _profile: Profile | null = null
let _loading = true
let _listeners: Array<() => void> = []

function notify() {
  _listeners.forEach(fn => fn())
}

// Inicializa a sessao ao carregar o app
supabase.auth.getSession().then(({ data }) => {
  _session = data.session
  _user = data.session?.user ?? null
  _loading = false
  notify()

  if (_user) {
    getProfile(_user.id).then(({ data: profile }) => {
      _profile = profile
      notify()
    })
  }
})

// Escuta mudancas de sessao em tempo real (login, logout, refresh)
supabase.auth.onAuthStateChange((_event, session) => {
  _session = session
  _user = session?.user ?? null

  if (_user) {
    getProfile(_user.id).then(({ data: profile }) => {
      _profile = profile
      notify()
    })
  } else {
    _profile = null
    notify()
  }
})

export function useAuthStore() {
  const [, forceRender] = useState(0)

  useEffect(() => {
    const rerender = () => forceRender(n => n + 1)
    _listeners.push(rerender)
    return () => {
      _listeners = _listeners.filter(fn => fn !== rerender)
    }
  }, [])

  return {
    user: _user,
    session: _session,
    profile: _profile,
    loading: _loading,
    isAdmin: _user?.email === import.meta.env.VITE_ADMIN_EMAIL,
  }
}
