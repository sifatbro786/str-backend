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
router.use("/blogs", blogRoutes);
router.use("/testimonials", testimonialRoutes);
router.use("/team", teamRoutes);
router.use("/inquiries", inquiryRoutes);
router.use("/page-meta", pageMetaRoutes);
router.use("/site-content", siteContentRoutes);
router.use("/stats", statsRoutes);
// Writes only. The files themselves are served as static assets from
// env.upload.publicPath in app.js, outside this router and outside the limiter.
router.use("/uploads", uploadRoutes);

export default router;
