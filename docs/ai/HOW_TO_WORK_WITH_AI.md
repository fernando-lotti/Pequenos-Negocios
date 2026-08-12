# 🤖 Como pedir ajuda pra IA neste projeto

Guia pra quem não é dev. Se vocês vão construir o app com Claude Code (ou ChatGPT, Cursor, etc.), esse é o "manual de instruções" de como conversar com a IA pra ter os melhores resultados — e como revisar o que ela entrega sem precisar saber programar.

## Por que criamos o CLAUDE.md

O arquivo `CLAUDE.md` na raiz do projeto é lido automaticamente pela IA sempre que ela começa a trabalhar no repositório. Ele já explica pra IA: o que é o projeto, que vocês não são técnicos, como nomear coisas, o que não fazer. **Vocês não precisam reexplicar o projeto toda vez** — a IA já "sabe" isso.

## Como pedir uma tarefa (bom vs. ruim)

**❌ Pedido vago:**
> "cria a tela de custos"

**✅ Pedido claro:**
> "Preciso de uma tela onde eu cadastro um custo. Ela deve pedir: valor, categoria (fixo, variável ou insumo), data, e uma observação opcional. Ao salvar, deve aparecer numa lista abaixo, agrupada por categoria. Segue o padrão visual que já usamos nas outras telas."

Quanto mais contexto de **o que** e **por que**, melhor o resultado. Se não souber todos os detalhes técnicos, tudo bem — descreva como se estivesse explicando pra outra pessoa não-técnica o que o app deveria fazer.

## Perguntas que valem sempre fazer pra IA

Depois que ela entregar algo, perguntem:

- **"Explica em termos simples o que você mudou e por quê."**
- **"Tem algum risco de segurança nessa mudança?"** (especialmente se envolve login, dados financeiros ou banco de dados)
- **"Como eu testo isso manualmente, passo a passo?"**
- **"Isso quebra alguma coisa que já funcionava?"**

## Sinais de alerta — quando pedir mais explicação antes de aceitar

🚩 A IA quer commitar um arquivo `.env` ou que contenha uma chave/senha → **nunca aceitar**, isso vaza credenciais.

🚩 A IA sugere "desabilitar temporariamente" alguma verificação de segurança (RLS, autenticação) → perguntar por que e garantir que volta a ser habilitado antes do merge.

🚩 A IA propõe "travar" ou "fechar" um período/mês de forma permanente → esse produto foi desenhado de propósito pra **nunca** travar o passado (ver `docs/ARCHITECTURE.md`); se aparecer essa sugestão, questionem antes de aceitar.

🚩 A resposta é longa e mexe em muitos arquivos que não têm nada a ver com o pedido → pedir pra quebrar em partes menores.

🚩 Você não entendeu a explicação → **peçam de novo, de um jeito mais simples**. Não sigam em frente sem entender, mesmo que pareça "só perder tempo". É assim que vocês aprendem.

## Revisando um Pull Request (PR) feito com IA

Não precisam ler linha de código pra revisar. Foquem em:

1. **A descrição do PR faz sentido?** Explica o que mudou e por quê, em português simples?
2. **Tem um "como testar"?** Sigam o passo a passo — clicaram onde a IA disse, aconteceu o que era esperado?
3. **O CI passou?** (Aquele check verde/vermelho que aparece no PR — verde significa que o projeto ainda "compila" e não quebrou nada básico.)
4. Se tudo isso estiver ok, pode aprovar. Se algo não bateu, comentem no PR o que não funcionou — a própria IA consegue ler esse comentário e corrigir.

## Dividindo o trabalho entre o time

Sugestão: cada um "dono" de uma frente diferente ao trabalhar com a IA (ex: um foca em telas/visual, outro em regras de negócio de cálculo de lucro, outro em autenticação/configuração). Mas todos revisam o PR de todo mundo — é assim que quem não é dev vai, aos poucos, entendendo o projeto como um todo.

## Resumo rápido

1. Descreva o que você quer como se explicasse pra uma pessoa, não como se escrevesse um comando técnico.
2. Peça sempre a explicação em português simples.
3. Sempre peça o passo a passo de teste manual.
4. Desconfie de qualquer coisa envolvendo senhas, chaves, "desabilitar segurança" ou "travar o passado".
5. Não aprovem PR sem entender — perguntar de novo é sempre válido.
