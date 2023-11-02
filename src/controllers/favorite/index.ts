import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import { PipelineStage } from "mongoose";
import _ from "lodash";
import { UserType } from "@/types";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const ad = getParam(req.body, "ad");
  const user = getParam(req, "user");

  console.log(ad);

  const payload = { ad, user: user._id };

  const favoriteService = getService("favorite");

  const exists = await favoriteService.exists(payload);

  if (!exists) {
    await favoriteService.create(payload);
  }

  return getResponse(res, {}, StatusCodes.CREATED);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const ad = getParam(req.body, "ad");
  const user = getParam(req, "user");

  const payload = { ad, user: user._id };

  const favoriteService = getService("favorite");

  const exists = await favoriteService.exists(payload);

  if (exists) {
    await favoriteService.remove(payload);
  }

  const count = await favoriteService.count(payload);

  return getResponse(res, { count }, StatusCodes.OK);
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user") as UserType;

  const favoriteService = getService("favorite");

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

  const data = await favoriteService.getList(query);

  return getResponse(res, { data }, StatusCodes.OK);
});
