/**
 * The /packages dataset, verbatim from the static page this route replaces.
 *
 * ── WHY THE DATA IS A SEPARATE FILE FROM THE SEEDER ──────────────────────
 * The seeder is about forty lines of upsert logic that will not change again.
 * This is six hundred lines of copy in two languages that will be read,
 * diffed and argued over. Keeping them apart means a translation fix is a
 * diff nobody has to review for database semantics, and the seeder stays
 * short enough to actually read before running it against production.
 *
 * ⚑ THIS IS A STARTING POINT, NOT A SOURCE OF TRUTH.
 * Once the seed has run, the database is the source of truth and /admin/packages
 * is how it changes. Re-running the seeder overwrites whatever an editor has
 * since typed — see the guard at the top of packages.seed.js. Do not "keep
 * this file in sync" with the dashboard; that is two sources of truth and they
 * will disagree silently, which is the exact failure lib/api.js in the
 * frontend was rewritten to eliminate.
 *
 * Bengali follows BD dev-writing convention: technical terms stay in English
 * (JWT, Redis, WooCommerce, SSLCommerz), everything else is translated.
 */

export const categories = [
  {
    key: "business",
    icon: "business",
    order: 1,
    en: {
      title: "Business & Corporate",
      platform: "Custom MERN / Next.js",
      bestFor:
        "Companies, startups and professionals who need a credible presence, lead generation and easy content management — not a store.",
    },
    bn: {
      title: "বিজনেস ও কর্পোরেট",
      platform: "কাস্টম MERN / Next.js",
      bestFor:
        "যেসব কোম্পানি, স্টার্টআপ বা প্রফেশনালের দরকার একটি বিশ্বাসযোগ্য অনলাইন উপস্থিতি, লিড জেনারেশন আর সহজ কন্টেন্ট ম্যানেজমেন্ট — স্টোর নয়।",
    },
  },
  {
    key: "custom",
    icon: "custom",
    order: 2,
    en: {
      title: "Custom E-Commerce",
      platform: "MERN Stack / Full Custom",
      bestFor:
        "Businesses that need ultra-fast speed, custom UI/UX, high-concurrency handling and total ownership of platform & data.",
    },
    bn: {
      title: "কাস্টম ই-কমার্স",
      platform: "MERN স্ট্যাক / ফুল কাস্টম",
      bestFor:
        "যেসব ব্যবসার দরকার আল্ট্রা-ফাস্ট স্পিড, কাস্টম UI/UX, হাই-কনকারেন্সি হ্যান্ডলিং এবং প্ল্যাটফর্ম ও ডেটার সম্পূর্ণ মালিকানা।",
    },
  },
  {
    key: "wordpress",
    icon: "wordpress",
    order: 3,
    en: {
      title: "WordPress Store",
      platform: "WooCommerce",
      bestFor:
        "Clients who want an easy-to-manage CMS, built-in blogging and cost-effective scalability.",
    },
    bn: {
      title: "ওয়ার্ডপ্রেস স্টোর",
      platform: "WooCommerce",
      bestFor: "যারা সহজে ম্যানেজ করা যায় এমন CMS, বিল্ট-ইন ব্লগিং এবং সাশ্রয়ী স্কেলেবিলিটি চান।",
    },
  },
  {
    key: "shopify",
    icon: "shopify",
    order: 4,
    en: {
      title: "Shopify Store",
      platform: "Shopify Platform",
      bestFor:
        "Merchants who want a reliable, hosted store without managing servers or technical maintenance.",
    },
    bn: {
      title: "শপিফাই স্টোর",
      platform: "শপিফাই প্ল্যাটফর্ম",
      bestFor:
        "যারা সার্ভার বা টেকনিক্যাল মেইনটেন্যান্সের ঝামেলা ছাড়াই একটি নির্ভরযোগ্য হোস্টেড স্টোর চান।",
    },
  },
];

