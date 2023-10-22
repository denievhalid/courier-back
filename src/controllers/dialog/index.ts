import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { UserType } from "@/types";
import _ from "lodash";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = _.first(getParam(req.body, "user")) as UserType;

  const userService = getService("user");

  const userExists = await userService.exists({ _id: user._id });

  if (!userExists) {
    throw new Error("User not found");
  }

  const dialog = await getService("dialog").create({
    users: [user, getParam(req, "user")],
  });

  return getResponse(res, { data: dialog }, StatusCodes.CREATED);
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const user = _.first(getParam(req, "user")) as UserType;
  const dialogService = getService("dialog");

  const data = await dialogService.getList([
    {
      $match: {
        users: {
          $in: [user._id],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "users",
        foreignField: "_id",
        as: "users",
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { idToSearchFor: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$$idToSearchFor", "$dialog"] }],
              },
            },
          },
          {
            $sort: {
              _id: -1,
            },
          },
          { $limit: 1 },
        ],
        as: "messages",
      },
    },
    {
      $project: {
        message: { $first: "$messages" },
      },
    },
  ]);

  return getResponse(res, { data }, StatusCodes.OK);
});
