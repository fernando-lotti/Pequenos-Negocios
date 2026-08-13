import { Card } from '../../components/Card'
import { CollapsibleText } from '../../components/CollapsibleText'
import { GlossaryTerm } from '../education/GlossaryTerm'
import { formatCurrencyBRL } from '../../lib/currency'
import { formatIsoDateAsBR } from '../../lib/date'
import type { Withdrawal } from './types'

interface WithdrawalListProps {
  withdrawals: Withdrawal[]
  onEdit: (withdrawal: Withdrawal) => void
  onDelete: (id: string) => Promise<void>
}

export function WithdrawalList({ withdrawals, onEdit, onDelete }: WithdrawalListProps) {
  return (
    <Card>
      <p className="font-semibold text-slate-900">
        <GlossaryTerm conceptId="retirada_de_caixa">Retiradas</GlossaryTerm> lançadas
      </p>

      {withdrawals.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Nenhuma retirada lançada ainda.</p>
      ) : (
        <ul className="mt-3 flex flex-col divide-y divide-slate-100">
          {withdrawals.map((withdrawal) => (
            <li key={withdrawal.id} className="flex items-start justify-between gap-2 py-2">
              <div className="min-w-0">
                <p className="text-sm text-slate-900">{formatIsoDateAsBR(withdrawal.withdrawalDate)}</p>
                {withdrawal.notes && <CollapsibleText text={withdrawal.notes} className="text-xs text-slate-500" />}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm font-semibold text-slate-900">{formatCurrencyBRL(withdrawal.amountCents)}</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => onEdit(withdrawal)} className="text-xs text-slate-600 underline">
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(withdrawal.id)}
                    aria-label="Excluir retirada"
                    className="text-xs text-red-600 underline"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
