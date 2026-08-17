/* =========================================================
   ZERO CARBON FORUM CAP PLATFORM
   Static GitHub Pages prototype
========================================================= */


/* =========================================================
   1. DATA FILES

   Upload these CSV files into the SAME GitHub repository
   as index.html / style.css / app.js.
========================================================= */

const DATA_FILES = [

{
  name: "Governance & Strategy",
  file:
    "Refreshed Initiative Library_FINAL(Governance and Strategy (Ece)).csv"
},

  {
    name: "Energy & Buildings",
    file:
      "Refreshed Initiative Library_FINAL(Energy&Building (Siyuan)).csv"
  },

  {
    name: "Energy Management Supplement",
    file:
      "Refreshed Initiative Library_FINAL(Energy and Buildings (Adam&AY)).csv"
  },

  {
    name: "F&B Procurement & Menu",
    file:
      "Refreshed Initiative Library_FINAL(F&B Procurement & Menu (Taylor)).csv"
  },

  {
    name: "Packaging & Procurement",
    file:
      "Refreshed Initiative Library_FINAL(Packaging&Procurement(Ece)).csv"
  },

  {
    name: "Supplier & Value Chain",
    file:
      "Refreshed Initiative Library_FINAL(Supplier & Value Chain (Taylor)).csv"
  },

  {
    name: "Transport & Distribution",
    file:
      "Refreshed Initiative Library_FINAL(Transport & Distribution (Vani)).csv"
  },

  {
    name: "Nature & Resources",
    file:
      "Refreshed Initiative Library_FINAL(Nature & Resources (Atharva)).csv"
  }

];


let initiatives = [];

let filteredInitiatives = [];

let currentQuestionRecommendations = [];



/* =========================================================
   2. HELPERS
========================================================= */

function clean(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();

}


function firstValue(row, keys) {

  for (const key of keys) {

    if (
      row[key] !== undefined &&
      clean(row[key]) !== ""
    ) {

      return clean(row[key]);

    }

  }

  return "";

}


function escapeHTML(value) {

  return String(value || "")

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}


function isMeaningful(value) {

  const v =
    clean(value)
      .toLowerCase();

  return ![
    "",
    "-",
    "none",
    "n/a",
    "na",
    "not available",
    "not found",
    "no",
    "."
  ].includes(v);

}


function truncate(value, limit = 100) {

  const text = clean(value);

  if (text.length <= limit) {
    return text;
  }

  return text.slice(0, limit) + "…";

}


function percent(part, total) {

  if (!total) {
    return 0;
  }

  return Math.round(
    (part / total) * 100
  );

}



/* =========================================================
   3. CSV PARSER

   Handles:
   commas inside quoted cells
   line breaks inside quoted cells
   escaped quotes
========================================================= */

function parseCSV(text) {

  const rows = [];

  let row = [];

  let value = "";

  let quoted = false;


  for (
    let i = 0;
    i < text.length;
    i++
  ) {

    const char = text[i];

    const next =
      text[i + 1];


    if (char === '"') {

      if (
        quoted &&
        next === '"'
      ) {

        value += '"';

        i++;

      }

      else {

        quoted = !quoted;

      }

    }


    else if (
      char === "," &&
      !quoted
    ) {

      row.push(value);

      value = "";

    }


    else if (
      (char === "\n" ||
       char === "\r") &&
      !quoted
    ) {

      if (
        char === "\r" &&
        next === "\n"
      ) {

        i++;

      }


      row.push(value);

      value = "";


      if (
        row.some(
          cell =>
            clean(cell) !== ""
        )
      ) {

        rows.push(row);

      }

      row = [];

    }


    else {

      value += char;

    }

  }


  if (
    value.length ||
    row.length
  ) {

    row.push(value);

    rows.push(row);

  }


  return rows;

}



/* =========================================================
   4. IDENTIFY HEADER ROW
========================================================= */

function findHeaderRow(rows) {

  for (
    let i = 0;
    i < Math.min(rows.length, 6);
    i++
  ) {

    const normalized =
      rows[i].map(
        x =>
          clean(x).toLowerCase()
      );


    if (
      normalized.includes(
        "initiative"
      )
    ) {

      return i;

    }

  }


  return 0;

}



