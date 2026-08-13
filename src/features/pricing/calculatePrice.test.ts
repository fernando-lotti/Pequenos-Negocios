import { describe, expect, it } from 'vitest'
import { calculateSuggestedPrice } from './calculatePrice'

describe('calculateSuggestedPrice', () => {
  it('soma custo e margem desejada pra sugerir o preço', () => {
    const result = calculateSuggestedPrice(1000, 500)
    expect(result.priceCents).toBe(1500)
  })

  it('calcula quanto a margem representa do preço final', () => {
    const result = calculateSuggestedPrice(1000, 500)
    expect(result.marginPercentOfPrice).toBeCloseTo((500 / 1500) * 100)
  })

  it('devolve null na porcentagem quando custo e margem são zero', () => {
    const result = calculateSuggestedPrice(0, 0)
    expect(result.priceCents).toBe(0)
    expect(result.marginPercentOfPrice).toBeNull()
  })

  it('funciona com margem zero (preço igual ao custo)', () => {
    const result = calculateSuggestedPrice(1000, 0)
    expect(result.priceCents).toBe(1000)
    expect(result.marginPercentOfPrice).toBe(0)
  })
})
