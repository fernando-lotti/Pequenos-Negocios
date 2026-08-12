import { useSession } from './useSession'
import { AuthScreen } from './AuthScreen'
import { ResetPasswordScreen } from './ResetPasswordScreen'
import { useBusinesses } from '../business/useBusinesses'
import { BusinessOnboarding } from '../business/BusinessOnboarding'
import type { Business, NewBusinessInput } from '../business/types'
import type { User } from '@supabase/supabase-js'

export interface AuthGateContext {
  user: User
  businesses: Business[]
  activeBusiness: Business
  setActiveBusinessId: (id: string) => void
  createBusiness: (input: NewBusinessInput) => Promise<Business>
}

interface AuthGateProps {
  children: (context: AuthGateContext) => React.ReactNode
}

// Porta de entrada do app: garante que só chega no conteúdo de verdade
// (children) quem está logado E já tem pelo menos um negócio cadastrado.
// Nos outros casos, mostra a tela apropriada (login/cadastro, ou a ficha
// inicial de criação do primeiro negócio).
export function AuthGate({ children }: AuthGateProps) {
  const { session, isLoading: isSessionLoading, isPasswordRecovery, clearPasswordRecovery } = useSession()
  const {
    businesses,
    activeBusiness,
    isLoading: isBusinessesLoading,
    error,
    setActiveBusinessId,
    createBusiness,
  } = useBusinesses(session?.user.id ?? null)

  if (isSessionLoading) {
    return <CenteredMessage text="Carregando..." />
  }

  if (!session) {
    return <AuthScreen />
  }

  // Sessão temporária vinda do link de "esqueci minha senha" — trava aqui
  // até a pessoa definir uma senha nova, antes de deixar entrar no app.
  if (isPasswordRecovery) {
    return <ResetPasswordScreen onDone={clearPasswordRecovery} />
  }

  if (isBusinessesLoading) {
    return <CenteredMessage text="Carregando seus negócios..." />
  }

  if (error) {
    return <CenteredMessage text={error} />
  }

  if (!activeBusiness) {
    return <BusinessOnboarding onCreate={async (input) => void (await createBusiness(input))} />
  }

  return (
    <>
      {children({
        user: session.user,
        businesses,
        activeBusiness,
        setActiveBusinessId,
        createBusiness,
      })}
    </>
  )
}

function CenteredMessage({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center text-sm text-slate-600">
      {text}
    </div>
  )
}
