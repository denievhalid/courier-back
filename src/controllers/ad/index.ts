import { asyncHandler } from "@/utils/asyncHandler";
import { Request, Response } from "express";
import { getResponse } from "@/utils/getResponse";
import {
  getAddFieldsPipeline,
  getAttributes,
  getLimitPipeline,
  getLookupPipeline,
  getMatchPipeline,
  getProjectPipeline,
  getSkipPipeline,
  getSortPipeline,
} from "@/controllers/ad/utils";
import _, { at } from "lodash";
import { getService } from "@/lib/container";
import { getParam } from "@/utils/getParam";
import { LIMIT } from "@/controllers/ad/const";
import mongoose, { PipelineStage } from "mongoose";
import { createAdSchema } from "@/controllers/ad/validation";
import { DeliveryType, Services, UserType } from "@/types";
import { StatusCodes } from "http-status-codes";
import dayjs from "dayjs";
import { toObjectId } from "@/utils/toObjectId";
import { AggregateBuilder } from "@/lib/builder";

export const create = asyncHandler(async (req: Request, res: Response) => {
  await createAdSchema.validate(req.body, { abortEarly: false });

  const user = getParam(req, "user") as UserType;

  const attributes = _.pick(req.body, [
    "title",
    "startDate",
    "endDate",
    "to",
    "price",
    "from",
    "images",
    "weight",
    "comment",
  ]);

  if (attributes.startDate) {
    attributes.startDate = new Date(attributes.startDate);
  }

  if (attributes.endDate) {
    attributes.endDate = new Date(attributes.endDate);
  }

  const data = await getService(Services.AD).create({
    ...attributes,
    user: user._id,
  });

  return getResponse(res, { data });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const _id = getParam(req.params, "id");
  const user = getParam(req, "user") as UserType;

  const adService = getService(Services.AD);

  await adService.update({ _id }, req.body);

  const pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $match: {
        _id: toObjectId(_id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $addFields: {
        user: { $first: "$user" },
      },
    }
  );

  if (user) {
    pipeline.push({
      $lookup: {
        from: "favorites",
        foreignField: "ad",
        localField: "_id",
        as: "favorites",
      },
    });

    pipeline.push({
      $addFields: {
        isFavorite: { $toBool: { $size: "$favorites" } },
        isOwn: {
          $cond: [{ $eq: ["$user._id", toObjectId(user._id)] }, true, false],
        },
      },
    });
  }

  const data = await adService.aggregate(pipeline);

  return getResponse(res, { data: _.first(data) });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, "id");
  const user = getParam(req, "user") as UserType;

  const pipeline: PipelineStage[] = [];

  let delivery = null;

  pipeline.push(
    {
      $match: {
        _id: toObjectId(id),
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
    }
  );

  if (user) {
    const isFavorite = await getService(Services.FAVORITE).count({
      ad: toObjectId(id),
      user: toObjectId(user._id),
    });

    pipeline.push({
      $addFields: {
        isFavorite: Boolean(isFavorite),
        isOwn: {
          $cond: [{ $eq: ["$user._id", toObjectId(user._id)] }, true, false],
        },
      },
    });

    delivery = (
      await getService(Services.DELIVERY).findOne({
        ad: toObjectId(id),
        user: toObjectId(user._id),
      })
    )?.status;
  }

  const data = _.first(await getService(Services.AD).aggregate(pipeline));

  if (_.isObject(data)) {
    _.set(data, "delivery", delivery || null);
  }

  return getResponse(res, { data }, StatusCodes.OK);
});

export const getList = asyncHandler(async (req: Request, res: Response) => {
  const queryParams = getAttributes(req.query);
  const user = getParam(req, "user") as UserType;

  const adService = await getService(Services.AD);

  const aggregateBuilder = AggregateBuilder.init().match([
    {
      endDate: {
        $gte: new Date(),
      },
      status: {
        $eq: queryParams.status,
      },
    },
  ]);

  if (queryParams.user) {
    aggregateBuilder.match({
      user: toObjectId(queryParams.user),
    });
  }

  const ads = await adService.aggregate(aggregateBuilder.build());

  // const ads = await adService.aggregate([
  //   {
  //     $match: {
  //       endDate: {
  //         $gte: new Date(),
  //       },
  //       status: {
  //         $eq: queryParams.status,
  //       },
  //     },
  //   },
  // ]);

  return getResponse(res, { ads, adsCount: ads.length });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = getParam(req.params, "id");

  await getService(Services.AD).remove(id);

  return getResponse(res, {}, StatusCodes.NO_CONTENT);
});
