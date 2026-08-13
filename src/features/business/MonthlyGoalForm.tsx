import { useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../../components/Card'
import { PrimaryButton } from '../../components/PrimaryButton'
import { fieldClass, labelClass } from '../../components/Field'
import { centsToAmountInputText, parseTypedAmountToCents } from '../../lib/currency'
import type { Business, MonthlyGoalInput, MonthlyGoalType } from './types'

interface MonthlyGoalFormProps {
  business: Business
  onSave: (businessId: string, goal: MonthlyGoalInput | null) => Promise<unknown>
}

const GOAL_TYPE_OPTIONS: { value: MonthlyGoalType; label: string; description: string }[] = [
  { value: 'profit', label: 'Lucro', description: 'quanto sobra depois de descontar os custos' },
  { value: 'revenue', label: 'Faturamento', description: 'quanto entra de receita, sem descontar custos' },
]

// Editável em Ajustes, mostrada como progresso no Dashboard (ver
// MonthlyGoalCard.tsx). Deixamos o dono escolher entre meta de lucro ou de
// faturamento em vez de fixar uma só, porque são números bem diferentes e
// cada negócio tem um motivo pra acompanhar um ou outro de perto.
export function MonthlyGoalForm({ business, onSave }: MonthlyGoalFormProps) {
  const [goalType, setGoalType] = useState<MonthlyGoalType>(business.monthlyGoalType ?? 'profit')
  const [amountText, setAmountText] = useState(
    business.monthlyGoalCents ? centsToAmountInputText(business.monthlyGoalCents) : '',
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const hasExistingGoal = business.monthlyGoalCents !== null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    const amountCents = parseTypedAmountToCents(amountText)
    if (!amountCents) {
      setError('Informe um valor válido pra meta.')
      return
    }
    setIsSubmitting(true)
    try {
      await onSave(business.id, { amountCents, type: goalType })
    } catch (submitError) {
      console.error('Erro ao salvar meta mensal:', submitError)
      setError('Não foi possível salvar a meta agora. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRemove() {
    setError('')
    setIsSubmitting(true)
    try {
      await onSave(business.id, null)
      setAmountText('')
    } catch (submitError) {
      console.error('Erro ao remover meta mensal:', submitError)
      setError('Não foi possível remover a meta agora. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <p className="font-semibold text-slate-900">Meta mensal</p>
      <p className="mt-1 text-sm text-slate-500">
        Acompanhe o progresso do mês até um valor de lucro ou faturamento que você definir.
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <span className={labelClass}>Meta de</span>
          <div className="flex flex-col gap-2">
            {GOAL_TYPE_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="monthly-goal-type"
                  checked={goalType === option.value}
                  onChange={() => setGoalType(option.value)}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-medium text-slate-900">{option.label}</span> — {option.description}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="monthly-goal-amount" className={labelClass}>
            Valor da meta
          </label>
          <input
            id="monthly-goal-amount"
            inputMode="numeric"
            placeholder="R$ 0,00"
            value={amountText}
            onChange={(event) => setAmountText(centsToAmountInputText(parseTypedAmountToCents(event.target.value) ?? 0))}
            className={fieldClass}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar meta'}
          </PrimaryButton>
          {hasExistingGoal && (
            <PrimaryButton type="button" variant="secondary" disabled={isSubmitting} onClick={handleRemove}>
              Remover meta
            </PrimaryButton>
          )}
        </div>
      </form>
    </Card>
  )
}
