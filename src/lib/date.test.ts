import { describe, expect, it } from 'vitest'
import { addMonthsToIsoDate } from './date'

describe('addMonthsToIsoDate', () => {
  it('soma meses mantendo o mesmo dia do mês', () => {
    expect(addMonthsToIsoDate('2026-01-15', 1)).toBe('2026-02-15')
    expect(addMonthsToIsoDate('2026-01-15', 3)).toBe('2026-04-15')
  })

  it('não muda a data quando soma 0 meses', () => {
    expect(addMonthsToIsoDate('2026-01-15', 0)).toBe('2026-01-15')
  })

  it('vira o ano quando a soma passa de dezembro', () => {
    expect(addMonthsToIsoDate('2026-11-01', 3)).toBe('2027-02-01')
  })

  it('cai pro último dia do mês de destino quando o dia original não existe nele', () => {
    // 31 de janeiro + 1 mês -> fevereiro não tem dia 31, cai pro 28 (2026 não é bissexto)
    expect(addMonthsToIsoDate('2026-01-31', 1)).toBe('2026-02-28')
  })

  it('usa 29/02 no ano bissexto', () => {
    expect(addMonthsToIsoDate('2028-01-31', 1)).toBe('2028-02-29')
  })
})
