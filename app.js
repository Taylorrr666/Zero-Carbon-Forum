/* ==========================================================
   ZERO CARBON FORUM
   CAP GOVERNANCE PLATFORM

   GitHub Pages prototype
   Full front-end data + local history version
========================================================== */


/* ==========================================================
   DATA FILES
========================================================== */

const FILES = {

  initiatives:
    "Factor Bank(Initiatives).csv",

  cost:
    "Factor Bank(Cost Factors).csv",

  carbon:
    "Factor Bank(Carbon Factors).csv",

  timing:
    "Factor Bank(Timing Factors).csv",

  efficiency:
    "Factor Bank(Efficiency Factors).csv",

  evidence:
    "Factor Bank(Evidence Bank).csv",

  factorEvidenceMap:
    "Factor Bank(Factor Evidence Map).csv",

  initiativeFactorMap:
    "Factor Bank(Initiative Factor Map).csv",

  calculationMethods:
    "Factor Bank(Calculation Methods).csv",

  cases:
    "Factor Bank(Cases).csv",

  caseSources:
    "Factor Bank(Case Sources).csv",

  gapRegister:
    "Factor Bank(Factor Gap Register).csv",

  openGaps:
    "Factor Bank(Open Gaps).csv",

  crosswalk:
    "Factor Bank(Initiative ID Crosswalk).csv",

  coverage:
    "Factor Bank(Coverage Summary).csv"

};



/* ==========================================================
   DATABASE
========================================================== */

const DB = {

  initiatives:
    [],

  factors:
    [],

  evidence:
    [],

  factorEvidenceMap:
    [],

  initiativeFactorMap:
    [],

  calculations:
    [],

  cases:
    [],

  caseSources:
    [],

  gapRegister:
    [],

  openGaps:
    [],

  crosswalk:
    [],

  coverage:
    []

};



/* ==========================================================
   HELPERS
========================================================== */

const $ =
  id =>
    document.getElementById(
      id
    );



const clean =
  value =>

    value == null
      ? ""
      : String(
          value
        ).trim();



const esc =
  value =>

    String(
      value ?? ""
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



const meaningful =
  value =>

    ![
      "",
      "-",
      ".",
      "n/a",
      "na",
      "none",
      "not available",
      "not found"
    ]

      .includes(
        clean(
          value
        )
          .toLowerCase()
      );



function percent(
  value,
  total
) {

  return total

    ? Math.round(
        value /
        total *
        100
      )

    : 0;

}



/* ==========================================================
   CSV PARSER
========================================================== */

function parseCSV(
  text
) {

  const rows =
    [];


  let row =
    [];


  let value =
    "";


  let quoted =
    false;



  for (
    let i = 0;
    i < text.length;
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

        value +=
          '"';


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


      value =
        "";

    }


    else if (
      (
        char === "\n" ||
        char === "\r"
      )
      &&
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


      value =
        "";


      if (
        row.some(
          cell =>
            clean(
              cell
            ) !== ""
        )
      ) {

        rows.push(
          row
        );

      }


      row =
        [];

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
   ROWS TO OBJECTS
========================================================== */

function rowsToObjects(
  rows
) {

  if (
    !rows.length
  ) {

    return [];

  }



  const headers =

    rows[0]
      .map(
        clean
      );



  return rows

    .slice(
      1
    )

    .filter(
      row =>
        row.some(
          cell =>
            clean(
              cell
            )
        )
    )

    .map(
      row => {

        const object =
          {};


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
                  row[
                    index
                  ]
                );

            }

          }
        );


        return object;

      }
    );

}



/* ==========================================================
   LOAD CSV
========================================================== */

async function loadCSV(
  file
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
      !response.ok
    ) {

      throw new Error(
        response.status
      );

    }


    const text =
      await response.text();


    return rowsToObjects(

      parseCSV(
        text
      )

    );

  }


  catch (
    error
  ) {

    console.warn(
      "Missing/unreadable:",
      file,
      error
    );


    return null;

  }

}



/* ==========================================================
   LOAD ALL DATA
========================================================== */

async function loadAll() {

  setStatus(
    "Loading data…"
  );


  let loadedFiles =
    0;


  const results =
    {};



  for (
    const [
      key,
      file
    ]
    of Object.entries(
      FILES
    )
  ) {

    const data =
      await loadCSV(
        file
      );


    results[
      key
    ] =
      data;


    if (
      data
    ) {

      loadedFiles++;

    }

  }



  DB.initiatives =
    results.initiatives ||
    [];



  DB.factors = [

    ...(
      results.cost ||
      []
    )
      .map(
        row => ({
          ...row,
          __type:
            "Cost"
        })
      ),


    ...(
      results.carbon ||
      []
    )
      .map(
        row => ({
          ...row,
          __type:
            "Carbon"
        })
      ),


    ...(
      results.timing ||
      []
    )
      .map(
        row => ({
          ...row,
          __type:
            "Timing"
        })
      ),


    ...(
      results.efficiency ||
      []
    )
      .map(
        row => ({
          ...row,
          __type:
            "Efficiency"
        })
      )

  ];



  DB.evidence =
    results.evidence ||
    [];


  DB.factorEvidenceMap =
    results.factorEvidenceMap ||
    [];


  DB.initiativeFactorMap =
    results.initiativeFactorMap ||
    [];


  DB.calculations =
    results.calculationMethods ||
    [];


  DB.cases =
    results.cases ||
    [];


  DB.caseSources =
    results.caseSources ||
    [];


  DB.gapRegister =
    results.gapRegister ||
    [];


  DB.openGaps =
    results.openGaps ||
    [];


  DB.crosswalk =
    results.crosswalk ||
    [];


  DB.coverage =
    results.coverage ||
    [];



  setStatus(

    `${DB.initiatives.length} initiatives · ${DB.factors.length} factors · ${DB.evidence.length} evidence`

  );


  initPage();


  logActivity(

    "Data",

    "REFRESH",

    `${loadedFiles}/${Object.keys(FILES).length} files loaded`

  );

}