/* =========================================================
   5. TURN CSV ROW INTO OBJECT
========================================================= */

function rowsToObjects(rows) {

  if (!rows.length) {
    return [];
  }


  const headerIndex =
    findHeaderRow(rows);


  const headers =
    rows[headerIndex]
      .map(clean);


  const result = [];


  for (
    let i =
      headerIndex + 1;

    i < rows.length;

    i++
  ) {

    const item = {};

    headers.forEach(
      (header, index) => {

        if (header) {

          item[header] =
            clean(
              rows[i][index]
            );

        }

      }
    );


    const initiativeName =
      firstValue(
        item,
        [
          "Initiative",
          "initiative"
        ]
      );


    if (initiativeName) {

      result.push(item);

    }

  }


  return result;

}



/* =========================================================
   6. NORMALISE DIFFERENT CSV FORMATS
========================================================= */

function normalizeInitiative(
  row,
  sourceName,
  sourceFile
) {

  const initiative =
    firstValue(
      row,
      [
        "Initiative",
        "initiative"
      ]
    );


  let topic =
    firstValue(
      row,
      [
        "Topic",
        "topic"
      ]
    );


  let subTopic =
    firstValue(
      row,
      [
        "Sub Topic",
        "Sub-Topic",
        "Sub Topic ",
        "Sub-Topic "
      ]
    );


  if (!topic) {

    topic = sourceName;

  }


  const description =
    firstValue(
      row,
      [
        "Description"
      ]
    );


  const why =
    firstValue(
      row,
      [
        "Why/Benefit",
        "WHY/BENEFIT",
        "Benefits"
      ]
    );


  const how =
    firstValue(
      row,
      [
        "How to achieve this",
        "How (Implementation Steps)",
        "Case Execution"
      ]
    );


  const kpi =
    firstValue(
      row,
      [
        "KPI (Measurable Objective)",
        "KPI",
        "KPI ",
        "KPI Justification"
      ]
    );


  const evidence =
    firstValue(
      row,
      [
        "Evidence/Case Study",
        "Evidence/Case Study （explain to others)",
        "Evidence",
        "Case Studies & Benchmarks",
        "Case Impact"
      ]
    );


  const reference =
    firstValue(
      row,
      [
        "Evidence Reference",
        "Case Study Source Links",
        "Cost  - Evidence Link / Exact Location (URL + page/sheet + before/after cells)",
        "Carbon Abatement Potential - Evidence Link / Exact Location (URL + page/sheet + before/after cells)"
      ]
    );


  const sector =
    firstValue(
      row,
      [
        "Sub-Sector included",
        "Sector Included",
        "Sector included"
      ]
    );


  const excluded =
    firstValue(
      row,
      [
        "Sub-Sector Excluded",
        "Sector not included",
        "Sector Not Included"
      ]
    );


  const oldInitiative =
    firstValue(
      row,
      [
        "Old Initiative",
        "Old Initiatve"
      ]
    );


  const cost =
    firstValue(
      row,
      [
        "Cost Saving/Cost ",
        "Cost - Interface Language",
        "Cost - Factor Value"
      ]
    );


  const carbon =
    firstValue(
      row,
      [
        "Carbon Abatement Potential",
        "Carbon Abatement - Interface Language",
        "Carbon Abatement Potential - Factor Value"
      ]
    );


  const roi =
    firstValue(
      row,
      [
        "Time to implement/ROI",
        "ROI / Timing - Interface Language",
        "ROI / Timing - Factor Value"
      ]
    );


  const impact =
    firstValue(
      row,
      [
        "Efficiency/Impact measure",
        "Efficiency / Other Impact - Interface Language",
        "Efficiency / Other Impact - Factor Value"
      ]
    );


  const tools =
    firstValue(
      row,
      [
        "Tools"
      ]
    );


  return {

    id:
      `${sourceName}-${initiative}`
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          "-"
        ),

    sourceName,

    sourceFile,

    topic,

    subTopic,

    initiative,

    oldInitiative,

    sector,

    excluded,

    description,

    why,

    how,

    kpi,

    evidence,

    reference,

    cost,

    carbon,

    roi,

    impact,

    tools

  };

}



