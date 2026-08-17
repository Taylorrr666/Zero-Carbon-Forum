const initiatives = [

  {
    "Sub Topic": "Governance",

    "Initiative":
      "Allocate responsibility for sustainability at Board level",

    "Sub-Sector included":
      "All sub-sectors",

    "Sub-Sector Excluded":
      "",

    "Description":
      "Assign clear Board-level accountability for sustainability and climate-related performance.",

    "Why/Benefit":
      "Board-level accountability strengthens governance and ensures sustainability considerations are incorporated into strategic decision-making.",

    "How to achieve this":
      "Nominate a Board member or executive sponsor with clearly defined responsibilities for climate and sustainability performance. Establish regular reporting to the Board.",

    "KPI (Measurable Objective)":
      "Named Board-level sustainability lead and defined reporting frequency.",

    "Evidence/Case Study":
      "Board oversight of sustainability is increasingly incorporated into corporate governance structures.",

    "Evidence Reference":
      "",

    "Cost Saving/Cost ":
      "Low",

    "Carbon Abatement Potential":
      "Indirect / Enabling",

    "Time to implement/ROI":
      "Short term",

    "Efficiency/Impact measure":
      "Frequency of sustainability reporting to Board."
  },


  {
    "Sub Topic": "Governance",

    "Initiative":
      "Establish a Sustainability Committee",

    "Sub-Sector included":
      "All sub-sectors",

    "Sub-Sector Excluded":
      "",

    "Description":
      "Create a cross-functional committee responsible for coordinating sustainability strategy and implementation.",

    "Why/Benefit":
      "A dedicated committee helps align sustainability activities across finance, operations, procurement, property and other business functions.",

    "How to achieve this":
      "Identify representatives from relevant departments, define responsibilities, establish meeting frequency and create a mechanism for escalating key issues.",

    "KPI (Measurable Objective)":
      "Committee established and regular meetings held.",

    "Evidence/Case Study":
      "Cross-functional governance structures can improve coordination of sustainability initiatives.",

    "Evidence Reference":
      "",

    "Cost Saving/Cost ":
      "Low",

    "Carbon Abatement Potential":
      "Indirect / Enabling",

    "Time to implement/ROI":
      "Short term",

    "Efficiency/Impact measure":
      "Number of sustainability actions coordinated across functions."
  },


  {
    "Sub Topic": "Strategy",

    "Initiative":
      "Integrate sustainability into corporate strategy",

    "Sub-Sector included":
      "All sub-sectors",

    "Sub-Sector Excluded":
      "",

    "Description":
      "Embed climate and sustainability priorities within the organisation's wider business strategy.",

    "Why/Benefit":
      "Integration helps ensure that sustainability priorities influence capital allocation, operational planning and long-term decision-making.",

    "How to achieve this":
      "Review existing business objectives and identify where climate and sustainability priorities can be incorporated into strategic plans, budgets and performance management.",

    "KPI (Measurable Objective)":
      "Sustainability objectives incorporated into annual corporate strategy.",

    "Evidence/Case Study":
      "Companies increasingly integrate climate-related targets into strategic planning and governance processes.",

    "Evidence Reference":
      "",

    "Cost Saving/Cost ":
      "Low",

    "Carbon Abatement Potential":
      "High enabling potential",

    "Time to implement/ROI":
      "Medium term",

    "Efficiency/Impact measure":
      "Percentage of strategic objectives linked to sustainability outcomes."
  },


  {
    "Sub Topic": "Governance",

    "Initiative":
      "Link executive remuneration to sustainability and climate performance",

    "Sub-Sector included":
      "All sub-sectors",

    "Sub-Sector Excluded":
      "",

    "Description":
      "Include sustainability and climate performance indicators within executive remuneration structures.",

    "Why/Benefit":
      "Linking incentives with sustainability outcomes can strengthen management accountability and encourage delivery against climate targets.",

    "How to achieve this":
      "Select measurable sustainability KPIs, establish appropriate performance thresholds and integrate them into annual or long-term executive incentive schemes.",

    "KPI (Measurable Objective)":
      "Percentage of executive variable remuneration linked to sustainability KPIs.",

    "Evidence/Case Study":
      "A growing number of listed companies incorporate ESG or climate metrics into executive incentive frameworks.",

    "Evidence Reference":
      "",

    "Cost Saving/Cost ":
      "Low",

    "Carbon Abatement Potential":
      "Indirect / Enabling",

    "Time to implement/ROI":
      "Medium term",

    "Efficiency/Impact measure":
      "Achievement rate of sustainability-linked remuneration targets."
  },


  {
    "Sub Topic": "Strategy",

    "Initiative":
      "Conduct regular climate risk and opportunity assessments",

    "Sub-Sector included":
      "All sub-sectors",

    "Sub-Sector Excluded":
      "",

    "Description":
      "Assess material physical and transition climate risks and identify associated strategic opportunities.",

    "Why/Benefit":
      "Climate risk assessment supports resilience planning, investment decisions and identification of emerging commercial opportunities.",

    "How to achieve this":
      "Identify key physical and transition risks, assess exposure across operations and supply chains, prioritise material risks and integrate findings into risk management.",

    "KPI (Measurable Objective)":
      "Climate risk assessment completed and reviewed at least annually.",

    "Evidence/Case Study":
      "Climate risk assessments are increasingly aligned with sustainability disclosure and enterprise risk management processes.",

    "Evidence Reference":
      "",

    "Cost Saving/Cost ":
      "Low to Medium",

    "Carbon Abatement Potential":
      "Indirect",

    "Time to implement/ROI":
      "Medium term",

    "Efficiency/Impact measure":
      "Number of material risks identified with mitigation actions."
  }

];



