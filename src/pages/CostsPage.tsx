import { useMemo, useState } from 'react'
import { CostCategoryManager } from '../features/costs/CostCategoryManager'
import { CostEntryForm } from '../features/costs/CostEntryForm'
import { CostEntryList } from '../features/costs/CostEntryList'
import { useCostCategories } from '../features/costs/useCostCategories'
import { useCostEntries } from '../features/costs/useCostEntries'
import type { CostEntry } from '../features/costs/types'
import { ConceptTip } from '../features/education/ConceptTip'
import type { Business } from '../features/business/types'

interface CostsPageProps {
  business: Business
}

export function CostsPage({ business }: CostsPageProps) {
  const {
    categories,
    isLoading: isLoadingCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCostCategories(business.id)
  const { entries, isLoading: isLoadingEntries, createEntry, updateEntry, deleteEntry } = useCostEntries(business.id)
  const [editingEntry, setEditingEntry] = useState<CostEntry | null>(null)

  const usedCategoryIds = useMemo(
    () => new Set(entries.map((entry) => entry.costCategoryId).filter((id): id is string => id !== null)),
    [entries],
  )

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
      />
      <CostCategoryManager
        categories={categories}
        usedCategoryIds={usedCategoryIds}
        onCreate={createCategory}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
      />
      <CostEntryList entries={entries} categories={categories} onEdit={setEditingEntry} onDelete={deleteEntry} />
    </div>
  )
}
