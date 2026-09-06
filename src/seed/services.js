/**
 * Service catalogue — 7 disciplines.
 *
 * Slugs are produced by the model's slugify hook and match
 * str-frontend/lib/taxonomy.js exactly. `icon` holds a lucide key, not a file
 * path — SERVICE_MEDIA on the frontend owns the artwork.
 *
 * The discipline list comes from the legacy STR site, collapsed from its 9
 * service pages onto the 7 slugs this build ships.
 */

export const services = [
  {
    "title": "Web Development",
    "slug": "web-development",
    "shortDescription": "Marketing sites, commerce platforms and internal tools built on Next.js — fast on a mid-range Android phone, not just on a MacBook.",
    "detailedOverview": "<p>We build the web layer companies actually run on: the storefront, the booking flow, the dashboard the operations team lives in eight hours a day. Most of it ships on Next.js with a Node/Express and MongoDB core, deployed behind a CDN with server rendering where SEO matters and client rendering where it does not.</p>\n<p>The part clients notice six months later is the boring part — a typed API contract, seeded environments, and a deployment that rolls back in one command. That is what keeps a site maintainable after the launch team moves on.</p>\n<h3>How an engagement usually runs</h3>\n<ul><li>Week 1 — audit, content model, and a clickable route map</li><li>Weeks 2–5 — component library, then pages against real data</li><li>Week 6 — performance pass, accessibility pass, analytics, handover</li></ul>",
    "icon": "code",
    "featuresList": [
      "Next.js App Router with server components",
      "Headless CMS or custom admin dashboard",
      "Core Web Vitals budget agreed before build starts",
      "WCAG 2.2 AA keyboard and screen-reader passes",
      "Structured data, sitemaps and per-route metadata",
      "CI pipeline with preview deployments per branch"
    ],
    "deliverableTimeline": "4–8 weeks",
    "order": 1,
    "isActive": true
  },
  {
    "title": "Custom Software",
    "slug": "custom-software",
    "shortDescription": "ERP modules, logistics tooling and SaaS backends for teams whose process no off-the-shelf product actually fits.",
    "detailedOverview": "<p>Off-the-shelf software fails in the same place every time: the one workflow that makes the business money is the one the vendor did not model. We build that workflow properly — role-based access, audit trails, reporting that finance trusts — and integrate the rest rather than rebuilding it.</p>\n<p>Architecture is boring on purpose: a modular Express service, MongoDB with deliberate aggregation pipelines instead of N+1 reads, JWT with rotating refresh tokens, and rate limiting at the edge.</p>",
    "icon": "server",
    "featuresList": [
      "Domain modelling workshops before any code",
      "Modular MVC service with isolated business logic",
      "Role-based access control and full audit logging",
      "Aggregation-pipeline reporting, not client-side sums",
      "Third-party integrations: ERP, SMS, payment, courier",
      "Load-tested to an agreed concurrency target"
    ],
    "deliverableTimeline": "8–20 weeks",
    "order": 2,
    "isActive": true
  },
  {
    "title": "Mobile Applications",
    "slug": "mobile-applications",
    "shortDescription": "Cross-platform apps in React Native and Flutter, shipped through both stores with the release process documented.",
    "detailedOverview": "<p>One codebase, two stores, and a release checklist your team can run without us. We handle the parts that stall most mobile projects — signing, store metadata, staged rollout, crash reporting — as part of the build, not as an afterthought.</p>\n<p>Offline-first is the default assumption for the Bangladeshi market: the app has to stay usable through a dead spot and reconcile cleanly when the connection returns.</p>",
    "icon": "smartphone",
    "featuresList": [
      "React Native or Flutter, chosen on your constraints",
      "Offline-first data layer with conflict resolution",
      "Push notifications and deep linking",
      "Play Store and App Store submission handled end to end",
      "Crash and performance monitoring wired from day one",
      "Over-the-air updates for non-native changes"
    ],
    "deliverableTimeline": "10–16 weeks",
    "order": 3,
    "isActive": true
  },
  {
    "title": "Product Design",
    "slug": "product-design",
    "shortDescription": "Research, interface design and a component library your developers can build from without guessing at spacing.",
    "detailedOverview": "<p>Design here ends in a system, not a pretty file. Tokens, states, empty states, error states, and the responsive behaviour written down — because the expensive part of a redesign is the ambiguity handed to engineering, not the pixels.</p>\n<p>We run design and front-end in the same room, which is why the built screen tends to match the Figma frame instead of approximating it.</p>",
    "icon": "layers",
    "featuresList": [
      "Stakeholder and user interviews, synthesised",
      "Information architecture and flow mapping",
      "Wireframes → high-fidelity UI in Figma",
      "Design tokens exported to CSS custom properties",
      "Component library with every interactive state drawn",
      "Prototype tested with real users before build"
    ],
    "deliverableTimeline": "3–6 weeks",
    "order": 4,
    "isActive": true
  },
  {
    "title": "Graphics Design",
    "slug": "graphics-design",
    "shortDescription": "High-volume image post-production — clipping paths, masking, retouching and ghost mannequin — at catalogue scale.",
    "detailedOverview": "<p>This is a production line, not a studio. Hand-drawn clipping paths, channel-based masking for hair and fabric, colour correction against your brand reference, shadow and reflection work, and invisible-mannequin composites — with a QC pass before anything leaves the building.</p>\n<p>Volume work runs on an agreed turnaround SLA with a named coordinator, so a 4,000-image catalogue drop has a schedule rather than a hope.</p>",
    "icon": "image",
    "featuresList": [
      "Hand-drawn clipping paths — no automated selection",
      "Image masking for hair, fur, glass and translucency",
      "Skin, product and jewellery retouching",
      "Invisible / ghost mannequin composites",
      "Natural and drop shadow, reflection rebuild",
      "Batch resizing and marketplace-spec exports"
    ],
    "deliverableTimeline": "24–72 hour turnaround",
    "order": 5,
    "isActive": true
  },
  {
    "title": "Architectural Visualization",
    "slug": "architectural-visualization",
    "shortDescription": "2D floor plans, 3D renders and walkthrough animation for developers, architects and real-estate listings.",
    "detailedOverview": "<p>Plans that a buyer reads in four seconds and an architect does not have to correct. We work from CAD, PDF or a hand sketch, and return coloured 2D plans, textured 3D floor plans, interior and exterior stills, and animated walkthroughs.</p>\n<p>Every deliverable ships in listing-ready and print-ready sizes, so the marketing team is not re-exporting anything.</p>",
    "icon": "cube",
    "featuresList": [
      "Monochrome and full-colour 2D floor plans",
      "Textured 3D floor plans, single and dual unit",
      "Interior and exterior photoreal stills",
      "Exterior and dusk lighting studies",
      "Product and furniture rendering",
      "Animated 3D walkthrough video"
    ],
    "deliverableTimeline": "3–10 working days",
    "order": 6,
    "isActive": true
  },
  {
    "title": "Digital Marketing",
    "slug": "digital-marketing",
    "shortDescription": "Technical SEO, paid social and reporting that ties spend to pipeline instead of to impressions.",
    "detailedOverview": "<p>We start with the audit nobody wants to read: crawl errors, index bloat, thin pages, a Core Web Vitals score that is quietly costing you rankings. Then campaigns — Meta and Google — with conversion tracking wired to real events, not to page views.</p>\n<p>Reporting is a dashboard you can open yourself, showing cost per qualified lead. Vanity metrics stay off it.</p>",
    "icon": "trending-up",
    "featuresList": [
      "Full technical SEO audit with a prioritised fix list",
      "Keyword and SERP-intent mapping",
      "On-page and schema implementation",
      "Meta and Google campaign build and management",
      "Server-side conversion tracking",
      "Monthly reporting against pipeline, not impressions"
    ],
    "deliverableTimeline": "Ongoing · monthly retainer",
    "order": 7,
    "isActive": true
  }
];

export default services;
