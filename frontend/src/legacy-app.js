const optionSets = {
  modality: ["Small molecule", "mAb", "ADC", "Bispecific antibody", "Cell therapy", "Radiopharmaceutical", "RNA therapeutic"],
  dealType: ["Licensing", "M&A", "Option", "Co-development", "Asset acquisition"],
  stage: ["Preclinical", "Phase 1", "Phase 2", "Phase 3", "Approved"],
  geography: ["Global", "US", "China", "Ex-US", "Europe", "Japan", "Asia Pacific"]
};

const selected = {
  modality: [],
  dealType: [],
  stage: [],
  geography: []
};

const SEARCH_POLICY = {
  acquisitionStatus: "announced acquisitions included",
  dateBasis: "announcement date",
  platformAcquisitions: "include ADC platform/company acquisitions",
  adjacentConjugates: "strip adjacent conjugates such as DAC, AOC, radioconjugates unless explicitly selected"
};

const sampleDeals = [
  {
    id: "real-adc-gilead-tubulis-2026",
    deal: "Gilead / Tubulis",
    asset: "TUB-040; TUB-030; Tubutecan ADC platform",
    target: "NaPi2b; 5T4",
    indication: "Ovarian cancer, NSCLC, other solid tumors",
    tumorCategory: "solid",
    modality: "ADC",
    stage: "Phase 1/2",
    geography: "Global",
    type: "M&A",
    upfront: 3150,
    biobucks: 5000,
    royalty: "N/A",
    date: "2026-04-07",
    status: "Announced",
    source: "Gilead press release",
    sourceUrl: "https://www.gilead.com/news/news-details/2026/gilead-to-acquire-tubulis-adding-potentially-best-in-class-antibody-drug-conjugate-and-next-generation-platform-to-further-strengthen-oncology-pipeline",
    flag: "OK",
    confidence: 94,
    note: "Announced acquisition of ADC company/platform; includes TUB-040 for ovarian cancer and other solid tumors."
  },
  {
    id: "real-adc-genmab-profoundbio-2024",
    deal: "Genmab / ProfoundBio",
    asset: "Rina-S; ADC pipeline and platform",
    target: "FR-alpha and ADC platform assets",
    indication: "Ovarian cancer, endometrial cancer, other solid tumors",
    tumorCategory: "solid",
    modality: "ADC",
    stage: "Phase 2",
    geography: "Global",
    type: "M&A",
    upfront: 1800,
    biobucks: 1800,
    royalty: "N/A",
    date: "2024-04-03",
    status: "Announced",
    source: "Genmab press release",
    sourceUrl: "https://ir.genmab.com/news-releases/news-release-details/genmab-broaden-and-strengthen-oncology-portfolio-acquisition/",
    flag: "OK",
    confidence: 93,
    note: "Announced acquisition of clinical-stage ADC company and ADC technology platform."
  },
  {
    id: "real-adc-jj-ambrx-2024",
    deal: "Johnson & Johnson / Ambrx",
    asset: "ARX517; ARX788; synthetic biology ADC platform",
    target: "PSMA; HER2; ADC platform",
    indication: "Prostate cancer, breast cancer, other solid tumors",
    tumorCategory: "solid",
    modality: "ADC",
    stage: "Phase 1/2",
    geography: "Global",
    type: "M&A",
    upfront: 2000,
    biobucks: 2000,
    royalty: "N/A",
    date: "2024-01-08",
    status: "Announced",
    source: "Johnson & Johnson press release",
    sourceUrl: "https://www.jnj.com/media-center/press-releases/johnson-johnson-to-acquire-ambrx-advancing-next-generation-antibody-drug-conjugates-to-transform-the-treatment-of-cancer",
    flag: "OK",
    confidence: 93,
    note: "Announced all-cash acquisition of clinical-stage ADC company."
  },
  {
    id: "real-adc-abbvie-immunogen-2023",
    deal: "AbbVie / ImmunoGen",
    asset: "ELAHERE; IMGN-151; ADC pipeline",
    target: "FR-alpha and ADC platform assets",
    indication: "Ovarian cancer and solid tumor portfolio",
    tumorCategory: "solid",
    modality: "ADC",
    stage: "Approved",
    geography: "Global",
    type: "M&A",
    upfront: 10100,
    biobucks: 10100,
    royalty: "N/A",
    date: "2023-11-30",
    status: "Announced",
    source: "AbbVie press release and 8-K materials",
    sourceUrl: "https://investors.abbvie.com/news-releases/news-release-details/abbvie-acquire-immunogen-including-its-flagship-cancer-therapy",
    flag: "OK",
    confidence: 94,
    note: "Announced acquisition centered on ELAHERE, an approved ADC for ovarian cancer, plus ADC pipeline assets."
  },
  {
    id: "real-adc-pfizer-seagen-2023",
    deal: "Pfizer / Seagen",
    asset: "Seagen ADC portfolio and platform",
    target: "Multiple ADC targets",
    indication: "Solid tumors and hematologic malignancies",
    tumorCategory: "mixed",
    modality: "ADC",
    stage: "Approved",
    geography: "Global",
    type: "M&A",
    upfront: 43000,
    biobucks: 43000,
    royalty: "N/A",
    date: "2023-03-13",
    status: "Announced",
    source: "Pfizer press release",
    sourceUrl: "https://www.pfizer.com/news/press-release/press-release-detail/pfizer-invests-43-billion-battle-cancer",
    flag: "OK",
    confidence: 95,
    note: "Announced acquisition of ADC leader Seagen; includes approved and pipeline ADC assets."
  },
  {
    id: "real-adc-merck-velosbio-2020",
    deal: "Merck / VelosBio",
    asset: "VLS-101 and ADC pipeline",
    target: "ROR1",
    indication: "Solid tumors and hematologic malignancies",
    tumorCategory: "mixed",
    modality: "ADC",
    stage: "Phase 1/2",
    geography: "Global",
    type: "M&A",
    upfront: 2750,
    biobucks: 2750,
    royalty: "N/A",
    date: "2020-11-05",
    status: "Announced",
    source: "Merck press release",
    sourceUrl: "https://www.merck.com/news/merck-to-acquire-velosbio/",
    flag: "OK",
    confidence: 90,
    note: "Announced acquisition of ADC company; may fall outside a last-5-years window depending current date."
  },
  {
    id: "real-adjacent-jj-firefly-2026",
    deal: "Johnson & Johnson / Firefly Bio",
    asset: "Firelink DAC platform",
    target: "KRAS and degrader antibody conjugate platform",
    indication: "Solid tumors",
    tumorCategory: "solid",
    modality: "DAC",
    adjacentTo: "ADC",
    stage: "Preclinical",
    geography: "Global",
    type: "M&A",
    upfront: 1000,
    biobucks: 1000,
    royalty: "N/A",
    date: "2026-06-08",
    status: "Announced",
    source: "Johnson & Johnson press release",
    sourceUrl: "https://www.jnj.com/media-center/press-releases/johnson-johnson-to-acquire-firefly-bio-inc-to-expand-oncology-pipeline-with-novel-degrader-antibody-conjugate-platform",
    flag: "STRIP",
    confidence: 88,
    structure: "adjacent conjugate - not ADC",
    note: "DAC is adjacent to ADC but should be stripped from an ADC search under the global policy."
  },
  {
    id: "d1",
    deal: "AlphaBio / NovaOnc",
    asset: "AB-214",
    target: "HER2",
    indication: "Breast cancer",
    modality: "ADC",
    stage: "Phase 2",
    geography: "Global",
    type: "Licensing",
    upfront: 180,
    biobucks: 1450,
    royalty: "Tiered low teens",
    date: "2025-05-14",
    source: "Licensor and licensee press releases",
    flag: "OK",
    confidence: 94,
    note: "Primary-source economics match across company releases."
  },
  {
    id: "d2",
    deal: "KinaseRx / Meridian Bio",
    asset: "KRX-771",
    target: "BTK",
    indication: "DLBCL",
    modality: "Small molecule",
    stage: "Phase 3",
    geography: "US",
    type: "M&A",
    upfront: 720,
    biobucks: 2600,
    royalty: "N/A",
    date: "2024-02-09",
    source: "8-K and merger proxy",
    flag: "REVIEW",
    confidence: 82,
    note: "CVR economics require manual separation from upfront equity consideration."
  },
  {
    id: "d3",
    deal: "OrionTx / Zenith Pharma",
    asset: "OTX-502",
    target: "CD3",
    indication: "Solid tumors",
    modality: "Bispecific antibody",
    stage: "Phase 2",
    geography: "Global",
    type: "Co-development",
    upfront: 125,
    biobucks: 1100,
    royalty: "Profit share",
    date: "2022-06-23",
    source: "Investor presentation",
    flag: "WATCH",
    confidence: 76,
    structure: "co-dev/co-commercialization",
    note: "Economics are cost-share/profit-share rather than clean license economics."
  },
  {
    id: "d4",
    deal: "RadiantBio / Arcadia",
    asset: "RB-617",
    target: "PSMA",
    indication: "Prostate cancer",
    modality: "Radiopharmaceutical",
    stage: "Phase 1",
    geography: "Europe",
    type: "Licensing",
    upfront: 45,
    biobucks: 700,
    royalty: "Mid single digit",
    date: "2024-03-06",
    source: "Press release",
    flag: "WATCH",
    confidence: 79,
    note: "Valid directional comp, but earlier stage than default scope."
  },
  {
    id: "d5",
    deal: "NovaCell / Helix Oncology",
    asset: "NC-19",
    target: "CD19",
    indication: "DLBCL",
    modality: "Cell therapy",
    stage: "Phase 1",
    geography: "US",
    type: "Option",
    upfront: 65,
    biobucks: 850,
    royalty: "High single digit",
    date: "2023-09-18",
    source: "Press release",
    flag: "REVIEW",
    confidence: 72,
    structure: "unexercised options",
    note: "Option economics should be stripped unless option deals are explicitly in scope."
  },
  {
    id: "d6",
    deal: "TangoImmune / Northstar",
    asset: "TI-302",
    target: "PD-1",
    indication: "NSCLC",
    modality: "mAb",
    stage: "Approved",
    geography: "China",
    type: "Licensing",
    upfront: 310,
    biobucks: 1200,
    royalty: "Low double digit",
    date: "2021-11-11",
    source: "Press release and annual report",
    flag: "OK",
    confidence: 90,
    note: "Clean regional commercial licensing precedent."
  },
  {
    id: "d7",
    deal: "HarborOnc / Cobalt Therapeutics",
    asset: "HB-901",
    target: "TROP2",
    indication: "NSCLC",
    modality: "ADC",
    stage: "Phase 3",
    geography: "Ex-US",
    type: "Licensing",
    upfront: 250,
    biobucks: 2200,
    royalty: "Tiered low-to-mid teens",
    date: "2024-08-19",
    source: "Licensee press release and Form 8-K",
    flag: "OK",
    confidence: 91,
    note: "Clean late-stage ADC licensing precedent with disclosed upfront and milestone package."
  },
  {
    id: "d8",
    deal: "OncoVector / Lumen Bio",
    asset: "OV-338",
    target: "Claudin 18.2",
    indication: "Gastric cancer",
    modality: "Bispecific antibody",
    stage: "Phase 2",
    geography: "Global",
    type: "Licensing",
    upfront: 95,
    biobucks: 980,
    royalty: "Tiered high single digit to low teens",
    date: "2023-12-04",
    source: "Joint press release",
    flag: "REVIEW",
    confidence: 84,
    note: "Economics are disclosed, but territory language requires confirmation against source exhibits."
  }
];

