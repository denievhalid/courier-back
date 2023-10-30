import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getAttributes } from "@/utils/getAttributes";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import _ from "lodash";
import mongoose from "mongoose";
import { UserType } from "@/types";

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const messageService = getService("message");

  const { conversation } = getAttributes(req.params, ["conversation"]);

  const data = await messageService.aggregate([
    {
      $match: {
        conversation: new mongoose.Types.ObjectId(conversation),
      },
    },
    {
      $lookup: {
        from: "conversations",
        localField: "conversation",
        foreignField: "_id",
        as: "conversation",
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
        ad: { $first: "$conversation.ad" },
        createdAt: 1,
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
        createdAt: "$createdAt",
        user: 1,
        message: 1,
      },
    },
  ]);

  return getResponse(res, { data }, StatusCodes.OK);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user") as UserType;
  const { conversation, message } = getAttributes(req.body, [
    "conversation",
    "message",
  ]);

  const messageService = getService("message");

  const doc = await messageService.create({
    conversation,
    message,
    user,
  });

  const data = await messageService.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(doc._id),
      },
    },
    {
      $lookup: {
        from: "conversation",
        localField: "conversation",
        foreignField: "_id",
        as: "conversation",
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
        ad: { $first: "$conversation.ad" },
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

  return getResponse(res, { data: _.first(data) }, StatusCodes.CREATED);
});
