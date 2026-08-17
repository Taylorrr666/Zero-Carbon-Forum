/* =========================================================
   ZERO CARBON FORUM
   CAP MANAGEMENT PLATFORM

   GitHub Pages Prototype
========================================================= */


/* =========================================================
   1. DATA SOURCES
========================================================= */

const DATA_FILES = [

  {
    name: "Governance & Strategy",

    files: [
      "Refreshed Initiative Library_FINAL(Governance and Strategy (Ece)).csv",
      "Refreshed Initiative Library_FINAL(Governance and Strategy (Ece))(1).csv",
      "Refreshed Initiative Library_FINAL(Governance and Strategy (Ece))(2).csv"
    ]
  },


  {
    name: "Energy & Buildings",

    files: [
      "Refreshed Initiative Library_FINAL(Energy&Building (Siyuan)).csv"
    ]
  },


  {
    name: "Energy Management Supplement",

    files: [
      "Refreshed Initiative Library_FINAL(Energy and Buildings (Adam&AY)).csv"
    ]
  },


  {
    name: "F&B Procurement & Menu",

    files: [
      "Refreshed Initiative Library_FINAL(F&B Procurement & Menu (Taylor)).csv"
    ]
  },


  {
    name: "Packaging & Procurement",

    files: [
      "Refreshed Initiative Library_FINAL(Packaging&Procurement(Ece)).csv"
    ]
  },


  {
    name: "Supplier & Value Chain",

    files: [
      "Refreshed Initiative Library_FINAL(Supplier & Value Chain (Taylor)).csv"
    ]
  },


  {
    name: "Transport & Distribution",

    files: [
      "Refreshed Initiative Library_FINAL(Transport & Distribution (Vani)).csv"
    ]
  },


  {
    name: "Nature & Resources",

    files: [
      "Refreshed Initiative Library_FINAL(Nature & Resources (Atharva)).csv"
    ]
  }

];



/* =========================================================
   2. GLOBAL DATA
========================================================= */

let initiatives = [];

let filteredInitiatives = [];

let currentQuestionRecommendations = [];



/* =========================================================
   3. BASIC HELPERS
========================================================= */

