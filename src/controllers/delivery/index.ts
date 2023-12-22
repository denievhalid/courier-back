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
import { SOCKET_EVENTS } from "@/const";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const io = getParam(req, "io");
  const { ad, conversation, status } = getAttributes(req.body, [
    "ad",
    "conversation",
    "status",
  ]);
  const user = getParam(req, "user") as UserType;

  const adService = getService(Services.AD);
  const deliveryService = getService(Services.DELIVERY);

  const adDoc = (await adService.findOne({
    _id: toObjectId(ad._id),
    courier: { $eq: null },
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

  if (conversation) {
    io.to(conversation.toString()).emit(
      SOCKET_EVENTS.UPDATE_DELIVERY_STATUS,
      status
    );
  }

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
  const { ad, courier, status } = getAttributes(req.body, [
    "ad",
    "courier",
    "status",
  ]);

  const conversationService = getService(Services.CONVERSATION);
  const deliveryService = getService(Services.DELIVERY);

  await deliveryService.update(
    {
      ad: toObjectId(ad._id),
      user: toObjectId(courier._id),
    },
    {
      status,
    }
  );

  const conversation = await conversationService.findOne({
    ad: toObjectId(ad._id),
  });

  io.to(conversation?._id?.toString()).emit(
    SOCKET_EVENTS.UPDATE_DELIVERY_STATUS,
    status
  );

  io.to(conversation?._id?.toString()).emit(
    SOCKET_EVENTS.UPDATE_AD_COURIER,
    courier
  );

  return getResponse(res, {});
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const io = getParam(req, "io");
  const user = getParam(req, "user") as UserType;
  const ad = getParam(req.params, "ad");
  const conversation = getParam(req.body, "conversation");

  const deliveryService = getService(Services.DELIVERY);
  const adService = getService(Services.AD);

  await deliveryService.remove({
    ad: toObjectId(ad),
    user: toObjectId(user._id),
  });

  const adObject = await adService.findOne({
    _id: toObjectId(ad),
    courier: toObjectId(user._id),
  });

  adObject &&
    (await adService.update(
      {
        _id: toObjectId(ad),
      },
      { courier: null }
    ));

  if (conversation) {
    io.to(conversation.toString()).emit(
      SOCKET_EVENTS.UPDATE_DELIVERY_STATUS,
      null
    );
    io.to(conversation?.toString()).emit(SOCKET_EVENTS.UPDATE_AD_COURIER, null);
  }

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
