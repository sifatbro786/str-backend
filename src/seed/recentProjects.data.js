/**
 * Recent web builds (Nov 2026) for /projects.
 *
 *   npm run seed:recent                 # capture media + insert what is missing
 *   npm run seed:recent -- --force      # recapture media + overwrite these 4 rows
 *   npm run seed:recent -- --media-only # files only, no DB write
 *   npm run seed:recent -- --db-only    # DB only, uses files already on disk
 *
 * Ordering: the list sorts on `-featured -displayOrder -createdAt`, and the
 * home page takes the first 4 featured. These four sit at 101..104 so they
 * lead both, Monowara first. Tiger Den is unfeatured by the seeder (see
 * DEMOTE) so it drops off the home page and below the fold on /projects.
 *
 * Copy rule from the site brief: no em/en dash characters in marketing copy.
 * Numbers quoted below are the ones each client publishes on their own site.
 */

/* ── Media plan ─────────────────────────────────────────────────────────
   shot:     Playwright capture of the live site (desktop 1440x900 @2x, or
             mobile 390x844 @3x). `at` = 0 hero, 0<n<1 fraction of scroll.
   download: a real asset the client site already serves (og image, hero).
   Every key belongs to exactly one project. */
export const MEDIA = [
  // Monowara Hospital
  { key: "monowara-cover", shot: { url: "https://monowarahospital.com", at: 0 } },
  { key: "monowara-band-1", shot: { url: "https://monowarahospital.com", at: 0.22 } },
  { key: "monowara-band-2", shot: { url: "https://monowarahospital.com", at: 0.5 } },
  { key: "monowara-mobile", shot: { url: "https://monowarahospital.com", at: 0, mobile: true } },
  { key: "monowara-building", download: "https://monowarahospital.com/uploads/hero/hospital-building-website-hero-image-2-d2e5dff7.webp" },
  { key: "monowara-og", download: "https://monowarahospital.com/og/default-en.jpg" },

  // Warrick Group
  { key: "warrick-cover", shot: { url: "https://warrick.group", at: 0 } },
  { key: "warrick-band-1", shot: { url: "https://warrick.group", at: 0.3 } },
  { key: "warrick-band-2", shot: { url: "https://warrick.group", at: 0.62 } },
  { key: "warrick-mobile", shot: { url: "https://warrick.group", at: 0, mobile: true } },
  { key: "warrick-og", download: "https://warrick.group/og/home" },

  // Little Flower International School
  { key: "littleflower-cover", shot: { url: "https://littleflowerintschool.com", at: 0 } },
  { key: "littleflower-band-1", shot: { url: "https://littleflowerintschool.com", at: 0.25 } },
  { key: "littleflower-band-2", shot: { url: "https://littleflowerintschool.com", at: 0.55 } },
  { key: "littleflower-mobile", shot: { url: "https://littleflowerintschool.com", at: 0, mobile: true } },
  { key: "littleflower-og", download: "https://littleflowerintschool.com/opengraph-image.jpg" },

  // TM English
  { key: "tmenglish-cover", shot: { url: "https://tm-english.org", at: 0 } },
  { key: "tmenglish-band-1", shot: { url: "https://tm-english.org", at: 0.2 } },
  { key: "tmenglish-band-2", shot: { url: "https://tm-english.org", at: 0.7 } },
  { key: "tmenglish-mobile", shot: { url: "https://tm-english.org", at: 0, mobile: true } },
  { key: "tmenglish-og", download: "https://tm-english.org/opengraph-image" },
];

/** Rows to unfeature so they leave the home page. Matched by slug prefix. */
export const DEMOTE = [/^tiger-den-tourism/];

const t = (name, category) => ({ name, icon: name.toLowerCase().replace(/[^a-z0-9]+/g, ""), category });

/*  Image fields hold media KEYS here; the seeder swaps them for stored paths
    and drops any gallery key whose file failed to capture. `cover` falls back
    to `og` (and vice versa) so a card never renders the fallback logo. */
