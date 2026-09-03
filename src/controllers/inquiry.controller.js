import Inquiry from "../models/Inquiry.js";
import * as factory from "../utils/handlerFactory.js";

/** POST /api/inquiries — public contact form (rate limited + validated). */
export const createInquiry = factory.createOne(Inquiry);

export const listInquiries = factory.getAll(Inquiry, {
  allowedFilters: ["status", "serviceInterested"],
  allowedSort: ["createdAt", "status"],
  defaultSort: "-createdAt",
  searchFields: ["senderName", "senderEmail", "message"],
});

export const getInquiry = factory.getOne(Inquiry);
export const updateInquiry = factory.updateOne(Inquiry); // status + internal notes
export const deleteInquiry = factory.deleteOne(Inquiry);
