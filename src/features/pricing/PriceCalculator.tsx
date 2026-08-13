import { useState } from 'react'
import { Card } from '../../components/Card'
import { fieldClass, labelClass } from '../../components/Field'
import { ConceptTip } from '../education/ConceptTip'
import { centsToAmountInputText, formatCurrencyBRL, parseTypedAmountToCents } from '../../lib/currency'
import { calculateSuggestedPrice } from './calculatePrice'

// Calculadora avulsa (não salva nada no banco) pra ajudar a decidir por
// quanto vender algo: informa o custo da unidade e quanto quer sobrar de
// margem, e o app soma os dois. Usa o mesmo conceito de "margem" (valor em
// R$, não porcentagem) já usado no resto do app (ver reports/profit.ts e
// GLOSSARY.md), pra não confundir com um segundo significado do termo.
export function PriceCalculator() {
  const [costText, setCostText] = useState('')
  const [marginText, setMarginText] = useState('')

  const costCents = parseTypedAmountToCents(costText) ?? 0
  const marginCents = parseTypedAmountToCents(marginText) ?? 0
  const hasInput = costText !== '' || marginText !== ''
  const { priceCents, marginPercentOfPrice } = calculateSuggestedPrice(costCents, marginCents)

  return (
    <Card>
      <p className="font-semibold text-slate-900">Calculadora de preço de venda</p>
      <p className="mt-1 text-sm text-slate-500">
        Quanto custa produzir/comprar uma unidade, e quanto você quer ganhar de margem nela?
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="price-calc-cost" className={labelClass}>
            Custo da unidade
          </label>
          <input
            id="price-calc-cost"
            inputMode="numeric"
            placeholder="R$ 0,00"
            value={costText}
            onChange={(event) => setCostText(centsToAmountInputText(parseTypedAmountToCents(event.target.value) ?? 0))}
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="price-calc-margin" className={labelClass}>
            Margem desejada
          </label>
          <input
            id="price-calc-margin"
            inputMode="numeric"
            placeholder="R$ 0,00"
            value={marginText}
            onChange={(event) =>
              setMarginText(centsToAmountInputText(parseTypedAmountToCents(event.target.value) ?? 0))
            }
            className={fieldClass}
          />
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-sm text-slate-500">Preço sugerido</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrencyBRL(priceCents)}</p>
        {hasInput && marginPercentOfPrice !== null && marginCents > 0 && (
          <p className="mt-1 text-xs text-slate-500">
            Essa margem representa {marginPercentOfPrice.toFixed(0)}% do preço final.
          </p>
        )}
      </div>

      <div className="mt-2">
        <ConceptTip conceptId="margem" />
      </div>
    </Card>
  )
}
