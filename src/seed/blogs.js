/**
 * Insights — 6 published articles.
 *
 * authorKey is NOT a model field. The runner maps it through authors.js to a
 * real User._id and writes `author`.
 *
 * viewCount is deliberately 0 on every row. The Phase 3 content layer carried
 * illustrative counts (2140, 1685, …); seeding sample content is one thing,
 * seeding invented engagement numbers onto a public site is another.
 *
 * publishedAt is supplied explicitly, so the model's pre-save hook keeps each
 * date instead of stamping "now" across all six.
 */

export const blogs = [
  {
    "title": "Your Next.js site is fast on your laptop and slow on your customer's phone",
    "slug": "fast-on-your-laptop-slow-on-your-customers-phone",
    "excerpt": "Most Bangladeshi traffic arrives on a mid-range Android over a congested network. Here is what that actually changes about how you build.",
    "content": "<p>Every performance conversation we have starts the same way: someone opens the site on a MacBook over office fibre, sees it paint instantly, and concludes there is no problem. Then we open it on a three-year-old Android on a shared mobile connection and the same page takes nine seconds.</p>\n<h2>The device is the bottleneck, not the network</h2><p>Bandwidth in Dhaka is fine. What is not fine is the CPU on the median device parsing 900KB of JavaScript. A modern phone chews through that in 300ms; a mid-range one takes 2.5 seconds, and it does it <strong>before</strong> anything on screen becomes clickable.</p>\n<h2>Three changes that move the number</h2>\n<ul><li><strong>Server-render anything that carries content.</strong> If a route exists for SEO, it should not need JavaScript to show text.</li><li><strong>Budget your JS per route, not per site.</strong> A homepage carrying the checkout bundle is the most common cause we find.</li><li><strong>Test on a throttled profile in CI.</strong> If the regression is not caught by a pipeline it will be caught by a customer.</li></ul>\n<h2>What we do on every build</h2><p>We agree a Core Web Vitals budget in week one and fail the build when a branch breaks it. It is an unpopular meeting and it saves the project.</p>",
    "coverImage": "/websites/paarel-website.png",
    "category": "Engineering",
    "tags": [
      "Performance",
      "Next.js",
      "Core Web Vitals",
      "Mobile"
    ],
    "isPublished": true,
    "publishedAt": "2025-07-22T06:00:00.000Z",
    "metaTitle": "Why your Next.js site is slow on real phones",
    "metaDescription": "Device CPU, not bandwidth, is what makes a Next.js site slow in Bangladesh. Three changes that actually move the number.",
    "authorKey": "arif",
    "viewCount": 0
  },
  {
    "title": "Design systems die in the handover, not in Figma",
    "slug": "design-systems-die-in-the-handover",
    "excerpt": "A component library with no error states, no empty states and no written responsive behaviour is a mood board with a version number.",
    "content": "<p>Every failed design system we have inherited failed at the same seam: the file was beautiful and the handover was a conversation. Six months later the codebase has four button variants that were never designed and two spacing scales.</p>\n<h2>What has to be in the file</h2><ul><li>Every interactive state, drawn — not described in a comment</li><li>Empty, loading, error and permission-denied states for anything that fetches</li><li>Tokens exported as CSS custom properties, not hex values in a table</li><li>Responsive behaviour written as rules, not implied by three artboards</li></ul>\n<h2>The test</h2><p>Hand the file to a developer who was not in the project. If they have to ask a question before they can build the card, the system is not finished.</p>\n<blockquote>The expensive part of a redesign is the ambiguity handed to engineering, not the pixels.</blockquote>",
    "coverImage": "/websites/the-foxes-website.png",
    "category": "Design",
    "tags": [
      "Design Systems",
      "Figma",
      "Handover",
      "Tokens"
    ],
    "isPublished": true,
    "publishedAt": "2025-06-30T06:00:00.000Z",
    "metaTitle": "Design systems die in the handover",
    "metaDescription": "What has to be in a component library before it can survive contact with a codebase.",
    "authorKey": "arif",
    "viewCount": 0
  },
  {
    "title": "Offline-first is a data model decision, not a caching trick",
    "slug": "offline-first-is-a-data-model-decision",
    "excerpt": "Service workers are the easy half. The hard half is deciding what happens when two people edit the same record on two dead connections.",
    "content": "<p>Teams ask for offline support and mean \"cache the pages\". That is fine for a brochure site. For a field application it is not close to enough, because the interesting question is not reading — it is writing.</p>\n<h2>The question that decides your architecture</h2><p>Two technicians open job #4021. Both lose signal. One marks it complete; the other uploads a photo and changes the customer's phone number. Both reconnect. What is true?</p>\n<h2>Three answers, in increasing cost</h2><ul><li><strong>Last write wins, per record.</strong> Cheap, and it silently destroys one person's work.</li><li><strong>Last write wins, per field.</strong> More bookkeeping, merges cleanly in the common case. This is where most field apps should land.</li><li><strong>CRDTs or an operation log.</strong> Correct under any ordering, and a genuine engineering project on its own.</li></ul>\n<p>Pick before you build the sync layer, not after the first support ticket.</p>",
    "coverImage": "/websites/torgeson-website.png",
    "category": "Engineering",
    "tags": [
      "Offline First",
      "React Native",
      "Sync",
      "Architecture"
    ],
    "isPublished": true,
    "publishedAt": "2025-05-14T06:00:00.000Z",
    "metaTitle": "Offline-first is a data model decision",
    "metaDescription": "Conflict resolution, not caching, is what makes an offline-capable app work in the field.",
    "authorKey": "arif",
    "viewCount": 0
  },
  {
    "title": "What 11,400 product images taught us about QC",
    "slug": "what-11400-product-images-taught-us-about-qc",
    "excerpt": "At catalogue scale, the difference between a 1% and a 6% rejection rate is not skill. It is whether feedback is written down.",
    "content": "<p>Volume post-production looks like a skill problem and behaves like a process problem. Two retouchers of identical ability will produce wildly different rejection rates depending on how corrections reach them.</p>\n<h2>Verbal feedback does not survive the night shift</h2><p>A note said across a desk at 4pm is gone by the next batch. We moved every rejection to an annotated frame with the reason attached — colour off swatch, path too tight at the collar, shadow direction inconsistent — and the same retoucher's rate improved without any additional training.</p>\n<h2>The gate matters more than the pipeline</h2><p>One QC pass before batching, done by someone who did not do the retouching, catches the overwhelming majority of what a client would otherwise reject. It costs a fraction of a re-delivery.</p>",
    "coverImage": "/graphics/retouching.jpg",
    "category": "Production",
    "tags": [
      "Post Production",
      "QC",
      "Process",
      "E-Commerce"
    ],
    "isPublished": true,
    "publishedAt": "2025-04-02T06:00:00.000Z",
    "metaTitle": "What 11,400 product images taught us about QC",
    "metaDescription": "Why written, annotated rejection feedback beats talent when you are retouching at catalogue scale.",
    "authorKey": "showfydul",
    "viewCount": 0
  },
  {
    "title": "Stop measuring impressions. Measure cost per qualified lead.",
    "slug": "stop-measuring-impressions",
    "excerpt": "If your reporting dashboard cannot answer what a closed deal cost to acquire, it is a screensaver.",
    "content": "<p>Marketing reports we inherit tend to lead with reach, engagement and click-through. None of those survive a conversation with a finance director, because none of them convert into a number that can be compared against revenue.</p>\n<h2>Wire the tracking to the outcome</h2><p>Conversion events should fire on the thing you want — a qualified form submission, a booked call — and they should fire server-side so an ad blocker does not silently delete a third of your data.</p>\n<h2>Then prune ruthlessly</h2><p>Once cost per qualified lead is visible per campaign, the decision usually makes itself. In most accounts we audit, a minority of campaigns produce nearly all of the qualified pipeline.</p>",
    "coverImage": "/digital/seo-audit-report.jpg",
    "category": "Growth",
    "tags": [
      "SEO",
      "Analytics",
      "Paid Media",
      "Attribution"
    ],
    "isPublished": true,
    "publishedAt": "2025-03-11T06:00:00.000Z",
    "metaTitle": "Stop measuring impressions",
    "metaDescription": "Server-side conversion tracking and cost per qualified lead as the only two numbers that matter.",
    "authorKey": "mahmud",
    "viewCount": 0
  },
  {
    "title": "A 3D render is a sales document, not an artwork",
    "slug": "a-3d-render-is-a-sales-document",
    "excerpt": "Buyers read a floor plan in about four seconds. Everything in the render should be serving that four seconds.",
    "content": "<p>Visualization briefs often arrive asking for realism. Realism is table stakes. What sells a unit is legibility: can a non-technical buyer understand the flow of the space almost immediately?</p>\n<h2>What we change first</h2><ul><li>Furniture at true scale, so the room does not lie about its size</li><li>One consistent light direction across the whole set — mixed lighting reads as a stock library</li><li>Room labels and dimensions on the 2D plan, never only on the 3D</li><li>A single hero angle per unit type, not six near-identical ones</li></ul>\n<h2>And deliver both colour spaces</h2><p>Print CMYK and web sRGB from the same master. A marketing team re-exporting your files is a marketing team introducing errors into your work.</p>",
    "coverImage": "/2d-3d/3d-interior.jpg",
    "category": "Visualization",
    "tags": [
      "3D Render",
      "Real Estate",
      "Floor Plan",
      "Sales"
    ],
    "isPublished": true,
    "publishedAt": "2025-02-05T06:00:00.000Z",
    "metaTitle": "A 3D render is a sales document",
    "metaDescription": "Legibility beats realism when a render's job is to sell a unit off a plan set.",
    "authorKey": "showfydul",
    "viewCount": 0
  }
];

export default blogs;
