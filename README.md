# Shiplog

Reference solution for the **Shiplog Build Workshop**: a minimal TypeScript monorepo with an
Express API and PostgreSQL, four quality gates, two container images, and an event-driven
GitHub Actions release pipeline.

The app is deliberately tiny: a log of shipped versions.

```
GET  /health     -> {"status":"ok","version":"v1.0.7"}
GET  /releases   -> [{"id":1,"version":"v1.0.0","notes":"hello","createdAt":"..."}]
POST /releases   {"version":"v1.0.0","notes":"hello"}
```

## Layout

```
packages/
  shared/   types + request validation, imported by db and api
  db/       SQL migrations and a small migration runner  -> "migrate" image
  api/      Express app, Postgres store, unit + integration tests -> "api" image
```

## Prerequisites

- Node 22 (npm 10)
- Docker, running
- A GitHub account (module 8)

## Commands

| Command | What it does |
|---|---|
| `npm ci` | Install every workspace |
| `npm run build` | Compile all packages with `tsc -b` (needed before tests or start) |
| `npm run lint` | Gate 1: ESLint |
| `npm run typecheck` | Gate 2: `tsc`, including test files |
| `npm test` | Gate 3: unit tests against an in-memory store |
| `npm run test:integration` | Gate 4: integration tests on a real Postgres container (Testcontainers) |
| `docker compose up -d --build` | Postgres, then migrations, then the API on :3000 |

## Workshop checkpoints

Each module is a tagged commit. If you fall behind, check out the tag for the module you
just finished and carry on from there.

| Tag | Module |
|---|---|
| `m1` | Workspace, TypeScript project references, `shared` package |
| `m2` | Postgres in Compose, first migration, migration runner |
| `m3` | Store interface, Express app factory, server |
| `m4` | Lint and type checking |
| `m5` | Unit tests |
| `m6` | Integration tests with Testcontainers |
| `m7` | Two-target Dockerfile and full Compose stack |
| `m8` | CI, build, auto-approve and deploy workflows |

```sh
git checkout m5   # catch up to the end of module 5
npm ci && npm run build
```

## Pipeline

```
pull request ─▶ 01-CI      lint · typecheck · test · test:integration · docker build · pr-gate
push to main ─▶ 02-Build   push api + migrate images to GHCR ─▶ dispatch artifact-published
             ─▶ 03-Approve dev ─▶ dispatch release-approved {environment: dev}
             ─▶ Deploy     postgres service ─▶ migrate:vX ─▶ api:vX ─▶ smoke test /health
```

The deploy target is a throwaway environment on the Actions runner, so no cloud account is
needed. Replace the deploy steps with your platform of choice; nothing upstream changes.

Note: `repository_dispatch` workflows only run from the default branch, so merge the
workflow files to `main` before expecting the chain to run.
