# PRD 005: Live Run Progress Streaming

## Summary

Add first-class live progress updates from the backend to the frontend using server-sent events or WebSockets. Users should see stage-level progress, elapsed time, retries, cache behavior, and errors without waiting for periodic polling.

## Problem

Long pulls can take several minutes. The current UI polls run status and shows elapsed time, but it does not stream backend milestones as they happen. Users need stronger feedback that the system is working and a clearer sense of where time is going.

## Goals

- Stream run activity events to the browser in near real time.
- Show stage, status, elapsed time, and backend milestones.
- Surface retries and recoverable failures.
- Keep polling as a fallback if streaming disconnects.

## Non-Goals

- Streaming partial model tokens to the UI.
- Real-time collaboration between multiple users.
- Replacing persisted run history.

## User Stories

- As an analyst, I can see that OpenAI search has started.
- As an analyst, I can see when a retry occurs.
- As an analyst, I can see when the backend has received a response and is parsing results.
- As an analyst, I can leave a run open and watch it complete without manually refreshing.

## Functional Requirements

- Add a streaming endpoint for run events.
- Persist all streamed events to the run activity log.
- Frontend subscribes when a run starts or a run detail page opens.
- UI appends events without duplicating them.
- UI falls back to polling if the stream fails.
- Display connection state subtly in the progress panel.

## API Options

Preferred first implementation:

- `GET /api/workspaces/{workspace_id}/runs/{run_id}/events`
- Server-sent events with JSON payloads.

Fallback option:

- WebSocket endpoint if bidirectional communication becomes necessary.

## Event Shape

```json
{
  "id": "event-id",
  "run_id": 123,
  "time": "2026-06-10T18:29:36Z",
  "event": "OpenAI web-search request started",
  "detail": "Sending structured scope and uploaded candidate leads to the Responses API.",
  "metrics": {
    "attempt": 1
  }
}
```

## UI Requirements

- Continue showing elapsed time below the Running pill.
- Show latest event prominently in the progress panel.
- Show expandable full activity log.
- Show retry count when present.
- Show completed, failed, and canceled states clearly.

## Acceptance Criteria

- A running pull streams backend activity within a few seconds of each event.
- Refreshing the page restores prior events from the backend.
- Disconnecting the event stream does not break the run.
- Polling fallback still updates final status.

