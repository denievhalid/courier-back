import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";

export const create = asyncHandler(async (req: Request, res: Response) => {
  return getResponse(res, {}, StatusCodes.CREATED);
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  return getResponse(res, {}, StatusCodes.OK);
});
