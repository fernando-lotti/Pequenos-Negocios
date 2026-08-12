import { Card } from '../../components/Card'
import { ConceptTip } from '../education/ConceptTip'
import { formatCurrencyBRL } from '../../lib/currency'
import { formatDateRangeLabel } from '../../lib/date'
import type { ProfitBreakdown } from './profit'

interface ProfitSummaryCardProps {
  breakdown: ProfitBreakdown
}

// O destaque principal do produto: "quanto você realmente ganhou" (ver
// CLAUDE.md, objetivo #1). Mostra o lucro líquido bem grande, e o
// detalhamento por baixo pra quem quiser entender de onde veio o número.
// Funciona pra qualquer período (mês, ano, intervalo escolhido à mão), não
// só um mês fechado — ver issue #6.
export function ProfitSummaryCard({ breakdown }: ProfitSummaryCardProps) {
  const isProfit = breakdown.profitCents >= 0

  return (
    <Card>
      <p className="text-sm text-slate-600">
        Lucro líquido de {formatDateRangeLabel(breakdown.startDate, breakdown.endDate)}
      </p>
      <p className={`mt-1 text-3xl font-bold ${isProfit ? 'text-emerald-700' : 'text-red-600'}`}>
        {formatCurrencyBRL(breakdown.profitCents)}
      </p>
      {!isProfit && <p className="mt-1 text-sm text-red-600">Os custos do período superaram a receita.</p>}

      <dl className="mt-4 grid grid-cols-2 gap-y-2 border-t border-slate-100 pt-4 text-sm">
        <dt className="text-slate-500">Receita do período</dt>
        <dd className="text-right font-medium text-slate-900">{formatCurrencyBRL(breakdown.revenueCents)}</dd>

        <dt className="text-slate-500">Custos fixos</dt>
        <dd className="text-right font-medium text-slate-900">{formatCurrencyBRL(breakdown.fixedCostCents)}</dd>

        <dt className="text-slate-500">Custos variáveis</dt>
        <dd className="text-right font-medium text-slate-900">{formatCurrencyBRL(breakdown.variableCostCents)}</dd>

        {breakdown.uncategorizedCostCents > 0 && (
          <>
            <dt className="text-slate-500">Sem categoria</dt>
            <dd className="text-right font-medium text-slate-900">
              {formatCurrencyBRL(breakdown.uncategorizedCostCents)}
            </dd>
          </>
        )}

        {breakdown.cardFeeCents > 0 && (
          <>
            <dt className="text-slate-500">Taxas de pagamento</dt>
            <dd className="text-right font-medium text-slate-900">{formatCurrencyBRL(breakdown.cardFeeCents)}</dd>
          </>
        )}
      </dl>

      {breakdown.cardFeeCents > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          <p className="text-xs text-slate-500">
            "Taxas de pagamento" é o que a maquininha/banco descontou das receitas do período, de acordo com a forma
            de pagamento escolhida em cada uma (ver Ajustes → Formas de pagamento).
          </p>
          <ConceptTip conceptId="taxa_de_pagamento" />
        </div>
      )}

      {breakdown.uncategorizedCostCents > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          Alguns custos estão "sem categoria" porque a categoria deles foi excluída. Edite esses lançamentos na tela
          de Custos pra colocar numa categoria existente.
        </p>
      )}

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-sm text-slate-500">Margem média por unidade vendida</p>
        {breakdown.marginPerUnitCents !== null ? (
          <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrencyBRL(breakdown.marginPerUnitCents)}</p>
        ) : (
          <p className="mt-1 text-sm text-slate-500">
            Preencha "Quantidade" ao lançar suas receitas pra ver quanto sobra, em média, de cada venda ou
            atendimento.
          </p>
        )}
        <div className="mt-2">
          <ConceptTip conceptId="margem" />
        </div>
      </div>
    </Card>
  )
}
