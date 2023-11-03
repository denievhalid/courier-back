import { asyncHandler } from "@/utils/asyncHandler";
import type { Request, Response } from "express";
import { getParam } from "@/utils/getParam";
import { UserType } from "@/types";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { getService } from "@/lib/container";
import { toObjectId } from "@/utils/toObjectId";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user") as UserType;
  const blockedUser = getParam(req.body, "user");

  const blockedService = getService("block");

  const payload = {
    blockedUser: toObjectId(blockedUser._id),
    user: toObjectId(user._id),
  };

  const exists = await blockedService.exists(payload);

  if (!exists) {
    await blockedService.create({
      blockedUser: toObjectId(blockedUser._id),
      user: toObjectId(user._id),
    });
  }

  return getResponse(
    res,
    {
      data: {
        isBlocked: true,
      },
    },
    StatusCodes.CREATED
  );
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user") as UserType;
  const blockedUser = getParam(req.body, "user");

  const blockedService = getService("block");

  const payload = {
    blockedUser: toObjectId(blockedUser._id),
    user: toObjectId(user._id),
  };

  const exists = await blockedService.exists(payload);

  if (exists) {
    await blockedService.remove({
      blockedUser: toObjectId(blockedUser._id),
      user: toObjectId(user._id),
    });
  }

  return getResponse(
    res,
    {
      data: {
        isBlocked: false,
      },
    },
    StatusCodes.OK
  );
});
