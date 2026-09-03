import { Router } from "express";
import healthRoutes from "./health.routes.js";

const router = Router();

/**
 * API v-less root aggregator. Mount feature routers here as the API grows,
 * e.g. router.use("/auth", authRoutes).
 */
router.use("/health", healthRoutes);

export default router;
