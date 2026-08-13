import { describe, expect, it } from 'vitest'
import { calculateFinancialAlerts } from './financialAlerts'

describe('calculateFinancialAlerts', () => {
  it('alerta quando o custo fixo consome mais da metade da receita', () => {
    const alerts = calculateFinancialAlerts({
      fixedCostCents: 6_000,
      revenueCents: 10_000,
      cashCents: 5_000,
      workingCapitalGoalCents: null,
    })
    expect(alerts.map((alert) => alert.id)).toEqual(['custo_fixo_alto'])
  })

  it('não alerta quando o custo fixo está em 50% exatos (limiar é "mais da metade")', () => {
    const alerts = calculateFinancialAlerts({
      fixedCostCents: 5_000,
      revenueCents: 10_000,
      cashCents: 5_000,
      workingCapitalGoalCents: null,
    })
    expect(alerts).toEqual([])
  })

  it('não alerta de custo fixo alto quando não há receita no período', () => {
    const alerts = calculateFinancialAlerts({
      fixedCostCents: 6_000,
      revenueCents: 0,
      cashCents: 5_000,
      workingCapitalGoalCents: null,
    })
    expect(alerts).toEqual([])
  })

  it('alerta quando o caixa está abaixo da meta de capital de giro definida', () => {
    const alerts = calculateFinancialAlerts({
      fixedCostCents: 1_000,
      revenueCents: 10_000,
      cashCents: 3_000,
      workingCapitalGoalCents: 5_000,
    })
    expect(alerts.map((alert) => alert.id)).toEqual(['caixa_abaixo_da_meta'])
  })

  it('não alerta de capital de giro quando não há meta definida', () => {
    const alerts = calculateFinancialAlerts({
      fixedCostCents: 1_000,
      revenueCents: 10_000,
      cashCents: 0,
      workingCapitalGoalCents: null,
    })
    expect(alerts).toEqual([])
  })

  it('não alerta de capital de giro quando o caixa já atinge a meta', () => {
    const alerts = calculateFinancialAlerts({
      fixedCostCents: 1_000,
      revenueCents: 10_000,
      cashCents: 5_000,
      workingCapitalGoalCents: 5_000,
    })
    expect(alerts).toEqual([])
  })

  it('pode disparar os dois alertas ao mesmo tempo', () => {
    const alerts = calculateFinancialAlerts({
      fixedCostCents: 6_000,
      revenueCents: 10_000,
      cashCents: 1_000,
      workingCapitalGoalCents: 5_000,
    })
    expect(alerts.map((alert) => alert.id).sort()).toEqual(['caixa_abaixo_da_meta', 'custo_fixo_alto'])
  })

  it('devolve lista vazia quando nenhuma condição de alerta está ativa', () => {
    const alerts = calculateFinancialAlerts({
      fixedCostCents: 1_000,
      revenueCents: 10_000,
      cashCents: 5_000,
      workingCapitalGoalCents: null,
    })
    expect(alerts).toEqual([])
  })
})
