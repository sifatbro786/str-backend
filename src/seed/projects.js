/**
 * Portfolio — 10 case studies.
 *
 * Every coverImage and galleryImage path points at a file that already exists
 * in str-frontend/public/, so nothing 404s the moment the site reads from Mongo.
 *
 * accentColor, layoutStyle and animationTrigger are stored for the Phase 5 GSAP
 * engine and are unused today.
 *
 * Fabricated placeholder links (figma.com/file/str-*, *.example, an all-zero App
 * Store id) were stripped rather than seeded as dead links. Real client URLs kept.
 */

export const projects = [
  {
    "title": "Paarel — Smart Retail Commerce",
    "slug": "paarel-smart-retail-commerce",
    "subtitle": "A multi-brand storefront rebuilt around a 1.4-second first paint",
    "shortDescription": "Replatformed a stalling multi-brand retail store onto Next.js with a custom Node inventory service, cutting time-to-interactive by 61% on 3G.",
    "fullCaseStudy": "<h2>The problem</h2><p>Paarel's storefront was a stitched-together theme carrying four brands and roughly 9,000 SKUs. Category pages took eleven seconds to become interactive on a mid-range Android device, and the checkout dropped roughly one order in six.</p>\n<h2>What we changed</h2><p>We split the monolith in two: a Next.js App Router front end rendered on the server for every category and product route, and a Node inventory service that owns stock, pricing and promotion logic behind a single typed API. Product media moved to a CDN with AVIF negotiation.</p>\n<h3>The checkout</h3><p>The old checkout lost orders at the payment redirect. We rebuilt it as a three-step flow with server-validated state, SSLCommerz and card handled through one abstraction, and an idempotency key on order creation so a double-tap never charges twice.</p>\n<h2>Where it landed</h2><p>Time to interactive on a throttled 3G profile fell from 11.2s to 4.3s. Checkout completion rose 23% over the first eight weeks. Catalogue publishing, previously a developer task, moved to the merchandising team.</p>",
    "clientName": "Paarel Retail",
    "projectDate": "2025-03-18T00:00:00.000Z",
    "serviceTypes": [
      "web-development",
      "custom-software",
      "product-design"
    ],
    "tags": [
      "E-Commerce",
      "Replatform",
      "Performance",
      "Retail"
    ],
    "techStack": [
      {
        "name": "Next.js",
        "icon": "nextjs",
        "category": "frontend"
      },
      {
        "name": "Tailwind CSS",
        "icon": "tailwind",
        "category": "frontend"
      },
      {
        "name": "Node.js",
        "icon": "nodejs",
        "category": "backend"
      },
      {
        "name": "Express",
        "icon": "express",
        "category": "backend"
      },
      {
        "name": "MongoDB",
        "icon": "mongodb",
        "category": "database"
      },
      {
        "name": "Redis",
        "icon": "redis",
        "category": "database"
      },
      {
        "name": "SSLCommerz",
        "icon": "sslcommerz",
        "category": "integration"
      },
      {
        "name": "Vercel",
        "icon": "vercel",
        "category": "devops"
      }
    ],
    "deliverables": [
      "Next.js storefront (48 routes)",
      "Node inventory & pricing service",
      "Merchandising admin dashboard",
      "Design system — 62 components",
      "Performance & SEO handover document"
    ],
    "liveUrl": "https://paarel.com",
    "githubUrl": "",
    "figmaUrl": "",
    "appStoreUrl": "",
    "playStoreUrl": "",
    "coverImage": "/websites/paarel-website.png",
    "thumbnailImage": "/websites/paarel-website.png",
    "galleryImages": [
      {
        "url": "/websites/paarel-website.png",
        "caption": "Storefront home, dark surface",
        "layoutType": "full"
      },
      {
        "url": "/websites/vera-website.png",
        "caption": "Category rail and filter drawer",
        "layoutType": "half"
      },
      {
        "url": "/websites/zuzuva-website.png",
        "caption": "Product detail, media gallery",
        "layoutType": "half"
      }
    ],
    "accentColor": "#1476BE",
    "layoutStyle": "full-width",
    "animationTrigger": "pinned-scroll",
    "featured": true,
    "displayOrder": 1,
    "metaTitle": "Paarel — Smart Retail Commerce | STR Solutions Case Study",
    "metaDescription": "How STR Solutions replatformed a four-brand, 9,000-SKU retail storefront onto Next.js and cut time-to-interactive by 61%.",
    "ogImage": "/websites/paarel-website.png"
  },
  {
    "title": "Innoel Technology",
    "slug": "innoel-technology",
    "subtitle": "A distributor catalogue that finally matches the warehouse",
    "shortDescription": "Built a B2B electronics catalogue and quotation portal with live ERP stock sync, replacing a spreadsheet-and-email quoting process.",
    "fullCaseStudy": "<h2>The problem</h2><p>Innoel quoted from a spreadsheet exported nightly. By mid-afternoon the prices were wrong, and the sales team was quoting stock that had already shipped.</p>\n<h2>What we built</h2><p>A public catalogue with role-gated trade pricing, and a quotation portal where a logged-in buyer builds a basket that carries live stock and tier pricing pulled from the ERP every ten minutes. Quotes render to PDF and are versioned, so an amended quote never overwrites the one the client already has.</p>\n<h2>Result</h2><p>Quote turnaround dropped from roughly a day to under twenty minutes, and stock disputes effectively stopped.</p>",
    "clientName": "Innoel Technology Ltd.",
    "projectDate": "2024-11-02T00:00:00.000Z",
    "serviceTypes": [
      "web-development",
      "custom-software"
    ],
    "tags": [
      "B2B",
      "ERP Integration",
      "Catalogue",
      "Quotation"
    ],
    "techStack": [
      {
        "name": "Next.js",
        "icon": "nextjs",
        "category": "frontend"
      },
      {
        "name": "Tailwind CSS",
        "icon": "tailwind",
        "category": "frontend"
      },
      {
        "name": "Node.js",
        "icon": "nodejs",
        "category": "backend"
      },
      {
        "name": "Express",
        "icon": "express",
        "category": "backend"
      },
      {
        "name": "PostgreSQL",
        "icon": "postgres",
        "category": "database"
      },
      {
        "name": "Docker",
        "icon": "docker",
        "category": "devops"
      },
      {
        "name": "AWS",
        "icon": "aws",
        "category": "devops"
      }
    ],
    "deliverables": [
      "Public product catalogue",
      "Role-gated trade pricing layer",
      "Quotation portal with PDF versioning",
      "ERP sync worker"
    ],
    "liveUrl": "https://innoel.com",
    "githubUrl": "",
    "figmaUrl": "",
    "appStoreUrl": "",
    "playStoreUrl": "",
    "coverImage": "/websites/innoel-website.png",
    "thumbnailImage": "/websites/innoel-website.png",
    "galleryImages": [
      {
        "url": "/websites/innoel-website.png",
        "caption": "Catalogue landing",
        "layoutType": "full"
      },
      {
        "url": "/websites/skhsourcing-website.png",
        "caption": "Quotation builder",
        "layoutType": "full"
      }
    ],
    "accentColor": "#EF5A28",
    "layoutStyle": "split",
    "animationTrigger": "fade-up",
    "featured": true,
    "displayOrder": 2,
    "metaTitle": "Innoel Technology — B2B Catalogue & Quotation Portal",
    "metaDescription": "A distributor catalogue with live ERP stock sync and versioned PDF quoting, built by STR Solutions Ltd.",
    "ogImage": "/websites/innoel-website.png"
  },
  {
    "title": "Tiger Den Tourism",
    "slug": "tiger-den-tourism",
    "subtitle": "Booking for the Sundarbans, built for a patchy connection",
    "shortDescription": "A tour-operator booking platform with seat inventory, partial payments and an itinerary builder that works offline on a boat.",
    "fullCaseStudy": "<h2>Context</h2><p>Tiger Den runs multi-day Sundarbans expeditions. Guides on the water needed the manifest; head office needed live seat counts; travellers needed to pay a deposit now and the balance later.</p>\n<h2>Build</h2><p>Seat inventory is held server-side with a short soft-lock during checkout so two people cannot buy the last berth. Payments run through SSLCommerz with a scheduled-balance record rather than a second manual invoice. The guide view is a cached PWA — the manifest is readable with no signal.</p>\n<h2>Outcome</h2><p>Direct bookings grew from a small fraction of departures to the majority, and the manual reconciliation spreadsheet was retired.</p>",
    "clientName": "Tiger Den Tourism",
    "projectDate": "2025-01-24T00:00:00.000Z",
    "serviceTypes": [
      "web-development",
      "product-design",
      "digital-marketing"
    ],
    "tags": [
      "Travel",
      "Booking Engine",
      "PWA",
      "Payments"
    ],
    "techStack": [
      {
        "name": "Next.js",
        "icon": "nextjs",
        "category": "frontend"
      },
      {
        "name": "Tailwind CSS",
        "icon": "tailwind",
        "category": "frontend"
      },
      {
        "name": "Node.js",
        "icon": "nodejs",
        "category": "backend"
      },
      {
        "name": "MongoDB",
        "icon": "mongodb",
        "category": "database"
      },
      {
        "name": "SSLCommerz",
        "icon": "sslcommerz",
        "category": "integration"
      },
      {
        "name": "GA4",
        "icon": "analytics",
        "category": "analytics"
      },
      {
        "name": "Vercel",
        "icon": "vercel",
        "category": "devops"
      }
    ],
    "deliverables": [
      "Booking engine with soft-lock seat inventory",
      "Deposit and scheduled-balance payments",
      "Offline-capable guide manifest (PWA)",
      "SEO foundation and landing pages"
    ],
    "liveUrl": "https://tigerdentourism.com",
    "githubUrl": "",
    "figmaUrl": "",
    "appStoreUrl": "",
    "playStoreUrl": "",
    "coverImage": "/websites/tigerdentourism-website.png",
    "thumbnailImage": "/websites/tigerdentourism-website.png",
    "galleryImages": [
      {
        "url": "/websites/tigerdentourism-website.png",
        "caption": "Departure detail page",
        "layoutType": "full"
      },
      {
        "url": "/websites/riverside-website.png",
        "caption": "Itinerary builder",
        "layoutType": "half"
      },
      {
        "url": "/websites/the-foxes-website.png",
        "caption": "Checkout, deposit step",
        "layoutType": "half"
      }
    ],
    "accentColor": "#57B04A",
    "layoutStyle": "bento",
    "animationTrigger": "fade-up",
    "featured": true,
    "displayOrder": 3,
    "metaTitle": "Tiger Den Tourism — Sundarbans Booking Platform",
    "metaDescription": "Seat inventory, partial payments and an offline guide manifest for a Sundarbans tour operator.",
    "ogImage": "/websites/tigerdentourism-website.png"
  },
  {
    "title": "Torgeson Field Operations",
    "slug": "torgeson-field-operations",
    "subtitle": "Taking a 40-person field team off paper",
    "shortDescription": "A React Native job-dispatch app with offline sync, photo evidence capture and a supervisor dashboard for scheduling.",
    "fullCaseStudy": "<h2>The problem</h2><p>Job sheets went out on paper each morning and came back — sometimes — at the end of the week. Invoicing lagged the work by up to a month.</p>\n<h2>The app</h2><p>Technicians get the day's jobs on their phone, capture signatures and photo evidence, and mark completion. Everything queues locally and syncs when signal returns; conflicts resolve last-write-wins per field, not per record, so two partial edits merge instead of clobbering.</p>\n<h2>Result</h2><p>Invoicing moved from monthly to same-week. Disputed jobs fell sharply once every completion carried a timestamped photo.</p>",
    "clientName": "Torgeson Services",
    "projectDate": "2024-08-14T00:00:00.000Z",
    "serviceTypes": [
      "mobile-applications",
      "custom-software",
      "product-design"
    ],
    "tags": [
      "Field Service",
      "Offline First",
      "Dispatch",
      "Android"
    ],
    "techStack": [
      {
        "name": "React Native",
        "icon": "react",
        "category": "mobile"
      },
      {
        "name": "Node.js",
        "icon": "nodejs",
        "category": "backend"
      },
      {
        "name": "Express",
        "icon": "express",
        "category": "backend"
      },
      {
        "name": "MongoDB",
        "icon": "mongodb",
        "category": "database"
      },
      {
        "name": "Redis",
        "icon": "redis",
        "category": "database"
      },
      {
        "name": "AWS",
        "icon": "aws",
        "category": "devops"
      }
    ],
    "deliverables": [
      "React Native app — Android & iOS",
      "Offline sync engine with field-level merge",
      "Supervisor scheduling dashboard",
      "Photo evidence pipeline with S3 lifecycle rules"
    ],
    "liveUrl": "",
    "githubUrl": "",
    "figmaUrl": "",
    "appStoreUrl": "",
    "playStoreUrl": "",
    "coverImage": "/websites/torgeson-website.png",
    "thumbnailImage": "/websites/torgeson-website.png",
    "galleryImages": [
      {
        "url": "/websites/torgeson-website.png",
        "caption": "Supervisor dashboard",
        "layoutType": "full"
      },
      {
        "url": "/PPhoto.png",
        "caption": "Technician job view",
        "layoutType": "grid"
      },
      {
        "url": "/websites/teds-website.png",
        "caption": "Evidence capture",
        "layoutType": "grid"
      },
      {
        "url": "/websites/vera-website.png",
        "caption": "Scheduling board",
        "layoutType": "grid"
      }
    ],
    "accentColor": "#1476BE",
    "layoutStyle": "split",
    "animationTrigger": "3d-tilt",
    "featured": true,
    "displayOrder": 4,
    "metaTitle": "Torgeson Field Operations — Offline-First Dispatch App",
    "metaDescription": "A React Native dispatch app with offline sync and photo evidence for a 40-person field team.",
    "ogImage": "/websites/torgeson-website.png"
  },
  {
    "title": "Riverside Residences — Visualization Suite",
    "slug": "riverside-residences-visualization-suite",
    "subtitle": "Selling forty units off a plan set",
    "shortDescription": "Full 2D/3D visualization package — coloured floor plans, interior stills and a walkthrough film — produced for a pre-launch sales campaign.",
    "fullCaseStudy": "<h2>Brief</h2><p>Riverside needed to sell forty units before the structure topped out. All that existed was a CAD plan set and a materials schedule.</p>\n<h2>Production</h2><p>We produced monochrome and coloured 2D plans for the brochure, textured 3D plans for the listing portals, six interior stills per unit type, an exterior dusk study, and a ninety-second walkthrough. Everything was delivered in print CMYK and web sRGB from the same master.</p>\n<h2>Outcome</h2><p>The sales team ran the entire pre-launch on this package with no site photography at all.</p>",
    "clientName": "Riverside Developments",
    "projectDate": "2025-04-30T00:00:00.000Z",
    "serviceTypes": [
      "architectural-visualization",
      "graphics-design"
    ],
    "tags": [
      "Real Estate",
      "3D Render",
      "Floor Plan",
      "Walkthrough"
    ],
    "techStack": [
      {
        "name": "Blender",
        "icon": "blender",
        "category": "design"
      },
      {
        "name": "V-Ray",
        "icon": "vray",
        "category": "design"
      },
      {
        "name": "Photoshop",
        "icon": "photoshop",
        "category": "design"
      }
    ],
    "deliverables": [
      "12 coloured 2D floor plans",
      "12 textured 3D floor plans",
      "48 interior stills",
      "Exterior dusk study",
      "90-second walkthrough film"
    ],
    "liveUrl": "",
    "githubUrl": "",
    "figmaUrl": "",
    "appStoreUrl": "",
    "playStoreUrl": "",
    "coverImage": "/2d-3d/3d-rendering.jpg",
    "thumbnailImage": "/2d-3d/3d-floor-plan.jpg",
    "galleryImages": [
      {
        "url": "/2d-3d/3d-rendering.jpg",
        "caption": "Exterior, dusk study",
        "layoutType": "full"
      },
      {
        "url": "/2d-3d/2d-floor-plan-colour.png",
        "caption": "Coloured 2D plan — Type A",
        "layoutType": "grid"
      },
      {
        "url": "/2d-3d/2d-floor-plan-mono.png",
        "caption": "Monochrome plan for print",
        "layoutType": "grid"
      },
      {
        "url": "/2d-3d/2d-floor-plan-dual-unit.png",
        "caption": "Dual-unit floor plate",
        "layoutType": "grid"
      },
      {
        "url": "/2d-3d/3d-interior.jpg",
        "caption": "Living room, Type B",
        "layoutType": "half"
      },
      {
        "url": "/2d-3d/exterior-lighting.jpg",
        "caption": "Facade lighting study",
        "layoutType": "half"
      },
      {
        "url": "/2d-3d/3d-animation-video.jpg",
        "caption": "Walkthrough film still",
        "layoutType": "full"
      }
    ],
    "accentColor": "#EF5A28",
    "layoutStyle": "bento",
    "animationTrigger": "pinned-scroll",
    "featured": true,
    "displayOrder": 5,
    "metaTitle": "Riverside Residences — 2D & 3D Visualization Suite",
    "metaDescription": "Coloured floor plans, interior stills and a walkthrough film produced for a forty-unit pre-launch campaign.",
    "ogImage": "/2d-3d/3d-rendering.jpg"
  },
  {
    "title": "SKH Sourcing — Catalogue Production",
    "slug": "skh-sourcing-catalogue-production",
    "subtitle": "11,400 images through a single QC gate",
    "shortDescription": "Season-long apparel post-production: clipping paths, ghost mannequin composites and marketplace exports on a 48-hour SLA.",
    "fullCaseStudy": "<h2>Scope</h2><p>Two seasons, 11,400 raw frames, four marketplace specifications, and a hard weekly drop date.</p>\n<h2>How it ran</h2><p>Every frame passed through a fixed pipeline — hand-drawn path, colour match against the physical swatch, ghost-mannequin composite where required, shadow rebuild, then a QC gate before batching. Rejects went back into the queue with an annotated note rather than a verbal comment.</p>\n<h2>Result</h2><p>Rejection rate at the client's end settled under 1.2%, and no weekly drop was missed.</p>",
    "clientName": "SKH Sourcing",
    "projectDate": "2025-02-10T00:00:00.000Z",
    "serviceTypes": [
      "graphics-design"
    ],
    "tags": [
      "Apparel",
      "Post Production",
      "Ghost Mannequin",
      "High Volume"
    ],
    "techStack": [
      {
        "name": "Photoshop",
        "icon": "photoshop",
        "category": "design"
      }
    ],
    "deliverables": [
      "11,400 hand-drawn clipping paths",
      "3,200 ghost-mannequin composites",
      "Shadow and reflection rebuild",
      "Four marketplace export presets"
    ],
    "liveUrl": "https://skhsourcing.com",
    "githubUrl": "",
    "figmaUrl": "",
    "appStoreUrl": "",
    "playStoreUrl": "",
    "coverImage": "/graphics/invisible-mannequin.jpg",
    "thumbnailImage": "/graphics/clipping-path.jpg",
    "galleryImages": [
      {
        "url": "/graphics/invisible-mannequin.jpg",
        "caption": "Ghost mannequin composite",
        "layoutType": "half"
      },
      {
        "url": "/graphics/clipping-path.jpg",
        "caption": "Hand-drawn path",
        "layoutType": "half"
      },
      {
        "url": "/graphics/image-masking.jpg",
        "caption": "Channel mask — knitwear",
        "layoutType": "grid"
      },
      {
        "url": "/graphics/retouching.jpg",
        "caption": "Retouch pass",
        "layoutType": "grid"
      },
      {
        "url": "/graphics/shadows-reflection.jpg",
        "caption": "Shadow rebuild",
        "layoutType": "grid"
      },
      {
        "url": "/graphics/color-processing.jpg",
        "caption": "Colour match to swatch",
        "layoutType": "grid"
      }
    ],
    "accentColor": "#57B04A",
    "layoutStyle": "bento",
    "animationTrigger": "fade-up",
    "featured": false,
    "displayOrder": 6,
    "metaTitle": "SKH Sourcing — Apparel Catalogue Post-Production",
    "metaDescription": "11,400 apparel frames through clipping path, ghost mannequin and marketplace export on a 48-hour SLA.",
    "ogImage": "/graphics/invisible-mannequin.jpg"
  },
  {
    "title": "London Youth Foundation",
    "slug": "london-youth-foundation",
    "subtitle": "A donation flow that stops asking twice",
    "shortDescription": "Charity site rebuild with a single-screen donation flow, Gift Aid capture and a programme directory the team edits themselves.",
    "fullCaseStudy": "<h2>The problem</h2><p>The old donation journey ran across four screens and asked for the amount twice. Roughly two-thirds of people who started it never finished.</p>\n<h2>Rebuild</h2><p>One screen: amount, frequency, Gift Aid, pay. Card and wallet handled through Stripe with Apple Pay and Google Pay surfaced first on mobile. The programme directory moved into a small admin so the outreach team publishes without a developer.</p>\n<h2>Result</h2><p>Completion on the donation flow roughly doubled, and average gift size rose once monthly giving was made the default option.</p>",
    "clientName": "London Youth Foundation",
    "projectDate": "2024-06-11T00:00:00.000Z",
    "serviceTypes": [
      "web-development",
      "product-design"
    ],
    "tags": [
      "Nonprofit",
      "Donations",
      "Accessibility",
      "Stripe"
    ],
    "techStack": [
      {
        "name": "Next.js",
        "icon": "nextjs",
        "category": "frontend"
      },
      {
        "name": "Tailwind CSS",
        "icon": "tailwind",
        "category": "frontend"
      },
      {
        "name": "Node.js",
        "icon": "nodejs",
        "category": "backend"
      },
      {
        "name": "MongoDB",
        "icon": "mongodb",
        "category": "database"
      },
      {
        "name": "Stripe",
        "icon": "stripe",
        "category": "integration"
      },
      {
        "name": "Vercel",
        "icon": "vercel",
        "category": "devops"
      }
    ],
    "deliverables": [
      "Single-screen donation flow",
      "Gift Aid declaration capture",
      "Programme directory + admin",
      "WCAG 2.2 AA audit and remediation"
    ],
    "liveUrl": "",
    "githubUrl": "",
    "figmaUrl": "",
    "appStoreUrl": "",
    "playStoreUrl": "",
    "coverImage": "/websites/london-youth-website.png",
    "thumbnailImage": "/websites/london-youth-website.png",
    "galleryImages": [
      {
        "url": "/websites/london-youth-website.png",
        "caption": "Home",
        "layoutType": "full"
      },
      {
        "url": "/websites/the-foxes-website.png",
        "caption": "Donation screen",
        "layoutType": "half"
      },
      {
        "url": "/websites/podcast-website.png",
        "caption": "Programme directory",
        "layoutType": "half"
      }
    ],
    "accentColor": "#1476BE",
    "layoutStyle": "full-width",
    "animationTrigger": "fade-up",
    "featured": false,
    "displayOrder": 7,
    "metaTitle": "London Youth Foundation — Donation Flow Rebuild",
    "metaDescription": "A single-screen donation journey with Gift Aid capture that doubled completion rate.",
    "ogImage": "/websites/london-youth-website.png"
  },
  {
    "title": "Terea — Brand & Growth Campaign",
    "slug": "terea-brand-growth-campaign",
    "subtitle": "Fixing the funnel before spending on it",
    "shortDescription": "Technical SEO remediation, landing-page system and paid social build that cut cost per qualified lead by 44%.",
    "fullCaseStudy": "<h2>Starting point</h2><p>Spend was climbing and leads were flat. The audit found 1,100 indexed thin pages, a broken canonical strategy, and conversion tracking firing on page view rather than on form submission.</p>\n<h2>Work</h2><p>We pruned and consolidated the index, rebuilt the landing pages as a composable section system so the marketing team could ship a variant in an hour, and moved conversion tracking server-side.</p>\n<h2>Result</h2><p>Cost per qualified lead fell 44% over the following quarter, on flat spend.</p>",
    "clientName": "Terea",
    "projectDate": "2025-05-19T00:00:00.000Z",
    "serviceTypes": [
      "digital-marketing",
      "web-development"
    ],
    "tags": [
      "SEO",
      "Paid Social",
      "Landing Pages",
      "Analytics"
    ],
    "techStack": [
      {
        "name": "Next.js",
        "icon": "nextjs",
        "category": "frontend"
      },
      {
        "name": "Tailwind CSS",
        "icon": "tailwind",
        "category": "frontend"
      },
      {
        "name": "GA4",
        "icon": "analytics",
        "category": "analytics"
      },
      {
        "name": "Vercel",
        "icon": "vercel",
        "category": "devops"
      }
    ],
    "deliverables": [
      "Technical SEO audit + remediation",
      "Composable landing-page section system",
      "Server-side conversion tracking",
      "Monthly pipeline reporting dashboard"
    ],
    "liveUrl": "",
    "githubUrl": "",
    "figmaUrl": "",
    "appStoreUrl": "",
    "playStoreUrl": "",
    "coverImage": "/websites/terea-website.png",
    "thumbnailImage": "/websites/terea-website.png",
    "galleryImages": [
      {
        "url": "/websites/terea-website.png",
        "caption": "Landing page system",
        "layoutType": "full"
      },
      {
        "url": "/digital/seo-audit-report.jpg",
        "caption": "Audit extract",
        "layoutType": "half"
      },
      {
        "url": "/digital/facebook-ads-campaign.jpg",
        "caption": "Campaign structure",
        "layoutType": "half"
      }
    ],
    "accentColor": "#EF5A28",
    "layoutStyle": "split",
    "animationTrigger": "fade-up",
    "featured": false,
    "displayOrder": 8,
    "metaTitle": "Terea — SEO Remediation & Paid Growth",
    "metaDescription": "Index pruning, a composable landing-page system and server-side tracking that cut CPQL by 44%.",
    "ogImage": "/websites/terea-website.png"
  },
  {
    "title": "Australian Cosmetic Clinic",
    "slug": "australian-cosmetic-clinic",
    "subtitle": "Consultation booking, without the phone tag",
    "shortDescription": "Clinic site with practitioner-level availability, pre-consultation intake forms and a treatment library.",
    "fullCaseStudy": "<h2>Brief</h2><p>Every consultation started with three phone calls: availability, intake questions, then confirmation. The front desk spent most of its day on it.</p>\n<h2>Build</h2><p>Availability is modelled per practitioner and per treatment duration, not as a flat calendar. Intake runs as a conditional form before payment, so the practitioner has the medical history before the patient arrives.</p>\n<h2>Result</h2><p>Front-desk call volume dropped by roughly half within a month, and no-shows fell once deposits were attached to bookings.</p>",
    "clientName": "Australian Cosmetic Clinic",
    "projectDate": "2024-09-27T00:00:00.000Z",
    "serviceTypes": [
      "web-development",
      "product-design"
    ],
    "tags": [
      "Healthcare",
      "Booking",
      "Forms",
      "Compliance"
    ],
    "techStack": [
      {
        "name": "Next.js",
        "icon": "nextjs",
        "category": "frontend"
      },
      {
        "name": "Tailwind CSS",
        "icon": "tailwind",
        "category": "frontend"
      },
      {
        "name": "Node.js",
        "icon": "nodejs",
        "category": "backend"
      },
      {
        "name": "MongoDB",
        "icon": "mongodb",
        "category": "database"
      },
      {
        "name": "Stripe",
        "icon": "stripe",
        "category": "integration"
      }
    ],
    "deliverables": [
      "Per-practitioner availability engine",
      "Conditional pre-consultation intake",
      "Treatment library with structured data",
      "Deposit-backed booking"
    ],
    "liveUrl": "",
    "githubUrl": "",
    "figmaUrl": "",
    "appStoreUrl": "",
    "playStoreUrl": "",
    "coverImage": "/websites/australian-cosmetic-website.png",
    "thumbnailImage": "/websites/australian-cosmetic-website.png",
    "galleryImages": [
      {
        "url": "/websites/australian-cosmetic-website.png",
        "caption": "Clinic home",
        "layoutType": "full"
      },
      {
        "url": "/websites/vera-website.png",
        "caption": "Booking step",
        "layoutType": "half"
      },
      {
        "url": "/websites/teds-website.png",
        "caption": "Treatment library",
        "layoutType": "half"
      }
    ],
    "accentColor": "#57B04A",
    "layoutStyle": "full-width",
    "animationTrigger": "fade-up",
    "featured": false,
    "displayOrder": 9,
    "metaTitle": "Australian Cosmetic Clinic — Consultation Booking Platform",
    "metaDescription": "Practitioner-level availability, conditional intake and deposit-backed booking for a cosmetic clinic.",
    "ogImage": "/websites/australian-cosmetic-website.png"
  },
  {
    "title": "The Foxes — Studio Identity & Site",
    "slug": "the-foxes-studio-identity-and-site",
    "subtitle": "A portfolio that loads before the client loses interest",
    "shortDescription": "Identity, design system and a static-first portfolio site for a production studio, shipped in five weeks.",
    "fullCaseStudy": "<h2>Brief</h2><p>A production studio with excellent work and a site that took nine seconds to show any of it.</p>\n<h2>Approach</h2><p>Identity first — a tighter grotesque, a restrained palette, and a grid that lets a single still carry a whole screen. Then a static-first build: every case page pre-rendered, video posters inlined, motion reserved for two moments instead of every scroll.</p>\n<h2>Result</h2><p>Largest contentful paint settled at 1.1s. Enquiries through the site tripled in the first quarter.</p>",
    "clientName": "The Foxes Studio",
    "projectDate": "2025-06-08T00:00:00.000Z",
    "serviceTypes": [
      "product-design",
      "web-development",
      "graphics-design"
    ],
    "tags": [
      "Identity",
      "Portfolio",
      "Design System",
      "Static"
    ],
    "techStack": [
      {
        "name": "Figma",
        "icon": "figma",
        "category": "design"
      },
      {
        "name": "Next.js",
        "icon": "nextjs",
        "category": "frontend"
      },
      {
        "name": "Tailwind CSS",
        "icon": "tailwind",
        "category": "frontend"
      },
      {
        "name": "Vercel",
        "icon": "vercel",
        "category": "devops"
      }
    ],
    "deliverables": [
      "Visual identity and type system",
      "Design system — 40 components",
      "Static-first portfolio build",
      "Asset pipeline and export presets"
    ],
    "liveUrl": "",
    "githubUrl": "",
    "figmaUrl": "",
    "appStoreUrl": "",
    "playStoreUrl": "",
    "coverImage": "/websites/the-foxes-website.png",
    "thumbnailImage": "/websites/the-foxes-website.png",
    "galleryImages": [
      {
        "url": "/websites/the-foxes-website.png",
        "caption": "Home",
        "layoutType": "full"
      },
      {
        "url": "/video/all-video.jpg",
        "caption": "Case study page",
        "layoutType": "half"
      },
      {
        "url": "/video/real-estate-video.jpg",
        "caption": "Reel index",
        "layoutType": "half"
      }
    ],
    "accentColor": "#1476BE",
    "layoutStyle": "bento",
    "animationTrigger": "3d-tilt",
    "featured": false,
    "displayOrder": 10,
    "metaTitle": "The Foxes — Studio Identity & Portfolio Site",
    "metaDescription": "Identity, design system and a static-first portfolio build delivered in five weeks.",
    "ogImage": "/websites/the-foxes-website.png"
  }
];

export default projects;
