import { Card } from '../../components/Card'
import { GlossaryTerm } from '../education/GlossaryTerm'
import { formatCurrencyBRL } from '../../lib/currency'
import type { ProductMargin } from '../revenue/calculations'

interface ProductMarginCardProps {
  margins: ProductMargin[]
}

// Só aparece quando existe pelo menos um produto com custo cadastrado E
// com unidades vendidas no período (ver calculateProductMargins) — sem
// isso, não tem nada útil pra mostrar, então o card nem entra na tela
// (mesmo padrão de BreakEvenCard.tsx).
export function ProductMarginCard({ margins }: ProductMarginCardProps) {
  if (margins.length === 0) return null

  return (
    <Card>
      <p className="font-semibold text-slate-900">
        <GlossaryTerm conceptId="margem">Margem</GlossaryTerm> por produto
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Receita, custo e margem de cada produto com custo por unidade cadastrado (ver Ajustes).
      </p>

      <ul className="mt-3 flex flex-col divide-y divide-slate-100">
        {margins.map((product) => {
          const isProfit = product.marginCents >= 0
          return (
            <li key={product.categoryId} className="flex flex-col gap-1 py-2">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium text-slate-900">{product.name}</p>
                <p className={`text-sm font-semibold ${isProfit ? 'text-emerald-700' : 'text-red-600'}`}>
                  {formatCurrencyBRL(product.marginCents)}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                {product.unitsSold} unidade(s) · receita {formatCurrencyBRL(product.revenueCents)} · custo{' '}
                {formatCurrencyBRL(product.costCents)}
                {product.marginPerUnitCents !== null &&
                  ` · ${formatCurrencyBRL(product.marginPerUnitCents)} de margem por unidade`}
              </p>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
