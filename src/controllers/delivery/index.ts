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
  const { ad, status } = getAttributes(req.body, ["ad", "status"]);
  const user = getParam(req, "user") as UserType;
  console.log(user, "user");
  const adService = getService(Services.AD);
  const deliveryService = getService(Services.DELIVERY);

  const adDoc = (await adService.findOne({
    _id: toObjectId(ad),
    user: {
      $ne: toObjectId(user._id),
    },
  })) as AdType;

  if (!adDoc) {
    throw new Error("Объявление не найдено");
  }

  if (adDoc.courier) {
    throw new Error("Извините, курьер уже найден");
  }

  const payload = { ad, user: user._id };

  const deliveryDoc = await deliveryService.findOne(payload);

  if (deliveryDoc) {
    throw new Error("Запрос уже отправлен");
  }

  await deliveryService.create({
    ad: toObjectId(ad),
    user: toObjectId(user._id),
    status,
  });

  const conversationService = getService(Services.CONVERSATION);

  const conversationPayload = {
    ad: toObjectId(ad),
    receiver: toObjectId(ad.user._id),
    sender: toObjectId(user._id),
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

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user") as UserType;
  const _id = getParam(req.params, "id");

  const deliveryService = getService(Services.DELIVERY);

  await deliveryService.remove({
    _id,
    user: toObjectId(user._id),
  });

  return getResponse(res, {}, StatusCodes.OK);
});
