import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { fieldClass, labelClass } from '../../components/Field'
import { PrimaryButton } from '../../components/PrimaryButton'

interface ResetPasswordScreenProps {
  onDone: () => void
}

// Tela que aparece só quando o Supabase confirma que a sessão veio de um
// link de "esqueci minha senha" (ver useSession.ts) — trava aqui até a
// pessoa definir uma senha nova.
export function ResetPasswordScreen({ onDone }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      onDone()
    } catch (submitError) {
      console.error('Erro ao trocar senha:', submitError)
      setError('Não foi possível trocar a senha agora. Tente novamente em instantes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <p className="text-center text-xl font-bold text-slate-900">Defina sua nova senha</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="new-password" className={labelClass}>
              Nova senha
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={fieldClass}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
          </PrimaryButton>
        </form>
      </div>
    </div>
  )
}
