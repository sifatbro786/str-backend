import Inquiry from "../models/Inquiry.js";
import * as factory from "../utils/handlerFactory.js";
import asyncHandler from "../utils/asyncHandler.js";
import { dispatchInquiryMails } from "../services/inquiryMail.service.js";

/**
 * POST /api/inquiries — public contact form (rate limited + validated).
 *
 * Hand-written rather than factory.createOne because the lead has a side
 * effect the generic handler has no place knowing about. The response is sent
 * BEFORE mail is dispatched: persistence is the contract, notification is not.
 * See services/inquiryMail.service.js for why that ordering is deliberate.
 */
export const createInquiry = asyncHandler(async (req, res) => {
  const doc = await Inquiry.create(req.body);

  res.status(201).json({ success: true, data: doc });

  dispatchInquiryMails(doc);
});

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
