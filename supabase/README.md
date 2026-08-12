# Configuração do Supabase

Passo a passo pra deixar o banco de dados real funcionando (sem isso, o app não consegue salvar nada).

## 1. Criar o projeto

1. Crie uma conta grátis em [supabase.com](https://supabase.com) (dá pra entrar com GitHub).
2. Clique em "New project", escolha um nome (ex: `pequenos-negocios`) e uma senha de banco (guarde essa senha em um cofre de senhas — não vamos precisar dela no dia a dia, mas o Supabase pede).
3. Espere o projeto terminar de ser criado (leva 1-2 minutos).

## 2. Rodar o schema (criar as tabelas)

1. No menu lateral do projeto, abra **SQL Editor**.
2. Clique em "New query".
3. Copie todo o conteúdo do arquivo [`schema.sql`](./schema.sql) deste repositório e cole ali.
4. Clique em **Run**. Deve aparecer "Success" — isso cria as tabelas `businesses`, `cost_categories`, `cost_entries` e `revenue_entries`, já com as regras de segurança (RLS) ativas.

## 3. Pegar a URL e a chave pública (anon key)

1. No menu lateral, abra **Project Settings → API**.
2. Copie o **Project URL** (algo como `https://xxxxxxxxxxxx.supabase.co`).
3. Copie a chave em **Project API keys → anon public** (uma chave longa, começando com `eyJ...`).

> Essa chave é pública por natureza (o Supabase é feito pra ela ficar no navegador) — ela só é segura porque o RLS está ativo. **Nunca** copie a `service_role key` (a outra chave que aparece ali) para o app — essa sim é secreta e nunca deve aparecer no navegador.

## 4. Configurar no projeto

Cole a URL e a chave no arquivo `.env.local` na raiz do projeto (se não existir, copie o `.env.example` e renomeie):

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Depois, reinicie o `npm run dev` para o app ler as novas variáveis.

## 5. Ativar confirmação de e-mail (opcional, recomendado depois)

Por padrão o Supabase manda um e-mail de confirmação no cadastro. Pra testar rápido enquanto é só o time, você pode desativar em **Authentication → Providers → Email → Confirm email** (desmarcar). Lembre de reativar antes de usuários reais usarem o app.
