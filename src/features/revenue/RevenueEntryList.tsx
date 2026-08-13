import { Card } from '../../components/Card'
import { CollapsibleText } from '../../components/CollapsibleText'
import { formatCurrencyBRL } from '../../lib/currency'
import { formatIsoDateAsBR } from '../../lib/date'
import type { PaymentMethod } from '../paymentMethods/types'
import type { RevenueCategory, RevenueEntry } from './types'

interface RevenueEntryListProps {
  entries: RevenueEntry[]
  categories: RevenueCategory[]
  paymentMethods: PaymentMethod[]
  onEdit: (entry: RevenueEntry) => void
  onDelete: (id: string) => Promise<void>
}

export function RevenueEntryList({ entries, categories, paymentMethods, onEdit, onDelete }: RevenueEntryListProps) {
  const categoryById = new Map(categories.map((category) => [category.id, category]))
  const paymentMethodById = new Map(paymentMethods.map((method) => [method.id, method]))

  return (
    <Card>
      <p className="font-semibold text-slate-900">Receitas lançadas</p>

      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Nenhuma receita lançada ainda.</p>
      ) : (
        <ul className="mt-3 flex flex-col divide-y divide-slate-100">
          {entries.map((entry) => {
            const hasUnits = entry.unitsSold !== null && entry.unitsSold > 0
            const averageCents = hasUnits ? Math.round(entry.amountCents / entry.unitsSold!) : null
            const category = entry.revenueCategoryId ? categoryById.get(entry.revenueCategoryId) : undefined
            const paymentMethod = entry.paymentMethodId ? paymentMethodById.get(entry.paymentMethodId) : undefined

            return (
              <li key={entry.id} className="flex items-start justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-sm text-slate-900">
                    {formatIsoDateAsBR(entry.revenueDate)}
                    {hasUnits && ` — ${entry.unitsSold} unidade(s)`}
                  </p>
                  {category && <p className="text-xs text-slate-500">{category.name}</p>}
                  {paymentMethod && <p className="text-xs text-slate-500">{paymentMethod.name}</p>}
                  {averageCents !== null && (
                    <p className="text-xs text-slate-500">{formatCurrencyBRL(averageCents)} por unidade</p>
                  )}
                  {entry.notes && <CollapsibleText text={entry.notes} className="text-xs text-slate-500" />}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-semibold text-emerald-700">{formatCurrencyBRL(entry.amountCents)}</span>
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
