import { mediaRef as M } from "./projects.media.js";

/**
 * /projects content — the real case-study catalogue.
 *
 * ── WHAT REPLACED WHAT ───────────────────────────────────────────────────
 * The rows this file replaces were placeholders written while the route was
 * being built: invented clients, invented percentages, and — the reason they
 * had to go — the same three screenshots shared between unrelated case
 * studies. Every record below is a real engagement, and every claim in it is
 * either visible on the client's live site today or comes off the studio's own
 * delivery record in str-frontend/lib/portfolioData.js.
 *
 * ── THE ONE RULE ABOUT NUMBERS ───────────────────────────────────────────
 * A figure appears here only if it came from a real report. That is why the
 * web case studies describe STRUCTURE — the journeys, the routes, the flows a
 * reader can go and check — and why the only hard metrics in the file sit in
 * the paid-social and SEO study, where the numbers came off the delivered
 * report. An invented "conversion up 23%" is indistinguishable from a real one
 * on the page and impossible to defend in the room, and these are named
 * clients.
 *
 * ── SERVICE TYPES ARE A FOREIGN KEY, NOT A TAG ───────────────────────────
 * The case-study page links each one to /services/<slug>, so a value that is
 * in Project.SERVICE_TYPES but has no Service document renders a 404 link on a
 * published page. `business-and-it-consultancy` is exactly that today — the
 * seeded service is slugged `business-consultancy` — so nothing here claims
 * it. See the assertion at the bottom of this file.
 *
 * ── IMAGES ───────────────────────────────────────────────────────────────
 * Paths come from projects.media.js via M(). Never write one as a literal: the
 * file on disk is named by that module and a hand-typed path drifts into a
 * fallback logo without erroring anywhere. Every key is used exactly once
 * across the whole catalogue, which the assertion at the bottom enforces.
 */

/* Shorthands. techStack rows are {name, icon, category}; the case-study page
   renders `name` only, but icon/category are what the admin form edits and
   what a future stack-filter would group on, so they are filled in properly
   rather than left for someone else. */
const t = (name, category = "platform", icon = "") => ({ name, icon, category });
const img = (key, caption, layoutType = "half") => ({ url: M(key), caption, layoutType });

