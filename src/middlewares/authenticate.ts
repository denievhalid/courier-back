import { getParam } from "@/utils/getParam";
import { asyncHandler } from "@/utils/asyncHandler";
import { InvalidCredentialsException } from "@/exceptions/forbidden";
import _ from "lodash";
import { getService } from "@/lib/container";
import { getEnv } from "@/utils/env";

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = getParam(req, "token");

  if (!token) {
    throw new InvalidCredentialsException();
  }

  const tokenService = getService("token");
  const userService = getService("user");

  const verified = tokenService.verify(token, getEnv("JWT_SECRET")) as {
    phoneNumber: string;
  };

  if (!verified) {
    throw new InvalidCredentialsException();
  }

  const user = await userService.findOne({ phoneNumber: verified.phoneNumber });

  if (!user) {
    throw new InvalidCredentialsException();
  }

  _.set(req, "user", user);

  next();
});
