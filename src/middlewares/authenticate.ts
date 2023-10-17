import { getParam } from "@/utils/getParam";
import { asyncHandler } from "@/utils/asyncHandler";

export const authenticate = asyncHandler((req, _res, next) => {
  const token = getParam(req, "token");

  if (!token) {
  }
});
