# 🔒 SECURITY.md — Segurança de Dados

> Este é o documento mais importante do projeto. Estamos lidando com dados financeiros de pessoas reais (quanto ganham, gastam, o negócio delas) — um vazamento (ex: uma pessoa vendo os dados financeiros do negócio de outra) destrói a confiança no app instantaneamente. IA trabalhando neste repositório deve tratar este arquivo como regra inegociável, não sugestão.

## Por que isso é crítico aqui

Cada linha de dado no banco (um custo, uma receita, um negócio) pertence a **um único usuário dono**. Isso parece simples, mas é exatamente o tipo de regra que é fácil configurar errado sem perceber — o app "parece" funcionar normalmente nos testes (porque você só testa com o seu próprio usuário) e o problema só aparece quando um segundo usuário também está usando o sistema.

## O conceito central: Row Level Security (RLS)

**Analogia:** pensa no banco de dados como um arquivo de gaveta física com pastas de todos os usuários misturadas. Sem RLS, é como se qualquer pessoa com a chave do prédio (a chave de conexão com o banco) pudesse abrir qualquer gaveta. RLS é como colocar uma trava em cada pasta que só abre com a "identidade" de quem está pedindo — o próprio banco de dados verifica "essa pessoa que está pedindo esse dado tem permissão pra ver ele?" antes de entregar qualquer coisa, **mesmo que o código do app tenha um bug**.

Isso é essencial porque: se a regra de segurança estivesse só no código do app (ex: "só mostra na tela se for do mesmo dono"), um bug no código, uma tela esquecida sem essa verificação, ou alguém copiando parte de uma API sem essa checagem — qualquer um desses erros vaza dado de um usuário pro outro. Com RLS, a trava está no banco, então mesmo com bug no app, o banco recusa entregar o dado errado.

## Regra inegociável

> **Toda tabela no Supabase que contenha dados de um negócio (negócios, categorias de custo, lançamentos de custo, lançamentos de receita, etc.) DEVE ter Row Level Security habilitado, com uma política que restrinja o acesso apenas ao usuário dono daquele negócio.**

Nenhuma tabela nova deve ser criada sem essa política já definida. Se a IA criar uma tabela e não configurar RLS, isso é um bug crítico, não um detalhe a ajustar depois.

## Como isso deve ser verificado, sempre

Checklist que a IA deve rodar mentalmente (e comunicar ao time) toda vez que criar ou alterar uma tabela:

- [ ] RLS está **habilitado** na tabela? (`ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;`)
- [ ] Existe uma política de `SELECT` que restringe a linha ao usuário dono daquele dado (direto, via `owner_id`, ou indireto, via `business_id` que aponta pra um negócio daquele dono)?
- [ ] Existe uma política de `INSERT` que impede alguém de inserir um dado "em nome" de um negócio que não é seu?
- [ ] Existe uma política de `UPDATE`/`DELETE` com a mesma restrição?
- [ ] Foi testado com **duas contas de usuários diferentes** — não só testando com o próprio usuário — pra confirmar que um não vê o dado do outro?

## Exemplo de política RLS (referência para a IA usar como padrão)

```sql
-- Tabela raiz: cada negócio pertence a um único dono
alter table businesses enable row level security;

create policy "Dono vê os próprios negócios"
on businesses for select
using (owner_id = auth.uid());

create policy "Dono cria negócio pra si mesmo"
on businesses for insert
with check (owner_id = auth.uid());

-- Tabelas filhas (ex: cost_entries) não têm owner_id direto — elas apontam
-- pra um negócio, então a política verifica se aquele negócio é do usuário
alter table cost_entries enable row level security;

create policy "Dono vê os custos dos próprios negócios"
on cost_entries for select
using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono lança custos nos próprios negócios"
on cost_entries for insert
with check (business_id in (select id from businesses where owner_id = auth.uid()));
```

A IA deve adaptar esse padrão pra cada tabela nova, sempre no formato: "essa linha pertence a um negócio → esse negócio precisa ser do usuário logado".

## Nunca fazer

- 🚫 Desabilitar RLS "só pra testar mais rápido" e esquecer de reabilitar antes do commit.
- 🚫 Criar uma política que libera acesso geral (`using (true)`) como atalho "temporário" — isso quase sempre vira permanente por esquecimento.
- 🚫 Confiar apenas em filtro no código do frontend (ex: `where owner_id = ...` só na query do React) sem a política espelhada no banco. O frontend pode ser manipulado por qualquer pessoa com conhecimento básico de navegador; o banco não pode.
- 🚫 Usar a **service role key** do Supabase (que ignora RLS) em código que roda no navegador. Ela só deve existir em funções de backend seguras (ex: Edge Functions), nunca exposta no frontend.

## Autenticação e sessão

- Login/cadastro deve usar o sistema de Auth nativo do Supabase — não implementar autenticação "na mão" (hash de senha customizado, etc.).
- Sessões devem expirar e ser renovadas pelo mecanismo padrão do Supabase — não estender manualmente sem entender a implicação.
- Nunca armazenar senha em texto puro em lugar nenhum, nem em log.

## Variáveis de ambiente e chaves

- A chave pública do Supabase (`anon key`) pode ficar no frontend — ela é feita pra isso, mas só funciona corretamente **se o RLS estiver ativo** (senão ela dá acesso amplo demais).
- A **service role key** nunca deve aparecer em código que vai pro navegador (nunca em arquivo dentro de `src/` que é enviado ao cliente). Se alguma automação precisar dela (ex: um processo de backend), ela fica só em variável de ambiente do servidor/função serverless, nunca commitada.
- Toda chave nova vai em `.env.local` (nunca commitado) e é documentada, sem o valor, em `.env.example`.

## O que fazer se desconfiar de um vazamento

1. Não entrar em pânico, mas também não ignorar — parem de usar dados reais no ambiente afetado até confirmar.
2. Revisar imediatamente as políticas RLS das tabelas envolvidas (comparar com o padrão acima).
3. Testar manualmente com 2 contas de usuários diferentes pra confirmar se o isolamento está funcionando.
4. Se confirmado o vazamento e havia dados reais de terceiros expostos, isso deixa de ser só um bug técnico — é uma situação a ser tratada com seriedade, incluindo avaliar se as pessoas afetadas precisam ser avisadas.

## Resumo pra quem não é técnico

Pensem no RLS como o "segredo" que garante que o negócio da pessoa A nunca aparece pra pessoa B, mesmo que exista algum erro na tela do app. Toda vez que pedirem pra IA criar algo novo que guarda dado (uma tabela nova, uma tela nova de cadastro), a pergunta que vale sempre fazer é: **"essa tabela tem RLS configurado, e você testou com duas contas diferentes?"** Se a resposta não for um "sim" claro, não aprovem o PR ainda.