const grid =
  document.getElementById(
    "initiativeGrid"
  );


const searchInput =
  document.getElementById(
    "searchInput"
  );


const topicFilter =
  document.getElementById(
    "topicFilter"
  );


const sectorFilter =
  document.getElementById(
    "sectorFilter"
  );


const resultCount =
  document.getElementById(
    "resultCount"
  );



function escapeHTML(value) {

  return String(value || "")

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll(
      "'",
      "&#039;"
    );

}



function linkifyEvidence(value) {

  if (!value) {
    return "Not provided";
  }


  const escaped =
    escapeHTML(value);


  return escaped.replace(

    /(https?:\/\/[^\s;]+)/g,

    '<a class="evidence-link" href="$1" target="_blank" rel="noopener noreferrer">$1</a>'

  );

}



function compact(
  value,
  fallback = "Not specified"
) {

  return value &&
    value.trim()

    ? value.trim()

    : fallback;

}



function populateFilters() {


  const topics = [

    ...new Set(

      initiatives

        .map(
          item =>
            item["Sub Topic"]
        )

        .filter(Boolean)

    )

  ].sort();



  topics.forEach(
    topic => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        topic;


      option.textContent =
        topic;


      topicFilter.appendChild(
        option
      );

    }
  );



  const sectors = [

    ...new Set(

      initiatives

        .map(
          item =>
            item[
              "Sub-Sector included"
            ]
        )

        .filter(Boolean)

    )

  ].sort();



  sectors.forEach(
    sector => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        sector;


      option.textContent =
        sector;


      sectorFilter.appendChild(
        option
      );

    }
  );

}



