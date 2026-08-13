import { useMemo } from 'react'
import { Card } from '../components/Card'
import { PrimaryButton } from '../components/PrimaryButton'
import { BUSINESS_TYPE_INFO } from '../features/business/businessTypePresets'
import { MonthlyGoalForm } from '../features/business/MonthlyGoalForm'
import { CostCategoryManager } from '../features/costs/CostCategoryManager'
import { useCostCategories } from '../features/costs/useCostCategories'
import { useCostEntries } from '../features/costs/useCostEntries'
import { PaymentMethodManager } from '../features/paymentMethods/PaymentMethodManager'
import { usePaymentMethods } from '../features/paymentMethods/usePaymentMethods'
import { RevenueCategoryManager } from '../features/revenue/RevenueCategoryManager'
import { useRevenueCategories } from '../features/revenue/useRevenueCategories'
import { useRevenueEntries } from '../features/revenue/useRevenueEntries'
import { supabase } from '../lib/supabase'
import type { Business, MonthlyGoalInput } from '../features/business/types'

interface SettingsPageProps {
  business: Business
  userEmail: string
  onSaveMonthlyGoal: (businessId: string, goal: MonthlyGoalInput | null) => Promise<unknown>
}

// O cadastro de categorias (de custo e de receita) mora aqui, em vez de
// dentro das telas de Custos/Receitas, porque é uma tarefa de configuração
// do negócio, não do dia a dia de lançar valores — os formulários de
// lançamento levam pra cá através da opção "+ Nova categoria" (ver
// CostEntryForm.tsx e RevenueEntryForm.tsx).
export function SettingsPage({ business, userEmail, onSaveMonthlyGoal }: SettingsPageProps) {
  const {
    categories: costCategories,
    isLoading: isLoadingCostCategories,
    createCategory: createCostCategory,
    updateCategory: updateCostCategory,
    deleteCategory: deleteCostCategory,
  } = useCostCategories(business.id)
  const { entries: costEntries, isLoading: isLoadingCostEntries } = useCostEntries(business.id)

  const {
    categories: revenueCategories,
    isLoading: isLoadingRevenueCategories,
    createCategory: createRevenueCategory,
    updateCategory: updateRevenueCategory,
    deleteCategory: deleteRevenueCategory,
  } = useRevenueCategories(business.id)
  const { entries: revenueEntries, isLoading: isLoadingRevenueEntries } = useRevenueEntries(business.id)

  const {
    paymentMethods,
    isLoading: isLoadingPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  } = usePaymentMethods(business.id)

  const usedCostCategoryIds = useMemo(
    () => new Set(costEntries.map((entry) => entry.costCategoryId).filter((id): id is string => id !== null)),
    [costEntries],
  )
  const usedRevenueCategoryIds = useMemo(
    () => new Set(revenueEntries.map((entry) => entry.revenueCategoryId).filter((id): id is string => id !== null)),
    [revenueEntries],
  )
  const usedPaymentMethodIds = useMemo(
    () => new Set(revenueEntries.map((entry) => entry.paymentMethodId).filter((id): id is string => id !== null)),
    [revenueEntries],
  )

  const isLoading =
    isLoadingCostCategories ||
    isLoadingCostEntries ||
    isLoadingRevenueCategories ||
    isLoadingRevenueEntries ||
    isLoadingPaymentMethods

  if (isLoading) {
    return <p className="p-4 text-sm text-slate-500">Carregando...</p>
  }

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

      <MonthlyGoalForm business={business} onSave={onSaveMonthlyGoal} />

      <CostCategoryManager
        categories={costCategories}
        usedCategoryIds={usedCostCategoryIds}
        onCreate={createCostCategory}
        onUpdate={updateCostCategory}
        onDelete={deleteCostCategory}
      />

      <RevenueCategoryManager
        categories={revenueCategories}
        usedCategoryIds={usedRevenueCategoryIds}
        onCreate={createRevenueCategory}
        onUpdate={updateRevenueCategory}
        onDelete={deleteRevenueCategory}
      />

      <PaymentMethodManager
        paymentMethods={paymentMethods}
        usedPaymentMethodIds={usedPaymentMethodIds}
        onCreate={createPaymentMethod}
        onUpdate={updatePaymentMethod}
        onDelete={deletePaymentMethod}
      />

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