let mode = "web";
let currentRun = null;
let promptText = "";
const historyKey = "beone-comps-launcher-history-v1";
const LIVE_BACKEND_TIMEOUT_MS = 45 * 60 * 1000;
const PULL_POLL_INTERVAL_MS = 5000;
let runTimer = null;
let runStartedAt = null;
let authMode = "login";
let authState = { user: null, workspaces: [], activeWorkspaceId: null };
let activeEventSource = null;
let serverHistory = [];

document.body.classList.add("auth-pending");

const currency = (value) => `$${Number(value || 0).toLocaleString()}M`;

const standardCompHeaders = ["Flag", "Deal", "Asset", "Modality", "Stage", "Territory", "Upfront", "Biobucks", "Primary source"];

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function clearCurrentRun() {
  currentRun = null;
  stopRunTimer(false);
  document.getElementById("metricFound").textContent = "0";
  document.getElementById("metricClean").textContent = "0";
  document.getElementById("metricStripped").textContent = "0";
  document.getElementById("metricConfidence").textContent = "-";
  document.getElementById("summaryOutput").textContent = "Run a pull to generate the summary.";
  document.getElementById("compHeaderRow").innerHTML = standardCompHeaders.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  document.getElementById("compRows").innerHTML = `<tr><td colspan="9"><strong>No run loaded.</strong><br><small>Run a pull or open a completed run from history.</small></td></tr>`;
  document.getElementById("strippedRows").innerHTML = `<tr><td colspan="4"><strong>No run loaded.</strong></td></tr>`;
  document.getElementById("refinementThread").innerHTML = `<article><strong>Ready</strong><span>Open a completed run, then ask for a change.</span></article>`;
  document.getElementById("refinementInput").value = "";
  document.getElementById("augmentationInstruction").value = "";
  const augmentationFiles = document.getElementById("augmentationFiles");
  if (augmentationFiles) augmentationFiles.value = "";
  renderAugmentationUploadList();
  document.getElementById("progressLog").innerHTML = "";
  document.getElementById("progressFill").style.width = "0%";
  document.getElementById("runBadge").textContent = "Idle";
  document.getElementById("runStatus").textContent = "No run started.";
}

function activeWorkspace() {
  return authState.workspaces.find((workspace) => workspace.id === authState.activeWorkspaceId) || authState.workspaces[0] || null;
}

function setAuthUi(authenticated) {
  document.body.classList.toggle("authenticated", authenticated);
  document.body.classList.toggle("auth-pending", !authenticated);
  document.getElementById("activeUser").textContent = authenticated ? authState.user.email : "Not signed in";
  document.getElementById("activeWorkspace").textContent = authenticated ? (activeWorkspace()?.name || "Personal workspace") : "No workspace";
}

function setAuthMode(nextMode) {
  authMode = nextMode;
  const signup = authMode === "signup";
  document.getElementById("authSubmit").textContent = signup ? "Create account" : "Sign in";
  document.getElementById("toggleAuthMode").textContent = signup ? "Use existing account" : "Create account";
  document.getElementById("displayNameLabel").hidden = !signup;
  document.getElementById("authPassword").autocomplete = signup ? "new-password" : "current-password";
  document.getElementById("authError").textContent = "";
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, { credentials: "include", ...options });
  if (response.status === 401) {
    authState = { user: null, workspaces: [], activeWorkspaceId: null };
    serverHistory = [];
    clearCurrentRun();
    setAuthUi(false);
  }
  return response;
}

async function initializeAuth() {
  try {
    const payload = await fetchJson("/api/auth/me");
    authState = {
      user: payload.user,
      workspaces: payload.workspaces || [],
      activeWorkspaceId: payload.active_workspace_id
    };
    setAuthUi(true);
    await renderHistory();
  } catch {
    setAuthUi(false);
  }
}

async function submitAuth(event) {
  event.preventDefault();
  const authError = document.getElementById("authError");
  authError.textContent = "";
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const displayName = document.getElementById("authDisplayName").value.trim();
  try {
    const payload = await fetchJson(authMode === "signup" ? "/api/auth/signup" : "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, display_name: displayName || undefined })
    });
    authState = {
      user: payload.user,
      workspaces: payload.workspaces || [],
      activeWorkspaceId: payload.active_workspace_id
    };
    serverHistory = [];
    clearCurrentRun();
    setAuthUi(true);
    await renderHistory();
    showToast(authMode === "signup" ? "Account created." : "Signed in.");
  } catch (error) {
    authError.textContent = error.message || "Sign in failed.";
  }
}

