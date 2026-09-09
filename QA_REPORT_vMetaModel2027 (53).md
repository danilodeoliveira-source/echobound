# EchoBound vMetaModel2027 — Deluxe Edition

## Escopo
Revisão da versão final com foco em comércio, inventário, equipamentos e estabilidade do Lobby branco.

## Correções
- Compra com validação de item, saldo e limite de 99 unidades.
- Venda por 60% do preço base.
- Venda de item equipado desfaz o slot automaticamente.
- Equipar/remover arma, armadura e relíquia.
- Uso de consumíveis dentro de fase.
- Histórico de transações e resumo da carteira.
- Sanitização do estado de comércio e inventário.

## Validações estáticas
- `node --check game.js`: OK
- Catálogo: 20 regiões / 500 fases / 2.000 encontros de chefes: OK
- Integridade do pacote ZIP: OK

## Nota de teste de navegador
O ambiente atual restringe navegação local/isolada do Chromium, então não foi possível concluir uma sessão gráfica automatizada completa nesta execução. A lógica de comércio foi revisada e as funções foram conectadas aos botões de compra/venda/equipamento/uso.

## Segurança
A proteção anti-tamper do cliente reduz estados inválidos, mas não substitui servidor autoritativo. Para lançamento público com economia competitiva, o servidor deve ser a fonte de verdade para moedas, inventário, recompensas e compras.
