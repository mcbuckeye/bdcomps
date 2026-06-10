import os
import time
from contextlib import contextmanager

import psycopg
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb


DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://bdcomps:bdcomps@postgres:5432/bdcomps",
)


@contextmanager
def get_connection():
    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as connection:
        yield connection


def initialize_database(max_attempts=30):
    last_error = None
    for _ in range(max_attempts):
        try:
            with get_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        CREATE TABLE IF NOT EXISTS users (
                            id BIGSERIAL PRIMARY KEY,
                            email TEXT NOT NULL UNIQUE,
                            display_name TEXT,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                            last_login_at TIMESTAMPTZ
                        );
                        """
                    )
                    cursor.execute(
                        """
                        CREATE TABLE IF NOT EXISTS auth_identities (
                            id BIGSERIAL PRIMARY KEY,
                            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                            provider TEXT NOT NULL,
                            provider_subject TEXT NOT NULL,
                            password_hash TEXT,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                            UNIQUE (provider, provider_subject)
                        );
                        """
                    )
                    cursor.execute(
                        """
                        CREATE TABLE IF NOT EXISTS sessions (
                            id BIGSERIAL PRIMARY KEY,
                            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                            token_hash TEXT NOT NULL UNIQUE,
                            expires_at TIMESTAMPTZ NOT NULL,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                            revoked_at TIMESTAMPTZ
                        );
                        """
                    )
                    cursor.execute(
                        """
                        CREATE TABLE IF NOT EXISTS workspaces (
                            id BIGSERIAL PRIMARY KEY,
                            owner_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                            name TEXT NOT NULL,
                            type TEXT NOT NULL DEFAULT 'personal',
                            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
                        );
                        """
                    )
                    cursor.execute(
                        """
                        CREATE TABLE IF NOT EXISTS workspace_members (
                            id BIGSERIAL PRIMARY KEY,
                            workspace_id BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
                            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                            role TEXT NOT NULL DEFAULT 'owner',
                            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                            UNIQUE (workspace_id, user_id)
                        );
                        """
                    )
                    cursor.execute(
                        """
                        CREATE TABLE IF NOT EXISTS runs (
                            id BIGSERIAL PRIMARY KEY,
                            request_id TEXT NOT NULL,
                            status TEXT NOT NULL,
                            prompt TEXT,
                            scope JSONB NOT NULL DEFAULT '{}'::jsonb,
                            result JSONB,
                            error TEXT,
                            activity_log JSONB NOT NULL DEFAULT '[]'::jsonb,
                            workspace_id BIGINT REFERENCES workspaces(id) ON DELETE SET NULL,
                            user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
                            mode TEXT NOT NULL DEFAULT 'standard',
                            cache_key TEXT,
                            started_at TIMESTAMPTZ,
                            completed_at TIMESTAMPTZ,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
                        );
                        """
                    )
                    cursor.execute("ALTER TABLE runs ADD COLUMN IF NOT EXISTS workspace_id BIGINT REFERENCES workspaces(id) ON DELETE SET NULL;")
                    cursor.execute("ALTER TABLE runs ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;")
                    cursor.execute("ALTER TABLE runs ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'standard';")
                    cursor.execute("ALTER TABLE runs ADD COLUMN IF NOT EXISTS cache_key TEXT;")
                    cursor.execute("ALTER TABLE runs ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;")
                    cursor.execute("ALTER TABLE runs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;")
                    cursor.execute(
                        """
                        CREATE TABLE IF NOT EXISTS pull_cache_entries (
                            id BIGSERIAL PRIMARY KEY,
                            workspace_id BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
                            cache_key TEXT NOT NULL,
                            prompt_version TEXT NOT NULL,
                            model TEXT NOT NULL,
                            stage TEXT NOT NULL,
                            payload_json JSONB NOT NULL,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                            expires_at TIMESTAMPTZ,
                            UNIQUE (workspace_id, cache_key, prompt_version, model, stage)
                        );
                        """
                    )
                    cursor.execute(
                        """
                        CREATE TABLE IF NOT EXISTS pull_stages (
                            id BIGSERIAL PRIMARY KEY,
                            run_id BIGINT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
                            stage_name TEXT NOT NULL,
                            status TEXT NOT NULL,
                            started_at TIMESTAMPTZ,
                            completed_at TIMESTAMPTZ,
                            duration_seconds NUMERIC,
                            cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
                            error TEXT,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
                        );
                        """
                    )
                    cursor.execute(
                        """
                        CREATE TABLE IF NOT EXISTS exports (
                            id BIGSERIAL PRIMARY KEY,
                            workspace_id BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
                            run_id BIGINT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
                            type TEXT NOT NULL,
                            status TEXT NOT NULL,
                            file_name TEXT,
                            content_type TEXT,
                            byte_size BIGINT,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                            error TEXT
                        );
                        """
                    )
                    cursor.execute("CREATE INDEX IF NOT EXISTS idx_runs_created_at ON runs (created_at DESC);")
                    cursor.execute("CREATE INDEX IF NOT EXISTS idx_runs_workspace_created_at ON runs (workspace_id, created_at DESC);")
                    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions (token_hash);")
                    cursor.execute("CREATE INDEX IF NOT EXISTS idx_cache_lookup ON pull_cache_entries (workspace_id, cache_key, prompt_version, model, stage);")
                connection.commit()
            return
        except Exception as exc:
            last_error = exc
            time.sleep(1)
    raise RuntimeError(f"Database did not become ready: {last_error}")


def create_user_with_workspace(email, password_hash, display_name=None):
    normalized = email.strip().lower()
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO users (email, display_name)
                VALUES (%s, %s)
                RETURNING id, email, display_name, created_at;
                """,
                (normalized, display_name or normalized.split("@")[0]),
            )
            user = cursor.fetchone()
            cursor.execute(
                """
                INSERT INTO auth_identities (user_id, provider, provider_subject, password_hash)
                VALUES (%s, 'local', %s, %s);
                """,
                (user["id"], normalized, password_hash),
            )
            cursor.execute(
                """
                INSERT INTO workspaces (owner_user_id, name, type)
                VALUES (%s, %s, 'personal')
                RETURNING id, owner_user_id, name, type, created_at;
                """,
                (user["id"], f"{user['display_name'] or normalized}'s Workspace"),
            )
            workspace = cursor.fetchone()
            cursor.execute(
                """
                INSERT INTO workspace_members (workspace_id, user_id, role)
                VALUES (%s, %s, 'owner');
                """,
                (workspace["id"], user["id"]),
            )
        connection.commit()
    return user, workspace


