/**
 * The marketing blocks that were hard-coded in the frontend with no way to
 * edit them without a deploy.
 *
 * ⚑ str-frontend/lib/data.js IS GONE, and so is the fallback that read it.
 * This file is no longer "a copy of the static content" — it is the ONLY
 * source of these blocks. An unseeded database now means a homepage with no
 * metrics band, no FAQ and no logo rail, rather than one quietly serving old
 * copy. Run `npm run seed` against every environment, including production,
 * before pointing a frontend at it.
 *
 * Keys must match the SiteContent enum exactly:
 * metrics · faqs · process · capabilities · partners
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

  /**
   * Client logos. Lifted verbatim from the `partners` export that used to live
   * in str-frontend/lib/site.js, which EcosystemBand and /about both read
   * directly — adding a client meant a developer and a deploy.
   *
   * `logo` points at /public on the Next app, not at /uploads, because these
   * eight files are already committed there and the frontend's mediaUrl()
   * leaves a non-/uploads path alone. A logo replaced from /admin/site-content
   * is uploaded to the API and stored as /uploads/partners/... instead; both
   * shapes render, so there is no migration to do.
   *
   * ⚑ `work` and `sector` are reconstructed from each client's line of
   * business rather than taken from a contract. That warning travelled with
   * this data in lib/site.js and it still applies: confirm every label with
   * the account owner before launch, because a wrong project label under a
   * real client's logo is worse than no label at all.
   */
  {
    key: "partners",
    items: [
      {
        name: "AECL",
        logo: "/logo/partners/aecl-logo.png",
        sector: "Construction",
        work: "Project control dashboard",
      },
      {
        name: "Bay Developments",
        logo: "/logo/partners/bay-logo.png",
        sector: "Real estate",
        work: "Property sales portal",
      },
      {
        name: "GSP",
        logo: "/logo/partners/gsp-logo.png",
        sector: "Logistics",
        work: "Shipment tracking suite",
      },
      {
        name: "Daily Inqilab",
        logo: "/logo/partners/inqilab-logo.png",
        sector: "Media",
        work: "News publishing platform",
      },
      {
        name: "MH Group",
        logo: "/logo/partners/mhgroup-logo.png",
        sector: "Conglomerate",
        work: "Group intranet & HRM",
      },
      {
        name: "Ramy",
        logo: "/logo/partners/ramy-logo.png",
        sector: "Retail",
        work: "E-commerce storefront",
      },
      {
        name: "Vertex",
        logo: "/logo/partners/vertex-logo.png",
        sector: "Technology",
        work: "Brand system & website",
      },
      {
        name: "Wintex",
        logo: "/logo/partners/wintex-logo.png",
        sector: "Garments export",
        work: "Export ERP",
      },
    ],
  },
];

export default siteContent;