/* ==========================================================
   STATUS
========================================================== */

function setStatus(
  text
) {

  if (
    $("dataStatus")
  ) {

    $("dataStatus")
      .textContent =
        text;

  }

}



/* ==========================================================
   ACTIVE NAV
========================================================== */

function activeNav() {

  const page =
    document.body
      .dataset
      .page;



  const map = {

    dashboard:
      "index.html",

    plan:
      "plan.html",

    progress:
      "progress.html",

    initiatives:
      "initiatives.html",

    "initiative-detail":
      "initiatives.html",

    factors:
      "factors.html",

    evidence:
      "evidence.html",

    questionnaires:
      "questionnaires.html"

  };



  document

    .querySelectorAll(
      ".main-nav a"
    )

    .forEach(
      link => {

        if (
          link.getAttribute(
            "href"
          ) ===
          map[
            page
          ]
        ) {

          link
            .classList
            .add(
              "active"
            );

        }

      }
    );

}



/* ==========================================================
   INIT CURRENT PAGE
========================================================== */

function initPage() {

  activeNav();


  switch (
    document.body
      .dataset
      .page
  ) {

    case "dashboard":

      renderDashboard();

      break;


    case "initiatives":

      initInitiatives();

      break;


    case "initiative-detail":

      renderInitiativeDetail();

      break;


    case "factors":

      initFactors();

      break;


    case "evidence":

      initEvidence();

      break;


    case "plan":

      initPlan();

      break;


    case "progress":

      initProgress();

      break;


    case "member-plan":

      initMember();

      break;

  }

}



/* ==========================================================
   RELATIONSHIP HELPERS
========================================================== */

function factorsForInitiative(
  initiativeId
) {

  const ids =

    DB.initiativeFactorMap

      .filter(
        row =>
          row.Initiative_ID ===
          initiativeId
      )

      .map(
        row =>
          row.Factor_ID
      );



  return DB.factors

    .filter(
      factor =>
        ids.includes(
          factor.Factor_ID
        )
    );

}



function factorOfType(
  initiativeId,
  type
) {

  return factorsForInitiative(
    initiativeId
  )

    .find(
      factor =>
        factor.__type ===
        type
    );

}



function factorEvidenceCount(
  factorId
) {

  return DB.factorEvidenceMap

    .filter(
      row =>
        row.Factor_ID ===
        factorId
    )

    .length;

}



/* ==========================================================
   LOCAL HISTORY
========================================================== */

function getActivity() {

  try {

    return JSON.parse(

      localStorage
        .getItem(
          "zcf_activity"
        )

      ||
      "[]"

    );

  }

  catch {

    return [];

  }

}



function logActivity(
  category,
  action,
  description
) {

  if (
    !description
  ) {

    return;

  }



  const activity =
    getActivity();


  const last =
    activity[0];



  if (
    last &&
    last.category === category &&
    last.action === action &&
    last.description === description
  ) {

    return;

  }



  activity.unshift({

    when:
      new Date()
        .toLocaleString(),

    category,

    action,

    description

  });



  localStorage
    .setItem(

      "zcf_activity",

      JSON.stringify(
        activity.slice(
          0,
          30
        )
      )

    );



  if (
    document.body
      .dataset
      .page ===
    "dashboard"
  ) {

    renderActivity();

  }

}



/* ==========================================================
   SEARCH HISTORY
========================================================== */

function addSearchHistory(
  page,
  query
) {

  const text =
    clean(
      query
    );


  if (
    !text
  ) {

    return;

  }



  let history =
    [];


  try {

    history =
      JSON.parse(

        localStorage
          .getItem(
            "zcf_search_history"
          )

        ||
        "[]"

      );

  }

  catch {

    history =
      [];

  }



  history =

    history.filter(
      item =>

        !(
          item.page === page

          &&

          clean(
            item.query
          )
            .toLowerCase() ===
          text
            .toLowerCase()
        )
    );



  history.unshift({

    page,

    query:
      text,

    when:
      new Date()
        .toLocaleString()

  });



  localStorage
    .setItem(

      "zcf_search_history",

      JSON.stringify(
        history.slice(
          0,
          20
        )
      )

    );



  logActivity(

    "Search",

    page,

    text

  );

}



/* ==========================================================
   FILTER HISTORY
========================================================== */

function addFilterHistory(
  page,
  label,
  value
) {

  const text =
    clean(
      value
    );


  if (
    !text
  ) {

    return;

  }



  logActivity(

    "Filter",

    page,

    `${label}: ${text}`

  );

}



/* ==========================================================
   RECENTLY VIEWED INITIATIVES
========================================================== */

function addViewedInitiative(
  initiative
) {

  if (
    !initiative
  ) {

    return;

  }



  let viewed =
    [];


  try {

    viewed =
      JSON.parse(

        localStorage
          .getItem(
            "zcf_recently_viewed"
          )

        ||
        "[]"

      );

  }

  catch {

    viewed =
      [];

  }



  viewed =

    viewed.filter(
      item =>
        item.id !==
        initiative.Initiative_ID
    );



  viewed.unshift({

    id:
      initiative.Initiative_ID,

    name:
      initiative.Initiative_Name,

    topic:
      initiative.Topic,

    when:
      new Date()
        .toLocaleString()

  });



  localStorage
    .setItem(

      "zcf_recently_viewed",

      JSON.stringify(
        viewed.slice(
          0,
          15
        )
      )

    );

}



