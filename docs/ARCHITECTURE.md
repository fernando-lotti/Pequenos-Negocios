# 🏗️ Decisões de Arquitetura

Registro simples de decisões importantes — formato ADR (Architecture Decision Record) simplificado. Toda vez que o time decidir algo estrutural relevante, adiciona uma entrada aqui.

## Como preencher

```
## [Data] — Título da decisão

**Contexto:** Por que essa decisão precisou ser tomada
**Decisão:** O que foi decidido
**Alternativas consideradas:** O que mais foi avaliado
**Consequências:** Trade-offs aceitos
```

---

## [2026-08-11] — Escolha inicial de stack

**Contexto:** Precisávamos de uma stack simples de manter por um time não-técnico, com bastante conteúdo/documentação disponível.

**Decisão:** React + Vite + TypeScript no front, Tailwind CSS pro estilo, Supabase (Postgres + Auth) como backend, deploy na Vercel. Mesma stack do projeto irmão DinDin-a-Dois — reaproveita aprendizado e padrões já validados pelo time.

**Alternativas consideradas:** Next.js full-stack (mais complexidade de rotas server-side sem necessidade clara aqui); Firebase (menos flexível pra RLS relacional); backend próprio em Node/Express (manutenção extra sem ganho claro nesta fase).

**Consequências:** Time já conhece o padrão, mas herda também as limitações dele (ex: sem SSR).

---

## [2026-08-11] — Tipo de negócio: enum fixo + preset em código, não tabela configurável

**Contexto:** O app precisa se adaptar ao tipo de negócio do usuário (prestador de serviços vs. comerciante de produto), sugerindo categorias de custo diferentes pra cada um.

**Decisão:** `businesses.business_type` é um enum fixo no banco (`'service_provider' | 'product_seller'`), e um `business_subtype` (texto livre com sugestões, ex: `pipoqueiro`, `motorista_app`) alimenta um preset em `src/features/business/businessTypePresets.ts` — um arquivo de código, não uma tabela no banco. Esse preset só decide a **sugestão inicial** de categorias de custo na ficha inicial; depois disso, tudo é editável pelo usuário.

**Alternativas consideradas:** Tabela `business_types` configurável no banco, permitindo adicionar verticais sem deploy.

**Consequências:** Adicionar uma vertical nova hoje exige uma mudança de código (revisada em PR) em vez de uma edição de dado. Aceitável enquanto o número de verticais for pequeno (~5); revisitar se crescer muito ou se o time não-técnico precisar editar presets sem depender de um deploy.

---

## [2026-08-11] — RLS de dono único (não casal)

**Contexto:** Diferente do projeto irmão (dados compartilhados entre 2 pessoas de um casal), aqui cada negócio pertence a um único usuário dono.

**Decisão:** `businesses.owner_id = auth.uid()` na tabela raiz; tabelas filhas (`cost_categories`, `cost_entries`, `revenue_entries`) usam `business_id in (select id from businesses where owner_id = auth.uid())`. Ver `SECURITY.md` para o padrão completo de políticas.

**Alternativas consideradas:** Nenhuma — é o modelo mais simples possível pra esse caso (um dono, sem compartilhamento).

**Consequências:** Mais simples que o modelo do casal. Se no futuro o produto permitir múltiplos usuários por negócio (ex: um funcionário), esse modelo precisa evoluir pra algo parecido com o `couples` do projeto irmão.

---

## [2026-08-11] — Caixa é sempre calculado ao vivo, nunca uma tabela de saldo separada

**Contexto:** Era preciso decidir se "caixa" seria um saldo gerenciado manualmente/armazenado, ou algo derivado dos lançamentos.

**Decisão:** Caixa = soma de receitas menos soma de custos, calculado ao vivo a partir de `revenue_entries` e `cost_entries`. Não existe tabela de saldo. A diferença conceitual entre lucro e caixa é ensinada via dica educativa, não modelada como estrutura de dados separada.

**Alternativas consideradas:** Tabela de saldo atualizada por trigger a cada lançamento — descartada por criar risco de os dois números (calculado vs. armazenado) divergirem por bug, sem ganho de performance relevante no volume de dados esperado.

**Consequências:** Cálculo é sempre a fonte da verdade; qualquer edição em lançamento passado já reflete automaticamente em todo lugar, sem necessidade de recalcular/sincronizar nada.

---

## [2026-08-11] — Dicas educativas por conceito, mostradas na primeira exposição

