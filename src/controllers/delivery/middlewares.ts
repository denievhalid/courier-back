import { asyncHandler } from "@/utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import { getService } from "@/lib/container";
import { AdType, Services, UserType } from "@/types";
import { getParam } from "@/utils/getParam";
import { toObjectId } from "@/utils/toObjectId";
import { getAttributes } from "@/utils/getAttributes";

export const getAdMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const adService = getService(Services.AD);
    const { ad, status } = getAttributes(req.body, ["ad", "status"]);
    const user = getParam(req, "user") as UserType;

    const adDoc = (await adService.findOne({
      _id: toObjectId(ad),
      user: {
        $ne: toObjectId(user._id),
      },
    })) as AdType;

    if (!adDoc) {
      throw new Error("Объявление не найдено");
    }

    if (adDoc.courier) {
      throw new Error("Извините, курьер уже найден");
    }

    return next();
  }
);
