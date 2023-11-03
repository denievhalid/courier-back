import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getAttributes } from "@/utils/getAttributes";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import _ from "lodash";
import { UserType } from "@/types";
import { SOCKET_EVENTS } from "@/const";
import { toObjectId } from "@/utils/toObjectId";

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const adService = getService("ad");
  const conversationService = getService("conversation");
  const messageService = getService("message");
  const user = getParam(req, "user") as UserType;

  const { conversation } = getAttributes(req.params, ["conversation"]);

  const conversationDoc = await conversationService
    .findOne({
      _id: toObjectId(conversation),
    })
    .populate("receiver")
    .populate("sender");

  const adDoc = await adService.aggregate([
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
      },
    },
  ]);

  const companion =
    conversationDoc.receiver._id === user._id
      ? conversationDoc.sender
      : conversationDoc.receiver;

  const delivery = (
    await getService("delivery").findOne({
      ad: toObjectId(conversationDoc.ad),
      user: toObjectId(user._id),
    })
  )?.status;

  const data = {
    ad: _.first(adDoc),
    delivery,
    companion,
    messages,
  };

  return getResponse(res, { data }, StatusCodes.OK);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const io = getParam(req, "io");
  const user = getParam(req, "user") as UserType;
  const { conversation, message, type, isSystemMessage } = getAttributes(
    req.body,
    ["conversation", "message", "type", "isSystemMessage"]
  );

  const messageService = getService("message");

  const messageDoc = await messageService.create({
    isSystemMessage,
    conversation,
    message,
    user,
    type,
  });

  const data = await messageService.aggregate([
    {
      $match: {
        _id: toObjectId(messageDoc._id),
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

  const newMessage = _.first(data);

  io.emit(SOCKET_EVENTS.NEW_MESSAGE, newMessage);

  return getResponse(res, { data: newMessage }, StatusCodes.CREATED);
});
