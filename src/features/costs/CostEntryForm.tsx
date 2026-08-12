import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../../components/Card'
import { PrimaryButton } from '../../components/PrimaryButton'
import { fieldClass, labelClass } from '../../components/Field'
import { centsToAmountInputText, parseTypedAmountToCents } from '../../lib/currency'
import { getTodayAsIsoDate } from '../../lib/date'
import { COST_KIND_LABELS } from './types'
import type { CostCategory, CostEntry } from './types'
import type { NewCostEntryInput } from './useCostEntries'

interface CostEntryFormProps {
  categories: CostCategory[]
  onSubmit: (input: NewCostEntryInput) => Promise<unknown>
  // Quando preenchido, o formulário abre em modo de edição, com os campos
  // já preenchidos com os dados desse lançamento. O componente pai deve
  // remontar este form com uma `key` diferente ao trocar entre criar/editar
  // (ver CostsPage.tsx) — mais simples do que sincronizar estado via effect.
  entryToEdit?: CostEntry | null
  onCancelEdit?: () => void
}

export function CostEntryForm({ categories, onSubmit, entryToEdit, onCancelEdit }: CostEntryFormProps) {
  // Se o lançamento sendo editado ficou "sem categoria" (a categoria dele
  // foi excluída — ver CostCategoryManager.tsx), esse "??" já cai pra
  // primeira categoria disponível, pedindo pra pessoa escolher uma nova.
  const [costCategoryId, setCostCategoryId] = useState(entryToEdit?.costCategoryId ?? categories[0]?.id ?? '')
  const [costDate, setCostDate] = useState(entryToEdit?.costDate ?? getTodayAsIsoDate())
  const [amountText, setAmountText] = useState(entryToEdit ? centsToAmountInputText(entryToEdit.amountCents) : '')
  const [notes, setNotes] = useState(entryToEdit?.notes ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  // Ao entrar em modo de edição, rola até o formulário e dispara a piscada
  // (classe definida em index.css) — sem isso, trocar pra edição de um
  // lançamento que já está fora da tela passa despercebido. Roda só na
  // montagem porque o componente pai remonta este form com uma `key`
  // diferente toda vez que a edição muda de alvo (ver CostsPage.tsx).
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
    if (!costCategoryId) {
      setError('Cadastre pelo menos uma categoria de custo antes de lançar um gasto.')
      return
    }
    if (!amountCents) {
      setError('Informe um valor válido.')
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit({ costCategoryId, costDate, amountCents, notes: notes.trim() || null })
      if (entryToEdit) {
        onCancelEdit?.()
      } else {
        setAmountText('')
        setNotes('')
      }
    } catch (submitError) {
      console.error('Erro ao lançar custo:', submitError)
      setError('Não foi possível salvar esse custo agora. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card ref={cardRef} className={entryToEdit ? 'animate-flash-highlight' : ''}>
      <p className="font-semibold text-slate-900">{entryToEdit ? 'Editar custo' : 'Lançar um custo'}</p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="cost-category" className={labelClass}>
            Categoria
          </label>
          <select
            id="cost-category"
            value={costCategoryId}
            onChange={(event) => setCostCategoryId(event.target.value)}
            className={fieldClass}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} — {COST_KIND_LABELS[category.kind]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="cost-date" className={labelClass}>
              Data
            </label>
            <input
              id="cost-date"
              type="date"
              value={costDate}
              onChange={(event) => setCostDate(event.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="cost-amount" className={labelClass}>
              Valor
            </label>
            <input
              id="cost-amount"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={amountText}
              onChange={(event) => setAmountText(centsToAmountInputText(parseTypedAmountToCents(event.target.value) ?? 0))}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cost-notes" className={labelClass}>
            Observação
          </label>
          <input
            id="cost-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className={fieldClass}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : entryToEdit ? 'Salvar alterações' : 'Lançar custo'}
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
