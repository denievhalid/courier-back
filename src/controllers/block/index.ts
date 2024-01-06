import { asyncHandler } from "@/utils/asyncHandler";
import type { Request, Response } from "express";
import { getParam } from "@/utils/getParam";
import { Services, UserType } from "@/types";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { getService } from "@/lib/container";
import { toObjectId } from "@/utils/toObjectId";
import { SocketService } from "@/services/socket";
import { SocketEvents } from "@/const";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user") as UserType;
  const blockedUser = getParam(req.body, "user");

  const blockService = getService(Services.BLOCK);

  const payload = {
    blockedUser: toObjectId(blockedUser._id),
    user: toObjectId(user._id),
  };

  const count = await blockService.count(payload);

  if (!count) {
    await blockService.create({
      blockedUser: toObjectId(blockedUser._id),
      user: toObjectId(user._id),
    });
  }

  SocketService.emitBatch([
    {
      event: SocketEvents.BLOCK_USER,
      room: user._id,
      data: {
        isBlocked: true,
      },
    },
    {
      event: SocketEvents.BLOCK_USER,
      room: blockedUser._id,
      data: {
        canWrite: false,
      },
    },
  ]);

  return getResponse(
    res,
    {
      data: {
        isBlocked: true,
      },
    },
    StatusCodes.CREATED
  );
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user") as UserType;
  const blockedUser = getParam(req.body, "user") as UserType;

  const blockService = getService(Services.BLOCK);

  const payload = {
    blockedUser: toObjectId(blockedUser._id),
    user: toObjectId(user._id),
  };

  const count = await blockService.count(payload);

  if (count) {
    await blockService.remove({
      blockedUser: toObjectId(blockedUser._id),
      user: toObjectId(user._id),
    });
  }

  SocketService.emitBatch([
    {
      event: SocketEvents.BLOCK_USER,
      room: user._id,
      data: {
        isBlocked: false,
      },
    },
    {
      event: SocketEvents.BLOCK_USER,
      room: blockedUser._id,
      data: {
        canWrite: true,
      },
    },
  ]);

  return getResponse(
    res,
    {
      data: {
        isBlocked: false,
      },
    },
    StatusCodes.OK
  );
});