/* ==========================================================
   DASHBOARD
========================================================== */

function renderDashboard() {

  const emptyPublished =

    DB.factors
      .filter(
        factor =>
          !meaningful(
            factor
              .Published_Display_Value
          )
      )
      .length;



  const publishedNoEvidence =

    DB.factors
      .filter(
        factor =>

          meaningful(
            factor
              .Published_Display_Value
          )

          &&

          factorEvidenceCount(
            factor.Factor_ID
          ) === 0
      )
      .length;



  const openGaps =

    DB.openGaps
      .filter(
        gap => {

          const status =
            clean(
              gap.Gap_Status
            )
              .toUpperCase();


          return ![
            "CLOSED",
            "RESOLVED"
          ]
            .includes(
              status
            );

        }
      )
      .length;



  if (
    $("metricEmpty")
  ) {

    $("metricEmpty")
      .textContent =
        emptyPublished;

  }


  if (
    $("metricNoEvidence")
  ) {

    $("metricNoEvidence")
      .textContent =
        publishedNoEvidence;

  }


  if (
    $("metricOpenGaps")
  ) {

    $("metricOpenGaps")
      .textContent =
        openGaps;

  }


  if (
    $("metricEvidence")
  ) {

    $("metricEvidence")
      .textContent =
        DB.evidence.length;

  }


  if (
    $("metricInitiatives")
  ) {

    $("metricInitiatives")
      .textContent =
        DB.initiatives.length;

  }


  if (
    $("metricFactors")
  ) {

    $("metricFactors")
      .textContent =
        DB.factors.length;

  }


  if (
    $("metricEvidence2")
  ) {

    $("metricEvidence2")
      .textContent =
        DB.evidence.length;

  }


  if (
    $("metricCases")
  ) {

    $("metricCases")
      .textContent =
        DB.cases.length;

  }



  const types = [

    "Cost",
    "Carbon",
    "Timing",
    "Efficiency"

  ];



  if (
    $("coverageBars")
  ) {

    $("coverageBars")
      .innerHTML =

        types
          .map(
            type => {

              const rows =

                DB.factors
                  .filter(
                    factor =>
                      factor.__type ===
                      type
                  );


              const published =

                rows
                  .filter(
                    factor =>
                      meaningful(
                        factor
                          .Published_Display_Value
                      )
                  )
                  .length;


              const evidence =

                rows
                  .filter(
                    factor =>
                      factorEvidenceCount(
                        factor.Factor_ID
                      ) >
                      0
                  )
                  .length;



              const score =

                Math.round(

                  (
                    percent(
                      published,
                      rows.length
                    )

                    +

                    percent(
                      evidence,
                      rows.length
                    )
                  )

                  /
                  2

                );



              return `

                <div class="coverage-row">

                  <strong>
                    ${type}
                  </strong>

                  <div class="bar-track">

                    <div
                      class="bar-fill"
                      style="width:${score}%"
                    >
                    </div>

                  </div>

                  <span>
                    ${score}%
                  </span>

                </div>

              `;

            }
          )
          .join("");

  }



  if (
    $("healthFiles")
  ) {

    $("healthFiles")
      .textContent =
        `${Object.keys(FILES).length} configured`;

  }


  if (
    $("healthInitiatives")
  ) {

    $("healthInitiatives")
      .textContent =
        DB.initiatives.length;

  }


  if (
    $("healthFactors")
  ) {

    $("healthFactors")
      .textContent =
        DB.factors.length;

  }


  if (
    $("healthStatus")
  ) {

    $("healthStatus")
      .textContent =

        DB.initiatives.length &&
        DB.factors.length

          ?
          "Healthy"

          :
          "Partial";

  }



  renderActivity();

}



/* ==========================================================
   RENDER ACTIVITY
========================================================== */

function renderActivity() {

  if (
    !$(
      "activityList"
    )
  ) {

    return;

  }



  const activity =
    getActivity();



  $("activityList")
    .innerHTML =

      activity.length

        ?

        activity

          .slice(
            0,
            12
          )

          .map(
            item => `

              <div class="activity-row">

                <span>
                  ${esc(
                    item.when
                  )}
                </span>

                <strong>

                  ${esc(
                    item.category
                  )}

                  ·

                  ${esc(
                    item.action
                  )}

                  <br>

                  <small>
                    ${esc(
                      item.description
                    )}
                  </small>

                </strong>

                <span>
                  local browser
                </span>

              </div>

            `
          )

          .join("")

        :

        `

          <div class="activity-row">

            <span>
              —
            </span>

            <strong>
              No local activity recorded
            </strong>

            <span>
              local browser
            </span>

          </div>

        `;

}



/* ==========================================================
   SELECT HELPER
========================================================== */

