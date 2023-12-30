import { getParam } from "@/utils/getParam";
import { asyncHandler } from "@/utils/asyncHandler";
import { InvalidCredentialsException } from "@/exceptions/forbidden";
import _ from "lodash";
import { getService } from "@/lib/container";
import { getEnv } from "@/utils/env";
import { getUserAggregate } from "@/utils/aggregate";
import { Services } from "@/types";

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = getParam(req, "token");

  if (!token) {
    throw new InvalidCredentialsException();
  }

  const tokenService = getService(Services.TOKEN);
  const userService = getService("user");

  const verified = tokenService.sign(token, getEnv("JWT_SECRET")) as {
    phoneNumber: string;
  };

  if (!verified) {
    throw new InvalidCredentialsException();
  }

  const user = await getUserAggregate(verified.phoneNumber);

  if (_.isEmpty(user)) {
    throw new InvalidCredentialsException();
  }

  _.set(req, "user", _.first(user));

  next();
});
