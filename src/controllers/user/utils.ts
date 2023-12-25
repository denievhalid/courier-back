import _ from "lodash";
import type { UserType } from "@/types";

export const sanitizeUser = (user: UserType) => {
  return _.pick(user, [
    "_id",
    "city",
    "gender",
    "firstname",
    "phoneNumber",
    "avatar",
    "notificationTokens",
  ]);
};