function fillSelect(
  id,
  values
) {

  const select =
    $(
      id
    );


  if (
    !select
  ) {

    return;

  }


  const first =
    select.options[
      0
    ];


  select.innerHTML =
    "";


  select.appendChild(
    first
  );


  values.forEach(
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
   INITIATIVES PAGE
========================================================== */

function initInitiatives() {

  const topics = [

    ...new Set(

      DB.initiatives

        .map(
          item =>
            item.Topic
        )

        .filter(
          Boolean
        )

    )

  ]
    .sort();



  const subTopics = [

    ...new Set(

      DB.initiatives

        .map(
          item =>
            item.Sub_Topic
        )

        .filter(
          Boolean
        )

    )

  ]
    .sort();



  const sectors = [

    ...new Set(

      DB.initiatives

        .flatMap(
          item =>

            clean(
              item.Sector_Included
            )

              .split(
                /[;,]/
              )

              .map(
                clean
              )
        )

        .filter(
          Boolean
        )

    )

  ]
    .sort();



  fillSelect(
    "initiativeTopic",
    topics
  );


  fillSelect(
    "initiativeSubtopic",
    subTopics
  );


  fillSelect(
    "initiativeSector",
    sectors
  );



  const initiativeSearch =
    $(
      "initiativeSearch"
    );


  if (
    initiativeSearch
  ) {

    let searchTimer;


    initiativeSearch
      .addEventListener(
        "input",
        () => {

          renderInitiatives();


          clearTimeout(
            searchTimer
          );


          searchTimer =
            setTimeout(
              () => {

                addSearchHistory(

                  "Initiatives",

                  initiativeSearch.value

                );

              },
              700
            );

        }
      );

  }



  const topicSelect =
    $(
      "initiativeTopic"
    );


  if (
    topicSelect
  ) {

    topicSelect
      .addEventListener(
        "change",
        () => {

          renderInitiatives();


          addFilterHistory(

            "Initiatives",

            "Topic",

            topicSelect.value

          );

        }
      );

  }



  const subTopicSelect =
    $(
      "initiativeSubtopic"
    );


  if (
    subTopicSelect
  ) {

    subTopicSelect
      .addEventListener(
        "change",
        () => {

          renderInitiatives();


          addFilterHistory(

            "Initiatives",

            "Sub-topic",

            subTopicSelect.value

          );

        }
      );

  }



  const sectorSelect =
    $(
      "initiativeSector"
    );


  if (
    sectorSelect
  ) {

    sectorSelect
      .addEventListener(
        "change",
        () => {

          renderInitiatives();


          addFilterHistory(

            "Initiatives",

            "Sector",

            sectorSelect.value

          );

        }
      );

  }



  renderInitiatives();

}



/* ==========================================================
   RENDER INITIATIVES
========================================================== */

function renderInitiatives() {

  const query =

    clean(
      $("initiativeSearch")
        ?.value
    )
      .toLowerCase();



  const topic =

    $("initiativeTopic")
      ?.value ||
    "";


  const subTopic =

    $("initiativeSubtopic")
      ?.value ||
    "";


  const sector =

    $("initiativeSector")
      ?.value ||
    "";



  const rows =

    DB.initiatives
      .filter(
        item => {

          const text =

            Object.values(
              item
            )
              .join(
                " "
              )
              .toLowerCase();



          return (

            (
              !query ||
              text.includes(
                query
              )
            )

            &&

            (
              !topic ||
              item.Topic ===
              topic
            )

            &&

            (
              !subTopic ||
              item.Sub_Topic ===
              subTopic
            )

            &&

            (
              !sector ||

              clean(
                item.Sector_Included
              )
                .includes(
                  sector
                )
            )

          );

        }
      );



  if (
    $("initiativeSubtitle")
  ) {

    $("initiativeSubtitle")
      .textContent =

        `${rows.length} of ${DB.initiatives.length} initiatives`;

  }



  if (
    !$(
      "initiativeTable"
    )
  ) {

    return;

  }



  $("initiativeTable")
    .innerHTML =

      rows.length

        ?

        rows

          .map(
            item => {

              const cost =
                factorOfType(
                  item.Initiative_ID,
                  "Cost"
                );


              const carbon =
                factorOfType(
                  item.Initiative_ID,
                  "Carbon"
                );


              const timing =
                factorOfType(
                  item.Initiative_ID,
                  "Timing"
                );


              const efficiency =
                factorOfType(
                  item.Initiative_ID,
                  "Efficiency"
                );



              const display =
                factor =>

                  meaningful(
                    factor
                      ?.Published_Display_Value
                  )

                    ?
                    factor
                      .Published_Display_Value

                    :
                    "—";



              return `

                <tr>

                  <td class="initiative-title">

                    <a
                      class="initiative-detail-link"
                      href="initiative-detail.html?id=${encodeURIComponent(
                        item.Initiative_ID
                      )}"
                    >

                      ${esc(
                        item.Initiative_Name
                      )}

                    </a>

                    <small>

                      ${esc(
                        item.Initiative_ID
                      )}

                      ·

                      ${esc(
                        item.Topic
                      )}

                      ·

                      ${esc(
                        item.Sub_Topic
                      )}

                    </small>

                  </td>


                  <td>
                    ${esc(
                      display(
                        cost
                      )
                    )}
                  </td>


                  <td>
                    ${esc(
                      display(
                        carbon
                      )
                    )}
                  </td>


                  <td>
                    ${esc(
                      display(
                        timing
                      )
                    )}
                  </td>


                  <td>
                    ${esc(
                      display(
                        efficiency
                      )
                    )}
                  </td>

                </tr>

              `;

            }
          )

          .join("")

        :

        `

          <tr>

            <td
              colspan="5"
              class="empty-cell"
            >
              No initiatives match the filters.
            </td>

          </tr>

        `;

}



/* ==========================================================
   INITIATIVE DETAIL
========================================================== */

function renderInitiativeDetail() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const initiativeId =
    clean(
      params.get(
        "id"
      )
    );



  const initiative =

    DB.initiatives.find(
      item =>
        item.Initiative_ID ===
        initiativeId
    );



  if (
    !initiative
  ) {

    if (
      $("detailLoading")
    ) {

      $("detailLoading")
        .classList
        .add(
          "hidden"
        );

    }


    if (
      $("detailError")
    ) {

      $("detailError")
        .classList
        .remove(
          "hidden"
        );

    }


    return;

  }



  document.title =
    `${initiative.Initiative_Name} · ZCF CAP`;



  if (
    $("detailTitle")
  ) {

    $("detailTitle")
      .textContent =
        initiative.Initiative_Name ||
        "Untitled initiative";

  }


  if (
    $("detailId")
  ) {

    $("detailId")
      .textContent =
        initiative.Initiative_ID ||
        "";

  }


  if (
    $("detailTaxonomy")
  ) {

    $("detailTaxonomy")
      .textContent =

        [
          initiative.Topic,
          initiative.Sub_Topic
        ]

          .filter(
            Boolean
          )

          .join(
            " · "
          );

  }



  if (
    $("detailDescription")
  ) {

    $("detailDescription")
      .textContent =
        initiative.Description ||
        "No description available.";

  }


  if (
    $("detailBenefit")
  ) {

    $("detailBenefit")
      .textContent =
        initiative.Why_Benefit ||
        initiative.WhyBenefit ||
        "No benefit description available.";

  }


  if (
    $("detailHow")
  ) {

    $("detailHow")
      .textContent =
        initiative.How_Text ||
        initiative.How ||
        "No implementation guidance available.";

  }


  if (
    $("detailKpi")
  ) {

    $("detailKpi")
      .textContent =
        initiative.KPI ||
        "No KPI recorded.";

  }


  if (
    $("detailIncluded")
  ) {

    $("detailIncluded")
      .textContent =
        initiative.Sector_Included ||
        "No sector inclusion information recorded.";

  }


  if (
    $("detailExcluded")
  ) {

    $("detailExcluded")
      .textContent =

        initiative.Sector_Not_Included

        ||

        initiative.Sector_Excluded

        ||

        "No exclusion or applicability caveat recorded.";

  }



  const factorTypes = [

    {
      type:
        "Cost",

      title:
        "Cost"
    },

    {
      type:
        "Carbon",

      title:
        "Carbon abatement"
    },

    {
      type:
        "Timing",

      title:
        "Payback"
    },

    {
      type:
        "Efficiency",

      title:
        "Efficiency"
    }

  ];



  if (
    $("detailFactorCards")
  ) {

    $("detailFactorCards")
      .innerHTML =

        factorTypes

          .map(
            config => {

              const factor =
                factorOfType(
                  initiativeId,
                  config.type
                );


              return renderDetailFactorCard(

                config.title,

                factor

              );

            }
          )

          .join("");

  }



  const cases =

    DB.cases

      .filter(
        item =>
          item.Initiative_ID ===
          initiativeId
      )

      .sort(
        (
          a,
          b
        ) =>

          Number(
            a.Sort_Order ||
            0
          )

          -

          Number(
            b.Sort_Order ||
            0
          )
      );



  if (
    $("detailCases")
  ) {

    $("detailCases")
      .innerHTML =

        cases.length

          ?

          cases
            .map(
              item =>
                renderCaseStudy(
                  item
                )
            )
            .join("")

          :

          `

            <div class="detail-empty">

              No case study is currently linked to this initiative.

            </div>

          `;

  }



  if (
    $("detailLoading")
  ) {

    $("detailLoading")
      .classList
      .add(
        "hidden"
      );

  }


  if (
    $("initiativeDetail")
  ) {

    $("initiativeDetail")
      .classList
      .remove(
        "hidden"
      );

  }



  addViewedInitiative(
    initiative
  );


  logActivity(

    "Initiative",

    "VIEW",

    `${initiativeId} · ${initiative.Initiative_Name}`

  );

}



/* ==========================================================
   DETAIL FACTOR CARD
========================================================== */

function renderDetailFactorCard(
  title,
  factor
) {

  if (
    !factor
  ) {

    return `

      <article class="detail-factor-card">

        <div class="factor-card-head">

          <span>
            ${esc(
              title
            )}
          </span>

        </div>

        <div class="factor-main-value factor-empty">
          —
        </div>

        <div class="factor-card-footer">
          No factor linked
        </div>

      </article>

    `;

  }



  const displayValue =

    meaningful(
      factor.Published_Display_Value
    )

      ?
      factor.Published_Display_Value

      :

      meaningful(
        factor.Interface_Language
      )

        ?
        factor.Interface_Language

        :
        "—";



  const evidenceIds =

    DB.factorEvidenceMap

      .filter(
        row =>
          row.Factor_ID ===
          factor.Factor_ID
      )

      .sort(
        (
          a,
          b
        ) =>

          Number(
            a.Sort_Order ||
            0
          )

          -

          Number(
            b.Sort_Order ||
            0
          )
      )

      .map(
        row =>
          row.Evidence_ID
      )

      .filter(
        Boolean
      );



  const primaryEvidence =

    factor.Primary_Evidence_ID

    ||

    evidenceIds[
      0
    ]

    ||

    "";



  const evidenceLink =

    primaryEvidence

      ?

      `evidence.html?q=${encodeURIComponent(
        primaryEvidence
      )}`

      :

      "evidence.html";



  return `

    <article class="detail-factor-card">


      <div class="factor-card-head">

        <span>
          ${esc(
            title
          )}
        </span>

        <small>
          ${esc(
            factor.Factor_ID
          )}
        </small>

      </div>


      <div class="factor-main-value">

        ${esc(
          displayValue
        )}

      </div>


      ${
        meaningful(
          factor.Applicability_Caveat
        )

          ?

          `

            <p class="factor-caveat">

              ${esc(
                factor.Applicability_Caveat
              )}

            </p>

          `

          :

          ""
      }


      <div class="factor-card-footer">

        <a
          href="${evidenceLink}"
        >
          View figures and evidence
        </a>

        <span>

          ${
            evidenceIds.length
          }

          evidence

        </span>

      </div>


    </article>

  `;

}



/* ==========================================================
   CASE STUDY
========================================================== */

function renderCaseStudy(
  caseItem
) {

  const sources =

    DB.caseSources

      .filter(
        source =>
          source.Case_ID ===
          caseItem.Case_ID
      )

      .sort(
        (
          a,
          b
        ) =>

          Number(
            a.Sort_Order ||
            0
          )

          -

          Number(
            b.Sort_Order ||
            0
          )
      );



  const sourceHtml =

    sources.length

      ?

      sources

        .map(
          source => {

            if (
              meaningful(
                source.Source_URL
              )
            ) {

              return `

                <a
                  href="${esc(
                    source.Source_URL
                  )}"
                  target="_blank"
                  rel="noopener noreferrer"
                >

                  ${esc(
                    source.Label ||
                    source.Source_Host ||
                    "Source"
                  )}

                </a>

              `;

            }


            return `

              <span>

                ${esc(
                  source.Label ||
                  source.Source_Host ||
                  "Source"
                )}

              </span>

            `;

          }
        )

        .join(
          '<span class="source-divider">·</span>'
        )

      :

      `

        <span>
          No source linked
        </span>

      `;



  return `

    <article class="case-study-card">


      <div class="case-study-top">

        <span class="case-badge">
          CASE
        </span>

        <span class="case-id">
          ${esc(
            caseItem.Case_ID
          )}
        </span>

      </div>


      <h3>

        ${esc(
          caseItem.Title ||
          "Case study"
        )}

      </h3>


      <div class="case-narrative">

        ${formatCaseNarrative(
          caseItem.Narrative
        )}

      </div>


      <div class="case-sources">

        ${sourceHtml}

      </div>


    </article>

  `;

}



/* ==========================================================
   FORMAT CASE NARRATIVE
========================================================== */

function formatCaseNarrative(
  narrative
) {

  if (
    !meaningful(
      narrative
    )
  ) {

    return `

      <p>
        No case narrative available.
      </p>

    `;

  }



  return clean(
    narrative
  )

    .split(
      /\r?\n/
    )

    .filter(
      line =>
        clean(
          line
        )
    )

    .map(
      line => {

        const safe =
          esc(
            line
          );


        if (
          line.length < 90

          &&
          (
            line.includes(
              ":"
            )

            ||

            line.includes(
              "–"
            )
          )
        ) {

          return `

            <strong class="case-subheading">

              ${safe}

            </strong>

          `;

        }


        return `

          <p>
            ${safe}
          </p>

        `;

      }
    )

    .join("");

}



/* ==========================================================
   FACTORS PAGE
========================================================== */

function initFactors() {

  const availability = [

    ...new Set(

      DB.factors

        .map(
          factor =>
            factor.Factor_Availability
        )

        .filter(
          Boolean
        )

    )

  ]
    .sort();



  fillSelect(
    "factorAvailability",
    availability
  );



  const factorSearch =
    $(
      "factorSearch"
    );


  if (
    factorSearch
  ) {

    let searchTimer;


    factorSearch
      .addEventListener(
        "input",
        () => {

          renderFactors();


          clearTimeout(
            searchTimer
          );


          searchTimer =
            setTimeout(
              () => {

                addSearchHistory(

                  "Factors",

                  factorSearch.value

                );

              },
              700
            );

        }
      );

  }



  if (
    $("factorType")
  ) {

    $("factorType")
      .addEventListener(
        "change",
        () => {

          renderFactors();


          addFilterHistory(

            "Factors",

            "Type",

            $("factorType")
              .value

          );

        }
      );

  }



  if (
    $("factorAvailability")
  ) {

    $("factorAvailability")
      .addEventListener(
        "change",
        () => {

          renderFactors();


          addFilterHistory(

            "Factors",

            "Availability",

            $("factorAvailability")
              .value

          );

        }
      );

  }



  renderFactors();

}



/* ==========================================================
   RENDER FACTORS
========================================================== */

function renderFactors() {

  const query =

    clean(
      $("factorSearch")
        ?.value
    )
      .toLowerCase();



  const type =

    $("factorType")
      ?.value ||
    "";


  const availability =

    $("factorAvailability")
      ?.value ||
    "";



  const rows =

    DB.factors

      .filter(
        factor => {

          const text =

            Object.values(
              factor
            )
              .join(
                " "
              )
              .toLowerCase();



          return (

            (
              !query ||
              text.includes(
                query
              )
            )

            &&

            (
              !type ||
              factor.__type ===
              type
            )

            &&

            (
              !availability ||

              factor
                .Factor_Availability ===
              availability
            )

          );

        }
      );



  if (
    $("factorSubtitle")
  ) {

    $("factorSubtitle")
      .textContent =

        `${rows.length} of ${DB.factors.length} factors`;

  }



  if (
    !$(
      "factorTable"
    )
  ) {

    return;

  }



  $("factorTable")
    .innerHTML =

      rows.length

        ?

        rows

          .map(
            factor => `

              <tr>

                <td>
                  ${esc(
                    factor.Factor_ID
                  )}
                </td>


                <td>
                  ${esc(
                    factor.Card_ID
                  )}
                </td>


                <td>

                  <span class="factor-type">

                    ${esc(
                      factor.__type
                    )}

                  </span>

                </td>


                <td>
                  ${esc(
                    factor.Factor_Name
                  )}
                </td>


                <td>

                  ${esc(

                    meaningful(
                      factor
                        .Published_Display_Value
                    )

                      ?
                      factor
                        .Published_Display_Value

                      :
                      "—"

                  )}

                </td>


                <td>
                  ${factorEvidenceCount(
                    factor.Factor_ID
                  )}
                </td>


                <td>

                  <span class="availability">

                    ${esc(

                      factor
                        .Factor_Availability

                      ||

                      factor
                        .Calc_Readiness

                      ||

                      "—"

                    )}

                  </span>

                </td>

              </tr>

            `
          )

          .join("")

        :

        `

          <tr>

            <td
              colspan="7"
              class="empty-cell"
            >
              No factors match the filters.
            </td>

          </tr>

        `;

}



/* ==========================================================
   EVIDENCE PAGE
========================================================== */

function initEvidence() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const queryFromUrl =
    clean(
      params.get(
        "q"
      )
    );



  if (
    queryFromUrl &&
    $("evidenceSearch")
  ) {

    $("evidenceSearch")
      .value =
        queryFromUrl;

  }



  const statuses = [

    ...new Set(

      DB.evidence

        .map(
          evidence =>
            evidence
              .Evidence_Status
        )

        .filter(
          Boolean
        )

    )

  ]
    .sort();



  fillSelect(
    "evidenceStatus",
    statuses
  );



  const evidenceSearch =
    $(
      "evidenceSearch"
    );


  if (
    evidenceSearch
  ) {

    let searchTimer;


    evidenceSearch
      .addEventListener(
        "input",
        () => {

          renderEvidence();


          clearTimeout(
            searchTimer
          );


          searchTimer =
            setTimeout(
              () => {

                addSearchHistory(

                  "Evidence",

                  evidenceSearch.value

                );

              },
              700
            );

        }
      );

  }



  if (
    $("evidenceStatus")
  ) {

    $("evidenceStatus")
      .addEventListener(
        "change",
        () => {

          renderEvidence();


          addFilterHistory(

            "Evidence",

            "Status",

            $("evidenceStatus")
              .value

          );

        }
      );

  }



  renderEvidence();

}