**Contexto:** O caráter educativo é um objetivo central do produto — mas avisos genéricos demais tendem a ser ignorados.

**Decisão:** Cada conceito financeiro (`capital_de_giro`, `custo_fixo`, `custo_variavel`, `margem`, `lucro_liquido`, `caixa`, ...) tem uma dica curta associada, definida como conteúdo estático em `src/features/education/tips.ts`. Um hook `useConceptTip(conceptId)` mostra essa dica inline, ligada ao campo/tela onde o conceito aparece pela primeira vez pro usuário, e marca como vista em `localStorage` (por conceito, por pessoa — não por negócio).

**Alternativas consideradas:** Tabela `educational_tips` no Supabase, com "visto" salvo por usuário no banco — permitiria sincronizar entre dispositivos, mas é complexidade extra sem necessidade clara no MVP.

**Consequências:** Se o usuário trocar de dispositivo, vê as dicas de novo (aceitável no MVP). Promover pra Supabase é backlog caso vire um problema real.

---

## [2026-08-11] — Multi-negócio é suportado desde o schema até a UI

**Contexto:** Um mesmo usuário pode ter mais de um negócio (ex: motorista de app durante a semana e vendedor de doces no fim de semana).

**Decisão:** O schema já suporta múltiplos `businesses` por `owner_id` (é só um relacionamento 1-pra-muitos), e a UI do MVP já inclui um seletor de negócio ativo e um fluxo de criar um segundo negócio, reaproveitando a ficha inicial.

**Alternativas consideradas:** Suportar multi-negócio só no schema, forçando um único negócio na UI no MVP — descartado porque o time identificou que essa é uma necessidade real do público-alvo desde o início, não um "nice to have" de fase futura.

**Consequências:** Mais uma tela (seletor de negócio) no MVP, mas evita uma migração de UI dolorosa depois.

---

## [2026-08-11] — Nunca existe fechamento ou trava do passado

**Contexto:** O projeto irmão DinDin-a-Dois tem um "encontro de contas" mensal que arquiva o período e o torna imutável. Aqui a decisão foi diferente.

**Decisão:** Neste produto, um lançamento de custo ou receita de qualquer data passada pode sempre ser editado ou excluído, e todo número derivado (lucro do mês, caixa acumulado) é recalculado automaticamente a partir dos lançamentos atuais. Não existe tabela `monthly_closures` nem conceito de período congelado.

**Alternativas consideradas:** Fechamento mensal imutável (como no projeto irmão) — rejeitado deliberadamente, não só adiado: o objetivo aqui é sempre refletir a realidade mais precisa possível, mesmo que isso mude o resultado de um mês já "passado" quando o usuário corrige um erro de lançamento.

**Consequências:** Relatórios de meses anteriores podem mudar depois de gerados, se o usuário editar um lançamento antigo. Isso é esperado e correto neste produto — vale deixar isso claro na UI (ex: "estes números refletem os lançamentos atuais, incluindo edições recentes").

---

## [2026-08-12] — Excluir categoria de custo nunca é bloqueado, mesmo já usada

**Contexto:** Categorias de custo inicialmente só podiam ser desativadas (`is_active = false`), nunca excluídas de verdade, pra não perder o rótulo em lançamentos antigos. O time decidiu simplificar pra uma única ação ("Excluir"), em vez de manter dois conceitos (desativar/excluir) na UI.

**Decisão:** `cost_entries.cost_category_id` é opcional, com `on delete set null` — excluir uma categoria nunca é bloqueado. Se ela já tem lançamento, a UI mostra um aviso explicando que esses lançamentos vão ficar "sem categoria" (exibidos como tal em `CostEntryList.tsx`, contados à parte em `MonthlyProfitBreakdown.uncategorizedCostCents` pra não sumir do lucro do mês) até serem editados e reclassificados numa categoria existente.

**Alternativas consideradas:** Manter "Desativar" como única opção pra categoria já usada (rejeitada — o time preferiu uma única ação de exclusão, mais simples de entender); bloquear a exclusão com erro (`on delete restrict`, comportamento anterior) — rejeitada por ser mais frustrante pro usuário do que só avisar e seguir em frente; apagar os lançamentos junto com a categoria — rejeitada por apagar dado real de gasto do negócio.

**Consequências:** Precisa de uma tela futura pra filtrar/reclassificar lançamentos "sem categoria" em lote (ainda não construída — por enquanto, reclassificar é lançamento por lançamento, editando cada um).

