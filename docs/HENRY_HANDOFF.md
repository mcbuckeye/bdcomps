# Henry Handoff: Mac And Codex Setup

This guide is for cloning and running the BeOne Oncology Comps Launcher on a MacBook, then continuing development in Codex.

## 1. Install Local Prerequisites

Install:

- Docker Desktop for Mac
- Git
- Codex desktop app or your preferred Codex environment

Optional but useful:

- GitHub CLI: `brew install gh`
- Postgres client tools: `brew install libpq`

## 2. Clone The Repo

```bash
git clone https://github.com/mcbuckeye/bdcomps.git
cd bdcomps
```

If you use SSH instead of HTTPS:

```bash
git clone git@github.com:mcbuckeye/bdcomps.git
cd bdcomps
```

## 3. Create `.env`

Create a local `.env` file in the project root. This file is intentionally ignored by Git.

```bash
OPENAI_API_KEY='your_openai_api_key_here'
```

Optional settings:

```bash
OPENAI_MODEL='gpt-5.5'
OPENAI_TIMEOUT_SECONDS=900
OPENAI_RETRIES=4
FRONTEND_PORT=4174
POSTGRES_PORT=55432
```

Do not commit `.env` or paste API keys into GitHub issues, PRs, screenshots, or chat.

## 4. Start The App

From the project root:

```bash
docker compose up -d --build
```

Open:

```text
http://127.0.0.1:4174/
```

The app starts with a local email/password sign-in screen. Create an account; the backend will create a personal workspace automatically.

## 5. Check Status And Logs

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

Postgres is available locally at:

```text
postgresql://bdcomps:bdcomps@127.0.0.1:55432/bdcomps
```

To inspect the latest runs:

```bash
docker compose exec -T postgres psql -U bdcomps -d bdcomps -c "SELECT id, status, mode, created_at, completed_at FROM runs ORDER BY id DESC LIMIT 10;"
```

## 6. What Is Implemented

- React/Vite frontend served by Nginx
- FastAPI backend
- PostgreSQL database
- Docker Compose orchestration
- Email/password auth
- Personal workspaces
- Workspace-scoped run history
- OpenAI Responses API web-search pulls
- Background jobs with polling and server-sent progress events
- Pull cache/stage records
- Server-generated `.xlsx` workbook export

## 7. Known Development Notes

- The UI is still partly a legacy DOM controller inside a React shell. A full React component refactor is planned in `docs/prds/004-react-frontend-refactor.md`.
- Broad OpenAI web-search pulls may take several minutes and can occasionally receive transient upstream `502 Bad Gateway` errors. The backend retries automatically.
- Re-running an identical completed pull can use the cache and should be much faster.
- Workbook exports are generated server-side from saved run data.

## 8. Continuing Work In Codex

Open the cloned folder as the Codex workspace:

```text
bdcomps
```

Recommended first prompt:

```text
Read README.md, MAC_SETUP.md, and docs/prds/*.md. Then inspect the Docker Compose app and summarize the current architecture before making changes.
```

Useful follow-up prompts:

```text
Run the Docker Compose app, check service health, and verify the frontend at http://127.0.0.1:4174/
```

```text
Continue the React frontend refactor PRD while preserving the current auth, run history, and pull behavior.
```

```text
Check backend logs and Postgres run records for the latest pull status.
```

## 9. Safe Development Workflow

Before changing code:

```bash
git pull
git status
```

After changing code:

```bash
docker compose up -d --build
docker compose ps
```

Then verify the browser and commit:

```bash
git status
git add .
git commit -m "Describe the change"
git push
```

Avoid committing:

- `.env`
- API keys or tokens
- downloaded exports
- local database dumps
- `node_modules`
- generated `dist` folders

## 10. Reset Local Containers

Stop containers:

```bash
docker compose down
```

Stop containers and delete the local database volume:

```bash
docker compose down -v
```

Use `down -v` only when you are okay deleting local users, workspaces, run history, cache entries, and exports metadata.