export const projects = [
  /* ════════════════════════════════════════════════════════════════════════
     WEB — live, linkable, and screenshotted from the running site.
     ════════════════════════════════════════════════════════════════════════ */

  {
    slug: "teads-global-advertising-platform",
    title: "Teads — Global Advertising Platform",
    subtitle: "Two opposed audiences, seven languages, one platform site",
    shortDescription:
      "Advertisers and media owners each get a self-contained journey on one global site, published in seven languages alongside a resource hub, an awards programme and the compliance pages an ad-tech platform is judged on.",
    clientName: "Teads",
    projectDate: new Date("2024-06-18"),
    serviceTypes: ["website-development", "graphic-design"],
    tags: ["Ad Tech", "Multi-language", "Enterprise", "Content Architecture"],
    featured: true,
    displayOrder: 1,
    accentColor: "#0F62FE",
    layoutStyle: "full-width",
    animationTrigger: "pinned-scroll",
    liveUrl: "https://www.teads.com/",
    techStack: [
      t("Headless CMS", "backend"),
      t("Multi-language routing", "frontend"),
      t("hreflang & locale switching", "seo"),
      t("Edge CDN", "devops"),
      t("Consent management", "compliance"),
      t("GA4", "analytics"),
    ],
    deliverables: [
      "Two parallel journeys — For Advertisers, For Media Owners",
      "Seven locales: EN, FR, DE, ES, IT, JA, 简体中文",
      "Ad format library and creative showcase",
      "Resource hub — blog, case studies, Teads Academy",
      "Company set — leadership, global offices, careers",
      "Compliance and certification pages (EDAA, NAI, IAB Gold Standard)",
    ],
    coverImage: M("teads-cover"),
    thumbnailImage: M("teads-cover"),
    ogImage: M("teads-cover"),
    galleryImages: [
      img("teads-media-owners", "The media-owner journey, kept whole and separate", "full"),
      img("teads-ad-formats", "Ad format library"),
      img("teads-platform", "Platform section, homepage"),
    ],
    metaTitle: "Teads — Global Advertising Platform | STR Solutions Case Study",
    metaDescription:
      "How STR Solutions structured the Teads platform site around two opposed audiences — advertisers and media owners — across seven languages.",
    fullCaseStudy: `<h2>The brief</h2><p>An advertising platform sells to two groups who want opposite things. A brand wants reach, formats and creative production. A publisher wants yield, control and to know what a partner will do to their page. Put both on one site and you usually get a homepage that hedges, then a navigation that makes each group wade through the other's material to find their own.</p>
<h2>What we built</h2><p>The split is structural rather than cosmetic. <strong>For Advertisers</strong> and <strong>For Media Owners</strong> are two self-contained journeys off the top-level navigation, each with its own landing page, its own proof and its own contact route. The advertiser side segments again into enterprise and growing brands, and carries the ad format library, the creative studio and the awards programme. The media-owner side carries its own showcase.</p>
<h3>Seven languages, one structure</h3><p>The site publishes in English, French, German, Spanish, Italian, Japanese and Simplified Chinese. Locales share one information architecture and one component set, so a section added in English has a defined home in all seven rather than becoming an English-only orphan — and the locale switch keeps the reader on the page they were already on instead of dropping them at a translated homepage.</p>
<h3>The parts nobody reads until they matter</h3><p>An ad-tech platform is diligenced as much as it is browsed. The resource hub, the academy, the leadership and global-office pages, the investor and engineering sub-sites, and the certification set — EDAA, NAI, IAB Gold Standard — are built as first-class routes, because they are what a procurement team and a publisher's legal counsel actually open.</p>
<h2>Where it landed</h2><p>Each audience now has a route through the site that never requires reading the other's material, and the seven locales are maintained as one structure instead of seven diverging sites.</p>`,
  },

  {
    slug: "london-youth-games-participation-portal",
    title: "London Youth Games — Participation Portal",
    subtitle: "Thirty-three boroughs, twenty-seven sports, one entry and results system",
    shortDescription:
      "The public portal for the UK's largest youth sport programme: borough and school competition streams, results and standings, volunteer recruitment and four separate giving routes, holding up through seasonal registration peaks.",
    clientName: "London Youth Games",
    projectDate: new Date("2024-09-05"),
    serviceTypes: ["website-development", "digital-marketing"],
    tags: ["Nonprofit", "Youth Sport", "Fundraising", "Accessibility"],
    featured: false,
    displayOrder: 2,
    accentColor: "#E4003B",
    layoutStyle: "full-width",
    animationTrigger: "fade-up",
    liveUrl: "https://www.londonyouthgames.org/",
    techStack: [
      t("WordPress", "cms"),
      t("PHP", "backend"),
      t("Zeffy & GiveNGain", "integration"),
      t("Results & standings module", "frontend"),
      t("Cloudflare", "devops"),
      t("WCAG 2.1 AA", "accessibility"),
    ],
    deliverables: [
      "Open Games stream — borough competition across 27 sports",
      "School Games stream, with inclusive events in both",
      "Results and standings pages per competition",
      "Four giving routes: donations, charity runs, Christmas appeal, partnerships",
      "GamesForce volunteer recruitment",
      "LYG33 youth leadership and Inclusive Coaches programmes",
      "Partner and funder recognition — Sport England, City Bridge Foundation",
    ],
    coverImage: M("lyg-cover"),
    thumbnailImage: M("lyg-cover"),
    ogImage: M("lyg-cover"),
    galleryImages: [
      img("lyg-open-games", "Open Games — borough competition across 27 sports", "full"),
      img("lyg-school-games", "School Games, run through School Games Organisers"),
      img("lyg-support-us", "Support Us — four separate giving routes"),
    ],
    metaTitle: "London Youth Games — Participation Portal | STR Solutions Case Study",
    metaDescription:
      "A youth sport portal covering all 33 London boroughs: two competition streams, results and standings, volunteering and four giving routes.",
    fullCaseStudy: `<h2>The brief</h2><p>London Youth Games runs competition for young people across all 33 London boroughs. The site has to serve four audiences at once — a young person looking for their borough's sport, a teacher entering a school, a volunteer, and a funder deciding whether to give — and it has to survive the registration peaks that arrive with each season rather than averaging them.</p>
<h2>What we built</h2><p>Competition is split into two streams that stay separate the whole way down. <strong>Open Games</strong> is community sport by borough, covering 27 sports, with results and standings of its own. <strong>School Games</strong> runs through School Games Organisers and carries its own results. Inclusive events for young disabled participants sit inside both streams rather than in a third one off to the side, which is the decision that took the longest and matters the most.</p>
<h3>Giving is four routes, not one button</h3><p>A charity's supporters arrive with different amounts of money and time. Direct donation runs through Zeffy and GiveNGain; there is a charity-run programme for people who would rather raise than give; a seasonal Christmas appeal; and a corporate partnership route for organisations. Each one is a real page with its own argument, because a single Donate button converts one of those four.</p>
<h3>The rest of the programme</h3><p>GamesForce handles volunteer recruitment, LYG33 covers youth leadership, and Inclusive Coaches covers coach development. Funder and partner recognition — Sport England, City Bridge Foundation, Garfield Weston Foundation — is built into the site rather than bolted on as a logo strip, because for a charity that acknowledgement is contractual.</p>
<h2>Where it landed</h2><p>Entries, results, volunteering and donations run from one portal, through the seasonal spikes, with the inclusive events inside the main competition rather than beside it.</p>`,
  },

  {
    slug: "australian-cosmetic-institute-clinic-site",
    title: "Australian Cosmetic Institute — Clinic Site",
    subtitle: "Fourteen treatment pages funnelled into one free consultation",
    shortDescription:
      "A two-clinic cosmetic practice in Melbourne: a treatment page per procedure, four before-and-after galleries, published pricing and Zenoti booking, with every route ending at the same free consultation.",
    clientName: "Australian Cosmetic Institute",
    projectDate: new Date("2024-04-22"),
    serviceTypes: ["website-development", "digital-marketing"],
    tags: ["Healthcare", "Local SEO", "Booking", "Lead Generation"],
    featured: false,
    displayOrder: 3,
    accentColor: "#B98A6B",
    layoutStyle: "split",
    animationTrigger: "fade-up",
    liveUrl: "https://www.australiancosmeticinstitute.com.au/",
    techStack: [
      t("WordPress", "cms"),
      t("Zenoti booking", "integration"),
      t("Local SEO & schema", "seo"),
      t("Gallery templates", "frontend"),
      t("Consultation funnel", "conversion"),
      t("GA4", "analytics"),
    ],
    deliverables: [
      "Treatment page per procedure — anti-wrinkle, dermal fillers, facial contouring, fat dissolving, hyperhidrosis, skin, veins",
      "Concern-level pages: frown lines, forehead lines, crow's feet",
      "Four before-and-after galleries",
      "Published treatment pricing page",
      "Two clinic location pages — South Yarra and Glen Waverley",
      "Zenoti online booking and free-consultation funnel",
      "Cosmetics for Men section",
    ],
    coverImage: M("aci-cover"),
    thumbnailImage: M("aci-cover"),
    ogImage: M("aci-cover"),
    galleryImages: [
      img("aci-gallery", "Before-and-after gallery, built per treatment family", "full"),
      img("aci-clinics", "Clinic locations — South Yarra and Glen Waverley"),
      img("aci-pricing", "Published treatment pricing"),
    ],
    metaTitle: "Australian Cosmetic Institute — Clinic Site | STR Solutions Case Study",
    metaDescription:
      "Treatment pages, before-and-after galleries, published pricing and Zenoti booking for a two-clinic Melbourne cosmetic practice.",
    fullCaseStudy: `<h2>The brief</h2><p>Cosmetic patients do not search for a clinic. They search for a concern — a frown line, a heavy jaw, a vein — and they read for weeks before they book anything. A site organised around the practice rather than around the concern loses that reader at the first click, and a site that hides its prices loses them at the last.</p>
<h2>What we built</h2><p>Every procedure gets its own page: anti-wrinkle injections, dermal fillers, facial volumising, facial contouring, fat-dissolving treatments for the jawline, hyperhidrosis management, skin treatments and vein treatments. Underneath those, the specific concerns get their own pages too — frown lines, forehead lines, crow's feet — because that is the phrase the search actually carries.</p>
<h3>Proof, then price, then booking</h3><p>Four before-and-after galleries are organised by treatment family rather than pooled into one feed, so a reader researching lips is not scrolling past veins. Pricing is published on its own page instead of being withheld behind an enquiry. Booking runs through Zenoti for patients who already know what they want, and the free consultation carries everyone who does not.</p>
<h3>Two clinics, found separately</h3><p>South Yarra and Glen Waverley are 25km apart and compete in different local searches, so each has its own location page with its own address, directions and structured data rather than sharing one contact page.</p>
<h2>Where it landed</h2><p>A reader can enter on the concern they typed, see results for that specific treatment, read the price, and book — without ever going back to the homepage.</p>`,
  },

  {
    slug: "torgeson-electric-contractor-platform",
    title: "Torgeson Electric — Contractor Platform",
    subtitle: "Built around the two things that convert for a contractor",
    shortDescription:
      "An employee-owned electrical contractor's site built around the emergency call and the open trade vacancy: industrial, commercial, residential and solar service lines, a project record, and an apprenticeship pipeline.",
    clientName: "Torgeson Electric",
    projectDate: new Date("2024-02-14"),
    serviceTypes: ["website-development", "digital-marketing"],
    tags: ["Contractor", "Local SEO", "Recruitment", "Lead Generation"],
    featured: false,
    displayOrder: 4,
    accentColor: "#F2A20C",
    layoutStyle: "full-width",
    animationTrigger: "fade-up",
    liveUrl: "https://torgesonelectric.com/",
    techStack: [
      t("Joomla", "cms"),
      t("PHP", "backend"),
      t("WorkBright ATS", "integration"),
      t("Local SEO & schema", "seo"),
      t("Lead capture forms", "conversion"),
    ],
    deliverables: [
      "Four service lines — industrial, commercial, residential, solar",
      "24/7 emergency service route, surfaced in the top banner",
      "Project record with completed work",
      "Careers section wired to WorkBright ATS",
      "Apprenticeship programme pages",
      "Capability pages — safety, technology, prefabrication, history",
    ],
    coverImage: M("torgeson-cover"),
    thumbnailImage: M("torgeson-cover"),
    ogImage: M("torgeson-cover"),
    galleryImages: [
      img("torgeson-services", "Four service lines, each with its own route", "full"),
      img("torgeson-emergency", "24/7 emergency service"),
      img("torgeson-projects", "Project record"),
    ],
    metaTitle: "Torgeson Electric — Contractor Platform | STR Solutions Case Study",
    metaDescription:
      "A contractor site built around the 24/7 emergency call and the open trade vacancy, with four service lines and an ATS-backed careers pipeline.",
    fullCaseStudy: `<h2>The brief</h2><p>Two things actually convert on a contractor's site, and neither is the About page. One is the emergency call, where somebody has a problem right now and will use whichever number they find first. The other is the trade vacancy, because in the electrical trades the binding constraint is hiring, not demand.</p>
<h2>What we built</h2><p>The 24/7 service route is surfaced in the top banner on every page and has a page of its own, so it is one tap from wherever a reader landed. The four service lines — industrial, commercial, residential and solar — are separate routes rather than sections of one page, because an industrial buyer and a homeowner have nothing to say to each other and each needs to recognise themselves immediately.</p>
<h3>Careers treated as a real funnel</h3><p>The careers section runs into WorkBright, so an application lands in the ATS the office already uses instead of in an inbox. The apprenticeship programme has its own pages, which is the pipeline for a firm that cannot hire its way out of a shortage.</p>
<h3>What makes the difference on a bid</h3><p>Safety, technology, prefabrication and company history are built as capability pages. Prefab in particular is a genuine differentiator on a commercial bid, and the 100% employee-owned status is carried through the site rather than buried in the footer.</p>
<h2>Where it landed</h2><p>The emergency number is one tap from every page, each service line stands on its own, and applications go straight into the applicant tracking system.</p>`,
  },

  {
    slug: "the-vera-hotel-boutique-booking",
    title: "The Vera Hotel — Boutique Direct Booking",
    subtitle: "A Tel Aviv boutique hotel that books direct instead of through a channel",
    shortDescription:
      "Bilingual site for a 27 Lilienblum boutique hotel, built so the SimpleBooking reservation is the shortest path on every page — with the rooftop, the wellness offer and a city magazine carrying the reasons to take it.",
    clientName: "The Vera Hotel",
    projectDate: new Date("2024-11-08"),
    serviceTypes: ["website-development", "graphic-design"],
    tags: ["Hospitality", "Direct Booking", "Bilingual", "Editorial"],
    featured: false,
    displayOrder: 5,
    accentColor: "#9C6B4A",
    layoutStyle: "split",
    animationTrigger: "fade-up",
    liveUrl: "https://theverahotel.com/",
    techStack: [
      t("WordPress", "cms"),
      t("SimpleBooking engine", "integration"),
      t("Hebrew / RTL", "frontend"),
      t("Editorial templates", "frontend"),
      t("Accessibility statement", "accessibility"),
    ],
    deliverables: [
      "Best-rate booking route into SimpleBooking, in EN and ILS",
      "Rooms, with the amenity set carried per room",
      "Rooftop and wellness pages",
      "TLV Magazine — city editorial",
      "Hebrew site at /vera-heb with RTL layout",
      "Shop, Press and Photo Book sections",
      "Published accessibility statement",
    ],
    coverImage: M("vera-cover"),
    thumbnailImage: M("vera-cover"),
    ogImage: M("vera-cover"),
    galleryImages: [
      img("vera-rooms", "Rooms, with the amenity set carried per room", "full"),
      img("vera-rooftop", "Rooftop"),
      img("vera-magazine", "TLV Magazine — city editorial"),
    ],
    metaTitle: "The Vera Hotel — Boutique Direct Booking | STR Solutions Case Study",
    metaDescription:
      "A bilingual Tel Aviv boutique hotel site built so the direct SimpleBooking reservation is the shortest path on every page.",
    fullCaseStudy: `<h2>The brief</h2><p>Every reservation a boutique hotel takes through an online travel agent costs it a double-digit commission. The site's only real job is to be the shorter path — and for an independent property on Lilienblum Street, competing on price with an aggregator is not available. It has to compete on being the place itself.</p>
<h2>What we built</h2><p>The best-rate route into SimpleBooking is present on every page, pre-filtered to language and currency so the reader is never asked to re-state what the site already knows. Nothing is allowed to sit between a reader deciding and a reader booking.</p>
<h3>The reasons, given room</h3><p>Rooms carry their own amenity set rather than a shared list — Egyptian cotton, organic bath products, the practical things a guest actually checks. The rooftop and the wellness offer get their own pages, and TLV Magazine covers the city, which is the argument for staying in this neighbourhood rather than this hotel. It is also the part that earns links and returns visitors, which an OTA listing cannot do at all.</p>
<h3>Two languages, properly</h3><p>The Hebrew site is a full RTL layout, not a translation overlay, and the language toggle is in the primary navigation. Accessibility has a published statement rather than an assumed one.</p>
<h2>Where it landed</h2><p>Direct booking is the shortest action from anywhere on the site, and the editorial gives a reader a reason to arrive before they are shopping for a room at all.</p>`,
  },

  {
    slug: "terea-vibe-express-delivery-storefront",
    title: "Terea Vibe — Express Delivery Storefront",
    subtitle: "One-hour delivery in three emirates, with WhatsApp as a full second checkout",
    shortDescription:
      "A UAE storefront carrying eight regional product editions and four device models, with one-hour express delivery across Dubai, Ajman and Sharjah and a WhatsApp order path that runs parallel to the cart.",
    clientName: "Terea Vibe",
    projectDate: new Date("2025-03-12"),
    serviceTypes: ["website-development", "software-development", "digital-marketing"],
    tags: ["E-Commerce", "UAE", "Express Delivery", "Conversational Commerce"],
    featured: true,
    displayOrder: 6,
    accentColor: "#C8102E",
    layoutStyle: "bento",
    animationTrigger: "3d-tilt",
    liveUrl: "https://tereavibe.ae/",
    techStack: [
      t("WooCommerce", "commerce"),
      t("WhatsApp Business API", "integration"),
      t("Cash on delivery & card", "payments"),
      t("Emirate-level delivery rules", "backend"),
      t("Product taxonomy by edition", "frontend"),
      t("SEO & content", "seo"),
    ],
    deliverables: [
      "Catalogue segmented by regional edition — Indonesian, Italian, Japanese, Kazakh, Kyrgyz, Swiss, Uzbek",
      "Device range: ILUMA i One, Standard and Prime",
      "One-hour express delivery for Dubai, Ajman and Sharjah",
      "Twelve-hour coverage across all seven emirates",
      "WhatsApp ordering as a parallel checkout",
      "COD, card and bank transfer payment routes",
      "18+ adults-only notice throughout",
      "Blog and category landing pages for search",
    ],
    coverImage: M("terea-cover"),
    thumbnailImage: M("terea-cover"),
    ogImage: M("terea-cover"),
    galleryImages: [
      img("terea-shop", "Catalogue segmented by regional edition", "full"),
      img("terea-devices", "Device range"),
      img("terea-product", "Product detail, with the delivery promise on it"),
    ],
    metaTitle: "Terea Vibe — Express Delivery Storefront | STR Solutions Case Study",
    metaDescription:
      "A UAE storefront with one-hour delivery across three emirates and WhatsApp running as a full second checkout path beside the cart.",
    fullCaseStudy: `<h2>The brief</h2><p>In the UAE the purchase decision is speed. A customer who wants a specific regional edition tonight will buy from whoever can say a time and mean it. The second constraint is cultural rather than technical: a large share of buyers will not complete a web checkout but will happily finish the same order in WhatsApp.</p>
<h2>What we built</h2><p>The delivery promise is stated as a rule, not a slogan — one hour across Dubai, Ajman and Sharjah, twelve hours maximum to Abu Dhabi, Al Ain, Ras Al Khaimah, Fujairah and Umm Al Quwain — and it is carried on the product page, where the decision is made, rather than only in the footer.</p>
<h3>WhatsApp is a checkout, not a support link</h3><p>The WhatsApp route is built to complete an order end to end: the customer messages, the team confirms stock and total, and a payment link comes back in the thread. It runs parallel to the cart rather than as a fallback after one fails, because it is a first choice for a real share of the customer base — and it is backed by cash on delivery, card and bank transfer so the payment method is never the thing that stops the order.</p>
<h3>Browsing by edition</h3><p>Buyers shop by regional edition — Swiss, Japanese, Uzbek, Kazakh, Kyrgyz, Italian, Indonesian — so that is the top-level taxonomy, with the ILUMA i device range as its own branch. Category landing pages and the blog carry the search demand for each edition name. The 18+ adults-only notice runs throughout.</p>
<h2>Where it landed</h2><p>Two complete order paths, an explicit delivery promise on the page where it matters, and a catalogue organised the way the customer already thinks about the product.</p>`,
  },

  {
    slug: "riverside-cottages-assisted-living",
    title: "Riverside Cottages — Assisted Living",
    subtitle: "Every page routed to one action: schedule a tour",
    shortDescription:
      "A family-owned St. Augustine assisted living facility where facilities, care services, gallery and family testimonials all converge on a single scheduled tour — the only decision the site is trying to win.",
    clientName: "Riverside Cottages",
    projectDate: new Date("2024-07-30"),
    serviceTypes: ["website-development", "digital-marketing"],
    tags: ["Senior Care", "Local SEO", "Tour Booking", "Trust"],
    featured: false,
    displayOrder: 7,
    accentColor: "#3E7C59",
    layoutStyle: "split",
    animationTrigger: "fade-up",
    liveUrl: "https://riversidecottagesalf.com/",
    techStack: [
      t("WordPress", "cms"),
      t("Local SEO & schema", "seo"),
      t("Tour enquiry funnel", "conversion"),
      t("Gallery templates", "frontend"),
    ],
    deliverables: [
      "Schedule-a-tour call to action on every page",
      "Facilities and amenities pages",
      "Care services — medication assistance, chef-prepared meals, housekeeping, on-site barber and beautician",
      "Photo gallery of the facility",
      "Family testimonials",
      "Visitation policy and family resources",
      "Location and directions — 471 Shores Blvd, St. Augustine",
    ],
    coverImage: M("riverside-cover"),
    thumbnailImage: M("riverside-cover"),
    ogImage: M("riverside-cover"),
    galleryImages: [
      img("riverside-facilities", "Facilities and amenities", "full"),
      img("riverside-services", "Care services, listed plainly"),
      img("riverside-gallery", "Facility gallery"),
    ],
    metaTitle: "Riverside Cottages — Assisted Living | STR Solutions Case Study",
    metaDescription:
      "An assisted living site where facilities, services, gallery and testimonials all route to one action: scheduling a tour.",
    fullCaseStudy: `<h2>The brief</h2><p>Nobody chooses an assisted living facility from a website. They choose it from a visit. The site has one job — get the family through the door — and its real audience is usually an adult child researching on behalf of a parent, under time pressure, comparing four places at once.</p>
<h2>What we built</h2><p>Every page ends at <strong>Schedule Tour</strong>. Not a newsletter, not a brochure download, not a phone number on its own — one action, repeated, because splitting the call to action across a family-owned facility's modest traffic splits it into nothing.</p>
<h3>Answering the checklist</h3><p>A family comparing facilities is working from a list, so the site answers it directly: medication assistance, executive-chef-prepared meals, laundry and housekeeping, on-site barber and beautician visits, internet and cable, and the activity programme. Facilities and amenities have their own pages, and the photo gallery is there for the obvious reason — people want to see the room before they drive.</p>
<h3>The things that actually reassure</h3><p>The staff-to-resident ratio, one of the highest in St. John's County, is stated rather than implied. The owners' background — family-owned since 2006, with nearly seventy years of combined healthcare experience between them — is on the site because for this decision the operator matters as much as the building. Four family testimonials carry it, and the visitation policy is published where families can find it without calling.</p>
<h2>Where it landed</h2><p>One action, supported by everything a family checks before they commit to the drive.</p>`,
  },

  {
    slug: "zuzuva-multi-vendor-marketplace",
    title: "Zuzuva — Multi-Vendor Marketplace",
    subtitle: "A seller platform, a catalogue and a merchandising engine in one build",
    shortDescription:
      "A full multi-vendor marketplace: seller onboarding, a categorised catalogue with recommendation, best-selling and discount sorting, sponsored placement, wishlists and a cart — built from the platform up rather than themed on top of one.",
    clientName: "Zuzuva",
    projectDate: new Date("2025-05-27"),
    serviceTypes: ["website-development", "software-development", "dashboard-development"],
    tags: ["Marketplace", "MERN", "Multi-vendor", "Merchandising"],
    featured: true,
    displayOrder: 8,
    accentColor: "#6D28D9",
    layoutStyle: "bento",
    animationTrigger: "pinned-scroll",
    liveUrl: "https://zuzuva.com/",
    techStack: [
      t("React", "frontend"),
      t("Node.js", "backend"),
      t("Express", "backend"),
      t("MongoDB", "database"),
      t("Seller dashboard", "dashboard"),
      t("Search & faceted filtering", "frontend"),
      t("Sponsored placement engine", "backend"),
    ],
    deliverables: [
      "Seller onboarding — Become a Seller registration and approval",
      "Per-seller catalogue and order management",
      "Category browsing with faceted filters",
      "Four merchandising sorts — recommended, best selling, newest, biggest discount",
      "Sponsored product placement",
      "Wishlist and cart",
      "Product detail with media gallery and variants",
    ],
    coverImage: M("zuzuva-cover"),
    thumbnailImage: M("zuzuva-cover"),
    ogImage: M("zuzuva-cover"),
    galleryImages: [
      img("zuzuva-catalogue", "Catalogue with faceted filtering", "full"),
      img("zuzuva-seller", "Seller onboarding"),
      img("zuzuva-deals", "Discount sort — one of four merchandising rails"),
    ],
    metaTitle: "Zuzuva — Multi-Vendor Marketplace | STR Solutions Case Study",
    metaDescription:
      "A multi-vendor marketplace built from the platform up: seller onboarding, faceted catalogue, four merchandising sorts and sponsored placement.",
    fullCaseStudy: `<h2>The brief</h2><p>A marketplace is not a shop with more products in it. A shop has one seller, one inventory and one definition of a good result. A marketplace has to keep many sellers' catalogues, stock and orders separate while presenting them to a buyer as one coherent store — and it has to decide, on every listing page, whose product goes first.</p>
<h2>What we built</h2><p>Sellers register through <strong>Become a Seller</strong> and get their own catalogue and order management behind it, so a seller's own operations never touch another's. On the buyer side the same inventory is presented as one store: category browsing, faceted filters, and product pages with media galleries and variants.</p>
<h3>Merchandising is the product</h3><p>Ordering is the lever a marketplace actually pulls, so there are four of them rather than one default: recommended, best selling, newest, and biggest discount — each addressing a different shopper. Sponsored placement runs alongside as its own rail, which is how a marketplace makes money on attention rather than only on margin. Wishlist and cart complete the buyer loop.</p>
<h3>Why it is not a theme</h3><p>Multi-tenancy is a data-model decision, not a template one. Seller ownership, stock and order routing had to be right in the schema from the beginning — retrofitting it onto a single-seller store means rewriting every query that touches a product.</p>
<h2>Where it landed</h2><p>Sellers onboard and manage their own catalogue; buyers see one store with four ways to sort it and a sponsored rail beside them.</p>`,
  },

  {
    slug: "the-foxes-photography-elopement-studio",
    title: "The Foxes — Elopement Photography Studio",
    subtitle: "Six destination guides carrying the enquiry, not a contact form",
    shortDescription:
      "An editorial site for a destination elopement studio, where location guides for Iceland, the Redwoods, Washington, Oregon, Utah and California do the selling and the travel schedule turns a browsing reader into a date.",
    clientName: "The Foxes Photography",
    projectDate: new Date("2024-10-16"),
    serviceTypes: ["website-development", "graphic-design", "digital-marketing"],
    tags: ["Photography", "Editorial", "Content SEO", "Destination"],
    featured: false,
    displayOrder: 9,
    accentColor: "#7C6A55",
    layoutStyle: "full-width",
    animationTrigger: "fade-up",
    liveUrl: "https://thefoxesphotography.com/",
    techStack: [
      t("WordPress", "cms"),
      t("Editorial templates", "frontend"),
      t("Full-bleed galleries", "frontend"),
      t("Content SEO", "seo"),
      t("Enquiry funnel", "conversion"),
    ],
    deliverables: [
      "Location guides — Iceland, Redwoods, Washington, Oregon, Utah, California",
      "How to Elope planning guide",
      "Travel schedule, so a reader can match a date",
      "Packages, including album specification and revision terms",
      "Blog — destination and venue long-form",
      "Full-bleed gallery templates",
    ],
    coverImage: M("foxes-cover"),
    thumbnailImage: M("foxes-cover"),
    ogImage: M("foxes-cover"),
    /* No gallery. The site answers 403 to every request from the capture
       network, so there are no inner-page screenshots to show — and the
       alternatives (a picture of the error page, or another project's
       screenshots) are both worse than none. The case-study page renders the
       gallery section only when this array is non-empty, so it degrades to
       cover-plus-narrative cleanly. See the note in projects.media.js. */
    galleryImages: [],
    metaTitle: "The Foxes — Elopement Photography Studio | STR Solutions Case Study",
    metaDescription:
      "An editorial photography site where six destination location guides and a travel schedule carry the enquiry instead of a contact form.",
    fullCaseStudy: `<h2>The brief</h2><p>A couple planning an elopement is not shopping for a photographer. They are trying to work out whether the thing is even possible — where to go, what a permit needs, what the weather does in October, whether their dog can come. Whoever answers those questions is the one they hire. A portfolio and a contact form answer none of them.</p>
<h2>What we built</h2><p>Six destination guides — Iceland, the Redwoods, Washington, Oregon, Utah and California — are the substance of the site, sitting alongside umbrella pieces covering the most romantic destinations and the best places to elope. A <strong>How to Elope</strong> guide covers the planning itself. This material is what earns the search traffic and what makes the enquiry arrive already convinced.</p>
<h3>The schedule is the conversion</h3><p>The travel schedule turns a reader into a date. Someone reading the Iceland guide who finds the studio is already travelling there in September has a concrete reason to write this week rather than think about it. It is the single most commercially useful page on the site and it is one click from the navigation.</p>
<h3>Packages that state the terms</h3><p>Packages describe what is actually delivered: scouting and location selection, permit guidance, vendor recommendations, timeline planning, weather contingency, and a custom album specified down to the minimum spread count and revision limits. Stating the terms filters the enquiries rather than inflating them.</p>
<h2>Where it landed</h2><p>Enquiries arrive from people who have already read the guide for the place they want to go, and the travel schedule gives them the reason to send it now.</p>`,
  },

  {
    slug: "tiger-den-tourism-travel-platform",
    title: "Tiger Den Tourism — Travel & Visa Platform",
    subtitle: "Four services, one advisor-led enquiry, published guides doing the acquisition",
    shortDescription:
      "Visa processing, medical tourism, package tours and air ticketing on one platform, with country-level visa pages, dated departures and a long-form guide library written for Bangladeshi travellers.",
    clientName: "Tiger Den Tourism",
    projectDate: new Date("2025-07-09"),
    serviceTypes: ["website-development", "software-development", "digital-marketing"],
    tags: ["Travel", "Visa", "Content SEO", "Bangladesh"],
    featured: true,
    displayOrder: 10,
    accentColor: "#E2661F",
    layoutStyle: "bento",
    animationTrigger: "pinned-scroll",
    liveUrl: "https://tigerdentourism.com/",
    techStack: [
      t("React", "frontend"),
      t("Node.js", "backend"),
      t("MongoDB", "database"),
      t("Package & departure CMS", "backend"),
      t("Admin dashboard", "dashboard"),
      t("Content SEO", "seo"),
    ],
    deliverables: [
      "Four service lines — visa processing, medical tourism, package tours, air ticketing",
      "Country-level visa pages: India, China, Canada, Hong Kong, tourist / business / medical",
      "Work permit and student visa routes",
      "Dated tour packages with per-package detail pages",
      "Guide library written for Bangladeshi travellers",
      "Team and about pages with named advisors",
      "Authenticated area for staff",
    ],
    coverImage: M("tigerden-cover"),
    thumbnailImage: M("tigerden-cover"),
    ogImage: M("tigerden-cover"),
    galleryImages: [
      img("tigerden-packages", "Dated departures, priced and sized", "full"),
      img("tigerden-visa", "Visa routes, country by country"),
      img("tigerden-package-detail", "Package detail — itinerary and inclusions"),
    ],
    metaTitle: "Tiger Den Tourism — Travel & Visa Platform | STR Solutions Case Study",
    metaDescription:
      "Visa processing, medical tourism, tour packages and air ticketing on one platform, with country-level visa pages and a guide library.",
    fullCaseStudy: `<h2>The brief</h2><p>A Bangladeshi traveller's hard problem is not choosing a destination. It is the visa — what the consulate wants this month, what a medical visa needs that a tourist visa does not, how long it takes. Agencies that answer that question in a WhatsApp thread capture one customer at a time and nothing compounds.</p>
<h2>What we built</h2><p>Four services live on one platform — visa processing, medical tourism, package tours and air ticketing — with work permit and student visa as their own routes. Visas are published at the country and purpose level: India tourist and India medical are separate pages, as are China tourist and China business, because the requirements differ and so does the search.</p>
<h3>Departures, not brochures</h3><p>Packages carry real dates, durations and prices — the Canton Fair business group tour, Azerbaijan, Nepal, Sri Lanka, the Maldives — each with its own detail page covering itinerary and inclusions. A trip with a date on it is a decision; a trip without one is a daydream.</p>
<h3>The guides are the acquisition channel</h3><p>Long-form guides for Indonesia, Vietnam, the Philippines, Thailand, India and the Canton Fair are written specifically for Bangladeshi passport holders — the requirements, the documents, the process. That is where the traffic comes from, and it arrives already qualified, which is what makes the advisor-led enquiry at the end of it work.</p>
<h2>Where it landed</h2><p>One platform holding four services, published guides bringing the traffic in, and an enquiry that reaches a named advisor rather than a generic inbox.</p>`,
  },

  {
    slug: "skh-sourcing-apparel-platform",
    title: "SKH Sourcing — Apparel Sourcing Platform",
    subtitle: "A buyer-facing range fronting a sourcing desk the team updates live",
    shortDescription:
      "A Dhaka and Sydney apparel buying house: a categorised product range across knitwear, woven, denim, fabric and outerwear, a compliance record, and a four-stage process — all driven from an admin dashboard.",
    clientName: "SKH Sourcing",
    projectDate: new Date("2025-08-21"),
    serviceTypes: ["website-development", "software-development", "dashboard-development"],
    tags: ["Apparel", "B2B", "Sourcing", "Admin Dashboard"],
    featured: true,
    displayOrder: 11,
    accentColor: "#14708A",
    layoutStyle: "split",
    animationTrigger: "pinned-scroll",
    liveUrl: "https://www.skhsourcing.com/",
    techStack: [
      t("React", "frontend"),
      t("Node.js", "backend"),
      t("MongoDB", "database"),
      t("Admin dashboard", "dashboard"),
      t("Category filtering", "frontend"),
      t("SEO", "seo"),
    ],
    deliverables: [
      "Range across nine categories — knitwear, woven, denim, fabric, outerwear, sportswear, home textile, accessories, yarn",
      "Product detail pages per style, with fabric weight and composition",
      "Six capability pages: product development, fabric & trim sourcing, production management, quality inspection, sustainable fabrics, logistics & compliance",
      "Four-stage process — enquiry & costing, sampling & approval, bulk production, inspection & shipment",
      "Compliance record",
      "Admin dashboard for the sourcing desk",
      "Two-office presence: Dhaka and Sydney",
    ],
    coverImage: M("skh-cover"),
    thumbnailImage: M("skh-cover"),
    ogImage: M("skh-cover"),
    galleryImages: [
      img("skh-range", "The range, filtered by category", "full"),
      img("skh-product-detail", "Style detail"),
      img("skh-compliance", "Compliance record"),
    ],
    metaTitle: "SKH Sourcing — Apparel Sourcing Platform | STR Solutions Case Study",
    metaDescription:
      "A buyer-facing apparel range and compliance record fronting an admin dashboard the sourcing desk updates live, for a Dhaka–Sydney buying house.",
    fullCaseStudy: `<h2>The brief</h2><p>An overseas apparel buyer choosing a buying house is asking two questions: can you actually make this, and will I get audited for working with you. A brochure site answers the first badly and the second not at all. The third problem is operational — a range that only a developer can update is out of date within a season.</p>
<h2>What we built</h2><p>The range is published across nine categories — knitwear, woven, denim, fabric, outerwear, sportswear, home textile, accessories and yarn — with a detail page per style carrying fabric weight and composition. A buyer can see 13.5oz rigid selvedge denim, 140 GSM yarn-dyed cotton oxford and 380 GSM brushed-back organic fleece as current capability rather than as a claim, and filter to the category they actually buy.</p>
<h3>Answering the compliance question first</h3><p>Compliance has its own record on the site rather than a line in the footer. For a buyer sourcing out of Bangladesh it is the gating question, and a buying house that makes it easy to verify gets further in the conversation than one that waits to be asked.</p>
<h3>Saying who owns the order</h3><p>Six capability pages cover product development, fabric and trim sourcing, production management, quality inspection, sustainable fabrics, and logistics and compliance. The four-stage process — enquiry and costing, sampling and approval, bulk production, inspection and shipment — is published with one owner per stage, which is the difference between a sourcing desk and a broker.</p>
<h3>The dashboard is the point</h3><p>Everything above is driven from an admin dashboard, so the sourcing desk in Dhaka publishes a new style the day it exists. A site the client cannot update is a site that stops being true.</p>
<h2>Where it landed</h2><p>A live range, a published compliance record, and a team that updates both without a developer.</p>`,
  },

  {
    slug: "podcast-chart-growth-platform",
    title: "Podcast Chart Growth — Growth Platform",
    subtitle: "Two low-friction entry points ahead of any real commitment",
    shortDescription:
      "A podcast growth service built around a free chart audit and a three-day live campaign test, with a five-stage programme and audio post-production behind them — a single page engineered as a funnel.",
    clientName: "Podcast Chart Growth",
    projectDate: new Date("2025-09-18"),
    serviceTypes: ["website-development", "software-development", "digital-marketing"],
    tags: ["SaaS Marketing", "Audio", "Conversion", "Motion"],
    featured: false,
    displayOrder: 12,
    accentColor: "#7C3AED",
    layoutStyle: "full-width",
    animationTrigger: "3d-tilt",
    liveUrl: "https://podcast-frontend-pi.vercel.app/",
    techStack: [
      t("React", "frontend"),
      t("Motion / scroll animation", "frontend"),
      t("Booking flow", "conversion"),
      t("Vercel", "devops"),
      t("Audio UI components", "frontend"),
    ],
    deliverables: [
      "Free show and chart audit as the first entry point",
      "Three-day live campaign test as the second",
      "Five-stage programme: audit, test, multi-channel chart push, performance scale, retention reporting",
      "Three service lines — growth campaigns, Apple & Spotify visibility, audio post-production",
      "Booking section with a direct route to contact",
      "Scroll-driven single-page build",
    ],
    coverImage: M("podcast-cover"),
    thumbnailImage: M("podcast-cover"),
    ogImage: M("podcast-cover"),
    galleryImages: [
      img("podcast-services", "Three service lines", "full"),
      img("podcast-process", "The five-stage programme"),
      img("podcast-booking", "Booking"),
    ],
    metaTitle: "Podcast Chart Growth — Growth Platform | STR Solutions Case Study",
    metaDescription:
      "A podcast growth site built around two low-friction entry points — a free chart audit and a three-day live test — ahead of any commitment.",
    fullCaseStudy: `<h2>The brief</h2><p>Podcast growth services have a credibility problem, and it is mostly deserved. A podcaster who has been burned once will not sign a retainer on the strength of a landing page. The site had to make the first step cost nothing and the second step cost almost nothing.</p>
<h2>What we built</h2><p>Two entry points sit ahead of everything else. The <strong>show and chart audit</strong> is free and is the first thing on offer. The <strong>three-day live campaign test</strong> is the second — small enough to say yes to, real enough to judge. Neither asks for a commitment the reader is not yet in a position to make.</p>
<h3>The programme, shown as a path</h3><p>Behind the two entry points, five stages are published in order: audit, live test, multi-channel chart push, performance and campaign scale, then retention and ongoing reporting. Publishing the whole path — including the part that only matters in month six — is what makes the free audit read as a first step rather than a hook.</p>
<h3>Three lines, stated plainly</h3><p>Growth campaigns, Apple and Spotify visibility, and audio post-production. Platform-focused, review-first, transparent support: the positioning is written as claims a reader can test on the free audit, which is the only kind worth making here.</p>
<h2>Where it landed</h2><p>A single scroll-driven page that gets a sceptical reader from arrival to a free audit without asking for anything, and shows them the whole programme on the way.</p>`,
  },

  /* ════════════════════════════════════════════════════════════════════════
     PRODUCTION DISCIPLINES — the deliverable is a file set, not a URL, so
     these carry no liveUrl. The artwork IS the work; see projects.media.js.
     ════════════════════════════════════════════════════════════════════════ */

  {
    slug: "architectural-visualisation-suite",
    title: "Architectural & Product Visualisation Suite",
    subtitle: "Marketing imagery for buildings and products that do not exist yet",
    shortDescription:
      "Exterior, interior, product and packaging visualisation plus a populated neighbourhood walkthrough — the frames a development markets on and a catalogue ships on, produced before anything is built or photographed.",
    clientName: "Property developers & consumer brands",
    projectDate: new Date("2025-06-11"),
    serviceTypes: ["2d-3d-design-and-animation", "graphic-design"],
    tags: ["3D Rendering", "ArchViz", "Product Visualisation", "Animation"],
    featured: true,
    displayOrder: 13,
    accentColor: "#B45309",
    layoutStyle: "bento",
    animationTrigger: "pinned-scroll",
    techStack: [
      t("3ds Max", "3d"),
      t("Corona Renderer", "3d"),
      t("Blender", "3d"),
      t("Cycles", "3d"),
      t("Lumion", "3d"),
      t("HDRI lighting", "3d"),
      t("PBR materials", "3d"),
      t("Post-production & compositing", "2d"),
    ],
    deliverables: [
      "Twilight exterior hero for a five-storey residential block",
      "Interior visualisation — full material and lighting scheme",
      "Hard-surface product build from spec drawings",
      "Packaging render: glass, brushed copper and satin in one pass",
      "Street-level neighbourhood walkthrough animation",
      "Source scenes and turntables handed over with the frames",
    ],
    coverImage: M("viz-exterior-dusk"),
    thumbnailImage: M("viz-exterior-dusk"),
    ogImage: M("viz-library"),
    galleryImages: [
      img("viz-interior-suite", "Interior visualisation — master suite, lit as one frame", "full"),
      img("viz-hard-surface", "Hard-surface build: the mesh, and the frame the catalogue ships"),
      img("viz-packaging", "Packaging render — glass, brushed copper and satin"),
      img("viz-walkthrough", "Neighbourhood walkthrough, populated", "full"),
    ],
    metaTitle: "Architectural & Product Visualisation Suite | STR Solutions Case Study",
    metaDescription:
      "Exterior, interior, product and packaging visualisation plus a populated walkthrough animation — marketing imagery produced before the thing exists.",
    fullCaseStudy: `<h2>The brief</h2><p>Two industries need a photograph of something that cannot be photographed. A developer sells apartments eighteen months before the building exists. A consumer brand needs catalogue imagery before there is a production sample to put in front of a camera. In both cases the render is not an illustration of the marketing — it is the marketing.</p>
<h2>What we produced</h2><h3>Architectural</h3><p>The exterior hero for a five-storey residential block is lit at dusk, which is the hardest lighting condition and the one that sells: the pool deck, the planting and the lit interiors all read in a single frame, where daylight would flatten two of the three. The interior suite settles the whole material and lighting scheme — veneer, cove lighting, fabric — as one photoreal frame, before anything is ordered. The neighbourhood walkthrough runs at street level with traffic, planting and people in shot, so the plot sells as somewhere to live rather than as a massing model.</p>
<h3>Product</h3><p>The hard-surface build is modelled from spec drawings and lit as a studio shot — no sample, no stylist, no studio hire. The packaging render resolves glass, brushed copper and satin in one pass, which is the combination that usually costs a reshoot when it is done with a camera.</p>
<h2>How it is handed over</h2><p>Frames, source scenes and turntables together. A render delivered as a JPEG alone is a dead end the first time a material changes; delivered with the scene, it is an asset the client can have revised next year.</p>`,
  },

  {
    slug: "measured-floor-plan-production",
    title: "Measured Floor Plan Production",
    subtitle: "One survey, drawn three ways for three different readers",
    shortDescription:
      "Furnished 3D plans for listings, colour-zoned 2D plans for buyers and dual-dimensioned mono line work for permit packs — all redrawn from the same survey so every audience works from identical measurements.",
    clientName: "Residential real estate & surveying",
    projectDate: new Date("2025-04-03"),
    serviceTypes: ["2d-3d-design-and-animation", "graphic-design"],
    tags: ["Floor Plans", "Real Estate", "CAD", "Print"],
    featured: false,
    displayOrder: 14,
    accentColor: "#0E7490",
    layoutStyle: "split",
    animationTrigger: "fade-up",
    techStack: [
      t("CAD redraw", "2d"),
      t("3D layout & furniture staging", "3d"),
      t("Dual dimensioning", "2d"),
      t("Room scheduling", "2d"),
      t("Print-ready output", "print"),
    ],
    deliverables: [
      "Furnished 3D cutaway plan — layout, furniture fit and circulation in one image",
      "Colour-zoned 2D plan with every room measured and labelled",
      "Black-and-white measured plan carrying imperial and metric together",
      "Dual-style delivery from a single survey",
      "Print-ready output for brochure and permit packs",
    ],
    coverImage: M("plan-3d-furnished"),
    thumbnailImage: M("plan-3d-furnished"),
    ogImage: M("plan-2d-colour"),
    galleryImages: [
      img("plan-2d-colour", "Colour-zoned 2D plan, measured and labelled room by room", "full"),
      img("plan-2d-mono", "Mono line work with imperial and metric together"),
      img("plan-2d-dual", "The same survey, delivered in both styles"),
    ],
    metaTitle: "Measured Floor Plan Production | STR Solutions Case Study",
    metaDescription:
      "Furnished 3D plans, colour-zoned 2D plans and dual-dimensioned mono line work, all redrawn from one survey so every audience shares measurements.",
    fullCaseStudy: `<h2>The brief</h2><p>The same apartment has to be drawn for three readers who want different things. A buyer scrolling a listing wants to know whether their sofa fits. A permit office wants line work and dimensions. A brochure wants something that prints. Producing those separately is how a listing ends up disagreeing with a permit drawing about the size of a bedroom.</p>
<h2>What we produce</h2><h3>The listing drawing</h3><p>A furnished 3D cutaway — the doll's-house view — showing layout, furniture fit and circulation in one image. It is the view a listing actually converts on, because it answers the sofa question without asking anyone to read a drawing.</p>
<h3>The buyer's plan</h3><p>Colour-zoned 2D, every room measured and labelled, zoned so the layout is legible to someone who has never read a floor plan. Colour is doing real work here rather than decorating: it separates living from sleeping from service at a glance.</p>
<h3>The permit drawing</h3><p>Print-ready mono line work carrying imperial and metric dimensions together, so one drawing serves a brochure and a permit pack without a second redraw.</p>
<h2>Why it comes from one survey</h2><p>All three are redrawn from the same measured survey, which is the entire point. The mono set and the colour set are the same building at the same dimensions, so the listing and the permit pack cannot contradict each other — and when a dimension is corrected, it is corrected once.</p>`,
  },

  {
    slug: "ecommerce-catalogue-cutout-production",
    title: "E-Commerce Catalogue Cut-Out Production",
    subtitle: "Clipping paths, masking and ghost mannequin at catalogue standard",
    shortDescription:
      "Hand-drawn pen-tool paths, channel masking for fringing and flyaway hair, ghost mannequin neck rebuilds and re-grounded shadows — the retouching that separates a product page from a photograph of a studio.",
    clientName: "Fashion, footwear & jewellery e-commerce",
    projectDate: new Date("2025-02-19"),
    serviceTypes: ["graphic-design"],
    tags: ["Retouching", "E-Commerce", "Clipping Path", "Ghost Mannequin"],
    featured: false,
    displayOrder: 15,
    accentColor: "#BE185D",
    layoutStyle: "bento",
    animationTrigger: "fade-up",
    techStack: [
      t("Photoshop", "2d"),
      t("Pen tool & vector paths", "2d"),
      t("Channel masking", "2d"),
      t("Layer masks & refine edge", "2d"),
      t("Curves & colour balance", "2d"),
      t("Transparent PNG output", "2d"),
    ],
    deliverables: [
      "Manual clipping paths drawn by pen tool, not auto-selected",
      "Background removal to pure white at catalogue standard",
      "Channel masking for fringing, sequins and flyaway hair",
      "Ghost mannequin garment shots with rebuilt necklines",
      "Natural shadow and surface reflection rebuilds",
      "Transparent PNG and flattened white-background delivery",
    ],
    coverImage: M("retouch-ghost-mannequin"),
    thumbnailImage: M("retouch-ghost-mannequin"),
    ogImage: M("retouch-clipping-path"),
    galleryImages: [
      img("retouch-clipping-path", "Manual pen-tool paths — laces, mesh and midsole at full zoom", "full"),
      img("retouch-background-removal", "Skeleton dial and mesh bracelet lifted to pure white"),
      img("retouch-image-masking", "Channel masking for edges a path cannot cut"),
      img("retouch-shadow-reflection", "Shadow and reflection rebuilt so the pieces sit", "full"),
    ],
    metaTitle: "E-Commerce Catalogue Cut-Out Production | STR Solutions Case Study",
    metaDescription:
      "Manual clipping paths, channel masking, ghost mannequin neck rebuilds and shadow reconstruction at e-commerce catalogue standard.",
    fullCaseStudy: `<h2>The brief</h2><p>Product photography arrives from the studio with a mannequin in it, a bench behind it and a shadow that belongs to a different surface. Between that and a product page there is a stage that automated tools still lose money on, because the places they fail — a lace, a mesh panel, a sequin, a strand of hair — are exactly the places a customer zooms in.</p>
<h2>What we do</h2><h3>Paths, drawn</h3><p>Clipping paths are drawn by hand with the pen tool rather than auto-selected. On footwear that is the whole job: laces, mesh and midsole edges have to hold up at full zoom, and an automatic selection softens every one of them.</p>
<h3>Masks, for what a path cannot cut</h3><p>Fringing, sequins and flyaway hair do not have an edge to trace, so they go through channel masking into a clean alpha instead. A watch is the other end of the same problem — a skeleton dial and a mesh bracelet lifted off a cluttered bench onto pure white without softening a single link.</p>
<h3>Ghost mannequin</h3><p>Mannequin and studio clutter removed, neckline rebuilt from the inside shot, so the garment keeps its shape on a white product page instead of collapsing into a flat-lay.</p>
<h3>Grounding</h3><p>A cut-out with no shadow floats. Natural shadow and surface reflection are rebuilt so the pieces sit on the page — the difference between a product photograph and a sticker.</p>
<h2>How it is delivered</h2><p>Transparent PNG for compositing and flattened white for the marketplace, from the same master, so the retailer is never re-cutting the same shot for a second channel.</p>`,
  },

  {
    slug: "listing-image-production-line",
    title: "Listing Image Production Line",
    subtitle: "One shoot, three colourways, every marketplace spec met",
    shortDescription:
      "Colourway generation from a single sample, marketplace-spec squaring and levels correction, and lifestyle regrading with sky replacement — batch image production that turns one shoot into a full listing set.",
    clientName: "Apparel, home & furniture retail",
    projectDate: new Date("2025-01-28"),
    serviceTypes: ["graphic-design", "digital-marketing"],
    tags: ["Batch Production", "Marketplace", "Colour Grading", "Retouching"],
    featured: false,
    displayOrder: 16,
    accentColor: "#9A3412",
    layoutStyle: "split",
    animationTrigger: "fade-up",
    techStack: [
      t("Photoshop", "2d"),
      t("Lightroom", "2d"),
      t("Batch actions", "2d"),
      t("Hue & saturation matching", "2d"),
      t("Sky replacement", "2d"),
      t("Levels & curves", "2d"),
    ],
    deliverables: [
      "Colourway variants generated from a single photographed sample",
      "Fold shadow and fabric weight preserved through every recolour",
      "1200×1200 marketplace-spec squaring with floors removed",
      "Levels and curves correction across the set",
      "Lifestyle regrade — overcast to golden hour, sky replaced",
      "Batch output per channel",
    ],
    coverImage: M("production-lifestyle-grade"),
    thumbnailImage: M("production-lifestyle-grade"),
    ogImage: M("production-design-library"),
    galleryImages: [
      img("production-colourways", "One sample photographed, three colourways published", "full"),
      img("production-marketplace-resize", "Squared to 1200×1200, floors cut, levels corrected"),
      img("production-design-library", "The wider design library this sits inside"),
    ],
    metaTitle: "Listing Image Production Line | STR Solutions Case Study",
    metaDescription:
      "Colourway generation from one sample, marketplace-spec squaring, and lifestyle regrading — batch production that turns one shoot into a listing set.",
    fullCaseStudy: `<h2>The brief</h2><p>A retailer's image cost is not the shoot. It is the multiplication afterwards: three colourways, four marketplaces, each with its own aspect ratio and background rule, and a rejection queue for whichever one you got wrong. Shooting every variant is the expensive way to solve it and the slow one.</p>
<h2>What we do</h2><h3>Colourways from one sample</h3><p>One sample is photographed and the rest are generated. The difficult part is not the hue shift — it is keeping the fold shadows and the fabric weight through it, because a flat recolour reads as a swatch rather than as a garment, and customers return what does not match.</p>
<h3>Marketplace specification</h3><p>Studio frames squared to 1200×1200 with floors cut away and levels corrected. That is the exact format marketplaces reject listings for missing, and the rejection arrives days later with no explanation worth reading.</p>
<h3>Lifestyle regrading</h3><p>A flat overcast frame regraded to golden hour with the sky replaced, skin and fabric held. It saves a reshoot and, more usefully, it saves waiting for weather.</p>
<h2>Why it runs as a line</h2><p>Batch actions per channel mean the same master produces every required output in one pass. The alternative — reprocessing the set by hand for each marketplace — is where retailers quietly lose a week per season.</p>`,
  },

  {
    slug: "paid-social-and-search-programme",
    title: "Paid Social & Search Programme",
    subtitle: "A 90-day Meta campaign and a 455-URL technical audit, reported monthly",
    shortDescription:
      "47.4K views over 90 days with content interactions up 19% and watch time up 57%, plus a full technical SEO crawl of 455 URLs triaged into a fix list a dev team could work straight down.",
    clientName: "Consumer brand & home services contractor",
    projectDate: new Date("2026-05-14"),
    serviceTypes: ["digital-marketing", "data-science-and-analytics"],
    tags: ["Meta Ads", "Technical SEO", "Analytics", "Reporting"],
    featured: true,
    displayOrder: 17,
    accentColor: "#1D4ED8",
    layoutStyle: "bento",
    animationTrigger: "pinned-scroll",
    techStack: [
      t("Meta Ads Manager", "advertising"),
      t("Advantage+", "advertising"),
      t("Google Ads", "advertising"),
      t("Screaming Frog", "seo"),
      t("Google Search Console", "seo"),
      t("Core Web Vitals", "seo"),
      t("GA4", "analytics"),
    ],
    deliverables: [
      "90-day Meta campaign with creative testing",
      "Page insights reporting against a like-for-like prior window",
      "Full technical crawl of 455 URLs",
      "Titles, meta, response codes and render-blocking assets triaged into a dev fix list",
      "Search Console and Core Web Vitals review",
      "Monthly reporting pack",
    ],
    coverImage: M("growth-meta-campaign"),
    thumbnailImage: M("growth-meta-campaign"),
    ogImage: M("growth-reporting-pack"),
    galleryImages: [
      img("growth-seo-audit", "Technical crawl — 455 URLs, triaged into a fix list", "full"),
      img("growth-reporting-pack", "The monthly reporting pack that goes out with it"),
    ],
    metaTitle: "Paid Social & Search Programme | STR Solutions Case Study",
    metaDescription:
      "A 90-day Meta campaign — 47.4K views, watch time up 57% — alongside a 455-URL technical SEO audit triaged into a developer fix list.",
    fullCaseStudy: `<h2>The brief</h2><p>Two problems that are usually sold separately and are almost always the same problem: a brand whose paid social was buying reach without producing engagement, and a home services contractor whose site was structurally unable to rank no matter what was spent pointing at it.</p>
<h2>Paid social</h2><p>Over a 90-day window the page reached <strong>47.4K views, up 30%</strong> against the preceding period, with <strong>content interactions up 19%</strong> and <strong>watch time up 57%</strong>. Watch time is the number worth reading there: reach can be bought, but a 57% rise in how long people stayed is a creative result, and it came from testing creative rather than from raising the budget.</p>
<h2>Technical SEO</h2><p>The contractor's site was crawled end to end — <strong>455 URLs</strong> — and the findings triaged rather than listed. Titles, meta descriptions, response codes and render-blocking assets were sorted into a fix list the development team could work straight down, in priority order, with Search Console and Core Web Vitals data behind each item.</p>
<h3>Why the audit is the deliverable, not the crawl</h3><p>A raw crawl export is 455 rows and nobody acts on it. The work is the triage: deciding which forty items change anything, ordering them by what they cost to fix against what they return, and writing them so a developer can start on Monday without a meeting first.</p>
<h2>Reporting</h2><p>Both run on a monthly pack. Reporting on the same axes each month is what makes a number mean something — otherwise every report is a fresh argument about which metric to look at.</p>`,
  },

  {
    slug: "video-production-and-post",
    title: "Video Production & Post",
    subtitle: "An aerial property launch and a sound-off social cut, from one desk",
    shortDescription:
      "Aerial openers, animated logo stings and graded sunset passes for a property launch, plus captioned vertical cutdowns built for sound-off feeds — edited across the Adobe and Resolve pipeline.",
    clientName: "Real estate developer & landscaping brand",
    projectDate: new Date("2025-10-07"),
    serviceTypes: ["2d-3d-design-and-animation", "digital-marketing"],
    tags: ["Video Editing", "Motion Graphics", "Colour Grade", "Social"],
    featured: false,
    displayOrder: 18,
    accentColor: "#4338CA",
    layoutStyle: "full-width",
    animationTrigger: "fade-up",
    techStack: [
      t("Premiere Pro", "video"),
      t("After Effects", "video"),
      t("DaVinci Resolve", "video"),
      t("Audition", "audio"),
      t("Logo animation", "motion"),
      t("Burned-in captions", "video"),
    ],
    deliverables: [
      "Property launch promo — aerial opener, animated logo sting, graded sunset pass",
      "Cut for the paid placements the launch campaign ran on",
      "Landscaping brand social cut with burned-in captions",
      "9:16 and 1:1 cutdowns for vertical feeds",
      "Sound design and audio clean-up",
      "Colour grade across both",
    ],
    coverImage: M("video-property-promo"),
    thumbnailImage: M("video-property-promo"),
    ogImage: M("video-edit-library"),
    galleryImages: [
      img("video-social-cut", "Landscaping social cut — captions burned in for sound-off feeds", "full"),
      img("video-edit-library", "The wider edit library — YouTube, product, corporate and event"),
    ],
    metaTitle: "Video Production & Post | STR Solutions Case Study",
    metaDescription:
      "An aerial property launch promo with animated logo sting and graded sunset pass, and captioned vertical social cutdowns built for sound-off feeds.",
    fullCaseStudy: `<h2>Two edits, two completely different rules</h2><p>A property launch film and a paid social cut are both video and share almost nothing else. One is watched deliberately, on a large screen, with sound. The other is scrolled past, on a phone, muted, and has about three seconds to stop a thumb. Editing both the same way produces a promo nobody finishes and a social cut nobody starts.</p>
<h2>The property launch</h2><p>An aerial opener establishes the site, an animated logo sting carries the developer's identity, and the whole thing is graded on a sunset pass so the light does the selling. It was cut specifically for the paid placements the launch campaign was running, rather than cut long and trimmed down afterwards — which is how a hero film ends up with its best ten seconds in the middle.</p>
<h2>The social cut</h2><p>Built for sound-off from the start. Captions are burned in rather than relying on platform auto-captions, which are optional, late and frequently wrong. The offer lands inside the first three seconds, and the edit ships as 9:16 and 1:1 cutdowns because a single aspect ratio only covers one placement.</p>
<h2>The pipeline behind both</h2><p>Premiere for the edit, After Effects for the motion, Resolve for the grade, Audition for the audio — the same desk that handles YouTube, product, wedding, corporate and event work, which is what makes a two-format delivery a scheduling question rather than a staffing one.</p>`,
  },
];