/* `price` carries the figures that were in packagePrices, keyed by the same
   ids. `amount` is what renders large; `original` is struck through and the
   percentage badge is derived from the pair, so it must be the higher number. */
export const tiers = [
  /* ── Business & Corporate ──────────────────────────────────────────── */
  {
    code: "BIZ-01",
    categoryKey: "business",
    order: 1,
    price: { amount: 10000, original: 20000 },
    en: {
      segment: "Starter",
      name: "Landing Package",
      badge: "One-page launch",
      features: [
        { label: "UI / UX", value: "Single-page responsive landing, fully custom design." },
        { label: "Pages", value: "Hero, Services, About, Testimonials, Contact." },
        { label: "Features", value: "Lead-capture form, WhatsApp & email routing, base SEO meta." },
        { label: "Content", value: "Static content, developer-managed." },
        { label: "Performance", value: "Next.js SSG, Core Web Vitals 90+." },
      ],
    },
    bn: {
      segment: "স্টার্টার",
      name: "ল্যান্ডিং প্যাকেজ",
      badge: "এক-পেজ লঞ্চ",
      features: [
        { label: "UI / UX", value: "সিঙ্গেল-পেজ রেসপনসিভ ল্যান্ডিং, সম্পূর্ণ কাস্টম ডিজাইন।" },
        { label: "পেজ", value: "হিরো, সার্ভিস, অ্যাবাউট, টেস্টিমোনিয়াল, কন্টাক্ট।" },
        { label: "ফিচার", value: "লিড-ক্যাপচার ফর্ম, WhatsApp ও ইমেইল রাউটিং, বেসিক SEO মেটা।" },
        { label: "কন্টেন্ট", value: "স্ট্যাটিক কন্টেন্ট, ডেভেলপার-ম্যানেজড।" },
        { label: "পারফরম্যান্স", value: "Next.js SSG, Core Web Vitals 90+।" },
      ],
    },
  },
  {
    code: "BIZ-02",
    categoryKey: "business",
    order: 2,
    highlighted: true,
    price: { amount: 40500, original: 45000 },
    en: {
      segment: "Professional",
      name: "Corporate Package",
      badge: "Growth ready",
      features: [
        { label: "UI / UX", value: "Multi-page custom UI with a reusable component system." },
        { label: "Pages", value: "Home, Services, Portfolio, Blog, Team, Careers, Contact." },
        {
          label: "Features",
          value: "Headless CMS for pages & blog, dynamic SEO manager, inquiry pipeline.",
        },
        {
          label: "Integrations",
          value: "GA4, Google Tag Manager, Meta Pixel, newsletter (Mailchimp/Resend).",
        },
        { label: "Admin", value: "Custom dashboard for content, blogs and leads." },
      ],
    },
    bn: {
      segment: "প্রফেশনাল",
      name: "কর্পোরেট প্যাকেজ",
      badge: "গ্রোথ-রেডি",
      features: [
        { label: "UI / UX", value: "রিইউজেবল কম্পোনেন্ট সিস্টেমসহ মাল্টি-পেজ কাস্টম UI।" },
        { label: "পেজ", value: "হোম, সার্ভিস, পোর্টফোলিও, ব্লগ, টিম, ক্যারিয়ার, কন্টাক্ট।" },
        {
          label: "ফিচার",
          value: "পেজ ও ব্লগের জন্য হেডলেস CMS, ডাইনামিক SEO ম্যানেজার, ইনকোয়ারি পাইপলাইন।",
        },
        {
          label: "ইন্টিগ্রেশন",
          value: "GA4, Google Tag Manager, Meta Pixel, নিউজলেটার (Mailchimp/Resend)।",
        },
        { label: "অ্যাডমিন", value: "কন্টেন্ট, ব্লগ ও লিডের জন্য কাস্টম ড্যাশবোর্ড।" },
      ],
    },
  },
  {
    code: "BIZ-03",
    categoryKey: "business",
    order: 3,
    price: { amount: 150000, from: true },
    en: {
      segment: "Enterprise",
      name: "Platform Package",
      badge: "Scalable platform",
      features: [
        { label: "UI / UX", value: "Design-system-driven UI with motion and WCAG accessibility." },
        {
          label: "Features",
          value: "Role-based auth (RBAC), client/customer portal, multi-language (i18n).",
        },
        {
          label: "Architecture",
          value: "Modular MERN / Next.js, Redis caching, rate-limiting, audit logs.",
        },
        {
          label: "Automation",
          value: "CRM / ERP API integration, scheduled reports, webhook events.",
        },
        {
          label: "Security & Ops",
          value: "JWT + refresh rotation, input sanitisation, CI/CD, monitoring.",
        },
      ],
    },
    bn: {
      segment: "এন্টারপ্রাইজ",
      name: "প্ল্যাটফর্ম প্যাকেজ",
      badge: "স্কেলেবল প্ল্যাটফর্ম",
      features: [
        { label: "UI / UX", value: "মোশন ও WCAG অ্যাক্সেসিবিলিটিসহ ডিজাইন-সিস্টেম-ভিত্তিক UI।" },
        {
          label: "ফিচার",
          value: "রোল-বেজড অথ (RBAC), ক্লায়েন্ট/কাস্টমার পোর্টাল, মাল্টি-ল্যাঙ্গুয়েজ (i18n)।",
        },
        {
          label: "আর্কিটেকচার",
          value: "মডিউলার MERN / Next.js, Redis ক্যাশিং, রেট-লিমিটিং, অডিট লগ।",
        },
        { label: "অটোমেশন", value: "CRM / ERP API ইন্টিগ্রেশন, শিডিউলড রিপোর্ট, webhook ইভেন্ট।" },
        {
          label: "সিকিউরিটি ও Ops",
          value: "JWT + রিফ্রেশ রোটেশন, ইনপুট স্যানিটাইজেশন, CI/CD, মনিটরিং।",
        },
      ],
    },
  },

  /* ── Custom E-Commerce ─────────────────────────────────────────────── */
  {
    code: "MERN-01",
    categoryKey: "custom",
    order: 1,
    price: { amount: 20000, original: 40000 },
    en: {
      segment: "Starter",
      name: "MVP Package",
      badge: "MVP / launch",
      features: [
        { label: "UI / UX", value: "Fully responsive custom UI (single layout)." },
        { label: "Pages", value: "Home, Shop, Product Details, Cart, Checkout, basic Admin." },
        { label: "Features", value: "JWT / Mobile-OTP auth, product search & filters." },
        { label: "Payment", value: "Cash on Delivery + manual bKash/Nagad fields." },
        { label: "Performance", value: "Next.js SSR/SSG, Speed Index 90+." },
      ],
    },
    bn: {
      segment: "স্টার্টার",
      name: "MVP প্যাকেজ",
      badge: "MVP / লঞ্চ",
      features: [
        { label: "UI / UX", value: "সম্পূর্ণ রেসপনসিভ কাস্টম UI (সিঙ্গেল লেআউট)।" },
        { label: "পেজ", value: "হোম, শপ, প্রোডাক্ট ডিটেইলস, কার্ট, চেকআউট, বেসিক অ্যাডমিন।" },
        { label: "ফিচার", value: "JWT / মোবাইল-OTP অথ, প্রোডাক্ট সার্চ ও ফিল্টার।" },
        { label: "পেমেন্ট", value: "ক্যাশ অন ডেলিভারি + ম্যানুয়াল bKash/Nagad ফিল্ড।" },
        { label: "পারফরম্যান্স", value: "Next.js SSR/SSG, Speed Index 90+।" },
      ],
    },
  },
  {
    code: "MERN-02",
    categoryKey: "custom",
    order: 2,
    highlighted: true,
    price: { amount: 63000, original: 70000 },
    en: {
      segment: "Standard",
      name: "Standard Package",
      badge: "Most popular",
      features: [
        { label: "UI / UX", value: "Multi-layout custom UI with modern component design." },
        { label: "Pages", value: "All Starter pages + wishlist, user dashboard, coupon system." },
        { label: "Features", value: "Cron-based flash sales, auto PDF invoices, automated SMS." },
        {
          label: "Payment & Courier",
          value: "SSLCommerz/Shurjopay + Steadfast/Pathao courier API.",
        },
        { label: "Admin", value: "Complete custom admin dashboard & inventory." },
      ],
    },
    bn: {
      segment: "স্ট্যান্ডার্ড",
      name: "স্ট্যান্ডার্ড প্যাকেজ",
      badge: "সবচেয়ে জনপ্রিয়",
      features: [
        { label: "UI / UX", value: "মডার্ন কম্পোনেন্ট ডিজাইনসহ মাল্টি-লেআউট কাস্টম UI।" },
        { label: "পেজ", value: "সব Starter পেজ + উইশলিস্ট, ইউজার ড্যাশবোর্ড, কুপন সিস্টেম।" },
        { label: "ফিচার", value: "Cron-ভিত্তিক ফ্ল্যাশ সেল, অটো PDF ইনভয়েস, অটোমেটেড SMS।" },
        {
          label: "পেমেন্ট ও কুরিয়ার",
          value: "SSLCommerz/Shurjopay + Steadfast/Pathao কুরিয়ার API।",
        },
        { label: "অ্যাডমিন", value: "সম্পূর্ণ কাস্টম অ্যাডমিন ড্যাশবোর্ড ও ইনভেন্টরি।" },
      ],
    },
  },
  {
    code: "MERN-03",
    categoryKey: "custom",
    order: 3,
    price: { amount: 100000, from: true, custom: true },
    en: {
      segment: "Enterprise",
      name: "Scale Package",
      badge: "High-scale",
      features: [
        { label: "UI / UX", value: "Enterprise-grade UI system with micro-animations." },
        {
          label: "Features",
          value: "Multi-vendor / multi-warehouse inventory, Redis caching, real-time analytics.",
        },
        {
          label: "Automation",
          value: "Webhook-driven abandoned-cart recovery, custom CRM/ERP API.",
        },
        { label: "Access", value: "Role-based access control (Admin, Manager, Fulfillment)." },
        { label: "Security", value: "Advanced enterprise security & load management." },
      ],
    },
    bn: {
      segment: "এন্টারপ্রাইজ",
      name: "স্কেল প্যাকেজ",
      badge: "হাই-স্কেল",
      features: [
        { label: "UI / UX", value: "মাইক্রো-অ্যানিমেশনসহ এন্টারপ্রাইজ-গ্রেড UI সিস্টেম।" },
        {
          label: "ফিচার",
          value: "মাল্টি-ভেন্ডর / মাল্টি-ওয়্যারহাউস ইনভেন্টরি, Redis ক্যাশিং, রিয়েল-টাইম অ্যানালিটিক্স।",
        },
        { label: "অটোমেশন", value: "Webhook-ভিত্তিক অ্যাবানডনড কার্ট রিকভারি, কাস্টম CRM/ERP API।" },
        { label: "অ্যাক্সেস", value: "রোল-বেজড অ্যাক্সেস কন্ট্রোল (Admin, Manager, Fulfillment)।" },
        { label: "সিকিউরিটি", value: "অ্যাডভান্সড এন্টারপ্রাইজ সিকিউরিটি ও লোড ম্যানেজমেন্ট।" },
      ],
    },
  },

  /* ── WordPress / WooCommerce ───────────────────────────────────────── */
  {
    code: "WOO-01",
    categoryKey: "wordpress",
    order: 1,
    price: { amount: 10000, original: 20000 },
    en: {
      segment: "Starter",
      name: "Fast-Launch Package",
      badge: "Single product / basic",
      features: [
        { label: "Setup", value: "Premium theme + Elementor & WooCommerce configuration." },
        { label: "Catalog", value: "50–100 product uploads with category setup." },
        {
          label: "Features",
          value: "1-page fast checkout, social chat widgets (WhatsApp/Messenger).",
        },
        { label: "Payment", value: "Cash on Delivery + manual bKash/Nagad form." },
        { label: "Security", value: "Base hardening & cache optimisation (WP Rocket / LSCache)." },
      ],
    },
    bn: {
      segment: "স্টার্টার",
      name: "ফাস্ট-লঞ্চ প্যাকেজ",
      badge: "সিঙ্গেল প্রোডাক্ট / বেসিক",
      features: [
        { label: "সেটআপ", value: "প্রিমিয়াম থিম + Elementor ও WooCommerce কনফিগারেশন।" },
        { label: "ক্যাটালগ", value: "৫০–১০০ প্রোডাক্ট আপলোড ও ক্যাটাগরি সেটআপ।" },
        { label: "ফিচার", value: "১-পেজ ফাস্ট চেকআউট, সোশ্যাল চ্যাট উইজেট (WhatsApp/Messenger)।" },
        { label: "পেমেন্ট", value: "ক্যাশ অন ডেলিভারি + ম্যানুয়াল bKash/Nagad ফর্ম।" },
        { label: "সিকিউরিটি", value: "বেসিক হার্ডেনিং ও ক্যাশ অপটিমাইজেশন (WP Rocket / LSCache)।" },
      ],
    },
  },
  {
    code: "WOO-02",
    categoryKey: "wordpress",
    order: 2,
    highlighted: true,
    price: { amount: 27000, original: 30000 },
    en: {
      segment: "Business",
      name: "Business Package",
      badge: "Best for the BD market",
      features: [
        { label: "Setup", value: "Custom Elementor Pro page layouts." },
        {
          label: "Features",
          value: "Advanced AJAX product filters, dynamic coupon engine, automated SMS gateway.",
        },
        { label: "Integration", value: "Automated Steadfast / Pathao shipping API." },
        { label: "Payment", value: "bKash Merchant API / SSLCommerz gateway." },
        {
          label: "SEO & Analytics",
          value: "RankMath SEO, GA4 & Meta Pixel with Conversion API.",
        },
      ],
    },
    bn: {
      segment: "বিজনেস",
      name: "বিজনেস প্যাকেজ",
      badge: "BD মার্কেটের জন্য সেরা",
      features: [
        { label: "সেটআপ", value: "কাস্টম Elementor Pro পেজ লেআউট।" },
        {
          label: "ফিচার",
          value: "অ্যাডভান্সড AJAX প্রোডাক্ট ফিল্টার, ডাইনামিক কুপন ইঞ্জিন, অটোমেটেড SMS গেটওয়ে।",
        },
        { label: "ইন্টিগ্রেশন", value: "অটোমেটেড Steadfast / Pathao শিপিং API।" },
        { label: "পেমেন্ট", value: "bKash Merchant API / SSLCommerz গেটওয়ে।" },
        {
          label: "SEO ও অ্যানালিটিক্স",
          value: "RankMath SEO, GA4 ও Meta Pixel (Conversion API সহ)।",
        },
      ],
    },
  },
  {
    code: "WOO-03",
    categoryKey: "wordpress",
    order: 3,
    price: { amount: 36000, original: 40000 },
    en: {
      segment: "Premium",
      name: "Premium Package",
      badge: "Advanced WooCommerce",
      features: [
        { label: "Setup", value: "High-performance custom theme / headless WooCommerce." },
        { label: "Features", value: "B2B / wholesale pricing, member roles, Dokan Pro multi-vendor." },
        { label: "Automation", value: "Automated email & SMS abandoned-cart recovery." },
        { label: "Security", value: "Cloudflare Enterprise, DB optimisation & security hardening." },
      ],
    },
    bn: {
      segment: "প্রিমিয়াম",
      name: "প্রিমিয়াম প্যাকেজ",
      badge: "অ্যাডভান্সড WooCommerce",
      features: [
        { label: "সেটআপ", value: "হাই-পারফরম্যান্স কাস্টম থিম / হেডলেস WooCommerce।" },
        { label: "ফিচার", value: "B2B / হোলসেল প্রাইসিং, মেম্বার রোল, Dokan Pro মাল্টি-ভেন্ডর।" },
        { label: "অটোমেশন", value: "অটোমেটেড ইমেইল ও SMS অ্যাবানডনড কার্ট রিকভারি।" },
        { label: "সিকিউরিটি", value: "Cloudflare Enterprise, DB অপটিমাইজেশন ও সিকিউরিটি হার্ডেনিং।" },
      ],
    },
  },

  /* ── Shopify ───────────────────────────────────────────────────────── */
  {
    code: "SHOP-01",
    categoryKey: "shopify",
    order: 1,
    price: { amount: 40000 },
    en: {
      segment: "Starter",
      name: "Quick-Store Package",
      badge: "Quick brand setup",
      features: [
        { label: "Theme", value: "Official free-theme customisation (e.g. Dawn)." },
        { label: "Catalog", value: "Up to 50 products with collections setup." },
        { label: "Features", value: "BD-special 1-click COD checkout form, WhatsApp button." },
        { label: "Payment", value: "Manual bKash/Nagad & Cash on Delivery setup." },
        { label: "Channels", value: "Facebook & Instagram Shop integration." },
      ],
    },
    bn: {
      segment: "স্টার্টার",
      name: "কুইক-স্টোর প্যাকেজ",
      badge: "দ্রুত ব্র্যান্ড সেটআপ",
      features: [
        { label: "থিম", value: "অফিশিয়াল ফ্রি-থিম কাস্টমাইজেশন (যেমন Dawn)।" },
        { label: "ক্যাটালগ", value: "৫০টি পর্যন্ত প্রোডাক্ট ও কালেকশন সেটআপ।" },
        { label: "ফিচার", value: "BD-স্পেশাল ১-ক্লিক COD চেকআউট ফর্ম, WhatsApp বাটন।" },
        { label: "পেমেন্ট", value: "ম্যানুয়াল bKash/Nagad ও ক্যাশ অন ডেলিভারি সেটআপ।" },
        { label: "চ্যানেল", value: "Facebook ও Instagram Shop ইন্টিগ্রেশন।" },
      ],
    },
  },
  {
    code: "SHOP-02",
    categoryKey: "shopify",
    order: 2,
    highlighted: true,
    price: { amount: 50000, original: 60000 },
    en: {
      segment: "Growth",
      name: "Growth Package",
      badge: "For scaling brands",
      features: [
        { label: "Theme", value: "Premium theme or custom Liquid section development." },
        { label: "Features", value: "Custom COD fields, Steadfast/Pathao courier app setup." },
        { label: "Marketing", value: "BOGO offers, tiered volume discounts, photo-reviews app." },
        { label: "Tracking", value: "Meta Pixel (CAPI) & Google Analytics 4." },
        {
          label: "Optimisation",
          value: "Full store speed & conversion-rate optimisation (CRO).",
        },
      ],
    },
    bn: {
      segment: "গ্রোথ",
      name: "গ্রোথ প্যাকেজ",
      badge: "স্কেলিং ব্র্যান্ডের জন্য",
      features: [
        { label: "থিম", value: "প্রিমিয়াম থিম বা কাস্টম Liquid সেকশন ডেভেলপমেন্ট।" },
        { label: "ফিচার", value: "কাস্টম COD ফিল্ড, Steadfast/Pathao কুরিয়ার অ্যাপ সেটআপ।" },
        { label: "মার্কেটিং", value: "BOGO অফার, টায়ার্ড ভলিউম ডিসকাউন্ট, ফটো-রিভিউ অ্যাপ।" },
        { label: "ট্র্যাকিং", value: "Meta Pixel (CAPI) ও Google Analytics 4।" },
        { label: "অপটিমাইজেশন", value: "ফুল স্টোর স্পিড ও কনভার্সন-রেট অপটিমাইজেশন (CRO)।" },
      ],
    },
  },
  {
    code: "SHOP-03",
    categoryKey: "shopify",
    order: 3,
    price: { amount: 110000, original: 120000 },
    en: {
      segment: "Advanced",
      name: "Advanced Package",
      badge: "Custom Liquid / enterprise",
      features: [
        { label: "Theme", value: "Fully custom Liquid theme (zero app overload for core UI)." },
        {
          label: "Features",
          value: "High-converting custom landing pages, post-purchase upsells.",
        },
        { label: "Global", value: "Multi-currency & international markets via Shopify Markets." },
        { label: "Automation", value: "Custom API middleware & automated cart recovery." },
      ],
    },
    bn: {
      segment: "অ্যাডভান্সড",
      name: "অ্যাডভান্সড প্যাকেজ",
      badge: "কাস্টম Liquid / এন্টারপ্রাইজ",
      features: [
        { label: "থিম", value: "সম্পূর্ণ কাস্টম Liquid থিম (কোর UI-তে জিরো অ্যাপ ওভারলোড)।" },
        { label: "ফিচার", value: "হাই-কনভার্টিং কাস্টম ল্যান্ডিং পেজ, পোস্ট-পারচেজ আপসেল।" },
        { label: "গ্লোবাল", value: "Shopify Markets দিয়ে মাল্টি-কারেন্সি ও ইন্টারন্যাশনাল মার্কেট।" },
        { label: "অটোমেশন", value: "কাস্টম API মিডলওয়্যার ও অটোমেটেড কার্ট রিকভারি।" },
      ],
    },
  },
];

