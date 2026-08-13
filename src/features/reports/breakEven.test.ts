import { describe, expect, it } from 'vitest'
import { calculateBreakEven } from './breakEven'

describe('calculateBreakEven', () => {
  it('calcula quantas unidades faltam pra cobrir o custo fixo', () => {
    const result = calculateBreakEven(10_000, 300, 10)
    expect(result).toEqual({ possible: true, unitsNeeded: 34, unitsRemaining: 24, isReached: false })
  })

  it('arredonda pra cima o número de unidades necessárias', () => {
    // 10.000 / 300 = 33,33... -> precisa de 34 unidades inteiras
    const result = calculateBreakEven(10_000, 300, 0)
    expect(result).toEqual({ possible: true, unitsNeeded: 34, unitsRemaining: 34, isReached: false })
  })

  it('marca como atingido quando já vendeu o suficiente', () => {
    const result = calculateBreakEven(10_000, 500, 25)
    expect(result).toEqual({ possible: true, unitsNeeded: 20, unitsRemaining: 0, isReached: true })
  })

  it('não deixa unitsRemaining ficar negativo quando já superou a meta', () => {
    const result = calculateBreakEven(10_000, 500, 100)
    expect(result.possible && result.unitsRemaining).toBe(0)
  })

  it('devolve possible=false quando a margem é zero', () => {
    expect(calculateBreakEven(10_000, 0, 5)).toEqual({ possible: false })
  })

  it('devolve possible=false quando a margem é negativa', () => {
    expect(calculateBreakEven(10_000, -50, 5)).toEqual({ possible: false })
  })

  it('sem custo fixo, a meta já é considerada atingida (0 unidades necessárias)', () => {
    const result = calculateBreakEven(0, 300, 0)
    expect(result).toEqual({ possible: true, unitsNeeded: 0, unitsRemaining: 0, isReached: true })
  })
})