def get_local_identity(email):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT u.id, u.email, u.display_name, ai.password_hash
                FROM users u
                JOIN auth_identities ai ON ai.user_id = u.id
                WHERE ai.provider = 'local' AND ai.provider_subject = %s;
                """,
                (email.strip().lower(),),
            )
            return cursor.fetchone()


def touch_user_login(user_id):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = %s;", (user_id,))
        connection.commit()


def create_session(user_id, token_hash, expires_at):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO sessions (user_id, token_hash, expires_at)
                VALUES (%s, %s, %s)
                RETURNING id, user_id, expires_at, created_at;
                """,
                (user_id, token_hash, expires_at),
            )
            row = cursor.fetchone()
        connection.commit()
    return row


def get_session_user(token_hash):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT u.id, u.email, u.display_name, s.expires_at
                FROM sessions s
                JOIN users u ON u.id = s.user_id
                WHERE s.token_hash = %s
                  AND s.revoked_at IS NULL
                  AND s.expires_at > now();
                """,
                (token_hash,),
            )
            return cursor.fetchone()


def revoke_session(token_hash):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("UPDATE sessions SET revoked_at = now() WHERE token_hash = %s;", (token_hash,))
        connection.commit()


def list_workspaces_for_user(user_id):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT w.id, w.owner_user_id, w.name, w.type, wm.role, w.created_at, w.updated_at
                FROM workspaces w
                JOIN workspace_members wm ON wm.workspace_id = w.id
                WHERE wm.user_id = %s
                ORDER BY w.created_at ASC;
                """,
                (user_id,),
            )
            return cursor.fetchall()


def create_workspace(user_id, name):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO workspaces (owner_user_id, name, type)
                VALUES (%s, %s, 'personal')
                RETURNING id, owner_user_id, name, type, created_at, updated_at;
                """,
                (user_id, name),
            )
            workspace = cursor.fetchone()
            cursor.execute(
                """
                INSERT INTO workspace_members (workspace_id, user_id, role)
                VALUES (%s, %s, 'owner');
                """,
                (workspace["id"], user_id),
            )
        connection.commit()
    return workspace


def user_can_access_workspace(user_id, workspace_id):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT w.id, w.owner_user_id, w.name, w.type, wm.role, w.created_at, w.updated_at
                FROM workspaces w
                JOIN workspace_members wm ON wm.workspace_id = w.id
                WHERE wm.user_id = %s AND w.id = %s;
                """,
                (user_id, workspace_id),
            )
            return cursor.fetchone()