function clean(value) {

  if (
    value === null ||
    value === undefined
  ) {

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



function truncate(
  value,
  limit = 100
) {

  const text =
    clean(value);

  if (
    text.length <= limit
  ) {

    return text;

  }

  return (
    text.slice(
      0,
      limit
    ) + "…"
  );

}



function isMeaningful(value) {

  const text =
    clean(value)
      .toLowerCase();

  const emptyValues = [

    "",
    "-",
    ".",
    "none",
    "no",
    "n/a",
    "na",
    "not available",
    "not found",
    "not specified"

  ];

  return !emptyValues.includes(
    text
  );

}



function percentage(
  part,
  total
) {

  if (!total) {

    return 0;

  }

  return Math.round(
    part /
    total *
    100
  );

}



/* =========================================================
   4. CSV PARSER

   Supports:
   - quoted commas
   - quoted line breaks
   - escaped quotation marks
========================================================= */

function parseCSV(text) {

  const rows = [];

  let row = [];

  let value = "";

  let inQuotes = false;


  for (
    let i = 0;
    i < text.length;
    i++
  ) {

    const char =
      text[i];

    const next =
      text[i + 1];


    if (
      char === '"'
    ) {

      if (
        inQuotes &&
        next === '"'
      ) {

        value += '"';

        i++;

      }

      else {

        inQuotes =
          !inQuotes;

      }

    }


    else if (
      char === "," &&
      !inQuotes
    ) {

      row.push(
        value
      );

      value = "";

    }


    else if (
      (
        char === "\n" ||
        char === "\r"
      ) &&
      !inQuotes
    ) {

      if (
        char === "\r" &&
        next === "\n"
      ) {

        i++;

      }


      row.push(
        value
      );

      value = "";


      const usefulRow =
        row.some(
          cell =>
            clean(cell) !== ""
        );


      if (
        usefulRow
      ) {

        rows.push(
          row
        );

      }


      row = [];

    }


    else {

      value += char;

    }

  }


  if (
    value !== "" ||
    row.length
  ) {

    row.push(
      value
    );

    rows.push(
      row
    );

  }


  return rows;

}



/* =========================================================
   5. FIND CSV HEADER ROW
========================================================= */

function findHeaderRow(rows) {

  for (
    let i = 0;
    i < Math.min(
      rows.length,
      10
    );
    i++
  ) {

    const normalised =
      rows[i]
        .map(
          cell =>
            clean(cell)
              .toLowerCase()
        );


    if (
      normalised.includes(
        "initiative"
      )
    ) {

      return i;

    }

  }


  return 0;

}



/* =========================================================
   6. CSV ROWS -> OBJECTS
========================================================= */

function rowsToObjects(rows) {

  if (
    !rows.length
  ) {

    return [];

  }


  const headerIndex =
    findHeaderRow(
      rows
    );


  const headers =
    rows[
      headerIndex
    ].map(
      clean
    );


  const objects = [];


  for (
    let i =
      headerIndex + 1;

    i < rows.length;

    i++
  ) {

    const object = {};


    headers.forEach(
      (
        header,
        columnIndex
      ) => {

        if (
          header
        ) {

          object[
            header
          ] =
            clean(
              rows[i][
                columnIndex
              ]
            );

        }

      }
    );


    const initiative =
      firstValue(
        object,
        [
          "Initiative",
          "initiative"
        ]
      );


    if (
      initiative
    ) {

      objects.push(
        object
      );

    }

  }


  return objects;

}



/* =========================================================
   7. NORMALISE DIFFERENT CSV FORMATS
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


  if (
    !topic
  ) {

    topic =
      sourceName;

  }


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


  const cost =
    firstValue(
      row,
      [
        "Cost Saving/Cost ",
        "Cost Saving/Cost",
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


  const oldInitiative =
    firstValue(
      row,
      [
        "Old Initiative",
        "Old Initiatve"
      ]
    );


  const rawID =
    [
      sourceName,
      initiative
    ]
      .join("-")
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      );


  return {

    id:
      rawID,

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
   8. TRY MULTIPLE POSSIBLE FILENAMES
========================================================= */

async function fetchFirstAvailableFile(
  candidates
) {

  for (
    const filename of candidates
  ) {

    try {

      const response =
        await fetch(
          encodeURI(
            filename
          ),
          {
            cache: "no-store"
          }
        );


      if (
        response.ok
      ) {

        return {

          filename,

          text:
            await response.text()

        };

      }

    }


    catch (error) {

      console.log(
        "Could not load:",
        filename
      );

    }

  }


  return null;

}



/* =========================================================
   9. LOAD ALL INITIATIVE LIBRARIES
========================================================= */

async function loadData() {

  initiatives = [];

  filteredInitiatives = [];

  updateDataStatus(
    "loading"
  );


  const missingFiles = [];


  for (
    const source of DATA_FILES
  ) {

    const file =
      await fetchFirstAvailableFile(
        source.files
      );


    if (
      !file
    ) {

      missingFiles.push(
        source.name
      );

      continue;

    }


    try {

      const csvRows =
        parseCSV(
          file.text
        );


      const objects =
        rowsToObjects(
          csvRows
        );


      objects.forEach(
        row => {

          const normalised =
            normalizeInitiative(
              row,
              source.name,
              file.filename
            );


          if (
            normalised.initiative
          ) {

            initiatives.push(
              normalised
            );

          }

        }
      );

    }


    catch (error) {

      console.error(
        "Error processing:",
        source.name,
        error
      );


      missingFiles.push(
        source.name
      );

    }

  }


  removeDuplicates();


  filteredInitiatives =
    [
      ...initiatives
    ];


  if (
    initiatives.length === 0
  ) {

    updateDataStatus(
      "error"
    );

    return;

  }


  if (
    missingFiles.length
  ) {

    updateDataStatus(
      "partial",
      missingFiles.length
    );

    console.warn(
      "Missing sources:",
      missingFiles
    );

  }


  else {

    updateDataStatus(
      "ready"
    );

  }


  initialiseInterface();

}



/* =========================================================
   10. REMOVE DUPLICATE INITIATIVES
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
          seen.has(
            key
          )
        ) {

          return false;

        }


        seen.add(
          key
        );


        return true;

      }
    );

}



/* =========================================================
   11. TOP-RIGHT DATA STATUS
========================================================= */

function updateDataStatus(
  state,
  missingCount = 0
) {

  const dot =
    document.querySelector(
      ".status-dot"
    );


  const text =
    document.getElementById(
      "dataStatusText"
    );


  if (
    !dot ||
    !text
  ) {

    return;

  }


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
      `${initiatives.length} loaded · ${missingCount} file(s) missing`;

  }


  else {

    dot.classList.add(
      "error"
    );


    text.textContent =
      "Initiative library could not be loaded";

  }

}



/* =========================================================
   12. INITIALISE
========================================================= */

function initialiseInterface() {

  populateFilters();

  updateDashboard();

  renderInitiatives();

  renderEvidence();

  updatePreview();

}



/* =========================================================
   13. PAGE NAVIGATION
========================================================= */

const PAGE_CONFIG = {

  dashboard: {

    title:
      "Dashboard",

    subtitle:
      "Climate Action Plan management overview"

  },


  initiatives: {

    title:
      "Initiatives",

    subtitle:
      "Review and manage the refreshed initiative library"

  },


  evidence: {

    title:
      "Evidence",

    subtitle:
      "Supporting evidence, case studies and references"

  },


  questionnaire: {

    title:
      "Questionnaires",

    subtitle:
      "Sector and operating-model routing prototype"

  },


  benchmarking: {

    title:
      "Benchmarking",

    subtitle:
      "Peer, hybrid and action-based comparison framework"

  },


  preview: {

    title:
      "Preview Output",

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
      element => {

        element.classList.remove(
          "active-view"
        );

      }
    );


  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(
      element => {

        element.classList.remove(
          "active"
        );

      }
    );


  const target =
    document.getElementById(
      `${view}View`
    );


  if (
    target
  ) {

    target.classList.add(
      "active-view"
    );

  }


  const nav =
    document.querySelector(
      `.nav-item[data-view="${view}"]`
    );


  if (
    nav
  ) {

    nav.classList.add(
      "active"
    );

  }


  const config =
    PAGE_CONFIG[
      view
    ];


  if (
    config
  ) {

    document.getElementById(
      "pageTitle"
    ).textContent =
      config.title;


    document.getElementById(
      "pageSubtitle"
    ).textContent =
      config.subtitle;

  }


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
   14. COVERAGE CALCULATION
========================================================= */

function calculateCoverage(
  field
) {

  const covered =
    initiatives.filter(
      item =>
        isMeaningful(
          item[field]
        )
    ).length;


  return percentage(
    covered,
    initiatives.length
  );

}



/* =========================================================
   15. DASHBOARD
========================================================= */

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
  barID,
  textID,
  value
) {

  document.getElementById(
    barID
  ).style.width =
    `${value}%`;


  document.getElementById(
    textID
  ).textContent =
    `${value}%`;

}



/* =========================================================
   16. TOPIC BAR CHART
========================================================= */

function renderTopicBars() {

  const counts = {};


  initiatives.forEach(
    item => {

      const topic =
        item.topic ||
        "Uncategorised";


      counts[
        topic
      ] =
        (
          counts[
            topic
          ] ||
          0
        ) + 1;

    }
  );


  const entries =
    Object.entries(
      counts
    )
      .sort(
        (
          a,
          b
        ) =>
          b[1] -
          a[1]
      );


  if (
    !entries.length
  ) {

    return;

  }


  const max =
    Math.max(
      ...entries.map(
        entry =>
          entry[1]
      )
    );


  document.getElementById(
    "topicBars"
  ).innerHTML =

    entries
      .slice(
        0,
        10
      )
      .map(
        (
          [
            topic,
            count
          ]
        ) => `

          <div class="topic-bar-row">

            <div
              class="topic-bar-name"
              title="${escapeHTML(topic)}">

              ${escapeHTML(topic)}

            </div>


            <div class="topic-track">

              <div
                class="topic-fill"
                style="width:${count / max * 100}%">
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
   17. DASHBOARD SAMPLE TABLE
========================================================= */

function renderDashboardTable() {

  const sample =
    initiatives.slice(
      0,
      8
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
   18. FILTER OPTIONS
========================================================= */

function populateFilters() {

  populateSelect(

    "topicFilter",

    initiatives.map(
      item =>
        item.topic
    )

  );


  populateSelect(

    "subTopicFilter",

    initiatives.map(
      item =>
        item.subTopic
    )

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


  if (
    !select
  ) {

    return;

  }


  const firstOption =
    select.options[
      0
    ];


  const unique =
    [
      ...new Set(
        values
          .map(clean)
          .filter(Boolean)
      )
    ]
      .sort();


  select.innerHTML =
    "";


  select.appendChild(
    firstOption
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
   19. INITIATIVE FILTERING
========================================================= */

function applyInitiativeFilters() {

  const search =
    clean(
      document.getElementById(
        "initiativeSearch"
      ).value
    )
      .toLowerCase();


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
          Object.values(
            item
          )
            .join(" ")
            .toLowerCase();


        const matchesSearch =
          !search ||
          searchable.includes(
            search
          );


        const matchesTopic =
          !topic ||
          item.topic === topic;


        const matchesSubTopic =
          !subTopic ||
          item.subTopic ===
          subTopic;


        const matchesSector =
          !sector ||
          item.sector
            .toLowerCase()
            .includes(
              sector.toLowerCase()
            );


        return (

          matchesSearch &&
          matchesTopic &&
          matchesSubTopic &&
          matchesSector

        );

      }
    );


  renderInitiatives();

}



/* =========================================================
   20. INITIATIVE READINESS
========================================================= */

function readinessScore(
  item
) {

  const fields = [

    "description",
    "why",
    "how",
    "kpi",
    "evidence",
    "cost",
    "carbon"

  ];


  const completed =
    fields.filter(
      field =>
        isMeaningful(
          item[
            field
          ]
        )
    ).length;


  return (
    completed /
    fields.length
  );

}



function readinessPill(
  item
) {

  const score =
    readinessScore(
      item
    );


  if (
    score >= 0.75
  ) {

    return `

      <span
        class="status-pill status-ready">

        Ready

      </span>

    `;

  }


  if (
    score >= 0.4
  ) {

    return `

      <span
        class="status-pill status-partial">

        Partial

      </span>

    `;

  }


  return `

    <span
      class="status-pill status-missing">

      Needs review

    </span>

  `;

}



/* =========================================================
   21. EVIDENCE STATUS
========================================================= */

function evidenceStatusPill(
  item
) {

  if (
    isMeaningful(
      item.evidence
    )
  ) {

    return `

      <span
        class="status-pill status-ready">

        Available

      </span>

    `;

  }


  return `

    <span
      class="status-pill status-missing">

      Missing

    </span>

  `;

}



/* =========================================================
   22. INITIATIVE TABLE
========================================================= */

function renderInitiatives() {

  const count =
    document.getElementById(
      "initiativeCount"
    );


  if (
    count
  ) {

    count.textContent =
      `${filteredInitiatives.length} initiatives`;

  }


  const body =
    document.getElementById(
      "initiativesTableBody"
    );


  if (
    !body
  ) {

    return;

  }


  if (
    !filteredInitiatives.length
  ) {

    body.innerHTML = `

      <tr>

        <td
          colspan="8"
          style="
            text-align:center;
            padding:45px;
            color:#758494;
          ">

          No initiatives match the current filters.

        </td>

      </tr>

    `;

    return;

  }


  body.innerHTML =

    filteredInitiatives
      .map(
        item => `

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
                  45
                )
              )}

            </td>


            <td>

              ${escapeHTML(
                truncate(
                  item.carbon ||
                  "—",
                  45
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
                title="View initiative details"
                onclick="
                  openInitiativeDrawer(
                    '${item.id}'
                  )
                ">

                ⋯

              </button>

            </td>

          </tr>

        `
      )
      .join("");

}



/* =========================================================
   23. DETAIL DRAWER
========================================================= */

function openInitiativeDrawer(
  id
) {

  const item =
    initiatives.find(
      initiative =>
        initiative.id === id
    );


  if (
    !item
  ) {

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


  const fields = [

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

    fields
      .filter(
        (
          [
            title,
            value
          ]
        ) =>
          isMeaningful(
            value
          )
      )
      .map(
        (
          [
            title,
            value
          ]
        ) => `

          <div class="drawer-block">

            <h4>

              ${escapeHTML(
                title
              )}

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
    escapeHTML(
      value
    );


  return escaped.replace(

    /(https?:\/\/[^\s]+)/g,

    '<a class="reference-link" href="$1" target="_blank" rel="noopener noreferrer">$1</a>'

  );

}



/* =========================================================
   24. EVIDENCE PAGE
========================================================= */

function renderEvidence() {

  const searchElement =
    document.getElementById(
      "evidenceSearch"
    );


  const query =
    searchElement

      ? clean(
          searchElement.value
        ).toLowerCase()

      : "";


  const list =
    initiatives.filter(
      item => {

        const searchable =
          [
            item.initiative,
            item.topic,
            item.evidence,
            item.reference
          ]
            .join(" ")
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
                  160
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



function renderReference(
  value
) {

  if (
    !isMeaningful(
      value
    )
  ) {

    return "—";

  }


  const url =
    clean(
      value
    ).match(
      /https?:\/\/[^\s;]+/
    );


  if (
    url
  ) {

    return `

      <a
        class="reference-link"
        href="${escapeHTML(
          url[0]
        )}"
        target="_blank"
        rel="noopener noreferrer">

        Open source ↗

      </a>

    `;

  }


  return escapeHTML(
    truncate(
      value,
      75
    )
  );

}



/* =========================================================
   25. QUESTIONNAIRE
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
    initiatives
      .filter(
        item => {

          const sectorText =
            item.sector
              .toLowerCase();


          const sectorMatch =
            sector === "All" ||
            sectorText.includes(
              sector.toLowerCase()
            ) ||
            sectorText.includes(
              "all"
            );


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
      )
      .map(
        item => {

          let score =
            readinessScore(
              item
            );


          const text =
            [
              item.initiative,
              item.description,
              item.subTopic,
              item.topic
            ]
              .join(" ")
              .toLowerCase();


          if (
            !hasScope3 &&
            (
              text.includes(
                "scope 3"
              ) ||
              text.includes(
                "supplier"
              ) ||
              text.includes(
                "value chain"
              )
            )
          ) {

            score +=
              0.35;

          }


          if (
            !hasEnergyData &&
            (
              text.includes(
                "energy"
              ) ||
              text.includes(
                "meter"
              ) ||
              text.includes(
                "baseline"
              )
            )
          ) {

            score +=
              0.25;

          }


          if (
            !hasBoardOversight &&
            (
              text.includes(
                "board"
              ) ||
              text.includes(
                "governance"
              )
            )
          ) {

            score +=
              0.35;

          }


          if (
            maturity ===
            "early"
          ) {

            if (
              text.includes(
                "baseline"
              ) ||
              text.includes(
                "policy"
              ) ||
              text.includes(
                "governance"
              )
            ) {

              score +=
                0.15;

            }

          }


          return {

            item,

            score

          };

        }
      )
      .sort(
        (
          a,
          b
        ) =>
          b.score -
          a.score
      )
      .slice(
        0,
        6
      );


  currentQuestionRecommendations =
    candidates.map(
      candidate =>
        candidate.item
    );


  renderQuestionnaireRecommendations();


  updatePreview(
    currentQuestionRecommendations
  );

}



/* =========================================================
   26. QUESTIONNAIRE RESULTS
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
        (
          item,
          index
        ) => `

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
                  160
                )
              )}

            </p>

          </div>

        `
      )
      .join("");

}



/* =========================================================
   27. PREVIEW OUTPUT
========================================================= */

function updatePreview(
  customList = null
) {

  const previewItems =

    customList &&
    customList.length

      ? customList.slice(
          0,
          5
        )

      : initiatives.slice(
          0,
          5
        );


  document.getElementById(
    "previewActionCount"
  ).textContent =
    previewItems.length;


  document.getElementById(
    "previewRecommendations"
  ).innerHTML =

    previewItems
      .map(
        (
          item,
          index
        ) => `

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


            <span
              class="status-pill ${
                readinessScore(
                  item
                ) >= 0.75

                  ? "status-ready"

                  : "status-partial"
              }">

              ${
                readinessScore(
                  item
                ) >= 0.75

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
   28. SESSION-ONLY ADD INITIATIVE
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


  if (
    !initiative
  ) {

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
    [
      ...initiatives
    ];


  initialiseInterface();


  closeModal();

}



/* =========================================================
   29. EVENT LISTENERS
========================================================= */

const initiativeSearch =
  document.getElementById(
    "initiativeSearch"
  );


const topicFilter =
  document.getElementById(
    "topicFilter"
  );


const subTopicFilter =
  document.getElementById(
    "subTopicFilter"
  );


const sectorFilter =
  document.getElementById(
    "sectorFilter"
  );


initiativeSearch.addEventListener(
  "input",
  applyInitiativeFilters
);


topicFilter.addEventListener(
  "change",
  applyInitiativeFilters
);


subTopicFilter.addEventListener(
  "change",
  applyInitiativeFilters
);


sectorFilter.addEventListener(
  "change",
  applyInitiativeFilters
);


document.getElementById(
  "evidenceSearch"
).addEventListener(
  "input",
  renderEvidence
);


document.getElementById(
  "generateRecommendations"
).addEventListener(
  "click",
  generateQuestionnaireRecommendations
);


document.getElementById(
  "refreshButton"
).addEventListener(
  "click",
  loadData
);


document.getElementById(
  "closeDrawer"
).addEventListener(
  "click",
  closeDrawer
);


document.getElementById(
  "drawerOverlay"
).addEventListener(
  "click",
  closeDrawer
);


document.getElementById(
  "addInitiativeButton"
).addEventListener(
  "click",
  openModal
);


document.getElementById(
  "closeModal"
).addEventListener(
  "click",
  closeModal
);


document.getElementById(
  "saveInitiative"
).addEventListener(
  "click",
  saveSessionInitiative
);


document.getElementById(
  "modalOverlay"
).addEventListener(
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
   30. START PLATFORM
========================================================= */

loadData();
