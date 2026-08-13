import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../../components/Card'
import { PrimaryButton } from '../../components/PrimaryButton'
import { fieldClass, labelClass } from '../../components/Field'
import { centsToAmountInputText, parseTypedAmountToCents } from '../../lib/currency'
import { getTodayAsIsoDate } from '../../lib/date'
import type { PaymentMethod } from '../paymentMethods/types'
import type { RevenueCategory, RevenueEntry } from './types'
import type { NewRevenueEntryInput } from './useRevenueEntries'

// Ver comentário equivalente em CostEntryForm.tsx.
const NEW_CATEGORY_OPTION_VALUE = '__new__'
const NEW_PAYMENT_METHOD_OPTION_VALUE = '__new_payment_method__'

interface RevenueEntryFormProps {
  categories: RevenueCategory[]
  paymentMethods: PaymentMethod[]
  onSubmit: (input: NewRevenueEntryInput) => Promise<unknown>
  // Ver comentário equivalente em CostEntryForm.tsx.
  entryToEdit?: RevenueEntry | null
  onCancelEdit?: () => void
  // Leva pra aba Ajustes, onde agora fica o cadastro de categorias de
  // receita (ver SettingsPage.tsx) — usado pela opção "+ Nova categoria".
  onManageCategories: () => void
  // "Produto" pra negócio comerciante de produto, "Categoria" pra
  // prestador de serviços — ver BUSINESS_TYPE_INFO.revenueCategoryLabel.
  categoryLabelSingular: string
  // Mesma ideia, pro cadastro de formas de pagamento (ver PaymentMethodManager.tsx).
  onManagePaymentMethods: () => void
}

export function RevenueEntryForm({
  categories,
  paymentMethods,
  onSubmit,
  entryToEdit,
  onCancelEdit,
  onManageCategories,
  categoryLabelSingular,
  onManagePaymentMethods,
}: RevenueEntryFormProps) {
  // Diferente de categoria de custo, categoria de receita é opcional — nem
  // todo negócio precisa separar de onde vem a receita, então o padrão é
  // "Sem categoria" (valor vazio) em vez de forçar a primeira da lista.
  const [revenueCategoryId, setRevenueCategoryId] = useState(entryToEdit?.revenueCategoryId ?? '')
  // Forma de pagamento também é opcional, mesmo motivo — nem toda receita
  // tem uma (ex: alguém que só recebe em dinheiro e não quer detalhar).
  const [paymentMethodId, setPaymentMethodId] = useState(entryToEdit?.paymentMethodId ?? '')
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
        paymentMethodId: paymentMethodId || null,
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
        <div className="flex flex-col gap-1">
          <label htmlFor="revenue-category" className={labelClass}>
            {categoryLabelSingular} (opcional)
          </label>
          {categories.length > 0 ? (
            <select
              id="revenue-category"
              value={revenueCategoryId}
              onChange={(event) => {
                if (event.target.value === NEW_CATEGORY_OPTION_VALUE) {
                  onManageCategories()
                  return
                }
                setRevenueCategoryId(event.target.value)
              }}
              className={fieldClass}
            >
              <option value="">Sem {categoryLabelSingular.toLowerCase()}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
              <option value={NEW_CATEGORY_OPTION_VALUE}>+ Novo(a) {categoryLabelSingular.toLowerCase()}</option>
            </select>
          ) : (
            <button
              type="button"
              onClick={onManageCategories}
              className="rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-left text-sm text-emerald-700"
            >
              + Cadastrar {categoryLabelSingular.toLowerCase()}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="revenue-payment-method" className={labelClass}>
            Forma de pagamento (opcional)
          </label>
          {paymentMethods.length > 0 ? (
            <select
              id="revenue-payment-method"
              value={paymentMethodId}
              onChange={(event) => {
                if (event.target.value === NEW_PAYMENT_METHOD_OPTION_VALUE) {
                  onManagePaymentMethods()
                  return
                }
                setPaymentMethodId(event.target.value)
              }}
              className={fieldClass}
            >
              <option value="">Sem forma de pagamento</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                  {method.feePercent > 0 ? ` (${method.feePercent}% de taxa)` : ''}
                </option>
              ))}
              <option value={NEW_PAYMENT_METHOD_OPTION_VALUE}>+ Nova forma de pagamento</option>
            </select>
          ) : (
            <button
              type="button"
              onClick={onManagePaymentMethods}
              className="rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-left text-sm text-emerald-700"
            >
              + Cadastrar forma de pagamento
            </button>
          )}
        </div>

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
