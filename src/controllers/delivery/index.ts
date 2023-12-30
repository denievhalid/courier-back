import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import { getParam } from "@/utils/getParam";
import { getService } from "@/lib/container";
import { StatusCodes } from "http-status-codes";
import type { AdType, UserType } from "@/types";
import { DeliveryStatus, Services } from "@/types";
import type { NextFunction, Request, Response } from "express";
import { toObjectId } from "@/utils/toObjectId";
import { getAttributes } from "@/utils/getAttributes";
import { SocketEvents } from "@/const";
import { removeDelivery } from "./helpers";

export const create = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const ad = getParam(req, "ad") as AdType;
    const user = getParam(req, "user") as UserType;

    const deliveryService = getService(Services.DELIVERY);

    const payload = {
      ad: toObjectId(ad._id),
      status: DeliveryStatus.PENDING,
      user: toObjectId(user._id),
    };

    const alreadyExists = await deliveryService.exists(payload);

    if (!alreadyExists) {
      await deliveryService.create(payload);
    }

    //return next();
    return getResponse(res, { status: payload.status }, StatusCodes.CREATED);
  }
);

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

  io.to(`room${conversation?._id?.toString()}`).emit(
    SocketEvents.UPDATE_DELIVERY_STATUS,
    status
  );

  io.to(`room${conversation?._id?.toString()}`).emit(
    SocketEvents.UPDATE_AD_COURIER,
    courier
  );

  return getResponse(res, {});
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const io = getParam(req, "io");
  const user = getParam(req, "user") as UserType;
  const ad = getParam(req.params, "ad");
  const conversation = getParam(req, "conversation");
  const byOwner = getParam(req.body, "byOwner");

  await removeDelivery({
    io,
    ad,
    user,
    conversation,
    shouldSendMessage: true,
    byOwner,
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
