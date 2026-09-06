/**
 * Client testimonials.
 *
 * projectSlug is NOT a model field. The runner resolves it to the matching
 * Project._id and writes `projectRef`; a slug with no matching project is
 * seeded as projectRef: null rather than failing the run.
 */

export const testimonials = [
  {
    "clientName": "Rehana Chowdhury",
    "clientDesignation": "Head of E-Commerce",
    "companyName": "Paarel Retail",
    "clientAvatar": "",
    "rating": 5,
    "reviewText": "They rewrote the parts of our storefront that were actually broken and left alone the parts that weren't. Six weeks in we had a checkout that stopped losing orders. The handover document is still what our new developers read on day one.",
    "isFeatured": true,
    "projectSlug": "paarel-smart-retail-commerce"
  },
  {
    "clientName": "David Kettering",
    "clientDesignation": "Operations Director",
    "companyName": "Torgeson Services",
    "clientAvatar": "",
    "rating": 5,
    "reviewText": "We'd been told twice before that offline sync was 'basically impossible' for our use case. STR asked what happens when two technicians edit the same job, built for that answer, and it has held up for a year.",
    "isFeatured": true,
    "projectSlug": "torgeson-field-operations"
  },
  {
    "clientName": "Farhana Karim",
    "clientDesignation": "Marketing Lead",
    "companyName": "Riverside Developments",
    "clientAvatar": "",
    "rating": 5,
    "reviewText": "Forty units sold off a plan set and their renders. We didn't take a single site photograph during the pre-launch. Turnaround was quicker than the agency we used before, and the print files came back correct the first time.",
    "isFeatured": true,
    "projectSlug": "riverside-residences-visualization-suite"
  },
  {
    "clientName": "Imran Sabet",
    "clientDesignation": "Managing Director",
    "companyName": "Innoel Technology Ltd.",
    "clientAvatar": "",
    "rating": 5,
    "reviewText": "Quoting used to take a day and half of it was checking whether the stock number was real. Now it's twenty minutes and nobody argues about it. That's the whole review.",
    "isFeatured": true,
    "projectSlug": "innoel-technology"
  },
  {
    "clientName": "Amelia Rowe",
    "clientDesignation": "Director of Fundraising",
    "companyName": "London Youth Foundation",
    "clientAvatar": "",
    "rating": 5,
    "reviewText": "They pushed back on our brief, which nobody had done before. The donation flow ended up simpler than what we asked for and roughly twice as many people finish it.",
    "isFeatured": false,
    "projectSlug": "london-youth-foundation"
  }
];

export default testimonials;
