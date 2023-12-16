import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import { getParam } from "@/utils/getParam";
import { getService } from "@/lib/container";
import { StatusCodes } from "http-status-codes";
import type { AdType, UserType } from "@/types";
import type { Request, Response } from "express";
import { toObjectId } from "@/utils/toObjectId";
import { getAttributes } from "@/utils/getAttributes";
import { Services } from "@/types";
import { getConversationAggregate } from "@/controllers/delivery/aggregate";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const io = getParam(req, "io");
  const status = getParam(req.body, "status");
  const user = getParam(req, "user") as UserType;

  const adService = getService(Services.AD);
  const deliveryService = getService(Services.DELIVERY);

  const ad = (await adService.findOne({
    _id: getParam(req.body, "ad"),
    user: {
      $ne: user._id,
    },
  })) as AdType;

  if (!ad) {
    console.log("ad error");
    throw new Error("Объявление не найдено");
  }

  if (ad.courier) {
    console.log("ad.courier error");
    throw new Error("Извините, курьер уже найден");
  }

  const payload = { ad: ad._id, user: user._id };

  const deliveryDoc = await deliveryService.findOne(payload);

  if (!deliveryDoc) {
    throw new Error("Запрос уже отправлен");
  }

  await deliveryService.create({
    ad,
    user: user._id,
    status,
  });

  const conversationService = getService(Services.CONVERSATION);

  const conversationPayload = {
    ad: ad._id,
    receiver: ad.user._id,
    sender: user._id,
  };

  let conversation = await conversationService.findOne(conversationPayload);

  if (!conversation) {
    conversation = await conversationService.create(conversationPayload);
  }

  const conversationDoc = await conversationService.aggregate(
    getConversationAggregate(conversation._id)
  );

  io.emit("newConversation", conversationDoc);

  return getResponse(res, {}, StatusCodes.CREATED);
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user") as UserType;

  const directionService = getService(Services.DIRECTION);

  const data = await directionService.aggregate([
    {
      $match: {
        user: toObjectId(user._id),
      },
    },
  ]);

  return getResponse(res, { data }, StatusCodes.OK);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user") as UserType;
  const { ad, status } = getAttributes(req.body, ["ad", "status"]);

  const deliveryService = getService(Services.DELIVERY);

  await deliveryService.update(
    {
      ad: toObjectId(ad),
      user: toObjectId(user._id),
    },
    {
      status,
    }
  );

  return getResponse(res, {});
});
