/**
 * Team — five board members and four retained consultants.
 *
 * Names, designations and biographies are the REAL ones, recovered from the
 * legacy STR project (TeamSection.tsx and SpecialistsShowcase.tsx). They replace
 * the Phase 3 reconstructions marked with a flag in str-frontend/lib/data.js.
 *
 * socialLinks are intentionally empty: every social URL in the legacy source was
 * a bare placeholder (https://linkedin.com/in/, https://facebook.com/). Add the
 * real profile URLs from /admin/team rather than shipping links to nowhere.
 *
 * VERIFY BEFORE LAUNCH: the legacy site listed "Arifur Rahman" (Director) and
 * "Md. Arif" (Web & Mobile Developer) as two separate people on two separate
 * components. If they are one person, delete a row in /admin/team.
 */

export const team = [
  {
    "name": "Robiul Islam",
    "designation": "Chairman",
    "bio": "At STR Solutions we believe in innovation, integrity and impact. Since our inception the goal has been to build a company that delivers excellent services and drives positive change across industries and communities.",
    "image": "/ceo.jpg",
    "socialLinks": {
      "linkedin": "",
      "github": "",
      "twitter": ""
    },
    "displayOrder": 1,
    "isActive": true
  },
  {
    "name": "MD Shafiul Islam",
    "designation": "Managing Director",
    "bio": "Directs the activities of the business while holding bottom-line profitability. Provides strategic advice to the board, plans cost-effective business strategy, and develops new lines of work from market and industry signals.",
    "image": "/sharif.jpg",
    "socialLinks": {
      "linkedin": "",
      "github": "",
      "twitter": ""
    },
    "displayOrder": 2,
    "isActive": true
  },
  {
    "name": "S M Showfydul Islam",
    "designation": "Director",
    "bio": "Oversees delivery across the production disciplines — visual production, catalogue work and architectural visualization — and owns the quality bar those teams are held to.",
    "image": "/sm.jpeg",
    "socialLinks": {
      "linkedin": "",
      "github": "",
      "twitter": ""
    },
    "displayOrder": 3,
    "isActive": true
  },
  {
    "name": "Arifur Rahman",
    "designation": "Director",
    "bio": "Works across client engagements from first scope to handover, with a focus on keeping the commitments made in discovery intact through build.",
    "image": "/arif.jpg",
    "socialLinks": {
      "linkedin": "",
      "github": "",
      "twitter": ""
    },
    "displayOrder": 4,
    "isActive": true
  },
  {
    "name": "Masudur Rahman",
    "designation": "Director, Logistics",
    "bio": "Runs operations and logistics for the studio, including vendor coordination and the scheduling that keeps production capacity honest against committed dates.",
    "image": "/mhp.png",
    "socialLinks": {
      "linkedin": "",
      "github": "",
      "twitter": ""
    },
    "displayOrder": 5,
    "isActive": true
  },
  {
    "name": "S. M. Tauhidul Islam, FCA",
    "designation": "Consultant — Business Advisory",
    "bio": "A Fellow of the Institute of Chartered Accountants of Bangladesh with an MCom, and a partner at Anil Salam Idris & Co. leading audit and assurance. Over twenty years in practice, previously Head of Internal Audit for a multinational in the ready-made garments sector.",
    "image": "/touhid.jpeg",
    "socialLinks": {
      "linkedin": "",
      "github": "",
      "twitter": ""
    },
    "displayOrder": 6,
    "isActive": true
  },
  {
    "name": "Mohammad Anwar Hossain, FCMA",
    "designation": "Consultant — VAT & Tax",
    "bio": "Finance professional with more than fifteen years across corporate reporting, financial control, treasury, forecasting, internal control and IFRS, with sector experience at Expo Group, Phoenix Finance & Investments and NK Group.",
    "image": "/PPhoto.png",
    "socialLinks": {
      "linkedin": "",
      "github": "",
      "twitter": ""
    },
    "displayOrder": 7,
    "isActive": true
  },
  {
    "name": "Mahmud Hasan, PhD",
    "designation": "Senior Consultant — Data Science",
    "bio": "Data scientist and researcher working in big-data handling, time-series analysis, predictive analytics and machine learning, with a second specialism in GIS, remote sensing and satellite image analysis. Currently a post-doctoral researcher at the University of Bologna.",
    "image": "/datascientis.jpg",
    "socialLinks": {
      "linkedin": "",
      "github": "",
      "twitter": ""
    },
    "displayOrder": 8,
    "isActive": true
  },
  {
    "name": "Md. Arif",
    "designation": "Web & Mobile Application Developer",
    "bio": "Developer and UX/UI designer working at the intersection of design and engineering — cross-platform mobile in React Native and Flutter, and interfaces built for performance and accessibility rather than for the mockup.",
    "image": "/arif.png",
    "socialLinks": {
      "linkedin": "",
      "github": "",
      "twitter": ""
    },
    "displayOrder": 9,
    "isActive": true
  }
];

export default team;
