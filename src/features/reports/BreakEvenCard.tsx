import { Card } from '../../components/Card'
import { ConceptTip } from '../education/ConceptTip'
import { calculateBreakEven } from './breakEven'
import type { ProfitBreakdown } from './profit'

interface BreakEvenCardProps {
  breakdown: ProfitBreakdown
}

// Só faz sentido mostrar quando a margem por unidade é conhecida — mesma
// condição já usada pra mostrar a margem em ProfitSummaryCard.tsx (a
// pessoa precisa ter preenchido "Quantidade" em pelo menos uma receita).
export function BreakEvenCard({ breakdown }: BreakEvenCardProps) {
  if (breakdown.marginPerUnitCents === null) return null

  const breakEven = calculateBreakEven(breakdown.fixedCostCents, breakdown.marginPerUnitCents, breakdown.unitsSoldTotal)

  return (
    <Card>
      <p className="font-semibold text-slate-900">Ponto de equilíbrio</p>

      {!breakEven.possible && (
        <p className="mt-1 text-sm text-slate-600">
          Sua margem média está zerada ou negativa nesse período — vender mais não é suficiente pra cobrir os custos
          fixos. Vale revisar seus preços ou seus custos variáveis antes de olhar pra esse número.
        </p>
      )}

      {breakEven.possible && breakEven.isReached && (
        <p className="mt-1 text-sm text-emerald-700">
          Você já bateu o ponto de equilíbrio! Precisava de {breakEven.unitsNeeded} vendas/atendimentos pra cobrir os
          custos fixos, e já vendeu {breakdown.unitsSoldTotal}. Daqui pra frente, é lucro de verdade.
        </p>
      )}

      {breakEven.possible && !breakEven.isReached && (
        <p className="mt-1 text-sm text-slate-600">
          Faltam <span className="font-semibold text-slate-900">{breakEven.unitsRemaining}</span> vendas/atendimentos
          pra cobrir os custos fixos do período (precisa de {breakEven.unitsNeeded} no total, já vendeu{' '}
          {breakdown.unitsSoldTotal}).
        </p>
      )}

      <div className="mt-2">
        <ConceptTip conceptId="ponto_de_equilibrio" />
      </div>
    </Card>
  )
}
