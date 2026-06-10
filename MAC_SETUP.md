# BeOne Comps Launcher - Mac Setup

This project now runs as a three-tier Docker Compose app:

- React frontend
- FastAPI/Python backend
- PostgreSQL database

## What You Need

- macOS
- Docker Desktop or Colima-compatible Docker
- An OpenAI API key in `.env`

## Start The App

From this folder:

```bash
docker compose up -d --build
```

Then open:

```text
http://127.0.0.1:4174/index.html
```

## Check Status

```bash
docker compose ps
docker compose logs -f backend
```

## Notes

- Do not put your API key into the website UI.
- Do not commit `.env`.
- Uploaded `.csv` and `.xlsx` files are treated as candidate leads requiring verification.
- Backend run records are stored in Postgres.
- The backend bypasses proxy environment variables by default for OpenAI calls. If your Mac needs a corporate proxy, start with:

```bash
OPENAI_DISABLE_PROXY=0 docker compose up -d --build
```

## Current Backend Settings

- Frontend port: `4174`
- Backend internal port: `8000`
- Local Postgres port: `55432`
- OpenAI model: `gpt-5.5`
- OpenAI timeout: `900` seconds
- OpenAI retries: `4`
- OpenAI reasoning effort: `high`
- OpenAI search context size: `high`
- Max output tokens: `30000`
- Proxy bypass: enabled by default
