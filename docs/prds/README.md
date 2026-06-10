# PRD Index

This folder contains product requirement documents for the next functional additions to the BeOne Oncology Comps Launcher.

## PRDs

1. [User Auth And Workspaces](./001-user-auth-and-workspaces.md)
2. [Server-Backed Run History](./002-server-backed-run-history.md)
3. [Staged Cached Pull Workflow](./003-staged-cached-pull-workflow.md)
4. [React Frontend Refactor](./004-react-frontend-refactor.md)
5. [Live Run Progress Streaming](./005-live-run-progress-streaming.md)
6. [Server-Side Workbook Exports](./006-server-side-workbook-exports.md)

## Sequencing Recommendation

Build user auth and workspaces first, then move run history server-side. Those two changes create the ownership model needed for cached pulls, live progress, and server-generated exports.