function cardTemplate(
  item,
  index
) {


  const topic =
    compact(
      item["Sub Topic"]
    );


  const initiative =
    compact(
      item["Initiative"]
    );


  const description =
    compact(
      item["Description"]
    );


  const included =
    compact(
      item[
        "Sub-Sector included"
      ]
    );


  const cost =
    compact(
      item[
        "Cost Saving/Cost "
      ]
    );


  const carbon =
    compact(
      item[
        "Carbon Abatement Potential"
      ]
    );



  return `

    <article
      class="initiative-card"
      data-card="${index}"
    >


      <div class="initiative-summary">


        <div class="card-topline">

          <span class="topic-pill">
            ${escapeHTML(topic)}
          </span>

        </div>


        <h3>
          ${escapeHTML(
            initiative
          )}
        </h3>


        <p class="description">
          ${escapeHTML(
            description
          )}
        </p>



        <div class="quick-facts">


          <div class="fact">

            <span class="fact-label">
              Sector
            </span>

            <span class="fact-value">
              ${escapeHTML(
                included
              )}
            </span>

          </div>


          <div class="fact">

            <span class="fact-label">
              Carbon impact
            </span>

            <span class="fact-value">
              ${escapeHTML(
                carbon
              )}
            </span>

          </div>


        </div>

      </div>



      <button
        class="details-button"
        type="button"
        onclick="toggleCard(
          ${index},
          this
        )"
      >

        View full initiative ↓

      </button>



      <div class="initiative-details">


        <div class="detail-block">

          <h4>
            Why / Benefit
          </h4>

          <p>
            ${escapeHTML(
              compact(
                item["Why/Benefit"]
              )
            )}
          </p>

        </div>



        <div class="detail-block">

          <h4>
            How to achieve this
          </h4>

          <p>
            ${escapeHTML(
              compact(
                item[
                  "How to achieve this"
                ]
              )
            )}
          </p>

        </div>



        <div class="detail-block">

          <h4>
            Measurable KPI
          </h4>

          <p>
            ${escapeHTML(
              compact(
                item[
                  "KPI (Measurable Objective)"
                ]
              )
            )}
          </p>

        </div>



        <div class="detail-block">

          <h4>
            Evidence / Case Study
          </h4>

          <p>
            ${escapeHTML(
              compact(
                item[
                  "Evidence/Case Study"
                ]
              )
            )}
          </p>

        </div>



        <div class="detail-block">

          <h4>
            Evidence Reference
          </h4>

          <p>
            ${linkifyEvidence(
              item[
                "Evidence Reference"
              ]
            )}
          </p>

        </div>



        <div class="detail-block">

          <h4>
            Cost / Cost Saving
          </h4>

          <p>
            ${escapeHTML(
              cost
            )}
          </p>

        </div>



        <div class="detail-block">

          <h4>
            Carbon Abatement Potential
          </h4>

          <p>
            ${escapeHTML(
              carbon
            )}
          </p>

        </div>



        <div class="detail-block">

          <h4>
            Time to Implement / ROI
          </h4>

          <p>
            ${escapeHTML(
              compact(
                item[
                  "Time to implement/ROI"
                ]
              )
            )}
          </p>

        </div>



        <div class="detail-block">

          <h4>
            Efficiency / Impact Measure
          </h4>

          <p>
            ${escapeHTML(
              compact(
                item[
                  "Efficiency/Impact measure"
                ]
              )
            )}
          </p>

        </div>



        <div class="detail-block">

          <h4>
            Excluded Sector(s)
          </h4>

          <p>
            ${escapeHTML(

              compact(

                item[
                  "Sub-Sector Excluded"
                ],

                "None specified"

              )

            )}
          </p>

        </div>


      </div>


    </article>

  `;

}



function toggleCard(
  index,
  button
) {


  const card =
    document.querySelector(
      `[data-card="${index}"]`
    );


  const isOpen =
    card.classList.toggle(
      "open"
    );


  button.textContent =
    isOpen

      ? "Hide full initiative ↑"

      : "View full initiative ↓";

}



function render() {


  const query =
    searchInput.value
      .trim()
      .toLowerCase();


  const selectedTopic =
    topicFilter.value;


  const selectedSector =
    sectorFilter.value;



  const filtered =
    initiatives.filter(
      item => {


        const searchable =
          Object
            .values(item)
            .join(" ")
            .toLowerCase();



        const matchesSearch =
          !query ||
          searchable.includes(
            query
          );



        const matchesTopic =
          !selectedTopic ||
          item[
            "Sub Topic"
          ] ===
          selectedTopic;



        const matchesSector =
          !selectedSector ||
          item[
            "Sub-Sector included"
          ] ===
          selectedSector;



        return (
          matchesSearch &&
          matchesTopic &&
          matchesSector
        );

      }
    );



  resultCount.textContent =

    `${filtered.length} initiative${

      filtered.length === 1
        ? ""
        : "s"

    } found`;



  if (
    !filtered.length
  ) {


    grid.innerHTML = `

      <div class="empty-state">

        No initiatives match your
        current search and filters.

      </div>

    `;


    return;

  }



  grid.innerHTML =

    filtered

      .map(
        (item, index) =>
          cardTemplate(
            item,
            index
          )
      )

      .join("");

}



searchInput.addEventListener(
  "input",
  render
);


topicFilter.addEventListener(
  "change",
  render
);


sectorFilter.addEventListener(
  "change",
  render
);



populateFilters();

render();
