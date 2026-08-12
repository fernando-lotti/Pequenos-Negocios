import { Card } from '../components/Card'
import { PrimaryButton } from '../components/PrimaryButton'
import { BUSINESS_TYPE_INFO } from '../features/business/businessTypePresets'
import { supabase } from '../lib/supabase'
import type { Business } from '../features/business/types'

interface SettingsPageProps {
  business: Business
  userEmail: string
}

export function SettingsPage({ business, userEmail }: SettingsPageProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4 pb-24">
      <h1 className="text-lg font-bold text-slate-900">Ajustes</h1>

      <Card>
        <p className="text-sm text-slate-500">Negócio ativo</p>
        <p className="font-semibold text-slate-900">{business.name}</p>
        <p className="text-sm text-slate-600">{BUSINESS_TYPE_INFO[business.businessType].title}</p>
        <p className="mt-2 text-xs text-slate-500">
          Pra adicionar outro negócio, use o botão "+ Novo negócio" no topo da tela.
        </p>
      </Card>

      <Card>
        <p className="text-sm text-slate-500">Conta</p>
        <p className="text-sm text-slate-900">{userEmail}</p>
        <PrimaryButton variant="secondary" className="mt-3" onClick={() => supabase.auth.signOut()}>
          Sair da conta
        </PrimaryButton>
      </Card>
    </div>
  )
}
