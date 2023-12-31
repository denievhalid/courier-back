import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import { PipelineStage } from "mongoose";
import { Services, UserType } from "@/types";
import { toObjectId } from "@/utils/toObjectId";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const ad = getParam(req.body, "ad");
  const user = getParam(req, "user");

  const payload = { ad: toObjectId(ad), user: toObjectId(user._id) };

  const favoriteService = getService(Services.FAVORITE);

  const exists = await favoriteService.exists(payload);

  if (!exists) {
    await favoriteService.create(payload);
  }

  const count = await favoriteService.count({ user: toObjectId(user._id) });

  return getResponse(res, { data: count }, StatusCodes.CREATED);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const ad = getParam(req.body, "ad");
  const user = getParam(req, "user");

  const payload = { ad: toObjectId(ad), user: toObjectId(user._id) };

  const favoriteService = getService(Services.FAVORITE);

  const exists = await favoriteService.exists(payload);

  if (exists) {
    //await favoriteService.remove(payload);
  }

  const count = await favoriteService.count({ user: toObjectId(user._id) });

  return getResponse(res, { data: count }, StatusCodes.OK);
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user") as UserType;

  const favoriteService = getService(Services.FAVORITE);

  const query: PipelineStage[] = [
    {
      $match: {
        $expr: {
          $eq: ["$user", user._id],
        },
      },
    },
    {
      $lookup: {
        from: "ads",
        localField: "ad",
        foreignField: "_id",
        as: "ad",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $limit: 10,
    },
    {
      $project: {
        _id: 1,
        ad: { $first: "$ad" },
      },
    },
    {
      $addFields: {
        "ad.cover": { $first: "$ad.images" },
      },
    },
  ];

  const data = await favoriteService.aggregate(query);

  return getResponse(res, { data }, StatusCodes.OK);
});
