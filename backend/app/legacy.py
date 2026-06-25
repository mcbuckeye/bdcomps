import cgi
import csv
import io
import json
import os
import re
import socket
import time
import urllib.error
import urllib.request
import uuid
import zipfile
import xml.etree.ElementTree as ET
from datetime import date
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


def load_env_file(path=".env"):
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip("'\"")
            if key and key not in os.environ:
                os.environ[key] = value


load_env_file()


HOST = os.environ.get("COMPS_HOST", "127.0.0.1")
PORT = int(os.environ.get("COMPS_PORT", "4174"))
OPENAI_URL = "https://api.openai.com/v1/responses"
MODEL = os.environ.get("OPENAI_MODEL", "gpt-5.5")
OPENAI_TIMEOUT_SECONDS = int(os.environ.get("OPENAI_TIMEOUT_SECONDS", "900"))
MAX_OUTPUT_TOKENS = int(os.environ.get("OPENAI_MAX_OUTPUT_TOKENS", "30000"))
OPENAI_RETRIES = int(os.environ.get("OPENAI_RETRIES", "4"))
OPENAI_DISABLE_PROXY = os.environ.get("OPENAI_DISABLE_PROXY", "1") != "0"
OPENAI_REASONING_EFFORT = os.environ.get("OPENAI_REASONING_EFFORT", "high")
OPENAI_SEARCH_CONTEXT_SIZE = os.environ.get("OPENAI_SEARCH_CONTEXT_SIZE", "high")
OPENAI_SEARCH_TOKEN_BUDGET = os.environ.get("OPENAI_SEARCH_TOKEN_BUDGET", "unlimited")


SYSTEM_PROMPT = """You are an oncology BD/M&A comps research agent for BeOne Medicines.

Return exhaustive public-source deal comps for the requested scope. Search the live web. Do not use an internal sample list. Do not invent deals, economics, stages, assets, dates, or URLs.

Exhaustive mode:
- The user wants ALL relevant comps, not a representative top 5, top 10, or shortlist.
- Never stop after 5 deals merely because the set looks directionally useful.
- For broad oncology searches, first build a wide candidate universe using multiple query angles before final filtering.
- Query across synonyms, years, source types, and transaction language. Example angles: acquisition, acquire, merger, bought, announced acquisition, definitive agreement, oncology, cancer, cell therapy, CAR-T, TCR, TIL, NK, ADC, antibody-drug conjugate, platform, company acquisition, press release, 8-K, proxy.
- If the final clean comp set has fewer than 10 deals for a broad modality/date-range screen, the methodology must explain why, list the search angles used, and state whether this is likely a true low-count set or a limited-public-source set.
- Include every in-scope deal you can verify from public sources. Put uncertain but plausible rows in REVIEW or WATCH; do not omit them just to keep the output tidy.

Global rules that always apply:
- M&A includes every announced acquisition, whether or not completed.
- Use announcement date for date filters.
- Include platform/company acquisitions when they match the requested modality or target scope.
- Strip adjacent modalities unless explicitly requested by the user. Example: if modality is ADC, strip DAC, AOC, radiopharmaceutical, mAb, bispecific, trispecific, small molecule, and cell therapy deals unless another selected modality includes them.
- Strip co-dev/co-commercialization, royalty monetization, unexercised options, academic/non-profit, equity-only, SPAC/shell, and intra-group deals when requested by the user.
- Prefer licensor PR, licensee PR, acquirer PR, target PR, 8-K, 10-K, proxy, merger agreement, annual report, or equivalent primary sources.
- Do not conflate upfront/cash equity value with total consideration, contingent value rights, milestones, earnouts, or royalties.
- If economics are undisclosed, use null and explain.
- If a potential comp is excluded, put it in stripped_deals with the reason.
- Preserve confidence flags: OK, REVIEW, WATCH.

You must produce strict JSON only, no markdown, matching this shape:
{
  "summary": "short written summary",
  "comps": [
    {
      "flag": "OK|REVIEW|WATCH",
      "deal": "Acquirer / Target or Licensor / Licensee",
      "acquirer": "string or null",
      "target_company": "string or null",
      "asset": "string or null",
      "target_moa": "string or null",
      "indication": "string or null",
      "modality": "string",
      "stage": "string or null",
      "geography": "string or null",
      "deal_type": "string",
      "announcement_date": "YYYY-MM-DD",
      "announced_or_completed": "Announced|Completed|Terminated|Unknown",
      "upfront_usd_m": number or null,
      "total_value_usd_m": number or null,
      "royalty": "string or null",
      "primary_source_name": "string",
      "primary_source_url": "https://...",
      "confidence": number,
      "analyst_note": "string"
    }
  ],
  "stripped_deals": [
    {
      "deal": "string",
      "reason": "string",
      "source": "string",
      "source_url": "https://... or null",
      "analyst_note": "string"
    }
  ],
  "methodology": ["string"]
}
"""


