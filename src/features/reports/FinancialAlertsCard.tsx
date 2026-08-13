import { Card } from '../../components/Card'
import type { FinancialAlert } from './financialAlerts'

interface FinancialAlertsCardProps {
  alerts: FinancialAlert[]
}

// Só aparece quando há pelo menos um alerta ativo — sem alertas, o card
// nem entra no DOM (ver calculateFinancialAlerts.ts), pra não virar "ruído"
// quando está tudo bem.
export function FinancialAlertsCard({ alerts }: FinancialAlertsCardProps) {
  if (alerts.length === 0) return null

  return (
    <Card className="border-amber-200 bg-amber-50">
      <p className="font-semibold text-amber-900">Vale ficar de olho</p>
      <ul className="mt-2 flex flex-col gap-2">
        {alerts.map((alert) => (
          <li key={alert.id} className="text-sm text-amber-900">
            {alert.message}
          </li>
        ))}
      </ul>
    </Card>
  )
}
