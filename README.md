# BeOne Oncology Comps Launcher

A Docker Compose app for Business Development and M&A teams to configure oncology comps pulls, run an OpenAI web-search workflow, persist run history, and export memo-ready outputs.

## Architecture

- `frontend`: React + Vite build served by Nginx on `http://127.0.0.1:4174`.
- `backend`: FastAPI/Python service exposing `/api/pull`, `/api/pull/form`, `/api/runs`, and `/health`.
- `postgres`: PostgreSQL database storing completed and failed run records.

The current React app preserves the original launcher UI and controller logic while the backend and database layers have been split into dedicated services.

## Start The App

Create a local `.env` file with your OpenAI API key:

```bash
OPENAI_API_KEY='your_api_key_here'
```

Then run:

```bash
docker compose up -d --build
```

Open:

```text
http://127.0.0.1:4174/
```

For collaborator setup, see [`docs/HENRY_HANDOFF.md`](./docs/HENRY_HANDOFF.md).

## Useful Commands

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
```

Postgres is exposed locally on port `55432` by default:

```bash
psql postgresql://bdcomps:bdcomps@127.0.0.1:55432/bdcomps
```

## Environment

- `OPENAI_API_KEY`: required.
- `OPENAI_MODEL`: defaults to `gpt-5.5`.
- `OPENAI_TIMEOUT_SECONDS`: defaults to `900`.
- `OPENAI_MAX_OUTPUT_TOKENS`: defaults to `30000`.
- `OPENAI_RETRIES`: defaults to `4`.
- `OPENAI_REASONING_EFFORT`: defaults to `high`.
- `OPENAI_SEARCH_CONTEXT_SIZE`: defaults to `high`.
- `OPENAI_SEARCH_TOKEN_BUDGET`: defaults to `unlimited`.
- `FRONTEND_PORT`: defaults to `4174`.
- `POSTGRES_PORT`: defaults to `55432`.

Do not commit `.env`.

## Current Capabilities

- PRD-style launcher form with optional scope fields and custom chip inputs.
- Structural stripping filters for co-dev, options, equity-only, academic, and related categories.
- Candidate modes for web-only, pasted raw text, structured rows, and uploaded `.csv` / `.xlsx` database exports.
- Server-backed OpenAI web-search pull for public-source comps.
- FastAPI background pull jobs with Postgres persistence.
- Excel-openable workbook export with Comps, Stripped Deals audit, and Methodology sheets.
- Written summary and browser-visible run history.

## Next Refactors

- Replace the legacy DOM controller with idiomatic React state and components.
- Add first-class server-side run status streaming.
- Add auth, user-scoped run history, and production compliance review.
- Replace Excel-openable XML export with a generated `.xlsx` workbook service.

Detailed PRDs for these additions live in [`docs/prds`](./docs/prds/README.md).
