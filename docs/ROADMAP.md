# 🗺️ Roadmap

Sugestão de fases — ajustem conforme o time for aprendendo o que faz sentido.

## Fase 0 — Fundação
- [ ] Repo configurado (branch protection, templates, CI básico)
- [x] Setup do projeto (Vite + Supabase conectado, deploy no Vercel publicado em [pequenos-negocios.vercel.app](https://pequenos-negocios.vercel.app), atualizando sozinho a cada push na `main` via integração Git do Vercel)
- [x] Autenticação básica (login/cadastro)
- [x] Modelo de dados inicial: `businesses`, `cost_categories`, `cost_entries`, `revenue_entries`, todos com RLS de dono único

## Fase 1 — MVP core
- [x] Ficha inicial: escolher tipo de negócio (prestador de serviços / comerciante de produto) e subtipo sugerido
- [x] Categorias de custo pré-sugeridas pelo tipo de negócio, mas totalmente editáveis (criar, renomear, desativar)
- [x] Seletor de negócio ativo + fluxo de criar um segundo negócio (multi-negócio por usuário)
- [x] Cadastro de custos (fixo/variável/insumo) e de receitas diárias, com edição de lançamentos já criados
- [x] Cálculo do lucro do mês, sempre recalculado ao vivo (editar um lançamento passado atualiza o número automaticamente)
- [x] Mecanismo de dica educativa por conceito (mostrada na primeira vez que o conceito aparece), com pelo menos 2 dicas: capital de giro e lucro ≠ caixa

## Fase 2 — Polimento e aprofundamento educativo
- [ ] Mais dicas educativas cobrindo os demais conceitos do glossário (margem, insumo, etc.)
- [x] Cálculo de margem por unidade vendida/atendimento
- [x] Calculadora de preço de venda (custo da unidade + margem desejada)
- [x] Meta mensal de lucro ou faturamento, com barra de progresso no Dashboard
- [x] Ponto de equilíbrio (quantas vendas/atendimentos pra cobrir os custos fixos)
- [x] Projeção de fim de mês (estimativa de lucro no ritmo atual)
- [x] Ranking de categorias de custo do período ("pra onde seu dinheiro está indo")
- [x] Alertas de saúde financeira no Dashboard (custo fixo alto, caixa abaixo da meta de capital de giro)
- [x] Forma de pagamento na receita (Pix, Débito, Crédito...), com taxa descontada automaticamente do lucro e do caixa
- [x] Parcelador automático de custos (compras financiadas, ex: equipamento)
- [x] Custo por unidade em categoria de receita ("Produto") + margem por produto em Relatórios
- [ ] Gráficos/relatórios de evolução do lucro e dos custos por categoria, ao longo dos meses
- [ ] Onboarding mais guiado (tour da primeira vez)

## Fase 3 — Expansão
- [ ] Controle de estoque mais detalhado (quantidade, alerta de reposição)
- [ ] Contas a pagar/receber (regime de competência, além do regime de caixa simples do MVP)
- [ ] Calculadora de imposto simplificada (MEI/DAS)
- [ ] Notificações/lembretes (ex: "você ainda não lançou a receita de hoje")

## Backlog / ideias futuras (não compromissadas)
- Empacotamento como app instalável (PWA ou Capacitor, ver decisão equivalente no projeto irmão DinDin-a-Dois)
- Integração com Open Finance / bancos, importação automática de extrato
- Tabela `business_types` configurável no banco (painel pra editar presets sem precisar de deploy) — só se o número de verticais crescer muito
- Sincronizar "dicas já vistas" no Supabase (hoje fica em `localStorage`, por dispositivo)
- Múltiplos usuários com acesso a um mesmo negócio (ex: um funcionário lançando dados)
- Tela pra editar a meta de capital de giro (`working_capital_goal_cents` existe no banco desde o início, mas hoje não tem nenhum formulário que grave um valor nela — sem isso, o alerta de "caixa abaixo da meta" nunca dispara na prática)
- Kit/combo de venda: vender mais de um produto numa mesma receita lançada (issue #37, depende do catálogo de produto acima já estar validado em uso real)
- Depreciação de equipamento como custo mensal recorrente (issue #38, deliberadamente adiada — ver ADR "Custo por produto é um relatório adicional")
