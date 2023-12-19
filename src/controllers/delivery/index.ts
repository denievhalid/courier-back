import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import { getParam } from "@/utils/getParam";
import { getService } from "@/lib/container";
import { StatusCodes } from "http-status-codes";
import type { AdType, UserType } from "@/types";
import type { Request, Response } from "express";
import { toObjectId } from "@/utils/toObjectId";
import { getAttributes } from "@/utils/getAttributes";
import { Services, SystemActionCodes } from "@/types";
import { getConversationAggregate } from "@/controllers/delivery/aggregate";
import { SOCKET_EVENTS } from "@/const";
import _ from "lodash";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const io = getParam(req, "io");
  const { ad, status } = getAttributes(req.body, ["ad", "status"]);
  const user = getParam(req, "user") as UserType;

  const adService = getService(Services.AD);
  const deliveryService = getService(Services.DELIVERY);

  const adDoc = (await adService.findOne({
    _id: toObjectId(ad._id),
    courier: { $exists: false },
  })) as AdType;

  if (!adDoc) {
    throw new Error("Объявление не найдено");
  }

  const payload = { ad: toObjectId(ad._id), user: toObjectId(user._id) };

  const deliveryDoc = await deliveryService.findOne(payload);

  if (deliveryDoc) {
    throw new Error("Запрос уже отправлен");
  }

  await deliveryService.create({
    ad: toObjectId(ad._id),
    user: toObjectId(user._id),
    status,
  });

  const conversationService = getService(Services.CONVERSATION);

  const conversationPayload = {
    ad: toObjectId(ad._id),
    adAuthor: toObjectId(ad.user._id),
    courier: toObjectId(user._id),
  };

  console.log(conversationPayload, "conversationPayload");

  let conversation = await conversationService.findOne(conversationPayload);
  console.log(conversation, "conversation");
  if (!conversation) {
    conversation = await conversationService.create(conversationPayload);
  }

  const conversationDoc = await conversationService.aggregate(
    getConversationAggregate(conversation._id)
  );

  const messageService = getService(Services.MESSAGE);

  const messageDoc = await messageService.create({
    isSystemMessage: true,
    conversation,
    message: "Заявка на доставку",
    systemAction: SystemActionCodes.DELIVERY_REQUESTED,
    type: 1,
    sender: toObjectId(user._id),
  });

  const message = await messageService.aggregate([
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

  io.to(conversation?._id?.toString()).emit(
    SOCKET_EVENTS.SYSTEM_ACTION,
    _.first(message)
  );

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
  const io = getParam(req, "io");
  const user = getParam(req, "user") as UserType;
  const { ad, status } = getAttributes(req.body, ["ad", "status"]);
  const conversationService = getService("conversation");

  const deliveryService = getService(Services.DELIVERY);

  const delivery = await deliveryService.update(
    {
      ad: toObjectId(ad),
      user: toObjectId(user._id),
    },
    {
      status,
    },
    {
      new: true,
    }
  );
  console.log(delivery, "delivery");
  const conversation = await conversationService.findOne({
    ad: toObjectId(ad),
  });
  io.to(conversation?._id?.toString()).emit(
    SOCKET_EVENTS.UPDATE_DELIVERY_STATUS,
    delivery
  );
  return getResponse(res, {});
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user") as UserType;
  const ad = getParam(req.params, "ad");

  const deliveryService = getService(Services.DELIVERY);

  await deliveryService.remove({
    ad: toObjectId(ad),
    user: toObjectId(user._id),
  });

  return getResponse(res, {}, StatusCodes.OK);
});

export const getByAdId = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user") as UserType;
  const { ad } = getAttributes(req.body, ["ad"]);

  const deliveryService = getService(Services.DELIVERY);

  const delivery = await deliveryService.findOne({
    ad: toObjectId(ad),
    user: toObjectId(user._id),
  });

  return getResponse(res, { data: delivery.toObject() });
});
