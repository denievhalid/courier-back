import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user");

  const favoriteService = getService("favorite");

  const data = await favoriteService.getList();

  return getResponse(res, { data }, StatusCodes.OK);
});
