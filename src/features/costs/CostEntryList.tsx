import { Card } from '../../components/Card'
import { CollapsibleText } from '../../components/CollapsibleText'
import { formatCurrencyBRL } from '../../lib/currency'
import { formatIsoDateAsBR } from '../../lib/date'
import type { CostCategory, CostEntry } from './types'

interface CostEntryListProps {
  entries: CostEntry[]
  categories: CostCategory[]
  onEdit: (entry: CostEntry) => void
  onDelete: (id: string) => Promise<void>
}

export function CostEntryList({ entries, categories, onEdit, onDelete }: CostEntryListProps) {
  const categoryById = new Map(categories.map((category) => [category.id, category]))

  return (
    <Card>
      <p className="font-semibold text-slate-900">Custos lançados</p>

      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Nenhum custo lançado ainda.</p>
      ) : (
        <ul className="mt-3 flex flex-col divide-y divide-slate-100">
          {entries.map((entry) => {
            const category = categoryById.get(entry.costCategoryId)
            return (
              <li key={entry.id} className="flex items-start justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-sm text-slate-900">{category?.name ?? 'Categoria removida'}</p>
                  {entry.notes && <CollapsibleText text={entry.notes} className="text-sm text-slate-500" />}
                  <p className="text-xs text-slate-500">{formatIsoDateAsBR(entry.costDate)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-semibold text-slate-900">{formatCurrencyBRL(entry.amountCents)}</span>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => onEdit(entry)} className="text-xs text-slate-600 underline">
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(entry.id)}
                      aria-label="Excluir lançamento"
                      className="text-xs text-red-600 underline"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