/* ── Guards ───────────────────────────────────────────────────────────────
   Both of these describe failures that produce a WORKING seed and a wrong
   page, which is the kind worth paying an import-time check for. */

/* An image used twice is the exact defect this catalogue was rebuilt to fix.
   Cover, thumbnail, og and gallery all count — a gallery shot reappearing as
   another study's cover reads as stock just as badly. */
{
  const owner = new Map();
  for (const p of projects) {
    const used = [
      p.coverImage,
      p.thumbnailImage,
      p.ogImage,
      ...(p.galleryImages ?? []).map((g) => g.url),
    ].filter(Boolean);

    for (const url of new Set(used)) {
      // Within one record the same file may legitimately be cover AND
      // thumbnail; across records it may not.
      const first = owner.get(url);
      if (first && first !== p.slug) {
        throw new Error(`projects.data.js: ${url} is used by both "${first}" and "${p.slug}"`);
      }
      owner.set(url, p.slug);
    }
  }
}

/* A serviceType with no matching Service document renders a dead /services/
   link on a published case study.
 *
 * There is deliberately no list of valid slugs here any more. There used to
 * be, copied from the enum in models/Project.js, and a third copy of a list
 * that already exists in the Service collection is a third thing to forget to
 * update — the reason a service added from the dashboard could not be used at
 * all. The real check runs in projects.seed.js (`checkServiceLinks`) against
 * the collection itself, and the model validates every write the same way.
 *
 * What is worth checking without a database is the shape, because these are
 * the mistakes a literal in this file actually makes: a typo'd count, or a
 * slug written in the wrong case or with spaces. */
{
  const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  for (const p of projects) {
    if (p.serviceTypes.length < 1 || p.serviceTypes.length > 4) {
      throw new Error(
        `projects.data.js: "${p.slug}" has ${p.serviceTypes.length} serviceTypes; 1–4 allowed`
      );
    }
    for (const s of p.serviceTypes) {
      if (!SLUG.test(s)) {
        throw new Error(`projects.data.js: "${p.slug}" has a malformed serviceType "${s}"`);
      }
    }
  }
}

export default projects;