/* =========================================================
   7. LOAD DATA
========================================================= */

async function loadData() {

  initiatives = [];

  updateDataStatus(
    "loading"
  );


  const errors = [];


  for (
    const source of DATA_FILES
  ) {

    try {

      const url =
        encodeURI(
          source.file
        );


      const response =
        await fetch(
          url,
          {
            cache: "no-store"
          }
        );


      if (!response.ok) {

        throw new Error(
          `${response.status}`
        );

      }


      const text =
        await response.text();


      const csvRows =
        parseCSV(text);


      const objects =
        rowsToObjects(
          csvRows
        );


      objects.forEach(
        row => {

          initiatives.push(

            normalizeInitiative(
              row,
              source.name,
              source.file
            )

          );

        }
      );

    }


    catch (error) {

      console.error(
        "Could not load:",
        source.file,
        error
      );


      errors.push(
        source.file
      );

    }

  }


  removeDuplicates();


  filteredInitiatives =
    [...initiatives];


  if (
    initiatives.length
  ) {

    updateDataStatus(
      errors.length
        ? "partial"
        : "ready",
      errors.length
    );


    initialiseInterface();

  }

  else {

    updateDataStatus(
      "error"
    );

  }

}



/* =========================================================
   8. REMOVE EXACT DUPLICATE INITIATIVES
========================================================= */

function removeDuplicates() {

  const seen =
    new Set();


  initiatives =
    initiatives.filter(
      item => {

        const key =
          item.initiative
            .toLowerCase()
            .replace(
              /\s+/g,
              " "
            )
            .trim();


        if (
          seen.has(key)
        ) {

          return false;

        }


        seen.add(key);

        return true;

      }
    );

}



/* =========================================================
   9. STATUS
========================================================= */

function updateDataStatus(
  state,
  errorCount = 0
) {

  const dot =
    document.querySelector(
      ".status-dot"
    );


  const text =
    document.getElementById(
      "dataStatusText"
    );


  dot.classList.remove(
    "ready",
    "error"
  );


  if (
    state === "loading"
  ) {

    text.textContent =
      "Loading initiative library...";

  }


  else if (
    state === "ready"
  ) {

    dot.classList.add(
      "ready"
    );


    text.textContent =
      `${initiatives.length} initiatives loaded`;

  }


  else if (
    state === "partial"
  ) {

    dot.classList.add(
      "ready"
    );


    text.textContent =
      `${initiatives.length} loaded · ${errorCount} file(s) missing`;

  }


  else {

    dot.classList.add(
      "error"
    );


    text.textContent =
      "CSV files not found";

  }

}



/* =========================================================
   10. INITIALISE UI
========================================================= */

function initialiseInterface() {

  populateFilters();

  updateDashboard();

  renderInitiatives();

  renderEvidence();

  updatePreview();

}



/* =========================================================
   11. NAVIGATION
========================================================= */

const PAGE_CONFIG = {

  dashboard: {
    title: "Dashboard",
    subtitle:
      "Climate Action Plan management overview"
  },

  initiatives: {
    title: "Initiatives",
    subtitle:
      "Review and manage the refreshed initiative library"
  },

  evidence: {
    title: "Evidence",
    subtitle:
      "Supporting evidence, case studies and references"
  },

  questionnaire: {
    title: "Questionnaires",
    subtitle:
      "Sector and operating-model routing prototype"
  },

  benchmarking: {
    title: "Benchmarking",
    subtitle:
      "Peer, hybrid and action-based comparison framework"
  },

  preview: {
    title: "Preview Output",
    subtitle:
      "Illustrative member-facing Climate Action Plan"
  }

};


function switchView(view) {

  document
    .querySelectorAll(
      ".view"
    )
    .forEach(
      el =>
        el.classList.remove(
          "active-view"
        )
    );


  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(
      el =>
        el.classList.remove(
          "active"
        )
    );


  const target =
    document.getElementById(
      `${view}View`
    );


  if (target) {

    target.classList.add(
      "active-view"
    );

  }


  const nav =
    document.querySelector(
      `.nav-item[data-view="${view}"]`
    );


  if (nav) {

    nav.classList.add(
      "active"
    );

  }


  document.getElementById(
    "pageTitle"
  ).textContent =
    PAGE_CONFIG[view].title;


  document.getElementById(
    "pageSubtitle"
  ).textContent =
    PAGE_CONFIG[view].subtitle;


  window.scrollTo(
    0,
    0
  );

}


