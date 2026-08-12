# 💼 [Nome do App] — Gestão Financeira para Pequenos Negócios

> Projeto colaborativo de aprendizado, no mesmo espírito do projeto irmão DinDin-a-Dois. O objetivo #1 aqui é aprender (dev, produto, trabalho em time) — vender é objetivo secundário, pra depois.

## 🎯 O que é

Um app de gestão financeira pensado para donos de pequenos negócios informais/autônomos — motorista de app, maquiadora, cabeleireiro, pipoqueiro, ambulante, e afins. Inspirado no QuickBooks e no Wave, mas simplificado e com caráter **educativo**: o app explica conceitos como custo fixo, custo variável, margem e capital de giro no momento em que eles aparecem pela primeira vez pro usuário, no estilo do app brasileiro Nucont.

O objetivo mais importante do produto: ao final do mês, o dono do negócio tem clareza de **quanto realmente ganhou** — não só quanto entrou de receita, mas o lucro líquido de verdade.

## 👥 Time

| Nome | Papel | GitHub |
|---|---|---|
| | | |

## 🧱 Stack (proposta inicial)

- **Frontend:** React + Vite + TypeScript
- **Estilo:** Tailwind CSS
- **Backend/DB:** Supabase (Postgres + Auth + Realtime)
- **Deploy:** Vercel
- **Gerenciamento de tarefas:** GitHub Projects (aba "Projects" deste repo)

> Combinado entre vocês? Se decidirem mudar algo, atualiza aqui e registra o motivo em `docs/ARCHITECTURE.md`.

## 🚀 Rodando localmente

```bash
git clone <url-deste-repo>
cd Pequenos-Negocios
npm install
cp .env.example .env.local   # preencha com as chaves do Supabase (peça no grupo)
npm run dev
```

Precisa de um projeto Supabase configurado antes do primeiro `npm run dev` — passo a passo em [`supabase/README.md`](./supabase/README.md).

## 📁 Estrutura de pastas

```
src/
  components/     # componentes reutilizáveis de UI
  features/       # lógica por domínio (business, costs, revenue, reports, education...)
  hooks/          # hooks customizados
  lib/            # clientes (supabase, utils, etc)
  pages/          # rotas/páginas
docs/             # decisões de arquitetura, roadmap, notas
supabase/         # schema.sql (tabelas + RLS) e passo a passo de configuração
.github/          # templates de issue/PR, CI
```

## 🌱 Fluxo de trabalho (leiam antes de começar)

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) — tem o passo a passo de branches, commits e PRs.

## 🤖 Trabalhando com IA (Claude Code, Cursor, etc.)

Como o time constrói o app com ajuda de IA, temos um conjunto de guias pra isso:

- [`CLAUDE.md`](./CLAUDE.md) — contexto principal que a IA lê automaticamente (stack, convenções, regras do projeto)
- [`docs/ai/HOW_TO_WORK_WITH_AI.md`](./docs/ai/HOW_TO_WORK_WITH_AI.md) — **leiam este primeiro** se não são técnicos: como pedir tarefas, revisar PRs e evitar erros comuns
- [`docs/ai/GLOSSARY.md`](./docs/ai/GLOSSARY.md) — termos de negócio padronizados
- [`docs/ai/CODING_STANDARDS.md`](./docs/ai/CODING_STANDARDS.md) — padrões de código para a IA seguir
- [`SECURITY.md`](./SECURITY.md) — regras de segurança de dados (leitura obrigatória antes de aprovar qualquer PR que crie tabelas no banco)

## 🗺️ Roadmap

Ver [docs/ROADMAP.md](./docs/ROADMAP.md).

## 📜 Licença

MIT — ver [LICENSE](./LICENSE).