/* ==========================================================
   RENDER EVIDENCE
========================================================== */

function renderEvidence() {

  const query =

    clean(
      $("evidenceSearch")
        ?.value
    )
      .toLowerCase();



  const status =

    $("evidenceStatus")
      ?.value ||
    "";



  const rows =

    DB.evidence

      .filter(
        evidence => {

          const text =

            Object.values(
              evidence
            )
              .join(
                " "
              )
              .toLowerCase();



          return (

            (
              !query ||
              text.includes(
                query
              )
            )

            &&

            (
              !status ||
              evidence
                .Evidence_Status ===
              status
            )

          );

        }
      );



  if (
    $("evidenceSubtitle")
  ) {

    $("evidenceSubtitle")
      .textContent =

        `${rows.length} of ${DB.evidence.length} evidence records`;

  }



  if (
    !$(
      "evidenceTable"
    )
  ) {

    return;

  }



  $("evidenceTable")
    .innerHTML =

      rows.length

        ?

        rows

          .map(
            evidence => {

              const title =

                meaningful(
                  evidence.Source_URL
                )

                  ?

                  `

                    <a
                      class="source-link"
                      href="${esc(
                        evidence.Source_URL
                      )}"
                      target="_blank"
                      rel="noopener"
                    >

                      ${esc(
                        evidence.Source_Title ||
                        evidence.Evidence_ID
                      )}

                    </a>

                  `

                  :

                  esc(
                    evidence.Source_Title ||
                    "—"
                  );



              const upperStatus =

                clean(
                  evidence
                    .Evidence_Status
                )
                  .toUpperCase();



              const statusClass =

                upperStatus.includes(
                  "ACTIVE"
                )

                ||

                upperStatus.includes(
                  "COMPLETE"
                )

                  ?
                  "success"

                  :
                  "neutral";



              return `

                <tr>

                  <td>
                    ${esc(
                      evidence.Evidence_ID
                    )}
                  </td>


                  <td>
                    ${title}
                  </td>


                  <td>
                    ${esc(
                      evidence.Source_Organisation ||
                      "—"
                    )}
                  </td>


                  <td>
                    ${esc(
                      evidence.Locator ||
                      "—"
                    )}
                  </td>


                  <td>

                    <span class="pill ${statusClass}">

                      ${esc(
                        evidence.Evidence_Status ||
                        "—"
                      )}

                    </span>

                  </td>

                </tr>

              `;

            }
          )

          .join("")

        :

        `

          <tr>

            <td
              colspan="5"
              class="empty-cell"
            >
              No evidence records match the filters.
            </td>

          </tr>

        `;

}



