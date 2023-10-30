import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import _ from "lodash";
import { getParam } from "@/utils/getParam";
import { UserType } from "@/types";
import { getService } from "@/lib/container";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import mongoose, { PipelineStage } from "mongoose";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req.body, "user") as UserType;

  const userService = getService("user");

  const userExists = await userService.exists({ _id: user._id });

  if (!userExists) {
    throw new Error("Пользователь не найден");
  }

  const conversation = await getService("conversation").create({
    users: [user._id],
  });

  return getResponse(res, { data: conversation }, StatusCodes.CREATED);
});

export const getConversationsList = asyncHandler(
  async (req: Request, res: Response) => {
    const type = getParam(req.query, "type") as "inbox" | "sent";
    const user = getParam(req, "user") as UserType;
    const conversationService = getService("conversation");

    const match: PipelineStage.Match = {
      $match: {},
    };

    if (type === "sent") {
      match.$match["sender"] = new mongoose.Types.ObjectId(user._id);
    } else {
      match.$match["receiver"] = new mongoose.Types.ObjectId(user._id);
    }

    const data = await conversationService.aggregate([
      match,
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "receiver",
          foreignField: "_id",
          as: "receiver",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "conversation",
          as: "messages",
        },
      },
      {
        $addFields: {
          lastMessage: { $first: "$messages" },
        },
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          receiver: { $first: "$receiver" },
          sender: { $first: "$sender" },
        },
      },
    ]);

    return getResponse(res, { data }, StatusCodes.OK);
  }
);
