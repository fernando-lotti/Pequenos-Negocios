import { describe, expect, it } from 'vitest'
import { calculateGoalProgress } from './goalProgress'

describe('calculateGoalProgress', () => {
  it('calcula o progresso proporcional entre 0 e 1', () => {
    const result = calculateGoalProgress(10_000, 4_000)
    expect(result.progressRatio).toBeCloseTo(0.4)
    expect(result.remainingCents).toBe(6_000)
    expect(result.isReached).toBe(false)
  })

  it('não deixa o progresso passar de 1 mesmo superando a meta', () => {
    const result = calculateGoalProgress(10_000, 15_000)
    expect(result.progressRatio).toBe(1)
    expect(result.remainingCents).toBe(0)
    expect(result.isReached).toBe(true)
  })

  it('considera meta batida quando o valor é exatamente igual', () => {
    const result = calculateGoalProgress(10_000, 10_000)
    expect(result.isReached).toBe(true)
  })

  it('não deixa o progresso ficar negativo com valor atual negativo (prejuízo)', () => {
    const result = calculateGoalProgress(10_000, -2_000)
    expect(result.progressRatio).toBe(0)
    expect(result.remainingCents).toBe(12_000)
  })

  it('devolve valores neutros quando não há meta (0 ou negativa)', () => {
    expect(calculateGoalProgress(0, 5_000)).toEqual({ progressRatio: 0, remainingCents: 0, isReached: false })
  })
})