REFINEMENT_SYSTEM_PROMPT = """You are an oncology BD/M&A comps refinement agent for BeOne Medicines.

You receive an existing public-source oncology comps result JSON and a user refinement instruction.
Return a full revised result JSON only, with no markdown.

Rules:
- Preserve the original run unless the user explicitly asks to remove, reorder, regroup, or rename something.
- Keep the standard top-level fields when present: summary, comps, stripped_deals, methodology, uploaded_datasets, activity_log.
- Keep every standard comp field when present: flag, deal, acquirer, target_company, asset, target_moa, indication, modality, stage, geography, deal_type, announcement_date, announced_or_completed, upfront_usd_m, total_value_usd_m, royalty, primary_source_name, primary_source_url, confidence, analyst_note.
- For requested workbook columns or categories that do not fit a standard field, add top-level custom_columns as an array of objects: {"key":"snake_case_key","label":"Workbook Column Label","description":"short definition"}.
- Put per-comp values for custom columns in each comp's custom object, keyed by custom_columns.key.
- If a requested value cannot be determined from the existing result or public source verification, use null and explain briefly in analyst_note or methodology.
- Do not invent deals, economics, stages, dates, URLs, or source names.
- If web lookup is needed to fill a requested refinement, prefer primary sources and preserve confidence flags.
- Include a short refinement_summary describing what changed.
"""


def json_response(handler, status, payload):
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def extract_output_text(response):
    if "output_text" in response:
        return response["output_text"]
    chunks = []
    for item in response.get("output", []):
        for content in item.get("content", []):
            text = content.get("text")
            if text:
                chunks.append(text)
    return "\n".join(chunks)


def sanitize_json_escapes(text):
    return re.sub(r'\\(?!["\\/bfnrtu])', r"\\\\", text)


def parse_json_text(text):
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text), False
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise
        candidate = match.group(0)
        try:
            return json.loads(candidate), False
        except json.JSONDecodeError:
            return json.loads(sanitize_json_escapes(candidate)), True


def activity(log, event, detail=None, request_id=None, **metrics):
    if request_id is None and log:
        request_id = log[0].get("request_id")
    entry = {
        "time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "event": event,
    }
    if request_id:
        entry["request_id"] = request_id
    if detail:
        entry["detail"] = detail
    if metrics:
        entry["metrics"] = metrics
    log.append(entry)
    log_line = {
        "time": entry["time"],
        "request_id": request_id,
        "event": event,
        "detail": detail,
        "metrics": metrics,
    }
    print(json.dumps(log_line, separators=(",", ":")), flush=True)


