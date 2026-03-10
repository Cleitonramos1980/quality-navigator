# Integração Oracle + SGQ (WinThor)

## Objetivo
Backend Node.js + TypeScript + Fastify + Zod + oracledb para integração SGQ/WinThor com contratos compatíveis ao frontend atual.

## Variáveis de Ambiente
Use `.env.example` como base. Variáveis mínimas:
- ORACLE_USER
- ORACLE_PASSWORD
- ORACLE_CONNECT_STRING
- ORACLE_HOST
- ORACLE_PORT
- ORACLE_SERVICE_NAME
- ORACLE_POOL_MIN
- ORACLE_POOL_MAX
- ORACLE_POOL_INCREMENT
- ORACLE_POOL_ALIAS
- ORACLE_STMT_CACHE_SIZE
- LOG_LEVEL
- UPLOAD_MAX_FILES
- UPLOAD_MAX_FILE_SIZE_MB
- JWT_SECRET_KEY

## Backend
- Diretório: `backend/`
- Pool Oracle centralizado em `backend/src/db/oracle.ts`
- Repositório base com bind variables em `backend/src/repositories/baseRepository.ts`
- Tratamento central de erro em `backend/src/utils/error.ts`
- Healthcheck Oracle:
  - `GET /api/health`
  - `GET /api/health/oracle`
  - Query executada: `SELECT 'OK' AS STATUS FROM DUAL`
- Observabilidade runtime:
  - Request ID por chamada (`x-request-id`)
  - Métricas HTTP e Oracle: `GET /api/metrics`
  - Tratamento de erro padronizado com `requestId` no payload
- Autenticação:
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - JWT assinado com `JWT_SECRET_KEY`
  - Header obrigatório para rotas `/api/**` (exceto health/login): `Authorization: Bearer <token>`
- Persistência SGQ Oracle:
  - Coleções SGQ persistidas em `SGQ_COLLECTION_STORE` (payload JSON em CLOB)
  - Inicialização automática da tabela (quando permissões Oracle permitirem)
  - Carga inicial Oracle -> memória na subida do backend
  - Flush Oracle em rotas mutáveis (`POST/PUT/PATCH/DELETE`)

## Rotas Implementadas
- Auth:
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- ERP:
  - `GET /api/erp/clientes`
  - `GET /api/erp/pedidos`
  - `GET /api/erp/nf-venda`
  - `GET /api/erp/nf-troca`
  - `GET /api/erp/pedido-itens`
  - `GET /api/erp/materiais`
  - `GET /api/erp/estoque-planta`
- SAC:
  - `GET /api/sac/dashboard`
  - `GET /api/sac/atendimentos`
  - `GET /api/sac/atendimentos/:id`
  - `POST /api/sac/atendimentos`
  - `PUT /api/sac/atendimentos/:id`
  - `POST /api/sac/atendimentos/:id/anexos` (upload validado por tipo/tamanho, com rejeições informadas)
- SAC Requisições:
  - `GET /api/sac/requisicoes`
  - `GET /api/sac/requisicoes/:id`
  - `POST /api/sac/requisicoes`
  - `POST /api/sac/requisicoes/:id/atender`
  - `GET /api/sac/requisicoes/dashboard`
- Qualidade:
  - `GET /api/dashboard/qualidade`
  - `GET/POST/PUT /api/garantias`
  - `GET/POST/PUT /api/nc`
  - `GET/POST /api/capa`
  - `GET/POST/PUT /api/qualidade/documentos`
  - `GET/POST/PUT /api/qualidade/treinamentos`
  - `GET/POST/PUT /api/qualidade/treinamentos/participantes`
  - `GET/POST/PUT /api/qualidade/mudancas`
  - `GET/POST/PUT /api/qualidade/fornecedores`
  - `GET/POST/PUT /api/qualidade/scar`
- Auditorias:
  - `GET/POST /api/auditorias`
  - `GET /api/auditorias/templates`
  - `GET /api/auditorias/templates/:tplId/items`
- Assistência:
  - `GET /api/assistencia/dashboard`
  - `GET/POST /api/assistencia/os`
  - `GET /api/assistencia/os/:id`
  - `PUT /api/assistencia/os/:id/status`
  - `POST /api/assistencia/os/:id/transition`
  - `GET/POST /api/assistencia/requisicoes`
  - `GET /api/assistencia/requisicoes/:id`
  - `PUT /api/assistencia/requisicoes/:id/status`
  - `POST /api/assistencia/requisicoes/:id/receber`
  - `GET/POST /api/assistencia/consumos`
  - `GET /api/assistencia/consumos/:osId`
  - `GET /api/assistencia/estoque`
- Log de transição OS:
  - `GET /api/os-transition-log`
  - `POST /api/os-transition-log`

## State Machine de OS
Backend valida transições por evento no endpoint `POST /api/assistencia/os/:id/transition`.
Transições inválidas retornam erro 400.
Toda transição válida grava log em `SGQ_OS_TRANSITION_LOG` lógico (`/api/os-transition-log`).

## Execução
1. `cd backend`
2. `npm install`
3. `npm run dev`

Frontend:
1. Configurar `VITE_API_BASE_URL=http://localhost:3333/api`
2. `npm install`
3. `npm run dev`

Validação automática:
1. `npm run verify:critical` (frontend typecheck + build + backend build + E2E crítico)

## Pendências para Oracle produtivo
- Aplicar DDL oficial no schema Oracle (não automatizado pelo backend).
- Criar/validar views ERP WinThor (`VW_SGQ_*`) no ambiente produtivo.
- Ajustar nomes/colunas SQL para o dicionário real do banco cliente.
- Definir política de autenticação JWT real e usuários corporativos.
- Migrar fallback in-memory para persistência 100% Oracle nas entidades SGQ, se exigido no go-live.
- Definir armazenamento definitivo dos anexos (filesystem atual é local) com política de retenção/backup.


