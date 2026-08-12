import { describe, it, expect } from 'vitest'
import { formatCurrencyBRL, formatAmountInputText, centsToAmountInputText, parseTypedAmountToCents } from './currency'

// O Intl.NumberFormat usa um "espaço duro" (U+00A0) entre "R$" e o número,
// não um espaço comum — normalizamos antes de comparar pra não depender de
// qual caractere invisível o motor JS decidiu usar.
function normalizeSpaces(text: string): string {
  return text.replace(/ /g, ' ')
}

describe('formatCurrencyBRL', () => {
  it('formata centavos como moeda brasileira', () => {
    expect(normalizeSpaces(formatCurrencyBRL(15_050))).toBe('R$ 150,50')
    expect(normalizeSpaces(formatCurrencyBRL(1))).toBe('R$ 0,01')
    expect(normalizeSpaces(formatCurrencyBRL(0))).toBe('R$ 0,00')
  })
})

describe('formatAmountInputText', () => {
  it('insere ponto de milhar na parte inteira enquanto digita', () => {
    expect(formatAmountInputText('1234')).toBe('1.234')
    expect(formatAmountInputText('1234567')).toBe('1.234.567')
    expect(formatAmountInputText('123')).toBe('123')
  })

  it('preserva a vírgula e os dígitos decimais sem tocar neles', () => {
    expect(formatAmountInputText('1234,5')).toBe('1.234,5')
    expect(formatAmountInputText('1234,56')).toBe('1.234,56')
  })
})

describe('parseTypedAmountToCents', () => {
  it('trata os últimos 2 dígitos digitados como centavos, sem precisar de vírgula', () => {
    expect(parseTypedAmountToCents('4')).toBe(4)
    expect(parseTypedAmountToCents('4532')).toBe(4532)
    expect(parseTypedAmountToCents('45321')).toBe(45_321)
  })

  it('ignora tudo que não for dígito', () => {
    expect(parseTypedAmountToCents('R$ 1.234,56')).toBe(123_456)
  })

  it('devolve null para texto vazio ou sem nenhum dígito', () => {
    expect(parseTypedAmountToCents('')).toBeNull()
    expect(parseTypedAmountToCents(',')).toBeNull()
  })
})

describe('centsToAmountInputText', () => {
  it('converte centavos pro texto já formatado com milhar', () => {
    expect(centsToAmountInputText(123_456)).toBe('1.234,56')
    expect(centsToAmountInputText(1)).toBe('0,01')
  })

  it('mostra vazio para zero, em vez de "0,00"', () => {
    expect(centsToAmountInputText(0)).toBe('')
  })
})
