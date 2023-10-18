import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import type { Request, Response } from "express";

export const getList = asyncHandler(async (req: Request, res: Response) => {
  return getResponse(res, {});
});
