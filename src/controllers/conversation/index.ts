import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getParam } from "@/utils/getParam";
import {
  AdType,
  ConversationType,
  MessageType,
  Services,
  UserType,
} from "@/types";
import { getService } from "@/lib/container";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { PipelineStage } from "mongoose";
import { toObjectId } from "@/utils/toObjectId";
import { getConversationCompanion, getUserByConversationType } from "./utils";
import { getMessagesListAggregate } from "./aggregate";
import { ConversationTypes } from "./types";
import _, { isEqual } from "lodash";
import { getAttributes } from "@/utils/getAttributes";
import { SOCKET_EVENTS } from "@/const";

export const create = asyncHandler(async (req: Request, res: Response) => {
  // const io = getParam(req, "io");
  const ad = getParam(req.body, "ad") as AdType;
  const user = getParam(req, "user") as UserType;

  const service = getService(Services.CONVERSATION);

  const payload = {
    ad: toObjectId(ad?._id),
    adAuthor: toObjectId(ad?.user?._id),
    courier: toObjectId(user._id),
  };

  let conversation = await service.findOne(payload);

  if (!conversation) {
    conversation = await service.create(payload);
  }

  // io.to(attributes?.receiver?._id).emit(
  //   SOCKET_EVENTS.NEW_CONVERSATION,
  //   conversation
  // );

  return getResponse(res, { data: conversation }, StatusCodes.CREATED);
});

export const createMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const io = getParam(req, "io");
    const conversation = getParam(req, "conversation") as ConversationType;

    const user = getParam(req, "user") as UserType;

    const { message, type, isSystemMessage, systemAction } = getAttributes(
      req.body,
      ["message", "type", "isSystemMessage", "systemAction"]
    );

    const conversationService = getService(Services.CONVERSATION);
    const messageService = getService(Services.MESSAGE);

    const messageDoc = await messageService.create({
      isSystemMessage,
      conversation,
      message,
      sender: user,
      type,
      systemAction,
    });

    await conversationService.update(
      { _id: toObjectId(conversation._id) },
      {
        lastMessage: messageDoc,
      }
    );

    const newMessage = await messageService.aggregate([
      {
        $match: {
          _id: toObjectId(messageDoc._id),
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
          localField: "sender",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $project: {
          sender: { $first: "$sender" },
          message: 1,
          conversation: { $first: "$conversation" },
          systemAction: 1,
          isSystemMessage: 1,
          type: 1,
        },
      },
    ]);

    const data = {
      message: _.first(newMessage),
      isSystemMessage,
      systemAction,
      type,
    };

    // const companion = getConversationCompanion(conversation, user);

    io.to(conversation?._id?.toString()).emit(
      SOCKET_EVENTS.NEW_MESSAGE,
      _.first(newMessage)
    );
    console.log({ conversation });
    io.to(conversation?._id?.toString()).emit(
      SOCKET_EVENTS.UPDATE_CONVERSATION,
      {
        conversation,
        type:
          JSON.stringify(conversation.courier._id) === JSON.stringify(user._id)
            ? ConversationTypes.SENT
            : ConversationTypes.INBOX,
      }
    );

    return getResponse(res, { data }, StatusCodes.CREATED);
  }
);

export const getConversationsList = asyncHandler(
  async (req: Request, res: Response) => {
    const type = getParam(req.query, "type") as ConversationTypes;
    const user = getParam(req, "user") as UserType;
    const service = getService(Services.CONVERSATION);

    const match: PipelineStage.Match = {
      $match: {},
    };

    match.$match[getUserByConversationType[type]] = toObjectId(user._id);

    const data = await service.aggregate([
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
              $limit: 100,
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
          companion: {
            $first: type === ConversationTypes.INBOX ? "$courier" : "$adAuthor",
          },
          courier: { $first: "$courier" },
          unreadMessagesCount: {
            $function: {
              body: function (messages: MessageType[], user: UserType) {
                const partnerMessages = messages
                  .slice()
                  .filter(
                    (messageObject: MessageType) =>
                      JSON.stringify(messageObject.sender) !==
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
    const conversation = getParam(req, "conversation") as ConversationType;
    const user = getParam(req, "user") as UserType;
    const blockService = getService(Services.BLOCK);
    const messageService = getService(Services.MESSAGE);

    const messages = await messageService.aggregate(
      getMessagesListAggregate(conversation, user)
    );

    const companion =
      conversation.courier?._id.toString() === user._id.toString()
        ? conversation?.adAuthor
        : conversation?.courier;

    // @ts-ignore
    companion?.courier = isEqual(
      conversation.ad.courier?._id.toString(),
      companion?._id.toString()
    );

    const isBlocked = Boolean(
      await blockService.count({
        user: toObjectId(user._id),
        blockedUser: toObjectId(companion?._id),
      })
    );

    const canWrite = !Boolean(
      await blockService.count({
        blockedUser: toObjectId(user._id),
        user: toObjectId(companion?._id),
      })
    );

    const delivery = (
      await getService(Services.DELIVERY).findOne({
        ad: toObjectId(conversation.ad._id),
        user: toObjectId(user._id),
      })
    )?.status;

    const data = {
      ad: conversation.ad,
      adAuthor: conversation.adAuthor,
      delivery,
      isBlocked,
      canWrite,
      companion,
      messages,
    };

    return getResponse(res, { data }, StatusCodes.OK);
  }
);
