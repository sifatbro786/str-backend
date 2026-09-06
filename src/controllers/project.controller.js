import Project from "../models/Project.js";
import * as factory from "../utils/handlerFactory.js";

export const listProjects = factory.getAll(Project, {
  allowedFilters: ["serviceTypes", "featured", "tags"],
  arrayFilters: ["serviceTypes", "tags"],
  allowedSort: ["displayOrder", "projectDate", "createdAt", "title"],
  defaultSort: "-featured -displayOrder -createdAt",
  searchFields: ["title", "subtitle", "shortDescription", "clientName"],
});

/**
 * GET /api/v1/projects/admin/all — admin table feed.
 *
 * Projects have no draft state, so the only differences from the public list
 * are the limits and the sort freedom: it can page past the public defaults
 * and is not competing with the public cache.
 */
export const listProjectsAdmin = factory.getAll(Project, {
  allowedFilters: ["serviceTypes", "featured", "tags"],
  arrayFilters: ["serviceTypes", "tags"],
  allowedSort: ["displayOrder", "projectDate", "createdAt", "updatedAt", "title"],
  defaultSort: "-updatedAt",
  searchFields: ["title", "subtitle", "shortDescription", "clientName", "slug"],
  defaultLimit: 20,
  maxLimit: 100,
});

export const getProject = factory.getOne(Project, { by: "slug" });

/**
 * GET /api/v1/projects/admin/id/:id — the edit form loads by _id, and the
 * public getProject looks up by slug, which breaks the moment an admin
 * renames a project.
 */
export const getProjectById = factory.getOne(Project); // defaults to by: "_id"

export const createProject = factory.createOne(Project);
export const updateProject = factory.updateOne(Project);
export const deleteProject = factory.deleteOne(Project);
