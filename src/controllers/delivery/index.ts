import _, { get } from "lodash";
import { asyncHandler } from "@/utils/asyncHandler";
import { getResponse } from "@/utils/getResponse";
import { getParam } from "@/utils/getParam";
import { getService } from "@/lib/container";
import { StatusCodes } from "http-status-codes";
import type { AdType, DialogType, UserType } from "@/types";
import type { Request, Response } from "express";

const deliveryService = getService("delivery");

export const create = asyncHandler(async (req: Request, res: Response) => {
  const io = getParam(req, "io");
  const user = _.first(getParam(req, "user")) as UserType;

  const adService = getService("ad");

  const ad = (await adService.findOne({
    _id: getParam(req.body, "ad"),
    user: {
      $ne: user._id,
    },
  })) as AdType;

  if (!ad) {
    throw new Error("Объявление не найдено");
  }

  if (ad.courier) {
    throw new Error("Извините, курьер уже найден");
  }

  const payload = { ad: ad._id, user: user._id };

  const deliveryExists = await deliveryService.count(payload);

  if (deliveryExists) {
    throw new Error("Запрос уже отправлен");
  }

  await deliveryService.create({
    ad,
    user: user._id,
  });

  const dialogService = getService("dialog");

  let dialog = await dialogService.findOne({
    ad: ad._id,
    user: user._id,
  });

  if (!dialog) {
    dialog = await dialogService.create({ ad: ad._id, user: user._id });
  }

  const messageService = getService("message");

  await messageService.create({
    dialog: dialog._id,
    message: "Я отвезу",
    user: user._id,
    isSystemMessage: true,
  });

  io.emit("newDialogs", [{ isNew: true }]);

  return getResponse(res, {}, StatusCodes.CREATED);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  return getResponse(res, {});
});
