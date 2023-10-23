import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getAttributes } from "@/utils/getAttributes";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import _ from "lodash";
import mongoose from "mongoose";

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const messageService = getService("message");

  const { dialog, message } = getAttributes(req.body, ["dialog"]);

  const data = await messageService.aggregate([
    {
      $match: {
        dialog: new mongoose.Types.ObjectId(dialog),
      },
    },
    {
      $lookup: {
        from: "dialogs",
        localField: "dialog",
        foreignField: "_id",
        as: "dialog",
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
      $project: {
        ad: { $first: "$dialog.ad" },
        message: 1,
        user: { $first: "$user" },
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
      $project: {
        ad: { $first: "$ad" },
        user: 1,
        message: 1,
      },
    },
  ]);

  return getResponse(res, { data }, StatusCodes.OK);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = _.first(getParam(req, "user"));
  const { dialog, message } = getAttributes(req.body, ["dialog", "message"]);

  const messageService = getService("message");

  const doc = await messageService.create({
    dialog,
    message,
    user,
  });

  const data = await messageService.findOne({ _id: doc._id }).populate("user");

  return getResponse(res, { data }, StatusCodes.CREATED);
});
