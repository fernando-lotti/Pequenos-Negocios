import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../../components/Card'
import { PrimaryButton } from '../../components/PrimaryButton'
import { fieldClass, labelClass } from '../../components/Field'
import { centsToAmountInputText, parseTypedAmountToCents } from '../../lib/currency'
import { getTodayAsIsoDate } from '../../lib/date'
import type { RevenueCategory, RevenueEntry } from './types'
import type { NewRevenueEntryInput } from './useRevenueEntries'

interface RevenueEntryFormProps {
  categories: RevenueCategory[]
  onSubmit: (input: NewRevenueEntryInput) => Promise<unknown>
  // Ver comentário equivalente em CostEntryForm.tsx.
  entryToEdit?: RevenueEntry | null
  onCancelEdit?: () => void
}

export function RevenueEntryForm({ categories, onSubmit, entryToEdit, onCancelEdit }: RevenueEntryFormProps) {
  // Diferente de categoria de custo, categoria de receita é opcional — nem
  // todo negócio precisa separar de onde vem a receita, então o padrão é
  // "Sem categoria" (valor vazio) em vez de forçar a primeira da lista.
  const [revenueCategoryId, setRevenueCategoryId] = useState(entryToEdit?.revenueCategoryId ?? '')
  const [revenueDate, setRevenueDate] = useState(entryToEdit?.revenueDate ?? getTodayAsIsoDate())
  const [amountText, setAmountText] = useState(entryToEdit ? centsToAmountInputText(entryToEdit.amountCents) : '')
  const [unitsSoldText, setUnitsSoldText] = useState(entryToEdit?.unitsSold != null ? String(entryToEdit.unitsSold) : '')
  const [notes, setNotes] = useState(entryToEdit?.notes ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (entryToEdit) {
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
      const unitsSold = unitsSoldText.trim() ? Number(unitsSoldText) : null
      await onSubmit({
        revenueCategoryId: revenueCategoryId || null,
        revenueDate,
        amountCents,
        unitsSold,
        notes: notes.trim() || null,
      })
      if (entryToEdit) {
        onCancelEdit?.()
      } else {
        setAmountText('')
        setUnitsSoldText('')
        setNotes('')
      }
    } catch (submitError) {
      console.error('Erro ao lançar receita:', submitError)
      setError('Não foi possível salvar essa receita agora. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card ref={cardRef} className={entryToEdit ? 'animate-flash-highlight' : ''}>
      <p className="font-semibold text-slate-900">{entryToEdit ? 'Editar receita' : 'Lançar receita do dia'}</p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
        {categories.length > 0 && (
          <div className="flex flex-col gap-1">
            <label htmlFor="revenue-category" className={labelClass}>
              Categoria (opcional)
            </label>
            <select
              id="revenue-category"
              value={revenueCategoryId}
              onChange={(event) => setRevenueCategoryId(event.target.value)}
              className={fieldClass}
            >
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="revenue-date" className={labelClass}>
              Data
            </label>
            <input
              id="revenue-date"
              type="date"
              value={revenueDate}
              onChange={(event) => setRevenueDate(event.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="revenue-amount" className={labelClass}>
              Valor recebido
            </label>
            <input
              id="revenue-amount"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={amountText}
              onChange={(event) => setAmountText(centsToAmountInputText(parseTypedAmountToCents(event.target.value) ?? 0))}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="revenue-units" className={labelClass}>
            Quantidade (opcional)
          </label>
          <input
            id="revenue-units"
            type="number"
            min="0"
            step="1"
            value={unitsSoldText}
            onChange={(event) => setUnitsSoldText(event.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="revenue-notes" className={labelClass}>
            Observação
          </label>
          <input
            id="revenue-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className={fieldClass}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : entryToEdit ? 'Salvar alterações' : 'Lançar receita'}
          </PrimaryButton>
          {entryToEdit && (
            <PrimaryButton type="button" variant="secondary" onClick={onCancelEdit}>
              Cancelar
            </PrimaryButton>
          )}
        </div>
      </form>
    </Card>
  )
}
