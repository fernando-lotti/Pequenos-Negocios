import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../../components/Card'
import { PrimaryButton } from '../../components/PrimaryButton'
import { fieldClass, labelClass } from '../../components/Field'
import { centsToAmountInputText, formatCurrencyBRL, parseTypedAmountToCents } from '../../lib/currency'
import { getTodayAsIsoDate } from '../../lib/date'
import { COST_KIND_LABELS } from './types'
import type { CostCategory, CostEntry } from './types'
import type { NewCostEntryInput, NewInstallmentPlanInput } from './useCostEntries'

// Valor "sentinela" da opção "+ Nova categoria" no <select> — nunca colide
// com um id de categoria de verdade (que são uuid). Ao escolher essa opção,
// não mudamos a categoria selecionada: só navegamos pra Ajustes, onde fica
// o cadastro de categorias (ver SettingsPage.tsx).
const NEW_CATEGORY_OPTION_VALUE = '__new__'

interface CostEntryFormProps {
  categories: CostCategory[]
  onSubmit: (input: NewCostEntryInput) => Promise<unknown>
  // Cria uma parcela por mês de uma vez (ver useCostEntries.ts,
  // installments.ts) — usado quando "Parcelar essa compra" está marcado.
  onSubmitInstallments: (input: NewInstallmentPlanInput) => Promise<unknown>
  // Quando preenchido, o formulário abre em modo de edição, com os campos
  // já preenchidos com os dados desse lançamento. O componente pai deve
  // remontar este form com uma `key` diferente ao trocar entre criar/editar
  // (ver CostsPage.tsx) — mais simples do que sincronizar estado via effect.
  entryToEdit?: CostEntry | null
  onCancelEdit?: () => void
  // Leva pra aba Ajustes, onde agora fica o cadastro de categorias de custo
  // (ver SettingsPage.tsx) — usado pela opção "+ Nova categoria" do seletor.
  onManageCategories: () => void
}

export function CostEntryForm({
  categories,
  onSubmit,
  onSubmitInstallments,
  entryToEdit,
  onCancelEdit,
  onManageCategories,
}: CostEntryFormProps) {
  // Se o lançamento sendo editado ficou "sem categoria" (a categoria dele
  // foi excluída — ver CostCategoryManager.tsx), esse "??" já cai pra
  // primeira categoria disponível, pedindo pra pessoa escolher uma nova.
  const [costCategoryId, setCostCategoryId] = useState(entryToEdit?.costCategoryId ?? categories[0]?.id ?? '')
  const [costDate, setCostDate] = useState(entryToEdit?.costDate ?? getTodayAsIsoDate())
  const [amountText, setAmountText] = useState(entryToEdit ? centsToAmountInputText(entryToEdit.amountCents) : '')
  const [notes, setNotes] = useState(entryToEdit?.notes ?? '')
  // Parcelar só faz sentido criando um lançamento novo — editar uma parcela
  // já criada é só editar aquele lançamento específico, como qualquer outro
  // custo (ver ADR em docs/ARCHITECTURE.md).
  const [isInstallment, setIsInstallment] = useState(false)
  const [installmentCountText, setInstallmentCountText] = useState('2')
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
  const installmentCount = Number(installmentCountText)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!costCategoryId) {
      setError('Cadastre pelo menos uma categoria de custo antes de lançar um gasto.')
      return
    }
    if (!amountCents) {
      setError(isInstallment ? 'Informe o valor total da compra.' : 'Informe um valor válido.')
      return
    }
    if (isInstallment && (!Number.isInteger(installmentCount) || installmentCount < 2)) {
      setError('Informe um número de parcelas válido (2 ou mais).')
      return
    }
    setIsSubmitting(true)
    try {
      if (isInstallment) {
        await onSubmitInstallments({
          costCategoryId,
          totalCents: amountCents,
          installmentCount,
          firstDueDate: costDate,
          notes: notes.trim() || null,
        })
      } else {
        await onSubmit({ costCategoryId, costDate, amountCents, notes: notes.trim() || null })
      }
      if (entryToEdit) {
        onCancelEdit?.()
      } else {
        setAmountText('')
        setNotes('')
        setIsInstallment(false)
        setInstallmentCountText('2')
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
          {categories.length > 0 ? (
            <select
              id="cost-category"
              value={costCategoryId}
              onChange={(event) => {
                if (event.target.value === NEW_CATEGORY_OPTION_VALUE) {
                  onManageCategories()
                  return
                }
                setCostCategoryId(event.target.value)
              }}
              className={fieldClass}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} — {COST_KIND_LABELS[category.kind]}
                </option>
              ))}
              <option value={NEW_CATEGORY_OPTION_VALUE}>+ Nova categoria</option>
            </select>
          ) : (
            <button
              type="button"
              onClick={onManageCategories}
              className="rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-left text-sm text-emerald-700"
            >
              + Cadastrar categoria de custo
            </button>
          )}
        </div>

        {!entryToEdit && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isInstallment}
              onChange={(event) => setIsInstallment(event.target.checked)}
            />
            Parcelar essa compra (ex: uma máquina, um ar condicionado)
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="cost-date" className={labelClass}>
              {isInstallment ? 'Data da 1ª parcela' : 'Data'}
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
              {isInstallment ? 'Valor total da compra' : 'Valor'}
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

        {isInstallment && (
          <div className="flex flex-col gap-1">
            <label htmlFor="cost-installment-count" className={labelClass}>
              Número de parcelas
            </label>
            <input
              id="cost-installment-count"
              type="number"
              min="2"
              step="1"
              value={installmentCountText}
              onChange={(event) => setInstallmentCountText(event.target.value)}
              className={fieldClass}
            />
            {amountCents !== null && Number.isInteger(installmentCount) && installmentCount >= 2 && (
              <p className="text-xs text-slate-500">
                {installmentCount}x de aproximadamente {formatCurrencyBRL(Math.round(amountCents / installmentCount))}
              </p>
            )}
          </div>
        )}

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
            {isSubmitting
              ? 'Salvando...'
              : entryToEdit
                ? 'Salvar alterações'
                : isInstallment
                  ? 'Lançar parcelas'
                  : 'Lançar custo'}
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
