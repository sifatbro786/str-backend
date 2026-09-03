import Service from "../models/Service.js";
import * as factory from "../utils/handlerFactory.js";

export const listServices = factory.getAll(Service, {
  allowedFilters: ["isActive"],
  allowedSort: ["order", "createdAt", "title"],
  defaultSort: "order",
  searchFields: ["title", "shortDescription"],
});

export const getService = factory.getOne(Service, { by: "slug" });
export const createService = factory.createOne(Service);
export const updateService = factory.updateOne(Service);
export const deleteService = factory.deleteOne(Service);
