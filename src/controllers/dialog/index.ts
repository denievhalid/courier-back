import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { UserType } from "@/types";
import _ from "lodash";
import { me } from "@/controllers/user";
import mongoose from "mongoose";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = _.first(getParam(req.body, "user")) as UserType;

  const userService = getService("user");

  const userExists = await userService.exists({ _id: user._id });

  if (!userExists) {
    throw new Error("User not found");
  }

  const dialog = await getService("dialog").create({
    users: [user._id],
  });

  return getResponse(res, { data: dialog }, StatusCodes.CREATED);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const dialogId = getParam(req.params, "dialogId");

  const dialogService = getService("dialog");

  const data = await dialogService.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(dialogId),
      },
    },
    {
      $lookup: {
        from: "messages",
        localField: "_id",
        foreignField: "dialog",
        as: "messages",
      },
    },
  ]);

  return getResponse(res, { data }, StatusCodes.OK);
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const user = _.first(getParam(req, "user")) as UserType;
  const dialogService = getService("dialog");

  const data = await dialogService.getList([
    {
      $match: {
        user: user._id,
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
        from: "messages",
        let: { id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$$id", "$dialog"] }],
              },
            },
          },
          { $limit: 1 },
        ],
        as: "messages",
      },
    },
    {
      $project: {
        ad: { $first: "$ad" },
        message: { $first: "$messages" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "ad.user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $project: {
        image: { $first: "$ad.images" },
        message: 1,
        user: { $first: "$user" },
      },
    },
  ]);

  return getResponse(res, { data }, StatusCodes.OK);
});