document
  .querySelectorAll(
    ".nav-item"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          switchView(
            button.dataset.view
          );

        }
      );

    }
  );


window.switchView =
  switchView;



/* =========================================================
   12. DASHBOARD
========================================================= */

function calculateCoverage(field) {

  const covered =
    initiatives.filter(
      item =>
        isMeaningful(
          item[field]
        )
    ).length;


  return percent(
    covered,
    initiatives.length
  );

}


function updateDashboard() {

  const topics =
    [
      ...new Set(
        initiatives
          .map(
            item =>
              item.topic
          )
          .filter(Boolean)
      )
    ];


  const evidenceCoverage =
    calculateCoverage(
      "evidence"
    );


  const kpiCoverage =
    calculateCoverage(
      "kpi"
    );


  const costCoverage =
    calculateCoverage(
      "cost"
    );


  const carbonCoverage =
    calculateCoverage(
      "carbon"
    );


  document.getElementById(
    "metricInitiatives"
  ).textContent =
    initiatives.length;


  document.getElementById(
    "metricTopics"
  ).textContent =
    topics.length;


  document.getElementById(
    "metricEvidence"
  ).textContent =
    `${evidenceCoverage}%`;


  document.getElementById(
    "metricKpi"
  ).textContent =
    `${kpiCoverage}%`;


  setProgress(
    "evidenceProgress",
    "evidenceProgressText",
    evidenceCoverage
  );


  setProgress(
    "kpiProgress",
    "kpiProgressText",
    kpiCoverage
  );


  setProgress(
    "costProgress",
    "costProgressText",
    costCoverage
  );


  setProgress(
    "carbonProgress",
    "carbonProgressText",
    carbonCoverage
  );


  renderTopicBars();

  renderDashboardTable();

}


function setProgress(
  barId,
  textId,
  value
) {

  document.getElementById(
    barId
  ).style.width =
    `${value}%`;


  document.getElementById(
    textId
  ).textContent =
    `${value}%`;

}



/* =========================================================
   13. TOPIC BARS
========================================================= */

function renderTopicBars() {

  const counts = {};


  initiatives.forEach(
    item => {

      const topic =
        item.topic ||
        "Uncategorised";


      counts[topic] =
        (counts[topic] || 0) + 1;

    }
  );


  const entries =
    Object.entries(
      counts
    )
      .sort(
        (a, b) =>
          b[1] - a[1]
      );


  const max =
    Math.max(
      ...entries.map(
        x => x[1]
      ),
      1
    );


  document.getElementById(
    "topicBars"
  ).innerHTML =

    entries
      .slice(0, 8)
      .map(
        ([topic, count]) => `

          <div class="topic-bar-row">

            <div class="topic-bar-name"
                 title="${escapeHTML(topic)}">
              ${escapeHTML(topic)}
            </div>

            <div class="topic-track">

              <div
                class="topic-fill"
                style="width:${(count / max) * 100}%">
              </div>

            </div>

            <div class="topic-count">
              ${count}
            </div>

          </div>

        `
      )
      .join("");

}



/* =========================================================
   14. DASHBOARD SAMPLE TABLE
========================================================= */

function renderDashboardTable() {

  const sample =
    initiatives.slice(
      0,
      7
    );


  document.getElementById(
    "dashboardTableBody"
  ).innerHTML =

    sample
      .map(
        item => `

          <tr>

            <td class="initiative-name-cell">
              ${escapeHTML(
                item.initiative
              )}
            </td>

            <td>
              <span class="topic-pill">
                ${escapeHTML(
                  item.topic
                )}
              </span>
            </td>

            <td>
              ${escapeHTML(
                item.subTopic ||
                "—"
              )}
            </td>

            <td class="sector-cell">
              <div class="clamp-text">
                ${escapeHTML(
                  item.sector ||
                  "—"
                )}
              </div>
            </td>

            <td>
              ${evidenceStatusPill(
                item
              )}
            </td>

          </tr>

        `
      )
      .join("");

}



