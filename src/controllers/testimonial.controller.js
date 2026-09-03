import Testimonial from "../models/Testimonial.js";
import * as factory from "../utils/handlerFactory.js";

export const listTestimonials = factory.getAll(Testimonial, {
  allowedFilters: ["isFeatured", "rating"],
  allowedSort: ["rating", "createdAt"],
  defaultSort: "-isFeatured -createdAt",
  searchFields: ["clientName", "companyName"],
  populate: { path: "projectRef", select: "title slug" },
});

export const getTestimonial = factory.getOne(Testimonial, {
  populate: { path: "projectRef", select: "title slug" },
});
export const createTestimonial = factory.createOne(Testimonial);
export const updateTestimonial = factory.updateOne(Testimonial);
export const deleteTestimonial = factory.deleteOne(Testimonial);
