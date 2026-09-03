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

export default router;