/* =========================================================
   15. FILTERS
========================================================= */

function populateFilters() {

  populateSelect(
    "topicFilter",
    initiatives.map(
      x => x.topic
    )
  );


  populateSelect(
    "subTopicFilter",
    initiatives.map(
      x => x.subTopic
    )
  );


  const sectors =
    [
      "All",
      "Restaurants",
      "QSR",
      "QSRs",
      "Pubs",
      "Hotels",
      "Contract Caterers",
      "Experiential Leisure"
    ];


  populateSelect(
    "sectorFilter",
    sectors
  );

}


function populateSelect(
  id,
  values
) {

  const select =
    document.getElementById(
      id
    );


  const currentFirst =
    select.options[0];


  const unique =
    [
      ...new Set(
        values
          .map(clean)
          .filter(Boolean)
      )
    ].sort();


  select.innerHTML = "";

  select.appendChild(
    currentFirst
  );


  unique.forEach(
    value => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        value;


      option.textContent =
        value;


      select.appendChild(
        option
      );

    }
  );

}



/* =========================================================
   16. INITIATIVE FILTERING
========================================================= */

function applyInitiativeFilters() {

  const search =
    clean(
      document.getElementById(
        "initiativeSearch"
      ).value
    ).toLowerCase();


  const topic =
    document.getElementById(
      "topicFilter"
    ).value;


  const subTopic =
    document.getElementById(
      "subTopicFilter"
    ).value;


  const sector =
    document.getElementById(
      "sectorFilter"
    ).value;


  filteredInitiatives =
    initiatives.filter(
      item => {

        const searchable =
          Object.values(item)
            .join(" ")
            .toLowerCase();


        const matchSearch =
          !search ||
          searchable.includes(
            search
          );


        const matchTopic =
          !topic ||
          item.topic === topic;


        const matchSubTopic =
          !subTopic ||
          item.subTopic === subTopic;


        const matchSector =
          !sector ||
          (
            item.sector
              .toLowerCase()
              .includes(
                sector.toLowerCase()
              )
          );


        return (
          matchSearch &&
          matchTopic &&
          matchSubTopic &&
          matchSector
        );

      }
    );


  renderInitiatives();

}



/* =========================================================
   17. INITIATIVE TABLE
========================================================= */

function renderInitiatives() {

  document.getElementById(
    "initiativeCount"
  ).textContent =
    `${filteredInitiatives.length} initiatives`;


  const body =
    document.getElementById(
      "initiativesTableBody"
    );


  if (
    !filteredInitiatives.length
  ) {

    body.innerHTML = `

      <tr>

        <td
          colspan="8"
          style="text-align:center;padding:45px;color:#758494">

          No initiatives match the current filters.

        </td>

      </tr>

    `;

    return;

  }


  body.innerHTML =

    filteredInitiatives
      .map(
        (item) => `

          <tr>

            <td class="initiative-name-cell">
              ${escapeHTML(
                item.initiative
              )}
            </td>

            <td class="topic-cell">

              <span class="topic-pill">
                ${escapeHTML(
                  item.topic
                )}
              </span>

            </td>

            <td>
              ${escapeHTML(
                item.subTopic ||
                "—"
              )}
            </td>

            <td class="sector-cell">

              <div
                class="clamp-text"
                title="${escapeHTML(
                  item.sector
                )}">

                ${escapeHTML(
                  item.sector ||
                  "—"
                )}

              </div>

            </td>

            <td>
              ${escapeHTML(
                truncate(
                  item.cost ||
                  "—",
                  40
                )
              )}
            </td>

            <td>
              ${escapeHTML(
                truncate(
                  item.carbon ||
                  "—",
                  40
                )
              )}
            </td>

            <td>
              ${readinessPill(
                item
              )}
            </td>

            <td>

              <button
                class="table-action"
                title="View initiative"
                onclick="openInitiativeDrawer('${item.id}')">

                ⋯

              </button>

            </td>

          </tr>

        `
      )
      .join("");

}



/* =========================================================
   18. READINESS
========================================================= */

