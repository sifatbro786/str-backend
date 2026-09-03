import { body } from "express-validator";

const SERVICES = [
  "web-development",
  "mobile-app",
  "ui-ux-design",
  "custom-software",
  "cloud-devops",
  "cybersecurity",
];

export const createProjectRules = [
  body("title").trim().notEmpty().withMessage("Title required"),
  body("serviceType").isIn(SERVICES).withMessage("Invalid serviceType"),
  body("accentColor")
    .optional()
    .matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .withMessage("accentColor must be hex"),
  body("liveUrl").optional({ values: "falsy" }).isURL().withMessage("liveUrl must be a URL"),
];
