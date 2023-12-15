import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getParam } from "@/utils/getParam";
import { ConversationType, UserType } from "@/types";
import { getService } from "@/lib/container";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import mongoose, { PipelineStage } from "mongoose";
import { getAttributes } from "@/utils/getAttributes";
import { getUserByConversationType } from "@/controllers/conversation/utils";
import { Conversation } from "@/controllers/conversation/types";
import { toObjectId } from "@/utils/toObjectId";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { ad, sender, receiver } = getAttributes(req.body, [
    "ad",
    "sender",
    "receiver",
  ]);

  const payload = {
    ad,
    sender,
    receiver,
  };

  const conversationService = getService("conversation");

  let conversation = await conversationService.findOne(payload);

  if (!conversation) {
    conversation = await conversationService.create(payload);
  }

  return getResponse(res, { data: conversation }, StatusCodes.CREATED);
});

export const getConversationsList = asyncHandler(
  async (req: Request, res: Response) => {
    const type = getParam(req.query, "type") as Conversation;
    const user = getParam(req, "user") as UserType;
    const conversationService = getService("conversation");

    const match: PipelineStage.Match = {
      $match: {},
    };

    match.$match[getUserByConversationType[type]] = toObjectId(user._id);

    const data = await conversationService.aggregate([
      match,
      {
        $sort: {
          updatedAt: -1,
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
          let: {
            conversation: "$_id",
          },
          pipeline: [
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $match: {
                $expr: {
                  $eq: ["$conversation", "$$conversation"],
                },
              },
            }
          ],
          as: "messages",
        },
      },
      {
        $project: {
          _id: 1,
          cover: { $first: { $first: "$ad.images" } },
          user: {
            $first: type === "sent" ? "$receiver" : "$sender",
          },
          unreadMessagesCount: {
            $function: {
              // @ts-ignore
              body: function(messages, user) {
                // @ts-ignore
                const lastReadIndex = messages.slice().filter(messageObject => JSON.stringify(messageObject.user) !== JSON.stringify(user._id)).findIndex(message => message.status === 'read');
                const unreadCount = lastReadIndex !== -1 ? lastReadIndex : messages.length;
                return unreadCount
              },
              args: ['$messages', user],
              lang: 'js',
            },
          },
          lastMessage: { $arrayElemAt: ['$messages', 0] }
        },
      },
    ]);


    return getResponse(res, { data }, StatusCodes.OK);
  }
);
