import { getParam } from "@/utils/getParam";
import { asyncHandler } from "@/utils/asyncHandler";
import _ from "lodash";
import { getService } from "@/lib/container";
import { getEnv } from "@/utils/env";
import { getUserAggregate } from "@/utils/aggregate";

export const getUser = asyncHandler(async (req, res, next) => {
  const token = getParam(req, "token");

  if (!token) {
    return next();
  }

  const tokenService = getService("token");

  const verified = tokenService.verify(token, getEnv("JWT_SECRET")) as {
    phoneNumber: string;
  };

  if (!verified) {
    return next();
  }

  const user = await getUserAggregate(verified.phoneNumber);

  if (_.isEmpty(user)) {
    return next();
  }

  _.set(req, "user", _.first(user));
  return next();
});
