import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import { getParam } from "@/utils/getParam";
import { getService } from "@/lib/container";
import { StatusCodes } from "http-status-codes";
import type { AdType, ConversationType, UserType } from "@/types";
import { DeliveryStatus, Services, SystemActionCodes } from "@/types";
import type { NextFunction, Request, Response } from "express";
import { toObjectId } from "@/utils/toObjectId";
import { getAttributes } from "@/utils/getAttributes";
import { SocketEvents } from "@/const";
import _ from "lodash";

export const create = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const ad = getParam(req, "ad") as AdType;
    const user = getParam(req, "user") as UserType;
    const conversation = getParam(req, "conversation") as ConversationType;

    const deliveryService = getService(Services.DELIVERY);
    const messageService = getService(Services.MESSAGE);

    const payload = {
      ad: toObjectId(ad._id),
      status: DeliveryStatus.PENDING,
      user: toObjectId(user._id),
    };

    const alreadyExists = await deliveryService.exists(payload);

    if (!alreadyExists) {
      await deliveryService.create(payload);
    }

    _.set(
      req,
      "payload",
      // @ts-ignore
      await messageService.send({
        ...req.body,
        message: "Вы оправили заявку на доставку",
        conversation,
        sender: user,
        isSystemMessage: true,
        type: 2,
        systemAction: SystemActionCodes.DELIVERY_REQUESTED,
      })
    );
    _.set(req, "deliveryStatus", DeliveryStatus.PENDING);

    return next();
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

export const remove = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = getParam(req, "user") as UserType;
    const ad = getParam(req.params, "ad") as string;
    const conversation = getParam(req, "conversation") as ConversationType;
    const byOwner = getParam(req.body, "byOwner");

    const deliveryService = getService(Services.DELIVERY);

    await deliveryService.remove({
      ad: toObjectId(ad),
      user: toObjectId(user._id),
    });

    _.set(req, "deliveryStatus", null);

    return next();

    // await removeDelivery({
    //   io,
    //   ad,
    //   user,
    //   conversation,
    //   shouldSendMessage: true,
    //   byOwner,
    // });

    return getResponse(res, {}, StatusCodes.OK);
  }
);

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
