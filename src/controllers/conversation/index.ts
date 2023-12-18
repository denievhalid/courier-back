import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getParam } from "@/utils/getParam";
import { MessageType, Services, UserType } from "@/types";
import { getService } from "@/lib/container";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { PipelineStage } from "mongoose";
import { getAttributes } from "@/utils/getAttributes";
import { getUserByConversationType } from "@/controllers/conversation/utils";
import { Conversation } from "@/controllers/conversation/types";
import { toObjectId } from "@/utils/toObjectId";
import { SOCKET_EVENTS } from "@/const";

export const create = asyncHandler(async (req: Request, res: Response) => {
  //const io = getParam(req, "io");
  const attributes = getAttributes(req.body, ["ad", "courier"]);

  const service = getService(Services.CONVERSATION);

  let conversation = await service.findOne(attributes);

  if (!conversation) {
    conversation = await service.create(attributes);
  }

  // io.to(attributes?.receiver?._id).emit(
  //   SOCKET_EVENTS.NEW_CONVERSATION,
  //   conversation
  // );

  return getResponse(res, { data: conversation }, StatusCodes.CREATED);
});

export const getConversationsList = asyncHandler(
  async (req: Request, res: Response) => {
    const type = getParam(req.query, "type") as Conversation;
    const user = getParam(req, "user") as UserType;
    const conversationService = getService(Services.CONVERSATION);

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
        $limit: 100,
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
            },
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
              body: function (messages: MessageType[], user: UserType) {
                const partnerMessages = messages
                  .slice()
                  .filter(
                    (messageObject: MessageType) =>
                      JSON.stringify(messageObject.user) !==
                      JSON.stringify(user._id)
                  );
                const lastReadIndex = partnerMessages.findIndex(
                  (message: MessageType) => message.status === "read"
                );
                const unreadCount =
                  lastReadIndex !== -1 ? lastReadIndex : partnerMessages.length;
                return unreadCount;
              },
              args: ["$messages", user],
              lang: "js",
            },
          },
          lastMessage: { $arrayElemAt: ["$messages", 0] },
        },
      },
    ]);

    return getResponse(res, { data }, StatusCodes.OK);
  }
);

export const getMessagesList = asyncHandler(
  async (req: Request, res: Response) => {
    const conversation = getParam(req, "conversation");

    return getResponse(res, {}, StatusCodes.OK);
  }
);
