import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

export interface SessionState {
  session: Session | null
  // Enquanto isLoading é true, ainda não sabemos se existe sessão — evita
  // "piscar" a tela de login antes de confirmar que o usuário já está logado.
  isLoading: boolean
  // O Supabase dispara o evento PASSWORD_RECOVERY quando a pessoa clica no
  // link de "esqueci minha senha" do e-mail — ele cria uma sessão temporária
  // só pra permitir trocar a senha, e não deveria deixar entrar direto no
  // app com ela (ver AuthGate.tsx).
  isPasswordRecovery: boolean
  clearPasswordRecovery: () => void
}

export function useSession(): SessionState {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setIsLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)
      setIsLoading(false)
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
      }
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  return { session, isLoading, isPasswordRecovery, clearPasswordRecovery: () => setIsPasswordRecovery(false) }
}
