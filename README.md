# Quality Navigator (SGQ)

Aplicação web com frontend React/Vite e backend Fastify/TypeScript para operação de SAC, qualidade, inventário e assistência técnica.

## Stack

- Frontend: React 18, Vite, TypeScript, Tailwind, React Query
- Backend: Fastify, TypeScript, Zod, Oracle (`oracledb`)
- Testes: Vitest (unitários), Playwright (E2E)
- CI: GitHub Actions

## Pré-requisitos

- Node.js 20+
- npm 10+

Use apenas `npm` neste repositório para evitar drift de lockfile.

## Setup local

1. Instale dependências:

```bash
npm ci
npm --prefix backend ci
```

2. Crie o arquivo de ambiente a partir do exemplo:

```bash
cp .env.example .env
```

3. Defina obrigatoriamente segredos fortes:

- `JWT_SECRET_KEY` com no mínimo 32 caracteres
- `AUTH_STATIC_PASSWORD` com no mínimo 8 caracteres

4. Suba frontend e backend em terminais separados:

```bash
npm run dev
npm --prefix backend run dev
```

## Scripts úteis

- Frontend
  - `npm run dev`
  - `npm run build`
  - `npm run lint`
  - `npm run test`
  - `npm run typecheck`
- Backend
  - `npm --prefix backend run dev`
  - `npm --prefix backend run build`
- E2E
  - `npm run e2e`
  - `npm run e2e:critical`

## Runtime tests autenticados

Os scripts de runtime agora exigem autenticação para endpoints protegidos.

Opção 1 (recomendada): token pronto

```bash
RUNTIME_AUTH_TOKEN=<token> npm run runtime:load
```

Opção 2: login automático

```bash
RUNTIME_AUTH_EMAIL=<email> RUNTIME_AUTH_PASSWORD=<senha> npm run runtime:load
```

Também vale para:

- `npm run runtime:soak`
- `npm run runtime:upload`

## Segurança de autenticação

- Backend não aceita senha fallback hardcoded.
- `JWT_SECRET_KEY` e `AUTH_STATIC_PASSWORD` fracos são rejeitados na inicialização.
- Fallback local no frontend fica desabilitado por padrão e só pode ser habilitado em dev com:

```env
VITE_ENABLE_LOCAL_AUTH_FALLBACK=true
```

## CI

Pipeline em `.github/workflows/ci.yml` executa:

- install (frontend + backend)
- lint
- testes unitários (Vitest)
- typecheck/build (frontend + backend)
- Playwright critical E2E

## Higiene de repositório

Arquivos gerados de testes e runtime estão ignorados via `.gitignore` (ex.: `playwright-report/`, `test-results/`, `tests/runtime/results/`, `backend/uploads/`).
