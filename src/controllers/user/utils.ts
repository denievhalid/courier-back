import _ from "lodash";
import type { UserType } from "@/types";

export const sanitizeUser = (user: UserType) => {
  return _.pick(user, [
    "_id",
    "gender",
    "firstname",
    "phoneNumber",
    "location",
    "avatar",
  ]);
};
