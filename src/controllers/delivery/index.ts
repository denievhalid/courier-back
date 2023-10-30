import _, { get } from "lodash";
import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import { getParam } from "@/utils/getParam";
import { getService } from "@/lib/container";
import { StatusCodes } from "http-status-codes";
import type { AdType, UserType } from "@/types";
import type { Request, Response } from "express";

const deliveryService = getService("delivery");

export const create = asyncHandler(async (req: Request, res: Response) => {
  const io = getParam(req, "io");
  const user = getParam(req, "user") as UserType;

  const adService = getService("ad");

  const ad = (await adService.findOne({
    _id: getParam(req.body, "ad"),
    user: {
      $ne: user._id,
    },
  })) as AdType;

  if (!ad) {
    throw new Error("Объявление не найдено");
  }

  if (ad.courier) {
    throw new Error("Извините, курьер уже найден");
  }

  const payload = { ad: ad._id, user: user._id };

  const deliveryExists = await deliveryService.count(payload);

  if (deliveryExists) {
    throw new Error("Запрос уже отправлен");
  }

  await deliveryService.create({
    ad,
    user: user._id,
  });

  const conversationService = getService("conversation");

  let conversation = await conversationService.findOne({
    ad: ad._id,
    receiver: ad.user._id,
    sender: user._id,
  });

  if (!conversation) {
    conversation = await conversationService.create({
      ad: ad._id,
      user: user._id,
    });
  }

  const messageService = getService("message");

  await messageService.create({
    conversation: conversation._id,
    message: "Я отвезу",
    user: user._id,
    isSystemMessage: true,
  });

  const conversationDoc = await conversationService.aggregate([
    {
      $match: {
        _id: conversation._id,
      },
    },
    {
      $limit: 1,
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
        from: "messages",
        let: { id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$$id", "$conversation"] }],
              },
            },
          },
          { $limit: 1 },
        ],
        as: "messages",
      },
    },
    {
      $project: {
        ad: { $first: "$ad" },
        message: { $first: "$messages" },
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
      $project: {
        image: { $first: "$ad.images" },
        message: 1,
        receiver: { $first: "$receiver" },
        sender: { $first: "$sender" },
      },
    },
    {
      $addFields: {
        isNew: true,
      },
    },
  ]);

  io.emit("newConversation", conversationDoc);

  return getResponse(res, {}, StatusCodes.CREATED);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  return getResponse(res, {});
});
