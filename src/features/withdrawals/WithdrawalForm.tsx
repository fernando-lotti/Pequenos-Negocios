import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../../components/Card'
import { PrimaryButton } from '../../components/PrimaryButton'
import { fieldClass, labelClass } from '../../components/Field'
import { ConceptTip } from '../education/ConceptTip'
import { centsToAmountInputText, parseTypedAmountToCents } from '../../lib/currency'
import { getTodayAsIsoDate } from '../../lib/date'
import type { Withdrawal } from './types'
import type { NewWithdrawalInput } from './useWithdrawals'

interface WithdrawalFormProps {
  onSubmit: (input: NewWithdrawalInput) => Promise<unknown>
  // Ver comentário equivalente em RevenueEntryForm.tsx.
  withdrawalToEdit?: Withdrawal | null
  onCancelEdit?: () => void
}

export function WithdrawalForm({ onSubmit, withdrawalToEdit, onCancelEdit }: WithdrawalFormProps) {
  const [withdrawalDate, setWithdrawalDate] = useState(withdrawalToEdit?.withdrawalDate ?? getTodayAsIsoDate())
  const [amountText, setAmountText] = useState(
    withdrawalToEdit ? centsToAmountInputText(withdrawalToEdit.amountCents) : '',
  )
  const [notes, setNotes] = useState(withdrawalToEdit?.notes ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (withdrawalToEdit) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const amountCents = parseTypedAmountToCents(amountText)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!amountCents) {
      setError('Informe um valor válido.')
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit({
        withdrawalDate,
        amountCents,
        notes: notes.trim() || null,
      })
      if (withdrawalToEdit) {
        onCancelEdit?.()
      } else {
        setAmountText('')
        setNotes('')
      }
    } catch (submitError) {
      console.error('Erro ao lançar retirada:', submitError)
      setError('Não foi possível salvar essa retirada agora. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card ref={cardRef} className={withdrawalToEdit ? 'animate-flash-highlight' : ''}>
      <p className="font-semibold text-slate-900">{withdrawalToEdit ? 'Editar retirada' : 'Registrar retirada de caixa'}</p>
      <p className="mt-1 text-sm text-slate-500">Dinheiro que você tirou do negócio pra uso pessoal.</p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="withdrawal-date" className={labelClass}>
              Data
            </label>
            <input
              id="withdrawal-date"
              type="date"
              value={withdrawalDate}
              onChange={(event) => setWithdrawalDate(event.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="withdrawal-amount" className={labelClass}>
              Valor retirado
            </label>
            <input
              id="withdrawal-amount"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={amountText}
              onChange={(event) => setAmountText(centsToAmountInputText(parseTypedAmountToCents(event.target.value) ?? 0))}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="withdrawal-notes" className={labelClass}>
            Observação
          </label>
          <input
            id="withdrawal-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className={fieldClass}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : withdrawalToEdit ? 'Salvar alterações' : 'Registrar retirada'}
          </PrimaryButton>
          {withdrawalToEdit && (
            <PrimaryButton type="button" variant="secondary" onClick={onCancelEdit}>
              Cancelar
            </PrimaryButton>
          )}
        </div>

        <ConceptTip conceptId="retirada_de_caixa" />
      </form>
    </Card>
  )
}
