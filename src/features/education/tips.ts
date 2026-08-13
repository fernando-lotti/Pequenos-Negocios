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
    body: 'É o gasto que muda de acordo com o quanto você vende ou trabalha — quanto mais você vende, mais desse custo você tem. Exemplos: combustível de mais corridas, embalagens de mais vendas, ou o insumo consumido em cada venda/atendimento (milho e óleo de uma pipoca, produto usado numa maquiagem).',
  },
  margem: {
    id: 'margem',
    title: '💡 O que é margem?',
    body: 'É quanto sobra de cada venda ou atendimento depois de descontar só o custo variável dela (o insumo, por exemplo) — sem contar os custos fixos do mês, como aluguel. Aqui mostramos a margem média: pegamos a receita do mês menos os custos variáveis do mês, e dividimos pela quantidade vendida. Por isso ela só aparece se você preencher "Quantidade" ao lançar suas receitas.',
  },
  retirada_de_caixa: {
    id: 'retirada_de_caixa',
    title: '💡 Retirada não é a mesma coisa que custo',
    body: 'Quando você tira dinheiro do caixa do negócio pra uso pessoal, isso reduz o caixa (quanto dinheiro sobra), mas não é um gasto do negócio — por isso não é descontado do seu lucro. O lucro mostra quanto o negócio gerou; a retirada mostra quanto disso você já tirou pra você.',
  },
  ponto_de_equilibrio: {
    id: 'ponto_de_equilibrio',
    title: '💡 O que é ponto de equilíbrio?',
    body: 'É a quantidade de vendas ou atendimentos que você precisa fazer só pra cobrir os custos fixos do período (aluguel, parcelas, etc.). Antes de bater esse número, cada venda ainda está "pagando" seus custos fixos; depois dele, o que sobra de cada venda vira lucro de verdade.',
  },
}