/**
 * The copy around the grid.
 *
 * The headline is one plain string rather than the lead/highlight/tail triple
 * the static page used: PageMasthead splits the heading into word nodes for
 * its reveal, and an inline <span> inside it would not survive the split. See
 * the note on heroSchema in models/PackagePage.js.
 */
export const page = {
  en: {
    hero: {
      eyebrow: "Packages",
      title: "Published rates, from a one-page launch to a marketplace.",
      lede: "Pick a starting point or let us shape something custom for your brand. Every figure below is a fixed-scope project price in taka, not an hourly estimate — what changes the number is scope, never the discovery call.",
      trust: "Selected from 18 launched projects — Bangladesh, the Gulf, Europe and beyond.",
    },
    essentials: {
      kicker: "Included in every pro package",
      title: "Built for the way Bangladesh buys.",
      items: [
        {
          title: "1-click quick checkout",
          value: "Fast, mobile-friendly ordering with no tedious signup.",
        },
        {
          title: "Local payment gateways",
          value: "Native bKash, Nagad, Rocket and SSLCommerz integration.",
        },
        {
          title: "Courier API automation",
          value: "Instant tracking-ID generation with Steadfast and Pathao.",
        },
        {
          title: "SMS notifications",
          value: "Automatic order-confirmation and dispatch alerts to customers.",
        },
      ],
    },
    closing: {
      title: "Not sure which one fits?",
      body: "Tell us about your product and audience — we will recommend the right stack and a fixed-scope quote within 24 hours.",
      primaryCta: "Get a free quote",
      secondaryCta: "Book a call",
    },
  },
  bn: {
    hero: {
      eyebrow: "প্যাকেজ",
      title: "এক পেজের ল্যান্ডিং থেকে মার্কেটপ্লেস — সব রেট প্রকাশ্যে।",
      lede: "শুরুর জন্য একটি প্যাকেজ বেছে নিন, কিংবা আপনার ব্র্যান্ডের জন্য কাস্টম কিছু বানিয়ে নিন। নিচের প্রতিটি দাম টাকায় ফিক্সড-স্কোপ প্রজেক্ট প্রাইস — ঘণ্টাভিত্তিক এস্টিমেট নয়। দাম বদলায় শুধু স্কোপে, মিটিংয়ে নয়।",
      trust: "১৮টি লঞ্চ করা প্রজেক্ট থেকে বাছাই — বাংলাদেশ, গালফ, ইউরোপ ও আরও অনেক দেশে।",
    },
    essentials: {
      kicker: "প্রতিটি প্রো প্যাকেজে অন্তর্ভুক্ত",
      title: "বাংলাদেশ যেভাবে কেনে, সেভাবেই তৈরি।",
      items: [
        {
          title: "১-ক্লিক কুইক চেকআউট",
          value: "ঝামেলাহীন সাইনআপ ছাড়াই দ্রুত, মোবাইল-ফ্রেন্ডলি অর্ডার।",
        },
        {
          title: "লোকাল পেমেন্ট গেটওয়ে",
          value: "নেটিভ bKash, Nagad, Rocket ও SSLCommerz ইন্টিগ্রেশন।",
        },
        {
          title: "কুরিয়ার API অটোমেশন",
          value: "Steadfast ও Pathao-তে ইনস্ট্যান্ট ট্র্যাকিং-আইডি জেনারেশন।",
        },
        {
          title: "SMS নোটিফিকেশন",
          value: "কাস্টমারকে অটো অর্ডার-কনফার্মেশন ও ডিসপ্যাচ অ্যালার্ট।",
        },
      ],
    },
    closing: {
      title: "কোনটি আপনার জন্য, নিশ্চিত নন?",
      body: "আপনার প্রোডাক্ট আর অডিয়েন্স সম্পর্কে বলুন — ২৪ ঘণ্টার মধ্যে সঠিক স্ট্যাক আর একটি ফিক্সড-স্কোপ কোটেশন সাজেস্ট করব।",
      primaryCta: "ফ্রি কোটেশন নিন",
      secondaryCta: "কল বুক করুন",
    },
  },

  /* Live external sites. `group` splits the list into two labelled rows; the
     labels themselves are in str-frontend/lib/packagesUi.js because they are
     interface copy, while these names and hostnames are not translated. */
  showcase: [
    { name: "Innoel", url: "https://innoelbd.com/", group: "custom" },
    { name: "Paarel", url: "https://paarel.com/", group: "custom" },
    { name: "Zuzuva", url: "https://zuzuva.com/", group: "custom" },

    { name: "Terea Vibe", url: "https://tereavibe.ae/", group: "wp-shopify" },
    {
      name: "Australian Cosmetic Institute",
      url: "https://www.australiancosmeticinstitute.com.au/",
      group: "wp-shopify",
    },
    { name: "London Youth Games", url: "https://www.londonyouthgames.org/", group: "wp-shopify" },
    { name: "The Foxes Photography", url: "https://thefoxesphotography.com/", group: "wp-shopify" },
    { name: "Torgeson Electric", url: "https://www.torgesonelectric.com/", group: "wp-shopify" },
    /* ⚑ theverahotel.com and 4one.ag were http:// on the legacy page. The
       schema and validator accept https only — an http image or link is mixed
       content on an https site and the browser blocks it — so both are listed
       here on https. If either does not serve https, remove the row rather
       than downgrading the rule for all of them. */
    { name: "The Vera Hotel", url: "https://theverahotel.com/", group: "wp-shopify" },
    { name: "Teads", url: "https://www.teads.com/", group: "wp-shopify" },
    { name: "4one", url: "https://4one.ag/", group: "wp-shopify" },
    { name: "Riverside Cottages", url: "https://riversidecottagesalf.com/", group: "wp-shopify" },
  ],
};

export default { categories, tiers, page };
