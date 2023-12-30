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
import { getUserByConversationType } from "./utils";
import { getMessagesListAggregate } from "./aggregate";
import { ConversationTypes } from "./types";
import _, { isEqual, set } from "lodash";
import { getAttributes } from "@/utils/getAttributes";
import { removeDelivery } from "../delivery/helpers";

export const create = asyncHandler(async (req: Request, res: Response) => {
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
});

export const createMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const io = getParam(req, "io");
    const conversation = getParam(req, "conversation") as ConversationType;

    const user = getParam(req, "user") as UserType;

    const { message, type, isSystemMessage, systemAction, replayedMessage } =
      getAttributes(req.body, [
        "message",
        "type",
        "isSystemMessage",
        "systemAction",
        "replayedMessage",
      ]);

    const messageText = isSystemMessage ? "заявка" : message;

    // const data = await createMessageHelper({
    //   io,
    //   user,
    //   conversation,
    //   message: messageText,
    //   type,
    //   isSystemMessage,
    //   systemAction,
    //   replayedMessage,
    // });

    //return getResponse(res, { data }, StatusCodes.CREATED);
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
    //   const conversation = getParam(req, "conversation") as ConversationType;
    //   const user = getParam(req, "user") as UserType;
    //   const timeZone = getParam(req.query, "timeZone");
    //   const blockService = getService(Services.BLOCK);
    //   const messageService = getService(Services.MESSAGE);
    //
    //   const messages = await messageService.aggregate(
    //     getMessagesListAggregate(conversation, user, timeZone)
    //   );
    //
    //   const companion =
    //     conversation.courier?._id.toString() === user._id.toString()
    //       ? conversation?.adAuthor
    //       : conversation?.courier;
    //
    //   // @ts-ignore
    //   companion?.courier = isEqual(
    //     conversation.ad.courier?._id.toString(),
    //     companion?._id.toString()
    //   );
    //
    //   const isBlocked = Boolean(
    //     await blockService.count({
    //       user: toObjectId(user._id),
    //       blockedUser: toObjectId(companion?._id),
    //     })
    //   );
    //
    //   const canWrite = !Boolean(
    //     await blockService.count({
    //       blockedUser: toObjectId(user._id),
    //       user: toObjectId(companion?._id),
    //     })
    //   );
    //
    //   const delivery = (
    //     await getService(Services.DELIVERY).findOne({
    //       ad: toObjectId(conversation.ad._id),
    //       user: toObjectId(user._id),
    //     })
    //   )?.status;
    //
    //   const data = {
    //     ad: conversation.ad,
    //     adAuthor: conversation.adAuthor,
    //     messages,
    //     delivery,
    //     isBlocked,
    //     canWrite,
    //     companion,
    //     lastRequestedDeliveryMessage: conversation?.lastRequestedDeliveryMessage,
    //   };
    //
    //   return getResponse(res, { data }, StatusCodes.OK);
  }
);

export const removeConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const io = getParam(req, "io");
    const conversation = getParam(req, "conversation") as ConversationType;
    const user = getParam(req, "user") as UserType;

    const conversationService = getService(Services.CONVERSATION);
    const userService = getService(Services.USER);
    const courier = await userService.findOne({ _id: conversation.courier });

    await removeDelivery({
      io,
      ad: conversation.ad._id.toString(),
      user: courier,
      conversation,
      shouldSendMessage: true,
    });

    const handlepushOrSet = () => {
      if (Number(conversation?.deleted?.length)) {
        const isAlreadyDeletedIndex = conversation?.deleted?.findIndex(
          (e) => e.forUser.toString() === user._id.toString()
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
