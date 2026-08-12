# 🤝 Como trabalhamos neste repo

Regras simples pra ninguém pisar no pé de ninguém.

## 1. Branches

- `main` → sempre estável, é o que está (ou vai) em produção. Ninguém commita direto nela.
- `feature/nome-curto` → para novas funcionalidades (ex: `feature/ficha-inicial`)
- `fix/nome-curto` → para correções de bugs
- `chore/nome-curto` → para tarefas de manutenção (configs, deps, docs)

Fluxo:
```bash
git checkout main
git pull
git checkout -b feature/ficha-inicial
# ... trabalha ...
git push origin feature/ficha-inicial
```
Depois abre um Pull Request para `main`.

## 2. Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) — ajuda a entender o histórico e, no futuro, até gerar changelog automático.

```
feat: adiciona ficha inicial de cadastro do negócio
fix: corrige cálculo do lucro do mês
chore: atualiza dependências
docs: atualiza README com instruções de setup
refactor: reorganiza hooks de custos
```

## 3. Pull Requests

- **Não é obrigatório** que outra pessoa aprove antes do merge — quem abriu o PR pode revisar o próprio trabalho e mergear direto quando estiver satisfeito. (O GitHub, aliás, nem deixa clicar em "Approve" no próprio PR — isso é normal, é só mergear mesmo sem esse clique.)
- Ainda assim, descreva o que mudou e por quê — o template do PR já vem com uma checklist. Isso é documentação pra depois, não só formalidade pra alguém aprovar.
- PRs pequenos e frequentes > PRs gigantes que ninguém consegue revisar direito. Isso é especialmente importante pra aprendizado: dá pra discutir cada decisão.
- Pra mudanças mais arriscadas (ex: mexe em RLS, autenticação, cálculo de dinheiro), vale a pena pedir uma segunda opinião de outra pessoa do time antes de mergear — mas fica a critério de quem está mergeando, não é uma trava do processo.

## 4. Issues

- Toda funcionalidade ou bug vira uma issue antes de virar código, mesmo que seja rascunho.
- Usem os templates em `.github/ISSUE_TEMPLATE`.
- Organizem no GitHub Projects (Kanban): `Backlog → Em progresso → Em revisão → Concluído`.

## 5. Code review — como dar feedback

Já que o foco é aprender:
- Comentem o "porquê", não só o "o quê" ("isso pode causar re-render desnecessário porque..." em vez de só "muda isso").
- Perguntem quando não entenderem uma decisão — é sinal de que vale documentar melhor, não falha de quem perguntou.
- Aprovem com sugestões de melhoria não-bloqueantes quando o código funciona mas dá pra evoluir depois.

## 6. Reuniões / alinhamento

Sugestão: 1 checkpoint semanal curto (15-20min) pra alinhar o que cada um está fazendo e evitar trabalho duplicado, além de assíncrono via issues/PRs comments.
