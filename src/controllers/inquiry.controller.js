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
// A lead is a record of what the client sent. Admins triage it; they do not
// edit it. Only the two internal fields are writable.
export const updateInquiry = factory.updateOne(Inquiry, { allow: ["status", "notes"] });
export const deleteInquiry = factory.deleteOne(Inquiry);
