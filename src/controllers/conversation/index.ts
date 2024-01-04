import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getParam } from "@/utils/getParam";
import {
  AdType,
  ConversationType,
  MessageType,
  Services,
  TDeletedConversationType,
  UserType,
} from "@/types";
import { getService } from "@/lib/container";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { PipelineStage } from "mongoose";
import { toObjectId } from "@/utils/toObjectId";
import {
  getConversationCompanion,
  getUserByConversationType,
  handleUnReadMessagesCount,
} from "./utils";
import { getMessagesListAggregate } from "./aggregate";
import { ConversationTypes } from "./types";
import { isEqual, set } from "lodash";
import { MessageService } from "@/services";
import { SocketService } from "@/services/socket";
import { SocketEvents } from "@/const";

export const createConversation = asyncHandler(
  async (req: Request, res: Response) => {
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

    return getResponse(res, { data: conversation }, StatusCodes.CREATED);
  }
);

export const createMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getParam(req, "user") as UserType;
    const conversation = getParam(req.body, "conversation") as ConversationType;

    const companion = getConversationCompanion(conversation, user);

    const messageService = getService<MessageService>(Services.MESSAGE);
    const { message } = await messageService.send(req.body);
    const allMessages = await messageService
      .find({ conversation: toObjectId(conversation?._id) })
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadMessagesCount = handleUnReadMessagesCount(
      allMessages,
      companion
    );

    const lastRequestedDeliveryMessage =
      message?.conversation?.lastRequestedDeliveryMessage;

    SocketService.emitBatch([
      {
        event: SocketEvents.NEW_MESSAGE,
        room: `room${conversation?._id?.toString()}`,
        data: {
          message,
          lastRequestedDeliveryMessage,
        },
      },
      {
        event: SocketEvents.UPDATE_CONVERSATION,
        room: companion?._id?.toString(),
        data: {
          conversation: {
            ...conversation,
            lastMessage: message,
            unreadMessagesCount,
            companion: user,
            cover: conversation?.ad?.images[0],
            lastRequestedDeliveryMessage,
          },
          type:
            JSON.stringify(conversation?.courier?._id) ===
            JSON.stringify(companion?._id)
              ? ConversationTypes.SENT
              : ConversationTypes.INBOX,
        },
      },
    ]);

    return getResponse(res, {}, StatusCodes.CREATED);
  }
);

export const getConversationsList = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getParam(req, "user") as UserType;
    const type = getParam(req.query, "type") as ConversationTypes;
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
        $addFields: {
          deletedArray: {
            $filter: {
              input: "$deleted",
              as: "element",
              cond: {
                $eq: ["$$element.forUser", toObjectId(user._id)],
              },
            },
          },
        },
      },
      {
        $addFields: {
          deletedObject: {
            $cond: {
              if: {
                $and: [
                  {
                    $isArray: "$deletedArray",
                  },
                  {
                    $gt: [{ $size: "$deletedArray" }, 0],
                  },
                ],
              },
              then: { $first: "$deletedArray" },
              else: null,
            },
          },
        },
      },
      {
        $addFields: {
          deletedMessageId: {
            $cond: {
              if: { $ne: ["$deletedObject", null] },
              then: "$deletedObject.toMessage",
              else: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: "messages",
          let: {
            conversation: "$_id",
            deletedMessageId: "$deletedMessageId",
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
                  $and: [
                    {
                      $eq: ["$conversation", "$$conversation"],
                    },
                    {
                      $gt: ["$_id", "$$deletedMessageId"],
                    },
                  ],
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
                const partnerMessages = messages.filter(
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
          lastRequestedDeliveryMessage: 1,
          deletedMessageId: 1,
        },
      },
    ]);

    return getResponse(res, { data }, StatusCodes.OK);
  }
);

export const getMessagesList = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getParam(req, "user") as UserType;
    const conversationId = getParam(req.params, "conversationId") as string;
    const timeZone = getParam(req.query, "timeZone");

    const blockService = getService(Services.BLOCK);
    const conversationService = getService(Services.CONVERSATION);
    const messageService = getService(Services.MESSAGE);

    const conversation = (await conversationService.findOne({
      _id: toObjectId(conversationId),
    })) as ConversationType;

    const messages = await messageService.aggregate(
      getMessagesListAggregate(conversation, user, timeZone)
    );

    const companion = getConversationCompanion(conversation, user);

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

    const deliveryStatus = (
      await getService(Services.DELIVERY).findOne({
        ad: toObjectId(conversation.ad._id),
        user: toObjectId(user._id),
      })
    )?.status;

    const data = {
      ad: conversation.ad,
      adAuthor: conversation.adAuthor,
      messages,
      deliveryStatus,
      isBlocked,
      canWrite,
      companion,
      lastRequestedDeliveryMessage: conversation?.lastRequestedDeliveryMessage,
    };

    return getResponse(res, { data }, StatusCodes.OK);
  }
);

export const removeConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const io = getParam(req, "io");
    const conversationFromParam = getParam(
      req,
      "conversation"
    ) as ConversationType;
    const user = getParam(req, "user") as UserType;

    const conversationService = getService(Services.CONVERSATION);
    const conversation = await conversationService.findOne({
      _id: toObjectId(conversationFromParam._id),
    });

    const handlepushOrSet = () => {
      if (Number(conversation?.deleted?.length)) {
        const isAlreadyDeletedIndex = conversation?.deleted?.findIndex(
          (e: TDeletedConversationType) =>
            e.forUser.toString() === user._id.toString()
        );

        if (isAlreadyDeletedIndex !== -1) {
          set(
            conversation,
            `deleted[${isAlreadyDeletedIndex}].toMessage`,
            toObjectId((conversation.lastMessage as MessageType)?._id)
          );

          return {
            $set: {
              deleted: conversation?.deleted,
            },
          };
        }
      }
      return {
        $push: {
          deleted: {
            forUser: toObjectId(user._id),
            toMessage: toObjectId(
              (conversation.lastMessage as MessageType)?._id
            ),
          },
        },
      };
    };

    if (Boolean(conversation.lastMessage)) {
      await conversationService.update(
        {
          _id: toObjectId(conversation._id),
        },
        handlepushOrSet()
      );
    }

    return getResponse(res, {}, StatusCodes.OK);
  }
);

export const updateMessageReadStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getParam(req.params, "id");
    const user = getParam(req, "user") as UserType;

    const messageService = getService(Services.MESSAGE);

    await messageService.update(
      {
        sender: {
          $ne: toObjectId(user._id),
        },
        conversation: toObjectId(id),
      },
      {
        ...req.body,
      },
      { sort: { createdAt: -1 } }
    );

    return getResponse(res, {}, StatusCodes.OK);
  }
);
