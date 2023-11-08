import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getResponse } from "@/utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { getParam } from "@/utils/getParam";
import { toObjectId } from "@/utils/toObjectId";
import { getService } from "@/lib/container";
import { DirectionType, UserType } from "@/types";
import _ from "lodash";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const hash = getParam(req.body, "hash");
  const user = getParam(req, "user");
  const ads = getParam(req.body, "ads");
  const filter = getParam(req.body, "filter");

  const payload = { ads, hash, filter, user: toObjectId(user._id) };

  const directionService = getService("direction");

  const exists = await directionService.count(payload);

  if (!exists) {
    await directionService.create(payload);
  }

  const data = await directionService.findOne(payload);

  return getResponse(res, { data }, StatusCodes.CREATED);
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const user = getParam(req, "user") as UserType;

  const adService = getService("ad");
  const directionService = getService("direction");

  const data = await directionService.aggregate([
    {
      $match: {
        user: toObjectId(user._id),
      },
    },
  ]);

  return getResponse(res, { data }, StatusCodes.OK);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const directionId = getParam(req.params, "directionId");
  const user = getParam(req, "user") as UserType;

  const adService = getService("ad");
  const directionService = getService("direction");

  const directions = (await directionService.aggregate([
    {
      $match: {
        _id: toObjectId(directionId),
        user: toObjectId(user._id),
      },
    },
  ])) as DirectionType[];

  let adIds = _.first(directions.map((direction) => direction.ads));

  const data = await adService.aggregate([
    {
      $match: {
        _id: { $in: adIds?.map((id) => toObjectId(id)) },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        pipeline: [
          {
            $lookup: {
              from: "deliveries",
              localField: "user",
              foreignField: "user",
              as: "deliveries",
            },
          },
          {
            $addFields: {
              deliveries: { $size: "$deliveries" },
            },
          },
        ],
        as: "user",
      },
    },
    {
      $addFields: {
        user: { $first: "$user" },
        cover: { $first: "$images" },
      },
    },
  ]);

  return getResponse(res, { data }, StatusCodes.OK);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const hash = getParam(req.body, "hash");
  const user = getParam(req, "user") as UserType;

  const payload = { hash, user: toObjectId(user._id) };

  const directionService = getService("direction");

  const exists = await directionService.count(payload);

  if (exists) {
    await directionService.remove(payload);
  }

  return getResponse(res, {}, StatusCodes.OK);
});
