import { getParam } from "@/utils/getParam";
import { asyncHandler } from "@/utils/asyncHandler";
import { InvalidCredentialsException } from "@/exceptions/forbidden";

export const authenticate = asyncHandler((req, _res, next) => {
  const token = getParam(req, "token");

  if (!token) {
    throw new InvalidCredentialsException();
  }
});
