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
