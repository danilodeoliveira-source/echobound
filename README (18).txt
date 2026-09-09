EchoBound vMetaModel2027 — Final Edition

Publicação: o pacote é estático e compatível com GitHub Pages/Hostinger.

Estrutura: index.html, style.css, game.js, config.js, .nojekyll e workflow GitHub Pages.

Conteúdo final: 20 regiões, 500 fases, 2.000 encontros de chefe (4 por fase), compras, inventário, equipamentos, missões, conquistas, estilos, Essência do Eco, combo, dash, parry, sobrecarga, pausa, salvamento local, catálogo de chefes, modo online (estrutura) e perfil Ultra 8K adaptativo.

Anti-hack: validação de limites, itens/equipamentos, integridade do save, proteção contra duplicação de recompensas e telemetria local. Como todo jogo puramente client-side, isso NÃO substitui servidor autoritativo: moedas, inventário e ranking competitivos devem ser validados no backend antes de uma operação pública competitiva.

8K: o perfil ULTRA 8K tenta usar até 7680x4320 e reduz automaticamente quando a memória de framebuffer seria excessiva. O suporte real depende do GPU/navegador.

QA: runQA() verifica a contagem de 500 fases e 2.000 encontros de chefe por simulação determinística. Isso não é uma alegação de que o modelo humano percorreu literalmente 500 fases em tempo real.

Deploy: faça push da raiz para main e deixe GitHub Actions publicar em Pages. O workflow usa configure-pages + upload-pages-artifact + deploy-pages.