def call_openai(prompt, scope, log):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        activity(log, "OpenAI authentication check failed", "OPENAI_API_KEY is not set.")
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Start this backend with an OpenAI API key so Run pull can search the web."
        )

    activity(
        log,
        "OpenAI web-search request started",
        "Sending structured scope and uploaded candidate leads to the Responses API.",
        model=MODEL,
        timeout_seconds=OPENAI_TIMEOUT_SECONDS,
        max_output_tokens=MAX_OUTPUT_TOKENS,
        proxy_mode="disabled" if OPENAI_DISABLE_PROXY else "environment",
        uploaded_datasets=len(scope.get("uploadedDatasets", [])),
        uploaded_rows=sum(int(item.get("row_count", 0)) for item in scope.get("uploadedDatasets", [])),
    )
    started = time.time()
    payload = {
        "model": MODEL,
        "tools": [
            {
                "type": "web_search",
                "search_context_size": OPENAI_SEARCH_CONTEXT_SIZE,
                "return_token_budget": OPENAI_SEARCH_TOKEN_BUDGET,
            }
        ],
        "tool_choice": "auto",
        "reasoning": {"effort": OPENAI_REASONING_EFFORT},
        "max_output_tokens": MAX_OUTPUT_TOKENS,
        "input": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
            "content": (
                    "Run the live public-source comps pull for this exact request.\n\n"
                    f"Current date: {date.today().isoformat()}. Apply relative date ranges against this date and use announcement date.\n\n"
                    f"Structured scope JSON:\n{json.dumps(scope, indent=2)}\n\n"
                    f"Uploaded database candidate leads JSON:\n{json.dumps(scope.get('uploadedDatasetRows', []), indent=2)}\n\n"
                    f"User-facing protocol prompt:\n{prompt}\n\n"
                    "Find all matching public comps you can identify, not an arbitrary top-five sample. "
                    "Do not return exactly 5 deals unless the methodology explains why the public-source universe truly appears to contain only 5 in-scope deals. "
                    "Use broad candidate discovery first, then filter. Cross-reference uploaded database leads against public web results. "
                    "If an uploaded lead is in scope but missing from web discovery, include it after source verification or flag REVIEW/WATCH if verification is incomplete."
                ),
            },
        ],
    }

    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        OPENAI_URL,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({})) if OPENAI_DISABLE_PROXY else urllib.request.build_opener()
    last_error = None
    for attempt in range(1, OPENAI_RETRIES + 1):
        try:
            activity(
                log,
                "OpenAI connection attempt",
                "Attempting to contact OpenAI.",
                attempt=attempt,
                max_attempts=OPENAI_RETRIES,
            )
            with opener.open(request, timeout=OPENAI_TIMEOUT_SECONDS) as response:
                raw = response.read().decode("utf-8")
            break
        except (urllib.error.URLError, TimeoutError, socket.timeout) as exc:
            last_error = exc
            activity(
                log,
                "OpenAI connection attempt failed",
                str(exc),
                attempt=attempt,
                max_attempts=OPENAI_RETRIES,
            )
            if attempt < OPENAI_RETRIES:
                time.sleep(2 * attempt)
    else:
        raise last_error
    openai_response = json.loads(raw)
    activity(
        log,
        "OpenAI web-search response received",
        "Raw model response received from OpenAI.",
        elapsed_seconds=round(time.time() - started, 1),
        response_bytes=len(raw),
        response_id=openai_response.get("id") or "",
    )
    output_text = extract_output_text(openai_response)
    parsed, repaired_json = parse_json_text(output_text)
    parsed["openai_response_id"] = openai_response.get("id")
    parsed["model"] = MODEL
    parsed["uploaded_datasets"] = scope.get("uploadedDatasets", [])
    parse_events = []
    if repaired_json:
        parse_events.append(
            {
                "time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "event": "Result JSON repaired",
                "detail": "Backend repaired invalid JSON escape characters before parsing model output.",
                "metrics": {},
            }
        )
    parsed["activity_log"] = log + parse_events + [
        {
            "time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "event": "Result JSON parsed",
            "detail": "Parsed model output into comps, stripped deals, and methodology.",
            "metrics": {
                "clean_comps": len(parsed.get("comps", [])),
                "stripped_deals": len(parsed.get("stripped_deals", [])),
                "methodology_items": len(parsed.get("methodology", [])),
            },
        }
    ]
    return parsed


def call_openai_refinement(run_result, instruction, scope, log):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        activity(log, "OpenAI authentication check failed", "OPENAI_API_KEY is not set.")
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Start this backend with an OpenAI API key so refinements can run."
        )

    activity(
        log,
        "OpenAI refinement request started",
        "Sending saved comps result and user instruction to the refinement agent.",
        model=MODEL,
        timeout_seconds=OPENAI_TIMEOUT_SECONDS,
        max_output_tokens=MAX_OUTPUT_TOKENS,
    )
    started = time.time()
    payload = {
        "model": MODEL,
        "tools": [
            {
                "type": "web_search",
                "search_context_size": OPENAI_SEARCH_CONTEXT_SIZE,
                "return_token_budget": OPENAI_SEARCH_TOKEN_BUDGET,
            }
        ],
        "tool_choice": "auto",
        "reasoning": {"effort": OPENAI_REASONING_EFFORT},
        "max_output_tokens": MAX_OUTPUT_TOKENS,
        "input": [
            {"role": "system", "content": REFINEMENT_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    "Apply this refinement instruction to the saved oncology comps result.\n\n"
                    f"Current date: {date.today().isoformat()}.\n\n"
                    f"User refinement instruction:\n{instruction}\n\n"
                    f"Original structured scope JSON:\n{json.dumps(scope or {}, indent=2)}\n\n"
                    f"Current saved result JSON:\n{json.dumps(run_result or {}, indent=2)}\n\n"
                    "Return the complete revised result JSON. If adding workbook columns, use custom_columns plus per-comp custom values."
                ),
            },
        ],
    }

    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        OPENAI_URL,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({})) if OPENAI_DISABLE_PROXY else urllib.request.build_opener()
    last_error = None
    for attempt in range(1, OPENAI_RETRIES + 1):
        try:
            activity(
                log,
                "OpenAI refinement connection attempt",
                "Attempting to contact OpenAI.",
                attempt=attempt,
                max_attempts=OPENAI_RETRIES,
            )
            with opener.open(request, timeout=OPENAI_TIMEOUT_SECONDS) as response:
                raw = response.read().decode("utf-8")
            break
        except (urllib.error.URLError, TimeoutError, socket.timeout) as exc:
            last_error = exc
            activity(
                log,
                "OpenAI refinement connection attempt failed",
                str(exc),
                attempt=attempt,
                max_attempts=OPENAI_RETRIES,
            )
            if attempt < OPENAI_RETRIES:
                time.sleep(2 * attempt)
    else:
        raise last_error

    openai_response = json.loads(raw)
    activity(
        log,
        "OpenAI refinement response received",
        "Raw refinement response received from OpenAI.",
        elapsed_seconds=round(time.time() - started, 1),
        response_bytes=len(raw),
        response_id=openai_response.get("id") or "",
    )
    output_text = extract_output_text(openai_response)
    parsed, repaired_json = parse_json_text(output_text)
    parsed["openai_response_id"] = openai_response.get("id")
    parsed["model"] = MODEL
    if repaired_json:
        activity(
            log,
            "Refinement JSON repaired",
            "Backend repaired invalid JSON escape characters before parsing model output.",
        )
    activity(
        log,
        "Refinement JSON parsed",
        "Parsed refined result into comps, stripped deals, methodology, and custom columns.",
        clean_comps=len(parsed.get("comps", [])),
        stripped_deals=len(parsed.get("stripped_deals", [])),
        custom_columns=len(parsed.get("custom_columns", [])),
    )
    return parsed


