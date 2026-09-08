/**
 * The four marketing blocks that used to be hard-coded in
 * str-frontend/lib/data.js with no way to edit them without a deploy.
 *
 * Every value here is lifted VERBATIM from that file, so seeding this
 * collection changes nothing visible on the site — it only moves the same copy
 * behind /admin/site-content. If a string here differs from the one in
 * lib/data.js, the difference will show up as a silent content change the
 * first time the API is reachable, so keep them identical until the fallback
 * is retired.
 *
 * Keys must match the SiteContent enum exactly:
 * metrics · faqs · process · capabilities
 *
 * Written by upsert on `key`, so re-running the seed refreshes these rows in
 * place and can never duplicate them.
 *
 * ⚑ The metrics below are marketing claims, not derived figures — the same
 * numbers appear in the /about copy and masthead. lib/data.js already carries
 * that warning; moving them into the database does not resolve it, it just
 * means a non-developer can now change one of the three places independently.
 */

export const siteContent = [
  {
    key: "metrics",
    items: [
      { value: 2, suffix: "", label: "Years building", note: "Since 2024" },
      { value: 200, suffix: "+", label: "Projects delivered", note: "Across 6 industries" },
      {
        value: 50,
        suffix: "+",
        label: "People on the floor",
        note: "Engineering, design, production",
      },
      { value: 7, suffix: "", label: "Countries served", note: "BD · UK · US · AU · EU" },
    ],
  },

  {
    key: "faqs",
    items: [
      {
        category: "General",
        q: "How do you price a project?",
        a: "Fixed price after a paid discovery week, or a monthly rate for a dedicated squad. We do not quote a build price off a one-paragraph brief. Every time we have, one of us has regretted it.",
      },
      {
        category: "Process",
        q: "What does a typical timeline look like?",
        a: "A marketing site is four to eight weeks. A custom platform is eight to twenty. Visualization and post-production run on a days-not-weeks SLA. Discovery gives you a date, not a range.",
      },
      {
        category: "General",
        q: "Do you work with clients outside Bangladesh?",
        a: "About half our work is. We overlap with UK and EU mornings and with US evenings, and every project runs in English with written weekly status.",
      },
      {
        category: "Tech",
        q: "Who owns the code and the design files?",
        a: "You do, on final payment. Repository, Figma file, assets, and the deployment account. We do not hold infrastructure hostage as a retention strategy.",
      },
      {
        category: "Tech",
        q: "Can you take over a project someone else started?",
        a: "Yes, after an audit. The audit is chargeable and occasionally ends with us advising you not to continue. That is a legitimate outcome.",
      },
      {
        category: "Process",
        q: "What happens after launch?",
        a: "Thirty days of warranty support is included. After that, a support retainer is optional and priced by response time, not by hours banked.",
      },
    ],
  },

  {
    key: "process",
    items: [
      {
        index: "01",
        title: "Scope",
        body: "A paid discovery week. We map the actual workflow, name the constraints, and write down what success is measured by. Nobody signs a build estimate before this exists.",
        output: "Scope document · route map · fixed estimate",
      },
      {
        index: "02",
        title: "Design",
        body: "Flows, then screens, then a component library with every state drawn. Reviewed against real content, never lorem ipsum.",
        output: "Figma system · prototype · tokens",
      },
      {
        index: "03",
        title: "Build",
        body: "Two-week cycles with a working deployment at the end of each. You see the real thing on a real URL, not a screenshot in a status email.",
        output: "Preview deploys · weekly demo · CI",
      },
      {
        index: "04",
        title: "Handover",
        body: "Documentation, an admin walkthrough recorded to video, and thirty days of warranty support. Then a retainer only if you want one.",
        output: "Docs · training · 30-day warranty",
      },
    ],
  },

  {
    key: "capabilities",
    items: [
      {
        title: "Architecture reviews",
        body: "For teams who already have a codebase and a problem with it.",
      },
      {
        title: "Dedicated squads",
        body: "Two to six people embedded with your team on a rolling monthly basis.",
      },
      {
        title: "Production overflow",
        body: "Retouching and visualization capacity when your in-house queue is full.",
      },
      {
        title: "Rescue engagements",
        body: "Half-finished projects, absent original developers. It is more common than anyone admits.",
      },
    ],
  },

];

export default siteContent;
