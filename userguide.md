# BeOne Oncology Comps Launcher User Guide

This guide explains how to use the BeOne Oncology Comps Launcher to configure oncology deal-comps searches, run public-source web discovery, review results, export workbooks, and revisit prior runs.

## 1. Open The App

Start the Docker Compose app from the project folder:

```bash
docker compose up -d --build
```

Open the frontend:

```text
http://127.0.0.1:4174/
```

The app opens to a workspace sign-in screen.

## 2. Create Or Sign In To An Account

Use the local email/password sign-in screen.

To create an account:

1. Click `Create account`.
2. Enter an email address.
3. Enter a password with at least 8 characters.
4. Enter a display name.
5. Click `Create account`.

The app creates a personal workspace automatically. After sign-in, your email and workspace name appear in the sidebar.

To sign in later:

1. Enter the same email and password.
2. Click `Sign in`.

Use `Sign out` in the sidebar when you are done.

## 3. Configure A Comps Pull

The `Launcher` view is where you define the scope of the search. Every field is optional. Leaving a field blank means the search is not constrained by that field.

Common scope fields:

- `Therapeutic area / tumor type`: examples include breast cancer, NSCLC, heme malignancies.
- `Target / MOA`: examples include HER2, BTK, PD-1, CD3 engager.
- `Modality`: choose suggestions such as small molecule, mAb, ADC, bispecific antibody, cell therapy, or radiopharmaceutical, or type a custom value.
- `Deal type`: choose licensing, M&A, option, co-development, asset acquisition, or type a custom value.
- `Stage`: choose preclinical, Phase 1, Phase 2, Phase 3, approved, or type a custom value.
- `Geography`: choose global, US, China, ex-US, Europe, Japan, or type a custom value.
- `Date range`: choose a preset or `Custom range`.
- `Minimum upfront, USD M`: filters for deals with upfront value at or above the entered amount.
- `Minimum biobucks, USD M`: filters for deals with total milestone/biobucks value at or above the entered amount.

The filter count badge updates as you add scope criteria.

## 4. Use Structural Filters

Structural filters identify deal categories that should be removed from the clean comps table and placed into the stripped-deals audit.

Checked categories are stripped into the audit sheet:

- Co-dev / co-commercialization
- Royalty monetization
- Unexercised options
- Academic / non-profit
- Equity-only
- SPAC / shell
- Intra-group

Keep a box checked when that category should not be treated as a clean valuation comp. Uncheck it when you want that category to remain eligible for the clean comps table.

## 5. Choose Candidate Input

The `Candidate List` section controls how the first pull starts.

- `Web-only`: the app discovers candidate deals from public sources.
- `Paste raw`: paste raw candidate text, source excerpts, or notes.
- `Structured rows`: paste one candidate per line. Use this when you already have deal names or partial rows.

Database exports are intentionally handled later from the `Results` view. Uploaded database rows are treated as candidate leads that still require public-source verification.

## 6. Select Output Options

The `Output Options` section controls what the run should produce.

- `Excel workbook`: enables workbook export.
- `Written summary`: generates a narrative summary in the app.
- `Benchmark against target`: asks the system to compare comps against a specific target deal.
- `Pull mode`: choose `Standard`, `Draft`, or `Memo-ready`.
- `Target deal to benchmark`: optional context for the target asset, economics, territory, stage, or memo question.

Use `Memo-ready` when the output is intended for a polished business-development memo.

## 7. Review The Prompt

Click `Generate prompt` to build the structured prompt before running the pull.

Open `Prompt Review` to inspect the generated request. This view is useful for checking whether the scope, filters, candidate mode, and output options match your intent.

Use `Copy prompt` if you want to save or share the generated prompt text.

## 8. Run The Pull

Click `Run pull` to start the backend job.

The app switches to `Run Progress`, where you can monitor:

- Current run status
- Elapsed time
- Progress log
- Candidates found
- Clean comps
- Stripped deals
- Confidence

The backend uses OpenAI web search and primary-source verification. Broad searches may take several minutes.

If a run fails, check the progress log first. Common causes include missing backend configuration, transient upstream errors, or an overly large uploaded payload during augmentation.

## 9. Review Results

Open the `Results` view after a completed run.

The results include:

- `Written Summary`: narrative explanation of the run.
- `Comps`: primary-source verified rows that passed the structural filters.
- `Stripped Deals Audit`: rows removed by structural filters or screening.
- `Primary source` links and analyst notes where available.

Flags in the summary and table:

- `OK`: verified comp.
- `REVIEW`: needs analyst review.
- `WATCH`: directional comp.

Always review source links and analyst notes before relying on the output in a final memo.

## 10. Export Outputs

From the `Results` view:

- Click `Download summary` to download a text summary.
- Click `Download Excel` to download the server-generated workbook.

The workbook can include sheets such as:

- Summary
- Comps
- Stripped Deals Audit
- Source Verification
- Uploaded Datasets
- Activity Log
- Methodology
- Prompt

Workbook export is available after the run completes.

## 11. Refine A Completed Run

Use `Refine Output` when you want to change the saved output without starting from scratch.

Examples:

- Add a workbook column.
- Reclassify categories.
- Group comps by modality or stage.
- Adjust memo wording.
- Add analyst notes.

Enter the requested change and click `Apply refinement`. The app updates the current run output and records the refinement in the thread.

## 12. Augment With Database Exports

Use `Augment With Database Exports` after an initial web-discovery run.

Supported upload types:

- `.csv`
- `.xlsx`

Typical sources:

- Cortellis
- GlobalData
- Internal exports

Steps:

1. Open a completed run.
2. Upload one or more `.csv` or `.xlsx` files.
3. Optionally enter instructions, such as prioritizing ADC asset acquisitions or flagging duplicates.
4. Click `Merge uploaded data`.

Uploaded rows are treated as candidate leads. They should not be considered clean comps unless the system can verify them against public or primary sources.

## 13. Use Run History

Open `Run History` to view saved runs for the active workspace.

From history you can:

- Open a completed run.
- View the generated prompt.
- Review activity logs.
- Refresh the history list.

Run history is stored in Postgres and scoped to the signed-in workspace.

## 14. Reset The Launcher

Click `Reset all` to clear the current launcher form and return to the default settings.

Resetting the form does not delete saved run history.

## 15. Practical Review Checklist

Before using results in a business-development memo, check:

- The therapeutic area, target, modality, stage, geography, and date range match the memo question.
- Structural filters reflect the intended comp set.
- Clean comps have credible primary-source support.
- Stripped deals were removed for appropriate reasons.
- `REVIEW` and `WATCH` rows are not treated as fully verified.
- Uploaded database rows were verified before inclusion.
- Workbook sheets and summary text match the latest refined output.

## 16. Troubleshooting

If the app does not load, check containers:

```bash
docker compose ps
```

If a run fails, check backend logs:

```bash
docker compose logs -f backend
```

If exports or uploads fail, check whether the run completed and whether the uploaded file is a supported `.csv` or `.xlsx` file.

If sign-in or run history behaves unexpectedly, sign out and sign back in. Local users, workspaces, run history, cache entries, and export metadata are stored in the Postgres container volume.

Do not put API keys into the website UI. Keep secrets in the local `.env` file only.
