import Service from "../models/Service.js";
import * as factory from "../utils/handlerFactory.js";
import { invalidateServiceTypes } from "../utils/serviceTypes.js";

/**
 * Project validation reads the service list through a 60-second cache, so
 * without this a discipline added here is rejected on a project for up to a
 * minute afterwards — and the editor's next move after creating a service is
 * usually to go and tag a project with it. Clearing on write makes it
 * immediate; the TTL stays as the backstop for a service changed by any other
 * route (a migration, a direct database edit, a second API instance).
 *
 * Wrapped rather than folded into handlerFactory: the factory is generic over
 * every model and has no business knowing that this one has a cache.
 */
const andInvalidate = (handler) => async (req, res, next) => {
  await handler(req, res, next);
  invalidateServiceTypes();
};

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
export const createService = andInvalidate(factory.createOne(Service));
export const updateService = andInvalidate(factory.updateOne(Service));
export const deleteService = andInvalidate(factory.deleteOne(Service));
