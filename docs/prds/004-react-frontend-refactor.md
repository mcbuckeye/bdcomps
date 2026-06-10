# PRD 004: React Frontend Refactor

## Summary

Replace the legacy DOM controller inside the React shell with idiomatic React components, state management, and API services. This will make the app easier to extend for auth, workspaces, history, staged pulls, and streaming progress.

## Problem

The current frontend is a React/Vite app, but the actual launcher behavior is still controlled by legacy imperative DOM code. This works for the prototype, but it makes routing, auth guards, reusable components, error handling, and long-term feature development harder.

## Goals

- Convert the launcher into React components.
- Preserve current visual layout and working behavior.
- Add clear client-side state boundaries for scope, prompt, run, history, and auth.
- Prepare the UI for workspace-aware routing.
- Improve maintainability without a major redesign.

## Non-Goals

- Rebranding or large visual redesign.
- Replacing the backend API.
- Adding advanced state libraries unless needed.

## User Stories

- As an analyst, I experience the same launcher flow after the refactor.
- As a developer, I can add a new scope field without editing imperative DOM wiring.
- As a developer, I can test prompt generation and API calls independently.
- As a developer, I can add auth screens and protected routes cleanly.

## Functional Requirements

- Create React components for app shell, navigation, scope form, prompt review, run progress, results, and history.
- Move API calls into a dedicated client module.
- Replace direct DOM manipulation with React state.
- Preserve existing field names and backend payload shape.
- Add routing or route-like state for main app views.
- Add form validation and disabled states.
- Add consistent error display.
- Keep downloads functional during the transition.

## Suggested Component Structure

- `App`
- `AuthGate`
- `AppShell`
- `ScopeForm`
- `PromptReview`
- `RunProgress`
- `RunMetrics`
- `ResultsView`
- `CompsTable`
- `StrippedDealsTable`
- `RunHistory`
- `DownloadActions`

## Technical Requirements

- Use React hooks and plain component state unless complexity requires a small store.
- Keep CSS tokens and layout classes compatible with the existing design.
- Add unit tests for pure formatting, prompt-building, and scope serialization helpers.
- Avoid changing backend behavior as part of this refactor.

## Acceptance Criteria

- Existing successful pull flow still works.
- Scope form generates the same prompt shape as before.
- Results render the same data fields as before.
- Downloads still work.
- No legacy script tag or direct `document.getElementById` controller remains for core app behavior.

