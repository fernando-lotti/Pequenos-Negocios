import { useState } from 'react'
import { CostEntryForm } from '../features/costs/CostEntryForm'
import { CostEntryList } from '../features/costs/CostEntryList'
import { useCostCategories } from '../features/costs/useCostCategories'
import { useCostEntries } from '../features/costs/useCostEntries'
import type { CostEntry } from '../features/costs/types'
import { ConceptTip } from '../features/education/ConceptTip'
import type { Business } from '../features/business/types'

interface CostsPageProps {
  business: Business
  // Ver comentário em CostEntryForm.tsx — leva pra aba Ajustes, onde agora
  // fica o cadastro de categorias de custo.
  onManageCategories: () => void
}

export function CostsPage({ business, onManageCategories }: CostsPageProps) {
  const { categories, isLoading: isLoadingCategories } = useCostCategories(business.id)
  const {
    entries,
    isLoading: isLoadingEntries,
    createEntry,
    createInstallments,
    updateEntry,
    deleteEntry,
  } = useCostEntries(business.id)
  const [editingEntry, setEditingEntry] = useState<CostEntry | null>(null)

  if (isLoadingCategories || isLoadingEntries) {
    return <p className="p-4 text-sm text-slate-500">Carregando...</p>
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4 pb-24">
      <h1 className="text-lg font-bold text-slate-900">Custos</h1>
      <ConceptTip conceptId="capital_de_giro" />
      <CostEntryForm
        key={editingEntry?.id ?? 'new'}
        categories={categories}
        entryToEdit={editingEntry}
        onCancelEdit={() => setEditingEntry(null)}
        onSubmit={(input) => (editingEntry ? updateEntry(editingEntry.id, input) : createEntry(input))}
        onSubmitInstallments={createInstallments}
        onManageCategories={onManageCategories}
      />
      <CostEntryList entries={entries} categories={categories} onEdit={setEditingEntry} onDelete={deleteEntry} />
    </div>
  )
}
