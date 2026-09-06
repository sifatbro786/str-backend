import Service from "../models/Service.js";
import * as factory from "../utils/handlerFactory.js";

export const listServices = factory.getAll(Service, {
  allowedFilters: ["isActive"],
  allowedSort: ["order", "createdAt", "title"],
  defaultSort: "order",
  searchFields: ["title", "shortDescription"],
});

export const getService = factory.getOne(Service, { by: "slug" });

/**
 * GET /api/v1/services/admin/id/:id — the edit form loads by _id, and the
 * public getService looks up by slug, which breaks the moment an admin
 * renames a service.
 */
export const getServiceById = factory.getOne(Service);
export const createService = factory.createOne(Service);
export const updateService = factory.updateOne(Service);
export const deleteService = factory.deleteOne(Service);
