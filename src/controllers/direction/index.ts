import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { getParam } from "@/utils/getParam";
import { toObjectId } from "@/utils/toObjectId";
import { getService } from "@/lib/container";
import { UserType } from "@/types";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const hash = getParam(req.body, "hash");
  const user = getParam(req, "user");
  const ads = getParam(req.body, "ads");

  const payload = { ads, hash, user: toObjectId(user._id) };

  const directionService = getService("direction");

  const exists = await directionService.count(payload);

  if (!exists) {
    await directionService.create(payload);
  }

  const data = await directionService.findOne(payload);

  return getResponse(res, { data }, StatusCodes.CREATED);
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user") as UserType;

  const directionService = getService("direction");

  const data = await directionService.aggregate([
    {
      $match: {
        user: toObjectId(user._id),
      },
    },
  ]);

  return getResponse(res, { data }, StatusCodes.OK);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const hash = getParam(req.body, "hash");
  const user = getParam(req, "user") as UserType;

  const payload = { hash, user: toObjectId(user._id) };

  const directionService = getService("direction");

  const exists = await directionService.count(payload);

  if (exists) {
    await directionService.remove(payload);
  }

  return getResponse(res, {}, StatusCodes.OK);
});