export const projects = [
  {
    slug: "monowara-hospital-digital-front-door",
    title: "Monowara Hospital: A Digital Front Door for a 33 Year Old Hospital",
    subtitle: "Doctors, departments and booking a Dhaka family can find in one tap",
    shortDescription:
      "A bilingual hospital platform for Monowara Hospital, Siddeshwari: doctor directory with schedules, 17 departments, health and surgical packages, diagnostics and WhatsApp first appointments, all run from an admin dashboard.",
    clientName: "Monowara Hospital (Pvt.) Ltd.",
    projectDate: new Date("2026-11-10"),
    serviceTypes: ["website-development", "software-development", "dashboard-development"],
    tags: ["Healthcare", "Hospital", "Bilingual", "Admin Dashboard", "Bangladesh"],
    featured: true,
    displayOrder: 104,
    accentColor: "#0F8B8D",
    layoutStyle: "bento",
    animationTrigger: "pinned-scroll",
    liveUrl: "https://monowarahospital.com",
    techStack: [
      t("Next.js", "frontend"),
      t("Node.js", "backend"),
      t("Express", "backend"),
      t("MongoDB", "database"),
      t("Nodemailer", "backend"),
      t("Role based admin dashboard", "dashboard"),
      t("Technical SEO", "seo"),
    ],
    deliverables: [
      "English and Bangla site from one content source",
      "Find a Doctor directory with department and name filters and per doctor schedules",
      "Doctor detail pages",
      "Department pages and services and facilities overview",
      "Health checkup and fixed price surgical packages, with call for price where the hospital wants it",
      "Diagnostics, maternity and aesthetic clinic sections",
      "WhatsApp first appointment flow with hotline and desk numbers highlighted site wide",
      "Admin dashboard with super admin, admin and marketer roles; hero, doctors, packages and FAQ chatbot all editable",
      "Open Graph and per page SEO, self hosted media on the hospital's own VPS",
    ],
    cover: "monowara-cover",
    og: "monowara-og",
    gallery: [
      ["monowara-building", "The hospital's own building on Siddeshwari Road", "full"],
      ["monowara-band-1", "Departments and services, one scroll from the hero", "full"],
      ["monowara-band-2", "Doctors with schedules and a direct route to booking", "half"],
      ["monowara-mobile", "Built for the phone first: hotline and WhatsApp always in reach", "half"],
    ],
    metaTitle: "Monowara Hospital Website and Admin Platform | STR Solutions Case Study",
    metaDescription:
      "How STR Solutions rebuilt Monowara Hospital's website: bilingual doctor directory, departments, health packages and WhatsApp first booking, managed from a role based dashboard.",
    fullCaseStudy: `<h2>The brief</h2><p>Monowara Hospital has served Dhaka families from its own building in Siddeshwari for more than 33 years, with 100 inpatient beds and a 24/7 emergency. The old WordPress site did not reflect that. Patients phoned to ask which doctor sat on which day, and the answer lived in a printed roster at reception.</p>
<h2>What we built</h2><p>A new platform on Next.js with an Express and MongoDB backend, rebuilt from the ground up and hosted on the hospital's own VPS. The homepage is doctor focused by design: who is available, in which department, on which day, and how to reach them.</p>
<h3>Booking the way Dhaka actually books</h3><p>Most patients here book by calling or sending a WhatsApp message, so the site leans into that instead of fighting it. Every appointment action opens a call for appointment panel with the hotline and the desk WhatsApp numbers, and an online form can be switched on from the dashboard when the hospital is ready for it.</p>
<h3>Packages without awkward pricing</h3><p>Health checkups, surgical packages and maternity packages are published with prices where the hospital wants them public, and call for price where it does not. Diagnostics, the ICU and NICU, dialysis and the aesthetic clinic each get their own section.</p>
<h3>One dashboard, three roles</h3><p>Super admin, admin and marketer roles control the hero banners, doctors and schedules, departments, packages and the fixed answer FAQ chatbot. The marketing team can update a campaign without touching a doctor's roster.</p>
<h2>Where it landed</h2><p>A bilingual site that answers the question patients used to phone in for, and a hospital team that edits its own content. This is now the reference build we show other hospitals in Dhaka.</p>`,
  },

  {
    slug: "warrick-group-corporate-platform",
    title: "Warrick Group: Corporate Platform for a Multi Sector Holding Group",
    subtitle: "One standard of presentation across energy, consumer technology and mobility",
    shortDescription:
      "The corporate site for Warrick Group, a London headquartered holding group: businesses, leadership and governance, sustainability and annual reports, news and routed investor and media enquiries, every page editable from a dashboard.",
    clientName: "Warrick Group",
    projectDate: new Date("2026-10-28"),
    serviceTypes: ["website-development", "dashboard-development"],
    tags: ["Corporate", "Holding Group", "Investor Relations", "CMS", "UK"],
    featured: true,
    displayOrder: 103,
    accentColor: "#1F2A44",
    layoutStyle: "split",
    animationTrigger: "fade-up",
    liveUrl: "https://warrick.group",
    techStack: [
      t("Next.js", "frontend"),
      t("Next.js API routes", "backend"),
      t("MongoDB", "database"),
      t("Nodemailer", "backend"),
      t("Admin dashboard", "dashboard"),
      t("Dashboard controlled SEO", "seo"),
    ],
    deliverables: [
      "Migration of the original React site to full stack Next.js with the design kept intact",
      "Group overview with sector pages for each business",
      "About: leadership and heritage, board of directors, corporate governance",
      "Sustainability and ESG with an annual reports library",
      "Innovation and news with press releases",
      "Enquiry routing for investor relations and media through one form",
      "Admin dashboard: every page's content and SEO editable; super admin controls admin accounts",
      "Self hosted uploads and deployment on a VPS",
    ],
    cover: "warrick-cover",
    og: "warrick-og",
    gallery: [
      ["warrick-band-1", "Sectors presented as one portfolio, not three websites", "full"],
      ["warrick-band-2", "Global footprint and governance, written for investors", "half"],
      ["warrick-mobile", "The same restraint on a phone", "half"],
    ],
    metaTitle: "Warrick Group Corporate Website | STR Solutions Case Study",
    metaDescription:
      "A full stack Next.js corporate platform for Warrick Group: businesses, governance, ESG reporting, news and routed investor and media enquiries, all managed from a dashboard.",
    fullCaseStudy: `<h2>The brief</h2><p>Warrick Group invests across energy infrastructure, consumer technology and mobility, with offices in London, Dubai and Dhaka. Its first site was a React build where every copy change meant a developer and a redeploy. A holding group publishes governance updates, reports and press releases on its own calendar, so that did not scale.</p>
<h2>What we built</h2><p>We moved the site to full stack Next.js and kept the design the group had already approved, so visitors saw no break while everything behind it changed. Content, media and SEO now live in MongoDB and are served from one codebase on the group's VPS.</p>
<h3>Written for the people who read group sites</h3><p>Investors, journalists and prospective partners each want something different. The structure gives each a direct route: businesses by sector, leadership and the board, governance, sustainability with an annual reports library, and news. A single enquiry flow routes investor relations and media requests to the right inbox.</p>
<h3>A dashboard the communications team owns</h3><p>Every page's content and metadata is editable from an admin dashboard. Admins publish; only a super admin can create admin accounts, which keeps access control in one place.</p>
<h2>Where it landed</h2><p>The group publishes its own news, reports and leadership changes the same day, with no developer in the loop and no visible seam from the migration.</p>`,
  },

  {
    slug: "little-flower-international-school-website",
    title: "Little Flower International School: School Website and Family Portal",
    subtitle: "Three mediums, thirteen classes and a 2027 admission drive on one site",
    shortDescription:
      "A website for Little Flower International English Medium School, Mirpur: English Medium, English Version and Bangla Medium explained side by side, admissions, notices, online results, gallery and a portal login for families.",
    clientName: "Little Flower International English Medium School",
    projectDate: new Date("2026-11-05"),
    serviceTypes: ["website-development", "dashboard-development"],
    tags: ["Education", "School", "Admissions", "Bangladesh"],
    featured: true,
    displayOrder: 102,
    accentColor: "#2E1B10",
    layoutStyle: "bento",
    animationTrigger: "fade-up",
    liveUrl: "https://littleflowerintschool.com",
    techStack: [
      t("Next.js", "frontend"),
      t("Node.js", "backend"),
      t("Admin dashboard", "dashboard"),
      t("Family portal", "backend"),
      t("Technical SEO", "seo"),
    ],
    deliverables: [
      "Medium comparison: Cambridge English Medium, English Version and Bangla Medium",
      "Classes from Play Group to SSC across Early Years, Primary and Secondary",
      "Admission information with a four step process and admission notices",
      "Notice board and news and events",
      "Online result and student corner",
      "Facilities, teachers, fees structure and chairman's message",
      "Gallery with hero video and campus tour",
      "Portal login for families",
      "Local SEO, Open Graph and WhatsApp click to chat",
    ],
    cover: "littleflower-cover",
    og: "littleflower-og",
    gallery: [
      ["littleflower-band-1", "Three mediums, explained before a parent has to ask", "full"],
      ["littleflower-band-2", "Results the school has earned over 26 years", "half"],
      ["littleflower-mobile", "Admission open, one tap to call or WhatsApp", "half"],
    ],
    metaTitle: "Little Flower International School Website | STR Solutions Case Study",
    metaDescription:
      "School website for Little Flower International School, Mirpur: three mediums, admissions, notices, online results and a family portal.",
    fullCaseStudy: `<h2>The brief</h2><p>Little Flower has taught children in Kafrul, Mirpur from Play Group to SSC since 2000, in three mediums under one roof. Parents kept asking the same first question at the gate: what is the difference between English Medium, English Version and Bangla Medium, and which one fits my child?</p>
<h2>What we built</h2><p>A Next.js website that answers that question on the homepage, then walks a parent from medium to class to admission. The 2027 admission drive runs from the same place, with a four step process (call or visit, choose a medium, sit the admission test, confirm) and notices the office can post on its own.</p>
<h3>A school's record, stated plainly</h3><p>The school's own record goes where parents look for it: 18 years of a 100% SSC pass rate, 201 A+ results and 531 scholarship winners. Free Hifzul Quran classes and congregational prayers are presented as part of the school day, because for many families here that decides the choice.</p>
<h3>Run by the office, not a developer</h3><p>Notices, news, results and the gallery are managed from a dashboard, and families sign in through a portal login. Hero video and a campus tour let a parent see the building before visiting.</p>
<h2>Where it landed</h2><p>A parent can now choose a medium, read the admission steps and call or WhatsApp the office from the same page, and the office keeps the notices and results current itself.</p>`,
  },

  {
    slug: "tm-english-olevel-tutor-platform",
    title: "TM English: O Level English Tutor Platform with Student Portal",
    subtitle: "A teacher's results, batches and admissions, published and managed from one place",
    shortDescription:
      "A portfolio and admissions platform for Tauhid Mostafa, an O Level English Language teacher in Dhanmondi and Uttara: honor board, batches, notices, reviews, online admission and a student portal with admin roles.",
    clientName: "Tauhid Mostafa (TM English)",
    projectDate: new Date("2026-10-15"),
    serviceTypes: ["website-development", "dashboard-development"],
    tags: ["Education", "Tutor", "Student Portal", "Admissions", "Bangladesh"],
    featured: true,
    displayOrder: 101,
    accentColor: "#8A5A2B",
    layoutStyle: "split",
    animationTrigger: "fade-up",
    liveUrl: "https://tm-english.org",
    techStack: [
      t("Next.js", "frontend"),
      t("Next.js API routes", "backend"),
      t("MongoDB", "database"),
      t("Nodemailer", "backend"),
      t("Student and admin dashboards", "dashboard"),
      t("Technical SEO", "seo"),
    ],
    deliverables: [
      "Portfolio homepage built around the teacher, his method and his results",
      "Honor board by year with the top achievers",
      "Classes and batches for Classes 8, 9 and 10, Dhanmondi and Uttara",
      "Online admission with placement test score entry, verified by admins",
      "Notices, gallery and student reviews",
      "Student dashboard; admin and super admin roles; fees tracked as paid or due, never shown publicly",
      "Self hosted uploads, transactional email, SEO and Open Graph",
    ],
    cover: "tmenglish-cover",
    og: "tmenglish-og",
    gallery: [
      ["tmenglish-band-1", "Results first: the honor board does the persuading", "full"],
      ["tmenglish-band-2", "Batches, locations and admission in one place", "half"],
      ["tmenglish-mobile", "Where students and parents actually browse", "half"],
    ],
    metaTitle: "TM English O Level Tutor Platform | STR Solutions Case Study",
    metaDescription:
      "A Next.js platform for O Level English teacher Tauhid Mostafa: honor board, batches, online admission and a student portal with admin roles.",
    fullCaseStudy: `<h2>The brief</h2><p>Tauhid Mostafa has taught O Level English Language for more than 17 years, at Scholastica, Mastermind, HURDCO and Mentors', and now runs his own batches in Dhanmondi and Uttara. Admissions ran on phone calls and paper forms, and his results lived in WhatsApp screenshots.</p>
<h2>What we built</h2><p>A full stack Next.js platform with MongoDB behind it. The public side is a portfolio built around one idea: "A* is not a mystery. It is a method." The honor board publishes each year's top achievers, so the results make the case on their own.</p>
<h3>Admissions without the paperwork</h3><p>Applicants apply online and enter their own placement test score, which an admin verifies before a seat is confirmed. Notices, batch schedules and seat availability are posted from the dashboard.</p>
<h3>A portal behind the portfolio</h3><p>Students sign in to their own dashboard. One teacher, several admins and a super admin share the work; fees are tracked as paid or due and never appear on the public site. Every user can change their own password, and admins can remove a student's data on request.</p>
<h2>Where it landed</h2><p>Results, batches, admission and the student portal now sit behind one login and one domain, and the paper forms are gone.</p>`,
  },
];

/* Guard: a gallery or cover key that is not in MEDIA is a typo that would
   ship a broken card. Fail on import instead. */
{
  const keys = new Set(MEDIA.map((m) => m.key));
  const used = projects.flatMap((p) => [p.cover, p.og, ...p.gallery.map((g) => g[0])]);
  const unknown = used.filter((k) => !keys.has(k));
  if (unknown.length) throw new Error(`recentProjects.data.js: unknown media keys: ${unknown.join(", ")}`);
  const dupes = used.filter((k, i) => used.indexOf(k) !== i);
  if (dupes.length) throw new Error(`recentProjects.data.js: media key used twice: ${dupes.join(", ")}`);
}
