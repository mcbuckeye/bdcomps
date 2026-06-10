# PRD 003: Staged Cached Pull Workflow

## Summary

Improve pull speed, reliability, and cost control by splitting the OpenAI workflow into staged discovery and verification steps, caching reusable results, and supporting incremental refreshes.

## Problem

One broad OpenAI web-search call has to discover candidates, verify primary sources, filter structurally, and format outputs. This can be slow, expensive, and vulnerable to upstream timeouts or 502 errors. Narrow pulls work, but broad pulls need a safer workflow.

## Goals

- Reduce wall-clock time for broad pulls.
- Reduce repeated spend for duplicate or similar pulls.
- Preserve primary-source verification quality.
- Support reruns that refresh only recent changes.
- Make failures recoverable at the stage level.

## Non-Goals

- Replacing OpenAI web search with a fully custom web crawler.
- Guaranteeing complete market coverage for every possible broad query.
- Human review workflow or approvals.

## User Stories

- As an analyst, I can run a draft discovery pull quickly.
- As an analyst, I can verify a candidate set into memo-ready comps.
- As an analyst, I can rerun the same scope and reuse cached work.
- As an analyst, I can refresh a prior pull for newly announced deals only.
- As an analyst, I can see which stage is currently running.

## Workflow

1. Normalize scope into a deterministic cache key.
2. Discovery stage finds candidate deals and source leads.
3. Candidate normalization deduplicates by acquirer, target, asset, date, and source.
4. Verification stage checks primary sources and applies filters.
5. Output stage builds comps, stripped deals, methodology, and summary.
6. Cache completed stage outputs by scope, model, prompt version, and date window.

## Functional Requirements

- Add pull modes: `Draft`, `Standard`, and `Memo-ready`.
- Add stage-level run records with status, timing, and errors.
- Add cache lookup before OpenAI calls.
- Add cache invalidation when prompt version or model settings change.
- Add refresh mode that searches only from a selected date forward.
- Allow broad pulls to split into chunks by modality, geography, date period, or deal type.
- Merge and deduplicate chunk results before verification.
- Surface cache hits, cache misses, and stage timings in activity logs.

## Data Model

- `pull_cache_entries`: id, workspace_id, cache_key, prompt_version, model, stage, payload_json, created_at, expires_at.
- `pull_stages`: id, run_id, stage_name, status, started_at, completed_at, duration_seconds, cache_hit, error.
- `candidate_deals`: id, run_id, normalized_key, acquirer, target, asset, announcement_date, sources_json, status.

## API Requirements

- `POST /api/workspaces/{workspace_id}/pulls`
- `GET /api/workspaces/{workspace_id}/runs/{run_id}/stages`
- Optional request fields:
  - `mode`
  - `use_cache`
  - `refresh_from`
  - `chunking_strategy`

## Performance Requirements

- Cache hit for a completed equivalent pull should return results without a new OpenAI web-search call.
- Stage failures should not lose completed prior stages.
- Broad pulls should provide progress updates per chunk or stage.

## Acceptance Criteria

- Re-running an identical completed pull can reuse cached results.
- A broad pull can be split into multiple stage records.
- If verification fails, discovery candidates remain available for retry.
- Activity logs clearly show stage timing and cache behavior.

