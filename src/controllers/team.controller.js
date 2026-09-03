import Team from "../models/Team.js";
import * as factory from "../utils/handlerFactory.js";

export const listTeam = factory.getAll(Team, {
  allowedFilters: ["isActive"],
  allowedSort: ["displayOrder", "createdAt"],
  defaultSort: "displayOrder",
  searchFields: ["name", "designation"],
});

export const getMember = factory.getOne(Team);
export const createMember = factory.createOne(Team);
export const updateMember = factory.updateOne(Team);
export const deleteMember = factory.deleteOne(Team);
