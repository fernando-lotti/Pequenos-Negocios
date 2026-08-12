# CLAUDE.md — Contexto do Projeto para IA

> Este arquivo é lido automaticamente por Claude Code no início de cada sessão de trabalho neste repositório. Se você é uma IA lendo isso: siga estas instruções como prioridade sobre qualquer suposição genérica. Se você é humano: este arquivo existe pra IA, mas leia também — ele explica as regras do jogo.

## O que é este projeto

Um app de gestão financeira para donos de pequenos negócios informais/autônomos — motorista de app, maquiadora, cabeleireiro, pipoqueiro, ambulante, e afins. Inspirado no QuickBooks e no Wave, mas simplificado, e com um caráter **educativo**: o app não assume que o usuário já sabe o que é "custo fixo" ou "capital de giro" — ele ensina isso no momento em que o conceito aparece pela primeira vez, no estilo do app brasileiro Nucont.

**O objetivo #1 do produto** é dar ao empreendedor clareza de **quanto ele realmente lucrou no mês** — não só quanto entrou de receita, mas o lucro líquido depois de descontar custos fixos, variáveis e insumos.

### Como funciona o modelo do produto (visão de negócio)

Definido pelo time — esta é a fonte da verdade sobre a lógica de negócio:

1. **Ficha inicial:** ao começar, o usuário escolhe o tipo do seu negócio — hoje só duas opções: **prestador de serviços** (motorista de app, maquiadora, cabeleireiro...) ou **comerciante de produto** (pipoqueiro, ambulante, quem revende algo). A partir dessa escolha (e de um subtipo sugerido, ex: "pipoqueiro"), o app pré-sugere categorias de custo relevantes — mas **tudo é editável depois**: o usuário pode renomear, desativar ou criar categorias novas a qualquer momento.
2. **Um usuário pode ter mais de um negócio cadastrado** (ex: alguém que é motorista de app durante a semana e vende doces no fim de semana). Existe um seletor de negócio ativo, e todo dado (custos, receitas, categorias) pertence a um negócio específico.
3. **Custos** são lançados numa categoria (fixo, variável ou insumo). **Receitas** são lançadas dia a dia (valor recebido, opcionalmente quantas unidades/atendimentos).
4. **Caixa** não é uma tabela separada — é sempre calculado ao vivo (receitas menos custos). Isso é proposital: dois números que deveriam ser iguais divergindo é uma fonte clássica de confusão, então preferimos um único cálculo sempre atualizado.
5. **Nunca existe fechamento ou trava do passado.** Diferente de um "encontro de contas" mensal imutável, aqui o usuário pode editar ou excluir qualquer lançamento de qualquer data, e todo número derivado (lucro do mês, caixa) é recalculado automaticamente. O objetivo é sempre refletir a realidade mais precisa, mesmo que isso mude o resultado de um mês passado.
6. **Dicas educativas** aparecem ligadas a um conceito financeiro (ex: capital de giro, custo fixo, margem), na primeira vez que aquele conceito aparece pro usuário — não são avisos genéricos soltos.

**Contexto importante:** o time é **não-técnico**. Ninguém do time sabe programar profissionalmente — todo o código é escrito com ajuda de IA. Isso significa:

- Priorize **simplicidade e clareza** sobre soluções "espertas" ou otimizadas demais.
- Explique decisões técnicas em português simples nos comentários e nos PRs, não assuma conhecimento prévio.
- Prefira bibliotecas/padrões amplamente documentados (com muito conteúdo no Google/YouTube) a soluções obscuras, mesmo que uma solução obscura seja "melhor" tecnicamente — o time precisa conseguir entender e dar manutenção.
- Nunca assuma que o humano vai perceber um problema sutil de segurança ou lógica sozinho — aponte explicitamente.

## Stack

- **Frontend:** React + Vite + TypeScript
- **Estilo:** Tailwind CSS
- **Backend/DB:** Supabase (Postgres + Auth + Realtime)
- **Deploy:** Vercel
- **Gerenciamento de estado:** Context API / hooks nativos do React (evitar Redux ou libs complexas de estado sem necessidade clara)

