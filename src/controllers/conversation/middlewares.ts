import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response, NextFunction } from "express";
import { getParam } from "@/utils/getParam";
import { getService } from "@/lib/container";
import { ConversationType, Services, UserType } from "@/types";
import { toObjectId } from "@/utils/toObjectId";
import _ from "lodash";
import { emitSocket } from "@/utils/socket";
import { SocketEvents } from "@/const";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";

export const getConversationById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = getParam(req.params, "id") || getParam(req.body, "conversation");

    const service = getService(Services.CONVERSATION);

    const conversation = await service.aggregate([
      {
        $match: {
          _id: toObjectId(id),
        },
      },
      {
        $lookup: {
          from: "ads",
          localField: "ad",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "courier",
                foreignField: "_id",
                as: "adCourier",
              },
            },
          ],
          as: "ad",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "courier",
          foreignField: "_id",
          as: "courier",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "adAuthor",
          foreignField: "_id",
          as: "adAuthor",
        },
      },
      {
        $project: {
          _id: 1,
          ad: { $first: "$ad" },
          adAuthor: { $first: "$adAuthor" },
          courier: { $first: "$courier" },
          cover: 1,
          lastRequestedDeliveryMessage: 1,
          deleted: 1,
          lastMessage: 1,
        },
      },
      {
        $addFields: {
          ad: {
            cover: { $first: "$ad.images" },
            courier: { $first: "$ad.adCourier" },
          },
        },
      },
    ]);

    if (!conversation) {
      throw new Error("Разговор не найден");
    }

    _.set(req, "conversation", _.first(conversation));

    return next();
  }
);

export const useSocket = asyncHandler(async (req: Request, res: Response) => {
  const io = getParam(req, "io");
  const { message } = getParam(req, "payload");
  const conversation = getParam(req, "conversation") as ConversationType;

  emitSocket({
    io,
    event: SocketEvents.NEW_MESSAGE,
    room: `room${conversation?._id?.toString()}`,
    data: {
      message,
    },
  });

  return getResponse(res, {}, StatusCodes.CREATED);
});
