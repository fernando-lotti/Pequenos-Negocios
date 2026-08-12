# 🧭 Padrões de Código

Regras que qualquer IA (Claude Code, Cursor, Copilot, etc.) deve seguir ao escrever código neste repositório. O objetivo é manter o código legível por um time não-técnico com a ajuda de IA, não necessariamente "o código mais elegante possível".

## Nomenclatura

- Nomes de variáveis, funções, componentes e pastas em **inglês** (convenção padrão da indústria, facilita buscar ajuda/documentação depois) — inclusive nomes de pasta dentro de `features/` (ex: `costs/`, não `custos/`).
- Textos visíveis pro usuário (labels, mensagens de erro, botões, dicas educativas) em **português**.
- Comentários no código em **português**, explicando o "porquê", não o "o quê" óbvio.
  ```ts
  // ❌ Comentário inútil
  // soma os custos
  const total = costs.reduce((a, b) => a + b, 0);

  // ✅ Comentário útil
  // Somamos aqui em vez de no banco porque precisamos combinar custo fixo
  // e variável, que ficam em categorias diferentes
  const total = costs.reduce((a, b) => a + b, 0);
  ```

## Componentes React

- Um componente por arquivo.
- Componentes de UI genéricos (botão, input, card) ficam em `components/`.
- Componentes específicos de uma funcionalidade ficam dentro de `features/nome-da-feature/`.
- Evitar componentes com mais de ~200 linhas — se passar disso, é sinal de que deveria ser quebrado em partes menores (e a IA deve sugerir isso proativamente, não só fazer).

## Tratamento de erros

- Nunca deixar um `catch` vazio ou que só faz `console.log`. Todo erro tratado precisa:
  1. Ser mostrado de forma amigável pro usuário (nada de mensagem técnica crua na tela)
  2. Ser registrado de forma que dê pra debugar depois (`console.error` com contexto, no mínimo)
- Mensagens de erro para o usuário devem ser em português e explicar o que fazer, não só "que deu erro":
  ```
  ❌ "Error: 401 Unauthorized"
  ✅ "Não conseguimos confirmar seu login. Tente entrar novamente."
  ```

## Dados sensíveis e segurança

- Nunca logar dados financeiros completos no console em produção.
- Toda tabela no Supabase relacionada a dados de um negócio deve ter **Row Level Security (RLS)** habilitada, restringindo acesso só ao usuário dono. Isso é inegociável — IA deve sempre verificar/lembrar disso ao criar tabelas novas. Ver `SECURITY.md`.
- Nunca desabilitar RLS "temporariamente pra testar" sem reativar antes de commitar.

## Cálculos financeiros

- Dinheiro é sempre armazenado e calculado em **centavos** (`_cents`, `bigint`), nunca em ponto flutuante decimal — evita erro de arredondamento.
- Toda lógica de cálculo financeiro (lucro do mês, totais por categoria, etc.) deve ser uma **função pura** (sem efeito colateral, sem chamada ao Supabase dentro dela), separada num arquivo `.ts` próprio, pra poder ser testada isoladamente dos componentes React.
- Lembre-se: este produto nunca "tranca" o passado (ver `docs/ARCHITECTURE.md`) — qualquer cálculo de lucro/caixa deve sempre ler os lançamentos atuais, nunca cachear um valor "fechado" de um mês anterior.

## Testes

- Nem tudo precisa de teste automatizado nesta fase do projeto (time pequeno, ainda validando produto).
- Priorize testes para: cálculo do lucro do mês, formatação de moeda, seleção de categorias sugeridas por tipo de negócio — qualquer lógica onde um erro silencioso causaria dado financeiro errado.
- Para o resto, teste manual guiado (a IA deve sempre explicar como testar manualmente no PR).

## Commits e PRs

- Seguir Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`) — ver `CONTRIBUTING.md`.
- Toda descrição de PR gerada por IA deve incluir uma seção "Como testar" com passo a passo simples, assumindo que quem revisa não é dev.

## Dependências

- Antes de adicionar uma biblioteca nova, verificar:
  1. Ela é ativamente mantida? (não abandonada há anos)
  2. Ela resolve um problema real que vale a complexidade extra, ou dá pra fazer simples sem ela?
  3. Explicar no PR: o que a lib faz e por que foi escolhida.
