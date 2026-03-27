# Release QA Checklist (100%)

## Gating commands

Run locally before merge:

```bash
npm run verify:release
```

## Coverage blocks

1. Route smoke global: `npm run e2e:smoke`
2. Button/action matrix + state resilience: `npm run e2e:matrix`
3. Critical regressions: `npm run e2e:critical`
4. Failure resilience: `npm run e2e:failure`
5. RBAC matrix: `npm run e2e:rbac`
6. SESMT navigation and route smoke: included in `e2e:smoke` and `e2e:full`
7. SESMT CRUD real backend: included in `e2e:real`
8. SESMT negative form scenarios: included in `e2e:real`
9. SESMT context + consistency + sensitive RBAC: included in `e2e:real`
10. Observability snapshot export: `npm run runtime:observability`

## CI gate

Workflow `ci.yml` now runs:

- typecheck/build frontend + backend
- `e2e:critical`
- `e2e:smoke`
- `e2e:matrix`
- `e2e:real`
- `runtime:observability`