---

## [2026-08-12] — Margem é uma média do mês, não por produto/serviço individual

**Contexto:** O produto não modela "produtos" ou "serviços" como entidades separadas — receita é lançada como um valor total do dia, com uma quantidade opcional (`revenue_entries.units_sold`), e custo variável também não é rateado por unidade de produto. Calcular margem por item exigiria um modelo de dados bem mais complexo (catálogo de produtos, preço e custo variável por item).

**Decisão:** A margem mostrada em `MonthlyProfitCard.tsx` é uma média do mês inteiro: `(receita do mês − custos variáveis conhecidos do mês) ÷ total de "Quantidade" preenchida nas receitas do mês` (ver `calculateMonthlyProfit` em `reports/profit.ts`, campo `marginPerUnitCents`). Custos "sem categoria" (categoria excluída, kind desconhecido) não entram nessa conta, porque não dá pra saber se eram variáveis. Quando ninguém preencheu "Quantidade" em nenhuma receita do mês, o campo fica `null` e a tela pede pra preencher esse campo.

**Alternativas consideradas:** Modelar produtos/serviços com preço e custo variável próprios, permitindo margem exata por item — rejeitada por ora por ser complexidade grande demais pro estágio atual do produto (exigiria repensar os formulários de custo e receita); deixar margem de fora até ter esse modelo — rejeitada porque uma média já é útil pro objetivo educativo do produto, mesmo sendo uma aproximação.

**Consequências:** A margem é uma aproximação (mistura todos os produtos/serviços do negócio numa média só) — aceitável para o público-alvo do MVP, mas deve ficar claro na UI que é uma média. Se o produto evoluir pra suportar catálogo de itens (backlog), a margem por item vira uma melhoria natural sobre esse cálculo.

---

## [2026-08-12] — Retirada de caixa: tabela própria, fora do lucro, lançada na aba Início