async function logout() {
  if (activeEventSource) {
    activeEventSource.close();
    activeEventSource = null;
  }
  await fetchJson("/api/auth/logout", { method: "POST" }).catch(() => null);
  authState = { user: null, workspaces: [], activeWorkspaceId: null };
  serverHistory = [];
  clearCurrentRun();
  setAuthUi(false);
  showToast("Signed out.");
}

function showView(viewId) {
  const navItems = [...document.querySelectorAll(".nav-item")];
  const views = [...document.querySelectorAll(".view")];
  const steps = [...document.querySelectorAll(".stepper li")];
  const activeIndex = navItems.findIndex((item) => item.dataset.view === viewId);
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
  views.forEach((view) => view.classList.toggle("active", view.id === viewId));
  steps.forEach((step, index) => step.classList.toggle("active", index === activeIndex));
}

function formatElapsed(totalSeconds) {
  if (totalSeconds < 60) return `${totalSeconds} second${totalSeconds === 1 ? "" : "s"}`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function updateRunElapsed() {
  const elapsed = document.getElementById("runElapsed");
  if (!elapsed || !runStartedAt) return;
  elapsed.textContent = formatElapsed(Math.floor((Date.now() - runStartedAt) / 1000));
}

function startRunTimer() {
  stopRunTimer(false);
  runStartedAt = Date.now();
  updateRunElapsed();
  runTimer = setInterval(updateRunElapsed, 1000);
}

function stopRunTimer(keepFinal = true) {
  if (runTimer) {
    clearInterval(runTimer);
    runTimer = null;
  }
  if (!keepFinal) {
    runStartedAt = null;
    const elapsed = document.getElementById("runElapsed");
    if (elapsed) elapsed.textContent = "0 seconds";
  } else {
    updateRunElapsed();
  }
}

function renderCombo(field) {
  const chips = document.getElementById(`${field}Chips`);
  const suggestions = document.getElementById(`${field}Suggestions`);
  const chosen = selected[field].map((item) => item.value.toLowerCase());

  chips.innerHTML = selected[field].map((item) => `
    <span class="chip ${item.custom ? "custom" : ""}">
      ${escapeHtml(item.value)}${item.custom ? " - Custom" : ""}
      <button type="button" data-remove="${field}:${escapeHtml(item.value)}" aria-label="Remove ${escapeHtml(item.value)}">x</button>
    </span>
  `).join("");

  suggestions.innerHTML = optionSets[field]
    .filter((option) => !chosen.includes(option.toLowerCase()))
    .slice(0, 6)
    .map((option) => `<button type="button" data-add="${field}:${escapeHtml(option)}">${escapeHtml(option)}</button>`)
    .join("");

  updateFilterCount();
}

function addCriterion(field, rawValue) {
  const value = rawValue.trim();
  if (!value) return;
  if (selected[field].some((item) => item.value.toLowerCase() === value.toLowerCase())) return;
  const custom = !optionSets[field].some((option) => option.toLowerCase() === value.toLowerCase());
  selected[field].push({ value, custom });
  document.getElementById(`${field}Input`).value = "";
  renderCombo(field);
}

function removeCriterion(field, value) {
  selected[field] = selected[field].filter((item) => item.value !== value);
  renderCombo(field);
}

function selectedValues(field) {
  return selected[field].map((item) => item.value);
}

function getScope() {
  return {
    tumorType: document.getElementById("tumorType").value.trim(),
    targetMoa: document.getElementById("targetMoa").value.trim(),
    modality: selectedValues("modality"),
    dealType: selectedValues("dealType"),
    stage: selectedValues("stage"),
    geography: selectedValues("geography"),
    dateRange: document.getElementById("dateRange").value,
    startDate: document.getElementById("startDate").value,
    endDate: document.getElementById("endDate").value,
    minUpfront: Number(document.getElementById("minUpfront").value || 0),
    minBiobucks: Number(document.getElementById("minBiobucks").value || 0),
    structuralFilters: [...document.querySelectorAll("#structuralFilters input:checked")].map((input) => input.value),
    candidateMode: mode,
    pullMode: document.getElementById("pullMode")?.value || "standard",
    candidateInput: document.getElementById("candidateInput").value.trim(),
    uploadedFiles: [],
    outputs: {
      excel: document.getElementById("wantExcel").checked,
      summary: document.getElementById("wantSummary").checked,
      benchmark: document.getElementById("wantBenchmark").checked,
      targetDeal: document.getElementById("targetDeal").value.trim()
    }
  };
}

function buildPrompt() {
  const scope = getScope();
  const lines = [
    "Run the oncology-comps-puller protocol for BeOne Medicines BD / M&A.",
    "",
    "Scope:",
    `- Therapeutic area / tumor type: ${scope.tumorType || "No constraint"}`,
    `- Target / MOA: ${scope.targetMoa || "No constraint"}`,
    `- Modality: ${scope.modality.length ? scope.modality.join(", ") : "No constraint"}`,
    `- Deal type: ${scope.dealType.length ? scope.dealType.join(", ") : "No constraint"}`,
    `- Date range: ${scope.dateRange}${scope.dateRange === "Custom range" ? ` (${scope.startDate || "open"} to ${scope.endDate || "today"})` : ""}`,
    `- Stage: ${scope.stage.length ? scope.stage.join(", ") : "No constraint"}`,
    `- Geography: ${scope.geography.length ? scope.geography.join(", ") : "No constraint"}`,
    `- Minimum upfront: ${scope.minUpfront ? currency(scope.minUpfront) : "No minimum"}`,
    `- Minimum biobucks: ${scope.minBiobucks ? currency(scope.minBiobucks) : "No minimum"}`,
    "",
    "Structural stripping rules:",
    scope.structuralFilters.length ? scope.structuralFilters.map((item) => `- Strip ${item}`).join("\n") : "- No structural stripping requested",
    "",
    "Candidate list mode:",
    `- ${scope.candidateMode}`,
    scope.candidateInput ? `- Candidate input:\n${scope.candidateInput}` : "- No provided candidates; discover from public sources.",
    "- Proprietary/database exports are intentionally excluded from the first pull and can be merged from the Results page after web discovery.",
    "",
    "Output requirements:",
    `- Excel workbook: ${scope.outputs.excel ? "yes" : "no"}`,
    `- Written summary: ${scope.outputs.summary ? "yes" : "no"}`,
    `- Benchmark against target: ${scope.outputs.benchmark ? "yes" : "no"}`,
    scope.outputs.targetDeal ? `- Target deal:\n${scope.outputs.targetDeal}` : "",
    "",
    "Verification methodology:",
    "- Prefer licensor PR, licensee PR, 8-K, 10-K, proxy, or equivalent primary sources.",
    "- Do not conflate upfront and total consideration.",
    "- Check territory carve-outs, stage overstatement, asset identity, co-dev disguised as licensing, and option status.",
    "- Return Comps, Stripped Deals audit, and Methodology sheets.",
    "- Preserve confidence flags: OK, REVIEW, WATCH."
  ];
  promptText = lines.filter(Boolean).join("\n");
  document.getElementById("promptPreview").textContent = promptText;
  return promptText;
}

function runLocalProtocol() {
  const scope = getScope();
  const candidates = expandCandidateInput(scope).concat(sampleDeals);
  const unique = dedupe(candidates).filter((deal) => deal.id.startsWith("real-") || deal.id.startsWith("user-"));
  const adjacentStripped = unique
    .filter((deal) => shouldStripAdjacent(deal, scope))
    .map((deal) => ({
      deal: deal.deal,
      reason: deal.structure || "adjacent conjugate - not requested modality",
      source: deal.source,
      note: deal.note
    }));
  let filtered = unique.filter((deal) => !shouldStripAdjacent(deal, scope)).filter((deal) => matchesScope(deal, scope));
  let fallbackUsed = false;
  let expansionUsed = false;
  let fallbackNote = "";

  if (!filtered.length) {
    fallbackUsed = true;
    filtered = buildNearMatches(unique, scope);
    fallbackNote = "No strict matches passed every filter, so the prototype returned directional WATCH comps ranked by closest fit. In production, this would appear as a partial-result warning rather than a silent empty table.";
  }

  const stripped = [...adjacentStripped];
  const comps = [];

  filtered.forEach((deal) => {
    if (deal.structure && scope.structuralFilters.includes(deal.structure)) {
      stripped.push({
        deal: deal.deal,
        reason: deal.structure,
        source: deal.source,
        note: deal.note
      });
    } else {
      comps.push({
        ...deal,
        flag: fallbackUsed && deal.flag === "OK" ? "WATCH" : deal.flag,
        note: fallbackUsed ? `${deal.note} Directional fallback: strict screen found no exact matches.` : deal.note,
        score: scoreDeal(deal, scope)
      });
    }
  });

  if (comps.length > 0 && comps.length < 5) {
    expansionUsed = true;
    const existingIds = new Set(comps.map((deal) => deal.id));
    const directional = buildNearMatches(unique, scope)
      .filter((deal) => !existingIds.has(deal.id))
      .filter((deal) => !(deal.structure && scope.structuralFilters.includes(deal.structure)))
      .map((deal) => ({
        ...deal,
        flag: "WATCH",
        note: `${deal.note} Directional expansion: included to provide a usable comp set beyond exact matches.`,
        score: scoreDeal(deal, scope)
      }));
    comps.push(...directional);
    fallbackNote = "Exact matches were limited, so the prototype added directional WATCH comps to create a usable comparison set. Production should expose these as adjacent comps, not silently mix them with exact matches.";
  }

  comps.sort((a, b) => b.score - a.score);
  return {
    id: `RUN-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`,
    createdAt: new Date().toISOString(),
    prompt: promptText || buildPrompt(),
    scope,
    comps,
    stripped,
    fallbackUsed,
    expansionUsed,
    fallbackNote,
    methodology: [
      "Prototype uses local sample public-source-style deals.",
      "Production mode should call a server-side OpenAI Responses/Agents workflow with web search, source fetch, code execution, and file storage.",
      "Primary-source verification, structural stripping, and confidence flags are represented here for UX validation."
    ]
  };
}

function buildNearMatches(deals, scope) {
  return deals
    .map((deal) => ({ ...deal, score: scoreDeal(deal, scope), nearMatch: true }))
    .filter((deal) => dateInRange(deal.date, scope) || scope.dateRange === "Custom range")
    .filter((deal) => deal.upfront >= Math.min(scope.minUpfront, 250))
    .filter((deal) => deal.biobucks >= Math.min(scope.minBiobucks, 1000))
    .sort((a, b) => b.score - a.score);
}

function matchesScope(deal, scope) {
  const text = `${deal.deal} ${deal.asset} ${deal.target} ${deal.indication} ${deal.modality} ${deal.stage} ${deal.geography} ${deal.type}`.toLowerCase();
  const inList = (values, value, field) => {
    const meaningful = values.filter((item) => !isNoConstraint(item));
    if (!meaningful.length) return true;
    return meaningful.some((item) => {
      const normalized = item.toLowerCase();
      if (field === "dealType" && normalized === "m&a") return ["m&a", "acquisition"].includes(value.toLowerCase());
      if (field === "modality" && normalized === "adc") return value.toLowerCase() === "adc";
      return value.toLowerCase().includes(normalized) || normalized.includes(value.toLowerCase());
    });
  };
  if (!isNoConstraint(scope.tumorType)) {
    const tumor = scope.tumorType.toLowerCase();
    if (tumor.includes("solid") && !["solid", "mixed"].includes(deal.tumorCategory || "")) return false;
    if (!tumor.includes("solid") && !text.includes(tumor) && !["oncology", "cancer"].includes(tumor)) return false;
  }
  if (!isNoConstraint(scope.targetMoa) && !text.includes(scope.targetMoa.toLowerCase())) return false;
  if (!inList(scope.modality, deal.modality)) return false;
  if (!inList(scope.dealType, deal.type, "dealType")) return false;
  if (!inList(scope.stage, deal.stage)) return false;
  if (!inList(scope.geography, deal.geography)) return false;
  if (deal.upfront < scope.minUpfront) return false;
  if (deal.biobucks < scope.minBiobucks) return false;
  if (!dateInRange(deal.date, scope)) return false;
  return true;
}

function shouldStripAdjacent(deal, scope) {
  const requested = scope.modality.map((item) => item.toLowerCase()).filter((item) => !isNoConstraint(item));
  if (!requested.length) return false;
  return requested.includes("adc") && deal.adjacentTo === "ADC" && deal.modality !== "ADC";
}

function isNoConstraint(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return !normalized || ["all", "any", "no constraint", "all solid tumors", "all oncology", "oncology"].includes(normalized);
}

function dateInRange(dateString, scope) {
  const date = new Date(dateString);
  const now = new Date();
  let start = new Date("1900-01-01");
  let end = now;
  if (scope.dateRange === "2023-present") start = new Date("2023-01-01");
  if (scope.dateRange === "Last 3 years") start = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
  if (scope.dateRange === "Last 5 years") start = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
  if (scope.dateRange === "Last 10 years") start = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
  if (scope.dateRange === "Custom range") {
    start = new Date(scope.startDate || "1900-01-01");
    end = new Date(scope.endDate || now.toISOString().slice(0, 10));
  }
  return date >= start && date <= end;
}

function scoreDeal(deal, scope) {
  let score = 45;
  if (!isNoConstraint(scope.targetMoa) && `${deal.target} ${deal.asset}`.toLowerCase().includes(scope.targetMoa.toLowerCase())) score += 15;
  if (scope.modality.some((item) => deal.modality.toLowerCase().includes(item.toLowerCase()))) score += 15;
  if (scope.stage.some((item) => deal.stage.toLowerCase().includes(item.toLowerCase()))) score += 10;
  if (scope.geography.some((item) => deal.geography.toLowerCase().includes(item.toLowerCase()))) score += 5;
  score += Math.min(10, Math.round(deal.confidence / 10));
  return Math.min(99, score);
}

function expandCandidateInput(scope) {
  if (!scope.candidateInput) return [];
  return scope.candidateInput.split(/\n+/).filter(Boolean).map((line, index) => ({
    id: `user-${index}`,
    deal: line.split("|")[0]?.trim() || `User candidate ${index + 1}`,
    asset: line.split("|")[1]?.trim() || "User-provided asset",
    target: scope.targetMoa || "TBD",
    indication: scope.tumorType || "Oncology",
    modality: scope.modality[0] || "Custom",
    stage: scope.stage[0] || "TBD",
    geography: scope.geography[0] || "Global",
    type: scope.dealType[0] || "Licensing",
    upfront: scope.minUpfront || 0,
    biobucks: scope.minBiobucks || 0,
    royalty: "TBD",
    date: new Date().toISOString().slice(0, 10),
    source: "User-provided candidate list",
    flag: "REVIEW",
    confidence: 55,
    note: "User-provided row needs primary-source verification."
  }));
}

function dedupe(deals) {
  const seen = new Set();
  return deals.filter((deal) => {
    const key = `${deal.deal}-${deal.asset}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatCell(value) {
  if (value === null || value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.map(formatCell).filter(Boolean).join("; ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function customColumnValue(deal, column) {
  return formatCell(deal.custom?.[column.key] ?? deal[column.key]);
}

function renderRun(run) {
  currentRun = run;
  const customColumns = run.customColumns || [];
  const totalCompColumns = standardCompHeaders.length + customColumns.length;
  document.getElementById("metricFound").textContent = run.comps.length + run.stripped.length;
  document.getElementById("metricClean").textContent = run.comps.length;
  document.getElementById("metricStripped").textContent = run.stripped.length;
  const confidence = run.comps.length ? Math.round(run.comps.reduce((sum, deal) => sum + deal.confidence, 0) / run.comps.length) : 0;
  document.getElementById("metricConfidence").textContent = confidence ? `${confidence}%` : "-";

  document.getElementById("summaryOutput").innerHTML = buildSummaryHtml(run);
  document.getElementById("compHeaderRow").innerHTML = [
    ...standardCompHeaders,
    ...customColumns.map((column) => column.label)
  ].map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const emptyCompMessage = run.fallbackNote
    ? `<strong>No comps returned.</strong><br><small>${escapeHtml(run.fallbackNote)}</small>`
    : `<strong>No clean comps found.</strong><br><small>Broaden scope or uncheck structural filters.</small>`;

  document.getElementById("compRows").innerHTML = run.comps.length ? run.comps.map((deal) => `
    <tr>
      <td>${flagChip(deal.flag)}</td>
      <td><strong>${escapeHtml(deal.deal)}</strong><br><small>${escapeHtml(deal.date)}</small></td>
      <td>${escapeHtml(deal.asset)}</td>
      <td>${escapeHtml(deal.modality)}</td>
      <td>${escapeHtml(deal.stage)}</td>
      <td>${escapeHtml(deal.geography)}</td>
      <td>${currency(deal.upfront)}</td>
      <td>${currency(deal.biobucks)}</td>
      <td>${sourceLink(deal)}</td>
      ${customColumns.map((column) => `<td>${escapeHtml(customColumnValue(deal, column))}</td>`).join("")}
    </tr>
  `).join("") : `<tr><td colspan="${totalCompColumns}">${emptyCompMessage}</td></tr>`;

  document.getElementById("strippedRows").innerHTML = run.stripped.length ? run.stripped.map((deal) => `
    <tr>
      <td><strong>${escapeHtml(deal.deal)}</strong></td>
      <td>${escapeHtml(deal.reason)}</td>
      <td>${sourceLink(deal)}</td>
      <td>${escapeHtml(deal.note)}</td>
    </tr>
  `).join("") : `<tr><td colspan="4"><strong>No stripped deals.</strong></td></tr>`;

  const refinementThread = document.getElementById("refinementThread");
  if (run.refinement) {
    refinementThread.innerHTML = `
      <article><strong>Latest refinement</strong><span>${escapeHtml(run.refinement.instruction || "Applied refinement.")}</span></article>
      ${run.refinementSummary ? `<article><strong>Change summary</strong><span>${escapeHtml(run.refinementSummary)}</span></article>` : ""}
    `;
  } else {
    refinementThread.innerHTML = `<article><strong>Ready</strong><span>Ask for columns, categories, grouping, or memo changes for this completed run.</span></article>`;
  }
}

function buildSummaryHtml(run) {
  const scope = run.scope;
  const median = (values) => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };
  const medianUpfront = median(run.comps.map((deal) => deal.upfront));
  const medianBio = median(run.comps.map((deal) => deal.biobucks));
  const liveSummary = run.summary ? `<p>${escapeHtml(run.summary)}</p>` : "";
  const datasetNote = run.uploadedDatasets?.length
    ? `<li>Uploaded candidate datasets included: <strong>${run.uploadedDatasets.length}</strong> file(s), ${run.uploadedDatasets.reduce((sum, file) => sum + Number(file.row_count || 0), 0).toLocaleString()} parsed rows.</li>`
    : "<li>No uploaded database exports were included in this run.</li>";
  return `
    <strong>${run.id}</strong><br>
    ${run.live ? "<span>Live web-search run. Rows are sourced from public web results and primary-source verification prompts.</span><br>" : ""}
    ${run.refinementSummary ? `<span>Latest refinement: ${escapeHtml(run.refinementSummary)}</span><br>` : ""}
    Scope: ${escapeHtml(scope.modality.join(", ") || "Any modality")} / ${escapeHtml(scope.stage.join(", ") || "Any stage")} / ${escapeHtml(scope.geography.join(", ") || "Any geography")}.<br><br>
    ${liveSummary}
    <ul>
      ${run.fallbackUsed || run.expansionUsed ? `<li><strong>WATCH:</strong> ${escapeHtml(run.fallbackNote)}</li>` : ""}
      <li><strong>${run.comps.length}</strong> clean comps passed structural filtering; <strong>${run.stripped.length}</strong> deals were stripped into the audit sheet.</li>
      ${datasetNote}
      <li>Activity log captured <strong>${(run.activityLog || []).length}</strong> backend event(s) for this run.</li>
      <li>Median upfront among clean comps: <strong>${currency(medianUpfront)}</strong>; median total consideration: <strong>${currency(medianBio)}</strong>.</li>
      <li>Highest-confidence comp: <strong>${escapeHtml(run.comps[0]?.deal || "None")}</strong>.</li>
      <li>${scope.outputs.benchmark ? "Benchmark mode requested; production should add target-vs-comp deltas." : "Benchmark mode not requested."}</li>
    </ul>
  `;
}

function flagChip(flag) {
  const normalized = ["OK", "REVIEW", "WATCH"].includes(flag) ? flag : "REVIEW";
  const klass = normalized === "OK" ? "ok" : normalized === "REVIEW" ? "review" : "watch";
  return `<span class="status-chip ${klass}">${normalized}</span>`;
}

function sourceLink(deal) {
  if (!deal.sourceUrl) return escapeHtml(deal.source);
  return `<a href="${escapeHtml(deal.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(deal.source)}</a>`;
}

async function runPull() {
  buildPrompt();
  showView("run");
  const runButton = document.getElementById("runPull");
  runButton.disabled = true;
  runButton.textContent = "Running...";
  startRunTimer();
  document.getElementById("runBadge").textContent = "Running";
  document.getElementById("runStatus").textContent = "Starting oncology comps pull.";
  document.getElementById("progressLog").innerHTML = "";
  document.getElementById("progressFill").style.width = "0%";

  const steps = [
    ["Building structured prompt", "Scope, filters, candidate mode, and output options locked.", 18],
    ["Searching live public web", "Server is using OpenAI web search; broad screens can take several minutes.", 36],
    ["Verifying primary sources", "Press releases, SEC filings, proxies, annual reports, and equivalent primary sources are preferred.", 55],
    ["Applying structural filters", "Announcement date, announced acquisitions, adjacent modality stripping, and requested strip rules are applied.", 73],
    ["Building outputs", "Comps, Stripped Deals audit, and Methodology sheets are prepared from the live result.", 90]
  ];

  try {
    for (const step of steps) {
      appendProgress(step[0], step[1]);
      document.getElementById("progressFill").style.width = `${step[2]}%`;
      document.getElementById("runStatus").textContent = step[0];
      await delay(250);
    }
    appendProgress("Waiting for live backend", "OpenAI web search is now running on the server. Broad screens may sit here for several minutes before results return.");
    document.getElementById("runStatus").textContent = "Waiting for live backend";
    document.getElementById("progressFill").style.width = "94%";
    const run = await callLiveBackend();
    appendProgress("Run complete", "Live web-search outputs are ready for review.", 100);
    document.getElementById("progressFill").style.width = "100%";
    renderRun(run);
    appendActivityLog(run.activityLog);
    saveRun(run);
    await renderHistory();
    document.getElementById("runBadge").textContent = "Complete";
    stopRunTimer(true);
    showView("results");
    showToast("Live comps pull complete.");
  } catch (error) {
    const run = buildErrorRun(error.message || "Live comps pull failed.", error.activityLog || []);
    appendProgress("Live pull failed", run.fallbackNote);
    document.getElementById("progressFill").style.width = "100%";
    renderRun(run);
    appendActivityLog(run.activityLog);
    document.getElementById("runBadge").textContent = "Needs backend";
    stopRunTimer(true);
    showView("results");
    showToast("Live web-search backend is not available.");
  } finally {
    runButton.disabled = false;
    runButton.textContent = "Run pull";
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callLiveBackend() {
  const workspace = activeWorkspace();
  if (!workspace) {
    throw new Error("Sign in and select a workspace before running a pull.");
  }
  const pullMode = document.getElementById("pullMode")?.value || "standard";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LIVE_BACKEND_TIMEOUT_MS);
  let startPayload;
  try {
    startPayload = await fetchJson(`/api/workspaces/${workspace.id}/pulls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptText || buildPrompt(), scope: getScope(), mode: pullMode, use_cache: true }),
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Live backend request timed out after 45 minutes. Narrow the scope or rerun later.");
    }
    throw error;
  }

  if (!startPayload.ok || !startPayload.run_id) {
    const error = new Error(startPayload.error || "Live web-search request failed to start.");
    error.activityLog = startPayload.activity_log || [];
    clearTimeout(timeout);
    throw error;
  }

  appendProgress("Backend job started", `Run ${startPayload.run_id} is running on the FastAPI backend. The browser will stream progress and poll as a fallback.`);
  document.getElementById("runStatus").textContent = `Backend job ${startPayload.run_id} running`;
  subscribeRunEvents(workspace.id, startPayload.run_id);

  try {
    return await pollBackendRun(workspace.id, startPayload.run_id, controller.signal);
  } finally {
    clearTimeout(timeout);
    if (activeEventSource) {
      activeEventSource.close();
      activeEventSource = null;
    }
  }
}

async function fetchJson(url, options = {}) {
  const response = await apiFetch(url, options);
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Live backend is not returning JSON. Check backend logs.");
  }
  if (!response.ok) {
    const detail = typeof payload?.detail === "string" ? payload.detail : payload?.detail?.error;
    const error = new Error(payload?.error || detail || "Live web-search request failed.");
    error.activityLog = payload?.activity_log || payload?.detail?.activity_log || [];
    throw error;
  }
  return payload;
}

function subscribeRunEvents(workspaceId, runId) {
  if (activeEventSource) {
    activeEventSource.close();
  }
  activeEventSource = new EventSource(`/api/workspaces/${workspaceId}/runs/${runId}/events`);
  let lastEventText = "";
  activeEventSource.addEventListener("activity", (event) => {
    try {
      const payload = JSON.parse(event.data);
      const eventText = `${payload.event || ""}|${payload.detail || ""}|${payload.time || ""}`;
      if (eventText !== lastEventText) {
        appendProgress(payload.event || "Backend activity", payload.detail || "Run update received.");
        lastEventText = eventText;
      }
    } catch {
      appendProgress("Backend activity", "Run update received.");
    }
  });
  activeEventSource.onerror = () => {
    appendProgress("Progress stream reconnecting", "Polling remains active as a fallback.");
  };
}

async function pollBackendRun(workspaceId, runId, signal) {
  let lastActivityCount = 0;
  while (true) {
    if (signal.aborted) {
      throw new Error("Live backend request timed out after 45 minutes. Narrow the scope or rerun later.");
    }
    await delay(PULL_POLL_INTERVAL_MS);
    const payload = await fetchJson(`/api/workspaces/${workspaceId}/runs/${runId}`, { signal });
    const activityCount = payload.activity_log?.length || 0;
    if (activityCount > lastActivityCount) {
      const last = payload.activity_log[activityCount - 1];
      appendProgress(last?.event || "Backend activity", last?.detail || `Run ${runId} is still running.`);
      lastActivityCount = activityCount;
    }
    if (payload.status === "completed" && payload.run) {
      return normalizeBackendRun(payload.run, payload);
    }
    if (payload.status === "failed" || payload.ok === false) {
      const error = new Error(payload.error || "Live web-search request failed.");
      error.activityLog = payload.activity_log || [];
      throw error;
    }
    document.getElementById("runStatus").textContent = `Backend job ${runId} running`;
  }
}

function normalizeCustomColumns(columns = []) {
  return columns.map((column, index) => {
    if (typeof column === "string") {
      const label = column.trim() || `Custom ${index + 1}`;
      return { key: label.toLowerCase().replace(/\W+/g, "_").replace(/^_+|_+$/g, ""), label };
    }
    const key = String(column.key || "").trim() || `custom_${index + 1}`;
    return {
      key,
      label: String(column.label || key.replace(/_/g, " ")).trim()
    };
  });
}

function normalizeBackendRun(apiRun, meta = {}) {
  const normalizeNumber = (value) => value === null || value === undefined || value === "" ? 0 : Number(value) || 0;
  const customColumns = normalizeCustomColumns(apiRun.custom_columns || []);
  return {
    id: meta.run_id ? `RUN-${meta.run_id}` : `LIVE-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`,
    backendRunId: meta.run_id || null,
    createdAt: meta.created_at || new Date().toISOString(),
    completedAt: meta.completed_at || "",
    prompt: meta.prompt || promptText || buildPrompt(),
    scope: meta.scope || getScope(),
    mode: meta.mode || "standard",
    stages: meta.stages || [],
    live: true,
    summary: apiRun.summary || "",
    refinement: meta.refinement || null,
    refinementSummary: apiRun.refinement_summary || "",
    customColumns,
    comps: (apiRun.comps || []).map((deal, index) => ({
      id: `live-${index}`,
      flag: deal.flag || "REVIEW",
      deal: deal.deal || "Unnamed deal",
      asset: deal.asset || "Not disclosed",
      target: deal.target_moa || "Not disclosed",
      indication: deal.indication || "Not disclosed",
      modality: deal.modality || "Not disclosed",
      stage: deal.stage || "Not disclosed",
      geography: deal.geography || "Not disclosed",
      type: deal.deal_type || "Not disclosed",
      date: deal.announcement_date || "Unknown",
      status: deal.announced_or_completed || "Announced",
      upfront: normalizeNumber(deal.upfront_usd_m),
      biobucks: normalizeNumber(deal.total_value_usd_m),
      royalty: deal.royalty || "Not disclosed",
      source: deal.primary_source_name || "Primary source",
      sourceUrl: deal.primary_source_url || "",
      confidence: normalizeNumber(deal.confidence),
      note: deal.analyst_note || "",
      custom: deal.custom || {}
    })),
    stripped: (apiRun.stripped_deals || []).map((deal) => ({
      deal: deal.deal || "Unnamed deal",
      reason: deal.reason || "Stripped by scope or structure",
      source: deal.source || "Source",
      sourceUrl: deal.source_url || "",
      note: deal.analyst_note || ""
    })),
    methodology: apiRun.methodology || ["Live web search via OpenAI Responses API web_search tool.", "Primary-source verification requested for every returned row."],
    uploadedDatasets: apiRun.uploaded_datasets || [],
    activityLog: apiRun.activity_log || [],
    fallbackUsed: false,
    expansionUsed: false,
    fallbackNote: ""
  };
}

function buildErrorRun(message, activityLog = []) {
  const scope = getScope();
  const timedOut = message.toLowerCase().includes("timed out") || message.toLowerCase().includes("timeout");
  const parseFailed = message.toLowerCase().includes("invalid \\escape") || message.toLowerCase().includes("json");
  return {
    id: `ERROR-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`,
    createdAt: new Date().toISOString(),
    prompt: promptText || buildPrompt(),
    scope,
    live: true,
    summary: timedOut
      ? "The app did not return comps because the live web-search research job exceeded the current wait time. It did not fall back to canned demo data."
      : parseFailed
        ? "The app received a live web-search response, but the response formatting could not be parsed into the results table. It did not fall back to canned demo data."
        : "The app did not return comps because the live web-search backend was unavailable. It did not fall back to canned demo data.",
    comps: [],
    stripped: [],
    uploadedDatasets: [],
    activityLog,
    methodology: [
      "No local sample comps were used.",
      timedOut
        ? "The backend was reachable, but the OpenAI web-search request did not complete before the timeout."
        : parseFailed
          ? "The backend was reachable, but the returned JSON had invalid escaping before it could be parsed."
          : "Start the server-backed app with OPENAI_API_KEY set, then rerun the pull.",
      "Use http://127.0.0.1:4174/index.html for the live backend."
    ],
    fallbackUsed: true,
    expansionUsed: false,
    fallbackNote: message
  };
}

function appendProgress(title, body) {
  document.getElementById("progressLog").insertAdjacentHTML("beforeend", `
    <article>
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(body)}</span>
    </article>
  `);
}

function appendActivityLog(activityLog = []) {
  if (!activityLog.length) return;
  appendProgress("Backend activity log", `${activityLog.length} backend activity entries captured.`);
  activityLog.forEach((entry) => {
    const metrics = entry.metrics
      ? Object.entries(entry.metrics).map(([key, value]) => `${key}: ${value}`).join(" | ")
      : "";
    appendProgress(
      entry.event || "Backend activity",
      [entry.time, entry.detail, metrics].filter(Boolean).join(" - ")
    );
  });
}

async function downloadWorkbook() {
  if (!currentRun) {
    showToast("Run a pull first.");
    return;
  }
  const workspace = activeWorkspace();
  if (workspace && currentRun.backendRunId) {
    const response = await apiFetch(`/api/workspaces/${workspace.id}/runs/${currentRun.backendRunId}/exports/workbook`);
    if (!response.ok) {
      let payload = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }
      const detail = typeof payload.detail === "string" ? payload.detail : payload.error;
      if (response.status === 401) {
        showToast("Sign in again, then open the completed run from history.");
      } else if (response.status === 404) {
        showToast("That run is not in this workspace. Open a completed run from Run History.");
      } else if (response.status === 409) {
        showToast(detail || "Workbook export is available after the run completes.");
      } else {
        showToast(detail || "Workbook export failed. Check backend logs.");
      }
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `run-${currentRun.backendRunId}-oncology-comps.xlsx`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Workbook downloaded.");
    return;
  }
  const workbook = `<?xml version="1.0"?>
  <?mso-application progid="Excel.Sheet"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
    ${sheetXml("Comps", [["Flag","Deal","Asset","Target","Indication","Modality","Stage","Geography","Deal Type","Announcement Date","Status","Upfront USD M","Biobucks USD M","Royalty","Primary Source","Source URL","Confidence","Analyst Note"], ...currentRun.comps.map((deal) => [deal.flag, deal.deal, deal.asset, deal.target, deal.indication, deal.modality, deal.stage, deal.geography, deal.type, deal.date, deal.status || "Announced", deal.upfront, deal.biobucks, deal.royalty, deal.source, deal.sourceUrl || "", deal.confidence, deal.note])])}
    ${sheetXml("Stripped Deals audit", [["Deal","Reason stripped","Source","Analyst note"], ...currentRun.stripped.map((deal) => [deal.deal, deal.reason, deal.source, deal.note])])}
    ${sheetXml("Uploaded Datasets", [["File","Type","Rows parsed"], ...(currentRun.uploadedDatasets || []).map((file) => [file.name, file.type, file.row_count])])}
    ${sheetXml("Source Verification", [["Deal","Flag","Primary Source","Source URL","Analyst Note"], ...currentRun.comps.map((deal) => [deal.deal, deal.flag, deal.source, deal.sourceUrl || "", deal.note])])}
    ${sheetXml("Activity Log", [["Time","Event","Detail","Metrics"], ...(currentRun.activityLog || []).map((entry) => [entry.time || "", entry.event || "", entry.detail || "", entry.metrics ? Object.entries(entry.metrics).map(([key, value]) => `${key}: ${value}`).join(" | ") : ""])])}
    ${sheetXml("Methodology", [["Methodology"], ...currentRun.methodology.map((item) => [item]), ["Fallback / expansion warning"], [currentRun.fallbackNote || "Not applicable"], ["Prompt"], [currentRun.prompt]])}
  </Workbook>`;
  downloadBlob(`${currentRun.id}-oncology-comps.xls`, workbook, "application/vnd.ms-excel;charset=utf-8");
}

function sheetXml(name, rows) {
  return `<Worksheet ss:Name="${escapeXml(name)}"><Table>${rows.map((row) => `<Row>${row.map((cell) => {
    const isNumber = typeof cell === "number" && Number.isFinite(cell);
    return `<Cell><Data ss:Type="${isNumber ? "Number" : "String"}">${escapeXml(cell)}</Data></Cell>`;
  }).join("")}</Row>`).join("")}</Table></Worksheet>`;
}

function downloadSummary() {
  if (!currentRun) {
    showToast("Run a pull first.");
    return;
  }
  const text = document.getElementById("summaryOutput").innerText;
  downloadBlob(`${currentRun.id}-summary.txt`, text, "text/plain;charset=utf-8");
}

function appendRefinementMessage(title, body) {
  document.getElementById("refinementThread").insertAdjacentHTML("beforeend", `
    <article>
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(body)}</span>
    </article>
  `);
}

async function applyRefinement() {
  if (!currentRun || !currentRun.backendRunId) {
    showToast("Open a completed backend run first.");
    return;
  }
  const workspace = activeWorkspace();
  if (!workspace) {
    showToast("Sign in before refining a run.");
    return;
  }
  const input = document.getElementById("refinementInput");
  const instruction = input.value.trim();
  if (!instruction) {
    showToast("Write a refinement instruction first.");
    return;
  }
  const button = document.getElementById("applyRefinement");
  button.disabled = true;
  appendRefinementMessage("You", instruction);
  appendRefinementMessage("Refining", "Applying the instruction to the saved run.");
  try {
    const payload = await fetchJson(`/api/workspaces/${workspace.id}/runs/${currentRun.backendRunId}/refinements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instruction })
    });
    const refinedRun = normalizeBackendRun(payload.run, payload);
    renderRun(refinedRun);
    appendRefinementMessage("Applied", refinedRun.refinementSummary || "Refinement applied. Download Excel to export the latest version.");
    input.value = "";
    await renderHistory();
    showToast("Refinement applied.");
  } catch (error) {
    appendRefinementMessage("Could not apply", error.message || "Refinement failed.");
    showToast(error.message || "Refinement failed.");
  } finally {
    button.disabled = false;
  }
}

