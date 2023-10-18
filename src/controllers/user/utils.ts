import _ from "lodash";
import type { UserType } from "@/types";

export const sanitizeUser = (user: UserType) => {
  return _.pick(user, ["gender", "firstname", "_id", "avatar"]);
};
