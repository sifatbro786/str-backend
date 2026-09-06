/**
 * Demo leads, so /admin/inquiries and the overview cards are not empty.
 *
 * Every row is marked DEMO LEAD in `notes` and uses a reserved example domain,
 * so none of them can be mistaken for a real client or emailed by accident.
 *
 * Skip them:    npm run seed -- --skip-inquiries
 * Remove them:  npm run seed -- --fresh --skip-inquiries
 */

export const inquiries = [
  {
    "senderName": "Rezaul Karim",
    "senderEmail": "rezaul.karim@example.com",
    "phone": "+880 1711-000000",
    "serviceInterested": "Web Development",
    "budgetRange": "$5,000 – $15,000",
    "message": "We run a wholesale business with about 900 SKUs currently managed in spreadsheets. We need a customer-facing catalogue and an internal ordering panel. The constraint is that our sales team is on mid-range Android phones in the field, so it has to be fast on those.",
    "status": "new",
    "notes": "DEMO LEAD — seeded sample data. Safe to delete."
  },
  {
    "senderName": "Claire Whitfield",
    "senderEmail": "claire@example.co.uk",
    "phone": "+44 7700 900123",
    "serviceInterested": "Architectural Visualization",
    "budgetRange": "$2,000 – $5,000",
    "message": "We have a 42-unit residential development going to market in eight weeks and need exterior renders plus two interior sets. Drawings are in Revit. What turnaround can you commit to, and what do you need from us on day one?",
    "status": "new",
    "notes": "DEMO LEAD — seeded sample data. Safe to delete."
  },
  {
    "senderName": "Tanvir Ahmed",
    "senderEmail": "tanvir@example.com",
    "phone": "+880 1822-000000",
    "serviceInterested": "Custom Software",
    "budgetRange": "$15,000 – $50,000",
    "message": "Our courier operation runs on three disconnected tools and a WhatsApp group. We need one system for dispatch, proof of delivery and reconciliation. A previous vendor got about 60% of the way and stopped responding, so there is an existing codebase to audit first.",
    "status": "contacted",
    "notes": "DEMO LEAD — seeded sample data. Safe to delete. Illustrates the rescue-engagement path."
  },
  {
    "senderName": "Sadia Rahman",
    "senderEmail": "sadia@example.com",
    "phone": "",
    "serviceInterested": "Graphics Design",
    "budgetRange": "Under $2,000",
    "message": "We push roughly 400 product images a month to a Shopify store and our current editor keeps missing the shadow work. Looking for a bulk retouching partner with a 48-hour turnaround and a QC process we can actually see.",
    "status": "contacted",
    "notes": "DEMO LEAD — seeded sample data. Safe to delete."
  },
  {
    "senderName": "Michael Osei",
    "senderEmail": "m.osei@example.org",
    "phone": "",
    "serviceInterested": "Digital Marketing",
    "budgetRange": "Not sure yet",
    "message": "Nonprofit, small team. We get traffic but almost no donations, and we cannot tell which channel is doing anything at all. Before spending on ads we want someone to tell us honestly whether the site is the problem.",
    "status": "closed",
    "notes": "DEMO LEAD — seeded sample data. Safe to delete."
  }
];

export default inquiries;