def parse_csv_file(filename, data):
    text = data.decode("utf-8-sig", errors="replace")
    sample = text[:2048]
    try:
        dialect = csv.Sniffer().sniff(sample)
    except csv.Error:
        dialect = csv.excel
    reader = csv.DictReader(io.StringIO(text), dialect=dialect)
    rows = []
    for row in reader:
        cleaned = {str(k or "").strip(): str(v or "").strip() for k, v in row.items() if str(k or "").strip()}
        if any(cleaned.values()):
            rows.append(cleaned)
    return {"name": filename, "type": "csv", "row_count": len(rows), "rows": rows[:800]}


def excel_column_index(cell_ref):
    letters = "".join(ch for ch in cell_ref if ch.isalpha())
    index = 0
    for char in letters:
        index = index * 26 + (ord(char.upper()) - ord("A") + 1)
    return index - 1


def parse_xlsx_file(filename, data):
    ns = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        shared_strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in root.findall("main:si", ns):
                shared_strings.append("".join(t.text or "" for t in item.findall(".//main:t", ns)))

        sheet_names = [name for name in archive.namelist() if name.startswith("xl/worksheets/sheet") and name.endswith(".xml")]
        if not sheet_names:
            return {"name": filename, "type": "xlsx", "row_count": 0, "rows": []}

        sheet = ET.fromstring(archive.read(sheet_names[0]))
        grid = []
        for row in sheet.findall(".//main:sheetData/main:row", ns):
            values = []
            for cell in row.findall("main:c", ns):
                cell_ref = cell.attrib.get("r", "")
                col_index = excel_column_index(cell_ref) if cell_ref else len(values)
                while len(values) <= col_index:
                    values.append("")
                value_node = cell.find("main:v", ns)
                inline_node = cell.find("main:is/main:t", ns)
                value = ""
                if inline_node is not None:
                    value = inline_node.text or ""
                elif value_node is not None:
                    value = value_node.text or ""
                    if cell.attrib.get("t") == "s" and value.isdigit():
                        value = shared_strings[int(value)] if int(value) < len(shared_strings) else value
                values[col_index] = str(value).strip()
            if any(values):
                grid.append(values)

    if not grid:
        return {"name": filename, "type": "xlsx", "row_count": 0, "rows": []}
    headers = [header or f"Column {index + 1}" for index, header in enumerate(grid[0])]
    rows = []
    for raw in grid[1:]:
        row = {}
        for index, header in enumerate(headers):
            row[header] = raw[index] if index < len(raw) else ""
        if any(row.values()):
            rows.append(row)
    return {"name": filename, "type": "xlsx", "row_count": len(rows), "rows": rows[:800]}