function readinessScore(item) {

  const fields =
    [
      "description",
      "why",
      "how",
      "kpi",
      "evidence",
      "cost",
      "carbon"
    ];


  const complete =
    fields.filter(
      field =>
        isMeaningful(
          item[field]
        )
    ).length;


  return (
    complete /
    fields.length
  );

}


function readinessPill(item) {

  const score =
    readinessScore(
      item
    );


  if (
    score >= .75
  ) {

    return `
      <span class="status-pill status-ready">
        Ready
      </span>
    `;

  }


  if (
    score >= .4
  ) {

    return `
      <span class="status-pill status-partial">
        Partial
      </span>
    `;

  }


  return `
    <span class="status-pill status-missing">
      Needs review
    </span>
  `;

}


function evidenceStatusPill(item) {

  if (
    isMeaningful(
      item.evidence
    )
  ) {

    return `
      <span class="status-pill status-ready">
        Available
      </span>
    `;

  }


  return `
    <span class="status-pill status-missing">
      Missing
    </span>
  `;

}



/* =========================================================
   19. DRAWER
========================================================= */

function openInitiativeDrawer(id) {

  const item =
    initiatives.find(
      x =>
        x.id === id
    );


  if (!item) {
    return;
  }


  document.getElementById(
    "drawerTopic"
  ).textContent =
    `${item.topic} · ${item.subTopic || "General"}`;


  document.getElementById(
    "drawerTitle"
  ).textContent =
    item.initiative;


  const blocks = [

    [
      "Description",
      item.description
    ],

    [
      "Why / Benefit",
      item.why
    ],

    [
      "How to achieve this",
      item.how
    ],

    [
      "KPI",
      item.kpi
    ],

    [
      "Tools",
      item.tools
    ],

    [
      "Sector Included",
      item.sector
    ],

    [
      "Sector Excluded",
      item.excluded
    ],

    [
      "Cost / Cost Saving",
      item.cost
    ],

    [
      "Carbon Abatement Potential",
      item.carbon
    ],

    [
      "Time to Implement / ROI",
      item.roi
    ],

    [
      "Efficiency / Impact",
      item.impact
    ],

    [
      "Evidence / Case Study",
      item.evidence
    ],

    [
      "Evidence Reference",
      item.reference
    ],

    [
      "Old Initiative",
      item.oldInitiative
    ]

  ];


  document.getElementById(
    "drawerContent"
  ).innerHTML =

    blocks
      .filter(
        ([, value]) =>
          isMeaningful(
            value
          )
      )
      .map(
        ([title, value]) => `

          <div class="drawer-block">

            <h4>
              ${escapeHTML(title)}
            </h4>

            <p>
              ${linkify(
                value
              )}
            </p>

          </div>

        `
      )
      .join("");


  document.getElementById(
    "initiativeDrawer"
  ).classList.add(
    "open"
  );


  document.getElementById(
    "drawerOverlay"
  ).classList.add(
    "open"
  );

}


window.openInitiativeDrawer =
  openInitiativeDrawer;


function closeDrawer() {

  document.getElementById(
    "initiativeDrawer"
  ).classList.remove(
    "open"
  );


  document.getElementById(
    "drawerOverlay"
  ).classList.remove(
    "open"
  );

}


function linkify(value) {

  const escaped =
    escapeHTML(value);


  return escaped.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a class="reference-link" href="$1" target="_blank" rel="noopener">$1</a>'
  );

}



/* =========================================================
   20. EVIDENCE TABLE
========================================================= */

function renderEvidence() {

  const query =
    clean(
      document.getElementById(
        "evidenceSearch"
      )?.value || ""
    ).toLowerCase();


  const list =
    initiatives.filter(
      item => {

        const searchable =
          `${item.initiative}
           ${item.evidence}
           ${item.reference}`
            .toLowerCase();


        return (
          !query ||
          searchable.includes(
            query
          )
        );

      }
    );


  document.getElementById(
    "evidenceCount"
  ).textContent =
    `${list.length} records`;


  document.getElementById(
    "evidenceTableBody"
  ).innerHTML =

    list
      .map(
        item => `

          <tr>

            <td class="initiative-name-cell">
              ${escapeHTML(
                item.initiative
              )}
            </td>

            <td>

              <span class="topic-pill">
                ${escapeHTML(
                  item.topic
                )}
              </span>

            </td>

            <td>
              ${escapeHTML(
                truncate(
                  item.evidence ||
                  "No evidence recorded",
                  150
                )
              )}
            </td>

            <td>
              ${renderReference(
                item.reference
              )}
            </td>

            <td>
              ${evidenceStatusPill(
                item
              )}
            </td>

          </tr>

        `
      )
      .join("");

}