/* ==========================================================
   PLAN PAGE
========================================================== */

function initPlan() {

  let step =
    1;


  const max =
    6;



  const render =
    () => {

      document

        .querySelectorAll(
          "[data-qpanel]"
        )

        .forEach(
          panel => {

            panel
              .classList
              .toggle(

                "active",

                Number(
                  panel
                    .dataset
                    .qpanel
                ) ===
                step

              );

          }
        );



      document

        .querySelectorAll(
          "[data-qstep]"
        )

        .forEach(
          button => {

            button
              .classList
              .toggle(

                "active",

                Number(
                  button
                    .dataset
                    .qstep
                ) ===
                step

              );

          }
        );



      if (
        $("prevStep")
      ) {

        $("prevStep")
          .style
          .visibility =

            step === 1

              ?
              "hidden"

              :
              "visible";

      }



      if (
        $("nextStep")
      ) {

        $("nextStep")
          .textContent =

            step === max

              ?
              "Finish"

              :
              "Continue";

      }

    };



  document

    .querySelectorAll(
      "[data-qstep]"
    )

    .forEach(
      button => {

        button.onclick =
          () => {

            step =
              Number(
                button
                  .dataset
                  .qstep
              );


            render();

          };

      }
    );



  if (
    $("nextStep")
  ) {

    $("nextStep")
      .onclick =
        () => {

          if (
            step <
            max
          ) {

            step++;

          }

          else {

            alert(
              "Questionnaire shell complete. Questionnaire source data can be wired into these steps later."
            );

          }


          render();

        };

  }



  if (
    $("prevStep")
  ) {

    $("prevStep")
      .onclick =
        () => {

          if (
            step >
            1
          ) {

            step--;

          }


          render();

        };

  }



  if (
    $("saveDraft")
  ) {

    $("saveDraft")
      .onclick =
        () => {

          const entries = [

            ...new FormData(
              $("planForm")
            )
              .entries()

          ];



          localStorage
            .setItem(

              "zcf_plan_draft",

              JSON.stringify(
                entries
              )

            );


          logActivity(

            "Plan",

            "SAVE DRAFT",

            "Climate action plan questionnaire"

          );


          alert(
            "Draft saved locally in this browser."
          );

        };

  }



  if (
    $("clearPlan")
  ) {

    $("clearPlan")
      .onclick =
        () => {

          $("planForm")
            .reset();


          localStorage
            .removeItem(
              "zcf_plan_draft"
            );


          logActivity(

            "Plan",

            "CLEAR",

            "Questionnaire answers cleared"

          );

        };

  }


  render();

}



