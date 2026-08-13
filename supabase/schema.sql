-- ============================================================================
-- Pequenos Negócios — schema do banco de dados
--
-- Como usar: copie este arquivo inteiro e cole no SQL Editor do Supabase
-- (painel do projeto → SQL Editor → New query → colar → Run). Só precisa
-- rodar uma vez por projeto Supabase.
--
-- Segue à risca a regra do SECURITY.md: toda tabela com dado de um negócio
-- tem Row Level Security (RLS) habilitado, restringindo acesso só ao
-- usuário dono daquele negócio (modelo de dono único — ver docs/ARCHITECTURE.md,
-- diferente do projeto irmão DinDin-a-Dois que usa dono compartilhado por casal).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabela: businesses ("Negócio", ver GLOSSARY.md)
--
-- Um usuário pode ter mais de um negócio cadastrado (ver ADR "Multi-negócio
-- é first-class na UI" em docs/ARCHITECTURE.md) — por isso owner_id não é
-- único, é só uma referência normal.
--
-- business_type é um enum fixo (só 2 valores no MVP); business_subtype é
-- texto livre com sugestões da UI (ex: 'pipoqueiro'), usado só pra escolher
-- o preset de categorias sugeridas na ficha inicial — não afeta cálculo.
-- ----------------------------------------------------------------------------
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  business_type text not null check (business_type in ('service_provider', 'product_seller')),
  business_subtype text,
  -- Meta opcional de capital de giro que o dono quer manter reservado.
  -- Usada pela dica educativa sobre capital de giro; não entra no cálculo
  -- de lucro/caixa.
  working_capital_goal_cents bigint,
  -- Meta mensal opcional pra acompanhar progresso no Dashboard (ver
  -- reports/MonthlyGoalCard.tsx). monthly_goal_type escolhe se a meta é
  -- sobre lucro líquido ou faturamento (receita bruta) — são coisas
  -- diferentes, e cada dono decide qual prefere acompanhar de perto.
  monthly_goal_cents bigint,
  monthly_goal_type text check (monthly_goal_type in ('profit', 'revenue')),
  created_at timestamptz not null default now()
);

alter table businesses enable row level security;

create policy "Dono vê os próprios negócios"
on businesses for select
using (owner_id = auth.uid());

create policy "Dono cria negócio pra si mesmo"
on businesses for insert
with check (owner_id = auth.uid());

create policy "Dono atualiza os próprios negócios"
on businesses for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Dono exclui os próprios negócios"
on businesses for delete
using (owner_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Tabela: cost_categories ("Categoria de custo", ver GLOSSARY.md)
--
-- kind = 'fixed' | 'variable' (custo fixo ou variável — insumo é tratado
-- como um caso de custo variável, não é um tipo próprio).
-- A ficha inicial cria um conjunto inicial de categorias a partir do preset
-- do tipo/subtipo de negócio (ver src/features/business/businessTypePresets.ts),
-- mas elas são só o ponto de partida: o usuário pode renomear, criar novas
-- e desativar (is_active = false) a qualquer momento — nunca excluímos de
-- verdade uma categoria que já tem lançamento, pra não perder o histórico.
-- ----------------------------------------------------------------------------
create table if not exists cost_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('fixed', 'variable')),
  unit_label text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table cost_categories enable row level security;

