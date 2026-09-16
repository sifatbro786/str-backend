import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import projectRoutes from "./project.routes.js";
import serviceRoutes from "./service.routes.js";
import blogRoutes from "./blog.routes.js";
import testimonialRoutes from "./testimonial.routes.js";
import teamRoutes from "./team.routes.js";
import inquiryRoutes from "./inquiry.routes.js";
import graphicsQuoteRoutes from "./graphicsQuote.routes.js";
import pageMetaRoutes from "./pageMeta.routes.js";
import siteContentRoutes from "./siteContent.routes.js";
import statsRoutes from "./stats.routes.js";
import uploadRoutes from "./upload.routes.js";

const router = Router();

/** API root aggregator — everything here is mounted under /api. */
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/services", serviceRoutes);
/* ⚑ /packages was mounted here: a public GET returning the whole bilingual
   pricing page in one shaped response, with the dashboard CRUD for tracks,
   tiers and page copy under it. The route now renders static data on the
   frontend (str-frontend/lib/pricingData.js), so the router, controller,
   validator, the three models and the seed pair were all deleted. Two things
   on the frontend were unmounted with it and must not come back alone: the
   "packages" entry in the admin proxy allow-list
   (app/api/admin/[...path]/route.js) and the "packages" revalidate tag
   (app/api/revalidate/route.js). */
router.use("/blogs", blogRoutes);
router.use("/testimonials", testimonialRoutes);
router.use("/team", teamRoutes);
router.use("/inquiries", inquiryRoutes);
/* Orders placed from /graphics. Separate collection from /inquiries because a
   work order and a lead are different records — see models/GraphicsQuote.js. */
router.use("/graphics-quotes", graphicsQuoteRoutes);
router.use("/page-meta", pageMetaRoutes);
router.use("/site-content", siteContentRoutes);
router.use("/stats", statsRoutes);
// Writes only. The files themselves are served as static assets from
// env.upload.publicPath in app.js, outside this router and outside the limiter.
router.use("/uploads", uploadRoutes);

export default router;
