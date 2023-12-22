import { asyncHandler } from "@/utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import { getService } from "@/lib/container";
import { AdType, Services, UserType } from "@/types";
import { getParam } from "@/utils/getParam";
import { toObjectId } from "@/utils/toObjectId";
import { getAttributes } from "@/utils/getAttributes";
import {
  AdNotFoundException,
  CourierExistsException,
} from "@/exceptions/forbidden";
import { isObject } from "lodash";

export const getAdMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const adService = getService(Services.AD);
    let { ad, status } = getAttributes(req.body, ["ad", "status"]);
    const user = getParam(req, "user") as UserType;

    if (isObject(ad)) {
      ad = (ad as AdType)._id;
    }

    const adDoc = (await adService.findOne({
      _id: toObjectId(ad),
      user: {
        $ne: toObjectId(user._id),
      },
    })) as AdType;

    if (!adDoc) {
      throw new AdNotFoundException();
    }

    if (adDoc.courier) {
      throw new CourierExistsException();
    }

    return next();
  }
);
