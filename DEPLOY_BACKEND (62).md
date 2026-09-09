# Publicar o backend do EchoBound

1. Envie todo este pacote para um ambiente Node.js.
2. Instale uma versão Node >= 18.
3. Defina `ECHO_SECRET` com uma chave longa e aleatória.
4. Inicie com `node server.js` ou pelo gerenciador de processos da hospedagem.
5. Confirme `GET /health` retornando `ok: true`.
6. Se o frontend estiver no mesmo domínio do servidor, mantenha `apiBase:''`/configuração same-origin.
7. Se o frontend continuar no GitHub Pages, coloque a URL HTTPS do backend em `config.js` como `apiBase:'https://SEU-BACKEND'`.

Nunca publique a chave `ECHO_SECRET` no GitHub ou dentro de `config.js`.
