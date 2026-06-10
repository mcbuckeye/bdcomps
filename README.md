# BeOne Oncology Comps Launcher

A browser-based launcher for Business Development and M&A teams to configure oncology comps pulls, generate a structured agent prompt, run a live web-search workflow, and export memo-ready outputs.

## Open The App

Start the backend from this folder with an OpenAI API key, then visit:

```text
$env:OPENAI_API_KEY="YOUR_KEY_HERE"
python server.py
http://127.0.0.1:4174/index.html
```

Opening `index.html` directly or using the old static preview server will not run live web search.

## What Is Included

- PRD-style launcher form with optional scope fields and custom chip inputs.
- Structural stripping filters for co-dev, options, equity-only, academic, and related categories.
- Candidate modes for web-only, pasted raw text, structured rows, and uploaded `.csv` / `.xlsx` database exports.
- Generated structured prompt preview.
- Server-backed OpenAI web-search pull for public-source comps.
- Server-side parsing of uploaded database exports as candidate leads that require verification.
- Excel-openable workbook export with Comps, Stripped Deals audit, and Methodology sheets.
- Written summary and local run history.

## Recommended Next Integrations

- Add auth, persistent run history, object storage for generated files, and production compliance review.
- Replace Excel-openable XML export with a generated `.xlsx` workbook service.
- Add legacy `.xls` support if any database exports cannot be saved as `.xlsx` or `.csv`.