/* ==========================================================
   PROGRESS PAGE
========================================================== */

function initProgress() {

  const getRecords =
    () => {

      try {

        return JSON.parse(

          localStorage
            .getItem(
              "zcf_progress_imports"
            )

          ||
          "[]"

        );

      }

      catch {

        return [];

      }

    };



  const render =
    () => {

      const rows =
        getRecords();



      if (
        $("pRows")
      ) {

        $("pRows")
          .textContent =

            rows.reduce(

              (
                total,
                row
              ) =>

                total +
                (
                  row.rows ||
                  0
                ),

              0

            );

      }



      if (
        $("uploadRecord")
      ) {

        $("uploadRecord")
          .innerHTML =

            rows.length

              ?

              rows

                .map(
                  row => `

                    <tr>

                      <td>
                        ${esc(
                          row.when
                        )}
                      </td>

                      <td>
                        ${esc(
                          row.kind
                        )}
                      </td>

                      <td>
                        ${esc(
                          row.file
                        )}
                      </td>

                      <td>
                        ${row.rows}
                      </td>

                      <td>
                        ${row.cols}
                      </td>

                      <td>
                        ${esc(
                          row.notes
                        )}
                      </td>

                    </tr>

                  `
                )

                .join("")

              :

              `

                <tr>

                  <td
                    colspan="6"
                    class="empty-cell"
                  >
                    No imports yet.
                  </td>

                </tr>

              `;

      }

    };



  async function inspect(
    save
  ) {

    const file =
      $("progressFile")
        ?.files[
          0
        ];


    if (
      !file
    ) {

      alert(
        "Choose a CSV first."
      );


      return;

    }



    const parsed =
      parseCSV(
        await file.text()
      );



    const record = {

      when:
        new Date()
          .toLocaleString(),

      kind:
        save
          ?
          "Import"
          :
          "Dry run",

      file:
        file.name,

      rows:
        Math.max(
          0,
          parsed.length -
          1
        ),

      cols:
        parsed[
          0
        ]
          ?.length ||
        0,

      notes:
        "Local browser prototype"

    };



    if (
      save
    ) {

      const records =
        getRecords();


      records.unshift(
        record
      );


      localStorage
        .setItem(

          "zcf_progress_imports",

          JSON.stringify(
            records.slice(
              0,
              30
            )
          )

        );


      logActivity(

        "Progress",

        "IMPORT",

        `${record.file} · ${record.rows} rows`

      );


      render();

    }

    else {

      logActivity(

        "Progress",

        "DRY RUN",

        `${record.file} · ${record.rows} rows`

      );


      alert(

        `Dry run: ${record.rows} rows and ${record.cols} columns detected.`

      );

    }

  }



  if (
    $("dryRun")
  ) {

    $("dryRun")
      .onclick =
        () =>
          inspect(
            false
          );

  }



  if (
    $("importAnswers")
  ) {

    $("importAnswers")
      .onclick =
        () =>
          inspect(
            true
          );

  }



  if (
    $("clearHistory")
  ) {

    $("clearHistory")
      .onclick =
        () => {

          if (
            $("clearConfirm")
              .value ===
            "CLEAR"
          ) {

            localStorage
              .removeItem(
                "zcf_progress_imports"
              );


            $("clearConfirm")
              .value =
                "";


            logActivity(

              "Progress",

              "CLEAR",

              "Historical import records cleared"

            );


            render();

          }

          else {

            alert(
              "Type CLEAR to confirm."
            );

          }

        };

  }


  render();

}



