import { useState } from 'react'
import { RevenueEntryForm } from '../features/revenue/RevenueEntryForm'
import { RevenueEntryList } from '../features/revenue/RevenueEntryList'
import { useRevenueCategories } from '../features/revenue/useRevenueCategories'
import { useRevenueEntries } from '../features/revenue/useRevenueEntries'
import { usePaymentMethods } from '../features/paymentMethods/usePaymentMethods'
import type { RevenueEntry } from '../features/revenue/types'
import type { Business } from '../features/business/types'

interface RevenuePageProps {
  business: Business
  // Ver comentário em RevenueEntryForm.tsx — leva pra aba Ajustes, onde
  // agora fica o cadastro de categorias de receita e de formas de pagamento.
  onManageCategories: () => void
}

export function RevenuePage({ business, onManageCategories }: RevenuePageProps) {
  const { categories, isLoading: isLoadingCategories } = useRevenueCategories(business.id)
  const { paymentMethods, isLoading: isLoadingPaymentMethods } = usePaymentMethods(business.id)
  const { entries, isLoading: isLoadingEntries, createEntry, updateEntry, deleteEntry } = useRevenueEntries(business.id)
  const [editingEntry, setEditingEntry] = useState<RevenueEntry | null>(null)

  if (isLoadingCategories || isLoadingPaymentMethods || isLoadingEntries) {
    return <p className="p-4 text-sm text-slate-500">Carregando...</p>
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4 pb-24">
      <h1 className="text-lg font-bold text-slate-900">Receitas</h1>
      <RevenueEntryForm
        key={editingEntry?.id ?? 'new'}
        categories={categories}
        paymentMethods={paymentMethods}
        entryToEdit={editingEntry}
        onCancelEdit={() => setEditingEntry(null)}
        onSubmit={(input) => (editingEntry ? updateEntry(editingEntry.id, input) : createEntry(input))}
        onManageCategories={onManageCategories}
        onManagePaymentMethods={onManageCategories}
      />
      <RevenueEntryList
        entries={entries}
        categories={categories}
        paymentMethods={paymentMethods}
        onEdit={setEditingEntry}
        onDelete={deleteEntry}
      />
    </div>
  )
}
