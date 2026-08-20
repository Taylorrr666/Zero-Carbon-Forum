/* ==========================================================
   ZERO CARBON FORUM
   CLIMATE ACTION PLAN GOVERNANCE PLATFORM

   Static GitHub Pages prototype
========================================================== */



/* ==========================================================
   DATA SOURCES
========================================================== */

const DATA_SOURCES = [

  {
    name:
      "Governance & Strategy",

    files: [

      "Refreshed Initiative Library_FINAL(Governance and Strategy (Ece)).csv",

      "Refreshed Initiative Library_FINAL(Governance and Strategy (Ece))(1).csv",

      "Refreshed Initiative Library_FINAL(Governance and Strategy (Ece))(2).csv"

    ]
  },


  {
    name:
      "Energy & Buildings",

    files: [

      "Refreshed Initiative Library_FINAL(Energy&Building (Siyuan)).csv"

    ]
  },


  {
    name:
      "Energy & Buildings",

    files: [

      "Refreshed Initiative Library_FINAL(Energy and Buildings (Adam&AY)).csv"

    ]
  },


  {
    name:
      "F&B Procurement & Menu",

    files: [

      "Refreshed Initiative Library_FINAL(F&B Procurement & Menu (Taylor)).csv"

    ]
  },


  {
    name:
      "Packaging & Procurement",

    files: [

      "Refreshed Initiative Library_FINAL(Packaging&Procurement(Ece)).csv"

    ]
  },


  {
    name:
      "Supplier & Value Chain",

    files: [

      "Refreshed Initiative Library_FINAL(Supplier & Value Chain (Taylor)).csv"

    ]
  },


  {
    name:
      "Transport & Distribution",

    files: [

      "Refreshed Initiative Library_FINAL(Transport & Distribution (Vani)).csv"

    ]
  },


  {
    name:
      "Nature & Resources",

    files: [

      "Refreshed Initiative Library_FINAL(Nature & Resources (Atharva)).csv"

    ]
  }

];



/* ==========================================================
   GLOBAL STATE
========================================================== */

let initiatives = [];

let filteredInitiatives = [];

let factorRecords = [];

let evidenceRecords = [];

let loadedSources = 0;

let duplicatesRemoved = 0;



/* ==========================================================
   BASIC HELPERS
========================================================== */

function clean(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(
    value
  ).trim();

}



function firstValue(
  row,
  keys
) {

  for (
    const key of keys
  ) {

    if (
      row[key] !== undefined &&
      clean(
        row[key]
      ) !== ""
    ) {

      return clean(
        row[key]
      );

    }

  }


  return "";

}



function escapeHTML(value) {

  return String(
    value || ""
  )

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}



function truncate(
  value,
  length = 90
) {

  const text =
    clean(value);


  if (
    text.length <=
    length
  ) {

    return text;

  }


  return (
    text.slice(
      0,
      length
    ) +
    "…"
  );

}



function meaningful(
  value
) {

  const text =
    clean(value)
      .toLowerCase();


  return ![
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
  ]
    .includes(
      text
    );

}



function percentage(
  value,
  total
) {

  if (
    !total
  ) {

    return 0;

  }


  return Math.round(
    value /
    total *
    100
  );

}



/* ==========================================================
   CSV PARSER
========================================================== */

