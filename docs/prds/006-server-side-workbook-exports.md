# PRD 006: Server-Side Workbook Exports

## Summary

Move workbook generation from browser-side Excel XML to a backend-generated `.xlsx` export. The workbook should be durable, better formatted, and reproducible from saved run data.

## Problem

The current export builds an Excel-openable XML document in the browser and downloads it as `.xls`. This is acceptable for a prototype, but it is not ideal for production use. Users need reliable `.xlsx` files with consistent formatting, sheet structure, and server-side reproducibility.

## Goals

- Generate native `.xlsx` files in the backend.
- Use saved run data as the source of truth.
- Include all memo-ready sheets.
- Make exports downloadable from run history.
- Support future branding and compliance formatting.

## Non-Goals

- Full PowerPoint or Word memo generation.
- Complex custom templates per user.
- Editing workbooks in the browser.

## User Stories

- As an analyst, I can download a formatted `.xlsx` workbook for a completed run.
- As an analyst, I can reopen a historical run and download the same workbook again.
- As a manager, I can receive a workbook with clear sheets, sources, and methodology.
- As an operator, I can change workbook formatting in one backend service.

## Functional Requirements

- Add backend export endpoint for completed runs.
- Generate `.xlsx` using a Python workbook library such as `openpyxl` or `xlsxwriter`.
- Include sheets:
  - Summary
  - Comps
  - Stripped Deals Audit
  - Source Verification
  - Uploaded Datasets
  - Activity Log
  - Methodology
  - Prompt
- Store export metadata in Postgres.
- Optionally cache generated files or regenerate on demand.
- Update frontend download button to call the backend export endpoint.

## Formatting Requirements

- Freeze header rows.
- Apply column widths.
- Use bold headers.
- Format currency values consistently.
- Make source URLs clickable.
- Include run metadata and generation timestamp.

## API Requirements

- `POST /api/workspaces/{workspace_id}/runs/{run_id}/exports/workbook`
- `GET /api/workspaces/{workspace_id}/runs/{run_id}/exports/workbook`

## Data Model

- `exports`: id, workspace_id, run_id, type, status, file_name, content_type, byte_size, created_at, error.

## Acceptance Criteria

- A completed run can produce a valid `.xlsx` file.
- The workbook opens in Excel without compatibility warnings.
- The workbook includes comps, stripped deals, methodology, activity, and prompt data.
- Historical runs can regenerate or retrieve their workbook.