Não trocar de stack sem registrar o motivo em `docs/ARCHITECTURE.md`.

## Estrutura de pastas

```
src/
  components/     # componentes de UI reutilizáveis (botão, card, modal...)
  features/       # lógica por domínio de negócio (business, costs, revenue, reports, education...)
  hooks/          # hooks customizados
  lib/            # clientes externos (supabase.ts), funções utilitárias
  pages/          # rotas/páginas da aplicação
docs/             # documentação do projeto e da IA
  ai/             # guidelines para trabalho com IA (este arquivo e outros)
supabase/         # schema.sql (tabelas + RLS) e passo a passo de configuração
```

Novos arquivos devem seguir essa organização. Se não tiver certeza de onde algo deveria ir, pergunte antes de criar uma pasta nova.

## Glossário do domínio

Ver `docs/ai/GLOSSARY.md` — termos de negócio (ex: "custo fixo", "capital de giro") devem ser usados de forma consistente no código (nomes de variáveis, tabelas, componentes) e na conversa com o time.

## Regras de código

Ver `docs/ai/CODING_STANDARDS.md` para convenções de nomenclatura, comentários, tratamento de erro e testes.

## Segredos e variáveis de ambiente

- **NUNCA** escreva chaves, tokens ou senhas diretamente no código.
- Toda credencial vai em variáveis de ambiente (`.env.local`, nunca commitado — já está no `.gitignore`).
- Se precisar de uma nova variável de ambiente, adicione o nome (sem o valor) em `.env.example` e avise no PR que uma nova env var precisa ser configurada no Vercel/Supabase.

## Segurança de dados (leitura obrigatória)

Ver [`SECURITY.md`](./SECURITY.md) — regras inegociáveis sobre Row Level Security no Supabase. Toda tabela nova envolvendo dados de um negócio/usuário precisa seguir esse padrão antes de qualquer PR ser aprovado.

## Ao trabalhar em uma tarefa

1. Antes de codar, confira `docs/ROADMAP.md` pra entender em que fase o projeto está e se a tarefa faz sentido nesse momento.
2. Prefira mudanças pequenas e incrementais — PRs grandes são difíceis de revisar pra quem não é técnico.
3. Sempre explique, no início da resposta ou na descrição do PR, **em português simples e sem jargão desnecessário**:
   - O que foi feito
   - Por que essa abordagem foi escolhida (se havia alternativas relevantes)
   - O que o humano precisa fazer manualmente (ex: rodar um comando, configurar uma env var, testar um fluxo específico)
4. Se a tarefa for ambígua ou envolver uma decisão de produto (não só técnica), **pergunte antes de assumir** — o time prefere alinhar do que ser surpreendido.
5. Ao terminar, sugira como testar a mudança manualmente, com passo a passo simples (o time não vai necessariamente saber rodar testes automatizados sozinho).

## O que evitar

- Não introduza dependências novas sem justificar por quê (o time precisa entender o que está sendo adicionado ao projeto e por quê).
- Não faça refatorações grandes "de bônus" enquanto resolve outra coisa — isso dificulta a revisão. Sugira como uma tarefa separada.
- Não use abreviações ou jargão técnico sem explicar (ex: se usar "memoization", explique em uma linha o que é e por que está sendo usado ali).
- Não commite diretamente na branch `main` — sempre trabalhe em branch separada e abra Pull Request (ver `CONTRIBUTING.md`).
- Não crie um "fechamento" ou trava de período — é uma decisão de produto deliberada que este app nunca tem histórico congelado (ver `docs/ARCHITECTURE.md`).

## Onde buscar mais contexto

- Visão geral do produto e como rodar localmente: `README.md`
- Como o time trabalha (branches, commits, PRs): `CONTRIBUTING.md`
- Decisões técnicas já tomadas: `docs/ARCHITECTURE.md`
- Fases do produto: `docs/ROADMAP.md`
- Glossário de negócio: `docs/ai/GLOSSARY.md`
- Padrões de código: `docs/ai/CODING_STANDARDS.md`