def save_run(request_id, status, prompt, scope, result=None, error=None, activity_log=None, workspace_id=None, user_id=None, mode="standard", cache_key=None):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO runs (request_id, status, prompt, scope, result, error, activity_log, workspace_id, user_id, mode, cache_key, started_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CASE WHEN %s = 'running' THEN now() ELSE NULL END)
                RETURNING id, created_at;
                """,
                (
                    request_id,
                    status,
                    prompt,
                    Jsonb(scope or {}),
                    Jsonb(result) if result is not None else None,
                    error,
                    Jsonb(activity_log or []),
                    workspace_id,
                    user_id,
                    mode,
                    cache_key,
                    status,
                ),
            )
            row = cursor.fetchone()
        connection.commit()
    return row


def update_run(run_id, status, result=None, error=None, activity_log=None):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE runs
                SET status = %s,
                    result = COALESCE(%s, result),
                    error = %s,
                    activity_log = COALESCE(%s, activity_log),
                    completed_at = CASE WHEN %s IN ('completed', 'failed') THEN now() ELSE completed_at END,
                    updated_at = now()
                WHERE id = %s
                RETURNING id, request_id, status, scope, result, error, activity_log, workspace_id, user_id, mode, cache_key, started_at, completed_at, created_at, updated_at;
                """,
                (
                    status,
                    Jsonb(result) if result is not None else None,
                    error,
                    Jsonb(activity_log) if activity_log is not None else None,
                    status,
                    run_id,
                ),
            )
            row = cursor.fetchone()
        connection.commit()
    return row


def get_run(run_id, workspace_id=None):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            if workspace_id is None:
                cursor.execute(
                    """
                    SELECT id, request_id, status, prompt, scope, result, error, activity_log, workspace_id, user_id, mode, cache_key, started_at, completed_at, created_at, updated_at
                    FROM runs
                    WHERE id = %s;
                    """,
                    (run_id,),
                )
            else:
                cursor.execute(
                    """
                    SELECT id, request_id, status, prompt, scope, result, error, activity_log, workspace_id, user_id, mode, cache_key, started_at, completed_at, created_at, updated_at
                    FROM runs
                    WHERE id = %s AND workspace_id = %s;
                    """,
                    (run_id, workspace_id),
                )
            return cursor.fetchone()


def list_runs(limit=25, workspace_id=None):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            if workspace_id is None:
                cursor.execute(
                    """
                    SELECT id, request_id, status, prompt, scope, result, error, activity_log, workspace_id, user_id, mode, started_at, completed_at, created_at, updated_at
                    FROM runs
                    ORDER BY created_at DESC
                    LIMIT %s;
                    """,
                    (limit,),
                )
            else:
                cursor.execute(
                    """
                    SELECT id, request_id, status, prompt, scope, result, error, activity_log, workspace_id, user_id, mode, started_at, completed_at, created_at, updated_at
                    FROM runs
                    WHERE workspace_id = %s
                    ORDER BY created_at DESC
                    LIMIT %s;
                    """,
                    (workspace_id, limit),
                )
            return cursor.fetchall()


def save_cache_entry(workspace_id, cache_key, prompt_version, model, stage, payload, expires_at=None):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO pull_cache_entries (workspace_id, cache_key, prompt_version, model, stage, payload_json, expires_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (workspace_id, cache_key, prompt_version, model, stage)
                DO UPDATE SET payload_json = EXCLUDED.payload_json, created_at = now(), expires_at = EXCLUDED.expires_at
                RETURNING id, created_at;
                """,
                (workspace_id, cache_key, prompt_version, model, stage, Jsonb(payload), expires_at),
            )
            row = cursor.fetchone()
        connection.commit()
    return row


def get_cache_entry(workspace_id, cache_key, prompt_version, model, stage):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, payload_json, created_at, expires_at
                FROM pull_cache_entries
                WHERE workspace_id = %s
                  AND cache_key = %s
                  AND prompt_version = %s
                  AND model = %s
                  AND stage = %s
                  AND (expires_at IS NULL OR expires_at > now());
                """,
                (workspace_id, cache_key, prompt_version, model, stage),
            )
            return cursor.fetchone()


def save_stage(run_id, stage_name, status, started_at=None, completed_at=None, duration_seconds=None, cache_hit=False, error=None):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO pull_stages (run_id, stage_name, status, started_at, completed_at, duration_seconds, cache_hit, error)
                VALUES (%s, %s, %s, COALESCE(%s, now()), %s, %s, %s, %s)
                RETURNING id, run_id, stage_name, status, started_at, completed_at, duration_seconds, cache_hit, error;
                """,
                (run_id, stage_name, status, started_at, completed_at, duration_seconds, cache_hit, error),
            )
            row = cursor.fetchone()
        connection.commit()
    return row


def list_stages(run_id):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, run_id, stage_name, status, started_at, completed_at, duration_seconds, cache_hit, error
                FROM pull_stages
                WHERE run_id = %s
                ORDER BY id ASC;
                """,
                (run_id,),
            )
            return cursor.fetchall()


def save_export_metadata(workspace_id, run_id, export_type, status, file_name=None, content_type=None, byte_size=None, error=None):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO exports (workspace_id, run_id, type, status, file_name, content_type, byte_size, error)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, created_at;
                """,
                (workspace_id, run_id, export_type, status, file_name, content_type, byte_size, error),
            )
            row = cursor.fetchone()
        connection.commit()
    return row
