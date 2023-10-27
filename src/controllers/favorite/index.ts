import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import { PipelineStage } from "mongoose";
import _ from "lodash";
import { UserType } from "@/types";

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const user = _.first(getParam(req, "user")) as UserType;

  const favoriteService = getService("favorite");

  const query: PipelineStage[] = [
    {
      $match: {
        $expr: {
          $eq: ["$user", { $toObjectId: user._id }],
        },
      },
    },
    {
      $lookup: {
        from: "ad",
        localField: "ad",
        foreignField: "_id",
        as: "ad",
      },
    },
    {
      $lookup: {
        from: "user",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $limit: 10,
    },
  ];

  const data = await favoriteService.getList(query);

  return getResponse(res, { data }, StatusCodes.OK);
});
