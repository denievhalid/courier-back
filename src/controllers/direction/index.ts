import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { getParam } from "@/utils/getParam";
import { toObjectId } from "@/utils/toObjectId";
import { getService } from "@/lib/container";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const hash = getParam(req.body, "hash");
  const user = getParam(req, "user");

  const payload = { hash, user: toObjectId(user._id) };

  const directionService = getService("direction");

  const exists = await directionService.count(payload);

  if (!exists) {
    await directionService.create(payload);
  }

  const count = await directionService.count({ user: toObjectId(user._id) });

  return getResponse(res, { data: count }, StatusCodes.CREATED);
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  return getResponse(res, {}, StatusCodes.OK);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const hash = getParam(req.body, "hash");
  const user = getParam(req, "user");

  const payload = { hash, user: toObjectId(user._id) };

  const directionService = getService("direction");

  const exists = await directionService.count(payload);

  if (exists) {
    await directionService.remove(payload);
  }

  const count = await directionService.count({ user: toObjectId(user._id) });

  return getResponse(res, { data: count }, StatusCodes.CREATED);
});