function renderReference(value) {

  if (
    !isMeaningful(value)
  ) {

    return "—";

  }


  const url =
    clean(value)
      .match(
        /https?:\/\/[^\s;]+/
      );


  if (url) {

    return `
      <a
        class="reference-link"
        href="${escapeHTML(url[0])}"
        target="_blank"
        rel="noopener">
        Open source ↗
      </a>
    `;

  }


  return escapeHTML(
    truncate(
      value,
      70
    )
  );

}



/* =========================================================
   21. QUESTIONNAIRE RECOMMENDATIONS
========================================================= */

function generateQuestionnaireRecommendations() {

  const sector =
    document.getElementById(
      "questionSector"
    ).value;


  const priority =
    document.getElementById(
      "questionPriority"
    ).value;


  const maturity =
    document.getElementById(
      "questionMaturity"
    ).value;


  const hasScope3 =
    document.getElementById(
      "hasScope3"
    ).checked;


  const hasEnergyData =
    document.getElementById(
      "hasEnergyData"
    ).checked;


  const hasBoardOversight =
    document.getElementById(
      "hasBoardOversight"
    ).checked;


  let candidates =
    initiatives.filter(
      item => {

        const sectorMatch =
          sector === "All" ||
          item.sector
            .toLowerCase()
            .includes(
              sector.toLowerCase()
            ) ||
          item.sector
            .toLowerCase()
            .includes("all");


        const priorityMatch =
          !priority ||
          item.topic
            .toLowerCase()
            .includes(
              priority.toLowerCase()
            ) ||
          item.subTopic
            .toLowerCase()
            .includes(
              priority.toLowerCase()
            );


        return (
          sectorMatch &&
          priorityMatch
        );

      }
    );


  candidates =
    candidates
      .map(
        item => {

          let score =
            readinessScore(
              item
            );


          const text =
            (
              item.initiative +
              " " +
              item.description +
              " " +
              item.subTopic
            ).toLowerCase();


          if (
            !hasScope3 &&
            (
              text.includes("scope 3") ||
              text.includes("supplier") ||
              text.includes("value chain")
            )
          ) {

            score += .35;

          }


          if (
            !hasEnergyData &&
            (
              text.includes("energy") ||
              text.includes("meter") ||
              text.includes("baseline")
            )
          ) {

            score += .25;

          }


          if (
            !hasBoardOversight &&
            (
              text.includes("board") ||
              text.includes("governance")
            )
          ) {

            score += .35;

          }


          if (
            maturity === "early"
          ) {

            if (
              text.includes("baseline") ||
              text.includes("policy") ||
              text.includes("governance")
            ) {

              score += .15;

            }

          }


          return {
            item,
            score
          };

        }
      )
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(
        0,
        6
      );


  currentQuestionRecommendations =
    candidates.map(
      x => x.item
    );


  renderQuestionnaireRecommendations();

  updatePreview(
    currentQuestionRecommendations
  );

}



/* =========================================================
   22. QUESTIONNAIRE UI
========================================================= */

function renderQuestionnaireRecommendations() {

  const container =
    document.getElementById(
      "questionRecommendations"
    );


  if (
    !currentQuestionRecommendations.length
  ) {

    container.innerHTML = `

      <div class="empty-box">

        No matching initiatives were found.

      </div>

    `;

    return;

  }


  container.innerHTML =

    currentQuestionRecommendations
      .map(
        (item, index) => `

          <div class="recommendation-item">

            <div class="rec-number">
              PRIORITY ${index + 1}
            </div>

            <strong>
              ${escapeHTML(
                item.initiative
              )}
            </strong>

            <p>
              ${escapeHTML(
                truncate(
                  item.why ||
                  item.description,
                  150
                )
              )}
            </p>

          </div>

        `
      )
      .join("");

}



