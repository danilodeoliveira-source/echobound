# EchoBound — Backend Autoritativo

## O que este pacote entrega
- API HTTP autoritativa para contas, estado e ações.
- Senhas protegidas com `scrypt` + salt.
- Tokens assinados com HMAC e expiração de 30 dias.
- Estado persistente em `data/db.json`.
- Validação server-side de moedas, inventário, equipamentos, consumíveis, habilidades, estilo e dificuldade.
- Rate limit básico por origem.
- Log de auditoria por conta.
- Recompensas de combate/fase preparadas por ações server-side com guardas.
- Servidor Node puro, sem dependências externas obrigatórias.
- O mesmo processo pode servir o frontend estático e a API.

## Rodar localmente
```bash
node server.js
```
Abra `http://localhost:8787`.

Para produção, defina uma chave forte antes de iniciar:
```bash
ECHO_SECRET="uma-chave-grande-e-aleatoria" node server.js
```

## Produção
O backend precisa ficar em um serviço que execute Node.js (por exemplo, um plano/ambiente de hospedagem que ofereça Node). GitHub Pages continua sendo apenas o frontend estático.

Se o frontend e o backend estiverem no mesmo domínio, `config.js` já usa API same-origin. Se estiverem separados, altere `apiBase` para a URL HTTPS do backend.

## Endurecimento recomendado antes de economia competitiva
- Banco PostgreSQL/MySQL em vez de JSON.
- HTTPS obrigatório.
- Secret em variável de ambiente/secret manager.
- Proxy reverso com rate limiting/WAF.
- Logs centralizados e alertas.
- Verificação server-side de todas as recompensas de combate e partidas multiplayer.
- WebSocket/servidor de simulação para multiplayer em tempo real.
