import _ from "lodash";
import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getAttributes } from "@/utils/getAttributes";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import { AdType, Services, TCreateMessage, UserType } from "@/types";
import { SOCKET_EVENTS } from "@/const";
import { toObjectId } from "@/utils/toObjectId";

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const adService = getService("ad");
  const blockService = getService("block");
  const conversationService = getService("conversation");
  const messageService = getService(Services.MESSAGE);
  const user = getParam(req, "user") as UserType;

  const { conversation } = getAttributes(req.params, ["conversation"]);

  const conversationDoc = await conversationService
    .findOne({
      _id: toObjectId(conversation),
    })
    .populate("receiver")
    .populate("sender");

  let adDoc = await adService.aggregate([
    {
      $match: {
        _id: toObjectId(conversationDoc.ad),
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        cover: { $first: "$images" },
      },
    },
  ]);

  const messages = await messageService.aggregate([
    {
      $match: {
        conversation: toObjectId(conversation),
      },
    },
    {
      $sort: {
        createdAt: -1,
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
        createdAt: 1,
        isSystemMessage: 1,
        message: 1,
        type: 1,
        systemAction: 1,
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
        isSystemMessage: 1,
        type: 1,
        systemAction: 1,
      },
    },
  ]);

  const companion =
    conversationDoc.receiver._id.toString() === user._id.toString()
      ? conversationDoc.sender
      : conversationDoc.receiver;

  const isBlocked = Boolean(
    await blockService.count({
      user: toObjectId(user._id),
      blockedUser: companion._id,
    })
  );

  const canWrite = !Boolean(
    await blockService.count({
      blockedUser: toObjectId(user._id),
      user: companion._id,
    })
  );

  const delivery = (
    await getService("delivery").findOne({
      ad: toObjectId(conversationDoc.ad),
      user: toObjectId(user._id),
    })
  )?.status;

  adDoc = _.first(adDoc) as AdType;

  const data = {
    ad: adDoc,
    delivery,
    isBlocked,
    canWrite,
    companion: {
      _id: companion._id,
      avatar: companion.avatar,
      firstname: companion.firstname,
      courier: adDoc?.courier?._id === companion._id,
    },
    messages,
  };

  return getResponse(res, { data }, StatusCodes.OK);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const io = getParam(req, "io");
  const user = getParam(req, "user") as UserType;
  const {
    conversation: conversationId,
    message,
    type,
    isSystemMessage,
    systemAction,
  } = getAttributes(req.body, [
    "conversation",
    "message",
    "type",
    "isSystemMessage",
    "systemAction",
  ]);

  const conversation = await getService(Services.CONVERSATION).findOne({
    _id: conversationId,
  });

  console.log(conversation, "conversation");

  const messageService = getService(Services.MESSAGE);

  const messageDoc = await messageService.create({
    isSystemMessage,
    conversation,
    message,
    user,
    type,
    systemAction,
  });

  const data = await messageService.aggregate([
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
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $project: {
        ad: { $first: "$conversation.ad" },
        message: 1,
        systemAction: 1,
        isSystemMessage: 1,
        type: 1,
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
        systemAction: 1,
        isSystemMessage: 1,
        type: 1,
      },
    },
  ]);

  const newMessage: TCreateMessage | undefined = _.first(data);
  const adId = _.get(newMessage, "ad._id", null);

  if (adId && newMessage) {
    const delivery = (
      await getService("delivery").findOne({
        ad: toObjectId(adId),
        user: toObjectId(user._id),
      })
    )?.status;
    newMessage.delivery = delivery;
  }

  const receiver = conversation?.receiver?._id?.toString();

  console.log(conversation?.receiver?._id, "conversation?.receiver?._id");
  isSystemMessage
    ? io.to(receiver).emit(SOCKET_EVENTS.SYSTEM_ACTION, newMessage)
    : io.to(receiver).emit(SOCKET_EVENTS.NEW_MESSAGE, newMessage);

  return getResponse(res, { data: newMessage }, StatusCodes.CREATED);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, "id");
  const user = getParam(req, "user") as UserType;

  const messageService = getService(Services.MESSAGE);

  await messageService.update(
    {
      _id: toObjectId(id),
    },
    {
      ...req.body,
    }
  );

  return getResponse(res, {}, StatusCodes.OK);
});
