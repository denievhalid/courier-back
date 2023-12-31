import { asyncHandler } from "@/utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import { getService } from "@/lib/container";
import {
  AdType,
  ConversationType,
  DeliveryStatus,
  Services,
  UserType,
} from "@/types";
import { getParam } from "@/utils/getParam";
import { toObjectId } from "@/utils/toObjectId";
import { getAttributes } from "@/utils/getAttributes";
import {
  AdNotFoundException,
  CourierExistsException,
} from "@/exceptions/forbidden";
import _, { isObject } from "lodash";
import { SocketEvents } from "@/const";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";

export const useGetAdMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let ad = getParam(req.body, "ad") as string;
    const user = getParam(req, "user") as UserType;

    const adService = getService(Services.AD);

    const adDoc = (await adService.findOne({
      _id: toObjectId(ad),
    })) as AdType;

    if (!adDoc) {
      throw new AdNotFoundException();
    }

    if (adDoc.courier) {
      throw new CourierExistsException();
    }

    _.set(req, "ad", adDoc);

    return next();
  }
);