/* ==========================================================
   MEMBER PLAN
========================================================== */

function initMember() {

  if (
    $("continueMember")
  ) {

    $("continueMember")
      .onclick =
        () => {

          const id =
            clean(
              $("companyId")
                .value
            );


          if (
            id !==
            "9990000001"
          ) {

            $("memberError")
              .textContent =
                "Use demo Company ID 9990000001 for this prototype.";


            return;

          }



          $("memberError")
            .textContent =
              "";


          $("memberResult")
            .classList
            .remove(
              "hidden"
            );


          $("memberResult")
            .scrollIntoView({
              behavior:
                "smooth"
            });


          logActivity(

            "Member",

            "OPEN",

            "Demo Pub Co. · 9990000001"

          );

        };

  }

}



/* ==========================================================
   CLEAR ALL LOCAL HISTORY
========================================================== */

if (
  $("clearActivity")
) {

  $("clearActivity")
    .onclick =
      () => {

        localStorage
          .removeItem(
            "zcf_activity"
          );


        localStorage
          .removeItem(
            "zcf_search_history"
          );


        localStorage
          .removeItem(
            "zcf_recently_viewed"
          );


        renderActivity();

      };

}



/* ==========================================================
   REFRESH BUTTON
========================================================== */

if (
  $("refreshData")
) {

  $("refreshData")
    .onclick =
      loadAll;

}



/* ==========================================================
   START
========================================================== */

activeNav();

loadAll();
