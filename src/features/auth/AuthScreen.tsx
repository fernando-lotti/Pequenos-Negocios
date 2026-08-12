import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { fieldClass, labelClass } from '../../components/Field'
import { PrimaryButton } from '../../components/PrimaryButton'

// Login e cadastro usam o Auth nativo do Supabase (ver SECURITY.md: nunca
// implementar autenticação "na mão"). Este componente só chama a API e
// traduz os erros mais comuns para português.
export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function switchMode(newMode: typeof mode) {
    setMode(newMode)
    setError('')
    setInfo('')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setInfo('')
    setIsSubmitting(true)

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError
        setInfo('Conta criada! Se a confirmação por e-mail estiver ativa, confira sua caixa de entrada antes de entrar.')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      }
    } catch (submitError) {
      console.error('Erro de autenticação:', submitError)
      setError(translateAuthError(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleForgotPassword(event: FormEvent) {
    event.preventDefault()
    setError('')
    setInfo('')
    setIsSubmitting(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      })
      if (resetError) throw resetError
      // Mensagem igual dê certo ou não o e-mail existir — não é bom revelar
      // pra quem está tentando se algum e-mail tem conta cadastrada ou não.
      setInfo('Se esse e-mail tiver uma conta, enviamos um link de recuperação. Confira sua caixa de entrada (e o spam).')
    } catch (resetError) {
      console.error('Erro ao pedir recuperação de senha:', resetError)
      setError('Não foi possível enviar o link agora. Tente novamente em instantes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (mode === 'forgot') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-sm">
          <BrandHeader />

          <form onSubmit={handleForgotPassword} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="forgot-email" className={labelClass}>
                E-mail
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={fieldClass}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {info && <p className="text-sm text-emerald-700">{info}</p>}

            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
            </PrimaryButton>
          </form>

          <button
            type="button"
            onClick={() => switchMode('login')}
            className="mt-6 w-full text-center text-sm text-slate-600 underline hover:text-slate-900"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <BrandHeader />

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className={labelClass}>
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className={labelClass}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={fieldClass}
            />
          </div>

          {mode === 'login' && (
            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className="self-start text-xs text-slate-600 underline hover:text-slate-900"
            >
              Esqueci minha senha
            </button>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-emerald-700">{info}</p>}

          <PrimaryButton type="submit" disabled={isSubmitting}>
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </PrimaryButton>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            className="font-semibold text-slate-900 underline"
          >
            {mode === 'login' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  )
}

function BrandHeader() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-2xl">💼</div>
      <p className="text-2xl font-bold text-slate-900">Pequenos Negócios</p>
      <p className="mt-2 text-sm text-slate-600">Entenda de verdade quanto você ganha.</p>
    </div>
  )
}

function translateAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)

  if (message.includes('Invalid login credentials')) {
    return 'E-mail ou senha incorretos.'
  }
  if (message.includes('User already registered')) {
    return 'Já existe uma conta com esse e-mail. Tente entrar em vez de criar uma nova.'
  }
  if (message.includes('Password should be at least')) {
    return 'A senha precisa ter pelo menos 6 caracteres.'
  }
  return 'Não foi possível completar a operação. Tente novamente em instantes.'
}