async function applyAugmentation() {
  if (!currentRun || !currentRun.backendRunId) {
    showToast("Open a completed backend run first.");
    return;
  }
  const workspace = activeWorkspace();
  if (!workspace) {
    showToast("Sign in before augmenting a run.");
    return;
  }
  const fileInput = document.getElementById("augmentationFiles");
  const files = [...(fileInput?.files || [])];
  if (!files.length) {
    showToast("Upload at least one database export first.");
    return;
  }
  const instructionInput = document.getElementById("augmentationInstruction");
  const instruction = instructionInput.value.trim();
  const button = document.getElementById("applyAugmentation");
  button.disabled = true;
  appendRefinementMessage("Database upload", `${files.length} file(s): ${files.map((file) => file.name).join(", ")}`);
  appendRefinementMessage("Merging", "Filtering uploaded rows for relevant comps and merging them into the saved run.");
  try {
    const form = new FormData();
    form.append("instruction", instruction);
    files.forEach((file) => form.append("datasets", file, file.name));
    const payload = await fetchJson(`/api/workspaces/${workspace.id}/runs/${currentRun.backendRunId}/augment/form`, {
      method: "POST",
      body: form
    });
    const augmentedRun = normalizeBackendRun(payload.run, payload);
    renderRun(augmentedRun);
    appendRefinementMessage("Merged", augmentedRun.refinementSummary || "Uploaded database exports were merged into the latest output.");
    fileInput.value = "";
    instructionInput.value = "";
    renderAugmentationUploadList();
    await renderHistory();
    showToast("Database exports merged.");
  } catch (error) {
    appendRefinementMessage("Could not merge", error.message || "Database augmentation failed.");
    showToast(error.message || "Database augmentation failed.");
  } finally {
    button.disabled = false;
  }
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function saveRun(run) {
  currentRun = run;
}

function getHistory() {
  return serverHistory;
}

async function renderHistory() {
  const workspace = activeWorkspace();
  if (!workspace) {
    document.getElementById("historyList").innerHTML = `<article><strong>Sign in to view run history.</strong><span>Workspace runs will appear here.</span></article>`;
    return;
  }
  try {
    const payload = await fetchJson(`/api/workspaces/${workspace.id}/runs?limit=50`);
    serverHistory = payload.runs || [];
  } catch (error) {
    document.getElementById("historyList").innerHTML = `<article><strong>Could not load history.</strong><span>${escapeHtml(error.message)}</span></article>`;
    return;
  }
  const history = getHistory();
  document.getElementById("historyList").innerHTML = history.length ? history.map((run) => `
    <article>
      <strong>RUN-${escapeHtml(run.id)} - ${escapeHtml(historyTitle(run))}</strong>
      <span>${new Date(run.created_at).toLocaleString()} | ${escapeHtml(run.status)} | ${countComps(run)} clean comps | ${countStripped(run)} stripped | ${durationText(run)}</span>
      ${run.activity_log?.length ? `<details><summary>Activity log</summary><div class="history-activity">${run.activity_log.map((entry) => `<p><strong>${escapeHtml(entry.event || "Activity")}</strong><br>${escapeHtml([entry.time, entry.detail, entry.metrics ? Object.entries(entry.metrics).map(([key, value]) => `${key}: ${value}`).join(" | ") : ""].filter(Boolean).join(" - "))}</p>`).join("")}</div></details>` : ""}
      <div class="dialog-actions">
        <button class="ghost-button" data-history-run="${escapeHtml(run.id)}">Open run</button>
        <button class="ghost-button" data-history-prompt="${escapeHtml(run.id)}">View prompt</button>
      </div>
    </article>
  `).join("") : `<article><strong>No runs yet.</strong><span>Completed runs will appear here.</span></article>`;
}

function historyTitle(run) {
  const scope = run.scope || {};
  return `${(scope.modality || []).join(", ") || "Any modality"} / ${scope.targetMoa || "Any target"}`;
}

function countComps(run) {
  return run.result?.comps?.length || 0;
}

function countStripped(run) {
  return run.result?.stripped_deals?.length || 0;
}

function durationText(run) {
  if (!run.started_at || !run.completed_at) return "duration pending";
  const seconds = Math.max(0, Math.round((new Date(run.completed_at) - new Date(run.started_at)) / 1000));
  return formatElapsed(seconds);
}

async function openHistoryRun(runId) {
  const workspace = activeWorkspace();
  if (!workspace) return;
  const payload = await fetchJson(`/api/workspaces/${workspace.id}/runs/${runId}`);
  if (!payload.run) {
    showToast("Run has no completed result yet.");
    return;
  }
  renderRun(normalizeBackendRun(payload.run, payload));
  appendActivityLog(payload.activity_log || []);
  showView("results");
}

function renderAugmentationUploadList() {
  const files = [...(document.getElementById("augmentationFiles")?.files || [])];
  const uploadList = document.getElementById("augmentationUploadList");
  if (!uploadList) return;
  uploadList.innerHTML = files.length
    ? files.map((file) => `<span>${escapeHtml(file.name)} · ${Math.ceil(file.size / 1024).toLocaleString()} KB</span>`).join("")
    : "No uploaded datasets.";
}

function updateCustomDateRange() {
  document.getElementById("customDateRange").hidden = document.getElementById("dateRange").value !== "Custom range";
}

function updateFilterCount() {
  const scope = getScopeSafe();
  if (!scope) return;
  const count = [
    scope.tumorType,
    scope.targetMoa,
    ...scope.modality,
    ...scope.dealType,
    ...scope.stage,
    ...scope.geography,
    scope.minUpfront ? "upfront" : "",
    scope.minBiobucks ? "biobucks" : ""
  ].filter(Boolean).length;
  document.getElementById("activeFilterCount").textContent = `${count} filters`;
}

function getScopeSafe() {
  if (!document.getElementById("tumorType")) return null;
  return getScope();
}

function resetAll() {
  document.getElementById("tumorType").value = "";
  document.getElementById("targetMoa").value = "";
  selected.modality = [];
  selected.dealType = [];
  selected.stage = [];
  selected.geography = [];
  Object.keys(optionSets).forEach(renderCombo);
  document.getElementById("dateRange").value = "Any date";
  document.getElementById("minUpfront").value = 0;
  document.getElementById("minBiobucks").value = 0;
  document.getElementById("candidateInput").value = "";
  document.getElementById("augmentationFiles").value = "";
  document.getElementById("augmentationInstruction").value = "";
  renderAugmentationUploadList();
  document.getElementById("targetDeal").value = "";
  document.getElementById("wantExcel").checked = true;
  document.getElementById("wantSummary").checked = true;
  document.getElementById("wantBenchmark").checked = false;
  document.getElementById("pullMode").value = "standard";
  updateCustomDateRange();
  buildPrompt();
  showToast("Launcher reset.");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeXml(value) {
  return escapeHtml(value).replaceAll("'", "&apos;");
}

document.querySelectorAll(".nav-item, .stepper button").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

Object.keys(optionSets).forEach((field) => {
  const input = document.getElementById(`${field}Input`);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCriterion(field, input.value);
    }
  });
  input.addEventListener("blur", () => addCriterion(field, input.value));
});

