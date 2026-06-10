# PRD 001: User Auth And Workspaces

## Summary

Add first-party authentication and individual user workspaces so each analyst can safely save runs, review history, and manage outputs without mixing work with other users. Start with email/password auth for local and early internal use, while designing the identity model to support Azure AD SSO later.

## Problem

The current app is single-tenant and unauthenticated. Run records are stored in Postgres, but the UI is not tied to a user identity. This limits usefulness for real BD/M&A workflows because users need private saved runs, repeatable workspaces, future sharing controls, and an enterprise authentication path.

## Goals

- Allow users to sign up and sign in with email/password.
- Create one default personal workspace for every new user.
- Associate pull runs, uploaded datasets, prompts, cached results, and exports with a workspace.
- Support session persistence across browser refreshes.
- Establish an identity model compatible with future Azure AD SSO.
- Protect API endpoints so user data is not accessible without authentication.

## Non-Goals

- Full enterprise role-based access control in the first release.
- Azure AD SSO implementation in the first release.
- Workspace sharing, comments, or collaborative editing.
- Passwordless login or multi-factor authentication.

## Personas

- BD analyst: runs comps pulls, reviews results, downloads exports.
- BD manager: reviews analyst outputs and may later need shared workspace access.
- Admin/operator: configures auth providers and environment secrets.

## User Stories

- As an analyst, I can create an account using email and password.
- As an analyst, I can sign in and return to my saved runs.
- As an analyst, I can only see my own workspace data.
- As an analyst, I can sign out from the app.
- As an operator, I can later enable Azure AD SSO without replacing the user/workspace data model.

## Functional Requirements

- Add database tables for users, auth identities, sessions, and workspaces.
- Hash passwords using a modern password hashing algorithm such as Argon2 or bcrypt.
- Issue secure HTTP-only session cookies or short-lived JWT access tokens with refresh handling.
- Add signup, login, logout, and current-user endpoints.
- Automatically create a personal workspace on signup.
- Add `workspace_id` ownership to run records.
- Add middleware/dependencies that require authenticated users for app API endpoints.
- Add frontend screens for login, signup, and signed-in app shell.
- Persist the authenticated state after refresh.
- Show the active user email and workspace name in the UI.

## Azure AD Readiness

- Store authentication providers separately from core users.
- Use a stable internal `users.id` as the owner key.
- Add an `auth_identities` table with fields such as `provider`, `provider_subject`, and `email`.
- For email/password users, use provider value `local`.
- For future Azure AD users, use provider value `azure_ad` and the Entra object ID or OIDC subject as `provider_subject`.
- Reserve environment variables for future OIDC configuration:
  - `AZURE_AD_CLIENT_ID`
  - `AZURE_AD_CLIENT_SECRET`
  - `AZURE_AD_TENANT_ID`
  - `AZURE_AD_REDIRECT_URI`

## Data Model

- `users`: id, email, display_name, created_at, updated_at, last_login_at.
- `auth_identities`: id, user_id, provider, provider_subject, password_hash, created_at.
- `sessions`: id, user_id, token_hash, expires_at, created_at, revoked_at.
- `workspaces`: id, owner_user_id, name, type, created_at, updated_at.
- `workspace_members`: id, workspace_id, user_id, role, created_at.

## API Requirements

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/workspaces`
- `POST /api/workspaces`
- `GET /api/workspaces/{workspace_id}`

## Security Requirements

- Never store plaintext passwords.
- Never expose password hashes in API responses or logs.
- Use secure cookie settings in production.
- Rate-limit login attempts.
- Return generic login failure messages.
- Keep OpenAI API keys server-side only.

## Acceptance Criteria

- A new user can sign up, sign in, refresh the page, and remain signed in.
- A new user gets one default workspace.
- Pull runs created by one user are not visible to another user.
- Authenticated API routes reject unauthenticated requests.
- The schema can support both local and Azure AD identities for one internal user record.

