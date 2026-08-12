import { Card } from '../../components/Card'
import { formatCurrencyBRL } from '../../lib/currency'

interface DailyCashSummaryProps {
  cashCents: number
}

// Caixa nunca é uma tabela própria — é sempre receitas menos custos,
// calculado ao vivo a partir dos lançamentos atuais (ver ADR "Caixa é
// sempre calculado ao vivo" em docs/ARCHITECTURE.md).
export function DailyCashSummary({ cashCents }: DailyCashSummaryProps) {
  return (
    <Card className="border-emerald-200 bg-emerald-50">
      <p className="text-sm text-emerald-800">Caixa (receitas − custos, sempre atualizado)</p>
      <p className="mt-1 text-2xl font-bold text-emerald-900">{formatCurrencyBRL(cashCents)}</p>
    </Card>
  )
}
