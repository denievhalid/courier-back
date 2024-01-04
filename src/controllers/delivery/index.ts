import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import { getParam } from "@/utils/getParam";
import { getService } from "@/lib/container";
import { StatusCodes } from "http-status-codes";
import { DeliveryStatus, Services, SystemActionCodes } from "@/types";
import { toObjectId } from "@/utils/toObjectId";
import { getAttributes } from "@/utils/getAttributes";
import { SocketEvents } from "@/const";
import { handleUpdateDeliveryMessage } from "./consts";
import { MessageService } from "@/services";
import { SocketService } from "@/services/socket";
import type { AdType, ConversationType, UserType } from "@/types";
import type { NextFunction, Request, Response } from "express";

export const create = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const ad = getParam(req, "ad") as AdType;
    const user = getParam(req, "user") as UserType;
    const conversation = getParam(req, "conversation") as ConversationType;

    const deliveryService = getService(Services.DELIVERY);
    const messageService = getService<MessageService>(Services.MESSAGE);

    const payload = {
      ad: toObjectId(ad._id),
      status: DeliveryStatus.PENDING,
      user: toObjectId(user._id),
    };

    const deliveryDoc = await deliveryService.exists(payload);

    if (!deliveryDoc) {
      await deliveryService.create(payload);
    }

    const message = await messageService.send({
      message: "Вы оправили заявку на доставку",
      conversation,
      sender: user,
      isSystemMessage: true,
      type: 2,
      systemAction: SystemActionCodes.DELIVERY_REQUESTED,
    });

    SocketService.emitBatch([
      {
        event: SocketEvents.NEW_MESSAGE,
        room: `room${conversation?.toString()}`,
        data: message,
      },
      {
        event: SocketEvents.UPDATE_DELIVERY_STATUS,
        room: user._id?.toString(),
        data: {
          deliveryStatus: DeliveryStatus.PENDING,
        },
      },
    ]);

    return getResponse(res, {}, StatusCodes.CREATED);
  }
);

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user") as UserType;

  return getResponse(
    res,
    {
      data: await getService(Services.DIRECTION).aggregate([
        {
          $match: {
            user: toObjectId(user._id),
          },
        },
      ]),
    },
    StatusCodes.OK
  );
});

export const update = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const io = getParam(req, "io");
    const ad = getParam(req.body, "ad") as string;
    const user = getParam(req, "user") as UserType;
    const { courier, status } = getAttributes(req.body, ["courier", "status"]);

    const conversationService = getService(Services.CONVERSATION);
    const deliveryService = getService(Services.DELIVERY);
    const adService = getService(Services.AD);
    const messageService = getService<MessageService>(Services.MESSAGE);

    const updatedCourier = status === DeliveryStatus.APPROVED ? courier : null;
    const { systemAction: updatedSystemAction, type: updatedType } =
      handleUpdateDeliveryMessage(status);

    await deliveryService.update(
      {
        ad: toObjectId(ad),
        user: toObjectId(courier._id),
      },
      {
        status,
      }
    );

    const conversation = await conversationService.findOne({
      ad: toObjectId(ad),
    });

    await adService.update(
      {
        _id: toObjectId(ad),
      },
      { courier: updatedCourier }
    );

    const message = await messageService.send({
      message: "Вы отменили заявку на доставку",
      conversation,
      sender: courier,
      isSystemMessage: true,
      type: updatedType,
      systemAction: updatedSystemAction,
    });

    SocketService.emitBatch([
      {
        event: SocketEvents.UPDATE_DELIVERY_STATUS,
        room: `room${conversation?._id?.toString()}`,
        data: {
          deliveryStatus: status,
        },
      },
      {
        event: SocketEvents.UPDATE_AD_COURIER,
        room: `room${conversation?._id?.toString()}`,
        data: updatedCourier,
      },
      {
        event: SocketEvents.UPDATE_DELIVERY_STATUS,
        room: `room-ad-${ad?.toString()}`,
        data: {
          deliveryStatus: status,
        },
      },
      {
        event: SocketEvents.UPDATE_DELIVERY_STATUS,
        room: `room-ad-${ad?.toString()}`,
        data: updatedCourier,
      },
      {
        event: SocketEvents.NEW_MESSAGE,
        room: `room${conversation?.toString()}`,
        data: message,
      },
    ]);

    return getResponse(res, {}, StatusCodes.CREATED);
  }
);

export const remove = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = getParam(req, "user") as UserType;
    const byOwner = getParam(req.body, "byOwner");
    const conversation = getParam(req, "conversation") as ConversationType;
    const ad = conversation.ad._id.toString();

    const adService = getService(Services.AD);
    const deliveryService = getService(Services.DELIVERY);
    const messageService = getService<MessageService>(Services.MESSAGE);
    const userService = getService(Services.USER);

    const courier = (await userService.findOne({
      _id: conversation.courier,
    })) as UserType;

    const adDoc = await adService.findOne({
      _id: toObjectId(ad),
    });

    await deliveryService.remove({
      ad: toObjectId(ad),
      user: toObjectId(byOwner ? adDoc?.courier : user._id),
    });

    await adService.update(
      {
        _id: toObjectId(ad),
      },
      { courier: null }
    );

    const message = await messageService.send({
      message: "Вы отменили заявку на доставку",
      conversation,
      sender: byOwner ? courier : user,
      isSystemMessage: true,
      type: 0,
      systemAction: byOwner
        ? SystemActionCodes.DELIVERY_CANCELED_BY_OWNER
        : SystemActionCodes.DELIVERY_CANCELED,
    });

    SocketService.emitBatch([
      {
        event: SocketEvents.UPDATE_DELIVERY_STATUS,
        room: user._id?.toString(),
        data: {
          deliveryStatus: null,
        },
      },
      {
        event: SocketEvents.NEW_MESSAGE,
        room: `room${conversation?.toString()}`,
        data: message,
      },
    ]);

    return getResponse(res);
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
