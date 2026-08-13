import { Fragment, useState } from 'react'
import { Card } from '../../components/Card'
import { ConceptTip } from '../education/ConceptTip'
import { formatCurrencyBRL } from '../../lib/currency'
import { formatDateRangeLabel } from '../../lib/date'
import type { ProfitBreakdown } from './profit'

interface ProfitSummaryCardProps {
  breakdown: ProfitBreakdown
}

type CostView = 'tipo' | 'categoria'

const toggleActiveClass = 'bg-white text-emerald-700 shadow-sm'
const toggleInactiveClass = 'text-slate-500'

// O destaque principal do produto: "quanto você realmente ganhou" (ver
// CLAUDE.md, objetivo #1). Mostra o lucro líquido bem grande, e o
// detalhamento por baixo pra quem quiser entender de onde veio o número.
// Funciona pra qualquer período (mês, ano, intervalo escolhido à mão), não
// só um mês fechado — ver issue #6.
export function ProfitSummaryCard({ breakdown }: ProfitSummaryCardProps) {
  const isProfit = breakdown.profitCents >= 0
  // Padrão é "por tipo" (fixo/variável) — decisão de produto do issue #7,
  // a quebra por categoria individual é uma visão alternativa, não a inicial.
  const [costView, setCostView] = useState<CostView>('tipo')

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
      </dl>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm text-slate-500">Custos do período</p>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setCostView('tipo')}
            className={`rounded-md px-2 py-1 font-medium transition ${costView === 'tipo' ? toggleActiveClass : toggleInactiveClass}`}
          >
            Por tipo
          </button>
          <button
            type="button"
            onClick={() => setCostView('categoria')}
            className={`rounded-md px-2 py-1 font-medium transition ${costView === 'categoria' ? toggleActiveClass : toggleInactiveClass}`}
          >
            Por categoria
          </button>
        </div>
      </div>

      <dl className="mt-2 grid grid-cols-2 gap-y-2 text-sm">
        {costView === 'tipo' ? (
          <>
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
          </>
        ) : breakdown.costByCategory.length === 0 ? (
          <p className="col-span-2 text-slate-500">Nenhum custo lançado neste período.</p>
        ) : (
          breakdown.costByCategory.map((item) => (
            <Fragment key={item.categoryId ?? 'sem-categoria'}>
              <dt className="text-slate-500">{item.name}</dt>
              <dd className="text-right font-medium text-slate-900">{formatCurrencyBRL(item.totalCents)}</dd>
            </Fragment>
          ))
        )}
      </dl>

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

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-sm text-slate-500">Preço médio de venda</p>
        {breakdown.avgSalePriceByCountCents !== null ? (
          <>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {formatCurrencyBRL(breakdown.avgSalePriceByCountCents)}{' '}
              <span className="text-xs font-normal text-slate-500">por lançamento</span>
            </p>
            {breakdown.avgSalePriceByUnitCents !== null && (
              <p className="mt-1 text-sm text-slate-600">
                {formatCurrencyBRL(breakdown.avgSalePriceByUnitCents)} por unidade vendida
              </p>
            )}
          </>
        ) : (
          <p className="mt-1 text-sm text-slate-500">Nenhuma receita lançada neste período ainda.</p>
        )}

        {breakdown.revenueByCategory.length > 0 && (
          <dl className="mt-3 grid grid-cols-2 gap-y-2 border-t border-slate-100 pt-3 text-sm">
            {breakdown.revenueByCategory.map((item) => (
              <Fragment key={item.categoryId ?? 'sem-categoria'}>
                <dt className="text-slate-500">{item.name}</dt>
                <dd className="text-right font-medium text-slate-900">
                  {formatCurrencyBRL(item.avgPriceByCountCents)}
                </dd>
              </Fragment>
            ))}
          </dl>
        )}
      </div>
    </Card>
  )
}
