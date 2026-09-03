import Project from "../models/Project.js";
import * as factory from "../utils/handlerFactory.js";

export const listProjects = factory.getAll(Project, {
  allowedFilters: ["serviceType", "featured", "tags"],
  allowedSort: ["displayOrder", "projectDate", "createdAt", "title"],
  defaultSort: "-featured -displayOrder -createdAt",
  searchFields: ["title", "subtitle", "shortDescription", "clientName"],
});

export const getProject = factory.getOne(Project, { by: "slug" });
export const createProject = factory.createOne(Project);
export const updateProject = factory.updateOne(Project);
export const deleteProject = factory.deleteOne(Project);