function parseCSV(
  text
) {

  const rows = [];

  let row = [];

  let value = "";

  let quoted = false;


  for (
    let i = 0;

    i <
    text.length;

    i++
  ) {

    const char =
      text[i];


    const next =
      text[
        i + 1
      ];


    if (
      char === '"'
    ) {

      if (
        quoted &&
        next === '"'
      ) {

        value += '"';

        i++;

      }

      else {

        quoted =
          !quoted;

      }

    }


    else if (
      char === "," &&
      !quoted
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
      !quoted
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


      if (
        row.some(
          cell =>
            clean(
              cell
            )
        )
      ) {

        rows.push(
          row
        );

      }


      row = [];

    }


    else {

      value +=
        char;

    }

  }


  if (
    value ||
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



/* ==========================================================
   FIND HEADERS
========================================================== */

function findHeaderRow(
  rows
) {

  for (
    let i = 0;

    i <
    Math.min(
      rows.length,
      12
    );

    i++
  ) {

    const row =
      rows[i]
        .map(
          cell =>
            clean(cell)
              .toLowerCase()
        );


    if (
      row.includes(
        "initiative"
      )
    ) {

      return i;

    }

  }


  return 0;

}



/* ==========================================================
   ROWS -> OBJECTS
========================================================== */

function rowsToObjects(
  rows
) {

  if (
    !rows.length
  ) {

    return [];

  }


  const headerRow =
    findHeaderRow(
      rows
    );


  const headers =
    rows[
      headerRow
    ]
      .map(
        clean
      );


  const output = [];


  for (
    let i =
      headerRow + 1;

    i <
    rows.length;

    i++
  ) {

    const object = {};


    headers.forEach(
      (
        header,
        index
      ) => {

        if (
          header
        ) {

          object[
            header
          ] =
            clean(
              rows[i][
                index
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

      output.push(
        object
      );

    }

  }


  return output;

}



/* ==========================================================
   NORMALISE INITIATIVE
========================================================== */

function normaliseInitiative(
  row,
  source
) {

  const initiative =
    firstValue(
      row,
      [
        "Initiative",
        "initiative"
      ]
    );


  const topic =
    firstValue(
      row,
      [
        "Topic"
      ]
    ) ||
    source;


  const subTopic =
    firstValue(
      row,
      [
        "Sub Topic",
        "Sub-Topic",
        "Sub Topic ",
        "Sub-Topic "
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
        "Benefits"
      ]
    );


  const how =
    firstValue(
      row,
      [
        "How to achieve this",
        "How (Implementation Steps)"
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


  const kpi =
    firstValue(
      row,
      [
        "KPI (Measurable Objective)",
        "KPI",
        "KPI "
      ]
    );


  const evidence =
    firstValue(
      row,
      [
        "Evidence/Case Study",
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


  return {

    id:
      (
        source +
        "-" +
        initiative
      )
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          "-"
        ),


    initiative,

    topic,

    subTopic,

    description,

    why,

    how,

    sector,

    excluded,

    kpi,

    evidence,

    reference,

    cost,

    carbon,

    roi,

    impact,

    tools,

    oldInitiative,

    source

  };

}



/* ==========================================================
   LOAD FIRST AVAILABLE FILE
========================================================== */

async function fetchFirstAvailable(
  files
) {

  for (
    const file of files
  ) {

    try {

      const response =
        await fetch(
          encodeURI(
            file
          ),
          {
            cache:
              "no-store"
          }
        );


      if (
        response.ok
      ) {

        return {
          file,
          text:
            await response.text()
        };

      }

    }


    catch (
      error
    ) {

      console.log(
        "Unable to load",
        file
      );

    }

  }


  return null;

}



/* ==========================================================
   LOAD LIBRARY
========================================================== */

async function loadData() {

  initiatives = [];

  loadedSources = 0;

  duplicatesRemoved = 0;


  setDataStatus(
    "Loading data…"
  );


  for (
    const source
    of DATA_SOURCES
  ) {

    const file =
      await fetchFirstAvailable(
        source.files
      );


    if (
      !file
    ) {

      continue;

    }


    loadedSources++;


    const rows =
      parseCSV(
        file.text
      );


    const objects =
      rowsToObjects(
        rows
      );


    objects.forEach(
      row => {

        initiatives.push(

          normaliseInitiative(
            row,
            source.name
          )

        );

      }
    );

  }


  removeDuplicates();


  filteredInitiatives =
    [
      ...initiatives
    ];


  buildFactorRecords();

  buildEvidenceRecords();


  updateEverything();


  setDataStatus(
    `${initiatives.length} initiatives loaded`
  );


  logActivity(
    "Library",
    "REFRESH",
    `${initiatives.length} initiative records loaded`,
    "admin"
  );

}



/* ==========================================================
   DUPLICATES
========================================================== */

function removeDuplicates() {

  const seen =
    new Set();


  const before =
    initiatives.length;


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


  duplicatesRemoved =
    before -
    initiatives.length;

}



/* ==========================================================
   FACTOR RECORDS
========================================================== */

function buildFactorRecords() {

  factorRecords = [];


  initiatives.forEach(
    (
      item,
      initiativeIndex
    ) => {


      const values = [

        [
          "Cost",
          item.cost
        ],

        [
          "Carbon",
          item.carbon
        ],

        [
          "Timing",
          item.roi
        ],

        [
          "KPI",
          item.kpi
        ]

      ];


      values.forEach(
        (
          [
            type,
            value
          ],
          factorIndex
        ) => {

          if (
            meaningful(
              value
            )
          ) {

            factorRecords.push({

              id:
                `FAC-${String(
                  initiativeIndex + 1
                ).padStart(
                  4,
                  "0"
                )}-${factorIndex + 1}`,

              type,

              initiative:
                item.initiative,

              value,

              topic:
                item.topic

            });

          }

        }
      );

    }
  );

}



/* ==========================================================
   EVIDENCE RECORDS
========================================================== */

function buildEvidenceRecords() {

  evidenceRecords =
    initiatives
      .map(
        (
          item,
          index
        ) => ({

          id:
            `EVID-${String(
              index + 1
            ).padStart(
              4,
              "0"
            )}`,

          initiative:
            item.initiative,

          evidence:
            item.evidence,

          reference:
            item.reference,

          topic:
            item.topic

        })
      );

}



/* ==========================================================
   DATA STATUS
========================================================== */

function setDataStatus(
  message
) {

  document.getElementById(
    "dataStatus"
  ).textContent =
    message;

}



/* ==========================================================
   PAGE NAVIGATION
========================================================== */

const viewNames = [

  "dashboard",
  "plan",
  "progress",
  "initiatives",
  "factors",
  "evidence",
  "questionnaires"

];



function switchView(
  view
) {

  document
    .querySelectorAll(
      ".view"
    )
    .forEach(
      element => {

        element
          .classList
          .remove(
            "active-view"
          );

      }
    );


  document
    .querySelectorAll(
      ".nav-link[data-view]"
    )
    .forEach(
      element => {

        element
          .classList
          .remove(
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
      `.nav-link[data-view="${view}"]`
    );


  if (
    nav
  ) {

    nav.classList.add(
      "active"
    );

  }


  window.scrollTo(
    0,
    0
  );


  logActivity(
    "Navigation",
    "VIEW",
    view,
    "admin"
  );

}



document
  .querySelectorAll(
    ".nav-link[data-view]"
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



document
  .querySelectorAll(
    ".manage-card"
  )
  .forEach(
    card => {

      card.addEventListener(
        "click",
        () => {

          switchView(
            card.dataset.open
          );

        }
      );

    }
  );



/* ==========================================================
   UPDATE EVERYTHING
========================================================== */

function updateEverything() {

  updateDashboard();

  updateProgress();

  populateFilters();

  renderInitiatives();

  renderFactors();

  renderEvidence();

  updateHealth();

}



/* ==========================================================
   DASHBOARD
========================================================== */

function updateDashboard() {

  const missingFigures =
    initiatives
      .filter(
        item =>
          !meaningful(
            item.cost
          ) ||
          !meaningful(
            item.carbon
          )
      )
      .length;


  const missingEvidence =
    initiatives
      .filter(
        item =>
          !meaningful(
            item.evidence
          )
      )
      .length;


  const missingKpi =
    initiatives
      .filter(
        item =>
          !meaningful(
            item.kpi
          )
      )
      .length;


  const evidenceCount =
    initiatives.length -
    missingEvidence;


  const topics =
    new Set(

      initiatives
        .map(
          item =>
            item.topic
        )
        .filter(
          Boolean
        )

    );


  document.getElementById(
    "missingFiguresMetric"
  ).textContent =
    missingFigures;


  document.getElementById(
    "missingEvidenceMetric"
  ).textContent =
    missingEvidence;


  document.getElementById(
    "missingKpiMetric"
  ).textContent =
    missingKpi;


  document.getElementById(
    "evidenceLibraryMetric"
  ).textContent =
    evidenceCount;


  document.getElementById(
    "totalInitiativesMetric"
  ).textContent =
    initiatives.length;


  document.getElementById(
    "totalFactorsMetric"
  ).textContent =
    factorRecords.length;


  document.getElementById(
    "totalEvidenceMetric"
  ).textContent =
    evidenceCount;


  document.getElementById(
    "totalTopicsMetric"
  ).textContent =
    topics.size;


  renderActivity();

}



/* ==========================================================
   COVERAGE
========================================================== */

function coverage(
  field
) {

  return percentage(

    initiatives.filter(
      item =>
        meaningful(
          item[field]
        )
    ).length,

    initiatives.length

  );

}



/* ==========================================================
   PROGRESS
========================================================== */

function updateProgress() {

  const evidence =
    coverage(
      "evidence"
    );


  const kpi =
    coverage(
      "kpi"
    );


  const cost =
    coverage(
      "cost"
    );


  const carbon =
    coverage(
      "carbon"
    );


  document.getElementById(
    "progressEvidence"
  ).textContent =
    `${evidence}%`;


  document.getElementById(
    "progressKpi"
  ).textContent =
    `${kpi}%`;


  document.getElementById(
    "progressCost"
  ).textContent =
    `${cost}%`;


  document.getElementById(
    "progressCarbon"
  ).textContent =
    `${carbon}%`;


  renderTopicProgress();

}



/* ==========================================================
   TOPIC PROGRESS
========================================================== */

function renderTopicProgress() {

  const groups = {};


  initiatives.forEach(
    item => {

      const topic =
        item.topic ||
        "Uncategorised";


      if (
        !groups[
          topic
        ]
      ) {

        groups[
          topic
        ] = [];

      }


      groups[
        topic
      ].push(
        item
      );

    }
  );


  document.getElementById(
    "topicProgress"
  ).innerHTML =

    Object.entries(
      groups
    )

      .sort(
        (
          a,
          b
        ) =>
          b[1].length -
          a[1].length
      )

      .map(
        (
          [
            topic,
            items
          ]
        ) => {


          const score =
            Math.round(

              items.reduce(
                (
                  total,
                  item
                ) => {

                  const complete = [

                    item.description,
                    item.kpi,
                    item.evidence,
                    item.cost,
                    item.carbon

                  ]
                    .filter(
                      meaningful
                    )
                    .length;


                  return (
                    total +
                    complete / 5
                  );

                },
                0
              )

              /
              items.length

              *
              100

            );


          return `

            <div
              class="topic-progress-row"
            >

              <div
                class="topic-progress-name"
              >
                ${escapeHTML(topic)}
              </div>


              <div
                class="progress-track"
              >

                <div
                  class="progress-fill"
                  style="
                    width:${score}%
                  "
                >
                </div>

              </div>


              <div
                class="topic-progress-percent"
              >
                ${score}%
              </div>

            </div>

          `;

        }
      )
      .join("");

}



/* ==========================================================
   FILTER OPTIONS
========================================================== */

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


  const first =
    select.options[0];


  const unique = [

    ...new Set(

      values
        .map(
          clean
        )
        .filter(
          Boolean
        )

    )

  ]
    .sort();


  select.innerHTML = "";


  select.appendChild(
    first
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



/* ==========================================================
   READINESS
========================================================== */

function readiness(
  item
) {

  const fields = [

    item.description,
    item.why,
    item.kpi,
    item.evidence,
    item.cost,
    item.carbon

  ];


  const score =
    fields.filter(
      meaningful
    ).length /
    fields.length;


  if (
    score >= 0.75
  ) {

    return "ready";

  }


  if (
    score >= 0.4
  ) {

    return "partial";

  }


  return "review";

}



function readinessLabel(
  value
) {

  if (
    value === "ready"
  ) {

    return "Ready";

  }


  if (
    value === "partial"
  ) {

    return "Partial";

  }


  return "Needs review";

}



/* ==========================================================
   INITIATIVE FILTER
========================================================== */

function filterInitiatives() {

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


  const ready =
    document.getElementById(
      "readinessFilter"
    ).value;


  filteredInitiatives =
    initiatives.filter(
      item => {


        const text =
          Object.values(
            item
          )
            .join(
              " "
            )
            .toLowerCase();


        const matchesSearch =
          !search ||
          text.includes(
            search
          );


        const matchesTopic =
          !topic ||
          item.topic ===
          topic;


        const matchesSubTopic =
          !subTopic ||
          item.subTopic ===
          subTopic;


        const matchesSector =
          !sector ||
          item.sector
            .toLowerCase()
            .includes(
              sector
                .toLowerCase()
                .split(
                  "/"
                )[0]
            );


        const matchesReadiness =
          !ready ||
          readiness(
            item
          ) === ready;


        return (
          matchesSearch &&
          matchesTopic &&
          matchesSubTopic &&
          matchesSector &&
          matchesReadiness
        );

      }
    );


  renderInitiatives();

}



/* ==========================================================
   INITIATIVE TABLE
========================================================== */

function renderInitiatives() {

  document.getElementById(
    "initiativeResultCount"
  ).textContent =
    `${filteredInitiatives.length} shown`;


  const table =
    document.getElementById(
      "initiativesTable"
    );


  if (
    !filteredInitiatives.length
  ) {

    table.innerHTML = `

      <tr>

        <td
          colspan="8"
          style="
            text-align:center;
            padding:35px;
          "
        >
          No initiatives found.
        </td>

      </tr>

    `;

    return;

  }


  table.innerHTML =

    filteredInitiatives
      .map(
        (
          item,
          index
        ) => {


          const status =
            readiness(
              item
            );


          return `

            <tr>


              <td
                class="initiative-cell"
              >

                <strong
                  onclick="
                    openDrawer(
                      '${item.id}'
                    )
                  "
                >

                  ${escapeHTML(
                    item.initiative
                  )}

                </strong>

                <span>
                  INIT-${String(
                    index + 1
                  )
                    .padStart(
                      4,
                      "0"
                    )}
                </span>

              </td>


              <td>

                <span
                  class="topic-badge"
                >

                  ${escapeHTML(
                    item.topic
                  )}

                </span>

              </td>


              <td
                class="wrap-cell"
              >

                ${escapeHTML(
                  item.subTopic ||
                  "—"
                )}

              </td>


              <td
                class="wrap-cell small-text"
              >

                ${escapeHTML(
                  truncate(
                    item.sector ||
                    "—",
                    85
                  )
                )}

              </td>


              <td
                class="wrap-cell small-text"
              >

                ${escapeHTML(
                  truncate(
                    item.cost ||
                    "—",
                    65
                  )
                )}

              </td>


              <td
                class="wrap-cell small-text"
              >

                ${escapeHTML(
                  truncate(
                    item.carbon ||
                    "—",
                    65
                  )
                )}

              </td>


              <td
                class="wrap-cell small-text"
              >

                ${escapeHTML(
                  truncate(
                    item.kpi ||
                    item.roi ||
                    "—",
                    75
                  )
                )}

              </td>


              <td>

                <span
                  class="
                    status-pill
                    ${status}
                  "
                >

                  ${readinessLabel(
                    status
                  )}

                </span>

              </td>


            </tr>

          `;

        }
      )
      .join("");

}



/* ==========================================================
   FACTORS
========================================================== */

function renderFactors() {

  const search =
    clean(
      document.getElementById(
        "factorSearch"
      )?.value || ""
    )
      .toLowerCase();


  const type =
    document.getElementById(
      "factorTypeFilter"
    )?.value || "";


  const list =
    factorRecords.filter(
      factor => {


        const matchesType =
          !type ||
          factor.type ===
          type;


        const matchesSearch =
          !search ||

          (
            factor.initiative +
            " " +
            factor.value +
            " " +
            factor.topic
          )
            .toLowerCase()
            .includes(
              search
            );


        return (
          matchesType &&
          matchesSearch
        );

      }
    );


  document.getElementById(
    "factorCount"
  ).textContent =
    `${list.length} factor records`;


  document.getElementById(
    "factorsTable"
  ).innerHTML =

    list
      .map(
        factor => `

          <tr>

            <td>
              ${escapeHTML(
                factor.id
              )}
            </td>

            <td>
              ${escapeHTML(
                factor.type
              )}
            </td>

            <td
              class="initiative-cell"
            >

              <strong>
                ${escapeHTML(
                  factor.initiative
                )}
              </strong>

            </td>

            <td
              class="wrap-cell"
            >

              ${escapeHTML(
                truncate(
                  factor.value,
                  150
                )
              )}

            </td>

            <td>

              <span
                class="topic-badge"
              >

                ${escapeHTML(
                  factor.topic
                )}

              </span>

            </td>

          </tr>

        `
      )
      .join("");

}



/* ==========================================================
   EVIDENCE
========================================================== */

function renderEvidence() {

  const query =
    clean(
      document.getElementById(
        "evidenceSearch"
      )?.value ||
      ""
    )
      .toLowerCase();


  const list =
    evidenceRecords
      .filter(
        record => {


          const text =
            (
              record.initiative +
              " " +
              record.evidence +
              " " +
              record.reference +
              " " +
              record.topic
            )
              .toLowerCase();


          return (
            !query ||
            text.includes(
              query
            )
          );

        }
      );


  document.getElementById(
    "evidenceResultCount"
  ).textContent =
    `${list.length} records`;


  document.getElementById(
    "evidenceTable"
  ).innerHTML =

    list
      .map(
        record => {


          const hasEvidence =
            meaningful(
              record.evidence
            );


          return `

            <tr>


              <td>
                ${escapeHTML(
                  record.id
                )}
              </td>


              <td
                class="initiative-cell"
              >

                <strong>
                  ${escapeHTML(
                    record.initiative
                  )}
                </strong>

              </td>


              <td
                class="wrap-cell"
              >

                ${escapeHTML(
                  truncate(
                    record.evidence ||
                    "No evidence recorded",
                    160
                  )
                )}

              </td>


              <td>

                <span
                  class="topic-badge"
                >

                  ${escapeHTML(
                    record.topic
                  )}

                </span>

              </td>


              <td>

                ${renderReference(
                  record.reference
                )}

              </td>


              <td>

                <span
                  class="
                    status-pill
                    ${
                      hasEvidence
                        ? "ready"
                        : "review"
                    }
                  "
                >

                  ${
                    hasEvidence
                      ? "Complete"
                      : "Incomplete"
                  }

                </span>

              </td>


            </tr>

          `;

        }
      )
      .join("");

}



/* ==========================================================
   REFERENCES
========================================================== */

function renderReference(
  value
) {

  if (
    !meaningful(
      value
    )
  ) {

    return "—";

  }


  const match =
    value.match(
      /https?:\/\/[^\s;]+/
    );


  if (
    match
  ) {

    return `

      <a
        class="source-link"
        target="_blank"
        rel="noopener noreferrer"
        href="${escapeHTML(
          match[0]
        )}"
      >
        Open source
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



/* ==========================================================
   DRAWER
========================================================== */

function openDrawer(
  id
) {

  const item =
    initiatives.find(
      initiative =>
        initiative.id ===
        id
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


  const sections = [

    [
      "Description",
      item.description
    ],

    [
      "Why / Benefit",
      item.why
    ],

    [
      "How to achieve",
      item.how
    ],

    [
      "Sector included",
      item.sector
    ],

    [
      "Sector excluded",
      item.excluded
    ],

    [
      "KPI",
      item.kpi
    ],

    [
      "Cost",
      item.cost
    ],

    [
      "Carbon abatement potential",
      item.carbon
    ],

    [
      "Time to implement / ROI",
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
      "Tools",
      item.tools
    ],

    [
      "Old Initiative",
      item.oldInitiative
    ]

  ];


  document.getElementById(
    "drawerBody"
  ).innerHTML =

    sections
      .filter(
        section =>
          meaningful(
            section[1]
          )
      )
      .map(
        section => `

          <div
            class="drawer-section"
          >

            <h3>
              ${escapeHTML(
                section[0]
              )}
            </h3>

            <p>
              ${linkify(
                section[1]
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
    "drawerBackdrop"
  ).classList.add(
    "open"
  );


  logActivity(
    "Initiative",
    "VIEW",
    item.initiative,
    "admin"
  );

}



window.openDrawer =
  openDrawer;



function closeDrawer() {

  document.getElementById(
    "initiativeDrawer"
  ).classList.remove(
    "open"
  );


  document.getElementById(
    "drawerBackdrop"
  ).classList.remove(
    "open"
  );

}



/* ==========================================================
   LINKIFY
========================================================== */

function linkify(
  text
) {

  return escapeHTML(
    text
  )
    .replace(
      /(https?:\/\/[^\s]+)/g,

      '<a class="source-link" target="_blank" rel="noopener noreferrer" href="$1">$1</a>'
    );

}



/* ==========================================================
   QUESTIONNAIRE
========================================================== */

function runQuestionnaire() {

  const sector =
    document.getElementById(
      "questionSector"
    ).value;


  const priority =
    document.getElementById(
      "questionPriority"
    ).value;


  const energy =
    document.getElementById(
      "questionEnergy"
    ).checked;


  const scope3 =
    document.getElementById(
      "questionScope3"
    ).checked;


  const board =
    document.getElementById(
      "questionBoard"
    ).checked;


  const scored =
    initiatives
      .map(
        item => {


          let score = 0;


          const text =
            (
              item.initiative +
              " " +
              item.description +
              " " +
              item.topic +
              " " +
              item.subTopic
            )
              .toLowerCase();


          if (
            sector &&
            item.sector
              .toLowerCase()
              .includes(
                sector
                  .toLowerCase()
                  .split(
                    "/"
                  )[0]
              )
          ) {

            score += 2;

          }


          if (
            priority ===
            "Governance" &&
            (
              text.includes(
                "govern"
              ) ||
              text.includes(
                "strategy"
              )
            )
          ) {

            score += 3;

          }


          if (
            priority ===
            "Energy" &&
            (
              text.includes(
                "energy"
              ) ||
              text.includes(
                "building"
              )
            )
          ) {

            score += 3;

          }


          if (
            priority ===
            "Supply" &&
            (
              text.includes(
                "supply"
              ) ||
              text.includes(
                "food"
              ) ||
              text.includes(
                "procurement"
              )
            )
          ) {

            score += 3;

          }


          if (
            priority ===
            "Nature" &&
            (
              text.includes(
                "nature"
              ) ||
              text.includes(
                "water"
              ) ||
              text.includes(
                "waste"
              )
            )
          ) {

            score += 3;

          }


          if (
            !energy &&
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

            score += 3;

          }


          if (
            !scope3 &&
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

            score += 3;

          }


          if (
            !board &&
            (
              text.includes(
                "board"
              ) ||
              text.includes(
                "governance"
              )
            )
          ) {

            score += 3;

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
        7
      );


  document.getElementById(
    "questionnaireResults"
  ).innerHTML =

    scored
      .map(
        (
          entry,
          index
        ) => `

          <article
            class="question-result"
          >

            <strong>

              ${index + 1}.
              ${escapeHTML(
                entry.item.initiative
              )}

            </strong>


            <span>

              ${escapeHTML(
                truncate(
                  entry.item.why ||
                  entry.item.description,
                  150
                )
              )}

            </span>

          </article>

        `
      )
      .join("");


  logActivity(
    "Questionnaire",
    "RUN",
    "Generated recommendations",
    "admin"
  );

}



/* ==========================================================
   ACTIVITY LOG
========================================================== */

function getActivity() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "zcfActivity"
      ) ||
      "[]"
    );

  }


  catch (
    error
  ) {

    return [];

  }

}



function logActivity(
  category,
  action,
  description,
  user
) {

  let activity =
    getActivity();


  const last =
    activity[0];


  if (
    last &&
    last.category ===
    category &&
    last.action ===
    action &&
    last.description ===
    description
  ) {

    return;

  }


  activity.unshift({

    timestamp:
      new Date()
        .toISOString(),

    category,

    action,

    description,

    user

  });


  activity =
    activity.slice(
      0,
      12
    );


  localStorage.setItem(

    "zcfActivity",

    JSON.stringify(
      activity
    )

  );


  renderActivity();

}



/* ==========================================================
   ACTIVITY UI
========================================================== */

function renderActivity() {

  const container =
    document.getElementById(
      "recentActivity"
    );


  if (
    !container
  ) {

    return;

  }


  const activity =
    getActivity();


  if (
    !activity.length
  ) {

    container.innerHTML = `

      <div
        style="
          padding:18px 0;
          color:#788798;
          font-size:10px;
        "
      >
        No activity recorded in this browser yet.
      </div>

    `;

    return;

  }


  container.innerHTML =

    activity
      .map(
        item => {


          const date =
            new Date(
              item.timestamp
            );


          return `

            <div
              class="activity-row"
            >

              <div
                class="activity-date"
              >

                ${date.toLocaleString()}

              </div>


              <div
                class="activity-main"
              >

                <strong>
                  ${escapeHTML(
                    item.category
                  )}
                </strong>

                ·

                <span>
                  ${escapeHTML(
                    item.action
                  )}
                </span>

                <div
                  class="small-text"
                >
                  ${escapeHTML(
                    truncate(
                      item.description,
                      100
                    )
                  )}
                </div>

              </div>


              <div
                class="activity-user"
              >
                ${escapeHTML(
                  item.user
                )}
              </div>


            </div>

          `;

        }
      )
      .join("");

}



/* ==========================================================
   HEALTH
========================================================== */

function updateHealth() {

  document.getElementById(
    "healthSources"
  ).textContent =
    `${loadedSources} / ${DATA_SOURCES.length}`;


  document.getElementById(
    "healthRecords"
  ).textContent =
    initiatives.length;


  document.getElementById(
    "healthDuplicates"
  ).textContent =
    duplicatesRemoved;


  document.getElementById(
    "healthStatus"
  ).textContent =
    loadedSources ===
    DATA_SOURCES.length

      ? "Healthy"

      : "Partial";

}



/* ==========================================================
   ADD INITIATIVE MODAL
========================================================== */

function openModal() {

  document.getElementById(
    "modalBackdrop"
  ).classList.add(
    "open"
  );

}



function closeModal() {

  document.getElementById(
    "modalBackdrop"
  ).classList.remove(
    "open"
  );

}



function saveSessionInitiative() {

  const name =
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
    !name
  ) {

    alert(
      "Please enter an initiative name."
    );

    return;

  }


  const item = {

    id:
      `session-${Date.now()}`,

    initiative:
      name,

    topic:
      topic ||
      "Uncategorised",

    subTopic:
      "",

    description,

    why:
      "",

    how:
      "",

    sector:
      "All",

    excluded:
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
      "",

    oldInitiative:
      "",

    source:
      "Browser session"

  };


  initiatives.unshift(
    item
  );


  filteredInitiatives =
    [
      ...initiatives
    ];


  buildFactorRecords();

  buildEvidenceRecords();

  updateEverything();


  logActivity(
    "Initiative",
    "CREATE",
    name,
    "admin"
  );


  closeModal();

}



/* ==========================================================
   EVENTS
========================================================== */

document
  .getElementById(
    "initiativeSearch"
  )
  .addEventListener(
    "input",
    filterInitiatives
  );


document
  .getElementById(
    "topicFilter"
  )
  .addEventListener(
    "change",
    filterInitiatives
  );


document
  .getElementById(
    "subTopicFilter"
  )
  .addEventListener(
    "change",
    filterInitiatives
  );


document
  .getElementById(
    "sectorFilter"
  )
  .addEventListener(
    "change",
    filterInitiatives
  );


document
  .getElementById(
    "readinessFilter"
  )
  .addEventListener(
    "change",
    filterInitiatives
  );


document
  .getElementById(
    "factorSearch"
  )
  .addEventListener(
    "input",
    renderFactors
  );


document
  .getElementById(
    "factorTypeFilter"
  )
  .addEventListener(
    "change",
    renderFactors
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
    "runQuestionnaire"
  )
  .addEventListener(
    "click",
    runQuestionnaire
  );


document
  .getElementById(
    "refreshData"
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
    "drawerBackdrop"
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
    "saveNewInitiative"
  )
  .addEventListener(
    "click",
    saveSessionInitiative
  );


document
  .getElementById(
    "modalBackdrop"
  )
  .addEventListener(
    "click",
    event => {

      if (
        event.target.id ===
        "modalBackdrop"
      ) {

        closeModal();

      }

    }
  );


document
  .getElementById(
    "clearActivity"
  )
  .addEventListener(
    "click",
    () => {

      localStorage.removeItem(
        "zcfActivity"
      );


      renderActivity();

    }
  );



/* ==========================================================
   START
========================================================== */

loadData();