document.addEventListener("click", (event) => {
  const add = event.target.dataset?.add;
  const remove = event.target.dataset?.remove;
  const historyPrompt = event.target.dataset?.historyPrompt;
  const historyRun = event.target.dataset?.historyRun;
  if (add) {
    const [field, value] = add.split(":");
    addCriterion(field, value);
  }
  if (remove) {
    const [field, value] = remove.split(":");
    removeCriterion(field, value);
  }
  if (historyPrompt) {
    const run = getHistory().find((item) => String(item.id) === String(historyPrompt));
    if (run) {
      document.getElementById("promptPreview").textContent = run.prompt;
      showView("prompt");
    }
  }
  if (historyRun) {
    openHistoryRun(historyRun).catch((error) => showToast(error.message || "Could not open run."));
  }
});

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segmented button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    mode = button.dataset.mode;
    const input = document.getElementById("candidateInput");
    input.placeholder = mode === "web"
      ? "Optional. Leave blank for web-only discovery."
      : mode === "paste"
        ? "Paste raw candidate text, screenshots converted to text, or source excerpts."
        : "One row per line: Deal | Asset | Upfront | Biobucks | Source";
  });
});

["tumorType", "targetMoa", "minUpfront", "minBiobucks", "candidateInput", "targetDeal"].forEach((id) => {
  document.getElementById(id).addEventListener("input", updateFilterCount);
});
document.getElementById("augmentationFiles").addEventListener("change", renderAugmentationUploadList);

