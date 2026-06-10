# PRD 002: Server-Backed Run History

## Summary

Replace browser-only run history with server-backed workspace run history from Postgres. Users should be able to view previous pulls, reopen results, inspect activity logs, and download outputs from any browser session.

## Problem

The current UI stores visible history in `localStorage`, while the backend stores run records in Postgres. This split creates confusion: the database has durable runs, but the app history is tied to one browser. Once auth and workspaces exist, run history should become a first-class backend feature.

## Goals

- Display run history from the backend database.
- Scope history by authenticated workspace.
- Let users reopen a completed or failed run.
- Preserve prompt, scope, activity log, result JSON, model, timings, and errors.
- Support pagination and basic filtering.

## Non-Goals

- Sharing runs with other users.
- Advanced analytics over historical runs.
- Full audit/compliance export.

## User Stories

- As an analyst, I can see my previous pulls after signing in on a new browser.
- As an analyst, I can click a history item and reopen the exact results.
- As an analyst, I can inspect failed runs and see the error and activity log.
- As an analyst, I can filter history by status, date, modality, and deal type.

## Functional Requirements

- Add server-side list endpoint for workspace runs.
- Add detail endpoint for one run, including result payload and activity log.
- Update the frontend history view to fetch backend history.
- Replace `localStorage` run history with API-backed state.
- Keep local browser state only for transient UI preferences.
- Add run detail routing or URL state for direct links.
- Show run status, created time, completed time, duration, clean comps count, stripped count, model, and error state.
- Add pagination or cursor loading.

## Data Requirements

Each run history item should include:

- Run ID
- Workspace ID
- Created by user ID
- Status
- Created timestamp
- Started timestamp
- Completed timestamp
- Duration seconds
- Scope summary
- Prompt summary or prompt hash
- Model
- Clean comps count
- Stripped deals count
- Error summary

## API Requirements

- `GET /api/workspaces/{workspace_id}/runs`
- `GET /api/workspaces/{workspace_id}/runs/{run_id}`
- Optional filters: `status`, `from_date`, `to_date`, `modality`, `deal_type`, `limit`, `cursor`.

## UI Requirements

- History list loads from the backend.
- History rows are clickable.
- Selecting a run restores the Results view.
- Failed runs show error details and activity log.
- Empty state explains that completed runs will appear after the first pull.

## Acceptance Criteria

- A user can complete a pull, refresh, and see the run in history.
- A user can sign in from a different browser and see the same workspace history.
- History never shows runs from another user's workspace.
- Clicking a history row restores summary, comps, stripped deals, methodology, and activity log.

