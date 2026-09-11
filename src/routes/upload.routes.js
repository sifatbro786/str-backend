import { Router } from "express";
import * as ctrl from "../controllers/upload.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";
import { singleImage, validateFolder } from "../middleware/upload.js";
import { uploadLimiter } from "../middleware/rateLimiters.js";

const router = Router();

/**
 * Admin-only from the first line. There is no public read route here: the
 * files are served as static assets by app.js, outside the /api mount, so
 * nothing on this router is reachable without a valid admin token.
 *
 * ── MIDDLEWARE ORDER IS THE SECURITY BOUNDARY ────────────────────────────
 * protect → checkRole → limiter → folder check → multer. Multer is LAST on
 * purpose: it is the only link in the chain that writes to disk, and putting
 * it before the auth check would mean an anonymous request costs a file write
 * before it costs a 401.
 */
router.use(protect, checkRole("super_admin", "admin"));

router.post("/:folder", uploadLimiter, validateFolder, singleImage("file"), ctrl.uploadImage);
router.delete("/:folder/:filename", ctrl.deleteUpload);

export default router;
