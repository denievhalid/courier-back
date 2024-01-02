import { asyncHandler } from "@/utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import { getParam } from "@/utils/getParam";
import { getService } from "@/lib/container";
import { ConversationType, Services, UserType } from "@/types";
import { toObjectId } from "@/utils/toObjectId";
import _ from "lodash";
import { emitSocket } from "@/utils/socket";
import { SocketEvents } from "@/const";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import {
  getConversationCompanion,
  handleUnReadMessagesCount,
} from "@/controllers/conversation/utils";
import { ConversationTypes } from "@/controllers/conversation/types";

export const useGetConversationById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = getParam(req.params, "id") || getParam(req.body, "conversation");

    const service = getService(Services.CONVERSATION);

    const conversation = await service.aggregate([
      {
        $match: {
          _id: toObjectId(id),
        },
      },
      {
        $lookup: {
          from: "ads",
          localField: "ad",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "courier",
                foreignField: "_id",
                as: "adCourier",
              },
            },
          ],
          as: "ad",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "courier",
          foreignField: "_id",
          as: "courier",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "adAuthor",
          foreignField: "_id",
          as: "adAuthor",
        },
      },
      {
        $project: {
          _id: 1,
          ad: { $first: "$ad" },
          adAuthor: { $first: "$adAuthor" },
          courier: { $first: "$courier" },
          cover: 1,
          lastRequestedDeliveryMessage: 1,
          deleted: 1,
          lastMessage: 1,
        },
      },
      {
        $addFields: {
          ad: {
            cover: { $first: "$ad.images" },
            courier: { $first: "$ad.adCourier" },
          },
        },
      },
    ]);

    if (!conversation) {
      throw new Error("Разговор не найден");
    }

    _.set(req, "conversation", _.first(conversation));

    return next();
  }
);

export const useSocket = asyncHandler(async (req: Request, res: Response) => {
  const io = getParam(req, "io");
  const user = getParam(req, "user") as UserType;
  const { message } = getParam(req, "payload");
  const conversation = getParam(req, "conversation") as ConversationType;

  const companion = getConversationCompanion(conversation, user);

  const allMessages = await getService(Services.MESSAGE)
    .find({ conversation: toObjectId(conversation?._id) })
    // @ts-ignore
    .sort({ createdAt: -1 })
    .limit(100);

  const unreadMessagesCount = handleUnReadMessagesCount(allMessages, companion);

  emitSocket({
    io,
    event: SocketEvents.NEW_MESSAGE,
    room: `room${conversation?._id?.toString()}`,
    data: {
      message,
      lastRequestedDeliveryMessage:
        message?.conversation?.lastRequestedDeliveryMessage,
    },
  });

  emitSocket({
    io,
    event: SocketEvents.UPDATE_CONVERSATION,
    room: companion?._id?.toString(),
    data: {
      conversation: {
        ...conversation,
        lastMessage: message,
        unreadMessagesCount,
        companion: user,
        cover: conversation?.ad?.images[0],
        lastRequestedDeliveryMessage:
          conversation?.lastRequestedDeliveryMessage?._id,
      },
      type:
        JSON.stringify(conversation?.courier?._id) ===
        JSON.stringify(companion?._id)
          ? ConversationTypes.SENT
          : ConversationTypes.INBOX,
    },
  });

  return getResponse(res, {}, StatusCodes.CREATED);
});
