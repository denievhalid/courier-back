import mongoose from "mongoose";
import { Response } from "express";
import { StatusCodes } from "http-status-codes";

import { SOCKET_EVENTS } from "@/const";
import { getService } from "@/lib/container";
import {
  ConversationType,
  IOType,
  Services,
  SystemActionCodes,
  UserType,
} from "@/types";
import { getResponse } from "@/utils/getResponse";
import { toObjectId } from "@/utils/toObjectId";
import { createMessageHelper } from "../message/helpers/createMessage";

export const removeDelivery = async ({
  io,
  ad,
  user,
  conversation,
  shouldSendMessage = false,
  byOwner = false,
}: {
  io: IOType;
  ad: string;
  user: UserType;
  conversation: ConversationType;
  shouldSendMessage?: boolean;
  byOwner?: boolean;
}) => {
  const deliveryService = getService(Services.DELIVERY);
  const adService = getService(Services.AD);

  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    await deliveryService.remove(
      {
        ad: toObjectId(ad),
        user: toObjectId(user._id),
      },
      { session: session }
    );
    const adObject = await adService.findOne(
      {
        _id: toObjectId(ad),
        courier: toObjectId(user._id),
      },
      { session: session }
    );

    adObject &&
      (await adService.update(
        {
          _id: toObjectId(ad),
        },
        { courier: null }
      ),
      { session: session });

    if (conversation) {
      io.to(`room${conversation?._id.toString()}`).emit(
        SOCKET_EVENTS.UPDATE_DELIVERY_STATUS,
        null
      );
      io.to(`room${conversation?._id?.toString()}`).emit(
        SOCKET_EVENTS.UPDATE_AD_COURIER,
        null
      );
    }

    if (shouldSendMessage) {
      await createMessageHelper({
        io,
        user,
        conversation,
        message: "",
        type: 0,
        isSystemMessage: true,
        systemAction: byOwner
          ? SystemActionCodes.DELIVERY_CANCELED_BY_OWNER
          : SystemActionCodes.DELIVERY_CANCELED,
      });
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
};