document.getElementById("dateRange").addEventListener("change", () => {
  updateCustomDateRange();
  updateFilterCount();
});
document.getElementById("endDate").valueAsDate = new Date();

document.getElementById("generatePrompt").addEventListener("click", () => {
  buildPrompt();
  showView("prompt");
  showToast("Prompt generated.");
});
document.getElementById("copyPrompt").addEventListener("click", async () => {
  buildPrompt();
  await navigator.clipboard.writeText(promptText);
  showToast("Prompt copied.");
});
document.getElementById("runPull").addEventListener("click", runPull);
document.getElementById("resetAll").addEventListener("click", resetAll);
document.getElementById("downloadExcel").addEventListener("click", downloadWorkbook);
document.getElementById("downloadSummary").addEventListener("click", downloadSummary);
document.getElementById("applyRefinement").addEventListener("click", applyRefinement);
document.getElementById("applyAugmentation").addEventListener("click", applyAugmentation);
document.getElementById("authForm").addEventListener("submit", submitAuth);
document.getElementById("toggleAuthMode").addEventListener("click", () => setAuthMode(authMode === "login" ? "signup" : "login"));
document.getElementById("logoutButton").addEventListener("click", logout);
document.getElementById("clearHistory").addEventListener("click", () => {
  renderHistory();
  showToast("Run history refreshed.");
});

Object.keys(optionSets).forEach(renderCombo);
renderAugmentationUploadList();
updateCustomDateRange();
buildPrompt();
setAuthMode("login");
initializeAuth();
