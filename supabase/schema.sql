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
-- ----------------------------------------------------------------------------
create table if not exists cost_entries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  cost_category_id uuid not null references cost_categories (id) on delete restrict,
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
-- Tabela: revenue_entries ("Lançamento de receita" / registro diário, ver GLOSSARY.md)
--
-- units_sold é opcional (ex: quantos atendimentos, quantos saquinhos de
-- pipoca) — capturado desde já porque é barato, mas o cálculo de margem
-- por unidade fica pra Fase 2 (ver docs/ROADMAP.md).
-- ----------------------------------------------------------------------------
create table if not exists revenue_entries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  revenue_date date not null,
  amount_cents bigint not null check (amount_cents > 0),
  units_sold numeric,
  payment_method text,
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
-- Índices — todo acesso é sempre filtrado por business_id (via RLS ou não),
-- então é a coluna que mais importa indexar nas tabelas filhas.
-- ----------------------------------------------------------------------------
create index if not exists idx_businesses_owner_id on businesses (owner_id);
create index if not exists idx_cost_categories_business_id on cost_categories (business_id);
create index if not exists idx_cost_entries_business_id on cost_entries (business_id);
create index if not exists idx_cost_entries_cost_date on cost_entries (business_id, cost_date);
create index if not exists idx_revenue_entries_business_id on revenue_entries (business_id);
create index if not exists idx_revenue_entries_revenue_date on revenue_entries (business_id, revenue_date);

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