/* =========================================================
   23. PREVIEW
========================================================= */

function updatePreview(
  list = null
) {

  const previewItems =
    (
      list &&
      list.length
    )
      ? list.slice(0, 5)
      : initiatives.slice(0, 5);


  document.getElementById(
    "previewActionCount"
  ).textContent =
    previewItems.length;


  document.getElementById(
    "previewRecommendations"
  ).innerHTML =

    previewItems
      .map(
        (item, index) => `

          <div class="preview-action">

            <div class="preview-action-number">
              ${index + 1}
            </div>

            <div>

              <strong>
                ${escapeHTML(
                  item.initiative
                )}
              </strong>

              <p>
                ${escapeHTML(
                  item.topic
                )}
                ·
                ${escapeHTML(
                  item.subTopic ||
                  "General"
                )}
              </p>

            </div>

            <span class="status-pill ${
              readinessScore(item) >= .75
                ? "status-ready"
                : "status-partial"
            }">

              ${
                readinessScore(item) >= .75
                  ? "Ready"
                  : "Review"
              }

            </span>

          </div>

        `
      )
      .join("");

}



/* =========================================================
   24. ADD INITIATIVE — SESSION ONLY
========================================================= */

function openModal() {

  document.getElementById(
    "modalOverlay"
  ).classList.add(
    "open"
  );

}


function closeModal() {

  document.getElementById(
    "modalOverlay"
  ).classList.remove(
    "open"
  );

}


function saveSessionInitiative() {

  const initiative =
    clean(
      document.getElementById(
        "newInitiativeName"
      ).value
    );


  const topic =
    clean(
      document.getElementById(
        "newInitiativeTopic"
      ).value
    );


  const description =
    clean(
      document.getElementById(
        "newInitiativeDescription"
      ).value
    );


  if (!initiative) {

    alert(
      "Please enter an initiative name."
    );

    return;

  }


  initiatives.unshift({

    id:
      `session-${Date.now()}`,

    sourceName:
      "Session entry",

    sourceFile:
      "",

    topic:
      topic ||
      "Uncategorised",

    subTopic:
      "",

    initiative,

    oldInitiative:
      "",

    sector:
      "All",

    excluded:
      "",

    description,

    why:
      "",

    how:
      "",

    kpi:
      "",

    evidence:
      "",

    reference:
      "",

    cost:
      "",

    carbon:
      "",

    roi:
      "",

    impact:
      "",

    tools:
      ""

  });


  filteredInitiatives =
    [...initiatives];


  initialiseInterface();

  closeModal();

}



/* =========================================================
   25. EVENTS
========================================================= */

[
  "initiativeSearch",
  "topicFilter",
  "subTopicFilter",
  "sectorFilter"
]
.forEach(
  id => {

    document
      .getElementById(id)
      .addEventListener(
        id === "initiativeSearch"
          ? "input"
          : "change",
        applyInitiativeFilters
      );

  }
);


document
  .getElementById(
    "evidenceSearch"
  )
  .addEventListener(
    "input",
    renderEvidence
  );


document
  .getElementById(
    "generateRecommendations"
  )
  .addEventListener(
    "click",
    generateQuestionnaireRecommendations
  );


document
  .getElementById(
    "refreshButton"
  )
  .addEventListener(
    "click",
    loadData
  );


document
  .getElementById(
    "closeDrawer"
  )
  .addEventListener(
    "click",
    closeDrawer
  );


document
  .getElementById(
    "drawerOverlay"
  )
  .addEventListener(
    "click",
    closeDrawer
  );


document
  .getElementById(
    "addInitiativeButton"
  )
  .addEventListener(
    "click",
    openModal
  );


document
  .getElementById(
    "closeModal"
  )
  .addEventListener(
    "click",
    closeModal
  );


document
  .getElementById(
    "saveInitiative"
  )
  .addEventListener(
    "click",
    saveSessionInitiative
  );


document
  .getElementById(
    "modalOverlay"
  )
  .addEventListener(
    "click",
    event => {

      if (
        event.target.id ===
        "modalOverlay"
      ) {

        closeModal();

      }

    }
  );



/* =========================================================
   26. START
========================================================= */

loadData();
