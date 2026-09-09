ECHOBOUND V5000 — 3D ULTRA

Build: V5000
Plataforma: navegador / GitHub Pages
Render: WebGL nativo, sem CDN obrigatório
Conteúdo: 20 regiões, 500 fases, 2.000 chefes, 10 raças inimigas.
Duração-alvo: fases normais 60 min; fases Boss 90 min.

GitHub Pages:
1. Envie todos os arquivos deste pacote para a raiz do repositório.
2. Use branch main.
3. Settings > Pages > Source: GitHub Actions.
4. O workflow .github/workflows/pages.yml publica automaticamente a cada push.

Observação: “ULTRA 8K” é um alvo de qualidade/renderização adaptativa; a resolução efetiva depende da tela e GPU.

V5000 — LOBBY II / LOGIN / ONLINE
- Login e criação de conta local usando SHA-256 via Web Crypto.
- Lobby II com hub isométrico e acesso ao mapa das 20 regiões.
- Partida On-line: criação/entrada por código e estrutura pronta para WebSocket.
- Para multiplayer real, edite config.js e informe a URL wss:// do servidor.
- GitHub Pages hospeda o front-end; o servidor multiplayer deve ser hospedado separadamente.
