/**
 * SEO and dynamic hero copy, one row per public route.
 *
 * Identifiers must match the PageMeta enum exactly:
 * home · about · services · projects · blogs · contact
 *
 * Written by upsert on pageIdentifier, so re-running the seed refreshes these
 * rows in place and can never duplicate them.
 */

export const pageMeta = [
  {
    "pageIdentifier": "home",
    "metaTitle": "STR Solutions Ltd. — Software, Data & Digital Engineering",
    "metaDescription": "Dhaka-based engineering studio building web platforms, custom software, mobile products and production-grade visual work for teams that need systems to hold up after launch.",
    "keywords": [
      "STR Solutions",
      "software development Bangladesh",
      "web development Dhaka",
      "custom software",
      "digital agency Dhaka"
    ],
    "ogImage": "/logo.png",
    "dynamicHeroHeadline": "Systems that hold up after the launch team leaves.",
    "dynamicHeroSubtitle": "Web platforms, custom software, mobile products and production visual work — built by one accountable team."
  },
  {
    "pageIdentifier": "about",
    "metaTitle": "About STR Solutions Ltd.",
    "metaDescription": "Who we are, how we work, and the people accountable for it. An engineering and production studio operating from Dhaka since 2019.",
    "keywords": [
      "about STR Solutions",
      "software company Dhaka",
      "engineering studio Bangladesh"
    ],
    "ogImage": "/logo.png",
    "dynamicHeroHeadline": "Innovation, integrity, impact — in that order.",
    "dynamicHeroSubtitle": "A board, a delivery team and four retained consultants, working across Bangladesh, the UK, the EU and Australia."
  },
  {
    "pageIdentifier": "services",
    "metaTitle": "Services — Engineering, Design & Production",
    "metaDescription": "Web development, custom software, mobile applications, product design, graphics production, architectural visualization and digital marketing.",
    "keywords": [
      "web development services",
      "custom software development",
      "mobile app development Bangladesh",
      "3D visualization",
      "product photo editing"
    ],
    "ogImage": "/logo.png",
    "dynamicHeroHeadline": "Seven disciplines, one accountable team.",
    "dynamicHeroSubtitle": "Engagements are scoped in a paid discovery week and priced after it — never off a one-paragraph brief."
  },
  {
    "pageIdentifier": "projects",
    "metaTitle": "Selected Work — Case Studies",
    "metaDescription": "Commerce replatforms, field applications, booking engines, catalogue production and architectural visualization — each written up as a problem, a decision and a number.",
    "keywords": [
      "software case studies",
      "web development portfolio",
      "3D rendering portfolio"
    ],
    "ogImage": "/websites/paarel-website.png",
    "dynamicHeroHeadline": "Ten projects, and what actually changed.",
    "dynamicHeroSubtitle": "Each written up as a problem, a decision and a number — not a screenshot with adjectives around it."
  },
  {
    "pageIdentifier": "blogs",
    "metaTitle": "Insights — Engineering, Design & Production Notes",
    "metaDescription": "Field notes from the build: performance budgets, design-system handover, offline-first data models, QC at catalogue scale, and which marketing metrics are worth measuring.",
    "keywords": [
      "software engineering blog",
      "web performance",
      "design systems",
      "offline-first"
    ],
    "ogImage": "/logo.png",
    "dynamicHeroHeadline": "Written from the build, not around it.",
    "dynamicHeroSubtitle": "Notes from projects that shipped, including the parts that went wrong."
  },
  {
    "pageIdentifier": "contact",
    "metaTitle": "Contact STR Solutions Ltd.",
    "metaDescription": "Start a project with STR Solutions. Dhaka, Bangladesh — reachable on +880 1332-802026 and info@strsltd.com. We reply to every inquiry within one business day.",
    "keywords": [
      "contact STR Solutions",
      "hire software developers Bangladesh",
      "get a quote"
    ],
    "ogImage": "/logo.png",
    "dynamicHeroHeadline": "Tell us the constraint, not the feature list.",
    "dynamicHeroSubtitle": "We reply to every inquiry within one business day."
  }
];

export default pageMeta;
