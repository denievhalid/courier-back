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

  const favoriteService = getService("favorite");

  await favoriteService.create({ ad, user: user._id });

  return getResponse(res, {}, StatusCodes.CREATED);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const ad = getParam(req.body, "ad");
  const user = getParam(req, "user");

  const favoriteService = getService("favorite");

  await favoriteService.remove({ ad, user: user._id });

  return getResponse(res, {}, StatusCodes.OK);
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
  ];

  const data = await favoriteService.getList(query);

  return getResponse(res, { data }, StatusCodes.OK);
});
