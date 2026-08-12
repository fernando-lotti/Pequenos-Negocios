export function formatCurrencyBRL(valueCents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueCents / 100)
}

// Insere pontos de milhar na parte inteira do texto (ex: "1234,5" ->
// "1.234,5"). Usada por centsToAmountInputText pra formatar o valor final
// que vai aparecer no campo.
export function formatAmountInputText(input: string): string {
  const cleaned = input.replace(/[^\d,]/g, '')
  const commaIndex = cleaned.indexOf(',')
  const integerPart = commaIndex === -1 ? cleaned : cleaned.slice(0, commaIndex)
  const decimalPart = commaIndex === -1 ? '' : cleaned.slice(commaIndex + 1).replace(/,/g, '').slice(0, 2)

  const integerWithDots = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return commaIndex === -1 ? integerWithDots : `${integerWithDots},${decimalPart}`
}

// Converte centavos pro texto do input de valor, já com separador de milhar
// (ex: 123456 -> "1.234,56"). Usada pra pré-carregar o campo ao editar algo
// (custo, receita) — mesmo formato que formatAmountInputText produz ao digitar.
export function centsToAmountInputText(cents: number): string {
  if (cents === 0) return ''
  return formatAmountInputText((cents / 100).toFixed(2).replace('.', ','))
}

// Lê o texto atual do campo de valor e devolve o total em centavos,
// tratando os dígitos digitados como um caixa eletrônico: os 2 últimos
// dígitos são sempre os centavos, na ordem em que foram digitados — igual
// a maioria dos apps de banco (ex: digitar "4","5","3","2","1","8" mostra
// "4,53" -> "45,32" -> "453,21" -> "4.532,18"). Isso evita depender da
// pessoa acertar o toque no botão de vírgula, que em alguns celulares não
// funciona direito. Ignora qualquer caractere que não seja dígito, então
// funciona mesmo colando um valor já formatado (ex: "R$ 1.234,56").
export function parseTypedAmountToCents(input: string): number | null {
  const digitsOnly = input.replace(/\D/g, '')
  if (!digitsOnly) return null
  return Number(digitsOnly)
}