def parse_uploaded_datasets(files, log):
    datasets = []
    errors = []
    for field in files:
        filename = field.filename or "uploaded-file"
        data = field.file.read()
        lower = filename.lower()
        try:
            if lower.endswith(".csv"):
                parsed = parse_csv_file(filename, data)
                datasets.append(parsed)
                activity(
                    log,
                    "Uploaded dataset parsed",
                    filename,
                    type=parsed["type"],
                    rows=parsed["row_count"],
                    rows_sent_to_model=len(parsed["rows"]),
                )
            elif lower.endswith(".xlsx"):
                parsed = parse_xlsx_file(filename, data)
                datasets.append(parsed)
                activity(
                    log,
                    "Uploaded dataset parsed",
                    filename,
                    type=parsed["type"],
                    rows=parsed["row_count"],
                    rows_sent_to_model=len(parsed["rows"]),
                )
            else:
                errors.append({"name": filename, "error": "Only .csv and .xlsx uploads are supported in this build."})
                activity(log, "Uploaded dataset skipped", filename, reason="Unsupported file type")
        except Exception as exc:
            errors.append({"name": filename, "error": str(exc)})
            activity(log, "Uploaded dataset parse failed", filename, error=str(exc))
    return datasets, errors


def parse_pull_request(handler, log):
    content_type = handler.headers.get("Content-Type", "")
    activity(log, "Backend request received", "Received Run pull request.", content_type=content_type.split(";")[0])
    if content_type.startswith("multipart/form-data"):
        form = cgi.FieldStorage(
            fp=handler.rfile,
            headers=handler.headers,
            environ={"REQUEST_METHOD": "POST", "CONTENT_TYPE": content_type},
        )
        prompt = form.getfirst("prompt", "")
        scope = json.loads(form.getfirst("scope", "{}"))
        dataset_fields = form["datasets"] if "datasets" in form else []
        if not isinstance(dataset_fields, list):
            dataset_fields = [dataset_fields]
        datasets, errors = parse_uploaded_datasets(dataset_fields, log)
        scope["uploadedDatasets"] = [
            {"name": item["name"], "type": item["type"], "row_count": item["row_count"]}
            for item in datasets
        ]
        scope["uploadedDatasetErrors"] = errors
        scope["uploadedDatasetRows"] = [
            {"dataset": item["name"], "type": item["type"], "row_count": item["row_count"], "rows": item["rows"]}
            for item in datasets
        ]
        activity(
            log,
            "Candidate input prepared",
            "Uploaded database exports will be treated as candidate leads requiring source verification.",
            datasets=len(datasets),
            dataset_errors=len(errors),
            parsed_rows=sum(item["row_count"] for item in datasets),
        )
        return prompt, scope

    length = int(handler.headers.get("Content-Length", "0"))
    payload = json.loads(handler.rfile.read(length).decode("utf-8"))
    activity(log, "Candidate input prepared", "No uploaded datasets in this request.", datasets=0, parsed_rows=0)
    return payload.get("prompt", ""), payload.get("scope", {})


class Handler(SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        if self.path != "/api/pull":
            json_response(self, 404, {"ok": False, "error": "Unknown endpoint."})
            return

        log = []
        request_id = uuid.uuid4().hex[:10]
        try:
            activity(log, "Backend request started", "Handling Run pull request.", request_id=request_id)
            prompt, scope = parse_pull_request(self, log)
            result = call_openai(prompt, scope, log)
            activity(log, "Backend request completed", "Returning live comps result to browser.")
            json_response(self, 200, {"ok": True, "run": result})
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            activity(log, "OpenAI request failed", "OpenAI returned an HTTP error.", status=exc.code)
            json_response(self, exc.code, {"ok": False, "error": body, "activity_log": log})
        except urllib.error.URLError as exc:
            activity(log, "OpenAI network request failed", "The backend could not reach OpenAI after retries.", error=str(exc))
            json_response(
                self,
                502,
                {
                    "ok": False,
                    "error": (
                        "The local backend is running, but its outbound connection to OpenAI failed after retries. "
                        "This is usually a network, proxy, VPN, firewall, or transient OpenAI connectivity issue."
                    ),
                    "activity_log": log,
                },
            )
        except (TimeoutError, socket.timeout):
            activity(log, "OpenAI request timed out", "The Responses API call exceeded the backend timeout.")
            json_response(
                self,
                504,
                {
                    "ok": False,
                    "error": (
                        "The live web-search request timed out before results came back. "
                        "The backend is running and authenticated, but this screen is broad enough "
                        "that it needs a longer-running research job."
                    ),
                    "activity_log": log,
                },
            )
        except Exception as exc:
            activity(log, "Backend request failed", "Unhandled backend error.", error=str(exc))
            json_response(self, 500, {"ok": False, "error": str(exc), "activity_log": log})


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    display_host = "127.0.0.1" if HOST in ("0.0.0.0", "::") else HOST
    print(f"Comps Launcher live backend running at http://{display_host}:{PORT}/index.html")
    server.serve_forever()
