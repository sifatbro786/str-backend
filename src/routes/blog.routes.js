import { Router } from "express";
import * as ctrl from "../controllers/blog.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import { createBlogRules } from "../validators/blog.validator.js";

const router = Router();

router.get("/", ctrl.listBlogs); // public: published only

// Literal path must precede /:slug or "admin" is read as a slug.
router.get("/admin/all", protect, checkRole("super_admin", "admin"), ctrl.listAllBlogs);

router.get("/:slug", ctrl.getBlog); // public: +viewCount

router.use(protect, checkRole("super_admin", "admin"));
router.post("/", createBlogRules, validate, ctrl.createBlog);
router.patch("/:id", ctrl.updateBlog);
router.delete("/:id", ctrl.deleteBlog);

export default router;
