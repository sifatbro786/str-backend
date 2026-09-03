import { body } from "express-validator";

export const createBlogRules = [
  body("title").trim().notEmpty().withMessage("Title required"),
  body("content").notEmpty().withMessage("Content required"),
];