create policy "Dono vê categorias dos próprios negócios"
on cost_categories for select
using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono cria categorias nos próprios negócios"
on cost_categories for insert
with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono atualiza categorias dos próprios negócios"
on cost_categories for update
using (business_id in (select id from businesses where owner_id = auth.uid()))
with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono exclui categorias dos próprios negócios"
on cost_categories for delete
using (business_id in (select id from businesses where owner_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- Tabela: cost_entries ("Lançamento de custo", ver GLOSSARY.md)
--
-- cost_date pode ser qualquer data, passada ou futura — este produto nunca
-- tranca período (ver ADR "Nunca existe fechamento ou trava do passado" em
-- docs/ARCHITECTURE.md), então editar/excluir um lançamento antigo é sempre
-- permitido e recalcula o lucro do mês automaticamente.
--
-- cost_category_id é opcional (on delete set null): excluir uma categoria
-- que já tem lançamento não é bloqueado — os lançamentos ficam "sem
-- categoria" (ver CostEntryList.tsx) em vez de impedir a exclusão. O valor
-- gasto continua contando no lucro do mês (ver reports/profit.ts,
-- uncategorizedCostCents), só sem saber se era custo fixo ou variável até
-- alguém reclassificar o lançamento numa categoria existente.
-- ----------------------------------------------------------------------------
create table if not exists cost_entries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  cost_category_id uuid references cost_categories (id) on delete set null,
  cost_date date not null,
  amount_cents bigint not null check (amount_cents > 0),
  quantity numeric,
  notes text,
  created_at timestamptz not null default now()
);

alter table cost_entries enable row level security;

create policy "Dono vê custos dos próprios negócios"
on cost_entries for select
using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono lança custos nos próprios negócios"
on cost_entries for insert
with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono atualiza custos dos próprios negócios"
on cost_entries for update
using (business_id in (select id from businesses where owner_id = auth.uid()))
with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono exclui custos dos próprios negócios"
on cost_entries for delete
using (business_id in (select id from businesses where owner_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- Tabela: revenue_categories ("Categoria de receita" ou "Produto", ver GLOSSARY.md)
--
-- Espelha cost_categories, mas sem "kind" — categoria de receita é só um
-- rótulo livre pra separar de onde vem o dinheiro (ex: "Pipoca doce",
-- "Pipoca salgada"), diferente de custo que também precisa saber se é
-- fixo ou variável. Assim como em cost_categories, o preset inicial (ver
-- businessTypePresets.ts) é só ponto de partida — totalmente editável.
--
-- unit_cost_cents é opcional: quando preenchido, essa categoria vira um
-- "produto" com custo conhecido, usado pra calcular margem por produto em
-- Relatórios (ver reports/ProductMarginCard.tsx) — não entra no cálculo de
-- lucro do negócio, é só um relatório adicional (ver ADR em docs/ARCHITECTURE.md).
-- ----------------------------------------------------------------------------
create table if not exists revenue_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  unit_cost_cents bigint,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table revenue_categories enable row level security;

create policy "Dono vê categorias de receita dos próprios negócios"
on revenue_categories for select
using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono cria categorias de receita nos próprios negócios"
on revenue_categories for insert
with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono atualiza categorias de receita dos próprios negócios"
on revenue_categories for update
using (business_id in (select id from businesses where owner_id = auth.uid()))
with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono exclui categorias de receita dos próprios negócios"
on revenue_categories for delete
using (business_id in (select id from businesses where owner_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- Tabela: payment_methods ("Forma de pagamento", ver GLOSSARY.md)
--
-- fee_percent é a taxa que a maquininha/banco cobra nessa forma de
-- pagamento (ex: Crédito parcelado = 8 significa 8%) — usada pra descontar
-- automaticamente a taxa do lucro e do caixa (ver reports/profit.ts,
-- cardFeeCents). Preset inicial em src/features/paymentMethods/defaultPaymentMethods.ts
-- (Pix 0%, Débito 3%, Crédito à vista 5%, Crédito parcelado 8%), mas é só o
-- ponto de partida — totalmente editável, mesmo padrão de cost_categories.
-- ----------------------------------------------------------------------------
create table if not exists payment_methods (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  fee_percent numeric not null default 0 check (fee_percent >= 0 and fee_percent < 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table payment_methods enable row level security;

create policy "Dono vê formas de pagamento dos próprios negócios"
on payment_methods for select
using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono cria formas de pagamento nos próprios negócios"
on payment_methods for insert
with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono atualiza formas de pagamento dos próprios negócios"
on payment_methods for update
using (business_id in (select id from businesses where owner_id = auth.uid()))
with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono exclui formas de pagamento dos próprios negócios"
on payment_methods for delete
using (business_id in (select id from businesses where owner_id = auth.uid()));

create index if not exists idx_payment_methods_business_id on payment_methods (business_id);

-- ----------------------------------------------------------------------------
-- Tabela: revenue_entries ("Lançamento de receita" / registro diário, ver GLOSSARY.md)
--
-- units_sold é opcional (ex: quantos atendimentos, quantos saquinhos de
-- pipoca) — capturado desde já porque é barato, mas o cálculo de margem
-- por unidade fica pra Fase 2 (ver docs/ROADMAP.md).
--
-- revenue_category_id e payment_method_id são opcionais (on delete set
-- null) — mesmo padrão de cost_entries.cost_category_id: excluir uma
-- categoria/forma de pagamento não apaga os lançamentos que a usavam, eles
-- só ficam "sem categoria"/"sem forma de pagamento".
-- ----------------------------------------------------------------------------
create table if not exists revenue_entries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  revenue_category_id uuid references revenue_categories (id) on delete set null,
  payment_method_id uuid references payment_methods (id) on delete set null,
  revenue_date date not null,
  amount_cents bigint not null check (amount_cents > 0),
  units_sold numeric,
  notes text,
  created_at timestamptz not null default now()
);

alter table revenue_entries enable row level security;

create policy "Dono vê receitas dos próprios negócios"
on revenue_entries for select
using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono lança receitas nos próprios negócios"
on revenue_entries for insert
with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono atualiza receitas dos próprios negócios"
on revenue_entries for update
using (business_id in (select id from businesses where owner_id = auth.uid()))
with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono exclui receitas dos próprios negócios"
on revenue_entries for delete
using (business_id in (select id from businesses where owner_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- Tabela: withdrawals ("Retirada de caixa", ver GLOSSARY.md)
--
-- Dinheiro que o dono tira do caixa do negócio pra uso pessoal. Não é um
-- custo do negócio (não entra em cost_entries nem em calculateMonthlyProfit,
-- ver reports/profit.ts) — só reduz o caixa disponível (calculateAccumulatedCash).
-- Sem categoria, sem "kind": é sempre o mesmo tipo de lançamento, então não
-- precisava de uma tabela de categorias própria como cost_categories/revenue_categories.
-- ----------------------------------------------------------------------------
create table if not exists withdrawals (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  withdrawal_date date not null,
  amount_cents bigint not null check (amount_cents > 0),
  notes text,
  created_at timestamptz not null default now()
);

alter table withdrawals enable row level security;

create policy "Dono vê retiradas dos próprios negócios"
on withdrawals for select
using (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono lança retiradas nos próprios negócios"
on withdrawals for insert
with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono atualiza retiradas dos próprios negócios"
on withdrawals for update
using (business_id in (select id from businesses where owner_id = auth.uid()))
with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "Dono exclui retiradas dos próprios negócios"
on withdrawals for delete
using (business_id in (select id from businesses where owner_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- Índices — todo acesso é sempre filtrado por business_id (via RLS ou não),
-- então é a coluna que mais importa indexar nas tabelas filhas.
-- ----------------------------------------------------------------------------
create index if not exists idx_businesses_owner_id on businesses (owner_id);
create index if not exists idx_cost_categories_business_id on cost_categories (business_id);
create index if not exists idx_cost_entries_business_id on cost_entries (business_id);
create index if not exists idx_cost_entries_cost_date on cost_entries (business_id, cost_date);
create index if not exists idx_revenue_categories_business_id on revenue_categories (business_id);
create index if not exists idx_revenue_entries_business_id on revenue_entries (business_id);
create index if not exists idx_revenue_entries_revenue_date on revenue_entries (business_id, revenue_date);
create index if not exists idx_withdrawals_business_id on withdrawals (business_id);
create index if not exists idx_withdrawals_withdrawal_date on withdrawals (business_id, withdrawal_date);

-- ============================================================================
-- Migração — só precisa rodar isso se este projeto Supabase já existia
-- ANTES desta mudança (removemos 'insumo' como tipo próprio de custo; agora
-- ele conta como custo variável). Projeto novo, rodando o arquivo inteiro
-- pela primeira vez, pode ignorar este bloco — as tabelas acima já nascem
-- sem 'input'.
--
-- Cole só este bloco no SQL Editor do Supabase e clique em Run.
-- ============================================================================
update cost_categories set kind = 'variable' where kind = 'input';

alter table cost_categories drop constraint if exists cost_categories_kind_check;
alter table cost_categories add constraint cost_categories_kind_check check (kind in ('fixed', 'variable'));

-- ============================================================================
-- Migração — só precisa rodar isso se este projeto Supabase já existia ANTES
-- desta mudança (agora dá pra excluir de verdade uma categoria de custo,
-- mesmo que já tenha lançamento — o lançamento fica "sem categoria" em vez
-- de bloquear a exclusão). Projeto novo pode ignorar este bloco.
--
-- Cole só este bloco no SQL Editor do Supabase e clique em Run.
-- ============================================================================
alter table cost_entries alter column cost_category_id drop not null;
alter table cost_entries drop constraint if exists cost_entries_cost_category_id_fkey;
alter table cost_entries
  add constraint cost_entries_cost_category_id_fkey
  foreign key (cost_category_id) references cost_categories (id) on delete set null;

-- ============================================================================
-- Migração — só precisa rodar isso se este projeto Supabase já existia ANTES
-- desta mudança (issue: permitir categorizar lançamentos de receita, ex:
-- pipoca doce/salgada). Cria a tabela revenue_categories e adiciona a coluna
-- revenue_category_id em revenue_entries. Projeto novo, rodando o arquivo
-- inteiro pela primeira vez, pode ignorar este bloco — já nasce assim.
--
-- Cole só este bloco no SQL Editor do Supabase e clique em Run.
-- ============================================================================
create table if not exists revenue_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table revenue_categories enable row level security;

drop policy if exists "Dono vê categorias de receita dos próprios negócios" on revenue_categories;
create policy "Dono vê categorias de receita dos próprios negócios"
on revenue_categories for select
using (business_id in (select id from businesses where owner_id = auth.uid()));

drop policy if exists "Dono cria categorias de receita nos próprios negócios" on revenue_categories;
create policy "Dono cria categorias de receita nos próprios negócios"
on revenue_categories for insert
with check (business_id in (select id from businesses where owner_id = auth.uid()));

drop policy if exists "Dono atualiza categorias de receita dos próprios negócios" on revenue_categories;
create policy "Dono atualiza categorias de receita dos próprios negócios"
on revenue_categories for update
using (business_id in (select id from businesses where owner_id = auth.uid()))
with check (business_id in (select id from businesses where owner_id = auth.uid()));

drop policy if exists "Dono exclui categorias de receita dos próprios negócios" on revenue_categories;
create policy "Dono exclui categorias de receita dos próprios negócios"
on revenue_categories for delete
using (business_id in (select id from businesses where owner_id = auth.uid()));

create index if not exists idx_revenue_categories_business_id on revenue_categories (business_id);

alter table revenue_entries add column if not exists revenue_category_id uuid references revenue_categories (id) on delete set null;

-- ============================================================================
-- Migração — só precisa rodar isso se este projeto Supabase já existia ANTES
-- desta mudança (issue: registrar retirada de caixa, dinheiro que o dono tira
-- do negócio pra uso pessoal). Cria a tabela withdrawals. Projeto novo,
-- rodando o arquivo inteiro pela primeira vez, pode ignorar este bloco —
-- já nasce assim.
--
-- Cole só este bloco no SQL Editor do Supabase e clique em Run.
-- ============================================================================
create table if not exists withdrawals (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  withdrawal_date date not null,
  amount_cents bigint not null check (amount_cents > 0),
  notes text,
  created_at timestamptz not null default now()
);

alter table withdrawals enable row level security;

drop policy if exists "Dono vê retiradas dos próprios negócios" on withdrawals;
create policy "Dono vê retiradas dos próprios negócios"
on withdrawals for select
using (business_id in (select id from businesses where owner_id = auth.uid()));

drop policy if exists "Dono lança retiradas nos próprios negócios" on withdrawals;
create policy "Dono lança retiradas nos próprios negócios"
on withdrawals for insert
with check (business_id in (select id from businesses where owner_id = auth.uid()));

drop policy if exists "Dono atualiza retiradas dos próprios negócios" on withdrawals;
create policy "Dono atualiza retiradas dos próprios negócios"
on withdrawals for update
using (business_id in (select id from businesses where owner_id = auth.uid()))
with check (business_id in (select id from businesses where owner_id = auth.uid()));

drop policy if exists "Dono exclui retiradas dos próprios negócios" on withdrawals;
create policy "Dono exclui retiradas dos próprios negócios"
on withdrawals for delete
using (business_id in (select id from businesses where owner_id = auth.uid()));

create index if not exists idx_withdrawals_business_id on withdrawals (business_id);
create index if not exists idx_withdrawals_withdrawal_date on withdrawals (business_id, withdrawal_date);

-- ============================================================================
-- Migração — só precisa rodar isso se este projeto Supabase já existia ANTES
-- desta mudança (issue: meta mensal de lucro ou faturamento, com progresso
-- no Dashboard). Adiciona duas colunas opcionais em businesses. Projeto
-- novo, rodando o arquivo inteiro pela primeira vez, pode ignorar este
-- bloco — a tabela já nasce com essas colunas.
--
-- Cole só este bloco no SQL Editor do Supabase e clique em Run.
-- ============================================================================
alter table businesses add column if not exists monthly_goal_cents bigint;
alter table businesses add column if not exists monthly_goal_type text;
alter table businesses drop constraint if exists businesses_monthly_goal_type_check;
alter table businesses add constraint businesses_monthly_goal_type_check check (monthly_goal_type in ('profit', 'revenue'));

-- ============================================================================
-- Migração — só precisa rodar isso se este projeto Supabase já existia ANTES
-- desta mudança (issue: forma de pagamento com taxa da maquininha, descontada
-- automaticamente do lucro e do caixa). Cria a tabela payment_methods e troca
-- a antiga coluna revenue_entries.payment_method (texto livre, nunca chegou
-- a ser usada em nenhuma tela) por payment_method_id (referência à tabela
-- nova). Projeto novo, rodando o arquivo inteiro pela primeira vez, pode
-- ignorar este bloco — já nasce assim.
--
-- Cole só este bloco no SQL Editor do Supabase e clique em Run.
-- ============================================================================
create table if not exists payment_methods (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  fee_percent numeric not null default 0 check (fee_percent >= 0 and fee_percent < 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table payment_methods enable row level security;

drop policy if exists "Dono vê formas de pagamento dos próprios negócios" on payment_methods;
create policy "Dono vê formas de pagamento dos próprios negócios"
on payment_methods for select
using (business_id in (select id from businesses where owner_id = auth.uid()));

drop policy if exists "Dono cria formas de pagamento nos próprios negócios" on payment_methods;
create policy "Dono cria formas de pagamento nos próprios negócios"
on payment_methods for insert
with check (business_id in (select id from businesses where owner_id = auth.uid()));

drop policy if exists "Dono atualiza formas de pagamento dos próprios negócios" on payment_methods;
create policy "Dono atualiza formas de pagamento dos próprios negócios"
on payment_methods for update
using (business_id in (select id from businesses where owner_id = auth.uid()))
with check (business_id in (select id from businesses where owner_id = auth.uid()));

drop policy if exists "Dono exclui formas de pagamento dos próprios negócios" on payment_methods;
create policy "Dono exclui formas de pagamento dos próprios negócios"
on payment_methods for delete
using (business_id in (select id from businesses where owner_id = auth.uid()));

create index if not exists idx_payment_methods_business_id on payment_methods (business_id);

alter table revenue_entries add column if not exists payment_method_id uuid references payment_methods (id) on delete set null;
alter table revenue_entries drop column if exists payment_method;

-- ============================================================================
-- Migração — só precisa rodar isso se este projeto Supabase já existia ANTES
-- desta mudança (issue: custo por unidade em categoria de receita, base pro
-- catálogo de produtos com margem individual). Adiciona uma coluna opcional
-- em revenue_categories. Projeto novo, rodando o arquivo inteiro pela
-- primeira vez, pode ignorar este bloco — a tabela já nasce com essa coluna.
--
-- Cole só este bloco no SQL Editor do Supabase e clique em Run.
-- ============================================================================
alter table revenue_categories add column if not exists unit_cost_cents bigint;
