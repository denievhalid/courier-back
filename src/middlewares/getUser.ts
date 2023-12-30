import { getParam } from "@/utils/getParam";
import { asyncHandler } from "@/utils/asyncHandler";
import { getService } from "@/lib/container";
import { Services } from "@/types";

export const getUser = asyncHandler(async (req, res, next) => {
  const token = getParam(req, "token");

  if (!token) {
    return next();
  }

  const tokenService = getService(Services.TOKEN);

  // const verified = tokenService.verify(token, getEnv("JWT_SECRET")) as {
  //   phoneNumber: string;
  // };
  //
  // if (!verified) {
  //   return next();
  // }

  //const user = await getUserAggregate(verified.phoneNumber);

  // if (_.isEmpty(user)) {
  //   return next();
  // }
  //
  // _.set(req, "user", _.first(user));
  // return next();
});
