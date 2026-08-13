# 📖 Glossário do domínio

Termos de negócio usados neste projeto, e o nome técnico correspondente que deve ser usado no código (tabelas, variáveis, componentes). Manter esses nomes consistentes evita a IA (ou uma pessoa nova no time) inventar um segundo nome pro mesmo conceito.

| Termo | Significado | Nome técnico sugerido |
|---|---|---|
| Negócio | O negócio de um usuário (ex: "a barraca de pipoca do João") | `business` (tabela `businesses`) |
| Tipo de negócio | Prestador de serviços ou comerciante de produto | `business_type` |
| Subtipo de negócio | Segmento sugerido dentro de um tipo (ex: pipoqueiro, motorista de app) | `business_subtype` |
| Prestador de serviços | Cobra por serviço/atendimento/hora (motorista, maquiadora, cabeleireiro...) | `service_provider` |
| Comerciante de produto | Compra insumo/mercadoria e vende produto (pipoqueiro, ambulante...) | `product_seller` |
| Ficha inicial | Cadastro guiado do negócio, feito uma vez, que sugere as categorias de custo iniciais | (fluxo de onboarding, sem tabela própria) |
| Categoria de custo | Agrupamento de custos (ex: "Aluguel da cadeira", "Embalagens") | `cost_category` (tabela `cost_categories`) |
| Custo fixo | Custo que não varia com o volume de vendas/atendimentos (ex: aluguel) | `kind = 'fixed'` |
| Custo variável | Custo que varia com o volume de vendas/atendimentos (inclui insumo — material consumido por venda/atendimento, como milho e óleo de um pipoqueiro) | `kind = 'variable'` |
| Lançamento de custo | Um registro de gasto numa categoria, numa data | `cost_entry` (tabela `cost_entries`) |
| Lançamento sem categoria | Lançamento de custo cuja categoria foi excluída — continua contando no lucro do mês, mas fora do detalhamento fixo/variável, até ser reclassificado | `cost_category_id = null` |
| Receita | Dinheiro recebido por uma venda/atendimento | `revenue` |
| Categoria de receita | Rótulo livre pra separar de onde vem a receita (ex: "Pipoca doce", "Pipoca salgada") — diferente de categoria de custo, não tem "tipo" | `revenue_category` (tabela `revenue_categories`) |
| Registro diário de receita | Lançamento de receita do dia (valor, unidades opcional, categoria opcional) | `revenue_entry` (tabela `revenue_entries`) |
| Caixa | Saldo calculado (receitas menos custos), nunca armazenado numa tabela própria | (calculado, ver `reports/profit.ts`) |
| Capital de giro | Reserva de dinheiro pra cobrir custos até a próxima entrada de receita | `working_capital_goal_cents` (campo opcional em `businesses`) |
| Meta mensal | Valor de lucro ou faturamento que o dono define pra acompanhar o progresso do mês, com barra de progresso no Dashboard | `monthly_goal_cents` + `monthly_goal_type` (campos opcionais em `businesses`, ver `reports/MonthlyGoalCard.tsx`) |
| Margem | Diferença entre o preço de venda e o custo variável de uma unidade. Calculada como média do mês: (receita − custos variáveis) ÷ unidades vendidas | (calculado, ver `reports/profit.ts`, campo `marginPerUnitCents`) |
| Lucro líquido | Receitas do mês menos todos os custos (fixos + variáveis) do mês | (calculado, ver `reports/profit.ts`) |
| Retirada de caixa | Dinheiro que o dono tira do caixa do negócio pra uso pessoal — reduz o caixa, mas não é custo do negócio, então não entra no cálculo de lucro | `withdrawal` (tabela `withdrawals`) |
| Ponto de equilíbrio | Quantidade de vendas/atendimentos necessária pra cobrir o custo fixo do período: custo fixo ÷ margem por unidade | (calculado, ver `reports/breakEven.ts`) |
| Projeção de fim de mês | Estimativa de receita/custo/lucro até o fim do mês, extrapolando a média diária observada até hoje | (calculado, ver `reports/monthEndProjection.ts`) |
| Ranking de custos | Categorias de custo do período ordenadas da que mais pesa pra que menos pesa, com % do total | (calculado, ver `costs/calculations.ts`, `rankCostsByCategory`) |
| Alerta de saúde financeira | Aviso ativo gerado a partir de uma regra simples sobre os números do mês (ex: custo fixo alto, caixa abaixo da meta) | (calculado, ver `reports/financialAlerts.ts`) |
| Dica educativa | Explicação curta de um conceito financeiro, mostrada na primeira vez que ele aparece | `concept_tip` (conteúdo estático, ver `education/tips.ts`) |
| Conceito | Identificador de um termo financeiro que tem dica educativa associada | `concept_id` (ex: `capital_de_giro`, `custo_fixo`) |

## Como adicionar um termo novo

1. Adicione a linha na tabela acima.
2. Se já existe código usando um nome diferente pro mesmo conceito, registre isso como pendência em uma issue de "renomear X para Y" — não deixe nomes divergentes acumularem silenciosamente.