**Contexto:** O modelo original só tinha custo e receita — não havia como registrar que o dono tirou dinheiro do caixa pra uso pessoal, o que fazia o "Caixa" do Dashboard mostrar um valor maior do que o realmente disponível assim que isso acontecesse (issue #8).

**Decisão:** Nova tabela `withdrawals` (mesmo padrão de RLS de dono único das outras tabelas, ver `SECURITY.md`), com `business_id`, `withdrawal_date`, `amount_cents`, `notes`. Retirada **não** é um `cost_entry` e não entra em `calculateMonthlyProfit` — ela só desconta de `calculateAccumulatedCash` (ver `reports/profit.ts`), porque não é gasto do negócio, é dinheiro que já saiu do caixa pro bolso do dono. A tela de lançar/editar/excluir retirada fica na aba **Início** (Dashboard), logo abaixo do card de Caixa — não virou uma aba nova no menu inferior, pra não lotar a navegação com uma ação que costuma ser esporádica (diferente de custo/receita, lançados quase todo dia). Relatórios mostra o total retirado do mês num card separado do detalhamento de custos, reforçando que lucro ≠ quanto o dono já tirou pra si (dica educativa nova: `retirada_de_caixa`).

**Alternativas consideradas:** Modelar retirada como um `cost_entry` de uma categoria especial "Retirada" — rejeitada porque distorceria o lucro do mês (reduziria artificialmente, contradizendo o objetivo #1 do produto de mostrar lucro real); aba própria "Retiradas" no menu inferior, paralela a Custos/Receitas — rejeitada por enquanto porque o menu já tem 5 abas e retirada é uma ação mais esporádica, não diária.

**Consequências:** Se o uso mostrar que retirada é lançada com bastante frequência, vale revisitar e promover pra aba própria no menu inferior.

---

## [2026-08-12] — Meta mensal: lucro ou faturamento, campo simples em `businesses`

**Contexto:** O time queria uma forma de acompanhar progresso rumo a um objetivo do mês, mas lucro e faturamento (receita bruta) são números bem diferentes — nem todo negócio quer acompanhar o mesmo.

**Decisão:** Duas colunas opcionais em `businesses` — `monthly_goal_cents` e `monthly_goal_type` (`'profit' | 'revenue'`) — em vez de uma tabela própria de "metas". O dono escolhe o tipo ao definir a meta em Ajustes (`MonthlyGoalForm.tsx`); o Dashboard mostra uma barra de progresso comparando o lucro ou faturamento do **mês atual** (sempre recalculado ao vivo, igual todo o resto do produto) contra essa meta (`MonthlyGoalCard.tsx`, `reports/goalProgress.ts`). Mesmo padrão já usado pra `working_capital_goal_cents`: meta é sempre um valor único (não há histórico de metas passadas).

**Alternativas consideradas:** Tabela própria `monthly_goals` com uma linha por mês/negócio, permitindo metas diferentes a cada mês e um histórico — rejeitada por enquanto por adicionar complexidade (mais uma tabela, mais RLS) sem uma necessidade clara ainda; forçar só meta de lucro (sem escolha de tipo) — rejeitada porque faturamento é mais fácil de entender pra quem está começando, e lucro é mais alinhado ao objetivo #1 do produto, então faz sentido deixar a pessoa escolher.

**Consequências:** A meta é sempre "a atual" — trocar o valor no meio do mês substitui a meta anterior, sem guardar o que era antes. Se o produto evoluir pra precisar de metas por mês específico (ex: comparar metas de meses diferentes num relatório), isso vira uma tabela própria depois.

---

## [2026-08-12] — Calculadora de preço de venda usa margem em R$, não em porcentagem

**Contexto:** Precisávamos de uma calculadora simples pra ajudar o dono a decidir por quanto vender algo, mas o app já tem um significado estabelecido pra "margem" (valor em R$ que sobra por unidade, ver `reports/profit.ts` e `GLOSSARY.md`) — diferente do "markup"/margem percentual comum em outras ferramentas.

**Decisão:** A calculadora (`features/pricing/`) pede custo da unidade e margem desejada, os dois em R$, e soma os dois pra sugerir o preço (`calculateSuggestedPrice`). Não persiste nada no banco — é só uma ferramenta de apoio, sem lançamento nem histórico. Mostra a porcentagem que a margem representa do preço final como informação extra (não como campo de entrada), pra não misturar dois jeitos de pensar em margem na mesma tela.

**Alternativas consideradas:** Pedir a margem como porcentagem do preço de venda (comum em outras ferramentas, ex: "quero 30% de margem") — rejeitada porque criaria um segundo significado de "margem" dentro do mesmo app, o que é confuso justamente pro público que o produto quer educar.

**Consequências:** Quem já está acostumado a pensar em margem como porcentagem precisa converter mentalmente pra R$ antes de usar a calculadora — aceitável porque a tela já mostra a porcentagem equivalente depois do cálculo, e mantém consistência com o resto do app.

---

## [2026-08-12] — Ponto de equilíbrio reaproveita fixedCostCents e marginPerUnitCents, sem novo dado

**Contexto:** Queríamos mostrar quantas vendas/atendimentos faltam pra cobrir os custos fixos do período (issue #21), mas o produto já calcula tudo que é preciso pra isso: `fixedCostCents` e `marginPerUnitCents` (`reports/profit.ts`).

**Decisão:** `calculateBreakEven` (`reports/breakEven.ts`) é só `Math.ceil(fixedCostCents / marginPerUnitCents)`, arredondado pra cima porque não existe "meia venda". Herda a mesma limitação da margem: só aparece quando `marginPerUnitCents` não é `null` (a pessoa precisa ter preenchido "Quantidade" em pelo menos uma receita do período). Quando a margem é zero ou negativa, o card não mostra um número de vendas (matematicamente daria infinito ou negativo) — mostra uma mensagem orientando a revisar preço/custo variável em vez disso.

**Alternativas consideradas:** Nenhuma alternativa de cálculo — é a fórmula padrão de ponto de equilíbrio. A única decisão real foi como lidar com margem ≤ 0, e optamos por uma mensagem explicativa em vez de esconder o card silenciosamente, pra reforçar o caráter educativo do produto.

**Consequências:** Herda a mesma aproximação da margem (é uma média do período, não por produto/serviço individual — ver ADR "Margem é uma média do mês").

---

## [2026-08-12] — Projeção de fim de mês: média diária simples, calculada só até hoje

**Contexto:** Queríamos dar uma ideia de "como o mês deve terminar" no Dashboard (issue #22), sem construir um modelo de previsão sofisticado — o público-alvo se beneficia mais de uma estimativa simples e clara do que de uma "IA prevendo o futuro".

**Decisão:** `calculateMonthEndProjection` (`reports/monthEndProjection.ts`) pega receita e custo acumulados **do início do mês até hoje** (não até o fim do mês) e extrapola linearmente pelos dias que faltam: `valor até hoje ÷ dias já passados × total de dias do mês`. Importante: o Dashboard calcula esse breakdown "até hoje" separado do breakdown do mês inteiro (`DashboardPage.tsx`, `breakdownSoFar`), porque o produto permite datar lançamentos no futuro (não trava datas) — usar o breakdown do mês inteiro contaria custos/receitas ainda não realizados como se já tivessem acontecido, inflando a base da projeção.

**Alternativas consideradas:** Média móvel dos últimos N dias (mais sensível a mudanças recentes de ritmo) — descartada por ser mais difícil de explicar pro time não-técnico do que uma média simples do mês inteiro; não mostrar projeção nenhuma até o mês estar mais avançado (ex: só a partir do dia 5) — descartada porque a UI já deixa claro que é uma estimativa, e um número aproximado desde o dia 1 ainda é mais útil do que nenhum número.

**Consequências:** A projeção é bem instável nos primeiros dias do mês (uma venda grande no dia 1 pode projetar um mês inteiro exagerado) — aceitável porque o texto já avisa "fica mais confiável conforme o mês avança", mas vale revisitar se isso confundir os usuários na prática.

---

## [2026-08-12] — Ranking de custos por categoria estende totalsByCategory, filtragem de período fica na página

**Contexto:** Queríamos um ranking das categorias de custo do período, da que mais pesa pra que menos pesa (issue #23). `costs/calculations.ts` já tinha `totalsByCategory`, que soma por categoria mas não ordena, não resolve nome, e não calcula porcentagem do total.

**Decisão:** Nova função `rankCostsByCategory(entries, categories)` em `costs/calculations.ts`, reaproveitando `totalsByCategory` por dentro, que resolve o nome de cada categoria, calcula `percentOfTotal` e ordena do maior pro menor. Ela não sabe nada sobre "período" — recebe os lançamentos já filtrados. Quem filtra por período é `ReportsPage.tsx`, com o mesmo filtro inclusivo de datas (`costDate >= startDate && costDate <= endDate`) já usado em `calculateProfitForPeriod`, mantendo a lógica de filtro de data centralizada num padrão só, mesmo que reaproveitada em dois lugares.

**Alternativas consideradas:** Fazer `rankCostsByCategory` receber `startDate`/`endDate` e filtrar internamente — rejeitado porque duplicaria a regra de filtro de data que já vive implicitamente em `profit.ts`, e misturaria duas responsabilidades (agrupar por categoria + filtrar por data) na mesma função.

**Consequências:** Nenhuma — é aditivo, não muda nenhum cálculo existente. `totalsByCategory` continua exportada e usável isoladamente (hoje só usada internamente por `rankCostsByCategory`).

---

## [2026-08-12] — Alertas de saúde financeira: regras fixas em código, sem tabela de configuração

**Contexto:** Queríamos transformar números que o app já mostra em avisos ativos (issue #24), sem virar um sistema de notificação nem um "score financeiro" complexo.

**Decisão:** `calculateFinancialAlerts` (`reports/financialAlerts.ts`) recebe os números já calculados (custo fixo, receita, caixa, meta de capital de giro) e devolve uma lista de alertas com base em duas regras fixas no código: custo fixo consumindo mais de 50% da receita do período, e caixa abaixo da meta de capital de giro (quando definida). `FinancialAlertsCard.tsx`, no Dashboard, só renderiza algo quando a lista não está vazia — sem alerta ativo, o card nem entra no DOM. Os limiares (ex: 50%) são constantes no código, não configuráveis pelo usuário nesta primeira versão.

**Consequências:** O alerta de "caixa abaixo da meta" depende de `working_capital_goal_cents`, que existe no banco desde o início mas **não tem nenhuma tela pra editar** — hoje é sempre `null` na prática, então esse alerta específico não dispara pra ninguém ainda. Registrado como pendência no backlog (`docs/ROADMAP.md`); não resolvido nesta issue pra não misturar duas mudanças de escopos diferentes no mesmo PR. O limiar de 50% pro custo fixo é um valor de referência do time, não uma regra contábil — pode precisar de ajuste depois de observar uso real.

**Alternativas consideradas:** Tornar os limiares configuráveis por negócio (ex: "me avise quando custo fixo passar de X%") — rejeitado por ora por adicionar mais um formulário de configuração sem validação de que o valor fixo de 50% já não é suficiente.
