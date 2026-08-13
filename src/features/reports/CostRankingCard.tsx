import { Card } from '../../components/Card'
import { formatCurrencyBRL } from '../../lib/currency'
import type { CategoryRanking } from '../costs/calculations'

interface CostRankingCardProps {
  ranking: CategoryRanking[]
}

// "Pra onde seu dinheiro está indo": ranking das categorias de custo do
// período, da maior pra menor, com barra visual proporcional ao % do total
// — mais acionável do que só listar as categorias (aponta pra qual delas
// vale a pena olhar primeiro).
export function CostRankingCard({ ranking }: CostRankingCardProps) {
  if (ranking.length === 0) {
    return (
      <Card>
        <p className="font-semibold text-slate-900">Pra onde seu dinheiro está indo</p>
        <p className="mt-1 text-sm text-slate-500">Nenhum custo lançado nesse período ainda.</p>
      </Card>
    )
  }

  return (
    <Card>
      <p className="font-semibold text-slate-900">Pra onde seu dinheiro está indo</p>
      <p className="mt-1 text-sm text-slate-500">Categorias de custo do período, da que mais pesa pra que menos pesa.</p>

      <ul className="mt-3 flex flex-col gap-3">
        {ranking.map((category) => (
          <li key={category.costCategoryId ?? 'sem-categoria'}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-slate-900">{category.name}</span>
              <span className="text-slate-600">
                {formatCurrencyBRL(category.totalCents)} · {category.percentOfTotal.toFixed(0)}%
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${category.percentOfTotal}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
