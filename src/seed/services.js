/**
 * Service catalogue — 9 disciplines.
 *
 * Slugs are produced by utils/slug.js (slugify with "/" normalised to a
 * separator first) and are repeated here explicitly because the seeder uses
 * them as its idempotency key. They must stay identical to what the model
 * would derive from `title`, or the seed creates a second row on its next run;
 * scripts/seed.js asserts exactly that before writing.
 *
 * `image` is intentionally empty. Artwork is uploaded per service from
 * /admin/services and stored as a path under /uploads/services, so seeding a
 * placeholder here would overwrite a real upload on the next `npm run seed`.
 * `imageAlt` follows the same rule.
 *
 * ── COPY RULES FOR THIS FILE ─────────────────────────────────────────────
 * No dash characters anywhere in the prose: no em dash, no en dash, and no
 * hyphenated compounds. Write "role based", "off the shelf", "4 to 8 weeks".
 * The reason is editorial rather than technical, and it is easy to undo by
 * accident, so anything added here should be checked against it.
 */

export const services = [
  {
    title: "Website Development",
    slug: "website-development",
    shortDescription:
      "Corporate sites, commerce platforms and booking systems built on Next.js, tuned to load fast on a mid range Android phone and not only on a designer's laptop.",
    detailedOverview:
      "<p>We build the web layer a company actually runs on: the storefront customers buy from, the booking flow that takes the payment, the internal tool an operations team lives inside for eight hours a day. Most of it ships on Next.js with a Node.js and Express core, MongoDB behind it, and server rendering wherever search visibility matters.</p>\n<p>The part clients notice six months later is the unglamorous part. A documented API contract, seeded environments, a rollback that takes one command, and a content model an editor can work in without calling a developer. That is what keeps a site maintainable after the launch team has moved on.</p>\n<h3>How an engagement usually runs</h3>\n<ul><li>Week one: audit, content model and a clickable route map</li><li>Weeks two to five: component library first, then pages against real data</li><li>Final week: performance budget, accessibility pass, analytics and handover</li></ul>",
    image: "",
    imageAlt: "",
    featuresList: [
      "Next.js App Router with server components and streamed routes",
      "Custom admin dashboard, or a headless CMS if your team prefers one",
      "Core Web Vitals budget agreed in writing before the build starts",
      "WCAG 2.2 AA keyboard and screen reader passes",
      "Structured data, sitemaps and metadata on every route",
      "Continuous integration with a preview deployment per branch",
    ],
    deliverableTimeline: "4 to 8 weeks",
    order: 1,
    isActive: true,
  },

  {
    title: "Software Development",
    slug: "software-development",
    shortDescription:
      "ERP modules, logistics tooling and SaaS backends for teams whose daily process no packaged product actually fits.",
    detailedOverview:
      "<p>Packaged software fails in the same place every time. The one workflow that makes the business money is the one the vendor never modelled, so the team ends up running it in a spreadsheet beside the system they paid for. We build that workflow properly and integrate the rest rather than rebuilding it.</p>\n<p>The architecture stays deliberately boring. A modular Express service with business logic kept away from routing, MongoDB aggregation pipelines instead of queries inside loops, JSON Web Tokens with rotating refresh tokens, and rate limiting at the edge. Boring is what survives a change of team.</p>\n<h3>What we insist on</h3>\n<ul><li>Domain modelling sessions with the people who do the work, before any code</li><li>A migration path off whatever you run today, spreadsheets included</li><li>Load testing against an agreed concurrency target before launch</li></ul>",
    image: "",
    imageAlt: "",
    featuresList: [
      "Domain modelling workshops with the operators, not only the managers",
      "Modular service structure with business logic isolated from routing",
      "Role based access control with an audit trail on every write",
      "Reporting through aggregation pipelines, not client side arithmetic",
      "Integrations for ERP, SMS, payment gateways and courier APIs",
      "Load tested to an agreed concurrency target before go live",
      "Runbook and a handover session for your own engineers",
    ],
    deliverableTimeline: "8 to 20 weeks",
    order: 2,
    isActive: true,
  },

  {
    title: "Business & IT Consultancy",
    slug: "business-and-it-consultancy",
    shortDescription:
      "Technology audit, architecture review and a costed roadmap, so the next budget goes into the system that is actually holding the business back.",
    detailedOverview:
      "<p>Most technology spending in a growing company is decided under pressure, and the result is four tools that overlap, two nobody logs into, and one critical process held together by a single person's memory. We map what exists, then write down what it costs to keep running.</p>\n<p>The output is a document a non technical board can read and a technical team can act on: current state, risks ranked by what they would cost if they landed, and a sequenced roadmap with a price against every step. We are perfectly happy for the conclusion to be that you need less software rather than more.</p>\n<h3>Why clients usually call</h3>\n<ul><li>A system is slow or falling over and nobody agrees on the cause</li><li>A vendor quote has arrived and it needs an independent second opinion</li><li>A funding round or an audit needs the stack documented properly</li></ul>",
    image: "",
    imageAlt: "",
    featuresList: [
      "Current state audit of systems, integrations and licence spend",
      "Architecture and code review with findings ranked by business risk",
      "Build versus buy analysis with real numbers on both sides",
      "Security and access review across accounts, servers and databases",
      "Sequenced roadmap with cost and effort against every step",
      "Vendor quote review and technical due diligence",
    ],
    deliverableTimeline: "2 to 6 weeks",
    order: 3,
    isActive: true,
  },

  {
    title: "Graphic Design",
    slug: "graphic-design",
    shortDescription:
      "Brand identity, campaign collateral and high volume product image production, with every batch through a quality check before it leaves the studio.",
    detailedOverview:
      "<p>Two kinds of work happen here and they run on different rhythms. Identity and campaign design is studio work: research, routes, refinement, and a brand guide the next agency can actually follow. Product image production is a line: hundreds or thousands of files a week, moving on a schedule with a named coordinator against it.</p>\n<p>On the production side the craft is in what nobody sees. Hand drawn clipping paths rather than automatic selection, channel based masking for hair, fur and glass, colour matched to your physical reference instead of to a screen, and shadow work that keeps a product sitting on a surface rather than floating above it.</p>",
    image: "",
    imageAlt: "",
    featuresList: [
      "Logo and identity systems delivered with a written brand guide",
      "Social, print and packaging collateral in production ready files",
      "Hand drawn clipping paths on every cutout",
      "Image masking for hair, fur, glass and translucent fabric",
      "Skin, product and jewellery retouching",
      "Invisible mannequin composites for apparel catalogues",
      "Natural shadows, drop shadows and reflection rebuilds",
      "Batch resizing and exports to each marketplace specification",
    ],
    deliverableTimeline: "24 to 72 hour turnaround",
    order: 4,
    isActive: true,
  },

  {
    title: "Digital Marketing",
    slug: "digital-marketing",
    shortDescription:
      "Technical SEO, paid social and reporting that ties spend to qualified pipeline rather than to impressions.",
    detailedOverview:
      "<p>We start with the audit nobody enjoys reading: crawl errors, index bloat, thin pages competing against each other, and a Core Web Vitals score quietly costing you positions you already earned. Fixing that is usually cheaper than the campaign somebody wanted to run instead.</p>\n<p>Campaigns come after, on Meta and Google, with conversion tracking wired to real events rather than to page views. Reporting is a dashboard you open yourself, and the headline number is cost per qualified lead. Reach and impressions stay off it, because no invoice was ever paid with an impression.</p>",
    image: "",
    imageAlt: "",
    featuresList: [
      "Full technical SEO audit with a prioritised fix list",
      "Keyword and search intent mapping against the offers you actually sell",
      "On page optimisation and structured data implementation",
      "Meta and Google campaign build, creative testing and management",
      "Server side conversion tracking that survives ad blockers",
      "Monthly reporting against pipeline, with the raw data included",
    ],
    deliverableTimeline: "Monthly retainer",
    order: 5,
    isActive: true,
  },

  {
    title: "Data Science & Analytics",
    slug: "data-science-and-analytics",
    shortDescription:
      "Warehouse modelling, forecasting and decision dashboards, so meetings argue about the decision instead of about whose number is correct.",
    detailedOverview:
      "<p>Analytics work usually fails for an unglamorous reason: the same metric is calculated three ways in three tools, so every meeting opens by reconciling numbers. The first thing we build is a modelled layer with one definition per metric, documented, versioned and owned by somebody.</p>\n<p>On top of that sits the part people asked for. Demand and inventory forecasting, customer segmentation and churn scoring, anomaly alerts that reach a human before a customer notices, and dashboards built for a decision rather than for a screenshot.</p>\n<h3>How we work</h3>\n<ul><li>Start from the decision, then work backwards to the data it needs</li><li>Ship one modelled metric end to end before modelling forty</li><li>Hand over the pipeline and the notebooks, not only the chart</li></ul>",
    image: "",
    imageAlt: "",
    featuresList: [
      "Warehouse modelling with one documented definition per metric",
      "Pipelines from your live systems, scheduled and monitored",
      "Forecasting for demand, inventory and revenue",
      "Customer segmentation, cohort analysis and churn scoring",
      "Anomaly detection with alerting that reaches a person",
      "Dashboards in Power BI, Looker Studio or a custom React build",
    ],
    deliverableTimeline: "6 to 12 weeks",
    order: 6,
    isActive: true,
  },

  {
    title: "2D/3D Design & Animation",
    slug: "2d-3d-design-and-animation",
    shortDescription:
      "Floor plans, architectural renders, product visualisation and motion graphics for property developers, manufacturers and campaign teams.",
    detailedOverview:
      "<p>Drawings a buyer understands in four seconds and an architect does not have to correct. We work from CAD files, a PDF or a hand sketch, and return coloured 2D plans, textured 3D floor plans, interior and exterior stills, and animated walkthroughs that hold up on a phone screen as well as on a sales floor display.</p>\n<p>Product and motion work runs the same way. Turntables and exploded views for manufacturers, explainer animation for campaigns, and every deliverable exported at both listing size and print size, so nobody on the marketing team is exporting files again at eleven at night.</p>",
    image: "",
    imageAlt: "",
    featuresList: [
      "Monochrome and full colour 2D floor plans",
      "Textured 3D floor plans, single unit and full development",
      "Photoreal interior and exterior stills with lighting studies",
      "Product rendering, turntables and exploded views",
      "Animated walkthroughs and camera flythroughs",
      "Character design, rigging and 2D motion graphics",
      "Listing size and print size exports of every deliverable",
    ],
    deliverableTimeline: "3 to 10 working days",
    order: 7,
    isActive: true,
  },

  {
    title: "Dashboard Development",
    slug: "dashboard-development",
    shortDescription:
      "Admin panels and operations consoles with role based access, audit trails and aggregation backed reporting that stays fast as the data grows.",
    detailedOverview:
      "<p>A dashboard is the screen a business actually spends its day in, and it is usually the screen nobody designed. We treat it as a product. The five things a user does a hundred times a day take one click, bulk actions exist, and nothing important hides behind a modal inside another modal.</p>\n<p>Underneath, every table paginates and filters on the server, every summary tile comes from an aggregation pipeline rather than from pulling ten thousand rows into the browser, and every destructive action is logged with who did it and when. That is the difference between a dashboard that feels fine in a demo and one that still feels fine at two million records.</p>",
    image: "",
    imageAlt: "",
    featuresList: [
      "Role and permission model designed with you before any screen",
      "Server side pagination, filtering and search on every table",
      "Summary tiles and charts driven by aggregation pipelines",
      "Audit log on every create, update and delete",
      "Bulk actions, CSV export and saved views",
      "Optimistic updates with a rollback when the server disagrees",
      "Light and dark themes, with keyboard navigation throughout",
    ],
    deliverableTimeline: "5 to 10 weeks",
    order: 8,
    isActive: true,
  },

  {
    title: "Mobile App Development",
    slug: "mobile-app-development",
    shortDescription:
      "Cross platform apps in React Native and Flutter, shipped through both stores with the release process written down for your own team.",
    detailedOverview:
      "<p>One codebase, two stores, and a release checklist your team can run without calling us. The work that stalls most mobile projects is handled as part of the build rather than discovered at the end: signing and provisioning, store metadata and screenshots, staged rollout, and crash reporting wired up from the first internal build.</p>\n<p>Offline first is the default assumption for this market. The app has to stay usable through a dead spot on the way home and reconcile cleanly when the connection returns, which is a data design decision made on day one and very expensive to retrofit later.</p>",
    image: "",
    imageAlt: "",
    featuresList: [
      "React Native or Flutter, chosen against your constraints and your team",
      "Offline first data layer with conflict resolution",
      "Push notifications, deep linking and in app updates",
      "Play Store and App Store submission handled end to end",
      "Crash and performance monitoring from the first internal build",
      "Over the air updates for changes that do not need a store review",
      "Signing keys and store accounts handed over in your name",
    ],
    deliverableTimeline: "10 to 16 weeks",
    order: 9,
    isActive: true,
  },
];

export default services;
