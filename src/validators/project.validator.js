import { body } from "express-validator";
import { SERVICE_TYPES } from "../models/Project.js";
import { mediaField } from "./media.js";

const URL_OPTS = { require_protocol: true };

/** Field rules shared by create and update; `required` differs per verb. */
const serviceTypesRule = (chain) =>
  chain
    .isArray({ min: 1, max: 4 })
    .withMessage("serviceTypes must contain 1–4 values")
    .bail()
    .custom((arr) => arr.every((v) => SERVICE_TYPES.includes(v)))
    .withMessage(`serviceTypes must be a subset of: ${SERVICE_TYPES.join(", ")}`);

export const createProjectRules = [
  body("title").trim().notEmpty().withMessage("Title required").isLength({ max: 160 }),
  serviceTypesRule(body("serviceTypes")),
  body("accentColor")
    .optional()
    .matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .withMessage("accentColor must be hex"),
  body("layoutStyle").optional().isIn(["full-width", "bento", "split"]),
  body("animationTrigger").optional().isIn(["fade-up", "pinned-scroll", "3d-tilt"]),
  body("displayOrder").optional().isInt({ min: 0, max: 9999 }).toInt(),
  body("featured").optional().isBoolean().toBoolean(),
  body("tags").optional().isArray({ max: 24 }),
  body("techStack").optional().isArray({ max: 32 }),
  body("galleryImages").optional().isArray({ max: 40 }),
  /* Was isString().notEmpty(), which accepted "asdf" and every other shape
     that renders as a broken image. Now the same rule the single-image fields
     use; see validators/media.js. */
  mediaField("galleryImages.*.url"),
  body("galleryImages.*.caption").optional().trim().isLength({ max: 200 }),
  body("galleryImages.*.layoutType").optional().isIn(["full", "half", "grid"]),

  // Uploaded through POST /uploads from the admin form. ogImage is separate
  // from coverImage because a 16:9 hero cropped to a 1.91:1 social card
  // usually loses the part worth sharing.
  mediaField("coverImage"),
  mediaField("thumbnailImage"),
  mediaField("ogImage"),
  ...["liveUrl", "githubUrl", "figmaUrl", "appStoreUrl", "playStoreUrl"].map((f) =>
    body(f).optional({ values: "falsy" }).isURL(URL_OPTS).withMessage(`${f} must be an absolute URL`)
  ),
];

/** PATCH is partial — every rule becomes optional, constraints stay identical. */
export const updateProjectRules = [
  body("title").optional().trim().notEmpty().isLength({ max: 160 }),
  serviceTypesRule(body("serviceTypes").optional()),
  ...createProjectRules.slice(2),
];
