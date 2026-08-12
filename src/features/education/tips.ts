export interface ConceptTipContent {
  id: string
  title: string
  body: string
}

// Cada dica é ligada a um "conceito" financeiro, mostrada inline (ver
// ConceptTip.tsx) na primeira vez que o conceito aparece pro usuário — não
// é um aviso genérico solto (ver ADR "Dicas educativas por conceito" em
// docs/ARCHITECTURE.md).
export const CONCEPT_TIPS: Record<string, ConceptTipContent> = {
  capital_de_giro: {
    id: 'capital_de_giro',
    title: '💡 O que é capital de giro?',
    body: 'É o dinheiro que você mantém guardado pra pagar os custos do negócio (insumos, aluguel, etc.) até a próxima venda entrar. Sem essa reserva, um mês mais fraco pode te deixar sem dinheiro pra comprar o que precisa pra continuar trabalhando.',
  },
  lucro_caixa: {
    id: 'lucro_caixa',
    title: '💡 Lucro não é a mesma coisa que caixa',
    body: 'Caixa é o dinheiro que está na sua mão agora. Lucro é o que sobra depois de descontar todos os custos do período. Você pode ter dinheiro no bolso hoje e mesmo assim estar tendo prejuízo no mês — por isso vale sempre olhar os dois números.',
  },
  custo_fixo: {
    id: 'custo_fixo',
    title: '💡 O que é custo fixo?',
    body: 'É todo gasto que continua igual independente de quanto você vender ou trabalhar naquele mês — como aluguel ou uma parcela de financiamento. Mesmo sem vender nada, esse custo existe.',
  },
  custo_variavel: {
    id: 'custo_variavel',
    title: '💡 O que é custo variável?',
    body: 'É o gasto que muda de acordo com o quanto você vende ou trabalha — quanto mais você vende, mais desse custo você tem (ex: combustível de mais corridas, embalagens de mais vendas).',
  },
  insumo: {
    id: 'insumo',
    title: '💡 O que é insumo?',
    body: 'É o material que se transforma ou é consumido em cada venda ou atendimento — como o milho e o óleo de uma pipoca, ou o produto usado numa maquiagem. Sem insumo, não tem o que vender.',
  },
}
